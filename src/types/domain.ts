
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
  type: 'resident' | 'visitor' | 'reserved' | 'disabled';
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
  operatingHours: {
    start: string;
    end: string;
  };
  amenities: string[];
  hourlyRate: number;
  bookingRules: BookingRules;
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  maintenanceReason?: string;
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

// 管理費系統類型（區塊二）
export interface FeeUnit {
  id: string;
  unitId: string;
  unit?: Unit;
  area: number;
  pricePerPing: number;
  totalFee: number;
  notes?: string;
  // 繳費狀態
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  lastPaymentDate?: Date | string;
  // 特殊設定
  isSpecial: boolean;
  customArea?: number;
  customPrice?: number;
  // 審計
  createdAt: Date | string;
  updatedAt: Date | string;
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