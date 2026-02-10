import {
  StorageKey,
  StorageItem,
  StorageOptions,
  StorageError,
  StorageStats,
  StorageEventListener,
  StorageChangeEvent,
  StorageEventType,
  EXPIRY_PERIODS,
  STORAGE_VERSION
} from '../types/storage';

export class LocalStorageManager {
  private static instance: LocalStorageManager;
  private listeners: Map<string, Set<StorageEventListener>> = new Map();
  private readonly prefix = 'smart-community';

  private constructor() {
    this.setupStorageListener();
  }

  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  private getFullKey(key: string): string {
    return `${this.prefix}-${key}`;
  }

  private createStorageItem<T>(key: string, value: T, options: StorageOptions = {}): StorageItem<T> {
    return {
      key: key,
      value,
      timestamp: Date.now(),
      version: options.version || STORAGE_VERSION,
      expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined,
    };
  }

  private isExpired(item: StorageItem): boolean {
    return item.expiresAt ? Date.now() > item.expiresAt : false;
  }

  private handleError(error: any, key: string): StorageError {
    let code: StorageError['code'] = 'INVALID_DATA';

    if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      code = 'QUOTA_EXCEEDED';
    } else if (error.name === 'SecurityError') {
      code = 'STORAGE_DISABLED';
    }

    const storageError: StorageError = new Error(error.message) as StorageError;
    storageError.code = code;
    storageError.originalError = error;
    return storageError;
  }

  private notifyListeners(event: StorageChangeEvent): void {
    const key = event.key;
    if (key && this.listeners.has(key)) {
      const keyListeners = this.listeners.get(key)!;
      keyListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in storage listener:', error);
        }
      });
    }

    // Notify global listeners (empty string key)
    if (this.listeners.has('')) {
      const globalListeners = this.listeners.get('')!;
      globalListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in global storage listener:', error);
        }
      });
    }
  }

  private setupStorageListener(): void {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.startsWith(this.prefix)) {
        const originalKey = event.key.replace(`${this.prefix}-`, '');
        this.notifyListeners({
          type: event.newValue ? 'setItem' : 'removeItem',
          key: originalKey,
          oldValue: event.oldValue ?? undefined,
          newValue: event.newValue ?? undefined,
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
  }

  async setItem<T>(key: string, value: T, options: StorageOptions = {}): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const oldValue = localStorage.getItem(fullKey);

      const item = this.createStorageItem<T>(key, value, options);
      const serialized = JSON.stringify(item);

      // 修復 MEDIUM-18: 實作容量檢查 (預估)
      const stats = await this.getStats();
      const newSize = serialized.length + fullKey.length;
      const estimatedTotalUsed = stats.usedSize + newSize - (oldValue?.length || 0);

      // 如果超過 4.5MB (預留 0.5MB 緩衝)，嘗試清理過期資料
      if (estimatedTotalUsed > 4.5 * 1024 * 1024) {
        console.warn('[Storage] 容量接近上限，執行主動清理');
        await this.clearExpiredItems();
      }

      // 再次檢查
      if (estimatedTotalUsed > stats.totalSize) {
        throw new Error('LocalStorage 容量不足，無法儲存。');
      }

      localStorage.setItem(fullKey, serialized);

      this.notifyListeners({
        type: 'setItem',
        key,
        oldValue: oldValue ?? undefined,
        newValue: serialized,
      });
    } catch (error) {
      const storageError = this.handleError(error, key);
      this.notifyListeners({
        type: 'error',
        key,
        error: storageError,
      });
      throw storageError;
    }
  }

  // 修復 MEDIUM-18: 主動清理過期資料
  private async clearExpiredItems(): Promise<number> {
    let clearedCount = 0;
    const keys = await this.getKeys();

    for (const key of keys) {
      const fullKey = this.getFullKey(key);
      const serialized = localStorage.getItem(fullKey);
      if (serialized) {
        try {
          const item: StorageItem = JSON.parse(serialized);
          if (this.isExpired(item)) {
            await this.removeItem(key);
            clearedCount++;
          }
        } catch (e) {
          // 資料異常也視為可清理
          await this.removeItem(key);
          clearedCount++;
        }
      }
    }
    return clearedCount;
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const serialized = localStorage.getItem(fullKey);

      if (!serialized) {
        return null;
      }

      const item: StorageItem<T> = JSON.parse(serialized);

      if (this.isExpired(item)) {
        await this.removeItem(key);
        return null;
      }

      // Version migration could be handled here
      if (item.version !== STORAGE_VERSION) {
        // Handle version migration if needed
        console.warn(`Storage version mismatch for key ${key}: ${item.version} !== ${STORAGE_VERSION}`);
      }

      return item.value;
    } catch (error) {
      const storageError = this.handleError(error, key);
      console.error(`Error getting item ${key}:`, storageError);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const oldValue = localStorage.getItem(fullKey);

      localStorage.removeItem(fullKey);

      this.notifyListeners({
        type: 'removeItem',
        key,
        oldValue: oldValue || undefined,
      });
    } catch (error) {
      const storageError = this.handleError(error, key);
      this.notifyListeners({
        type: 'error',
        key,
        error: storageError,
      });
      throw storageError;
    }
  }

  async clear(): Promise<void> {
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      this.notifyListeners({
        type: 'clear',
      });
    } catch (error) {
      const storageError = this.handleError(error, 'clear');
      this.notifyListeners({
        type: 'error',
        error: storageError,
      });
      throw storageError;
    }
  }

  async getKeys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key.replace(`${this.prefix}-`, ''));
      }
    }
    return keys;
  }

  async getStats(): Promise<StorageStats> {
    let totalSize = 0;
    let itemCount = 0;
    let oldestItem: number | undefined;
    let newestItem: number | undefined;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
          itemCount++;

          try {
            const item: StorageItem = JSON.parse(value);
            if (!oldestItem || item.timestamp < oldestItem) {
              oldestItem = item.timestamp;
            }
            if (!newestItem || item.timestamp > newestItem) {
              newestItem = item.timestamp;
            }
          } catch {
            // Invalid item, skip timestamp calculation
          }
        }
      }
    }

    return {
      totalSize: 5 * 1024 * 1024, // 5MB typical limit
      usedSize: totalSize,
      itemCount,
      oldestItem,
      newestItem,
    };
  }

  addEventListener(key: string | '', listener: StorageEventListener): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);
  }

  removeEventListener(key: string | '', listener: StorageEventListener): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.delete(listener);
      if (keyListeners.size === 0) {
        this.listeners.delete(key);
      }
    }
  }

  hasKey(key: string): boolean {
    const fullKey = this.getFullKey(key);
    return localStorage.getItem(fullKey) !== null;
  }

  async setItemWithExpiry<T>(key: string, value: T, expiresIn: number): Promise<void> {
    await this.setItem(key, value, { expiresIn });
  }

  async setItemForHour<T>(key: string, value: T): Promise<void> {
    await this.setItemWithExpiry(key, value, EXPIRY_PERIODS.HOURLY);
  }

  async setItemForDay<T>(key: string, value: T): Promise<void> {
    await this.setItemWithExpiry(key, value, EXPIRY_PERIODS.DAILY);
  }

  async setItemForWeek<T>(key: string, value: T): Promise<void> {
    await this.setItemWithExpiry(key, value, EXPIRY_PERIODS.WEEKLY);
  }

  async setItemForMonth<T>(key: string, value: T): Promise<void> {
    await this.setItemWithExpiry(key, value, EXPIRY_PERIODS.MONTHLY);
  }

  async exportData(): Promise<Record<string, any>> {
    const keys = await this.getKeys();
    const data: Record<string, any> = {};

    for (const key of keys) {
      const value = await this.getItem(key);
      if (value !== null) {
        data[key] = value;
      }
    }

    return data;
  }

  async importData(data: Record<string, any>, merge: boolean = true): Promise<void> {
    if (!merge) {
      await this.clear();
    }

    for (const [key, value] of Object.entries(data)) {
      try {
        await this.setItem(key, value);
      } catch (error) {
        console.error(`Failed to import key ${key}:`, error);
      }
    }
  }
}

export default LocalStorageManager.getInstance();