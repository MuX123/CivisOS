-- CivisOS v1 到 v2 遷移腳本
-- 將本地存儲數據遷移到 Supabase PostgreSQL
-- 執行前請備份數據

-- =====================================================
-- 步驟 1: 創建新表結構 (見 schema-v2.sql)
-- =====================================================
-- 請先執行 scripts/schema-v2.sql 創建新表結構

-- =====================================================
-- 步驟 2: 從 localStorage 導出數據並遷移
-- =====================================================

-- 假設數據格式如下 (從 localStorage 導出):
-- localStorage.getItem('civisos_buildings')
-- localStorage.getItem('civisos_floors')
-- localStorage.getItem('civisos_units')
-- localStorage.getItem('civisos_parking_spaces')

-- 示例遷植函數 (在 Supabase SQL 編輯器中執行)

-- 遷移棟數數據
INSERT INTO buildings (
  id, name, building_code, address,
  basement_floors, residential_floors, roof_floors,
  units_per_floor, parking_spaces_per_basement_floor,
  parking_space_start_number, sort_order, description,
  created_at, updated_at
)
SELECT
  (data->>'id')::UUID,
  data->>'name',
  data->>'buildingCode',
  data->>'address',
  (data->>'totalBasementFloors')::INTEGER,
  (data->>'totalResidentialFloors')::INTEGER,
  (data->>'roofFloors')::INTEGER,
  (data->>'unitsPerFloor')::INTEGER,
  (data->>'parkingSpacesPerBasementFloor')::INTEGER,
  (data->>'parkingSpaceStartNumber')::INTEGER,
  (data->>'sortOrder')::INTEGER,
  data->>'description',
  COALESCE((data->>'createdAt')::TIMESTAMPTZ, NOW()),
  NOW()
FROM json_array_elements(
  (SELECT content FROM storage.objects WHERE name = 'buildings' LIMIT 1)::JSON
) AS data
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  building_code = EXCLUDED.building_code,
  basement_floors = EXCLUDED.basement_floors,
  residential_floors = EXCLUDED.residential_floors,
  roof_floors = EXCLUDED.roof_floors,
  updated_at = NOW();

-- =====================================================
-- 步驟 3: 創建遷移輔助函數
-- =====================================================

-- 從 localStorage JSON 遷移數據
CREATE OR REPLACE FUNCTION migrate_from_localstorage(
  storage_key TEXT,
  table_name TEXT,
  id_column TEXT DEFAULT 'id'
) RETURNS INTEGER AS $$
DECLARE
  json_data JSONB;
  row_count INTEGER := 0;
BEGIN
  -- 注意: 這個函數需要在應用層調用
  -- 從 localStorage 讀取 JSON 數據後批量插入
  RETURN row_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 步驟 4: 創建 RLS (Row Level Security) 策略
-- =====================================================

-- 啟用 RLS
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_bookings ENABLE ROW LEVEL SECURITY;

-- 創建 RLS 策略 (根據需求調整)
CREATE POLICY "Allow public read access" ON buildings
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON buildings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON buildings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 其他表的 RLS 策略類似...

-- =====================================================
-- 步驟 5: 創建 RPC 函數用於前端調用
-- =====================================================

-- 獲取棟數列表 (含樓層統計)
CREATE OR REPLACE FUNCTION get_buildings_with_stats()
RETURNS SETOF buildings_with_stats AS $$
  SELECT * FROM buildings_with_stats;
$$ LANGUAGE sql SECURITY DEFINER;

-- 獲取戶別完整資訊
CREATE OR REPLACE FUNCTION get_units_full_info(building_id UUID DEFAULT NULL)
RETURNS SETOF units_full_info AS $$
  SELECT * FROM units_full_info
  WHERE building_id = get_units_full_info.building_id OR get_units_full_info.building_id IS NULL;
$$ LANGUAGE sql SECURITY DEFINER;

-- 計算管理費
CREATE OR REPLACE FUNCTION calculate_fee(
  unit_id UUID,
  price_per_ping DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  unit_record units;
  result DECIMAL;
BEGIN
  SELECT * INTO unit_record FROM units WHERE id = calculate_fee.unit_id;
  IF unit_record.size IS NULL OR unit_record.size = 0 THEN
    result := 0;
  ELSE
    result := unit_record.size * price_per_ping;
  END IF;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 步驟 6: 創建邊界觸發器 (如需要)
-- =====================================================

-- 檢查樓層數量不超過限制
CREATE OR REPLACE FUNCTION check_floor_limit()
RETURNS TRIGGER AS $$
DECLARE
  max_floors INTEGER := 100;
  current_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM floors
  WHERE building_id = NEW.building_id;

  IF current_count >= max_floors THEN
    RAISE EXCEPTION '樓層數量不能超過 %', max_floors;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_floor_limit_trigger
  BEFORE INSERT ON floors
  FOR EACH ROW EXECUTE FUNCTION check_floor_limit();

-- =====================================================
-- 完成遷移
-- =====================================================

-- 驗證遷移結果
SELECT 'Buildings' as table_name, COUNT(*) as count FROM buildings
UNION ALL SELECT 'Floors', COUNT(*) FROM floors
UNION ALL SELECT 'Units', COUNT(*) FROM units
UNION ALL SELECT 'Parking Spaces', COUNT(*) FROM parking_spaces
UNION ALL SELECT 'Facilities', COUNT(*) FROM facilities
ORDER BY table_name;

-- 顯示遷移完成訊息
SELECT 'CivisOS v2 遷移完成！' as message, NOW() as completed_at;
