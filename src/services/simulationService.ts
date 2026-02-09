/**
 * 一年測試模擬服務
 * 用於穩定、逐步地創建測試資料，模擬一年的社區運營
 */

import { Dispatch } from '@reduxjs/toolkit';
import { store } from '../store/index';
import { buildingActions } from '../store/modules/building';
import { parkingActions } from '../store/modules/parking';
import { residentActions } from '../store/modules/resident';
import { facilityActions } from '../store/modules/facility';
import { feeActions } from '../store/modules/fee';
import { depositV2Actions } from '../store/modules/depositV2';
import { calendarActions } from '../store/modules/calendar';
import { configActions } from '../store/modules/config';
import { 
  BuildingConfig, 
  Floor, 
  UnitConfig, 
  ParkingSpaceConfig,
  ResidentV2,
  Facility,
  CalendarEventV2,
  CalendarEvent,
  SystemConfig,
  Tenant
} from '../types/domain';
import { 
  FeeBaseConfig, 
  FeeAdditionalItem 
} from '../types/fee';
import { DepositItemV2 } from '../store/modules/depositV2';
import { ParkingSpaceType } from '../store/modules/parking';

// 生成 ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 隨機選擇陣列中的一個元素
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 隨機生成姓名
function randomName(): string {
  const surnames = ['王', '李', '張', '劉', '陳', '楊', '黃', '趙', '周', '吳', '徐', '孫', '馬', '朱', '胡', '郭', '林', '何', '高', '羅'];
  const givenNames = ['志明', '建國', '淑芬', '美玲', '志豪', '雅婷', '承翰', '怡君', '偉霆', '詩涵', '家豪', '曉彤', '志偉', '雅芳', '明翰', '淑娟', '志遠', '美華', '建民', '秀英'];
  return randomChoice(surnames) + randomChoice(givenNames);
}

// 隨機生成電話號碼
function randomPhone(): string {
  return `09${Math.floor(Math.random() * 90000000 + 10000000)}`;
}

// 隨機生成車牌號碼
function randomLicensePlate(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const letter1 = letters[Math.floor(Math.random() * letters.length)];
  const letter2 = letters[Math.floor(Math.random() * letters.length)];
  const number = Math.floor(Math.random() * 9000 + 1000);
  return `${letter1}${letter2}-${number}`;
}

// 模擬延遲（穩定速度）
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 進度回調類型
export type ProgressCallback = (phase: string, step: string, progress: number, total: number, message: string) => void;

// 日誌類型
export interface SimulationLog {
  timestamp: string;
  phase: string;
  step: string;
  message: string;
  success: boolean;
}

// 模擬服務類
export class SimulationService {
  private logs: SimulationLog[] = [];
  private isRunning = false;
  private abortController: AbortController | null = null;

  // 記錄日誌
  private log(phase: string, step: string, message: string, success: boolean = true): void {
    this.logs.push({
      timestamp: new Date().toISOString(),
      phase,
      step,
      message,
      success
    });
    console.log(`[${phase}] ${step}: ${message}`);
  }

  // 清除日誌
  clearLogs(): void {
    this.logs = [];
  }

  // 獲取日誌
  getLogs(): SimulationLog[] {
    return [...this.logs];
  }

  // 停止模擬
  stop(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.isRunning = false;
  }

  // 檢查是否正在運行
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * 執行一年模擬測試
   * @param options 配置選項
   * @param onProgress 進度回調
   */
  async runSimulation(
    options: {
      buildingCount?: number;
      floorsPerBuilding?: number;
      unitsPerFloor?: number;
      residentPercentage?: number;
      yearDuration?: number;
      creationSpeed?: number;
    },
    onProgress?: ProgressCallback
  ): Promise<void> {
    const dispatch = store.dispatch;
    
    const {
      buildingCount = 2,
      floorsPerBuilding = 12,
      unitsPerFloor = 4,
      residentPercentage = 0.7,
      yearDuration = 12,
      creationSpeed = 100
    } = options;

    this.isRunning = true;
    this.abortController = new AbortController();
    this.clearLogs();

    this.log('INIT', '準備', '開始一年模擬測試', true);
    
    try {
      // ========================================
      // 第一階段：後台設定 (Backend Settings)
      // ========================================
      if (onProgress) {
        onProgress('PHASE_1', '後台設定', 0, 1, '開始創建後台設定');
      }
      
      await this.phase1_BackendSettings(dispatch, onProgress, creationSpeed);
      
      // ========================================
      // 第二階段：建築物結構 (Buildings/Floors/Units)
      // ========================================
      const totalPhases = 9;
      if (onProgress) {
        onProgress('PHASE_2', '建築物結構', 1, totalPhases, '開始創建建築物結構');
      }
      
      const { buildings: buildingConfigs, allUnits } = await this.phase2_Buildings(
        dispatch,
        onProgress, 
        creationSpeed, 
        buildingCount, 
        floorsPerBuilding, 
        unitsPerFloor
      );

      // ========================================
      // 第三階段：車位設定 (Parking Spaces)
      // ========================================
      if (onProgress) {
        onProgress('PHASE_3', '車位設定', 2, totalPhases, '開始創建車位');
      }
      
      await this.phase3_ParkingSpaces(
        dispatch,
        onProgress, 
        creationSpeed, 
        buildingConfigs
      );

      // ========================================
      // 第四階段：住戶資料 (Residents)
      // ========================================
      if (onProgress) {
        onProgress('PHASE_4', '住戶資料', 3, totalPhases, '開始創建住戶');
      }
      
      const residents = await this.phase4_Residents(
        dispatch,
        onProgress, 
        creationSpeed, 
        allUnits,
        residentPercentage
      );

      // ========================================
      // 第五階段：公設資料 (Facilities)
      // ========================================
      if (onProgress) {
        onProgress('PHASE_5', '公設資料', 4, totalPhases, '開始創建公設');
      }
      
      const facilities = await this.phase5_Facilities(
        dispatch,
        onProgress, 
        creationSpeed
      );

      // ========================================
      // 第六階段：管理費設定 (Fee Configurations)
      // ========================================
      if (onProgress) {
        onProgress('PHASE_6', '管理費設定', 5, totalPhases, '開始創建管理費');
      }
      
      await this.phase6_FeeConfigs(
        dispatch,
        onProgress, 
        creationSpeed,
        buildingConfigs
      );

      // ========================================
      // 第七階段：公設預約 (Facility Bookings)
      // ========================================
      if (onProgress) {
        onProgress('PHASE_7', '公設預約', 6, totalPhases, '開始創建公設預約');
      }
      
      await this.phase7_FacilityBookings(
        dispatch,
        onProgress, 
        creationSpeed, 
        yearDuration,
        facilities,
        residents,
        allUnits
      );

      // ========================================
      // 第八階段：寄放資料 (Deposits)
      // ========================================
      if (onProgress) {
        onProgress('PHASE_8', '寄放資料', 7, totalPhases, '開始創建寄放資料');
      }
      
      await this.phase8_Deposits(
        dispatch,
        onProgress, 
        creationSpeed, 
        yearDuration,
        residents,
        allUnits
      );

      // ========================================
      // 第九階段：行事曆事件 (Calendar Events)
      // ========================================
      if (onProgress) {
        onProgress('PHASE_9', '行事曆事件', 8, totalPhases, '開始創建行事曆事件');
      }
      
      await this.phase9_CalendarEvents(
        dispatch,
        onProgress, 
        creationSpeed, 
        yearDuration
      );

      this.log('COMPLETE', '完成', `一年模擬測試完成！共創建 ${yearDuration} 個月的資料`, true);
      this.isRunning = false;

    } catch (error) {
      this.log('ERROR', '錯誤', `模擬失敗: ${error}`, false);
      this.isRunning = false;
      throw error;
    }
  }

  // ============================================
  // 第一階段：後台設定
  // ============================================
  private async phase1_BackendSettings(
    dispatch: Dispatch,
    onProgress: ProgressCallback | undefined,
    speed: number
  ): Promise<void> {
    this.log('PHASE_1', '後台設定', '開始創建系統設定', true);
    
    await delay(speed);
    
    // 創建停車狀態顏色
    const parkingStatuses = [
      { id: 'ps-1', type: 'parking' as const, name: '可租用', color: '#22c55e' },
      { id: 'ps-2', type: 'parking' as const, name: '已佔用', color: '#ef4444' },
      { id: 'ps-3', type: 'parking' as const, name: '保留', color: '#f59e0b' },
      { id: 'ps-4', type: 'parking' as const, name: '維護中', color: '#6b7280' },
    ];

    // 創建行事曆狀態
    const calendarStatuses = [
      { id: 'cs-1', name: '一般', color: '#5865F2' },
      { id: 'cs-2', name: '重要', color: '#f59e0b' },
      { id: 'cs-3', name: '緊急', color: '#ef4444' },
      { id: 'cs-4', name: '完成', color: '#22c55e' },
    ];

    // 創建房務狀態
    const houseStatuses = [
      { id: 'hs-1', name: '空屋', color: '#9ca3af' },
      { id: 'hs-2', name: '自住', color: '#10b981' },
      { id: 'hs-3', name: '出租', color: '#f59e0b' },
      { id: 'hs-4', name: '裝潢中', color: '#8b5cf6' },
    ];

    // 創建車位類型
    const spaceTypes: ParkingSpaceType[] = [
      { id: 'st-1', name: '住戶車位', code: 'resident' },
      { id: 'st-2', name: '訪客車位', code: 'visitor' },
      { id: 'st-3', name: '保留車位', code: 'reserved' },
      { id: 'st-4', name: '身心障礙車位', code: 'disabled' },
    ];

    // Dispatch 到 Redux
    parkingStatuses.forEach(status => {
      dispatch(configActions.addStatusConfig({ type: 'parking', name: status.name, color: status.color }));
    });

    calendarStatuses.forEach(status => {
      dispatch(configActions.addStatusConfig({ type: 'calendar', name: status.name, color: status.color }));
    });

    houseStatuses.forEach(status => {
      dispatch(configActions.addStatusConfig({ type: 'house', name: status.name, color: status.color }));
    });

    spaceTypes.forEach(type => {
      dispatch(parkingActions.addSpaceType(type));
    });

    this.log('PHASE_1', '後台設定', '後台設定創建完成', true);
    
    if (onProgress) {
      onProgress('PHASE_1', '後台設定', 1, 1, '後台設定創建完成');
    }
  }

  // ============================================
  // 第二階段：建築物結構
  // ============================================
  private async phase2_Buildings(
    dispatch: Dispatch,
    onProgress: ProgressCallback | undefined,
    speed: number,
    buildingCount: number,
    floorsPerBuilding: number,
    unitsPerFloor: number
  ): Promise<{ buildings: BuildingConfig[], allFloors: Floor[], allUnits: UnitConfig[] }> {
    this.log('PHASE_2', '建築物結構', `開始創建 ${buildingCount} 棟建築物`, true);
    
    const buildings: BuildingConfig[] = [];
    const allFloors: Floor[] = [];
    const allUnits: UnitConfig[] = [];

    for (let b = 0; b < buildingCount; b++) {
      const buildingId = `building-${b + 1}`;
      const buildingCode = String.fromCharCode(65 + b);
      
      const building: BuildingConfig = {
        id: buildingId,
        buildingCode,
        name: `${buildingCode}棟`,
        houseNumberPrefix: buildingCode,
        roofFloors: 1,
        residentialFloors: floorsPerBuilding,
        basementFloors: 2,
        unitsPerFloor,
        status: 'active',
        totalFloors: floorsPerBuilding + 3,
        totalUnits: floorsPerBuilding * unitsPerFloor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      buildings.push(building);
      this.log('PHASE_2', '建築物', `創建 ${building.name}，共 ${building.totalUnits} 戶`, true);
      
      await delay(speed);

      // 創建樓層
      for (let f = 0; f < floorsPerBuilding + 3; f++) {
        const floorId = `floor-${buildingId}-${f}`;
        let floorNumber: string;
        let floorType: 'roof' | 'residential' | 'basement';
        
        if (f === floorsPerBuilding + 2) {
          floorNumber = 'R';
          floorType = 'roof';
        } else if (f >= floorsPerBuilding) {
          floorNumber = `B${f - floorsPerBuilding + 1}`;
          floorType = 'basement';
        } else {
          floorNumber = `${f + 1}F`;
          floorType = 'residential';
        }

        const floor: Floor = {
          id: floorId,
          buildingId,
          floorNumber,
          name: floorType === 'roof' ? '屋頂樓層' : floorType === 'basement' ? `地下${f - floorsPerBuilding + 1}樓` : `${floorNumber}樓`,
          floorType,
          totalUnits: floorType === 'residential' ? unitsPerFloor : 0,
          sortOrder: f,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        allFloors.push(floor);
        
        // 創建戶別（僅住宅層）
        if (floorType === 'residential') {
          for (let u = 0; u < unitsPerFloor; u++) {
            const unitId = `unit-${floorId}-${u + 1}`;
            const unit: UnitConfig = {
              id: unitId,
              buildingId,
              floorId,
              unitNumber: `${buildingCode}-${floorNumber}-${String(u + 1).padStart(2, '0')}`,
              floorNumber: `${floorNumber}`,
              floorType,
              sortOrder: u,
              status: 'vacant',
              area: 30 + Math.random() * 20,
            };

            allUnits.push(unit);
          }
        }
      }

      this.log('PHASE_2', '建築物', `${building.name} 結構創建完成`, true);
    }

    // Dispatch 到 Redux
    buildings.forEach(building => {
      dispatch(buildingActions.addBuilding(building));
    });

    allFloors.forEach(floor => {
      dispatch(buildingActions.addFloor(floor));
    });

    allUnits.forEach(unit => {
      dispatch(buildingActions.addUnit(unit));
    });

    this.log('PHASE_2', '建築物結構', `建築物結構創建完成：${buildings.length} 棟，${allUnits.length} 戶`, true);
    
    if (onProgress) {
      onProgress('PHASE_2', '建築物結構', 1, 1, `創建 ${buildings.length} 棟建築物`);
    }

    return { buildings, allFloors, allUnits };
  }

  // ============================================
  // 第三階段：車位設定
  // ============================================
  private async phase3_ParkingSpaces(
    dispatch: Dispatch,
    onProgress: ProgressCallback | undefined,
    speed: number,
    buildings: BuildingConfig[]
  ): Promise<void> {
    this.log('PHASE_3', '車位設定', '開始創建車位', true);
    
    const allParkingSpaces: ParkingSpaceConfig[] = [];
    const parkingZones = [
      { name: '住戶區', type: 'resident' as const, perBuilding: 20 },
      { name: '訪客區', type: 'visitor' as const, perBuilding: 5 },
      { name: '保留區', type: 'reserved' as const, perBuilding: 3 },
    ];

    for (const building of buildings) {
      const basementFloors = building.basementFloors;
      
      for (let bf = 0; bf < basementFloors; bf++) {
        const floorId = `floor-${building.id}-${building.residentialFloors + bf}`;
        
        for (const zone of parkingZones) {
          for (let p = 0; p < Math.ceil(zone.perBuilding / basementFloors); p++) {
            const spaceId = `parking-${building.id}-${zone.name}-${bf}-${p + 1}`;
            const space: ParkingSpaceConfig = {
              id: spaceId,
              buildingId: building.id,
              floorId,
              areaId: zone.name,
              number: `${building.buildingCode}-B${bf + 1}-${zone.name}-${String(p + 1).padStart(3, '0')}`,
              type: zone.type,
              status: 'available',
            };

            allParkingSpaces.push(space);
          }
        }
      }
    }

    // Dispatch 到 Redux - 轉換為 ParkingSpace 格式
    allParkingSpaces.forEach(space => {
      const parkingSpace: import('../types/domain').ParkingSpace = {
        id: space.id,
        area: space.areaId,
        number: space.number,
        type: space.type,
        status: space.status,
        monthlyFee: space.monthlyFee,
        note: space.note,
        occupantType: space.occupantType,
        occupantName: space.occupantName,
        occupantBuildingId: space.occupantBuildingId,
        occupantUnitId: space.occupantUnitId,
        licensePlates: space.licensePlates,
      };
      dispatch(parkingActions.addParkingSpace(parkingSpace));
    });

    this.log('PHASE_3', '車位', `創建 ${allParkingSpaces.length} 個車位`, true);
    await delay(speed);
    
    if (onProgress) {
      onProgress('PHASE_3', '車位設定', 1, 1, `創建 ${allParkingSpaces.length} 個車位`);
    }
  }

  // ============================================
  // 第四階段：住戶資料
  // ============================================
  private async phase4_Residents(
    dispatch: Dispatch,
    onProgress: ProgressCallback | undefined,
    speed: number,
    allUnits: UnitConfig[],
    residentPercentage: number
  ): Promise<ResidentV2[]> {
    this.log('PHASE_4', '住戶資料', '開始創建住戶', true);
    
    const residents: ResidentV2[] = [];
    const occupiedUnits = Math.floor(allUnits.length * residentPercentage);
    
    for (let i = 0; i < occupiedUnits; i++) {
      const unit = allUnits[i];
      const unitId = unit.id;
      const isOwner = Math.random() > 0.3;
      const statusId = isOwner ? 'hs-2' : 'hs-3';
      
      const resident: ResidentV2 = {
        id: `resident-${i + 1}`,
        unitId,
        statusId,
        ownerName: randomName(),
        ownerPhone: randomPhone(),
        members: [
          {
            name: randomName(),
            phone: randomPhone(),
          } as Tenant
        ],
        tenants: isOwner ? [] : [
          {
            id: `tenant-${i + 1}`,
            name: randomName(),
            phone: randomPhone(),
          }
        ],
        licensePlates: Math.random() > 0.2 ? [randomLicensePlate()] : [],
        generalCards: [
          { member: '本人', cardNumber: `CARD-${String(i + 1).padStart(6, '0')}` }
        ],
        etcCards: [],
        otherEtcCards: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      residents.push(resident);
      
      if (i % 10 === 0) {
        this.log('PHASE_4', '住戶', `已創建 ${i + 1}/${occupiedUnits} 位住戶`, true);
        await delay(speed);
      }
    }

    // Dispatch 到 Redux
    residents.forEach(resident => {
      dispatch(residentActions.upsertResident(resident));
    });

    this.log('PHASE_4', '住戶', `住戶創建完成：${residents.length} 位住戶`, true);
    
    if (onProgress) {
      onProgress('PHASE_4', '住戶資料', 1, 1, `創建 ${residents.length} 位住戶`);
    }

    return residents;
  }

  // ============================================
  // 第五階段：公設資料
  // ============================================
  private async phase5_Facilities(
    dispatch: Dispatch,
    onProgress: ProgressCallback | undefined,
    speed: number
  ): Promise<Facility[]> {
    this.log('PHASE_5', '公設資料', '開始創建公設', true);
    
    const facilities: Facility[] = [
      {
        id: 'facility-1',
        name: '游泳池',
        type: 'recreation',
        capacity: 30,
        description: '室內溫水游泳池',
        location: 'B1',
        operatingHours: { start: '06:00', end: '22:00' },
        amenities: ['更衣室', '淋浴間', '救生員'],
        hourlyRate: 0,
        bookingRules: { maxHoursPerBooking: 2, maxBookingsPerDay: 1, requiresApproval: true },
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'facility-2',
        name: '健身房',
        type: 'fitness',
        capacity: 20,
        description: '設備完善的健身房',
        location: 'B1',
        operatingHours: { start: '06:00', end: '23:00' },
        amenities: ['跑步機', '啞鈴', '瑜珈墊'],
        hourlyRate: 0,
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'facility-3',
        name: '會議室',
        type: 'meeting',
        capacity: 15,
        description: '可容納15人的會議室',
        location: '1F',
        operatingHours: { start: '09:00', end: '21:00' },
        amenities: ['投影機', '白板', '視訊設備'],
        hourlyRate: 500,
        bookingRules: { maxHoursPerBooking: 4, maxBookingsPerDay: 2, requiresApproval: true },
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'facility-4',
        name: '閱覽室',
        type: 'study',
        capacity: 10,
        description: '安靜的閱讀空間',
        location: '2F',
        operatingHours: { start: '08:00', end: '22:00' },
        amenities: ['書架', '桌椅', 'wifi'],
        hourlyRate: 0,
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'facility-5',
        name: '交誼廳',
        type: 'recreation',
        capacity: 50,
        description: '大型交誼廳可辦活動',
        location: '1F',
        operatingHours: { start: '08:00', end: '23:00' },
        amenities: ['廚房', '音響', '投影設備'],
        hourlyRate: 1000,
        bookingRules: { maxHoursPerBooking: 8, maxBookingsPerDay: 1, requiresApproval: true },
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Dispatch 到 Redux
    facilities.forEach(facility => {
      dispatch(facilityActions.addFacility(facility));
    });

    this.log('PHASE_5', '公設', `創建 ${facilities.length} 項公設`, true);
    await delay(speed);
    
    if (onProgress) {
      onProgress('PHASE_5', '公設資料', 1, 1, `創建 ${facilities.length} 項公設`);
    }

    return facilities;
  }

  // ============================================
  // 第六階段：管理費設定
  // ============================================
  private async phase6_FeeConfigs(
    dispatch: Dispatch,
    onProgress: ProgressCallback | undefined,
    speed: number,
    buildings: BuildingConfig[]
  ): Promise<void> {
    this.log('PHASE_6', '管理費設定', '開始創建管理費設定', true);
    
    // 創建基本費率設定
    const baseConfigs: FeeBaseConfig[] = buildings.map((building, index) => ({
      id: `fee-base-${index + 1}`,
      buildingId: building.id,
      name: `${building.name}標準費率`,
      pricePerPing: 100,
      defaultSize: 35,
      isActive: true,
      description: `${building.name}管理費基本費率`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // 創建額外費用項目
    const additionalItems: FeeAdditionalItem[] = [
      { id: 'add-1', name: '停車費', amount: 2000, isFixed: true, note: '車位月租費' },
      { id: 'add-2', name: '清潔費', amount: 200, isFixed: true, note: '公共區域清潔' },
      { id: 'add-3', name: '電梯維護費', amount: 300, isFixed: true, note: '電梯定期保養' },
    ];

    // Dispatch 到 Redux
    baseConfigs.forEach(config => {
      dispatch(feeActions.addBaseConfig(config));
    });

    additionalItems.forEach(item => {
      dispatch(feeActions.addCustomFeeItem(item));
    });

    this.log('PHASE_6', '管理費', '管理費設定創建完成', true);
    await delay(speed);
    
    if (onProgress) {
      onProgress('PHASE_6', '管理費設定', 1, 1, '管理費設定創建完成');
    }
  }

  // ============================================
  // 第七階段：公設預約
  // ============================================
  private async phase7_FacilityBookings(
    dispatch: Dispatch,
    onProgress: ProgressCallback | undefined,
    speed: number,
    months: number,
    facilities: Facility[],
    residents: ResidentV2[],
    allUnits: UnitConfig[]
  ): Promise<void> {
    this.log('PHASE_7', '公設預約', `開始創建 ${months} 個月的公設預約`, true);
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    for (let m = 0; m < months; m++) {
      const currentMonth = new Date(startDate);
      currentMonth.setMonth(currentMonth.getMonth() + m);
      
      const bookingsThisMonth = 10 + Math.floor(Math.random() * 20);
      
      for (let b = 0; b < bookingsThisMonth; b++) {
        const bookingDate = new Date(currentMonth);
        bookingDate.setDate(Math.floor(Math.random() * 28) + 1);
        
        const facilityId = randomChoice(facilities).id;
        const hour = 9 + Math.floor(Math.random() * 10);
        const duration = [1, 2, 3][Math.floor(Math.random() * 3)];
        
        const booking = {
          id: `booking-${m}-${b}`,
          facilityId,
          bookingType: 'resident' as const,
          bookingDate: bookingDate.toISOString().split('T')[0],
          startTime: `${String(hour).padStart(2, '0')}:00`,
          endTime: `${String(hour + duration).padStart(2, '0')}:00`,
          staffName: randomName(),
          paymentStatus: Math.random() > 0.3 ? ('paid' as const) : ('unpaid' as const),
          bookingStatus: Math.random() > 0.1 ? ('confirmed' as const) : ('cancelled' as const),
          createdAt: bookingDate.toISOString(),
          updatedAt: bookingDate.toISOString(),
        };

        // 找到隨機住戶
        const resident = residents[Math.floor(Math.random() * residents.length)];
        if (resident) {
          (booking as any).residentBuildingId = resident.unit?.buildingId || 'building-1';
          (booking as any).residentFloorId = resident.unit?.floorId || 'floor-building-1-0';
          (booking as any).residentUnitId = resident.unitId;
          (booking as any).residentName = resident.ownerName;
        }

        dispatch(facilityActions.createBooking(booking as any));
      }

      await delay(speed);
      
      if (m % 3 === 0) {
        this.log('PHASE_7', '進度', `已處理 ${m + 1}/${months} 個月`, true);
      }
    }

    this.log('PHASE_7', '公設預約', '公設預約創建完成', true);
    
    if (onProgress) {
      onProgress('PHASE_7', '公設預約', 1, 1, '公設預約創建完成');
    }
  }

  // ============================================
  // 第八階段：寄放資料
  // ============================================
  private async phase8_Deposits(
    dispatch: Dispatch,
    onProgress: ProgressCallback | undefined,
    speed: number,
    months: number,
    residents: ResidentV2[],
    allUnits: UnitConfig[]
  ): Promise<void> {
    this.log('PHASE_8', '寄放資料', `開始創建 ${months} 個月的寄放資料`, true);
    
    const depositTypes: Array<'item' | 'money' | 'key'> = ['item', 'money', 'key'];
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    for (let m = 0; m < months; m++) {
      const currentMonth = new Date(startDate);
      currentMonth.setMonth(currentMonth.getMonth() + m);
      
      const depositsThisMonth = 5 + Math.floor(Math.random() * 10);
      
      for (let d = 0; d < depositsThisMonth; d++) {
        const depositDate = new Date(currentMonth);
        depositDate.setDate(Math.floor(Math.random() * 28) + 1);
        depositDate.setHours(Math.floor(Math.random() * 10) + 8);
        
        const type = randomChoice(depositTypes);
        const unit = allUnits[Math.floor(Math.random() * allUnits.length)];
        
        const deposit = {
          id: `deposit-${m}-${d}`,
          types: [type],
          itemName: type === 'key' ? '大門鑰匙' : type === 'money' ? '管理費' : '包裹',
          sender: {
            type: 'external' as const,
            name: '物流司機',
          },
          receiver: {
            type: 'resident' as const,
            name: randomName(),
            buildingId: unit?.buildingId || 'building-1',
            unitId: unit?.id || 'unit-building-1-0-1',
          },
          depositTime: depositDate.toISOString(),
          staffName: randomName(),
          status: Math.random() > 0.2 ? ('active' as const) : ('retrieved' as const),
          transactions: type === 'money' ? [
            {
              id: `tx-${m}-${d}`,
              type: 'add' as const,
              amount: 1000 + Math.floor(Math.random() * 5000),
              timestamp: depositDate.toISOString(),
              staffName: randomName(),
            }
          ] : undefined,
          currentBalance: type === 'money' ? 1000 + Math.floor(Math.random() * 5000) : undefined,
          logs: [
            {
              id: `log-${m}-${d}`,
              action: 'create' as const,
              timestamp: depositDate.toISOString(),
              staffName: randomName(),
              details: `新增寄放`,
            }
          ],
          createdAt: depositDate.toISOString(),
          updatedAt: depositDate.toISOString(),
        };

        dispatch(depositV2Actions.addDepositItem(deposit as any));
      }

      await delay(speed);
    }

    this.log('PHASE_8', '寄放資料', '寄放資料創建完成', true);
    
    if (onProgress) {
      onProgress('PHASE_8', '寄放資料', 1, 1, '寄放資料創建完成');
    }
  }

  // ============================================
  // 第九階段：行事曆事件
  // ============================================
  private async phase9_CalendarEvents(
    dispatch: Dispatch,
    onProgress: ProgressCallback | undefined,
    speed: number,
    months: number
  ): Promise<void> {
    this.log('PHASE_9', '行事曆事件', `開始創建 ${months} 個月的行事曆事件`, true);
    
    const eventTypes = ['community', 'maintenance', 'security', 'celebration', 'meeting', 'holiday'];
    const eventTitles: Record<string, string[]> = {
      community: ['中秋節晚會', '聖誕節交換禮物', '新年聯歡', '端午節包粽子', '住戶聯誼會', '兒童節活動', '萬聖節派對'],
      maintenance: ['電梯保養', '消防設備檢修', '清潔消毒', '游泳池清洗', '停車場打蠟', '外牆清洗', '水箱清洗'],
      security: ['消防演習', '門禁系統更新', '安全宣導', '監視器維護', '防災演練', '夜間巡邏'],
      celebration: ['開幕茶會', '周年慶典', '頒獎典禮', '新年倒數', '感恩餐會'],
      meeting: ['管委會會議', '住戶代表大會', '區權人會議', '緊急會議', '財務報告會'],
      holiday: ['春節', '元宵節', '清明節', '端午節', '中秋節', '國慶日', '勞動節', '教師節'],
    };

    // 特殊日期映射 (2024-2025)
    const specialDates: Record<string, string[]> = {
      '2024-01-01': ['元旦假期', '新年慶祝'],
      '2024-02-10': ['春節假期', '除夕圍爐'],
      '2024-02-11': ['春節假期', '初一拜年'],
      '2024-02-12': ['春節假期', '初二回娘家'],
      '2024-02-14': ['西洋情人節活動'],
      '2024-02-24': ['元宵節活動'],
      '2024-04-04': ['兒童節活動'],
      '2024-04-05': ['清明節假期'],
      '2024-05-01': ['勞動節假期'],
      '2024-06-10': ['端午節假期', '包粽比賽'],
      '2024-08-08': ['父親節活動'],
      '2024-09-17': ['中秋節假期', '烤肉活動'],
      '2024-09-28': ['教師節活動'],
      '2024-10-10': ['國慶日假期'],
      '2024-12-25': ['聖誕節活動'],
      '2024-12-31': ['跨年倒數'],
      '2025-01-01': ['元旦假期', '新年慶祝'],
      '2025-01-29': ['春節假期', '除夕圍爐'],
      '2025-01-30': ['春節假期', '初一拜年'],
      '2025-01-31': ['春節假期', '初二回娘家'],
    };
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    for (let m = 0; m < months; m++) {
      const currentMonth = new Date(startDate);
      currentMonth.setMonth(currentMonth.getMonth() + m);
      const monthStr = currentMonth.toISOString().slice(0, 7); // YYYY-MM
      
      // 檢查是否有特殊日期
      const monthSpecialEvents: Array<{ date: Date; titles: string[] }> = [];
      Object.entries(specialDates).forEach(([dateStr, titles]) => {
        if (dateStr.startsWith(monthStr)) {
          monthSpecialEvents.push({
            date: new Date(dateStr),
            titles,
          });
        }
      });
      
      // 添加特殊日期事件
      monthSpecialEvents.forEach(({ date, titles }) => {
        titles.forEach((title, idx) => {
          const eventDate = new Date(date);
          eventDate.setHours(10 + idx * 2, 0, 0, 0);
          
          const event: CalendarEventV2 = {
            id: `event-special-${monthStr}-${idx}`,
            title,
            content: `${title}，全體住戶請注意相關公告`,
            images: [],
            startTime: eventDate.toISOString(),
            endTime: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            statusId: 'cs-2', // 重要
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: '管理員',
          };
          dispatch(calendarActions.addEvent(event as any));
        });
      });
      
      // 添加一般事件
      const eventsThisMonth = 3 + Math.floor(Math.random() * 6);
      
      for (let e = 0; e < eventsThisMonth; e++) {
        const eventDate = new Date(currentMonth);
        eventDate.setDate(Math.floor(Math.random() * 28) + 1);
        eventDate.setHours(Math.floor(Math.random() * 12) + 9);
        
        const type = randomChoice(eventTypes);
        const title = randomChoice(eventTitles[type]);
        const hours = [1.5, 2, 3][Math.floor(Math.random() * 3)];
        const endHour = eventDate.getHours() + hours;
        
        // 選擇狀態：一般(60%)、重要(25%)、緊急(10%)、完成(5%)
        const statusRand = Math.random();
        let statusId = 'cs-1'; // 一般
        if (statusRand > 0.95) statusId = 'cs-4'; // 完成
        else if (statusRand > 0.85) statusId = 'cs-3'; // 緊急
        else if (statusRand > 0.6) statusId = 'cs-2'; // 重要
        
        const event: CalendarEventV2 = {
          id: `event-${m}-${e}`,
          title,
          content: `${title}活動，歡迎住戶踴躍參加`,
          images: [],
          startTime: eventDate.toISOString(),
          endTime: new Date(eventDate.setHours(endHour)).toISOString(),
          statusId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: randomName(),
        };

        dispatch(calendarActions.addEvent(event as any));
      }

      await delay(speed);
    }

    this.log('PHASE_9', '行事曆', '行事曆事件創建完成', true);
    
    if (onProgress) {
      onProgress('PHASE_9', '行事曆事件', 1, 1, '行事曆事件創建完成');
    }
  }
}

// 導出單例
export const simulationService = new SimulationService();

/**
 * 清理模擬產生的資料
 * 刪除所有以模擬前綴開頭的資料
 */
export function cleanupSimulationData(dispatch: Dispatch): void {
  // 清理行事曆事件 - 刪除所有 event- 開頭的模擬事件
  const state = store.getState() as { calendar: { events: CalendarEvent[] } };
  state.calendar?.events?.forEach(event => {
    if (event.id.startsWith('event-')) {
      dispatch(calendarActions.deleteEvent(event.id));
    }
  });

  // 清理公設預約 - 刪除所有 booking- 開頭的模擬預約
  const facilityState = store.getState() as { facility: { bookings: any[] } };
  facilityState.facility?.bookings?.forEach(booking => {
    if (booking.id.startsWith('booking-')) {
      dispatch(facilityActions.updateBooking({ 
        id: booking.id, 
        updates: { bookingStatus: 'deleted' } 
      }));
    }
  });

  // 清理寄放資料 - 刪除所有 deposit- 開頭的模擬寄放
  const depositState = store.getState() as { depositV2: { items: any[] } };
  depositState.depositV2?.items?.forEach(item => {
    if (item.id.startsWith('deposit-')) {
      dispatch(depositV2Actions.revertDepositItem({ id: item.id, staffName: '系統自動清除' }));
    }
  });

  // 清理住戶資料 - 刪除所有 resident- 開頭的模擬住戶
  const residentState = store.getState() as { resident: { residents: ResidentV2[] } };
  residentState.resident?.residents?.forEach(resident => {
    if (resident.id.startsWith('resident-')) {
      // 重置為空屋狀態
      dispatch(residentActions.upsertResident({
        ...resident,
        statusId: 'hs-1', // 空屋狀態
        ownerName: '',
        ownerPhone: '',
        members: [],
        tenants: [],
        licensePlates: [],
        generalCards: [],
      }));
    }
  });

  // 清理車位資料 - 重置所有模擬創建的車位
  const parkingState = store.getState() as { parking: { spaces: any[] } };
  parkingState.parking?.spaces?.forEach(space => {
    if (space.id.startsWith('parking-')) {
      dispatch(parkingActions.updateSpaceStatus({
        id: space.id,
        status: 'available',
        reason: undefined
      }));
    }
  });

  // 清理棟別資料
  const buildingState = store.getState() as { building: { buildings: any[], floors: any[], units: any[], parkingSpaces: any[] } };
  
  // 刪除模擬棟別
  buildingState.building?.buildings?.forEach(building => {
    if (building.id.startsWith('building-')) {
      dispatch(buildingActions.deleteBuilding(building.id));
    }
  });

  // 清理建築設定
  const configState = store.getState() as { config: { parkingStatuses: any[], calendarStatuses: any[], houseStatuses: any[] } };
  
  // 移除模擬創建的狀態配置
  if (configState.config?.parkingStatuses) {
    configState.config.parkingStatuses = configState.config.parkingStatuses.filter(
      (s: any) => !s.id.startsWith('ps-')
    );
  }
  if (configState.config?.calendarStatuses) {
    configState.config.calendarStatuses = configState.config.calendarStatuses.filter(
      (s: any) => !s.id.startsWith('cs-')
    );
  }
  if (configState.config?.houseStatuses) {
    configState.config.houseStatuses = configState.config.houseStatuses.filter(
      (s: any) => !s.id.startsWith('hs-')
    );
  }

  console.log('✅ 模擬資料已清理完成');
}
