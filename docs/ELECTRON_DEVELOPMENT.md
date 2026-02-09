# Electron 桌面應用開發指南

本專案已整合 Electron，可將網頁應用程式打包為桌面應用程式，實現真正的本地 CSV 檔案自動儲存。

## 功能特色

- **自動 CSV 儲存**：資料變更自動儲存到本地 CSV 檔案
- **熱重載開發**：開發時自動重新載入，無需手動重啟
- **離線使用**：完全離線運作，無需網路連接
- **原生檔案對話框**：使用系統原生檔案選擇器

## 開發環境

### 啟動 Electron 開發模式

```bash
# 使用 Electron 熱重載模式開發
npm run electron:dev
```

這會同時啟動：
1. Vite 開發伺服器（提供 HMR）
2. Electron 主進程
3. 渲染進程自動載入開發伺服器 URL

### 開發工作流程

1. **修改 React 代碼**：自動熱重載，無需重啟
2. **修改 Electron 主進程**：自動重啟 Electron
3. **修改 Preload 腳本**：自動重載

```
┌─────────────────────────────────────────────────────────┐
│  原始碼修改 → Vite HMR → Electron 自動重載 → 即時看到變化  │
└─────────────────────────────────────────────────────────┘
```

## 資料儲存位置

Electron 會將 CSV 檔案儲存在以下位置：

### Windows
```
%APPDATA%\CivisOS\data\
# 例如: C:\Users\<使用者名稱>\AppData\Roaming\CivisOS\data\
```

### macOS
```
~/Library/Application Support/CivisOS/data/
```

### Linux
```
~/.config/CivisOS/data/
```

## CSV 檔案列表

應用程式會自動建立以下 CSV 檔案：

| 檔案名稱 | 資料內容 |
|---------|---------|
| buildings.csv | 棟別資料 |
| floors.csv | 樓層資料 |
| units.csv | 戶別資料 |
| parking_spaces.csv | 車位資料 |
| residents.csv | 住戶資料 |
| resident_statuses.csv | 住戶狀態 |
| facilities.csv | 設施資料 |
| facility_bookings.csv | 設施預約 |
| calendar_events.csv | 行事曆事件 |
| deposit_items.csv | 寄放項目 |
| fee_units.csv | 管理費資料 |
| fee_periods.csv | 繳費期數 |
| fee_base_configs.csv | 管理費基本設定 |
| fee_special_configs.csv | 管理費特殊設定 |
| parking_statuses.csv | 車位狀態 |
| house_statuses.csv | 房屋狀態 |
| calendar_statuses.csv | 行事曆狀態 |

## API 使用方式

### 在 React 組件中使用

```tsx
import { useElectronAutoSave } from './hooks/useElectronAutoSave';
import { useElectronDataInit } from './hooks/useElectronDataInit';

function App() {
  // 自動儲存 Hook
  const { isElectronAvailable, isSaving, forceSave } = useElectronAutoSave({
    onSaveStart: () => console.log('開始儲存...'),
    onSaveComplete: () => console.log('儲存完成'),
    onSaveError: (err) => console.error('儲存失敗:', err),
  });

  // 資料初始化 Hook（載入 CSV 資料）
  const { isLoading, loadedTables } = useElectronDataInit({
    onComplete: () => console.log('資料載入完成'),
  });

  return (
    <div>
      {isElectronAvailable && <span>桌面模式</span>}
      {isSaving() && <span>儲存中...</span>}
    </div>
  );
}
```

### 使用 ElectronFileStorage 服務

```tsx
import { ElectronFileStorage } from './services/ElectronFileStorage';

// 檢查是否在 Electron 環境
if (ElectronFileStorage.checkAvailability()) {
  // 寫入檔案
  await ElectronFileStorage.writeFile('residents', residentsData);
  
  // 讀取檔案
  const data = await ElectronFileStorage.readFile('residents');
  
  // 列出所有檔案
  const files = await ElectronFileStorage.listFiles();
  
  // 匯出檔案（選擇位置）
  await ElectronFileStorage.exportFile('residents', residentsData);
  
  // 匯入檔案（選擇檔案）
  const imported = await ElectronFileStorage.importFiles();
}
```

## 打包生產版本

### 打包 Electron 應用程式

```bash
# 打包（會建立 dist 和 dist-electron 目錄）
npm run electron:build
```

打包後的應用程式位於：
- Windows: `dist/*.exe`
- macOS: `dist/*.dmg`
- Linux: `dist/*.AppImage`

## 專案結構

```
CivisOS/
├── electron/                     # Electron 相關檔案
│   ├── main.ts                  # 主進程入口
│   ├── preload.ts               # Preload 腳本
│   └── types.d.ts               # 類型定義
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
├── package.json
└── vite.config.ts
```

## 開發注意事項

### 1. 熱重載限制

- **Preload 腳本修改**：需要手動重新整理頁面
- **主進程修改**：會自動重啟 Electron
- **Renderer 進程**：完全支援 HMR

### 2. 檔案路徑

在 Electron 環境中，使用 `ElectronFileStorage` 而不是直接操作檔案系統，以確保路徑正確。

### 3. 資料同步

- 資料變更後會在 1 秒後自動儲存（防抖）
- 應用程式啟動時會自動載入 CSV 資料
- 資料格式與網頁版 localStorage 相容

### 4. 瀏覽器相容

當不在 Electron 環境時，系統會自動回退到 localStorage：

```tsx
if (ElectronFileStorage.checkAvailability()) {
  // 使用 Electron 檔案儲存
} else {
  // 回退到 localStorage
}
```

## 故障排除

### Electron 無法啟動

```bash
# 清除 node_modules 並重新安裝
rm -rf node_modules
npm install
```

### 檔案儲存失敗

1. 檢查應用程式是否有寫入權限
2. 確認資料目錄存在：`%APPDATA%/CivisOS/data/`
3. 查看控制台錯誤訊息

### 熱重載失效

1. 確認 `vite.config.ts` 中的 electron 插件配置正確
2. 檢查 `process.env.VITE_ELECTRON` 是否設置
3. 重新啟動開發伺服器

## 快捷鍵

在開發模式下，以下快捷鍵可用：

- `Ctrl+Shift+I` (Windows/Linux) 或 `Cmd+Option+I` (macOS)：開啟 DevTools
- `Ctrl+R` 或 `Cmd+R`：重新整理頁面
- `F5`：重新整理頁面

## 進階配置

### 修改儲存延遲時間

在 `electronAutoSaveMiddleware.ts` 中修改：

```typescript
const electronAutoSaveInstance = new ElectronAutoSaveMiddleware(2000); // 2 秒防抖
```

### 自定義資料目錄

在 `electron/main.ts` 中修改：

```typescript
const getDataPath = () => {
  // 自定義路徑
  return path.join(app.getPath('documents'), 'CivisOS_Data');
};
```
