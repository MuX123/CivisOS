/**
 * Electron 檔案儲存服務
 * 在 Electron 環境中自動將資料儲存到本地 CSV 檔案
 */

import { objectsToCSV, csvToObjects } from '../utils/csvUtils';
import { DataTableName } from './CSVStorageManager';

// 檢查是否在 Electron 環境中
const isElectron = () => {
  return typeof window !== 'undefined' && 
         typeof window.electronAPI !== 'undefined';
};

// 資料表檔名對應
const TABLE_FILE_NAMES: Record<DataTableName, string> = {
  buildings: 'buildings.csv',
  floors: 'floors.csv',
  units: 'units.csv',
  parkingSpaces: 'parking_spaces.csv',
  residents: 'residents.csv',
  residentStatuses: 'resident_statuses.csv',
  facilities: 'facilities.csv',
  facilityBookings: 'facility_bookings.csv',
  calendarEvents: 'calendar_events.csv',
  calendarStatuses: 'calendar_statuses.csv',
  depositItems: 'deposit_items.csv',
  depositMoney: 'deposit_money.csv',
  feeUnits: 'fee_units.csv',
  feePeriods: 'fee_periods.csv',
  feeBaseConfigs: 'fee_base_configs.csv',
  feeSpecialConfigs: 'fee_special_configs.csv',
  config: 'config.csv',
  parkingStatuses: 'parking_statuses.csv',
  houseStatuses: 'house_statuses.csv',
};

class ElectronFileStorageClass {
  private isAvailable: boolean;
  private saveQueue: Map<DataTableName, any[]>;
  private saveTimeout: NodeJS.Timeout | null = null;
  private readonly SAVE_DELAY = 1000; // 1 秒防抖

  constructor() {
    this.isAvailable = isElectron();
    this.saveQueue = new Map();
  }

  // 檢查 Electron 檔案儲存是否可用
  checkAvailability(): boolean {
    return this.isAvailable;
  }

  // 取得資料儲存路徑
  async getDataPath(): Promise<string | null> {
    if (!this.isAvailable) return null;
    try {
      return await window.electronAPI.app.getDataPath();
    } catch {
      return null;
    }
  }

  // 寫入 CSV 檔案（立即）
  async writeFile(tableName: DataTableName, data: any[]): Promise<boolean> {
    if (!this.isAvailable) {
      console.warn('[ElectronFileStorage] Electron API 不可用');
      return false;
    }

    try {
      const filename = TABLE_FILE_NAMES[tableName];
      const csvContent = objectsToCSV(data);
      
      const result = await window.electronAPI.csv.writeFile(filename, csvContent);
      
      if (result.success) {
        console.log(`[ElectronFileStorage] 已儲存 ${tableName}: ${result.path}`);
        return true;
      } else {
        console.error(`[ElectronFileStorage] 儲存 ${tableName} 失敗:`, result.error);
        return false;
      }
    } catch (error) {
      console.error(`[ElectronFileStorage] 儲存 ${tableName} 時發生錯誤:`, error);
      return false;
    }
  }

  // 排程儲存（防抖）
  scheduleSave(tableName: DataTableName, data: any[]): void {
    this.saveQueue.set(tableName, data);
    
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      this.flushSaveQueue();
    }, this.SAVE_DELAY);
  }

  // 立即執行所有排程的儲存
  async flushSaveQueue(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    const promises: Promise<void>[] = [];
    
    for (const [tableName, data] of this.saveQueue.entries()) {
      promises.push(
        this.writeFile(tableName, data).then(() => {
          this.saveQueue.delete(tableName);
        })
      );
    }

    await Promise.all(promises);
  }

  // 讀取 CSV 檔案
  async readFile<T extends Record<string, any>>(tableName: DataTableName): Promise<T[] | null> {
    if (!this.isAvailable) return null;

    try {
      const filename = TABLE_FILE_NAMES[tableName];
      const result = await window.electronAPI.csv.readFile(filename);
      
      if (result.success && result.exists && result.content) {
        return csvToObjects<T>(result.content);
      }
      
      return null;
    } catch (error) {
      console.error(`[ElectronFileStorage] 讀取 ${tableName} 時發生錯誤:`, error);
      return null;
    }
  }

  // 列出所有已儲存的檔案
  async listFiles(): Promise<Array<{ name: string; path: string; size: number; modified: Date }> | null> {
    if (!this.isAvailable) return null;

    try {
      const result = await window.electronAPI.csv.listFiles();
      return result.success ? result.files || null : null;
    } catch (error) {
      console.error('[ElectronFileStorage] 列出檔案時發生錯誤:', error);
      return null;
    }
  }

  // 匯出 CSV（選擇位置）
  async exportFile(tableName: DataTableName, data: any[]): Promise<boolean> {
    if (!this.isAvailable) return false;

    try {
      const filename = TABLE_FILE_NAMES[tableName];
      const csvContent = objectsToCSV(data);
      
      const result = await window.electronAPI.csv.export(filename, csvContent);
      
      if (result.success) {
        console.log(`[ElectronFileStorage] 已匯出 ${tableName}: ${result.path}`);
        return true;
      } else if (result.cancelled) {
        console.log(`[ElectronFileStorage] 使用者取消匯出 ${tableName}`);
        return false;
      } else {
        console.error(`[ElectronFileStorage] 匯出 ${tableName} 失敗:`, result.error);
        return false;
      }
    } catch (error) {
      console.error(`[ElectronFileStorage] 匯出 ${tableName} 時發生錯誤:`, error);
      return false;
    }
  }

  // 匯入 CSV（選擇檔案）
  async importFiles(): Promise<Array<{ name: string; path: string; content: string }> | null> {
    if (!this.isAvailable) return null;

    try {
      const result = await window.electronAPI.csv.import();
      return result.success ? result.files || null : null;
    } catch (error) {
      console.error('[ElectronFileStorage] 匯入檔案時發生錯誤:', error);
      return null;
    }
  }

  // 刪除檔案
  async deleteFile(tableName: DataTableName): Promise<boolean> {
    if (!this.isAvailable) return false;

    try {
      const filename = TABLE_FILE_NAMES[tableName];
      const result = await window.electronAPI.csv.deleteFile(filename);
      return result.success;
    } catch (error) {
      console.error(`[ElectronFileStorage] 刪除 ${tableName} 時發生錯誤:`, error);
      return false;
    }
  }

  // 載入所有資料（應用程式啟動時）
  async loadAllData(): Promise<Partial<Record<DataTableName, any[]>>> {
    const data: Partial<Record<DataTableName, any[]>> = {};
    
    const tableNames = Object.keys(TABLE_FILE_NAMES) as DataTableName[];
    
    for (const tableName of tableNames) {
      const tableData = await this.readFile(tableName);
      if (tableData && tableData.length > 0) {
        data[tableName] = tableData;
      }
    }
    
    return data;
  }
}

export const ElectronFileStorage = new ElectronFileStorageClass();
export default ElectronFileStorage;
