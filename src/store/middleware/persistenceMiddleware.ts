import { Middleware, Store, Dispatch, AnyAction } from '@reduxjs/toolkit';
import LocalStorageManager from '../../services/LocalStorageManager';
import CSVStorageManager, { DataTableName } from '../../services/CSVStorageManager';
import { RootState } from '../types';

interface PersistedState {
  version: string;
  timestamp: number;
  state: Partial<RootState>;
}

export interface PersistenceMiddlewareConfig {
  key: string;
  whitelist?: (keyof RootState)[];
  blacklist?: (keyof RootState)[];
  throttle?: number;
  migrate?: (persistedState: any, currentVersion: string) => Promise<Partial<RootState>>;
  serialize?: (state: Partial<RootState>) => string;
  deserialize?: (serialized: string) => Partial<RootState>;
}

const DEFAULT_CONFIG: Partial<PersistenceMiddlewareConfig> = {
  throttle: 1000,
};

export class PersistenceMiddleware {
  private config: PersistenceMiddlewareConfig;
  private storage: typeof LocalStorageManager;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(config: PersistenceMiddlewareConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.storage = LocalStorageManager;
  }

  private shouldPersistKey(key: string): boolean {
    if (this.config.whitelist) {
      return this.config.whitelist.includes(key as keyof RootState);
    }
    if (this.config.blacklist) {
      return !this.config.blacklist.includes(key as keyof RootState);
    }
    return true;
  }

  private filterState(state: RootState): Partial<RootState> {
    const filtered: Partial<RootState> = {};
    
    for (const [key, value] of Object.entries(state)) {
      if (this.shouldPersistKey(key)) {
        (filtered as any)[key] = value;
      }
    }
    
    return filtered;
  }

  private serialize(state: Partial<RootState>): string {
    if (this.config.serialize) {
      return this.config.serialize(state);
    }

    const persistedState: PersistedState = {
      version: '1.0.0',
      timestamp: Date.now(),
      state,
    };

    return JSON.stringify(persistedState);
  }

  private async deserialize(serialized: string): Promise<Partial<RootState>> {
    if (this.config.deserialize) {
      return this.config.deserialize(serialized);
    }

    try {
      const persistedState: PersistedState = JSON.parse(serialized);
      
      if (persistedState.version !== '1.0.0' && this.config.migrate) {
        return await this.config.migrate(persistedState.state, persistedState.version);
      }
      
      return persistedState.state;
    } catch (error) {
      console.error('Failed to deserialize persisted state:', error);
      return {};
    }
  }

  private schedulePersist(state: RootState): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.persistState(state);
      this.timeoutId = null;
    }, this.config.throttle);
  }

  private async persistState(state: RootState): Promise<void> {
    try {
      const filteredState = this.filterState(state);
      
      // Debug: 檢查 fee state 是否存在
      if ('fee' in filteredState) {
        console.log('[Persistence] Fee state found:', {
          periodsCount: (filteredState.fee as any)?.periods?.length || 0,
          hasPeriods: !!(filteredState.fee as any)?.periods?.length,
        });
      } else {
        console.warn('[Persistence] Fee state NOT found in filtered state!');
      }
      
      const serialized = this.serialize(filteredState);
      
      // Debug: 檢查序列化後的大小
      console.log('[Persistence] Serialized state size:', serialized.length, 'bytes');
      
      await this.storage.setItem(this.config.key, serialized);
      console.log('[Persistence] State persisted successfully');
    } catch (error) {
      console.error('[Persistence] Failed to persist state:', error);
      throw error; // 重新拋出錯誤以便上層捕獲
    }
  }

  async rehydrate(): Promise<Partial<RootState>> {
    try {
      const serializedState = await this.storage.getItem<string>(this.config.key);
      
      if (serializedState) {
        console.log('[Rehydrate] Found persisted state, size:', serializedState.length, 'bytes');
        const deserialized = await this.deserialize(serializedState);
        
        // Debug: 檢查 fee state 是否被恢復
        if ('fee' in deserialized) {
          console.log('[Rehydrate] Fee state restored:', {
            periodsCount: (deserialized.fee as any)?.periods?.length || 0,
          });
        } else {
          console.warn('[Rehydrate] Fee state NOT found in persisted data!');
        }
        
        return deserialized;
      }
      
      console.log('[Rehydrate] No persisted state found');
      return {};
    } catch (error) {
      console.error('Failed to rehydrate state:', error);
      return {};
    }
  }

  createMiddleware(): Middleware<{}, RootState, Dispatch<AnyAction>> {
    return (api) => (next) => (action) => {
      const result = next(action);

      // Only persist on successful actions
      if (result && !result.error) {
        this.schedulePersist(api.getState());
      }

      return result;
    };
  }

  async clearPersistedState(): Promise<void> {
    try {
      await this.storage.removeItem(this.config.key);
    } catch (error) {
      console.error('Failed to clear persisted state:', error);
      throw error;
    }
  }

  async getPersistedState(): Promise<Partial<RootState> | null> {
    try {
      return await this.storage.getItem<Partial<RootState>>(this.config.key);
    } catch (error) {
      console.error('Failed to get persisted state:', error);
      return null;
    }
  }

  isPersisted(): boolean {
    return this.storage.hasKey(this.config.key);
  }

  async forcePersist(state: RootState): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    await this.persistState(state);
  }

  // ========== 壓力測試備份與還原功能 ==========
  async backupState(key: string, state: RootState): Promise<void> {
    try {
      const filteredState = this.filterState(state);
      const serialized = this.serialize(filteredState);
      await this.storage.setItem(key, serialized);
      console.log(`[Backup] State backed up to ${key}`);
    } catch (error) {
      console.error(`[Backup] Failed to backup state to ${key}:`, error);
      throw error;
    }
  }

  async restoreBackup(key: string): Promise<Partial<RootState> | null> {
    try {
      const serialized = await this.storage.getItem<string>(key);
      if (!serialized) {
        console.warn(`[Restore] No backup found for key ${key}`);
        return null;
      }
      
      const state = await this.deserialize(serialized);
      
      // 確保還原的狀態包含 fee state
      if ('fee' in state) {
        console.log('[Restore] Fee state detected in backup:', {
          periodsCount: (state.fee as any)?.periods?.length || 0,
        });
      } else {
        console.warn('[Restore] Fee state NOT found in backup data!');
      }

      console.log(`[Restore] State restored from ${key}`);
      
      // 直接覆蓋主要持久化 key，這樣 reload 後就會載入這個狀態
      await this.storage.setItem(this.config.key, serialized);
      
      return state;
    } catch (error) {
      console.error(`[Restore] Failed to restore state from ${key}:`, error);
      throw error;
    }
  }

  // ========== CSV 匯出/匯入功能 ==========
  async exportToCSV(state: RootState, tableName: DataTableName, useFilePicker: boolean = false): Promise<{ success: boolean; csvContent?: string; filename?: string; error?: string }> {
    return CSVStorageManager.exportTable(state, tableName, useFilePicker);
  }

  async exportAllToCSV(state: RootState, useFilePicker: boolean = false): Promise<{ success: boolean; results: { name: DataTableName; success: boolean; error?: string }[] }> {
    return CSVStorageManager.exportAllTables(state, useFilePicker);
  }

  async importFromCSV(file: File, tableName?: DataTableName): Promise<{ success: boolean; data?: any[]; tableName?: DataTableName; error?: string }> {
    return CSVStorageManager.importTable(file, tableName);
  }

  convertCSVToState(data: any[], tableName: DataTableName): Partial<RootState> {
    return CSVStorageManager.convertToState(data, tableName);
  }
}

// Factory function for creating middleware instances
export function createPersistenceMiddleware(config: PersistenceMiddlewareConfig): {
  middleware: Middleware<{}, RootState>;
  rehydrate: () => Promise<Partial<RootState>>;
  clearPersistedState: () => Promise<void>;
  getPersistedState: () => Promise<Partial<RootState> | null>;
  isPersisted: () => boolean;
  forcePersist: (state: RootState) => Promise<void>;
  backupState: (key: string, state: RootState) => Promise<void>;
  restoreBackup: (key: string) => Promise<Partial<RootState> | null>;
  // CSV 功能
  exportToCSV: (state: RootState, tableName: DataTableName, useFilePicker?: boolean) => Promise<{ success: boolean; csvContent?: string; filename?: string; error?: string }>;
  exportAllToCSV: (state: RootState, useFilePicker?: boolean) => Promise<{ success: boolean; results: { name: DataTableName; success: boolean; error?: string }[] }>;
  importFromCSV: (file: File, tableName?: DataTableName) => Promise<{ success: boolean; data?: any[]; tableName?: DataTableName; error?: string }>;
  convertCSVToState: (data: any[], tableName: DataTableName) => Partial<RootState>;
} {
  const persistence = new PersistenceMiddleware(config);
  
  return {
    middleware: persistence.createMiddleware(),
    rehydrate: () => persistence.rehydrate(),
    clearPersistedState: () => persistence.clearPersistedState(),
    getPersistedState: () => persistence.getPersistedState(),
    isPersisted: () => persistence.isPersisted(),
    forcePersist: (state: RootState) => persistence.forcePersist(state),
    backupState: (key: string, state: RootState) => persistence.backupState(key, state),
    restoreBackup: (key: string) => persistence.restoreBackup(key),
    // CSV 功能
    exportToCSV: (state: RootState, tableName: DataTableName, useFilePicker?: boolean) => persistence.exportToCSV(state, tableName, useFilePicker),
    exportAllToCSV: (state: RootState, useFilePicker?: boolean) => persistence.exportAllToCSV(state, useFilePicker),
    importFromCSV: (file: File, tableName?: DataTableName) => persistence.importFromCSV(file, tableName),
    convertCSVToState: (data: any[], tableName: DataTableName) => persistence.convertCSVToState(data, tableName),
  };
}

// Pre-configured middleware for common use cases
export const createThemePersistence = () => createPersistenceMiddleware({
  key: 'theme-config',
  whitelist: ['config'],
});

export const createUserDataPersistence = () => createPersistenceMiddleware({
  key: 'user-data',
  whitelist: ['building', 'floor', 'unit', 'parking', 'resident', 'facility', 'deposit'],
});

export const createQuickAccessPersistence = () => createPersistenceMiddleware({
  key: 'quick-access',
  whitelist: ['calendar', 'config'],
  throttle: 500,
});

export const createFullPersistence = () => createPersistenceMiddleware({
  key: 'full-state',
  blacklist: ['eventBus'], // Don't persist real-time events
  throttle: 2000,
});