# 後台設定 - AI 工作包

**交付目標**: 重構後台設定頁面，符合 NEW.txt 規格  
**依賴**: 無 (可獨立執行)  
**預估工作量**: 大

---

## 📋 工作項目

### 1. 棟數樓層設定 (BuildingFloorConfig)

**目標**: 實現三個區塊的棟數樓層設定

**需求規格**:
```
1. 設定棟數 樓層 R樓 居住層 地下室 分三個區塊
2. 增加戶別  設定完之後會自動把戶別登記到大樓格局配置
```

**具體實作**:

#### 1.1 修改 BuildingConfig 類型
```typescript
// src/types/domain.ts 新增
interface BuildingConfig {
  id: string
  buildingCode: string           // 棟別代號 (A, B, C...)
  name: string                   // 棟別名稱
  // 三區塊分開設定
  roofFloors: number             // R樓數量
  residentialFloors: number      // 居住層數量
  basementFloors: number         // 地下室層數
  unitsPerFloor: number          // 每層戶數
  // 計算屬性
  totalFloors: number            // 總樓層 = roof + residential + basement
  totalUnits: number             // 總戶數 = residential * unitsPerFloor
  // 狀態
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}
```

#### 1.2 三區塊 UI 配置
```tsx
// src/views/Backstage/BuildingFloorConfig.tsx

// 區塊 1: 棟數設定
<BuildingSection>
  <BuildingCard
    code="A"
    name="第一棟"
    roofFloors={1}
    residentialFloors={12}
    basementFloors={2}
    unitsPerFloor={4}
  />
  <BuildingCard
    code="B"
    name="第二棟"
    roofFloors={1}
    residentialFloors={10}
    basementFloors={1}
    unitsPerFloor={4}
  />
</BuildingSection>

// 區塊 2: R樓設定
<RoofFloorSection>
  <RoofCard floorNumber="R1" type="頂樓" />
  <RoofCard floorNumber="R2" type="頂樓" />
</RoofFloorSection>

// 區塊 3: 地下室設定
<BasementSection>
  <BasementCard floorNumber="B1" type="地下室" />
  <BasementCard floorNumber="B2" type="地下室" />
</BasementSection>
```

#### 1.3 自動生成邏輯
```typescript
// 設定完成後自動生成格局配置
function autoGenerateLayout(building: BuildingConfig) {
  // 生成居住層 (1F ~ residentialFloors)
  const residentialFloors = []
  for (let i = 1; i <= building.residentialFloors; i++) {
    residentialFloors.push({
      floorNumber: `${i}F`,
      floorType: 'residential',
      units: generateUnits(i, building.unitsPerFloor)
    })
  }

  // 生成 R樓
  const roofFloors = []
  for (let i = 1; i <= building.roofFloors; i++) {
    roofFloors.push({
      floorNumber: `R${i}`,
      floorType: 'roof',
      units: []  // R樓無住戶
    })
  }

  // 生成地下室
  const basementFloors = []
  for (let i = 1; i <= building.basementFloors; i++) {
    basementFloors.push({
      floorNumber: `B${i}`,
      floorType: 'basement',
      units: [],  // 地下室無住戶，車位另處理
      parkingSpaces: generateParkingSpaces(i, 20)  // 每層20車位
    })
  }

  return { residentialFloors, roofFloors, basementFloors }
}
```

---

### 2. 格局配置 (UnitLayoutManager)

**目標**: 自動生成 + 手動調整格局配置

**需求規格**:
```
3. 格局配置 雖然有自動輸入 但也可以手動加
```

**具體實作**:

#### 2.1 戶別資料結構
```typescript
interface UnitConfig {
  id: string
  buildingId: string
  floorId: string
  unitNumber: string        // e.g., "A01-1F-01" (棟別-樓層-戶號)
  floorNumber: string       // "1F", "2F", "B1"
  floorType: 'residential' | 'roof' | 'basement'
  sortOrder: number
  status: 'vacant' | 'occupied' | 'maintenance'  // 房屋狀態
  area?: number             // 坪數 (管理費用)
  note?: string             // 備註
}
```

#### 2.2 自動生成 + 手動調整
```tsx
// 自動生成按鈕
<Button onClick={() => autoGenerateUnits(building)}>
  自動生成格局
</Button>

// 手動添加戶別
<UnitCard>
  <UnitForm
    onAdd={(unit) => addManualUnit(unit)}
    onDelete={(unitId) => deleteUnit(unitId)}
    onMove={(unitId, direction) => moveUnit(unitId, direction)}
  />
</UnitCard>

// 拖放排序
<SortableUnits units={units} onReorder={handleReorder} />
```

---

### 3. 車位配置 (ParkingConfig)

**目標**: 依照地下室樓層自動生成車位

**需求規格**:
```
4. 車位配置  依照格局 設定的地下室樓層添加每層車位號碼
```

**具體實作**:

#### 3.1 車位資料結構
```typescript
interface ParkingSpaceConfig {
  id: string
  buildingId: string
  floorId: string           // 關聯地下室樓層
  areaId: string            // 區域 (A區、B區...)
  number: string            // e.g., "A01-B1-001" (區域-樓層-號碼)
  type: 'resident' | 'visitor' | 'reserved' | 'disabled'
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  monthlyFee?: number       // 月租費用
  note?: string
}
```

#### 3.2 自動生成車位
```typescript
function autoGenerateParkingSpaces(
  building: BuildingConfig,
  basementFloors: number,
  spacesPerFloor: number = 20,
  areas: string[] = ['A', 'B']
) {
  const parkingSpaces: ParkingSpaceConfig[] = []

  areas.forEach(area => {
    for (let floor = 1; floor <= basementFloors; floor++) {
      for (let i = 1; i <= spacesPerFloor; i++) {
        parkingSpaces.push({
          id: `${area}${building.buildingCode}-B${floor}-${String(i).padStart(3, '0')}`,
          buildingId: building.id,
          floorId: `B${floor}`,
          areaId: area,
          number: `${area}${building.buildingCode}-B${floor}-${String(i).padStart(3, '0')}`,
          type: area === 'A' ? 'resident' : 'visitor',
          status: 'available'
        })
      }
    }
  })

  return parkingSpaces
}
```

#### 3.3 UI 顯示
```tsx
<ParkingConfigPanel>
  {basementFloors.map(floor => (
    <FloorParkingSection floor={floor}>
      {areas.map(area => (
        <AreaParkingSection area={area}>
          <ParkingSpaceGrid
            spaces={getSpacesByAreaAndFloor(area, floor)}
            onEdit={handleEditSpace}
            onAdd={handleAddSpace}
            onDelete={handleDeleteSpace}
          />
        </AreaParkingSection>
      ))}
    </FloorParkingSection>
  ))}
</ParkingConfigPanel>
```

---

### 4. 公設設定 (FacilityConfig)

**目標**: 設定可預約的公設

**需求規格**:
```
5. 公設設定 於預約公設可以選擇
```

**具體實作**:

```typescript
interface FacilityConfig {
  id: string
  name: string              // e.g., "游泳池", "健身房"
  type: 'recreation' | 'fitness' | 'meeting' | 'study' | 'other'
  location: string          // 位置
  capacity: number          // 容納人數
  hourlyRate: number        // 每小時費用
  requiresApproval: boolean // 是否需要審批
  maxHoursPerBooking: number
  status: 'available' | 'maintenance' | 'unavailable'
  bookingRules: {
    advanceBookingDays: number
    maxBookingsPerDay: number
    cancellationHoursBefore: number
  }
}
```

---

### 5. 顏色狀態設定 (ColorConfigPanel)

**目標**: 統一管理車位/行事曆/房屋的狀態顏色

**需求規格**:
```
6. 顏色設定 可自訂以下的狀態  根據狀態 資料卡顯示的顏色會改變
   車位 / 行事曆 / 房屋狀態
```

**具體實作**:

#### 5.1 統一狀態類型
```typescript
// src/types/statusColor.ts

// 車位狀態
interface ParkingStatusConfig {
  id: string
  name: string              // e.g., "可租用", "已佔用", "保留", "維護中"
  color: string             // HEX 顏色
  type: 'parking'
}

// 行事曆狀態
interface CalendarStatusConfig {
  id: string
  name: string              // e.g., "一般", "重要", "緊急", "完成"
  color: string
  type: 'calendar'
}

// 房屋狀態
interface HouseStatusConfig {
  id: string
  name: string              // e.g., "空屋", "已入住", "裝修中"
  color: string
  type: 'house'
}

// 統一管理
type StatusConfig = ParkingStatusConfig | CalendarStatusConfig | HouseStatusConfig
```

#### 5.2 全域狀態 Store
```typescript
// src/store/modules/config.ts

interface ConfigState {
  parkingStatuses: ParkingStatusConfig[]
  calendarStatuses: CalendarStatusConfig[]
  houseStatuses: HouseStatusConfig[]
}

const configSlice = createSlice({
  name: 'config',
  initialState: {
    parkingStatuses: [
      { id: '1', name: '可租用', color: '#22c55e', type: 'parking' },
      { id: '2', name: '已佔用', color: '#ef4444', type: 'parking' },
      { id: '3', name: '保留', color: '#f59e0b', type: 'parking' },
      { id: '4', name: '維護中', color: '#6b7280', type: 'parking' },
    ],
    calendarStatuses: [
      { id: '1', name: '一般', color: '#6366f1', type: 'calendar' },
      { id: '2', name: '重要', color: '#f59e0b', type: 'calendar' },
      { id: '3', name: '緊急', color: '#ef4444', type: 'calendar' },
      { id: '4', name: '完成', color: '#22c55e', type: 'calendar' },
    ],
    houseStatuses: [
      { id: '1', name: '空屋', color: '#22c55e', type: 'house' },
      { id: '2', name: '已入住', color: '#3b82f6', type: 'house' },
      { id: '3', name: '裝修中', color: '#f59e0b', type: 'house' },
    ],
  },
  reducers: {
    updateStatus: (state, action: PayloadAction<{ type: string, id: string, color: string }>) => {
      const { type, id, color } = action.payload
      // 更新對應類型的狀態顏色
    },
    addStatus: (state, action: PayloadAction<StatusConfig>) => { /* ... */ },
    deleteStatus: (state, action: PayloadAction<{ type: string, id: string }>) => { /* ... */ },
  }
})
```

#### 5.3 UI 編輯器
```tsx
<ColorConfigPanel>
  <Section title="車位狀態">
    {parkingStatuses.map(status => (
      <ColorRow
        label={status.name}
        color={status.color}
        onChange={(color) => updateStatus('parking', status.id, color)}
      />
    ))}
  </Section>

  <Section title="行事曆狀態">
    {calendarStatuses      <ColorRow.map(status => (

        label={status.name}
        color={status.color}
        onChange={(color) => updateStatus('calendar', status.id, color)}
      />
    ))}
  </Section>

  <Section title="房屋狀態">
    {houseStatuses.map(status => (
      <ColorRow
        label={status.name}
        color={status.color}
        onChange={(color) => updateStatus('house', status.id, color)}
      />
    ))}
  </Section>
</ColorConfigPanel>
```

---

## 📁 相關檔案清單

### 需要修改的檔案

| 檔案 | 動作 | 說明 |
|------|------|------|
| `src/types/domain.ts` | 修改 | 新增 BuildingConfig, UnitConfig, ParkingSpaceConfig |
| `src/types/statusColor.ts` | 修改 | 統一狀態類型 |
| `src/store/modules/building.ts` | 修改 | 支援新資料結構 |
| `src/store/modules/config.ts` | 修改 | 新增狀態管理 |
| `src/views/Backstage/BuildingFloorConfig.tsx` | 重構 | 三區塊 UI |
| `src/views/Backstage/FloorManager.tsx` | 修改 | 支援三區塊 |
| `src/views/Backstage/UnitLayoutManager.tsx` | 修改 | 自動+手動生成 |
| `src/views/Backstage/ParkingConfig.tsx` | 新建 | 車位配置頁面 |
| `src/views/Backstage/ColorConfigPanel.tsx` | 重構 | 狀態整合 |
| `src/services/buildingService.ts` | 修改 | 自動生成邏輯 |

### 新增的檔案

| 檔案 | 說明 |
|------|------|
| `src/components/backstage/BuildingCard.tsx` | 棟別卡片組件 |
| `src/components/backstage/FloorCard.tsx` | 樓層卡片組件 |
| `src/components/backstage/UnitCard.tsx` | 戶別卡片組件 |
| `src/components/backstage/ParkingSpaceCard.tsx` | 車位卡片組件 |
| `src/components/backstage/ParkingSpaceGrid.tsx` | 車位網格組件 |

---

## ✅ 完成標準

1. [ ] BuildingFloorConfig 有明確的三區塊 UI
2. [ ] 新增棟數時自動生成 R樓/居住層/地下室
3. [ ] 設定完成後自動生成所有戶別
4. [ ] 設定完成後自動生成所有車位
5. [ ] 格局配置可手動調整 (增/刪/移動)
6. [ ] 車位配置依地下室樓層自動生成
7. [ ] ColorConfigPanel 可設定車位/行事曆/房屋三類狀態
8. [ ] 狀態顏色修改後即時更新到各前台模組
9. [ ] 所有狀態存入資料庫，支援持久化
10. [ ] 通過 ESLint 檢查，無 TypeScript 錯誤

---

## 🔗 交付給前台 AI 的接口

後台 AI 實作完成後，前台 AI 需要使用的資料:

```typescript
// 前台可直接使用的 Store 選擇器
const parkingStatuses = useAppSelector(state => state.config.parkingStatuses)
const calendarStatuses = useAppSelector(state => state.config.calendarStatuses)
const houseStatuses = useAppSelector(state => state.config.houseStatuses)

const buildings = useAppSelector(state => state.building.buildings)
const units = useAppSelector(state => state.unit.units)
const parkingSpaces = useAppSelector(state => state.parking.spaces)
```

**狀態改變時前台組件會自動重新渲染**
