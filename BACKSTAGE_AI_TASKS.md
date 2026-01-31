# 🚀 後台 AI - 工作任務書

## 📋 專案背景

這是 **CivisOS 智慧社區管理系統** 的後台設定模組。你需要實作一個後台管理介面，讓管理員可以設定：

1. **棟數與樓層** - 設定大樓的棟別、R樓、居住層、地下室
2. **格局配置** - 自動/手動生成住戶戶別
3. **車位配置** - 依地下室樓層自動生成車位
4. **公設設定** - 設定可預約的公共設施
5. **顏色狀態** - 統一管理車位/行事曆/房屋的狀態顏色

---

## 🎯 你的工作清單

### 任務 1: 修改資料類型定義

**檔案**: `src/types/domain.ts`

新增以下類型：

```typescript
// 棟別設定類型 (替換現有的 Building)
interface BuildingConfig {
  id: string
  buildingCode: string           // 棟別代號 (如 "A", "B")
  name: string                   // 棟別名稱 (如 "第一棟")
  
  // 三區塊分開設定
  roofFloors: number             // R樓數量 (如 1)
  residentialFloors: number      // 居住層數量 (如 12)
  basementFloors: number         // 地下室層數 (如 2)
  unitsPerFloor: number          // 每層戶數 (如 4)
  
  // 計算屬性 (唯讀)
  totalFloors: number            // 總樓層 = roof + residential + basement
  totalUnits: number             // 總戶數 = residential * unitsPerFloor
  
  status: 'active' | 'inactive'
  createdAt: Date | string
  updatedAt: Date | string
}

// 戶別設定類型
interface UnitConfig {
  id: string
  buildingId: string
  floorId: string
  unitNumber: string             // 完整編號 (如 "A-1F-01")
  floorNumber: string            // 樓層 (如 "1F", "B1", "R1")
  floorType: 'residential' | 'roof' | 'basement'
  sortOrder: number
  status: 'vacant' | 'occupied' | 'maintenance'  // 房屋狀態
  area?: number                  // 坪數 (管理費用用)
  note?: string
}

// 車位設定類型
interface ParkingSpaceConfig {
  id: string
  buildingId: string
  floorId: string               // 關聯地下室樓層
  areaId: string                // 區域 (如 "A", "B")
  number: string                // 車位編號 (如 "A-B1-001")
  type: 'resident' | 'visitor' | 'reserved' | 'disabled'
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  monthlyFee?: number
  note?: string
}

// 統一狀態顏色類型
type StatusConfigType = 'parking' | 'calendar' | 'house'

interface StatusConfig {
  id: string
  type: StatusConfigType
  name: string                  // 狀態名稱
  color: string                 // HEX 顏色
}
```

---

### 任務 2: 新增 Redux Store 模組

**新增檔案**: `src/store/modules/config.ts`

```typescript
// 狀態管理 - 統一管理所有狀態顏色
interface ConfigState {
  parkingStatuses: StatusConfig[]   // 車位狀態
  calendarStatuses: StatusConfig[]  // 行事曆狀態
  houseStatuses: StatusConfig[]     // 房屋狀態
  
  // 預設值
  defaultParkingStatuses: StatusConfig[]
  defaultCalendarStatuses: StatusConfig[]
  defaultHouseStatuses: StatusConfig[]
}

const initialState: ConfigState = {
  parkingStatuses: [
    { id: '1', type: 'parking', name: '可租用', color: '#22c55e' },
    { id: '2', type: 'parking', name: '已佔用', color: '#ef4444' },
    { id: '3', type: 'parking', name: '保留', color: '#f59e0b' },
    { id: '4', type: 'parking', name: '維護中', color: '#6b7280' },
  ],
  calendarStatuses: [
    { id: '1', type: 'calendar', name: '一般', color: '#6366f1' },
    { id: '2', type: 'calendar', name: '重要', color: '#f59e0b' },
    { id: '3', type: 'calendar', name: '緊急', color: '#ef4444' },
    { id: '4', type: 'calendar', name: '完成', color: '#22c55e' },
  ],
  houseStatuses: [
    { id: '1', type: 'house', name: '空屋', color: '#22c55e' },
    { id: '2', type: 'house', name: '已入住', color: '#3b82f6' },
    { id: '3', type: 'house', name: '裝修中', color: '#f59e0b' },
  ],
  // 預設值同上...
}
```

**新增到 store/index.ts**:
```typescript
import configReducer from './modules/config'
// ... 在 combineReducers 中加入
config: configReducer
```

---

### 任務 3: 重構 BuildingFloorConfig.tsx

**檔案**: `src/views/Backstage/BuildingFloorConfig.tsx`

**需求**: 實現三個區塊的 UI

```tsx
const BuildingFloorConfig: React.FC = () => {
  const [buildings, setBuildings] = useState<BuildingConfig[]>([])
  
  return (
    <div className="building-floor-config">
      {/* 區塊 1: 棟數設定 */}
      <Section title="棟數設定">
        <BuildingList
          buildings={buildings}
          onAdd={handleAddBuilding}
          onEdit={handleEditBuilding}
          onDelete={handleDeleteBuilding}
        />
      </Section>

      {/* 區塊 2: R樓設定 */}
      <Section title="R樓設定">
        <RoofFloorList
          floors={roofFloors}
          onAdd={handleAddRoofFloor}
          onDelete={handleDeleteRoofFloor}
        />
      </Section>

      {/* 區塊 3: 地下室設定 */}
      <Section title="地下室設定">
        <BasementFloorList
          floors={basementFloors}
          onAdd={handleAddBasementFloor}
          onDelete={handleDeleteBasementFloor}
        />
      </Section>
    </div>
  )
}
```

**棟別卡片的編輯表單需要包含**:
- 棟別代號 (Code) - 例如 "A"
- 棟別名稱 (Name) - 例如 "第一棟"
- R樓數量 (Number) - 例如 1
- 居住層數量 (Number) - 例如 12
- 地下室層數 (Number) - 例如 2
- 每層戶數 (Number) - 例如 4

**自動計算顯示**:
- 總樓層數 = R樓 + 居住層 + 地下室
- 總戶數 = 居住層 × 每層戶數

---

### 任務 4: 實作自動生成邏輯

**需求**: 當棟別設定完成後，自動生成格局和車位

```typescript
// src/utils/autoGenerate.ts

// 1. 自動生成樓層
function autoGenerateFloors(building: BuildingConfig) {
  const floors: Floor[] = []
  
  // R樓
  for (let i = 1; i <= building.roofFloors; i++) {
    floors.push({
      id: `${building.id}-R${i}`,
      buildingId: building.id,
      floorNumber: `R${i}`,
      name: `R${i}樓`,
      floorType: 'roof',
      totalUnits: 0,
      sortOrder: 0,
    })
  }
  
  // 居住層 (1F, 2F, ...)
  for (let i = 1; i <= building.residentialFloors; i++) {
    floors.push({
      id: `${building.id}-F${i}`,
      buildingId: building.id,
      floorNumber: `${i}F`,
      name: `${i}樓`,
      floorType: 'residential',
      totalUnits: building.unitsPerFloor,
      sortOrder: i,
    })
  }
  
  // 地下室 (B1, B2, ...)
  for (let i = 1; i <= building.basementFloors; i++) {
    floors.push({
      id: `${building.id}-B${i}`,
      buildingId: building.id,
      floorNumber: `B${i}`,
      name: `B${i}地下室`,
      floorType: 'basement',
      totalUnits: 0,
      sortOrder: -i,
    })
  }
  
  return floors
}

// 2. 自動生成戶別
function autoGenerateUnits(building: BuildingConfig, floors: Floor[]) {
  const units: UnitConfig[] = []
  const residentialFloors = floors.filter(f => f.floorType === 'residential')
  
  residentialFloors.forEach(floor => {
    for (let i = 1; i <= building.unitsPerFloor; i++) {
      units.push({
        id: `${building.id}-${floor.floorNumber}-${String(i).padStart(2, '0')}`,
        buildingId: building.id,
        floorId: floor.id,
        unitNumber: `${building.buildingCode}-${floor.floorNumber}-${String(i).padStart(2, '0')}`,
        floorNumber: floor.floorNumber,
        floorType: 'residential',
        sortOrder: i,
        status: 'vacant',
      })
    }
  })
  
  return units
}

// 3. 自動生成車位
function autoGenerateParkingSpaces(
  building: BuildingConfig,
  floors: Floor[],
  spacesPerFloor: number = 20,
  areas: string[] = ['A', 'B']
) {
  const parkingSpaces: ParkingSpaceConfig[] = []
  const basementFloors = floors.filter(f => f.floorType === 'basement')
  
  basementFloors.forEach(floor => {
    areas.forEach(area => {
      for (let i = 1; i <= spacesPerFloor; i++) {
        parkingSpaces.push({
          id: `${area}-${building.buildingCode}-${floor.floorNumber}-${String(i).padStart(3, '0')}`,
          buildingId: building.id,
          floorId: floor.id,
          areaId: area,
          number: `${area}${building.buildingCode}-${floor.floorNumber}-${String(i).padStart(3, '0')}`,
          type: area === 'A' ? 'resident' : 'visitor',
          status: 'available',
        })
      }
    })
  })
  
  return parkingSpaces
}
```

---

### 任務 5: 修改 FloorManager.tsx

**需求**: 支援三種樓層類型的顯示和編輯

```typescript
// 樓層類型標籤
type FloorType = 'roof' | 'residential' | 'basement'

// 顯示時要有區分
const FloorTypeLabel: Record<FloorType, string> = {
  roof: 'R樓',
  residential: '居住層',
  basement: '地下室'
}

const FloorTypeColor: Record<FloorType, string> = {
  roof: '#8b5cf6',      // 紫色
  residential: '#3b82f6', // 藍色
  basement: '#6b7280'     // 灰色
}
```

---

### 任務 6: 新增/修改 UnitLayoutManager.tsx

**需求**: 
- 顯示依棟別自動生成的戶別
- 支援手動添加/刪除/調整順序
- 顯示每戶的房屋狀態 (空屋/已入住/裝修中)

```tsx
const UnitLayoutManager: React.FC<{ buildingId: string }> = ({ buildingId }) => {
  const [units, setUnits] = useState<UnitConfig[]>([])
  
  return (
    <div className="unit-layout-manager">
      <Header>
        <Title>格局配置</Title>
        <Button onClick={() => autoGenerateUnits(buildingId)}>
          自動生成格局
        </Button>
      </Header>
      
      {/* 按樓層分組顯示 */}
      {floorGroups.map(floor => (
        <FloorSection key={floor.id}>
          <FloorHeader>{floor.name}</FloorHeader>
          <UnitGrid>
            {floor.units.map(unit => (
              <UnitCard
                unit={unit}
                statusColor={getHouseStatusColor(unit.status)}
                onEdit={handleEditUnit}
                onDelete={handleDeleteUnit}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            ))}
            {/* 手動添加按鈕 */}
            <AddUnitCard
              floorId={floor.id}
              onAdd={handleAddUnit}
            />
          </UnitGrid>
        </FloorSection>
      ))}
    </div>
  )
}
```

---

### 任務 7: 新建停車位配置頁面

**新增檔案**: `src/views/Backstage/ParkingConfig.tsx`

**需求**:
- 依地下室樓層顯示車位
- 可調整每層車位數量
- 可手動添加/刪除車位

```tsx
const ParkingConfig: React.FC<{ buildingId: string }> = ({ buildingId }) => {
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpaceConfig[]>([])
  const [spacesPerFloor, setSpacesPerFloor] = useState(20)
  
  return (
    <div className="parking-config">
      <Header>
        <Title>車位配置</Title>
        <div className="settings">
          <label>每層車位數量: </label>
          <input
            type="number"
            value={spacesPerFloor}
            onChange={(e) => setSpacesPerFloor(Number(e.target.value))}
          />
          <Button onClick={() => autoGenerateParking(buildingId, spacesPerFloor)}>
            重新生成車位
          </Button>
        </div>
      </Header>
      
      {/* 按地下室樓層分組 */}
      {basementFloors.map(floor => (
        <FloorSection key={floor.id}>
          <FloorHeader>{floor.name} - 車位</FloorHeader>
          <ParkingGrid>
            {getParkingByFloor(floor.id).map(space => (
              <ParkingSpaceCard
                space={space}
                onEdit={handleEditSpace}
                onDelete={handleDeleteSpace}
              />
            ))}
          </ParkingGrid>
        </FloorSection>
      ))}
    </div>
  )
}
```

---

### 任務 8: 重構 ColorConfigPanel.tsx

**需求**: 統一管理三類狀態顏色

```tsx
const ColorConfigPanel: React.FC = () => {
  const parkingStatuses = useAppSelector(state => state.config.parkingStatuses)
  const calendarStatuses = useAppSelector(state => state.config.calendarStatuses)
  const houseStatuses = useAppSelector(state => state.config.houseStatuses)
  
  return (
    <div className="color-config-panel">
      {/* 車位狀態 */}
      <Section title="車位狀態">
        {parkingStatuses.map(status => (
          <ColorRow
            type="parking"
            status={status}
            onChange={(color) => updateStatus('parking', status.id, color)}
          />
        ))}
      </Section>
      
      {/* 行事曆狀態 */}
      <Section title="行事曆狀態">
        {calendarStatuses.map(status => (
          <ColorRow
            type="calendar"
            status={status}
            onChange={(color) => updateStatus('calendar', status.id, color)}
          />
        ))}
      </Section>
      
      {/* 房屋狀態 */}
      <Section title="房屋狀態">
        {houseStatuses.map(status => (
          <ColorRow
            type="house"
            status={status}
            onChange={(color) => updateStatus('house', status.id, color)}
          />
        ))}
      </Section>
      
      {/* 預覽 */}
      <PreviewSection
        parkingStatuses={parkingStatuses}
        calendarStatuses={calendarStatuses}
        houseStatuses={houseStatuses}
      />
    </div>
  )
}
```

---

## 📁 你需要修改的檔案清單

| 檔案 | 動作 | 說明 |
|------|------|------|
| `src/types/domain.ts` | 修改 | 新增 BuildingConfig, UnitConfig, ParkingSpaceConfig, StatusConfig |
| `src/store/modules/config.ts` | 新建 | 狀態管理 (顏色設定) |
| `src/store/index.ts` | 修改 | 引入 config reducer |
| `src/views/Backstage/BuildingFloorConfig.tsx` | 重構 | 三區塊 UI |
| `src/views/Backstage/FloorManager.tsx` | 修改 | 支援三種樓層類型 |
| `src/views/Backstage/UnitLayoutManager.tsx` | 修改 | 自動+手動生成戶別 |
| `src/views/Backstage/ParkingConfig.tsx` | 新建 | 車位配置頁面 |
| `src/views/Backstage/ColorConfigPanel.tsx` | 重構 | 三類狀態統一管理 |
| `src/utils/autoGenerate.ts` | 新建 | 自動生成邏輯 |

---

## ✅ 完成標準

1. [ ] 可新增/編輯/刪除棟別
2. [ ] 棟別設定包含 R樓/居住層/地下室 三個區塊
3. [ ] 設定完成後可自動生成樓層、戶別、車位
4. [ ] 格局配置可手動調整 (增/刪/移動)
5. [ ] 車位配置依地下室樓層自動生成
6. [ ] ColorConfigPanel 可設定車位/行事曆/房屋三類狀態顏色
7. [ ] 所有狀態顏色存入 Redux store，前台可讀取
8. [ ] 通過 ESLint 檢查
9. [ ] 無 TypeScript 錯誤

---

## 🔗 提供給前台 AI 的介面

完成後，請在 GitHub 上標註以下資訊，讓前台 AI 知道如何使用：

```typescript
// 前台可直接從 Store 讀取的資料
const parkingStatuses = useAppSelector(state => state.config.parkingStatuses)
const calendarStatuses = useAppSelector(state => state.config.calendarStatuses)
const houseStatuses = useAppSelector(state => state.config.houseStatuses)

const buildings = useAppSelector(state => state.building.buildings)
const units = useAppSelector(state => state.unit.units)
const parkingSpaces = useAppSelector(state => state.parking.spaces)
const facilities = useAppSelector(state => state.facility.facilities)
```

---

## 📝 備註

- 請使用現有的 UI 組件 (`Card`, `Button`, `Input` 等)
- 請遵循現有的程式碼風格
- 資料暫時使用 localState 管理，後續再串接 Supabase API
- 若有疑問，查看 `database/schema.sql` 了解資料庫結構
