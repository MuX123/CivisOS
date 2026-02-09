# CSV 資料管理系統

本專案已整合 CSV 本地檔案存儲功能，可將所有資料匯出為 UTF-8 BOM 編碼的 CSV 檔案，並支援從 CSV 檔案匯入資料。

## 功能特色

- **UTF-8 BOM 編碼**：確保 Excel 正確顯示中文
- **分表存儲**：每個資料類型獨立一個 CSV 檔案
- **自動識別**：匯入時自動識別檔案類型
- **資料預覽**：匯入前可預覽資料筆數
- **批次處理**：支援同時匯入/匯出多個資料表

## 支援的資料表

| 資料表名稱 | 檔案名稱 | 說明 |
|-----------|---------|------|
| buildings | buildings.csv | 棟別資料 |
| floors | floors.csv | 樓層資料 |
| units | units.csv | 戶別資料 |
| parkingSpaces | parking_spaces.csv | 車位資料 |
| residents | residents.csv | 住戶資料 |
| residentStatuses | resident_statuses.csv | 住戶狀態 |
| facilities | facilities.csv | 設施資料 |
| facilityBookings | facility_bookings.csv | 設施預約 |
| calendarEvents | calendar_events.csv | 行事曆事件 |
| calendarStatuses | calendar_statuses.csv | 行事曆狀態 |
| depositItems | deposit_items.csv | 寄放項目 |
| feeUnits | fee_units.csv | 管理費資料 |
| feePeriods | fee_periods.csv | 繳費期數 |
| feeBaseConfigs | fee_base_configs.csv | 管理費基本設定 |
| feeSpecialConfigs | fee_special_configs.csv | 管理費特殊設定 |
| parkingStatuses | parking_statuses.csv | 車位狀態 |
| houseStatuses | house_statuses.csv | 房屋狀態 |

## 使用方法

### 1. 使用 CSVDataManager 組件

```tsx
import { CSVDataManager } from './components/data-management';

function SettingsPage() {
  return (
    <div>
      <h1>資料管理</h1>
      <CSVDataManager />
    </div>
  );
}
```

### 2. 使用 useCSVDataManager Hook

```tsx
import { useCSVDataManager } from './hooks/useCSVDataManager';

function MyComponent() {
  const {
    isLoading,
    exportTable,
    exportAll,
    exportSelected,
    importFile,
    tableNames,
    getTableLabel,
  } = useCSVDataManager({
    onSuccess: (msg) => console.log(msg),
    onError: (err) => console.error(err),
  });

  // 匯出單一資料表
  const handleExport = async () => {
    await exportTable('residents');
  };

  // 匯出所有資料表
  const handleExportAll = async () => {
    await exportAll();
  };

  // 匯出選中的資料表
  const handleExportSelected = async () => {
    await exportSelected(['buildings', 'units', 'residents']);
  };

  // 匯入檔案
  const handleImport = async (file: File) => {
    await importFile(file);
  };

  return (
    <div>
      <button onClick={handleExport} disabled={isLoading}>
        匯出住戶資料
      </button>
    </div>
  );
}
```

### 3. 直接使用 CSVStorageManager

```tsx
import { CSVStorageManager } from './services/CSVStorageManager';
import { useSelector } from 'react-redux';

function MyComponent() {
  const state = useSelector((state) => state);

  // 匯出資料表
  const handleExport = async () => {
    const result = await CSVStorageManager.exportTable(
      state,
      'residents',
      false // false = 自動下載, true = 顯示檔案選擇器
    );
    
    if (result.success) {
      console.log('匯出成功:', result.filename);
    }
  };

  // 從檔案匯入
  const handleFileSelect = async (file: File) => {
    const result = await CSVStorageManager.importTable(file);
    
    if (result.success) {
      console.log('識別為:', result.tableName);
      console.log('資料筆數:', result.data?.length);
      
      // 轉換為 Redux state 格式
      const stateUpdate = CSVStorageManager.convertToState(
        result.data!,
        result.tableName!
      );
      
      // dispatch 到 Redux store
      dispatch(someAction(stateUpdate));
    }
  };
}
```

### 4. 使用 Redux Store 的匯出方法

```tsx
import { store, exportToCSV, exportAllToCSV } from './store';

// 匯出單一資料表
const result = await exportToCSV(store.getState(), 'residents');

// 匯出所有資料表
const results = await exportAllToCSV(store.getState());
```

## CSV 檔案格式

### 編碼
- 使用 **UTF-8 BOM** 編碼，確保 Excel 正確顯示中文
- BOM 標記會自動添加/移除

### 分隔符號
- 使用逗號 (`,`) 作為分隔符號
- 包含特殊字符的欄位會自動用雙引號包圍

### 巢狀資料
- 陣列和物件會轉換為 JSON 字串存儲
- 匯入時會自動解析回原始格式

### 範例 CSV 內容

```csv
id,name,buildingCode,houseNumberPrefix,roofFloors,residentialFloors,basementFloors,unitsPerFloor,totalFloors,totalUnits,status,createdAt,updatedAt
123456,第一棟,A,A,1,12,2,4,15,48,active,2024-01-01T00:00:00.000Z,2024-01-01T00:00:00.000Z
```

## 注意事項

1. **瀏覽器限制**：由於瀏覽器安全限制，無法直接存取本地檔案系統
   - 匯出時會觸發檔案下載
   - 匯入時需要使用者手動選擇檔案
   - 支援 File System Access API 的瀏覽器會顯示檔案選擇器

2. **資料備份**：建議定期匯出資料作為備份

3. **資料合併**：匯入資料會**覆蓋**現有資料，請確認後再操作

4. **日期格式**：CSV 中的日期以 ISO 8601 格式存儲（如：2024-01-01T00:00:00.000Z）

## 瀏覽器相容性

- Chrome/Edge 86+（支援 File System Access API）
- Firefox（透過檔案下載/上傳）
- Safari（透過檔案下載/上傳）
