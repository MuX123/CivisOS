# 快速測試指南

## ✅ 確認自動 CSV 儲存正常運作

### 步驟 1：啟動桌面應用

```bash
npm run dev
```

這會啟動 Electron 桌面應用，視窗標題應該顯示 **"CivisOS 智慧社區管理系統"**

### 步驟 2：建立一些資料

1. 在應用程式中建立一些資料（例如：新增一棟建築）
2. 等待 1-2 秒

### 步驟 3：檢查 CSV 檔案

開啟檔案總管，前往：

**Windows**：
```
%APPDATA%\CivisOS\data\
```

或在命令提示字元：
```cmd
cd %APPDATA%\CivisOS\data\
dir
```

**macOS**：
```bash
cd ~/Library/Application\ Support/CivisOS/data/
ls -la
```

**Linux**：
```bash
cd ~/.config/CivisOS/data/
ls -la
```

### 步驟 4：確認檔案已建立

你應該看到類似以下的檔案：
```
buildings.csv
floors.csv
units.csv
parking_spaces.csv
residents.csv
...
```

### 步驟 5：用 Excel 開啟 CSV

1. 雙擊 `buildings.csv`
2. 應該正確顯示中文內容（UTF-8 BOM 編碼）

## 🧪 測試自動儲存

### 測試 1：修改資料後自動儲存

1. 在應用程式中修改資料
2. 等待 1 秒
3. 用記事本開啟對應的 CSV 檔案
4. 確認資料已更新

### 測試 2：重新啟動後資料還在

1. 關閉應用程式（Ctrl+Q 或 Cmd+Q）
2. 重新執行 `npm run dev`
3. 確認之前的資料都還在

### 測試 3：備份與還原

```bash
# Windows
mkdir D:\CivisOS_Backup
copy "%APPDATA%\CivisOS\data\*.csv" D:\CivisOS_Backup\

# 清除資料測試
rmdir /s "%APPDATA%\CivisOS\data"

# 還原資料
mkdir "%APPDATA%\CivisOS\data"
copy D:\CivisOS_Backup\*.csv "%APPDATA%\CivisOS\data\"
```

重新啟動應用程式，資料應該還原。

## 🔍 故障排除

### 問題 1：沒有看到 CSV 檔案

**檢查**：
```javascript
// 在 Electron 應用程式中按 F12 開啟 DevTools
// 在 Console 執行：
await window.electronAPI.app.getDataPath()
```

**確認**：
- 是否使用 `npm run dev`（不是 `npm run dev:web`）
- 是否有寫入權限
- 控制台是否有錯誤訊息

### 問題 2：中文顯示亂碼

**解決**：
- 使用 Excel 開啟（自動識別 UTF-8 BOM）
- 不要用記事本編輯 CSV

### 問題 3：資料沒有自動儲存

**檢查**：
1. 控制台是否有 `[ElectronAutoSave]` 日誌
2. 是否等待了至少 1 秒（防抖延遲）
3. 是否有錯誤訊息

### 問題 4：熱重載失效

**解決**：
```bash
# 重新啟動開發伺服器
npm run dev
```

## 📊 確認開發環境

執行以下命令檢查環境：

```bash
# 檢查 Electron
npx electron --version

# 檢查 Vite
npx vite --version

# 檢查所有依賴
npm list electron vite vite-plugin-electron
```

## ✅ 測試清單

- [ ] `npm run dev` 啟動 Electron 視窗
- [ ] 在應用程式中建立資料
- [ ] CSV 檔案自動產生
- [ ] Excel 可正確開啟 CSV
- [ ] 重新啟動後資料還在
- [ ] 修改資料後 CSV 自動更新
- [ ] 可手動備份 CSV 檔案

## 🎉 恭喜！

如果以上測試都通過，表示你的開發環境已正確設定，資料會自動儲存為 CSV 檔案！
