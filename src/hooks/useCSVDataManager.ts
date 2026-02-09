/**
 * CSV 資料管理 Hook
 * 提供簡化的 CSV 匯入/匯出功能
 */

import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  CSVStorageManager,
  DataTableName,
  exportTableToCSV,
  exportAllTablesToCSV,
  importTableFromCSV,
} from '../services/CSVStorageManager';
import { RootState } from '../store/types';
import { buildingActions } from '../store/modules/building';
import { residentActions } from '../store/modules/resident';
import { feeActions } from '../store/modules/fee';
import { facilityActions } from '../store/modules/facility';
import { calendarActions } from '../store/modules/calendar';
import { depositV2Actions } from '../store/modules/depositV2';
import { configActions } from '../store/modules/config';

interface UseCSVDataManagerOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

interface UseCSVDataManagerReturn {
  isLoading: boolean;
  exportTable: (tableName: DataTableName) => Promise<boolean>;
  exportAll: () => Promise<boolean>;
  exportSelected: (tableNames: DataTableName[]) => Promise<boolean>;
  importFile: (file: File) => Promise<boolean>;
  tableNames: DataTableName[];
  getTableLabel: (tableName: DataTableName) => string;
}

const TABLE_LABELS: Record<DataTableName, string> = {
  buildings: '棟別資料',
  floors: '樓層資料',
  units: '戶別資料',
  parkingSpaces: '車位資料',
  residents: '住戶資料',
  residentStatuses: '住戶狀態',
  facilities: '設施資料',
  facilityBookings: '設施預約',
  calendarEvents: '行事曆事件',
  calendarStatuses: '行事曆狀態',
  depositItems: '寄放項目',
  depositMoney: '寄放金額',
  feeUnits: '管理費資料',
  feePeriods: '繳費期數',
  feeBaseConfigs: '管理費基本設定',
  feeSpecialConfigs: '管理費特殊設定',
  config: '系統設定',
  parkingStatuses: '車位狀態',
  houseStatuses: '房屋狀態',
};

export const useCSVDataManager = (
  options: UseCSVDataManagerOptions = {}
): UseCSVDataManagerReturn => {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state);
  const [isLoading, setIsLoading] = useState(false);
  
  const { onSuccess, onError } = options;
  
  // 匯出單一資料表
  const exportTable = useCallback(
    async (tableName: DataTableName): Promise<boolean> => {
      setIsLoading(true);
      
      try {
        const result = await exportTableToCSV(state, tableName);
        
        if (result.success) {
          onSuccess?.(`${TABLE_LABELS[tableName]} 匯出成功！`);
          return true;
        } else {
          onError?.(result.error || '匯出失敗');
          return false;
        }
      } catch (error) {
        onError?.('匯出時發生錯誤');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [state, onSuccess, onError]
  );
  
  // 匯出所有資料表
  const exportAll = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await exportAllTablesToCSV(state);
      
      if (result.success) {
        const successCount = result.results.filter((r) => r.success).length;
        onSuccess?.(`成功匯出 ${successCount} 個資料表！`);
        return true;
      } else {
        const failedCount = result.results.filter((r) => !r.success).length;
        onError?.(`${failedCount} 個資料表匯出失敗`);
        return false;
      }
    } catch (error) {
      onError?.('批次匯出時發生錯誤');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [state, onSuccess, onError]);
  
  // 匯出選中的資料表
  const exportSelected = useCallback(
    async (tableNames: DataTableName[]): Promise<boolean> => {
      if (tableNames.length === 0) {
        onError?.('請至少選擇一個資料表');
        return false;
      }
      
      setIsLoading(true);
      let successCount = 0;
      let errorCount = 0;
      
      for (const tableName of tableNames) {
        try {
          const result = await exportTableToCSV(state, tableName);
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          errorCount++;
        }
      }
      
      if (errorCount === 0) {
        onSuccess?.(`成功匯出 ${successCount} 個資料表！`);
      } else {
        onError?.(`匯出完成：${successCount} 成功，${errorCount} 失敗`);
      }
      
      setIsLoading(false);
      return errorCount === 0;
    },
    [state, onSuccess, onError]
  );
  
  // 匯入檔案
  const importFile = useCallback(
    async (file: File): Promise<boolean> => {
      setIsLoading(true);
      
      try {
        const result = await importTableFromCSV(file);
        
        if (result.success && result.tableName && result.data) {
          // 將資料匯入到 Redux store
          importDataToStore(dispatch, result.tableName, result.data);
          onSuccess?.(
            `成功匯入 ${result.data.length} 筆資料到 ${TABLE_LABELS[result.tableName]}`
          );
          return true;
        } else {
          onError?.(result.error || '無法識別檔案格式');
          return false;
        }
      } catch (error) {
        onError?.('讀取檔案時發生錯誤');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, onSuccess, onError]
  );
  
  // 取得資料表標籤
  const getTableLabel = useCallback((tableName: DataTableName): string => {
    return TABLE_LABELS[tableName];
  }, []);
  
  return {
    isLoading,
    exportTable,
    exportAll,
    exportSelected,
    importFile,
    tableNames: CSVStorageManager.getTableNames(),
    getTableLabel,
  };
};

// 將匯入的資料 dispatch 到對應的 Redux action
const importDataToStore = (
  dispatch: any,
  tableName: DataTableName,
  data: any[]
) => {
  switch (tableName) {
    case 'buildings':
      dispatch(buildingActions.setBuildings(data));
      break;
    case 'floors':
      dispatch(buildingActions.setFloors(data));
      break;
    case 'units':
      dispatch(buildingActions.setUnits(data));
      break;
    case 'parkingSpaces':
      dispatch(buildingActions.setParkingSpaces(data));
      break;
    case 'residents':
      dispatch(residentActions.setResidents(data));
      break;
    case 'residentStatuses':
      data.forEach((status) => dispatch(residentActions.addStatus(status)));
      break;
    case 'facilities':
      dispatch(facilityActions.initializeFacilities(data));
      break;
    case 'facilityBookings':
      dispatch(facilityActions.initializeBookings(data));
      break;
    case 'calendarEvents':
      dispatch(calendarActions.setEvents(data));
      break;
    case 'feeUnits':
      dispatch(feeActions.initializeUnits(data));
      break;
    case 'feePeriods':
      dispatch(feeActions.setPeriods(data));
      break;
    case 'feeBaseConfigs':
      dispatch(feeActions.setBaseConfigs(data));
      break;
    case 'feeSpecialConfigs':
      dispatch(feeActions.setSpecialConfigs(data));
      break;
    case 'depositItems':
      dispatch(depositV2Actions.rehydrate({ items: data }));
      break;
    case 'parkingStatuses':
    case 'houseStatuses':
    case 'calendarStatuses':
      // 這些是設定檔，可能需要特殊處理
      console.warn(`設定檔匯入需要額外處理: ${tableName}`);
      break;
    default:
      console.warn(`未處理的資料表類型: ${tableName}`);
  }
};

export default useCSVDataManager;
