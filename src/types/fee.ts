// src/types/fee.ts
// 管理費配置類型定義

// ==================== 管理費基礎配置 ====================

export interface FeeBaseConfig {
  /** 配置 ID */
  id: string;
  /** 棟數 ID (空值表示全局配置) */
  buildingId: string | null;
  /** 配置名稱 */
  name: string;
  /** 預設單價 (每坪多少錢) */
  pricePerPing: number;
  /** 預設坪數 (新戶預設值) */
  defaultSize: number;
  /** 是否啟用 */
  isActive: boolean;
  /** 備註 */
  description?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FeeBaseConfigState {
  configs: FeeBaseConfig[];
  loading: boolean;
  error: string | null;
}

// ==================== 特殊戶型設定 ====================

export interface SpecialFeeConfig {
  id: string;
  /** 棟數 ID */
  buildingId: string;
  /** 名稱 */
  name: string;
  /** 類型 */
  type: 'unit_range' | 'custom';
  /** 適用的戶別 ID 列表 (多選) */
  unitIds: string[];
  /** 自訂坪數 (type 為 custom 時使用) */
  customSize?: number;
  /** 自訂單價 (type 為 custom 時使用) */
  customPrice?: number;
  /** 備註 */
  description?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SpecialFeeConfigState {
  configs: SpecialFeeConfig[];
  loading: boolean;
  error: string | null;
}

// ==================== 戶別管理費詳情 ====================

export interface UnitFeeDetail {
  /** 戶別 ID */
  unitId: string;
  /** 棟數 ID */
  buildingId: string;
  /** 戶別編號 */
  unitNumber: string;
  /** 戶別顯示名稱 */
  displayName: string;
  /** 坪數 */
  size: number;
  /** 單價 */
  pricePerPing: number;
  /** 月費 */
  monthlyFee: number;
  /** 備註 */
  remark?: string;
  /** 計算來源 */
  source: 'default' | 'special' | 'manual';
  /** 特殊配置 ID (如果 source 為 special) */
  specialConfigId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UnitFeeDetailState {
  details: UnitFeeDetail[];
  loading: boolean;
  error: string | null;
}

// ==================== 管理費統計 ====================

export interface FeeStats {
  /** 總戶數 */
  totalUnits: number;
  /** 總月費收入 */
  totalMonthlyFee: number;
  /** 平均月費 */
  averageMonthlyFee: number;
  /** 最高月費 */
  maxMonthlyFee: number;
  /** 最低月費 */
  minMonthlyFee: number;
  /** 已設定坪數的戶數 */
  sizedUnits: number;
  /** 未設定坪數的戶數 */
  unsizedUnits: number;
}

// ==================== 管理費計算結果 ====================

export interface FeeCalculationResult {
  unitId: string;
  size: number;
  pricePerPing: number;
  monthlyFee: number;
  calculationMethod: 'default' | 'special' | 'manual';
  appliedConfig: {
    type: 'base' | 'special';
    id?: string;
    name?: string;
  };
}

// ==================== 繳款記錄 ====================

export interface PaymentRecord {
  id: string;
  unitId: string;
  unitNumber: string;
  buildingId: string;
  // 繳款資訊
  amount: number;
  paymentDate: Date | string;
  paymentMethod: 'cash' | 'transfer' | 'check' | 'credit_card' | 'other';
  // 週期資訊
  paymentPeriod: string; // 例如："2025-01", "2025-02"
  // 備註
  note?: string;
  // 操作資訊
  createdBy?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PaymentRecordState {
  records: PaymentRecord[];
  loading: boolean;
  error: string | null;
  // 搜尋和過濾
  searchQuery: string;
  filterBuildingId: string | null;
  filterPeriod: string | null;
  // 分頁
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}
