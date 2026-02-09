/**
 * CSV 儲存管理器
 * 將 Redux State 資料以 CSV 格式儲存到本地檔案
 */

import {
  objectsToCSV,
  csvToObjects,
  downloadCSV,
  readCSVFile,
  saveCSVToFile,
} from '../utils/csvUtils';
import { RootState } from '../store/types';

// 資料表名稱與對應的 State 路徑
export type DataTableName = 
  | 'buildings'
  | 'floors'
  | 'units'
  | 'parkingSpaces'
  | 'residents'
  | 'residentStatuses'
  | 'facilities'
  | 'facilityBookings'
  | 'calendarEvents'
  | 'calendarStatuses'
  | 'depositItems'
  | 'depositMoney'
  | 'feeUnits'
  | 'feePeriods'
  | 'feeBaseConfigs'
  | 'feeSpecialConfigs'
  | 'config'
  | 'parkingStatuses'
  | 'houseStatuses';

// 資料表配置
interface TableConfig {
  name: DataTableName;
  filename: string;
  statePath: string; // Redux state 中的路徑，如 'building.buildings'
  headers?: { key: string; label: string }[];
}

// 資料表配置列表
const TABLE_CONFIGS: TableConfig[] = [
  // 建築相關
  {
    name: 'buildings',
    filename: 'buildings.csv',
    statePath: 'building.buildings',
  },
  {
    name: 'floors',
    filename: 'floors.csv',
    statePath: 'building.floors',
  },
  {
    name: 'units',
    filename: 'units.csv',
    statePath: 'building.units',
  },
  {
    name: 'parkingSpaces',
    filename: 'parking_spaces.csv',
    statePath: 'building.parkingSpaces',
  },
  
  // 住戶相關
  {
    name: 'residents',
    filename: 'residents.csv',
    statePath: 'resident.residents',
  },
  {
    name: 'residentStatuses',
    filename: 'resident_statuses.csv',
    statePath: 'resident.statuses',
  },
  
  // 設施相關
  {
    name: 'facilities',
    filename: 'facilities.csv',
    statePath: 'facility.facilities',
  },
  {
    name: 'facilityBookings',
    filename: 'facility_bookings.csv',
    statePath: 'facility.bookings',
  },
  
  // 行事曆相關
  {
    name: 'calendarEvents',
    filename: 'calendar_events.csv',
    statePath: 'calendar.events',
  },
  {
    name: 'calendarStatuses',
    filename: 'calendar_statuses.csv',
    statePath: 'config.calendarStatuses',
  },
  
  // 寄放相關
  {
    name: 'depositItems',
    filename: 'deposit_items.csv',
    statePath: 'depositV2.items',
  },
  
  // 管理費相關
  {
    name: 'feeUnits',
    filename: 'fee_units.csv',
    statePath: 'fee.units',
  },
  {
    name: 'feePeriods',
    filename: 'fee_periods.csv',
    statePath: 'fee.periods',
  },
  {
    name: 'feeBaseConfigs',
    filename: 'fee_base_configs.csv',
    statePath: 'fee.baseConfigs',
  },
  {
    name: 'feeSpecialConfigs',
    filename: 'fee_special_configs.csv',
    statePath: 'fee.specialConfigs',
  },
  
  // 設定相關
  {
    name: 'parkingStatuses',
    filename: 'parking_statuses.csv',
    statePath: 'config.parkingStatuses',
  },
  {
    name: 'houseStatuses',
    filename: 'house_statuses.csv',
    statePath: 'config.houseStatuses',
  },
];

// 從 State 路徑提取資料
const getDataFromPath = (state: RootState, path: string): any[] => {
  const keys = path.split('.');
  let data: any = state;
  
  for (const key of keys) {
    if (data === undefined || data === null) {
      return [];
    }
    data = data[key];
  }
  
  return Array.isArray(data) ? data : [];
};

// 將資料設定到 State 路徑（返回部分 state）
const setDataToPath = (path: string, data: any[]): Partial<RootState> => {
  const keys = path.split('.');
  const result: any = {};
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = {};
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = data;
  return result;
};

class CSVStorageManagerClass {
  private static instance: CSVStorageManagerClass;
  private tableConfigs: Map<DataTableName, TableConfig>;
  
  private constructor() {
    this.tableConfigs = new Map();
    TABLE_CONFIGS.forEach(config => {
      this.tableConfigs.set(config.name, config);
    });
  }
  
  static getInstance(): CSVStorageManagerClass {
    if (!CSVStorageManagerClass.instance) {
      CSVStorageManagerClass.instance = new CSVStorageManagerClass();
    }
    return CSVStorageManagerClass.instance;
  }
  
  // 匯出單一資料表為 CSV
  async exportTable(
    state: RootState,
    tableName: DataTableName,
    useFilePicker: boolean = false
  ): Promise<{ success: boolean; csvContent?: string; filename?: string; error?: string }> {
    try {
      const config = this.tableConfigs.get(tableName);
      if (!config) {
        return { success: false, error: `未知的資料表: ${tableName}` };
      }
      
      const data = getDataFromPath(state, config.statePath);
      
      if (data.length === 0) {
        console.warn(`[CSVStorage] 資料表 ${tableName} 沒有資料`);
      }
      
      const csvContent = objectsToCSV(data, config.headers);
      
      if (useFilePicker) {
        await saveCSVToFile(csvContent, config.filename);
      } else {
        downloadCSV(csvContent, config.filename);
      }
      
      return {
        success: true,
        csvContent,
        filename: config.filename,
      };
    } catch (error) {
      console.error(`[CSVStorage] 匯出 ${tableName} 失敗:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '匯出失敗',
      };
    }
  }
  
  // 匯出所有資料表
  async exportAllTables(
    state: RootState,
    useFilePicker: boolean = false
  ): Promise<{ success: boolean; results: { name: DataTableName; success: boolean; error?: string }[] }> {
    const results: { name: DataTableName; success: boolean; error?: string }[] = [];
    
    for (const [name] of this.tableConfigs) {
      const result = await this.exportTable(state, name, useFilePicker);
      results.push({
        name,
        success: result.success,
        error: result.error,
      });
      
      // 避免瀏覽器阻止多個下載，添加延遲
      if (!useFilePicker) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const allSuccess = results.every(r => r.success);
    return { success: allSuccess, results };
  }
  
  // 從檔案匯入單一資料表
  async importTable(
    file: File,
    tableName?: DataTableName
  ): Promise<{ success: boolean; data?: any[]; tableName?: DataTableName; error?: string }> {
    try {
      const content = await readCSVFile(file);
      const filename = file.name.toLowerCase();
      
      // 如果沒有指定 tableName，嘗試從檔名推測
      let targetTable = tableName;
      if (!targetTable) {
        for (const [name, config] of this.tableConfigs) {
          if (filename === config.filename.toLowerCase() || 
              filename.startsWith(config.filename.toLowerCase().replace('.csv', ''))) {
            targetTable = name;
            break;
          }
        }
      }
      
      if (!targetTable) {
        return {
          success: false,
          error: `無法識別資料表類型，請指定資料表名稱或確認檔名正確`,
        };
      }
      
      const data = csvToObjects(content);
      
      return {
        success: true,
        data,
        tableName: targetTable,
      };
    } catch (error) {
      console.error('[CSVStorage] 匯入失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '匯入失敗',
      };
    }
  }
  
  // 將匯入的資料轉換為 Partial<RootState>
  convertToState(data: any[], tableName: DataTableName): Partial<RootState> {
    const config = this.tableConfigs.get(tableName);
    if (!config) {
      throw new Error(`未知的資料表: ${tableName}`);
    }
    
    return setDataToPath(config.statePath, data);
  }
  
  // 取得所有可匯出的資料表名稱
  getTableNames(): DataTableName[] {
    return Array.from(this.tableConfigs.keys());
  }
  
  // 取得資料表資訊
  getTableInfo(tableName: DataTableName): TableConfig | undefined {
    return this.tableConfigs.get(tableName);
  }
  
  // 批次匯入多個檔案
  async importMultipleTables(
    files: FileList
  ): Promise<{ success: boolean; states: Partial<RootState>[]; errors: string[] }> {
    const states: Partial<RootState>[] = [];
    const errors: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await this.importTable(file);
      
      if (result.success && result.tableName && result.data) {
        try {
          const state = this.convertToState(result.data, result.tableName);
          states.push(state);
        } catch (error) {
          errors.push(`${file.name}: ${error instanceof Error ? error.message : '轉換失敗'}`);
        }
      } else {
        errors.push(`${file.name}: ${result.error || '未知錯誤'}`);
      }
    }
    
    return {
      success: errors.length === 0,
      states,
      errors,
    };
  }
}

export const CSVStorageManager = CSVStorageManagerClass.getInstance();
export default CSVStorageManager;

// 便利函數
export const exportTableToCSV = (
  state: RootState,
  tableName: DataTableName,
  useFilePicker: boolean = false
) => CSVStorageManager.exportTable(state, tableName, useFilePicker);

export const exportAllTablesToCSV = (
  state: RootState,
  useFilePicker: boolean = false
) => CSVStorageManager.exportAllTables(state, useFilePicker);

export const importTableFromCSV = (
  file: File,
  tableName?: DataTableName
) => CSVStorageManager.importTable(file, tableName);

export const importMultipleTablesFromCSV = (
  files: FileList
) => CSVStorageManager.importMultipleTables(files);
