// src/types/statusColor.ts
// 狀態顏色配置類型定義

// ==================== 車位狀態顏色 ====================

export interface ParkingStatusColors {
  /** 可用 */
  available: string;
  /** 佔用中 */
  occupied: string;
  /** 預約中 */
  reserved: string;
  /** 維護中 */
  maintenance: string;
  /** 已出租 (租用標記) */
  rented: string;
}

export const DEFAULT_PARKING_STATUS_COLORS: ParkingStatusColors = {
  available: '#22c55e',      // 綠色
  occupied: '#ef4444',       // 紅色
  reserved: '#f59e0b',       // 橙色
  maintenance: '#6b7280',    // 灰色
  rented: '#3b82f6',         // 藍色 (租用车位標記)
};

// ==================== 行事曆狀態顏色 ====================

export interface CalendarStatusColors {
  /** 社區活動 */
  community: string;
  /** 設備維護 */
  maintenance: string;
  /** 安全演習 */
  security: string;
  /** 節慶慶祝 */
  celebration: string;
  /** 會議 */
  meeting: string;
  /** 一般提醒 */
  reminder: string;
}

export const DEFAULT_CALENDAR_STATUS_COLORS: CalendarStatusColors = {
  community: '#8b5cf6',      // 紫色
  maintenance: '#f59e0b',    // 橙色
  security: '#3b82f6',       // 藍色
  celebration: '#ec4899',    // 粉紅色
  meeting: '#06b6d4',        // 青色
  reminder: '#64748b',       // 灰藍色
};

// ==================== 房屋狀態顏色 ====================

export interface UnitStatusColors {
  /** 已入住 */
  occupied: string;
  /** 空屋 */
  vacant: string;
  /** 維護中 */
  maintenance: string;
  /** 待處理 */
  pending: string;
}

export const DEFAULT_UNIT_STATUS_COLORS: UnitStatusColors = {
  occupied: '#22c55e',       // 綠色
  vacant: '#94a3b8',         // 淺灰色
  maintenance: '#f59e0b',    // 橙色
  pending: '#3b82f6',        // 藍色
};

// ==================== 公設預約狀態顏色 ====================

export interface FacilityBookingStatusColors {
  /** 已確認 */
  confirmed: string;
  /** 待審核 */
  pending: string;
  /** 已取消 */
  cancelled: string;
  /** 已完成 */
  completed: string;
}

export const DEFAULT_FACILITY_BOOKING_STATUS_COLORS: FacilityBookingStatusColors = {
  confirmed: '#22c55e',      // 綠色
  pending: '#f59e0b',        // 橙色
  cancelled: '#ef4444',      // 紅色
  completed: '#6b7280',      // 灰色
};

export interface FacilityPaymentStatusColors {
  /** 已付款 */
  paid: string;
  /** 待付款 */
  pending: string;
  /** 已退款 */
  refunded: string;
}

export const DEFAULT_FACILITY_PAYMENT_STATUS_COLORS: FacilityPaymentStatusColors = {
  paid: '#22c55e',           // 綠色
  pending: '#f59e0b',        // 橙色
  refunded: '#6b7280',       // 灰色
};

// ==================== 完整顏色配置 ====================

export interface StatusColorConfig {
  id: string;
  name: string;
  isDefault: boolean;
  parking: ParkingStatusColors;
  calendar: CalendarStatusColors;
  unit: UnitStatusColors;
  facilityBooking: FacilityBookingStatusColors;
  facilityPayment: FacilityPaymentStatusColors;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StatusColorState {
  configs: StatusColorConfig[];
  activeConfigId: string | null;
  loading: boolean;
  error: string | null;
}

// 預設主題
export const DEFAULT_THEME: Omit<StatusColorConfig, 'id' | 'name' | 'isDefault' | 'createdAt' | 'updatedAt'> = {
  parking: DEFAULT_PARKING_STATUS_COLORS,
  calendar: DEFAULT_CALENDAR_STATUS_COLORS,
  unit: DEFAULT_UNIT_STATUS_COLORS,
  facilityBooking: DEFAULT_FACILITY_BOOKING_STATUS_COLORS,
  facilityPayment: DEFAULT_FACILITY_PAYMENT_STATUS_COLORS,
};

// 狀態顏色類型標籤
export type StatusColorCategory = 'parking' | 'calendar' | 'unit' | 'facilityBooking' | 'facilityPayment';

export interface ColorPickerValue {
  category: StatusColorCategory;
  key: string;
  label: string;
  color: string;
}
