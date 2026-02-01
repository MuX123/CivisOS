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

// ==================== UI 主題顏色完整定義 ====================

export interface ThemeUIColors {
  // --- 背景色 ---
  /** 應用程式背景 (最底層) */
  bgPrimary: string;
  /** 側邊欄/次要背景 */
  bgSecondary: string;
  /** 內容區域背景 */
  bgTertiary: string;
  /** 卡片/區塊背景 */
  bgCard: string;
  /** 懸浮/彈窗背景 */
  bgFloating: string;
  /** 鼠標懸停背景 */
  bgHover: string;
  /** 點擊/活動狀態背景 */
  bgActive: string;

  // --- 文字顏色 ---
  /** 主要文字 */
  textNormal: string;
  /** 次要/提示文字 */
  textMuted: string;
  /** 標題文字 */
  textHeader: string;

  // --- 品牌色 ---
  /** 主品牌色 */
  brandPrimary: string;
  /** 品牌色懸停 */
  brandHover: string;
  /** 品牌色淺色變體 */
  brandLight: string;

  // --- 功能色 ---
  /** 成功 */
  success: string;
  /** 警告 */
  warning: string;
  /** 危險/錯誤 */
  danger: string;
  /** 資訊 */
  info: string;

  // --- 邊框 ---
  /** 一般邊框 */
  border: string;
  /** 淺色邊框 */
  borderLight: string;
}

// 為了相容性保留舊介面，但實際上我們會使用完整的 ThemeUIColors
export interface LightModeColors extends ThemeUIColors {
  // 兼容舊欄位 (可選)
  dataBg?: string; 
}

export interface DarkModeColors extends ThemeUIColors {
  // 兼容舊欄位 (可選)
  cardBg?: string;
  cardBorder?: string;
  text?: string;
  hoverBg?: string;
}

export const DEFAULT_LIGHT_MODE_COLORS: LightModeColors = {
  // --- 背景色 ---
  bgPrimary: '#ffffff',
  bgSecondary: '#ffffff',
  bgTertiary: '#f0f7ff',
  bgCard: '#ffffff',
  bgFloating: '#ffffff',
  bgHover: '#eff6ff',
  bgActive: '#dbeafe',

  // --- 文字顏色 ---
  textNormal: '#1e3a8a',
  textMuted: '#64748b',
  textHeader: '#1e40af',

  // --- 品牌色 ---
  brandPrimary: '#3b82f6',
  brandHover: '#2563eb',
  brandLight: '#60a5fa',

  // --- 功能色 ---
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',

  // --- 邊框 ---
  border: '#bfdbfe',
  borderLight: '#dbeafe',
  
  // 舊欄位映射
  dataBg: '#f0f7ff',
};

export const DEFAULT_DARK_MODE_COLORS: DarkModeColors = {
  // --- 背景色 ---
  bgPrimary: '#121212',
  bgSecondary: '#1a1a1a',
  bgTertiary: '#0f0f0f',
  bgCard: '#2f3136',
  bgFloating: '#2f3136',
  bgHover: '#36393f',
  bgActive: '#3f3f46',

  // --- 文字顏色 ---
  textNormal: '#b9bbbe',
  textMuted: '#a1a1aa',
  textHeader: '#f4f4f5',

  // --- 品牌色 ---
  brandPrimary: '#818cf8',
  brandHover: '#6366f1',
  brandLight: '#a5b4fc',

  // --- 功能色 ---
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  info: '#60a5fa',

  // --- 邊框 ---
  border: '#27272a',
  borderLight: '#3f3f46',

  // 舊欄位映射
  cardBg: '#2f3136',
  cardBorder: '#202225',
  text: '#b9bbbe',
  hoverBg: '#36393f',
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
  lightMode: LightModeColors;  // 明亮模式 UI 顏色
  darkMode: DarkModeColors;    // 深色模式 UI 顏色
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
  lightMode: DEFAULT_LIGHT_MODE_COLORS,
  darkMode: DEFAULT_DARK_MODE_COLORS,
};

// 狀態顏色類型標籤
export type StatusColorCategory = 'parking' | 'calendar' | 'unit' | 'facilityBooking' | 'facilityPayment' | 'lightMode' | 'darkMode';

export interface ColorPickerValue {
  category: StatusColorCategory;
  key: string;
  label: string;
  color: string;
}
