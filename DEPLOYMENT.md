# GitHub Pages 部署指南

## 已完成的配置

✅ **Vite 配置** (`vite.config.ts`)
- 已設定 `base: '/CivisOS/'` 用於 GitHub Pages
- 開發環境使用 `/`，生產環境使用 `/CivisOS/`

✅ **路由配置** (`main.tsx`)
- 已從 `BrowserRouter` 切換到 `HashRouter`
- HashRouter 使用 URL hash (#) 進行路由，與 GitHub Pages 完美相容

## 部署步驟

### 1. 建置專案
```bash
npm run build
```

### 2. 部署到 GitHub Pages

**方法 A: 使用 GitHub Actions (推薦)**

在 `.github/workflows/deploy.yml` 中已配置自動部署。
只需將程式碼推送到 `main` 分支即可自動部署。

**方法 B: 手動部署**

```bash
# 安裝 gh-pages
npm install -D gh-pages

# 部署 dist 資料夾到 gh-pages 分支
npx gh-pages -d dist
```

### 3. GitHub 設定

1. 前往 GitHub Repository Settings
2. 找到 "Pages" 設定
3. Source 選擇 `gh-pages` 分支
4. 儲存設定

### 4. 訪問網站

部署完成後，您的網站將可在以下網址訪問：
```
https://[您的用戶名].github.io/CivisOS/
```

## 重要提醒

⚠️ **本地開發**
- 本地開發時使用 `npm run dev`，路由會正常運作
- URL 格式：`http://localhost:5173/#/resident`

⚠️ **生產環境**
- GitHub Pages 上的 URL 格式：`https://xxx.github.io/CivisOS/#/resident`
- 使用 HashRouter 確保路由在靜態託管環境中正常運作

## 故障排除

### 問題：頁面全白
**原因**：base path 設定不正確
**解決**：確認 `vite.config.ts` 中的 `base` 設定與您的 repository 名稱一致

### 問題：路由不工作
**原因**：使用了 BrowserRouter
**解決**：已切換到 HashRouter，無需額外配置

### 問題：CSS/JS 載入失敗
**原因**：資源路徑錯誤
**解決**：確認已設定正確的 `base` path
