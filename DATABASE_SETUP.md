# Supabase 資料庫設定指南

## 📋 前置作業

1. 確保您已經完成 Google OAuth 設定 (參考 GOOGLE_OAUTH_SETUP.md)
2. 準備好 Supabase Dashboard 的管理員權限

## 🗄️ 執行資料庫架構

### 方法一：透過 Supabase Dashboard SQL Editor

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的專案 (`hsyfpgorvclypzgmkhv2`)
3. 在左側菜單點擊 **SQL Editor**
4. 點擊 **New query**
5. 將 `database/schema.sql` 文件的內容複製貼上
6. 點擊 **Run** 執行 SQL

### 方法二：使用 Supabase CLI (進階用戶)

```bash
# 安裝 Supabase CLI
npm install -g supabase

# 登入
supabase login

# 連結到專案
supabase link --project-ref hsyfpgorvclypzgmkhv2

# 推送架構
supabase db push database/schema.sql
```

## 📊 資料庫表結構說明

### 核心認證表
- **user_profiles**: 用戶檔案 (關聯 Google 認證)
- **auth.users**: Supabase 內建認證表 (自動生成)

### 社區管理表
- **buildings**: 建築物管理
- **floors**: 樓層管理  
- **units**: 住宅單位管理

### 住戶管理表
- **residents**: 住戶基本資訊
- **household_members**: 住戶成員
- **access_cards**: 門禁卡管理
- **license_plates**: 車輛牌照管理

### 停車管理表
- **parking_areas**: 停車區域
- **parking_spaces**: 停車位

### 設施管理表
- **facilities**: 設施資訊
- **facility_bookings**: 設施預約

### 社區活動表
- **community_events**: 社區活動
- **event_participants**: 活動參與者

### 財務管理表
- **transactions**: 交易日誌
- **deposit_records**: 押金記錄

### 通知管理表
- **notifications**: 系統通知
- **announcements**: 公告管理

### IoT 設備表
- **iot_devices**: IoT 設備管理
- **iot_events**: IoT 事件記錄

### 其他表
- **system_configs**: 系統設定
- **calendar_events**: 日曆事件

## 🔒 安全性設定

### 行級安全性 (RLS)
資料庫已啟用行級安全性，確保：

1. **用戶只能查看自己的檔案**
2. **住戶只能查看自己的資訊**  
3. **工作人員可以查看所有住戶資訊**
4. **用戶只能管理自己的預約**
5. **通知根據角色進行過濾**

### 權限角色
- **admin**: 系統管理員 (完整權限)
- **manager**: 社區經理 (管理權限)
- **staff**: 工作人員 (基本管理權限)
- **resident**: 住戶 (個人資訊權限)

## 🚀 驗證設定

### 1. 檢查資料表
在 SQL Editor 執行：
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 2. 檢查初始資料
```sql
SELECT * FROM buildings;
SELECT * FROM floors;
SELECT * FROM system_configs;
```

### 3. 測試用戶註冊
1. 啟動應用程式：`npm run dev`
2. 使用 Google 帳號登入
3. 檢查 `user_profiles` 表是否自動創建了用戶記錄

## 📝 常見問題

### Q: 執行 SQL 時出現錯誤
A: 檢查是否有權限執行 DDL 語句，確保使用正確的專案 ID

### Q: tsrange 函數錯誤
A: 已修復！添加了 `CREATE EXTENSION IF NOT EXISTS btree_gist;` 和使用 `tstzrange` 替代 `tsrange` 以支援 timestamp with time zone 欄位

### Q: 沒有看到 user_profiles 表
A: 確保執行了完整的 SQL 腳本，包含所有表的創建語句

### Q: Google 登入後沒有創建用戶檔案
A: 檢查 `user_profiles` 表的 RLS 政策是否正確設定

### Q: 無法查看停車資料
A: 檢查 RLS 政策和用戶角色設定

## 🔄 備份與恢復

### 自動備份
Supabase 提供自動每日備份，可在 Dashboard 查看

### 手動備份
```sql
-- 導出所有資料
pg_dump -h db.hsyfpgorvclypzgmkhv2.supabase.co -U postgres -d postgres > backup.sql
```

### 恢復資料
```sql
-- 恢復資料庫
psql -h db.hsyfpgorvclypzgmkhv2.supabase.co -U postgres -d postgres < backup.sql
```

## 📊 效能優化建議

1. **索引優化**: 已為常用查詢欄位建立索引
2. **查詢優化**: 使用 JOIN 減少查詢次數
3. **快取策略**: 考慮對靜態資料使用 Redis 快取
4. **資料分頁**: 大量資料使用分頁查詢

## 🛠️ 維護操作

### 定期維護
```sql
-- 清理過期通知
DELETE FROM notifications WHERE expires_at < NOW();

-- 清理舊的 IoT 事件 (保留 30 天)
DELETE FROM iot_events WHERE timestamp < NOW() - INTERVAL '30 days';

-- 更新統計資料
VACUUM ANALYZE;
```

### 監控查詢
```sql
-- 查看資料表大小
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;
```

完成以上設定後，您的智慧社區管理系統就具備了完整的資料庫支援！🎉