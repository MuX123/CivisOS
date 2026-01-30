# Supabase Google OAuth 設定指南

## 1. 前往 Supabase Dashboard
- 登入 [https://supabase.com/dashboard](https://supabase.com/dashboard)
- 選擇您的專案 (`hsyfpgorvclypzgmkhv2`)

## 2. 設定 Google OAuth 提供者

### 步驟 A：在 Supabase 中啟用 Google OAuth
1. 在左側菜單中點擊 **Authentication**
2. 點擊 **Providers** 標籤
3. 找到 **Google** 並點擊它
4. 將 **Enabled** 開關打開
5. 儲存設定

### 步驟 B：設定 Google Cloud Console
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 在左側菜單中選擇 **APIs & Services** > **Credentials**
4. 點擊 **+ CREATE CREDENTIALS** > **OAuth client ID**
5. 選擇 **Web application**
6. 在 **Authorized redirect URIs** 中添加：
   ```
   https://hsyfpgorvclypzgmkhv2.supabase.co/auth/v1/callback
   ```
7. 點擊 **Create**
8. 複製 **Client ID** 和 **Client Secret**

### 步驟 C：將 Google 憑證添加到 Supabase
1. 回到 Supabase Dashboard 的 Authentication > Providers > Google
2. 填入您從 Google Cloud Console 獲得的：
   - **Client ID**
   - **Client Secret**
3. 點擊 **Save**

## 3. 測試登入功能

完成以上設定後，您的 Google 登入功能就可以正常使用了。

### 測試步驟：
1. 啟動您的應用程式：`npm run dev`
2. 瀏覽到 `http://localhost:5173`
3. 點擊「使用 Google 帳號登入」按鈕
4. 選擇您的 Google 帳號並授權
5. 應該會成功登入並顯示用戶資訊

## 4. 環境變數設定（可選）

為了安全性，建議將 Supabase URL 和 Key 設定為環境變數：

### 創建 `.env.local` 文件：
```env
VITE_SUPABASE_URL=https://hsyfpgorvclypzgmkhv2.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzeWZwZ29ydmNseXB6Z21raHYyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MjU0MTcsImV4cCI6MjA4NTMwMTQxN30.DIvF1plerlPxxKFYdZ5NTdey8wk7IjecaXX9NXAn6jkg
```

### 更新 `src/lib/supabase.ts`：
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

## 注意事項

1. 確保您的 Google Cloud Console 專案已啟用 Google+ API
2. 測試時使用正確的網域名稱和端口
3. 生產環境需要使用 HTTPS
4. 定期檢查和更新您的 OAuth 憑證

## 故障排除

### 常見錯誤：
- **"redirect_uri_mismatch"**: 檢查 Google Cloud Console 中的重定向 URI 是否正確
- **"invalid_client"**: 確認 Client ID 和 Client Secret 是否正確
- **"access_denied"**: 檢查用戶是否拒絕了授權

### 除錯步驟：
1. 檢查瀏覽器開發者工具的 Console 和 Network 標籤
2. 確認 Supabase 專案設定正確
3. 驗證 Google OAuth 憑證有效
4. 檢查應用程式的 URL 配置

完成以上設定後，您的智慧社區管理系統就具備了完整的 Google 帳號登入功能！