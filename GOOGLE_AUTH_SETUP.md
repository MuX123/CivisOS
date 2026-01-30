# Google 登入設定指南

## 🔐 您的 Supabase 專案資訊

- **Supabase URL**: `https://hsyfpgorvclypzgmkhv2.supabase.co`
- **專案參考**: `hsyfpgorvclypzgmkhv2`

## ⚠️ 當前問題

Google 登入功能報錯是因為 **Supabase 後台尚未設定 Google OAuth**。

## 📋 設定步驟

### 1. 登入 Supabase Dashboard

前往：https://supabase.com/dashboard/project/hsyfpgorvclypzgmkhv2

### 2. 設定 Google OAuth Provider

1. 在左側選單找到 **Authentication** → **Providers**
2. 找到 **Google** provider
3. 啟用 Google provider

### 3. 取得 Google OAuth 憑證

您需要從 Google Cloud Console 取得憑證：

#### A. 前往 Google Cloud Console
https://console.cloud.google.com/

#### B. 建立或選擇專案
- 如果沒有專案，點擊「建立專案」
- 專案名稱建議：`CivisOS-Auth`

#### C. 啟用 Google+ API
1. 前往「API 和服務」→「程式庫」
2. 搜尋「Google+ API」
3. 點擊「啟用」

#### D. 建立 OAuth 2.0 憑證
1. 前往「API 和服務」→「憑證」
2. 點擊「建立憑證」→「OAuth 用戶端 ID」
3. 應用程式類型選擇：**網頁應用程式**
4. 名稱：`CivisOS Web Client`

#### E. 設定授權重新導向 URI

**重要！** 必須加入以下兩個網址：

```
https://hsyfpgorvclypzgmkhv2.supabase.co/auth/v1/callback
```

**本地開發**（可選）：
```
http://localhost:5173
```

**GitHub Pages**（部署後）：
```
https://[您的GitHub用戶名].github.io/CivisOS/
```

#### F. 取得憑證
完成後會得到：
- **Client ID**（用戶端 ID）
- **Client Secret**（用戶端密鑰）

### 4. 在 Supabase 中設定憑證

回到 Supabase Dashboard：

1. **Authentication** → **Providers** → **Google**
2. 啟用 Google provider
3. 填入：
   - **Client ID**：貼上 Google 提供的 Client ID
   - **Client Secret**：貼上 Google 提供的 Client Secret
4. 點擊 **Save**

### 5. 更新 Redirect URLs（如果需要）

在 Supabase 的 **Authentication** → **URL Configuration** 中：

- **Site URL**: 設定為您的主要網域
  - 開發：`http://localhost:5173`
  - 生產：`https://[您的GitHub用戶名].github.io/CivisOS/`

- **Redirect URLs**: 加入允許的重新導向網址
  ```
  http://localhost:5173
  https://[您的GitHub用戶名].github.io/CivisOS/
  ```

## ✅ 測試登入

設定完成後：

1. 重新整理您的應用程式
2. 點擊「使用 Google 帳號登入」
3. 應該會跳轉到 Google 登入頁面
4. 登入後會重新導向回您的應用程式

## 🔧 故障排除

### 錯誤：「redirect_uri_mismatch」
**原因**：Google OAuth 設定中的重新導向 URI 不正確
**解決**：確認 Google Cloud Console 中的授權重新導向 URI 包含：
```
https://hsyfpgorvclypzgmkhv2.supabase.co/auth/v1/callback
```

### 錯誤：「Invalid provider」
**原因**：Supabase 中 Google provider 未啟用
**解決**：在 Supabase Dashboard 啟用 Google provider

### 錯誤：「Missing client configuration」
**原因**：未在 Supabase 中設定 Google Client ID 和 Secret
**解決**：按照步驟 4 設定憑證

## 📝 注意事項

- ⚠️ **不要將 Client Secret 提交到 Git**（目前已在 `supabase.ts` 中使用環境變數是正確的）
- ✅ Supabase Anon Key 可以公開（已在程式碼中）
- 🔒 確保 Supabase 的 Row Level Security (RLS) 已正確設定

## 🎯 快速檢查清單

- [ ] 在 Google Cloud Console 建立 OAuth 2.0 憑證
- [ ] 設定正確的重新導向 URI
- [ ] 在 Supabase 啟用 Google provider
- [ ] 填入 Client ID 和 Client Secret
- [ ] 測試登入功能

完成這些步驟後，Google 登入應該就能正常運作了！
