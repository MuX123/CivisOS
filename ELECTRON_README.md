# Electron 桌面應用程式

> ⚠️ **重要變更**：`npm run dev` 現在預設啟動 Electron 桌面應用，資料會自動儲存為 CSV 檔案！

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 開發模式（預設：桌面應用 + 自動 CSV 儲存）

```bash
npm run dev
```

這會啟動：
- ✅ Electron 桌面應用
- ✅ Vite 開發伺服器（支援 HMR 熱重載）
- ✅ 資料自動儲存為 CSV 檔案

**特點**：
- 🔄 修改 React 代碼 → 自動熱重載
- 🔄 修改 Electron 主進程 → 自動重啟
- 💾 資料變更 → 1秒後自動儲存 CSV
- 🚀 無需手動重啟應用程式

### 3. 網頁開發模式（瀏覽器 + LocalStorage）

```bash
npm run dev:web
```

這只啟動 Vite 開發伺服器，在瀏覽器中開啟，資料儲存在 localStorage。

### 4. 打包生產版本

```bash
# 打包為安裝程式
npm run electron:build

# 只打包為目錄（不解壓縮）
npm run electron:pack
```

打包後檔案位於 `dist` 目錄：
- Windows: `dist/CivisOS Setup 1.0.0.exe`
- macOS: `dist/CivisOS-1.0.0.dmg`
- Linux: `dist/CivisOS-1.0.0.AppImage`

## 資料儲存

### 自動儲存

Electron 版本會**自動儲存**資料到本地 CSV 檔案：

- 資料變更後 1 秒自動儲存
- CSV 檔案位於應用程式資料目錄
- UTF-8 BOM 編碼，支援 Excel 開啟

### 資料位置

| 平台 | 路徑 |
|------|------|
| Windows | `%APPDATA%\CivisOS\data\` |
| macOS | `~/Library/Application Support/CivisOS/data/` |
| Linux | `~/.config/CivisOS/data/` |

### 檔案列表

應用程式會自動建立以下 CSV 檔案：

- `buildings.csv` - 棟別資料
- `floors.csv` - 樓層資料
- `units.csv` - 戶別資料
- `parking_spaces.csv` - 車位資料
- `residents.csv` - 住戶資料
- `resident_statuses.csv` - 住戶狀態
- `facilities.csv` - 設施資料
- `facility_bookings.csv` - 設施預約
- `calendar_events.csv` - 行事曆事件
- `deposit_items.csv` - 寄放項目
- `fee_units.csv` - 管理費資料
- `fee_periods.csv` - 繳費期數
- `fee_base_configs.csv` - 管理費基本設定
- `fee_special_configs.csv` - 管理費特殊設定
- `parking_statuses.csv` - 車位狀態
- `house_statuses.csv` - 房屋狀態
- `calendar_statuses.csv` - 行事曆狀態

## 使用說明

### 第一次啟動

1. 執行 `npm run electron:dev`
2. Electron 視窗會自動開啟
3. 應用程式會載入既有的 CSV 資料（如果存在）
4. 開始使用，資料會自動儲存

### 日常開發

1. 執行 `npm run electron:dev`
2. 修改代碼 → 自動熱重載
3. 查看變化立即生效
4. 無需重新啟動

### 資料備份

CSV 檔案可以直接複製備份：

```bash
# Windows
copy "%APPDATA%\CivisOS\data\*.csv" D:\Backup\

# macOS/Linux
cp -r ~/Library/Application\ Support/CivisOS/data/*.csv ~/Backup/
```

### 資料還原

將備份的 CSV 檔案複製回資料目錄，重新啟動應用程式即可。

## 專案結構

```
CivisOS/
├── electron/               # Electron 相關檔案
│   ├── main.ts            # 主進程
│   ├── preload.ts         # Preload 腳本
│   └── types.d.ts         # 類型定義
├── src/
│   ├── services/
│   │   ├── ElectronFileStorage.ts   # 檔案儲存服務
│   │   └── CSVStorageManager.ts     # CSV 管理器
│   ├── hooks/
│   │   ├── useElectronAutoSave.ts   # 自動儲存 Hook
│   │   └── useElectronDataInit.ts   # 資料初始化 Hook
│   └── store/
│       └── middleware/
│           └── electronAutoSaveMiddleware.ts  # 自動儲存 Middleware
├── scripts/
│   └── electron-dev.js    # 開發啟動腳本
├── docs/
│   ├── ELECTRON_DEVELOPMENT.md   # 完整開發指南
│   └── CSV_DATA_MANAGEMENT.md    # CSV 資料管理說明
├── package.json
└── vite.config.ts
```

## 常見問題

### Q: 如何知道是否在 Electron 模式？

A: 查看控制台輸出或檢查 `window.electronAPI` 是否存在。

### Q: 資料沒有自動儲存？

A: 
1. 確認是在 Electron 模式（不是瀏覽器）
2. 檢查控制台是否有錯誤訊息
3. 確認資料目錄有寫入權限

### Q: 開發時如何除錯？

A:
- 開發模式會自動開啟 DevTools
- 使用 `Ctrl+Shift+I` 開啟/關閉開發者工具
- 查看 Console 分頁的日誌輸出

### Q: 如何清除所有資料？

A:
刪除資料目錄中的所有 CSV 檔案，重新啟動應用程式。

### Q: 可以同時在網頁版和桌面版使用嗎？

A:
可以，但資料不會自動同步。建議主要使用其中一個版本。

## 快捷鍵

| 快捷鍵 | 功能 |
|--------|------|
| `Ctrl+Shift+I` | 開啟/關閉開發者工具 |
| `Ctrl+R` | 重新整理頁面 |
| `F5` | 重新整理頁面 |
| `Ctrl+W` | 關閉視窗 |
| `Ctrl+Q` | 退出應用程式 |

## 支援平台

- ✅ Windows 10/11 (64-bit, 32-bit)
- ✅ macOS 10.14+ (Intel, Apple Silicon)
- ✅ Linux (Ubuntu 18.04+, Fedora 30+, Debian 10+)

## 注意事項

1. **首次啟動較慢**：Electron 需要初始化，首次啟動可能需要 10-30 秒
2. **防毒軟體**：部分防毒軟體可能誤報，請將應用程式加入白名單
3. **資料備份**：建議定期備份 CSV 檔案
4. **自動儲存**：資料變更後 1 秒自動儲存，關閉前請確認儲存完成

## 技術支援

詳細開發文件請參考：
- `docs/ELECTRON_DEVELOPMENT.md` - Electron 開發指南
- `docs/CSV_DATA_MANAGEMENT.md` - CSV 資料管理說明
