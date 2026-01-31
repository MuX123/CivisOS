// src/lib/schema.ts
// Supabase 資料庫 Schema 類型定義
// 用於程式化類型安全和自動完成

// 手動定義表格類型
export interface Building {
  id: string;
  name: string;
  building_code: string;
  address: string | null;
  basement_floors: number;
  residential_floors: number;
  roof_floors: number;
  units_per_floor: number;
  parking_spaces_per_basement_floor: number;
  parking_space_start_number: number;
  sort_order: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Floor {
  id: string;
  building_id: string;
  floor_number: string;
  name: string;
  floor_type: 'basement' | 'residential' | 'roof';
  sort_order: number;
  total_units: number;
  parking_space_start_number: number | null;
  parking_space_end_number: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  building_id: string;
  floor_id: string;
  unit_number: string;
  display_name: string;
  unit_type: 'residential' | 'commercial' | 'mixed';
  size: number;
  bedrooms: number | null;
  bathrooms: number | null;
  status: 'occupied' | 'vacant' | 'maintenance';
  owner_name: string | null;
  resident_id: string | null;
  sort_order: number;
  description: string | null;
  monthly_fee: number;
  created_at: string;
  updated_at: string;
}

export interface ParkingSpace {
  id: string;
  building_id: string;
  floor_id: string;
  space_number: string;
  space_type: 'resident' | 'visitor' | 'reserved' | 'disabled';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  unit_id: string | null;
  plate_number: string | null;
  monthly_fee: number | null;
  hourly_rate: number | null;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: string;
  name: string;
  facility_type: 'recreation' | 'fitness' | 'meeting' | 'study' | 'other';
  capacity: number;
  description: string | null;
  location: string | null;
  operating_start: string | null;
  operating_end: string | null;
  amenities: string[];
  hourly_rate: number;
  max_booking_hours: number;
  max_bookings_per_day: number;
  requires_approval: boolean;
  advance_booking_days: number;
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  maintenance_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface FacilityBooking {
  id: string;
  facility_id: string;
  resident_id: string | null;
  building_id: string | null;
  floor_id: string | null;
  unit_id: string | null;
  renter_type: 'resident' | 'tenant' | 'visitor' | 'other';
  renter_name: string | null;
  renter_phone: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose: string | null;
  status: 'confirmed' | 'pending_approval' | 'cancelled' | 'completed';
  payment_status: 'paid' | 'pending' | 'refunded';
  total_amount: number;
  notes: string | null;
  booked_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StatusColorConfig {
  id: string;
  name: string;
  is_default: boolean;
  parking_available: string;
  parking_occupied: string;
  parking_reserved: string;
  parking_maintenance: string;
  parking_rented: string;
  calendar_community: string;
  calendar_maintenance: string;
  calendar_security: string;
  calendar_celebration: string;
  calendar_meeting: string;
  calendar_reminder: string;
  unit_occupied: string;
  unit_vacant: string;
  unit_maintenance: string;
  unit_pending: string;
  facility_confirmed: string;
  facility_pending: string;
  facility_cancelled: string;
  facility_completed: string;
  facility_paid: string;
  facility_payment_pending: string;
  facility_refunded: string;
  created_at: string;
  updated_at: string;
}

export interface FeeBaseConfig {
  id: string;
  building_id: string | null;
  name: string;
  price_per_ping: number;
  default_size: number;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeeSpecialConfig {
  id: string;
  building_id: string;
  name: string;
  config_type: 'unit_range' | 'custom';
  unit_ids: string[];
  custom_size: number | null;
  custom_price: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface OperationLog {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  operator: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// 視圖類型
export interface BuildingWithStats extends Building {
  total_floors: number;
  total_units: number;
  total_parking_spaces: number;
  available_parking: number;
}

export interface UnitFullInfo extends Unit {
  building_name: string;
  building_code: string;
  floor_number: string;
  floor_type: string;
  floor_name: string;
  resident_name: string | null;
  resident_phone: string | null;
  parking_spaces: string[] | null;
}

// 所有表格類型
export type Tables = {
  buildings: Building;
  floors: Floor;
  units: Unit;
  parking_spaces: ParkingSpace;
  facilities: Facility;
  facility_bookings: FacilityBooking;
  status_color_configs: StatusColorConfig;
  fee_base_configs: FeeBaseConfig;
  fee_special_configs: FeeSpecialConfig;
  operation_logs: OperationLog;
};

// 表格名稱類型
export type TableName = keyof Tables;
