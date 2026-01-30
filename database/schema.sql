CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'resident' CHECK (role IN ('admin', 'manager', 'staff', 'resident')),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  total_floors INTEGER NOT NULL DEFAULT 0,
  total_units INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL,
  name VARCHAR(50) NOT NULL,
  total_units INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(building_id, floor_number)
);

CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id UUID REFERENCES floors(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_number VARCHAR(20) NOT NULL,
  type VARCHAR(20) DEFAULT 'residential' CHECK (type IN ('residential', 'commercial', 'mixed')),
  size DECIMAL(8,2) NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  owner_name VARCHAR(100),
  resident_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'vacant' CHECK (status IN ('occupied', 'vacant', 'maintenance')),
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(building_id, unit_number)
);

CREATE TABLE IF NOT EXISTS residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  move_in_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  relationship VARCHAR(20) CHECK (relationship IN ('owner', 'spouse', 'child', 'parent', 'tenant', 'other')),
  id_number VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  member_id UUID REFERENCES household_members(id) ON DELETE CASCADE,
  card_number VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lost', 'expired')),
  issued_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  access_level VARCHAR(20) DEFAULT 'full' CHECK (access_level IN ('full', 'limited', 'visitor')),
  reported_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS license_plates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  plate_number VARCHAR(20) NOT NULL UNIQUE,
  vehicle_type VARCHAR(20) CHECK (vehicle_type IN ('car', 'motorcycle', 'bicycle')),
  owner_name VARCHAR(100) NOT NULL,
  registration_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parking_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  total_spaces INTEGER NOT NULL DEFAULT 0,
  monthly_rate DECIMAL(10,2) DEFAULT 0,
  visitor_rate DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parking_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID REFERENCES parking_areas(id) ON DELETE CASCADE,
  number VARCHAR(20) NOT NULL,
  type VARCHAR(20) DEFAULT 'resident' CHECK (type IN ('resident', 'visitor', 'reserved', 'disabled')),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  resident_id UUID REFERENCES residents(id) ON DELETE SET NULL,
  plate_number VARCHAR(20),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  reason TEXT,
  reserved_until TIMESTAMP WITH TIME ZONE,
  maintenance_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(area_id, number)
);

CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('recreation', 'fitness', 'meeting', 'study', 'other')),
  capacity INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  location VARCHAR(100),
  operating_start TIME NOT NULL DEFAULT '09:00:00',
  operating_end TIME NOT NULL DEFAULT '22:00:00',
  amenities TEXT[],
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  max_hours_per_booking INTEGER DEFAULT 4,
  max_bookings_per_day INTEGER DEFAULT 2,
  requires_approval BOOLEAN DEFAULT false,
  advance_booking_days INTEGER DEFAULT 7,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'unavailable')),
  maintenance_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facility_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  purpose VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending_approval', 'cancelled', 'completed')),
  total_amount DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT no_overlapping_bookings EXCLUDE USING GIST (
    facility_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  )
);

CREATE TABLE IF NOT EXISTS community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(20) CHECK (type IN ('community', 'maintenance', 'security', 'celebration', 'meeting')),
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(100),
  organizer VARCHAR(100),
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  fee DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  tags TEXT[],
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES community_events(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled')),
  payment_status VARCHAR(20) CHECK (payment_status IN ('paid', 'pending', 'refunded')),
  UNIQUE(event_id, resident_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) CHECK (type IN ('income', 'expense')),
  category VARCHAR(20) CHECK (category IN ('rent', 'deposit', 'facility_fee', 'parking', 'maintenance', 'utilities', 'other')),
  amount DECIMAL(12,2) NOT NULL,
  description VARCHAR(200) NOT NULL,
  transaction_date DATE NOT NULL,
  reference VARCHAR(100),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'transfer', 'credit_card', 'check')),
  resident_id UUID REFERENCES residents(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deposit_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  category VARCHAR(10) CHECK (category IN ('key', 'money')),
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('deposit', 'refund', 'adjustment')),
  reason VARCHAR(200) NOT NULL,
  record_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'refunded', 'forfeited')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) CHECK (type IN ('info', 'warning', 'success', 'error')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  recipient_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipient_type VARCHAR(20) DEFAULT 'all' CHECK (recipient_type IN ('all', 'residents', 'staff', 'specific')),
  read BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('general', 'urgent', 'maintenance', 'policy')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  author_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'residents', 'staff', 'specific')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  publish_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iot_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('sensor', 'actuator', 'camera', 'access_control', 'meter')),
  location VARCHAR(100) NOT NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'error', 'maintenance')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iot_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES iot_devices(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}',
  processed BOOLEAN DEFAULT false,
  severity VARCHAR(10) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  category VARCHAR(20) CHECK (category IN ('general', 'colors', 'fees', 'access')),
  description VARCHAR(200),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  category VARCHAR(20) CHECK (category IN ('community', 'maintenance', 'personal', 'booking')),
  location VARCHAR(100),
  description TEXT,
  color VARCHAR(7) DEFAULT '#3788d8',
  all_day BOOLEAN DEFAULT false,
  resource_id UUID,
  creator_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id ON user_profiles(auth_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_residents_user_id ON residents(user_id);
CREATE INDEX IF NOT EXISTS idx_residents_unit_id ON residents(unit_id);
CREATE INDEX IF NOT EXISTS idx_units_building_id ON units(building_id);
CREATE INDEX IF NOT EXISTS idx_units_floor_id ON units(floor_id);
CREATE INDEX IF NOT EXISTS idx_parking_spaces_area_id ON parking_spaces(area_id);
CREATE INDEX IF NOT EXISTS idx_parking_spaces_status ON parking_spaces(status);
CREATE INDEX IF NOT EXISTS idx_facility_bookings_facility_id ON facility_bookings(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_bookings_resident_id ON facility_bookings(resident_id);
CREATE INDEX IF NOT EXISTS idx_facility_bookings_start_time ON facility_bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_iot_events_device_id ON iot_events(device_id);
CREATE INDEX IF NOT EXISTS idx_iot_events_timestamp ON iot_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_creator_id ON calendar_events(creator_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_floors_updated_at BEFORE UPDATE ON floors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON residents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parking_areas_updated_at BEFORE UPDATE ON parking_areas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parking_spaces_updated_at BEFORE UPDATE ON parking_spaces 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facility_bookings_updated_at BEFORE UPDATE ON facility_bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_events_updated_at BEFORE UPDATE ON community_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deposit_records_updated_at BEFORE UPDATE ON deposit_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_iot_devices_updated_at BEFORE UPDATE ON iot_devices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_plates ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles 
    FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY "Users can update own profile" ON user_profiles 
    FOR UPDATE USING (auth_id = auth.uid());

CREATE POLICY "Residents can view own data" ON residents 
    FOR SELECT USING (user_id = (SELECT id FROM user_profiles WHERE auth_id = auth.uid()));

CREATE POLICY "Staff can view all residents" ON residents 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE auth_id = auth.uid() 
            AND role IN ('admin', 'manager', 'staff')
        )
    );

CREATE POLICY "Users can view own bookings" ON facility_bookings 
    FOR SELECT USING (
        resident_id IN (
            SELECT id FROM residents 
            WHERE user_id = (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
        )
    );

CREATE POLICY "Users can create own bookings" ON facility_bookings 
    FOR INSERT WITH CHECK (
        resident_id IN (
            SELECT id FROM residents 
            WHERE user_id = (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
        )
    );

CREATE POLICY "Users can view own notifications" ON notifications 
    FOR SELECT USING (
        recipient_id = (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
        OR recipient_type = 'all'
        OR (
            recipient_type = 'residents' 
            AND EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE auth_id = auth.uid() AND role = 'resident'
            )
        )
    );

INSERT INTO system_configs (key, value, category, description) VALUES
('app_name', '智慧社區管理系統', 'general', '應用程式名稱'),
('default_theme', 'light', 'general', '預設主題'),
('visitor_parking_rate', '50', 'fees', '訪客停車費率(元/小時)'),
('monthly_parking_rate', '2000', 'fees', '住戶停車月費'),
('facility_booking_deposit', '500', 'fees', '設施預約押金'),
('max_booking_hours', '4', 'general', '最大預約時數'),
('advance_booking_days', '7', 'general', '提前預約天數')
ON CONFLICT (key) DO NOTHING;

INSERT INTO buildings (name, address, total_floors, total_units) VALUES
('智慧大廈 A', '台北市信義區信義路五段7號', 12, 120),
('智慧大廈 B', '台北市信義區信義路五段15號', 8, 80)
ON CONFLICT DO NOTHING;

INSERT INTO floors (building_id, floor_number, name, total_units) 
SELECT 
    b.id,
    generate_series(1, b.total_floors) as floor_number,
    generate_series(1, b.total_floors) || 'F' as name,
    b.total_floors * 10 as total_units
FROM buildings b
ON CONFLICT DO NOTHING;