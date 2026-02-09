/**
 * Electron 資料初始化 Hook
 * 應用程式啟動時從本地 CSV 檔案載入資料
 */

import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ElectronFileStorage } from '../services/ElectronFileStorage';
import type { DataTableName } from '../services/CSVStorageManager';
import { buildingActions } from '../store/modules/building';
import { residentActions } from '../store/modules/resident';
import { facilityActions } from '../store/modules/facility';
import { calendarActions } from '../store/modules/calendar';
import { depositV2Actions } from '../store/modules/depositV2';
import { feeActions } from '../store/modules/fee';
import { configActions } from '../store/modules/config';

interface UseElectronDataInitOptions {
  onComplete?: () => void;
  onError?: (error: string) => void;
}

interface UseElectronDataInitReturn {
  isLoading: boolean;
  isElectron: boolean;
  loadedTables: DataTableName[];
  error: string | null;
  reload: () => Promise<void>;
}

export const useElectronDataInit = (
  options: UseElectronDataInitOptions = {}
): UseElectronDataInitReturn => {
  const { onComplete, onError } = options;
  const dispatch = useDispatch();
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadedTables, setLoadedTables] = useState<DataTableName[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const isElectron = ElectronFileStorage.checkAvailability();

  const loadData = useCallback(async () => {
    if (!isElectron) {
      setIsLoading(false);
      onComplete?.();
      return;
    }

    setIsLoading(true);
    setError(null);
    const loaded: DataTableName[] = [];

    try {
      // 載入建築資料
      const buildings = await ElectronFileStorage.readFile('buildings');
      if (buildings) {
        dispatch(buildingActions.setBuildings(buildings as any));
        loaded.push('buildings');
      }

      const floors = await ElectronFileStorage.readFile('floors');
      if (floors) {
        dispatch(buildingActions.setFloors(floors as any));
        loaded.push('floors');
      }

      const units = await ElectronFileStorage.readFile('units');
      if (units) {
        dispatch(buildingActions.setUnits(units as any));
        loaded.push('units');
      }

      const parkingSpaces = await ElectronFileStorage.readFile('parkingSpaces');
      if (parkingSpaces) {
        dispatch(buildingActions.setParkingSpaces(parkingSpaces as any));
        loaded.push('parkingSpaces');
      }

      // 載入住戶資料
      const residents = await ElectronFileStorage.readFile('residents');
      if (residents) {
        dispatch(residentActions.setResidents(residents as any));
        loaded.push('residents');
      }

      const residentStatuses = await ElectronFileStorage.readFile('residentStatuses');
      if (residentStatuses) {
        residentStatuses.forEach((status: any) => {
          dispatch(residentActions.addStatus(status));
        });
        loaded.push('residentStatuses');
      }

      // 載入設施資料
      const facilities = await ElectronFileStorage.readFile('facilities');
      if (facilities) {
        dispatch(facilityActions.initializeFacilities(facilities as any));
        loaded.push('facilities');
      }

      const facilityBookings = await ElectronFileStorage.readFile('facilityBookings');
      if (facilityBookings) {
        dispatch(facilityActions.initializeBookings(facilityBookings as any));
        loaded.push('facilityBookings');
      }

      // 載入行事曆資料
      const calendarEvents = await ElectronFileStorage.readFile('calendarEvents');
      if (calendarEvents) {
        dispatch(calendarActions.setEvents(calendarEvents as any));
        loaded.push('calendarEvents');
      }

      // 載入寄放資料
      const depositItems = await ElectronFileStorage.readFile('depositItems');
      if (depositItems) {
        dispatch(depositV2Actions.rehydrate({ items: depositItems as any }));
        loaded.push('depositItems');
      }

      // 載入管理費資料
      const feeUnits = await ElectronFileStorage.readFile('feeUnits');
      if (feeUnits) {
        dispatch(feeActions.initializeUnits(feeUnits as any));
        loaded.push('feeUnits');
      }

      const feePeriods = await ElectronFileStorage.readFile('feePeriods');
      if (feePeriods) {
        dispatch(feeActions.setPeriods(feePeriods as any));
        loaded.push('feePeriods');
      }

      const feeBaseConfigs = await ElectronFileStorage.readFile('feeBaseConfigs');
      if (feeBaseConfigs) {
        dispatch(feeActions.setBaseConfigs(feeBaseConfigs as any));
        loaded.push('feeBaseConfigs');
      }

      const feeSpecialConfigs = await ElectronFileStorage.readFile('feeSpecialConfigs');
      if (feeSpecialConfigs) {
        dispatch(feeActions.setSpecialConfigs(feeSpecialConfigs as any));
        loaded.push('feeSpecialConfigs');
      }

      setLoadedTables(loaded);
      onComplete?.();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '載入資料失敗';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, isElectron, onComplete, onError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    isLoading,
    isElectron,
    loadedTables,
    error,
    reload: loadData,
  };
};

export default useElectronDataInit;
