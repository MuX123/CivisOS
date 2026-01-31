// src/types/building.ts
// 棟數與樓層管理類型定義

import { Floor, Unit, ParkingSpace } from './domain';

// ==================== 棟數擴展類型 ====================

export interface BuildingConfig {
  /** 棟數 ID */
  id: string;
  /** 棟數名稱 (如 A棟、B棟) */
  name: string;
  /** 棟數代碼 */
  buildingCode: string;
  /** 地址 */
  address?: string;
  /** 地下室樓層數 */
  basementFloors: number;
  /** 居住層樓層數 */
  residentialFloors: number;
  /** R樓/屋頂層數量 (0 或 1) */
  roofFloors: number;
  /** 每層戶數 */
  unitsPerFloor: number;
  /** 地下室每層車位數 */
  parkingSpacesPerBasementFloor: number;
  /** 地下室車位起始號碼 */
  parkingSpaceStartNumber: number;
  /** 排序順序 */
  sortOrder: number;
  /** 備註 */
  description?: string;
  /** 建立時間 */
  createdAt: Date | string;
  /** 更新时间 */
  updatedAt: Date | string;
}

export interface BuildingState {
  buildings: BuildingConfig[];
  selectedBuildingId: string | null;
  loading: boolean;
  error: string | null;
}

// ==================== 樓層類型擴展 ====================

export interface FloorConfig {
  /** 樓層 ID */
  id: string;
  /** 所屬棟數 ID */
  buildingId: string;
  /** 樓層編號 (如 B1, 1F, 2F, RF) */
  floorNumber: string;
  /** 樓層顯示名稱 */
  name: string;
  /** 樓層類型 */
  floorType: 'basement' | 'residential' | 'roof';
  /** 樓層順序 (數字越小越下面) */
  sortOrder: number;
  /** 此層戶數 */
  totalUnits: number;
  /** 車位起始號碼 (僅地下室有) */
  parkingSpaceStartNumber?: number;
  /** 車位結束號碼 (僅地下室有) */
  parkingSpaceEndNumber?: number;
  /** 備註 */
  description?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FloorConfigState {
  floors: FloorConfig[];
  loading: boolean;
  error: string | null;
}

// ==================== 戶別類型擴展 ====================

export interface UnitConfig {
  /** 戶別 ID */
  id: string;
  /** 所屬棟數 ID */
  buildingId: string;
  /** 所屬樓層 ID */
  floorId: string;
  /** 戶別編號 (如 A01, A02) */
  unitNumber: string;
  /** 戶別顯示名稱 (如 A-1F-01) */
  displayName: string;
  /** 戶別類型 */
  type: 'residential' | 'commercial' | 'mixed';
  /** 坪數 */
  size: number;
  /** 房間數 */
  bedrooms?: number;
  /** 衛浴數 */
  bathrooms?: number;
  /** 房屋狀態 */
  status: 'occupied' | 'vacant' | 'maintenance';
  /** 區權人姓名 */
  ownerName?: string;
  /** 住戶 ID */
  residentId?: string;
  /** 排序順序 */
  sortOrder: number;
  /** 備註 */
  description?: string;
  /** 管理費 (自動計算) */
  monthlyFee?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UnitConfigState {
  units: UnitConfig[];
  loading: boolean;
  error: string | null;
}

// ==================== 車位配置類型 ====================

export interface ParkingSpaceConfig {
  /** 車位 ID */
  id: string;
  /** 所屬棟數 ID */
  buildingId: string;
  /** 所屬樓層 ID */
  floorId: string;
  /** 車位號碼 */
  spaceNumber: string;
  /** 車位類型 */
  type: 'resident' | 'visitor' | 'reserved' | 'disabled' | 'monthly' | 'hourly';
  /** 狀態 */
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  /** 關聯戶別 ID (如果已認購/租用) */
  unitId?: string;
  /** 車牌號碼 */
  plateNumber?: string;
  /** 月租費 */
  monthlyFee?: number;
  /** 小時費率 (訪客車位) */
  hourlyRate?: number;
  /** 開始時間 */
  startTime?: Date | string;
  /** 結束時間 */
  endTime?: Date | string;
  /** 備註 */
  reason?: string;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ParkingSpaceConfigState {
  spaces: ParkingSpaceConfig[];
  loading: boolean;
  error: string | null;
}

// ==================== 生成配置 ====================

export interface AutoGenerateConfig {
  /** 棟數 ID */
  buildingId: string;
  /** 生成樓層 */
  generateFloors: boolean;
  /** 生成戶別 */
  generateUnits: boolean;
  /** 生成車位 (僅地下室) */
  generateParkingSpaces: boolean;
  /** 車位號碼前綴 */
  parkingSpacePrefix?: string;
}

// ==================== 棟數-樓層-戶別關聯查詢 ====================

export interface BuildingWithDetails extends BuildingConfig {
  floors: FloorConfig[];
  units: UnitConfig[];
  parkingSpaces: ParkingSpaceConfig[];
}

export interface FloorWithDetails extends FloorConfig {
  building: BuildingConfig;
  units: UnitConfig[];
  parkingSpaces: ParkingSpaceConfig[];
}

export interface UnitWithDetails extends UnitConfig {
  building: BuildingConfig;
  floor: FloorConfig;
  parkingSpaces: ParkingSpaceConfig[];
}
