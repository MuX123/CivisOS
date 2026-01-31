// 本地數據服務 - 使用 LocalStorage 存儲數據
// 完全本地運行，不需要後端數據庫

class LocalDatabaseService<T> {
  protected tableName: string;
  private storageKey: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.storageKey = `civis_${tableName}`;
  }

  // 獲取所有數據
  async getAll(): Promise<T[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      return JSON.parse(data) as T[];
    } catch (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      return [];
    }
  }

  // 根據 ID 獲取單條數據
  async getById(id: string): Promise<T | null> {
    const items = await this.getAll();
    const item = items.find((i: any) => i.id === id);
    return item || null;
  }

  // 創建新數據
  async create(item: Partial<T>): Promise<T | null> {
    try {
      const items = await this.getAll();
      const newItem = {
        ...item,
        id: (item as any).id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as T;
      items.push(newItem);
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      return newItem;
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      return null;
    }
  }

  // 更新數據
  async update(id: string, updates: Partial<T>): Promise<T | null> {
    try {
      const items = await this.getAll();
      const index = items.findIndex((i: any) => i.id === id);
      if (index === -1) return null;

      const updatedItem = {
        ...items[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      } as T;
      items[index] = updatedItem;
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      return updatedItem;
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      return null;
    }
  }

  // 刪除數據
  async delete(id: string): Promise<boolean> {
    try {
      const items = await this.getAll();
      const filteredItems = items.filter((i: any) => i.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredItems));
      return true;
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      return false;
    }
  }

  // 根據條件過濾
  async filter(filters: Record<string, any>): Promise<T[]> {
    const items = await this.getAll();
    return items.filter((item: any) => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null) return true;
        return item[key] === value;
      });
    });
  }

  // 分頁查詢
  async paginate(page: number = 1, limit: number = 10): Promise<{
    data: T[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const items = await this.getAll();
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const data = items.slice(offset, offset + limit);

    return {
      data,
      total,
      page,
      totalPages,
    };
  }

  // 清空表
  async clear(): Promise<boolean> {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error(`Error clearing ${this.tableName}:`, error);
      return false;
    }
  }

  // 批量插入
  async bulkInsert(items: Partial<T>[]): Promise<T[]> {
    try {
      const currentItems = await this.getAll();
      const newItems = items.map(item => ({
        ...item,
        id: (item as any).id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })) as T[];
      const allItems = [...currentItems, ...newItems];
      localStorage.setItem(this.storageKey, JSON.stringify(allItems));
      return newItems;
    } catch (error) {
      console.error(`Error bulk inserting ${this.tableName}:`, error);
      return [];
    }
  }

  // 計數
  async count(): Promise<number> {
    const items = await this.getAll();
    return items.length;
  }
}

export default LocalDatabaseService;
