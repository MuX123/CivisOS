-- CivisOS 資料庫 Schema (Supabase)
-- 版本: 2.0
-- 建立時間: 2024

-- =====================================================
-- 1. 棟數管理 (Buildings)
-- =====================================================
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,                    -- 棟數名稱 (如 A棟、B棟)
  building_code VARCHAR(10) NOT NULL UNIQUE,    -- 棟數代碼 (如 A, B)
  address TEXT,                                 -- 地址
  basement_floors INTEGER NOT NULL DEFAULT 0,   -- 地下室樓層數
  residential_floors INTEGER NOT NULL DEFAULT 1, -- 居住層樓層數
  roof_floors INTEGER NOT NULL DEFAULT 0,       -- R樓數量 (0 或 1)
  units_per_floor INTEGER NOT NULL DEFAULT 4,   -- 每層戶數
  parking_spaces_per_basement_floor INTEGER NOT NULL DEFAULT 10, -- 地下室每層車位數
  parking_space_start_number INTEGER NOT NULL DEFAULT 1, -- 車位起始號碼
  sort_order INTEGER NOT NULL DEFAULT 0,        -- 排序順序
  description TEXT,                             -- 備註
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_buildings_sort ON buildings(sort_order);
CREATE INDEX idx_buildings_code ON buildings(building_code);

-- =====================================================
-- 2. 樓層管理 (Floors)
-- =====================================================
CREATE TABLE IF NOT EXISTS floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  floor_number VARCHAR(10) NOT NULL,            -- 樓層編號 (B1, 1F, 2F, RF)
  name VARCHAR(50) NOT NULL,                    -- 樓層顯示名稱
  floor_type VARCHAR(20) NOT NULL,              -- 類型: basement, residential, roof
  sort_order INTEGER NOT NULL,                  -- 排序 (數字小在下面)
  total_units INTEGER NOT NULL DEFAULT 0,       -- 此層戶數
  parking_space_start_number INTEGER,           -- 車位起始號碼 (僅地下室)
  parking_space_end_number INTEGER,             -- 車位結束號碼 (僅地下室)
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_floors_building ON floors(building_id);
CREATE INDEX idx_floors_sort ON floors(building_id, sort_order);
CREATE INDEX idx_floors_type ON floors(floor_type);

-- =====================================================
-- 3. 戶別管理 (Units)
-- =====================================================
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
  unit_number VARCHAR(20) NOT NULL,             -- 戶別編號 (如 101, 102)
  display_name VARCHAR(50) NOT NULL,            -- 顯示名稱 (如 A-1F-01)
  unit_type VARCHAR(20) NOT NULL DEFAULT 'residential', -- residential, commercial, mixed
  size DECIMAL(10, 2) DEFAULT 0,                -- 坪數
  bedrooms INTEGER,                             -- 房間數
  bathrooms INTEGER,                            -- 衛浴數
  status VARCHAR(20) NOT NULL DEFAULT 'vacant', -- occupied, vacant, maintenance
  owner_name VARCHAR(100),                      -- 區權人姓名
  resident_id UUID,                             -- 關聯住戶 ID
  sort_order INTEGER NOT NULL DEFAULT 0,        -- 排序
  description TEXT,
  monthly_fee DECIMAL(10, 2) DEFAULT 0,         -- 管理費
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_units_building ON units(building_id);
CREATE INDEX idx_units_floor ON units(floor_id);
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_units_display ON units(display_name);

-- =====================================================
-- 4. 車位管理 (Parking Spaces)
-- =====================================================
CREATE TABLE IF NOT EXISTS parking_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
  space_number VARCHAR(20) NOT NULL,            -- 車位號碼 (如 A001)
  space_type VARCHAR(20) NOT NULL DEFAULT 'resident', -- resident, visitor, reserved, disabled
  status VARCHAR(20) NOT NULL DEFAULT 'available', -- available, occupied, reserved, maintenance
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL, -- 關聯戶別
  plate_number VARCHAR(20),                     -- 車牌號碼
  monthly_fee DECIMAL(10, 2),                   -- 月租費
  hourly_rate DECIMAL(10, 2),                  -- 小時費率
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  reason TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_parking_building ON parking_spaces(building_id);
CREATE INDEX idx_parking_floor ON parking_spaces(floor_id);
CREATE INDEX idx_parking_status ON parking_spaces(status);
CREATE INDEX idx_parking_unit ON parking_spaces(unit_id);

-- =====================================================
-- 5. 公設管理 (Facilities)
-- =====================================================
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,                   -- 公設名稱
  facility_type VARCHAR(30) NOT NULL,           -- recreation, fitness, meeting, study, other
  capacity INTEGER NOT NULL DEFAULT 10,         -- 容納人數
  description TEXT,
  location VARCHAR(100),                        -- 位置
  operating_start TIME,                         -- 開放開始時間
  operating_end TIME,                           -- 開放結束時間
  amenities TEXT[],                             -- 設施列表
  hourly_rate DECIMAL(10, 2) DEFAULT 0,         -- 每小時費用
  max_booking_hours INTEGER DEFAULT 2,          -- 最大預約時數
  max_bookings_per_day INTEGER DEFAULT 1,       -- 每日最多預約次數
  requires_approval BOOLEAN DEFAULT FALSE,      -- 是否需要審核
  advance_booking_days INTEGER DEFAULT 7,       -- 提前預約天數
  status VARCHAR(20) NOT NULL DEFAULT 'available', -- available, occupied, maintenance, unavailable
  maintenance_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_facilities_type ON facilities(facility_type);
CREATE INDEX idx_facilities_status ON facilities(status);

-- =====================================================
-- 6. 公設預約 (Facility Bookings)
-- =====================================================
CREATE TABLE IF NOT EXISTS facility_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE SET NULL,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  floor_id UUID REFERENCES floors(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  renter_type VARCHAR(20) NOT NULL,             -- resident, tenant, visitor, other
  renter_name VARCHAR(100),                     -- 租借人姓名
  renter_phone VARCHAR(20),                     -- 租借人電話
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  purpose TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending_approval', -- confirmed, pending_approval, cancelled, completed
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- paid, pending, refunded
  total_amount DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  booked_by VARCHAR(100),                       -- 預約人 (工作人員)
  approved_by VARCHAR(100),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_bookings_facility ON facility_bookings(facility_id);
CREATE INDEX idx_bookings_date ON facility_bookings(booking_date);
CREATE INDEX idx_bookings_status ON facility_bookings(status);
CREATE INDEX idx_bookings_payment ON facility_bookings(payment_status);

-- =====================================================
-- 7. 狀態顏色配置 (Status Colors)
-- =====================================================
CREATE TABLE IF NOT EXISTS status_color_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,                    -- 配置名稱
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- 車位狀態顏色
  parking_available VARCHAR(20) DEFAULT '#22c55e',
  parking_occupied VARCHAR(20) DEFAULT '#ef4444',
  parking_reserved VARCHAR(20) DEFAULT '#f59e0b',
  parking_maintenance VARCHAR(20) DEFAULT '#6b7280',
  parking_rented VARCHAR(20) DEFAULT '#3b82f6',
  
  -- 行事曆狀態顏色
  calendar_community VARCHAR(20) DEFAULT '#8b5cf6',
  calendar_maintenance VARCHAR(20) DEFAULT '#f59e0b',
  calendar_security VARCHAR(20) DEFAULT '#3b82f6',
  calendar_celebration VARCHAR(20) DEFAULT '#ec4899',
  calendar_meeting VARCHAR(20) DEFAULT '#06b6d4',
  calendar_reminder VARCHAR(20) DEFAULT '#64748b',
  
  -- 房屋狀態顏色
  unit_occupied VARCHAR(20) DEFAULT '#22c55e',
  unit_vacant VARCHAR(20) DEFAULT '#94a3b8',
  unit_maintenance VARCHAR(20) DEFAULT '#f59e0b',
  unit_pending VARCHAR(20) DEFAULT '#3b82f6',
  
  -- 公設預約狀態顏色
  facility_confirmed VARCHAR(20) DEFAULT '#22c55e',
  facility_pending VARCHAR(20) DEFAULT '#f59e0b',
  facility_cancelled VARCHAR(20) DEFAULT '#ef4444',
  facility_completed VARCHAR(20) DEFAULT '#6b7280',
  
  -- 公設付款狀態顏色
  facility_paid VARCHAR(20) DEFAULT '#22c55e',
  facility_payment_pending VARCHAR(20) DEFAULT '#f59e0b',
  facility_refunded VARCHAR(20) DEFAULT '#6b7280',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 插入預設配置
INSERT INTO status_color_configs (name, is_default) VALUES ('預設主題', TRUE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. 管理費配置 (Fee Config)
-- =====================================================
CREATE TABLE IF NOT EXISTS fee_base_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  name VARCHAR(50) NOT NULL,                    -- 配置名稱
  price_per_ping DECIMAL(10, 2) NOT NULL,      -- 每坪單價
  default_size DECIMAL(10, 2) NOT NULL DEFAULT 30, -- 預設坪數
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 特殊戶型配置
CREATE TABLE IF NOT EXISTS fee_special_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  config_type VARCHAR(20) NOT NULL,            -- unit_range, custom
  unit_ids UUID[],                             -- 適用的戶別 ID 列表
  custom_size DECIMAL(10, 2),                  -- 自訂坪數
  custom_price DECIMAL(10, 2),                 -- 自訂單價
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 9. 住戶資料 (Residents) - 已存在，補充欄位
-- =====================================================
ALTER TABLE residents ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES units(id) ON DELETE SET NULL;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS move_in_date DATE;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS move_out_date DATE;

-- =====================================================
-- 10. 操作日誌 (Operation Logs)
-- =====================================================
CREATE TABLE IF NOT EXISTS operation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(50) NOT NULL,                 -- 操作類型
  target_type VARCHAR(50) NOT NULL,            -- 目標類型
  target_id UUID NOT NULL,                     -- 目標 ID
  operator VARCHAR(100),                       -- 操作人
  details JSONB,                               -- 詳情
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_logs_target ON operation_logs(target_type, target_id);
CREATE INDEX idx_logs_action ON operation_logs(action);
CREATE INDEX idx_logs_created ON operation_logs(created_at);

-- =====================================================
-- 觸發器: 自動更新 updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 為各表添加 updated_at 觸發器
CREATE TRIGGER update_buildings_updated BEFORE UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_floors_updated BEFORE UPDATE ON floors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parking_updated BEFORE UPDATE ON parking_spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated BEFORE UPDATE ON facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated BEFORE UPDATE ON facility_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_status_colors_updated BEFORE UPDATE ON status_color_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fee_configs_updated BEFORE UPDATE ON fee_base_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_special_configs_updated BEFORE UPDATE ON fee_special_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 視圖: 棟數含樓層統計
-- =====================================================
CREATE OR REPLACE VIEW buildings_with_stats AS
SELECT
  b.*,
  COUNT(DISTINCT f.id) as total_floors,
  COUNT(DISTINCT u.id) as total_units,
  COUNT(DISTINCT p.id) as total_parking_spaces,
  COUNT(DISTINCT CASE WHEN p.status = 'available' THEN p.id END) as available_parking
FROM buildings b
LEFT JOIN floors f ON f.building_id = b.id
LEFT JOIN units u ON u.building_id = b.id
LEFT JOIN parking_spaces p ON p.building_id = b.id
GROUP BY b.id;

-- =====================================================
-- 視圖: 戶別完整資訊
-- =====================================================
CREATE OR REPLACE VIEW units_full_info AS
SELECT
  u.*,
  b.name as building_name,
  b.building_code,
  f.floor_number,
  f.floor_type,
  f.name as floor_name,
  r.name as resident_name,
  r.phone as resident_phone,
  (SELECT ARRAY_AGG(ps.space_number) FROM parking_spaces ps WHERE ps.unit_id = u.id) as parking_spaces
FROM units u
LEFT JOIN buildings b ON b.id = u.building_id
LEFT JOIN floors f ON f.id = u.floor_id
LEFT JOIN residents r ON r.id = u.resident_id;
