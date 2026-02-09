/**
 * Electron 自動 CSV 儲存 Middleware
 * 監聽 Redux Action，自動將資料儲存到本地 CSV 檔案
 */

import { Middleware, Dispatch, AnyAction } from '@reduxjs/toolkit';
import { RootState } from '../types';
import { ElectronFileStorage } from '../../services/ElectronFileStorage';
import { DataTableName } from '../../services/CSVStorageManager';

// 定義需要儲存的 State 映射
interface StateMapping {
  stateKey: keyof RootState;
  tableName: DataTableName;
  dataPath: string; // 例如: 'buildings', 'residents'
}

const STATE_MAPPINGS: StateMapping[] = [
  { stateKey: 'building', tableName: 'buildings', dataPath: 'buildings' },
  { stateKey: 'building', tableName: 'floors', dataPath: 'floors' },
  { stateKey: 'building', tableName: 'units', dataPath: 'units' },
  { stateKey: 'building', tableName: 'parkingSpaces', dataPath: 'parkingSpaces' },
  { stateKey: 'resident', tableName: 'residents', dataPath: 'residents' },
  { stateKey: 'resident', tableName: 'residentStatuses', dataPath: 'statuses' },
  { stateKey: 'facility', tableName: 'facilities', dataPath: 'facilities' },
  { stateKey: 'facility', tableName: 'facilityBookings', dataPath: 'bookings' },
  { stateKey: 'calendar', tableName: 'calendarEvents', dataPath: 'events' },
  { stateKey: 'depositV2', tableName: 'depositItems', dataPath: 'items' },
  { stateKey: 'fee', tableName: 'feeUnits', dataPath: 'units' },
  { stateKey: 'fee', tableName: 'feePeriods', dataPath: 'periods' },
  { stateKey: 'fee', tableName: 'feeBaseConfigs', dataPath: 'baseConfigs' },
  { stateKey: 'fee', tableName: 'feeSpecialConfigs', dataPath: 'specialConfigs' },
];

// 需要觸發儲存的 Action 前綴
const PERSIST_ACTION_PREFIXES = [
  'building/',
  'resident/',
  'facility/',
  'calendar/',
  'depositV2/',
  'fee/',
  'config/',
];

class ElectronAutoSaveMiddleware {
  private saveQueue: Set<DataTableName> = new Set();
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly throttleMs: number;
  private isElectronAvailable: boolean;

  constructor(throttleMs: number = 1000) {
    this.throttleMs = throttleMs;
    this.isElectronAvailable = ElectronFileStorage.checkAvailability();
  }

  private shouldPersistAction(action: AnyAction): boolean {
    const type = action.type as string;
    return PERSIST_ACTION_PREFIXES.some(prefix => type.startsWith(prefix));
  }

  private getTableNameFromAction(action: AnyAction): DataTableName | null {
    const type = action.type as string;
    
    // 根據 Action 類型判斷對應的資料表
    if (type.includes('building')) {
      if (type.includes('floor')) return 'floors';
      if (type.includes('unit')) return 'units';
      if (type.includes('parking')) return 'parkingSpaces';
      return 'buildings';
    }
    if (type.includes('resident')) {
      if (type.includes('status')) return 'residentStatuses';
      return 'residents';
    }
    if (type.includes('facility')) {
      if (type.includes('booking')) return 'facilityBookings';
      return 'facilities';
    }
    if (type.includes('calendar')) return 'calendarEvents';
    if (type.includes('deposit')) return 'depositItems';
    if (type.includes('fee')) {
      if (type.includes('period')) return 'feePeriods';
      if (type.includes('baseConfig')) return 'feeBaseConfigs';
      if (type.includes('specialConfig')) return 'feeSpecialConfigs';
      return 'feeUnits';
    }
    
    return null;
  }

  private scheduleSave(tableName: DataTableName): void {
    this.saveQueue.add(tableName);

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.flushSaveQueue();
    }, this.throttleMs);
  }

  private async flushSaveQueue(): Promise<void> {
    if (!this.isElectronAvailable || this.saveQueue.size === 0) return;

    const state = (window as any).__REDUX_STATE__ as RootState;
    if (!state) return;

    const promises: Promise<void>[] = [];

    for (const tableName of this.saveQueue) {
      const mapping = STATE_MAPPINGS.find(m => m.tableName === tableName);
      if (!mapping) continue;

      const stateSlice = state[mapping.stateKey];
      if (!stateSlice) continue;

      const data = this.getNestedValue(stateSlice, mapping.dataPath);
      if (Array.isArray(data)) {
        promises.push(
          ElectronFileStorage.writeFile(tableName, data)
            .then(() => {
              console.log(`[ElectronAutoSave] 已儲存 ${tableName}`);
            })
            .catch(err => {
              console.error(`[ElectronAutoSave] 儲存 ${tableName} 失敗:`, err);
            })
        );
      }
    }

    await Promise.all(promises);
    this.saveQueue.clear();
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  createMiddleware(): Middleware<{}, RootState, Dispatch<AnyAction>> {
    return (api) => (next) => (action: AnyAction) => {
      const result = next(action);

      // 檢查是否需要儲存
      if (this.isElectronAvailable && this.shouldPersistAction(action)) {
        const tableName = this.getTableNameFromAction(action);
        if (tableName) {
          // 更新 Redux State 引用
          (window as any).__REDUX_STATE__ = api.getState();
          this.scheduleSave(tableName);
        }
      }

      return result;
    };
  }
}

// 創建 Middleware 實例
const electronAutoSaveInstance = new ElectronAutoSaveMiddleware(1000);

export const electronAutoSaveMiddleware = electronAutoSaveInstance.createMiddleware();

// 強制立即儲存所有資料
export const forceElectronSave = async (state: RootState): Promise<void> => {
  if (!ElectronFileStorage.checkAvailability()) return;

  const promises = STATE_MAPPINGS.map(async (mapping) => {
    const stateSlice = state[mapping.stateKey];
    if (!stateSlice) return;

    const data = (stateSlice as any)[mapping.dataPath];
    if (Array.isArray(data) && data.length > 0) {
      await ElectronFileStorage.writeFile(mapping.tableName, data);
    }
  });

  await Promise.all(promises);
};

export default electronAutoSaveMiddleware;
