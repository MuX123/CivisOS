/**
 * Electron 自動儲存 Hook
 * 監聽 Redux State 變化，自動儲存到本地 CSV 檔案
 */

import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/types';
import { ElectronFileStorage } from '../services/ElectronFileStorage';
import { DataTableName } from '../services/CSVStorageManager';

// State 到資料表的映射
const STATE_TO_TABLE_MAP: Array<{ 
  statePath: keyof RootState; 
  tableName: DataTableName;
  dataExtractor: (state: any) => any[] 
}> = [
  { statePath: 'building', tableName: 'buildings', dataExtractor: (s) => s.buildings },
  { statePath: 'building', tableName: 'floors', dataExtractor: (s) => s.floors },
  { statePath: 'building', tableName: 'units', dataExtractor: (s) => s.units },
  { statePath: 'building', tableName: 'parkingSpaces', dataExtractor: (s) => s.parkingSpaces },
  { statePath: 'resident', tableName: 'residents', dataExtractor: (s) => s.residents },
  { statePath: 'resident', tableName: 'residentStatuses', dataExtractor: (s) => s.statuses },
  { statePath: 'facility', tableName: 'facilities', dataExtractor: (s) => s.facilities },
  { statePath: 'facility', tableName: 'facilityBookings', dataExtractor: (s) => s.bookings },
  { statePath: 'calendar', tableName: 'calendarEvents', dataExtractor: (s) => s.events },
  { statePath: 'depositV2', tableName: 'depositItems', dataExtractor: (s) => s.items },
  { statePath: 'fee', tableName: 'feeUnits', dataExtractor: (s) => s.units },
  { statePath: 'fee', tableName: 'feePeriods', dataExtractor: (s) => s.periods },
  { statePath: 'fee', tableName: 'feeBaseConfigs', dataExtractor: (s) => s.baseConfigs },
  { statePath: 'fee', tableName: 'feeSpecialConfigs', dataExtractor: (s) => s.specialConfigs },
  { statePath: 'config', tableName: 'parkingStatuses', dataExtractor: (s) => s.parkingStatuses },
  { statePath: 'config', tableName: 'houseStatuses', dataExtractor: (s) => s.houseStatuses },
  { statePath: 'config', tableName: 'calendarStatuses', dataExtractor: (s) => s.calendarStatuses },
];

interface UseElectronAutoSaveOptions {
  enabled?: boolean;
  debounceMs?: number;
  onSaveStart?: () => void;
  onSaveComplete?: () => void;
  onSaveError?: (error: string) => void;
}

export const useElectronAutoSave = (options: UseElectronAutoSaveOptions = {}) => {
  const {
    enabled = true,
    debounceMs = 1000,
    onSaveStart,
    onSaveComplete,
    onSaveError,
  } = options;

  const state = useSelector((state: RootState) => state);
  const prevStateRef = useRef<RootState | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // 檢查 Electron 是否可用
  const isElectronAvailable = ElectronFileStorage.checkAvailability();

  // 執行儲存
  const performSave = useCallback(async () => {
    if (!isElectronAvailable || isSavingRef.current) return;

    isSavingRef.current = true;
    onSaveStart?.();

    try {
      const currentState = prevStateRef.current;
      if (!currentState) return;

      const savePromises: Promise<void>[] = [];

      for (const mapping of STATE_TO_TABLE_MAP) {
        const stateSlice = currentState[mapping.statePath];
        if (!stateSlice) continue;

        const data = mapping.dataExtractor(stateSlice);
        if (Array.isArray(data) && data.length >= 0) {
          savePromises.push(
            ElectronFileStorage.writeFile(mapping.tableName, data)
              .then(() => {})
              .catch(err => {
                console.error(`[useElectronAutoSave] 儲存 ${mapping.tableName} 失敗:`, err);
              })
          );
        }
      }

      await Promise.all(savePromises);
      onSaveComplete?.();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '儲存失敗';
      onSaveError?.(errorMsg);
    } finally {
      isSavingRef.current = false;
    }
  }, [isElectronAvailable, onSaveStart, onSaveComplete, onSaveError]);

  // 排程儲存
  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);
  }, [debounceMs, performSave]);

  // 監聽 State 變化
  useEffect(() => {
    if (!enabled || !isElectronAvailable) return;

    // 首次不儲存，只記錄初始狀態
    if (prevStateRef.current === null) {
      prevStateRef.current = state;
      return;
    }

    // 檢查是否有變化
    const hasChanges = JSON.stringify(prevStateRef.current) !== JSON.stringify(state);
    
    if (hasChanges) {
      prevStateRef.current = state;
      scheduleSave();
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, enabled, isElectronAvailable, scheduleSave]);

  // 強制立即儲存
  const forceSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    prevStateRef.current = state;
    await performSave();
  }, [state, performSave]);

  return {
    isElectronAvailable,
    isSaving: () => isSavingRef.current,
    forceSave,
  };
};

export default useElectronAutoSave;
