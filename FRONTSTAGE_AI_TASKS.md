# 🚀 前台 AI - 工作任務書

## 📋 專案背景

這是 **CivisOS 智慧社區管理系統** 的前台功能模組。你需要實作前台使用者介面，包含 6 個主要系統：

1. **行事曆系統** - 社區活動、公告、維護通知
2. **公設系統** - 游泳池、健身房等設施預約
3. **住戶系統** - 住戶資料、車牌、磁扣管理
4. **車位統計** - 車位狀態顯示
5. **寄放系統** - 寄鑰匙/寄錢
6. **管理費系統** - 社區管理費計算

**重要**: 你需要從後台的 `config` store 讀取狀態顏色，確保前後台一致。

---

## 🎯 你的工作清單

### 任務 1: 行事曆系統 (CalendarSystem.tsx)

**檔案**: `src/views/Frontstage/CalendarSystem.tsx`

**需求**:
- 兩個分頁: 「行事曆」和「過去行事曆」
- 依後台設定的行事曆狀態顯示不同顏色
- 可輸入圖片網址 (支援無限新增)
- 顯示標題、內文、圖片、開始/結束時間
- 編輯時記錄時間
- 資料卡顯示編輯按鈕和狀態選擇窗口

**程式碼框架**:

```tsx
const CalendarSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'past'>('current')
  const [events, setEvents] = useState<CalendarEventV2[]>([])
  
  // 從後台 config store 讀取狀態顏色
  const calendarStatuses = useAppSelector(state => state.config.calendarStatuses)
  
  // 取得狀態對應的顏色
  const getStatusColor = (statusId: string) => {
    const status = calendarStatuses.find(s => s.id === statusId)
    return status?.color || '#cccccc'
  }
  
  return (
    <div className="calendar-system">
      <Tabs>
        <Tab onClick={() => setActiveTab('current')}>行事曆</Tab>
        <Tab onClick={() => setActiveTab('past')}>過去行事曆</Tab>
      </Tabs>
      
      <Button onClick={() => openCreateModal()}>新增活動</Button>
      
      {/* 事件列表 */}
      <EventGrid>
        {events
          .filter(e => activeTab === 'past' ? e.isPast : !e.isPast)
          .map(event => (
            <EventCard
              event={event}
              statusColor={getStatusColor(event.statusId)}
              onEdit={() => openEditModal(event)}
              onDelete={() => softDeleteEvent(event.id)}
            />
          ))}
      </EventGrid>
      
      {/* 新增/編輯 Modal */}
      <EventModal>
        <Input label="標題" value={form.title} onChange={setTitle} />
        <Textarea label="內文" value={form.content} onChange={setContent} />
        
        {/* 圖片網址 (無限新增) */}
        {form.images.map((url, index) => (
          <div key={index}>
            <Input
              value={url}
              onChange={(v) => updateImage(index, v)}
              placeholder="輸入圖片網址"
            />
            <Button onClick={() => deleteImage(index)}>刪除</Button>
          </div>
        ))}
        <Button onClick={() => addImage()}>+ 新增圖片</Button>
        
        {/* 時間選擇 */}
        <DateTimePicker
          startTime={form.startTime}
          endTime={form.endTime}
          onChange={handleTimeChange}
        />
        
        {/* 狀態選擇 (從後台讀取) */}
        <Select
          label="狀態"
          options={calendarStatuses.map(s => ({
            value: s.id,
            label: s.name
          }))}
          value={form.statusId}
          onChange={setStatusId}
        />
        
        {/* 操作日誌 */}
        <ActionLog
          createdAt={event.createdAt}
          updatedAt={event.updatedAt}
        />
      </EventModal>
    </div>
  )
}
```

---

### 任務 2: 公設系統 (FacilitySystemV2.tsx)

**檔案**: `src/views/Frontstage/FacilitySystemV2.tsx`

**需求**:
- 大分頁: 棟別區塊
- 小分頁: 現在 / 過去 / 取消 / 刪除
- 租借設定 UI:
  - 勾選租借人: 住戶 / 其他
  - 租借住戶: 選棟別、戶別、樓層、姓名
  - 租借其他: 輸入姓名
  - 選日期、時間
  - 預約人 (顯示工作人員)
  - 付款狀態按鈕 (已付款/未付款)
- 資料卡顯示: 租借人資料、時間、狀態、備註、編輯/取消/付款按鈕

**程式碼框架**:

```tsx
const FacilitySystemV2: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'past' | 'cancelled' | 'deleted'>('current')
  const [selectedBuilding, setSelectedBuilding] = useState<string>('')
  const [bookings, setBookings] = useState<FacilityBookingV2[]>([])
  
  return (
    <div className="facility-system">
      {/* 大分頁: 棟別 */}
      <BuildingTabs>
        {buildings.map(b => (
          <Tab onClick={() => setSelectedBuilding(b.id)}>{b.name}</Tab>
        ))}
      </BuildingTabs>
      
      {/* 小分頁: 狀態 */}
      <StatusTabs>
        <Tab onClick={() => setActiveTab('current')}>現在</Tab>
        <Tab onClick={() => setActiveTab('past')}>過去</Tab>
        <Tab onClick={() => setActiveTab('cancelled')}>取消</Tab>
        <Tab onClick={() => setActiveTab('deleted')}>刪除</Tab>
      </StatusTabs>
      
      {/* 預約列表 */}
      <BookingList>
        {filteredBookings.map(booking => (
          <BookingCard
            booking={booking}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onMarkPaid={handleMarkPaid}
            onDelete={handleDelete}
          />
        ))}
      </BookingList>
      
      {/* 新增預約 Modal */}
      <BookingModal>
        {/* 勾選租借人類型 */}
        <RadioGroup
          options={[
            { value: 'resident', label: '住戶' },
            { value: 'other', label: '其他' }
          ]}
          value={form.bookingType}
          onChange={setBookingType}
        />
        
        {form.bookingType === 'resident' ? (
          /* 租借住戶 */
          <>
            <Select label="棟別" options={buildingOptions} />
            <Select label="戶別" options={unitOptions} />
            <Select label="樓層" options={floorOptions} />
            <Input label="姓名" />
          </>
        ) : (
          /* 租借其他 */
          <Input label="姓名" />
        )}
        
        <DatePicker label="租借日期" />
        <TimeRangePicker label="租借時間" start={startTime} end={endTime} />
        <Input label="預約人" readOnly value={currentStaffName} />
        
        {/* 付款狀態按鈕 */}
        <PaymentButton
          status={form.paymentStatus}
          onToggle={togglePaymentStatus}
        />
      </BookingModal>
    </div>
  )
}
```

---

### 任務 3: 住戶系統 (ResidentSystemV2.tsx)

**檔案**: `src/views/Frontstage/ResidentSystemV2.tsx`

**需求**:
- 依棟別自動生成分頁
- 每戶顯示為一張資料卡
- 依照後台設定的房屋狀態顯示不同顏色
- 顯示每個狀態的數量統計
- 編輯 UI 包含:
  - 房屋狀態選擇
  - 區權人 (姓名、電話、備註)
  - 成員名單 (可自由新增/刪除)
  - 承租名單 (可自由新增/刪除)
  - 車牌名單 (與車位系統同步)
  - 磁扣設定 (三類: 一般/汽車ETC/其他ETC)

**程式碼框架**:

```tsx
const ResidentSystemV2: React.FC = () => {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('')
  
  // 從後台讀取房屋狀態
  const houseStatuses = useAppSelector(state => state.config.houseStatuses)
  
  // 取得狀態顏色
  const getStatusColor = (statusId: string) => {
    const status = houseStatuses.find(s => s.id === statusId)
    return status?.color || '#cccccc'
  }
  
  return (
    <div className="resident-system">
      {/* 棟別分頁 */}
      <BuildingTabs>
        {buildings.map(b => (
          <Tab onClick={() => setSelectedBuilding(b.id)}>
            {b.name}
            {/* 狀態數量統計 */}
            <StatusCounts>
              {getStatusCounts(b.id).map(stat => (
                <Badge color={stat.color}>{stat.count}</Badge>
              ))}
            </StatusCounts>
          </Tab>
        ))}
      </BuildingTabs>
      
      {/* 戶別卡片列表 */}
      <UnitGrid>
        {units
          .filter(u => u.buildingId === selectedBuilding)
          .map(unit => (
            <ResidentCard
              unit={unit}
              resident={getResidentByUnit(unit.id)}
              statusColor={getStatusColor(unit.statusId)}
              onEdit={() => openEditModal(unit)}
            />
          ))}
      </UnitGrid>
      
      {/* 編輯 Modal */}
      <ResidentModal>
        {/* 房屋狀態選擇 (從後台讀取) */}
        <Select
          label="房屋狀態"
          options={houseStatuses.map(s => ({ value: s.id, label: s.name }))}
          value={form.statusId}
          onChange={setStatusId}
        />
        
        {/* 區權人 */}
        <Input label="區權人" value={form.ownerName} />
        <Input label="電話" value={form.ownerPhone} />
        <Textarea label="備註" value={form.ownerNote} />
        
        {/* 成員名單 */}
        <MemberSection title="成員名單">
          {form.members.map((member, i) => (
            <MemberRow>
              <Select options={relationshipOptions} />
              <Input value={member.name} />
              <Input value={member.phone} />
              <Button onClick={() => deleteMember(i)}>刪除</Button>
            </MemberRow>
          ))}
          <Button onClick={addMember}>+ 新增成員</Button>
        </MemberSection>
        
        {/* 承租名單 */}
        <TenantSection title="承租名單">
          {/* 類似成員名單的實作 */}
        </TenantSection>
        
        {/* 車牌名單 (與車位系統同步) */}
        <PlateSection title="車牌名單">
          {form.plates.map((plate, i) => (
            <PlateRow>
              <Checkbox label="車位主" checked={plate.isOwner} />
              <Input
                value={plate.number}
                suggestions={getParkingPlatesByUnit(unitId)} // 從車位系統取得
              />
              <Select options={['汽車', '機車', '腳踏車']} />
              <Button onClick={() => deletePlate(i)}>刪除</Button>
            </PlateRow>
          ))}
          <Button onClick={addPlate}>+ 新增車牌</Button>
        </PlateSection>
        
        {/* 磁扣設定 (三類) */}
        <CardSection title="磁扣設定">
          <CardTabs>
            <Tab>一般磁扣</Tab>
            <Tab>汽車ETC</Tab>
            <Tab>其他ETC</Tab>
          </CardTabs>
          
          {/* 一般磁扣 */}
          {activeCardTab === 'normal' && (
            <>
              {form.normalCards.map((card, i) => (
                <CardRow>
                  {/* 依成員/承租人選擇或自由輸入 */}
                  <Input
                    value={card.memberName}
                    suggestions={[...members, ...tenants].map(m => m.name)}
                  />
                  <Input value={card.cardNumber} placeholder="輸入磁扣號碼" />
                  <Button onClick={() => deleteCard(i)}>刪除</Button>
                </CardRow>
              ))}
              <Button onClick={() => addCard('normal')}>+ 新增一般磁扣</Button>
            </>
          )}
          
          {/* 汽車ETC */}
          {activeCardTab === 'car_etc' && (
            <>
              {form.etcCards.map((card, i) => (
                <CardRow>
                  {/* 依車牌名單選擇 */}
                  <Select
                    options={plates.map(p => p.number)}
                    value={card.memberName}
                  />
                  <Input value={card.cardNumber} placeholder="輸入磁扣號碼" />
                  <Button onClick={() => deleteCard(i)}>刪除</Button>
                </CardRow>
              ))}
              <Button onClick={() => addCard('car_etc')}>+ 新增汽車ETC</Button>
            </>
          )}
          
          {/* 其他ETC */}
          {activeCardTab === 'other_etc' && (
            <>
              {form.otherEtcCards.map((card, i) => (
                <CardRow>
                  {/* 依車位系統自訂類型選擇 */}
                  <Select
                    options={getCustomParkingTypes()}
                    value={card.memberName}
                  />
                  <Input value={card.cardNumber} placeholder="輸入磁扣號碼" />
                  <Button onClick={() => deleteCard(i)}>刪除</Button>
                </CardRow>
              ))}
              <Button onClick={() => addCard('other_etc')}>+ 新增其他ETC</Button>
            </>
          )}
        </CardSection>
      </ResidentModal>
    </div>
  )
}
```

---

### 任務 4: 車位統計 (ParkingSystem.tsx)

**檔案**: `src/views/Frontstage/ParkingSystem.tsx`

**需求**:
- 依後台設定的車位狀態顯示不同顏色
- 顯示車位號碼和當前使用者
- 租用中顯示 `(租)` 標記

**程式碼框架**:

```tsx
const ParkingSystem: React.FC = () => {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('')
  
  // 從後台讀取車位狀態
  const parkingStatuses = useAppSelector(state => state.config.parkingStatuses)
  
  const getStatusColor = (statusId: string) => {
    const status = parkingStatuses.find(s => s.id === statusId)
    return status?.color || '#cccccc'
  }
  
  return (
    <div className="parking-system">
      <BuildingFilter
        buildings={buildings}
        selectedId={selectedBuilding}
        onChange={setSelectedBuilding}
      />
      
      <ParkingGrid>
        {parkingSpaces
          .filter(s => s.buildingId === selectedBuilding)
          .map(space => (
            <ParkingCard
              space={space}
              statusColor={getStatusColor(space.statusId)}
              rentalMark={space.type === 'resident' ? '(租)' : ''}
              currentUser={space.currentUser}
            />
          ))}
      </ParkingGrid>
    </div>
  )
}

const ParkingCard: React.FC<{ space: ParkingSpace; statusColor: string; rentalMark: string }> = ({
  space,
  statusColor,
  rentalMark
}) => (
  <Card style={{ backgroundColor: statusColor }}>
    <CardHeader>
      <Title>{space.number}</Title>
      {rentalMark && <Badge>{rentalMark}</Badge>}
    </CardHeader>
    <CardContent>
      <Text>狀態: {getStatusName(space.statusId)}</Text>
      {space.currentUser && <Text>使用者: {space.currentUser}</Text>}
    </CardContent>
  </Card>
)
```

---

### 任務 5: 寄放系統 (DepositSystem.tsx)

**檔案**: `src/views/Frontstage/DepositSystem.tsx`

**需求**:
- 兩大分類: 寄KEY/寄磁扣、寄錢
- 選擇戶別和樓層
- 寄錢功能: 加款、減款 (記錄收款人、時間、備註)
- 操作日誌

**程式碼框架**:

```tsx
const DepositSystem: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'key' | 'money'>('key')
  const [selectedUnit, setSelectedUnit] = useState<string>('')
  
  return (
    <div className="deposit-system">
      <CategoryTabs>
        <Tab onClick={() => setActiveCategory('key')}>寄KEY/寄磁扣</Tab>
        <Tab onClick={() => setActiveCategory('money')}>寄錢</Tab>
      </CategoryTabs>
      
      {/* 戶別選擇 */}
      <UnitSelector
        buildings={buildings}
        units={units}
        selectedId={selectedUnit}
        onChange={setSelectedUnit}
      />
      
      {activeCategory === 'key' ? (
        /* 寄KEY/寄磁扣 */
        <KeyDepositSection>
          <DepositList>
            {keyDeposits.map(deposit => (
              <DepositCard
                type="key"
                deposit={deposit}
                onEdit={handleEdit}
              />
            ))}
          </DepositList>
          <AddKeyForm />
        </KeyDepositSection>
      ) : (
        /* 寄錢 */
        <MoneyDepositSection>
          <DepositList>
            {moneyDeposits.map(deposit => (
              <DepositCard
                type="money"
                deposit={deposit}
                onAddTransaction={handleAddTransaction}
              />
            ))}
          </DepositList>
          <AddMoneyForm />
          
          {/* 加款/減款 Modal */}
          <TransactionModal type={txType}>
            <Input label="數目" type="number" />
            <Input label="收款時間" type="datetime-local" />
            <Input label="誰收的" />
            <Textarea label="備註" />
            <Button onClick={handleSubmit}>
              {txType === 'add' ? '確認加款' : '確認減款'}
            </Button>
          </TransactionModal>
        </MoneyDepositSection>
      )}
    </div>
  )
}
```

---

### 任務 6: 管理費系統 (FeeSystem.tsx)

**檔案**: `src/views/Frontstage/FeeSystem.tsx`

**需求**:
- 依棟別自動生成分頁
- 每戶顯示為資料卡，可設定:
  - 坪數
  - 每坪多少元
  - 自動計算總額
  - 備註欄
- 特殊戶型設定:
  - 可勾選多戶別
  - 自由輸入坪數和單價 (或依照每戶計算)

**程式碼框架**:

```tsx
const FeeSystem: React.FC = () => {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('')
  
  return (
    <div className="fee-system">
      <BuildingTabs>
        {buildings.map(b => (
          <Tab onClick={() => setSelectedBuilding(b.id)}>{b.name}</Tab>
        ))}
      </BuildingTabs>
      
      {/* 一般戶型費用 */}
      <FeeSection title="一般戶型費用">
        <FeeGrid>
          {units
            .filter(u => u.buildingId === selectedBuilding)
            .map(unit => (
              <FeeCard
                unit={unit}
                config={getFeeConfig(unit.id)}
                onUpdate={handleUpdateFee}
              />
            ))}
        </FeeGrid>
      </FeeSection>
      
      {/* 特殊戶型設定 */}
      <SpecialFeeSection title="特殊戶型設定">
        <Input label="費用名稱" />
        
        {/* 戶別勾選 */}
        <UnitCheckboxList
          units={units.filter(u => u.buildingId === selectedBuilding)}
          selectedIds={form.selectedUnitIds}
          onChange={setSelectedUnitIds}
        />
        
        {/* 計算方式 */}
        <RadioGroup
          options={[
            { value: 'total', label: '依照每戶別坪數 x 單價計算' },
            { value: 'custom', label: '自由輸入坪數與單價' }
          ]}
          value={form.calcType}
          onChange={setCalcType}
        />
        
        {form.calcType === 'custom' && (
          <>
            <Input label="自由輸入坪數" type="number" />
            <Input label="自由輸入單價" type="number" />
          </>
        )}
        
        <CalculatedAmount>
          計算結果: ${form.calculatedAmount}
        </CalculatedAmount>
        
        <Button onClick={handleSave}>儲存特殊費用</Button>
      </SpecialFeeSection>
    </div>
  )
}

const FeeCard: React.FC<{ unit: Unit; config?: FeeConfig }> = ({ unit, config }) => (
  <Card>
    <CardHeader>
      <Title>{unit.unitNumber}</Title>
    </CardHeader>
    <CardContent>
      <Input
        label="坪數"
        type="number"
        value={config?.area || 0}
        onChange={(v) => updateFee(unit.id, 'area', v)}
      />
      <Input
        label="每坪多少元"
        type="number"
        value={config?.pricePerArea || 0}
        onChange={(v) => updateFee(unit.id, 'pricePerArea', v)}
      />
      <CalculatedFee>
        應繳費用: ${(config?.area || 0) * (config?.pricePerArea || 0)}
      </CalculatedFee>
      <Textarea
        label="備註"
        value={config?.note || ''}
        onChange={(v) => updateFee(unit.id, 'note', v)}
      />
    </CardContent>
  </Card>
)
```

---

## 📁 你需要修改的檔案清單

| 檔案 | 動作 | 說明 |
|------|------|------|
| `src/views/Frontstage/CalendarSystem.tsx` | 重構 | 狀態顏色整合、圖片功能 |
| `src/views/Frontstage/FacilitySystemV2.tsx` | 重構 | 棟別過濾、租借 UI |
| `src/views/Frontstage/ResidentSystemV2.tsx` | 重構 | 棟別分頁、三類磁扣 |
| `src/views/Frontstage/ParkingSystem.tsx` | 修改 | 狀態顏色、租用標記 |
| `src/views/Frontstage/DepositSystem.tsx` | 重構 | 寄KEY/寄MONEY 分類 |
| `src/views/Frontstage/FeeSystem.tsx` | 重構 | 棟數分頁、特殊戶型 |

**新增組件** (如需要):
- `src/components/calendar/EventCard.tsx`
- `src/components/facility/BookingCard.tsx`
- `src/components/resident/ResidentCard.tsx`
- `src/components/deposit/DepositCard.tsx`
- `src/components/fee/FeeCard.tsx`

---

## ✅ 完成標準

1. [ ] 行事曆: 支援圖片無限新增、狀態顏色從後台讀取
2. [ ] 公設: 棟別過濾、住戶/其他勾選、付款按鈕
3. [ ] 住戶: 棟別分頁、狀態統計、承租名單、三類磁扣
4. [ ] 車位: 狀態顏色從後台讀取、租用標記
5. [ ] 寄放: 分類寄放、加減款、收款人紀錄
6. [ ] 管理費: 棟數分頁、坪數單價自動計算
7. [ ] 所有狀態顏色從後台的 config store 讀取
8. [ ] 通過 ESLint 檢查
9. [ ] 無 TypeScript 錯誤

---

## 🔗 依賴後台介面

**重要**: 你需要等後台 AI 完成後，才能正確讀取狀態顏色。

後台會在 `config` store 中提供以下資料：

```typescript
// src/store/modules/config.ts
interface ConfigState {
  parkingStatuses: StatusConfig[]    // 車位狀態 (id, name, color)
  calendarStatuses: StatusConfig[]   // 行事曆狀態 (id, name, color)
  houseStatuses: StatusConfig[]      // 房屋狀態 (id, name, color)
}

// 使用方式
const parkingStatuses = useAppSelector(state => state.config.parkingStatuses)
const calendarStatuses = useAppSelector(state => state.config.calendarStatuses)
const houseStatuses = useAppSelector(state => state.config.houseStatuses)
```

---

## 📝 備註

- 請使用現有的 UI 組件 (`Card`, `Button`, `Input`, `Select` 等)
- 請遵循現有的程式碼風格
- 資料暫時使用 localState 管理，後續再串接 Supabase API
- 狀態顏色必須從後台讀取，不可寫死
- 若有疑問，查看 `database/schema.sql` 了解資料庫結構
