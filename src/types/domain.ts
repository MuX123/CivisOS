
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
  type: 'residential' | 'commercial' | 'mixed';
  size: number;
  bedrooms?: number;
  bathrooms?: number;
  ownerName?: string;
  residentId?: string;
  status: 'occupied' | 'vacant' | 'maintenance';
  monthlyFee: number;
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