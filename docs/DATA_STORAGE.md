# 資料儲存機制說明

本專案現在**預設使用桌面應用模式**，資料會自動儲存為本地 CSV 檔案。

## 🎯 預設行為

### `npm run dev`（預設命令）

```bash
npm run dev
# ↓
# 啟動 Electron 桌面應用
# ↓
# 資料自動儲存到本地 CSV 檔案
```

**儲存流程**：
```
1. 使用者操作資料
   ↓
2. Redux State 更新
   ↓
3. electronAutoSaveMiddleware 攔截
   ↓
4. 防抖 1 秒後
   ↓
5. 寫入 CSV 檔案（UTF-8 BOM）
```

**儲存位置**：
- Windows: `%APPDATA%\CivisOS\data\*.csv`
- macOS: `~/Library/Application Support/CivisOS/data/*.csv`
- Linux: `~/.config/CivisOS/data/*.csv`

## 📋 命令對照表

| 命令 | 模式 | 儲存方式 | 用途 |
|------|------|----------|------|
| `npm run dev` | **Electron 桌面應用** | CSV 檔案（自動） | **預設使用** |
| `npm run dev:web` | 瀏覽器 | localStorage | 網頁開發測試 |
| `npm run electron:build` | 桌面應用安裝包 | CSV 檔案（自動） | 生產環境 |

## 💾 CSV 自動儲存詳情

### 哪些資料會儲存？

所有 Redux State 中的資料表都會自動儲存：

| 資料表 | CSV 檔案名稱 |
|--------|-------------|
| 棟別 | `buildings.csv` |
| 樓層 | `floors.csv` |
| 戶別 | `units.csv` |
| 車位 | `parking_spaces.csv` |
| 住戶 | `residents.csv` |
| 住戶狀態 | `resident_statuses.csv` |
| 設施 | `facilities.csv` |
| 設施預約 | `facility_bookings.csv` |
| 行事曆 | `calendar_events.csv` |
| 寄放項目 | `deposit_items.csv` |
| 管理費 | `fee_units.csv` |
| 繳費期數 | `fee_periods.csv` |
| 管理費設定 | `fee_base_configs.csv` |
| 特殊費用 | `fee_special_configs.csv` |

### 儲存時機

- **自動儲存**：資料變更後 1 秒自動儲存（防抖）
- **手動儲存**：可呼叫 `forceSave()` 立即儲存
- **關閉前**：建議確認所有資料已儲存

### 儲存格式

- **編碼**：UTF-8 BOM（Excel 可正確顯示中文）
- **分隔符號**：逗號
- **日期格式**：ISO 8601
- **巢狀資料**：JSON 字串

## 🔧 開發工作流程

### 第一次開啟

```bash
# 1. 啟動桌面應用
npm run dev

# 2. Electron 視窗自動開啟
# 3. 自動載入既有 CSV 資料（如果存在）
# 4. 開始使用，資料會自動儲存
```

### 日常開發

```bash
# 啟動（自動 CSV 儲存）
npm run dev

# 修改代碼 → 熱重載 → 查看變化
# 資料自動儲存到 CSV
```

### 備份資料

```bash
# Windows
copy "%APPDATA%\CivisOS\data\*.csv" D:\Backup\

# macOS
cp ~/Library/Application\ Support/CivisOS/data/*.csv ~/Backup/

# Linux
cp ~/.config/CivisOS/data/*.csv ~/Backup/
```

## ⚠️ 重要注意事項

### 1. 預設就是桌面應用

`npm run dev` 現在預設啟動 Electron，不是瀏覽器！

### 2. 資料位置

CSV 檔案儲存在應用程式資料目錄，不是在專案目錄中。

### 3. 與網頁版的區別

| 功能 | 桌面版 (`npm run dev`) | 網頁版 (`npm run dev:web`) |
|------|------------------------|---------------------------|
| 資料儲存 | CSV 檔案（自動） | localStorage |
| 離線使用 | ✅ 完全離線 | ✅ 可離線 |
| Excel 開啟 | ✅ 可直接開啟 CSV | ❌ 需匯出 |
| 檔案備份 | 直接複製 CSV | 需手動匯出 |

### 4. 開發時的資料

開發時產生的 CSV 檔案與生產環境相同格式，可以直接用於生產環境。

## 🐛 故障排除

### 資料沒有自動儲存？

1. 確認是使用 `npm run dev`（不是 `npm run dev:web`）
2. 檢查控制台是否有錯誤訊息
3. 確認資料目錄有寫入權限

### 找不到 CSV 檔案？

```javascript
// 在應用程式控制台執行
await window.electronAPI.app.getDataPath()
// 會回傳資料目錄路徑
```

### 需要清除所有資料？

刪除資料目錄中的所有 CSV 檔案：

```bash
# Windows
rmdir /s "%APPDATA%\CivisOS\data"

# macOS/Linux
rm -rf ~/Library/Application\ Support/CivisOS/data
```

## 📚 相關文件

- `ELECTRON_README.md` - Electron 開發完整指南
- `docs/ELECTRON_DEVELOPMENT.md` - 進階開發說明
- `docs/CSV_DATA_MANAGEMENT.md` - CSV 資料管理詳情
