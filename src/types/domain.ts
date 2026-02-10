
export interface SystemUser {
  id: string;
  username: string;
  role: 'admin' | 'manager' | 'staff';
  permissions: string[];
  lastLogin?: Date | string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string | number | boolean;
  category: 'general' | 'colors' | 'fees' | 'access';
  description?: string;
  updatedAt: Date | string;
}


export interface Building {
  id: string;
  name: string;
  buildingCode: string;
  address: string;
  totalFloors: number;
  totalUnits: number;
  sortOrder: number;
  description?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Floor {
  id: string;
  buildingId: string;
  floorNumber: string;
  name: string;
  floorType: 'roof' | 'residential' | 'basement';
  totalUnits: number;
  sortOrder: number;
  description?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Unit {
  id: string;
  floorId: string;
  buildingId: string;
  unitNumber: string;
  /** 戶別顯示名稱 (如 A-1F-01) */
  displayName?: string;
  type: 'residential' | 'commercial' | 'mixed';
  size: number;
  bedrooms?: number;
  bathrooms?: number;
  ownerName?: string;
  residentId?: string;
  /** 排序順序 */
  sortOrder?: number;
  /** 備註 */
  description?: string;
  status: 'occupied' | 'vacant' | 'maintenance';
  monthlyFee?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}


export interface Member {
  name: string;
  relationship: 'owner' | 'spouse' | 'child' | 'parent' | 'tenant' | 'other';
  idNumber: string;
  phone: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface AccessCard {
  id: string;
  residentId: string;
  cardNumber: string;
  memberId: string;
  status: 'active' | 'inactive' | 'lost' | 'expired';
  issuedDate: Date | string;
  expiryDate: Date | string;
  accessLevel: 'full' | 'limited' | 'visitor';
  reportedDate?: Date | string;
}

export interface LicensePlate {
  id: string;
  residentId: string;
  plateNumber: string;
  vehicleType: 'car' | 'motorcycle' | 'bicycle';
  ownerName: string;
  registrationDate: Date | string;
  status: 'active' | 'inactive' | 'pending';
}

export interface Resident {
  id: string;
  unitId: string;
  name: string;
  phone: string;
  email: string;
  members: Member[];
  moveInDate: Date | string;
  status: 'active' | 'inactive' | 'pending';
  emergencyContact?: EmergencyContact;
}

export interface ResidentStats {
  totalResidents: number;
  activeResidents: number;
  pendingResidents: number;
  totalMembers: number;
  activeAccessCards: number;
  expiredAccessCards: number;
  lostAccessCards: number;
  registeredPlates: number;
  pendingPlates: number;
}


export interface ParkingArea {
  id: string;
  name: string;
  totalSpaces: number;
  monthlyRate: number;
  visitorRate: number;
  description?: string;
}

export interface ParkingSpace {
  id: string;
  area: string;
  number: string;
  type: string; // Changed from literal union to string to support custom types
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  residentId?: string;
  plateNumber?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  monthlyFee?: number;
  hourlyRate?: number;
  reason?: string;
  reservedUntil?: Date | string;
  maintenanceUntil?: Date | string;

  // Refactored fields for ParkingSystem V2
  note?: string;
  occupantType?: 'owner' | 'custom_tenant' | 'resident_tenant';
  occupantName?: string;
  occupantBuildingId?: string;
  occupantUnitId?: string;
  licensePlates?: { number: string; note?: string }[];
}

export interface ParkingStats {
  total: number;
  occupied: number;
  available: number;
  reserved: number;
  maintenance: number;
  residentOccupied: number;
  visitorOccupied: number;
  monthlyRevenue: number;
  dailyRevenue: number;
}


export interface BookingRules {
  maxHoursPerBooking: number;
  maxBookingsPerDay: number;
  requiresApproval: boolean;
  advanceBookingDays?: number;
}

export interface Facility {
  id: string;
  name: string;
  type: 'recreation' | 'fitness' | 'meeting' | 'study' | 'other';
  capacity: number;
  description: string;
  location: string;
  buildingId?: string; // 所屬棟別ID
  operatingHours: {
    start: string;
    end: string;
  };
  amenities?: string[];
  hourlyRate?: number;
  bookingRules?: BookingRules;
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  maintenanceReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacilityBooking {
  id: string;
  facilityId: string;
  residentId: string;
  startTime: Date | string;
  endTime: Date | string;
  purpose: string;
  status: 'confirmed' | 'pending_approval' | 'cancelled' | 'completed';
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FacilityStats {
  totalFacilities: number;
  availableFacilities: number;
  totalBookings: number;
  todayBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  averageUtilizationRate: number;
}


export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'community' | 'maintenance' | 'security' | 'celebration' | 'meeting';
  date: Date | string;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  maxParticipants?: number;
  currentParticipants?: number;
  fee?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  tags: string[];
  images?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  residentId: string;
  registrationDate: Date | string;
  status: 'registered' | 'confirmed' | 'cancelled';
  paymentStatus?: 'paid' | 'pending' | 'refunded';
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalParticipants: number;
  averageAttendance: number;
  totalRevenue: number;
}


export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  category: 'community' | 'maintenance' | 'personal' | 'booking';
  location?: string;
  description?: string;
  color?: string;
  allDay?: boolean;
  resourceId?: string;
}

export interface CalendarView {
  currentView: 'month' | 'week' | 'day';
  currentDate: Date | string;
  selectedEvents: CalendarEvent[];
}


export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: 'rent' | 'deposit' | 'facility_fee' | 'parking' | 'maintenance' | 'utilities' | 'other';
  amount: number;
  description: string;
  date: Date | string;
  reference?: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'transfer' | 'credit_card' | 'check';
  residentId?: string;
  unitId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface DepositRecord {
  id: string;
  residentId: string;
  category: 'key' | 'money';
  amount: number;
  type: 'deposit' | 'refund' | 'adjustment';
  reason: string;
  date: Date | string;
  status: 'active' | 'refunded' | 'forfeited';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FinancialStats {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalDeposits: number;
  totalRefunds: number;
  pendingTransactions: number;
}


export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  recipientId?: string;
  recipientType?: 'all' | 'residents' | 'staff' | 'specific';
  read: boolean;
  createdAt: Date | string;
  expiresAt?: Date | string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'maintenance' | 'policy';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  authorId: string;
  authorName: string;
  targetAudience: 'all' | 'residents' | 'staff' | 'specific';
  status: 'draft' | 'published' | 'archived';
  publishDate?: Date | string;
  expiryDate?: Date | string;
  attachments?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}


export type PaginationParams = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
};

export type FilterOptions = {
  search?: string;
  status?: string;
  category?: string;
  dateRange?: {
    start: Date | string;
    end: Date | string;
  };
};


export interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'camera' | 'access_control' | 'meter';
  location: string;
  unitId?: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  lastSeen: Date | string;
  data: Record<string, any>;
  configuration: Record<string, any>;
}

export interface IoTEvent {
  id: string;
  deviceId: string;
  eventType: string;
  timestamp: Date | string;
  data: Record<string, any>;
  processed: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ==================== 區塊二：新類型定義 ====================
// 注意：避免與現有類型衝突，使用不同的命名

// 棟別設定類型 (替換現有的 Building)
export interface BuildingConfig {
  id: string;
  buildingCode: string;           // 棟別代號 (如 "A", "B") - 內部使用
  name: string;                   // 戶號 (如 "第一棟")
  houseNumberPrefix: string;       // 戶號前綴 (用於顯示和生成戶號)

  // 三區塊分開設定
  roofFloors: number;             // R樓數量 (如 1)
  residentialFloors: number;      // 居住層數量 (如 12)
  basementFloors: number;         // 地下室層數 (如 2)
  unitsPerFloor: number;          // 每層戶數 (如 4)

  // 戶別規則 (若有設定，則依照規則生成，忽略 unitsPerFloor)
  unitRules?: UnitRule[];

  // 計算屬性 (唯讀)
  totalFloors: number;            // 總樓層 = roof + residential + basement
  totalUnits: number;             // 總戶數 = residential * unitsPerFloor

  status: 'active' | 'inactive';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UnitRule {
  id: string;
  unitNumber: string; // 戶號 (如 "1", "01")
  code: string;       // 代號 (如 "A", "B")
}

// 戶別設定類型
export interface UnitConfig {
  id: string;
  buildingId: string;
  floorId: string;
  unitNumber: string;             // 完整編號 (如 "A-1F-01")
  floorNumber: string;            // 樓層 (如 "1F", "B1", "R1")
  floorType: 'residential' | 'roof' | 'basement';
  sortOrder: number;
  status: 'vacant' | 'occupied' | 'maintenance';  // 房屋狀態
  area?: number;                  // 坪數 (管理費用用)
  note?: string;
}

// 車位設定類型
export interface ParkingSpaceConfig {
  id: string;
  buildingId: string;
  floorId: string;               // 關聯地下室樓層
  areaId: string;                // 區域 (如 "A", "B")
  number: string;                // 車位編號 (如 "A-B1-001")
  type: 'resident' | 'visitor' | 'reserved' | 'disabled';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  monthlyFee?: number;
  note?: string;

  // 使用者資訊
  occupantType?: 'owner' | 'custom_tenant' | 'resident_tenant';
  occupantName?: string;         // 自訂承租人姓名 或 車位主姓名 (快照)
  occupantBuildingId?: string;   // 住戶承租 - 棟別
  occupantUnitId?: string;       // 住戶承租 - 戶別

  // 車牌 (支援多筆 + 備註)
  licensePlates?: { number: string; note?: string }[];
}

// 統一狀態顏色類型
export type StatusConfigType = 'parking' | 'calendar' | 'house' | 'lightMode' | 'darkMode';

export interface StatusConfig {
  id: string;
  type: StatusConfigType;
  name: string;                  // 狀態名稱
  color: string;                 // HEX 顏色
}

// 行事曆系統類型（區塊二）
export interface CalendarEventV2 {
  id: string;
  title: string;
  content: string;
  images: string[];
  startTime: Date | string;
  endTime?: Date | string;
  statusId: string;
  status?: CalendarStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
  isPast?: boolean;
}

export interface CalendarStatus {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

// 公設系統類型（區塊二）
export interface FacilityBookingV2 {
  id: string;
  facilityId: string;
  facility?: Facility;
  bookingType: 'resident' | 'other';
  // 住戶租借
  residentBuildingId?: string;
  residentFloorId?: string;
  residentUnitId?: string;
  residentName?: string;
  // 其他租借
  otherName?: string;
  // 預約資訊
  bookingDate: Date | string;
  startTime: string;
  endTime: string;
  staffName: string;
  // 狀態
  paymentStatus: 'paid' | 'unpaid';
  bookingStatus: 'confirmed' | 'cancelled' | 'deleted';
  // 備註
  notes?: string;
  // 日誌
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 住戶系統類型（區塊二）
export interface Tenant {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
}

export interface ResidentV2 {
  id: string;
  name?: string; // 增加相容性屬性
  unitId: string;
  unit?: Unit;
  // 房屋狀態
  statusId: string;
  status?: ResidentStatus;
  // 區權人
  ownerName: string;
  ownerPhone: string;
  ownerNotes?: string;
  // 成員名單
  members: Tenant[];
  // 承租人
  tenants: Tenant[];
  // 車牌（同步車位系統）
  licensePlates: string[];
  // 磁扣
  generalCards: { member: string; cardNumber: string }[];
  etcCards: { plate: string; cardNumber: string }[];
  otherEtcCards: { type: string; cardNumber: string }[];
  // 審計
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ResidentStatus {
  id?: string;
  name: string;
  color: string;
}

// 寄放系統類型（區塊二）
export interface DepositItem {
  id: string;
  unitId: string;
  unit?: Unit;
  type: 'key' | 'card';
  itemName: string;
  notes?: string;
  depositedAt: Date | string;
  depositedBy?: string;
  status: 'deposited' | 'retrieved';
  retrievedAt?: Date | string;
  retrievedBy?: string;
}

export interface DepositMoney {
  id: string;
  unitId: string;
  unit?: Unit;
  type: 'deposit' | 'payment';
  balance: number;
  transactions: MoneyTransaction[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MoneyTransaction {
  id: string;
  type: 'add' | 'subtract';
  amount: number;
  transactionDate: Date | string;
  collectedBy: string;
  notes?: string;
  createdAt: Date | string;
}

// 管理費額外項目類型
export interface FeeAdditionalItem {
  id: string;
  name: string;                    // 項目名稱（如：停車費、清潔費）
  amount: number;                  // 金額
  isRecurring: boolean;            // 是否每月固定
  note?: string;                   // 備註
}

// 管理費系統類型（區塊二）
export interface FeeUnit {
  id: string;
  unitId: string;
  unit?: Unit;
  area: number;                    // 坪數
  pricePerPing: number;            // 每坪價格
  totalFee: number;                // 總管理費（計算後）
  baseFee: number;                 // 基本管理費（坪數×單價）
  // 繳費狀態
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paymentDate?: Date | string;     // 繳款時間
  lastPaymentDate?: Date | string; // 上次繳款時間
  // 費用明細
  additionalItems: FeeAdditionalItem[];  // 額外付費項目
  additionalTotal: number;         // 額外項目總計
  // 備註
  notes?: string;                  // 備註項目
  paymentMethod?: 'cash' | 'transfer' | 'check' | 'credit_card';  // 繳款方式
  paymentNote?: string;            // 繳款備註
  // 特殊設定
  isSpecial: boolean;
  customArea?: number;
  customPrice?: number;
  // 審計
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 管理費設定（後台設定用）
export interface FeeConfig {
  buildingId: string;
  unitId: string;
  defaultPricePerPing: number;     // 預設每坪價格
  customPricePerPing?: number;     // 自定義每坪價格（可覆蓋預設）
  additionalItems: FeeAdditionalItem[];  // 該戶的額外項目設定
  isSpecial: boolean;              // 是否特殊設定
  note?: string;
}

// 操作日誌（區塊二）
export interface OperationLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  operator?: string;
  details?: string;
  timestamp: Date | string;
}

// ==================== 車位設定類型（區塊二擴充）====================

/**
 * 車位分區設定（小分頁）
 * 用於在每一棟每一層下建立自定義分區
 */
export interface ParkingZoneConfig {
  id: string;
  buildingId: string;
  floorId: string;
  name: string;                    // 分區名稱（如「住戶區」、「訪客區」、「機車區」）
  variableName: string;            // 變數名稱（用於後續引用，如residentZone、visitorZone）
  spaceCount: number;              // 該分區車位數量
  startNumber: number;             // 起始編號（從01開始）
  type: 'resident' | 'visitor' | 'motorcycle' | 'disabled' | 'reserved' | 'custom';
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * 車位樓層設定
 * 每一個B層對應一個設定
 */
export interface ParkingFloorConfig {
  floorId: string;
  floorNumber: string;             // B1, B2, B3...
  floorName: string;               // 地下室1樓, 地下室2樓...
  totalSpaces: number;             // 該層總車位數
  zones: ParkingZoneConfig[];      // 該層的分區設定
}

/**
 * 棟別車位設定
 * 每一棟對應一個設定，包含所有B層
 */
export interface BuildingParkingConfig {
  buildingId: string;
  buildingCode: string;            // 棟別代號（A, B, C）
  buildingName: string;            // 棟別名稱
  floorConfigs: ParkingFloorConfig[];  // 各樓層設定
}

/**
 * 車位設定頁面狀態
 */
export interface ParkingSettingsState {
  buildingConfigs: BuildingParkingConfig[];
  selectedBasementFloor: string | null;  // 當前選中的B層
  selectedBuildingId: string | null;     // 當前選中的棟別
  loading: boolean;
  error: string | null;
}