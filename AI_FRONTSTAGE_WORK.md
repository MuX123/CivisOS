# 前台功能 - AI 工作包

**交付目標**: 重構前台各系統，符合 NEW.txt 規格  
**依賴**: 需等待後台 AI 完成 `AI_BACKSTAGE_WORK.md`  
**預估工作量**: 極大

---

## 📋 工作項目

### 1. 行事曆系統 (CalendarSystem)

**需求規格**:
```
行事曆改名行事曆系統  預設兩個分頁 1.行事曆 2.過去行事曆(如刪除 過期)
依後台行事曆狀態改變對應顏色  需可輸入圖片網址顯示圖片  預設格式標題 內文 圖片   圖片預設一行 可無限新增 
並且可設定指定時間  需編輯按鈕  行事曆設定當下需紀錄時間 並且設定完後 資料卡中需顯示 編輯 以及狀態的選擇窗口
```

**具體實作**:

#### 1.1 行事曆事件類型
```typescript
// src/types/calendar.ts

interface CalendarEvent {
  id: string
  title: string                    // 標題
  content: string                  // 內文
  images: string[]                 // 圖片網址列表 (無限新增)
  startTime: string                // 開始時間 (ISO)
  endTime: string                  // 結束時間 (ISO)
  statusId: string                 // 關聯後台狀態
  status?: CalendarStatusConfig    // 從 store 取得
  creator: string                  // 建立者
  createdAt: string                // 建立時間 (編輯時紀錄)
  updatedAt: string                // 最後編輯時間
  isDeleted: boolean               // 軟刪除 (移至過去)
}

// 從 store 取得狀態
const calendarStatuses = useAppSelector(state => state.config.calendarStatuses)
```

#### 1.2 行事曆 UI
```tsx
// src/views/Frontstage/CalendarSystem.tsx

<CalendarSystem>
  {/* 分頁切換 */}
  <Tabs>
    <Tab value="current">行事曆</Tab>
    <Tab value="past">過去行事曆</Tab>
  </Tabs>

  {/* 新增按鈕 */}
  <Button onClick={() => openCreateModal()}>新增活動</Button>

  {/* 事件列表 */}
  <EventGrid>
    {events
      .filter(e => activeTab === 'past' ? e.isDeleted : !e.isDeleted)
      .map(event => (
        <EventCard
          event={event}
          statusColor={getStatusColor(event.statusId, 'calendar')}
          onEdit={() => openEditModal(event)}
          onDelete={() => softDeleteEvent(event.id)}
        />
      ))}
  </EventGrid>

  {/* 新增/編輯 Modal */}
  <EventModal>
    <Input title value={form.title} onChange={setTitle} />
    <Textarea content value={form.content} onChange={setContent} />

    {/* 圖片網址 (可無限新增) */}
    {form.images.map((url, index) => (
      <ImageInput
        key={index}
        value={url}
        onChange={(newUrl) => updateImage(index, newUrl)}
        onDelete={() => deleteImage(index)}
      />
    ))}
    <Button onClick={() => addImage()}>+ 新增圖片</Button>

    {/* 時間選擇 */}
    <DateTimePicker
      startTime={form.startTime}
      endTime={form.endTime}
      onChange={handleTimeChange}
    />

    {/* 狀態選擇 (從後台取得) */}
    <StatusSelector
      statuses={calendarStatuses}
      selectedId={form.statusId}
      onChange={setStatusId}
    />

    {/* 操作日誌 */}
    <ActionLog
      createdAt={event.createdAt}
      updatedAt={event.updatedAt}
      editedBy={event.lastEditedBy}
    />
  </EventModal>
</CalendarSystem>
```

#### 1.3 狀態顏色整合
```tsx
// 根據後台設定顯示顏色
const getStatusColor = (statusId: string, type: 'calendar' | 'parking' | 'house') => {
  const statuses = useAppSelector(state =>
    type === 'calendar' ? state.config.calendarStatuses :
    type === 'parking' ? state.config.parkingStatuses :
    state.config.houseStatuses
  )
  return statuses.find(s => s.id === statusId)?.color || '#cccccc'
}

// 事件卡片
const EventCard: React.FC<{ event: CalendarEvent }> = ({ event }) => (
  <Card style={{ borderLeftColor: getStatusColor(event.statusId, 'calendar') }}>
    <CardHeader>
      <Title>{event.title}</Title>
      <Badge color={getStatusColor(event.statusId, 'calendar')}>
        {getStatusName(event.statusId, 'calendar')}
      </Badge>
    </CardHeader>
    <CardContent>
      {event.content}
      {event.images.map(url => (
        <img key={url} src={url} alt="活動圖片" />
      ))}
      <TimeRange start={event.startTime} end={event.endTime} />
      <Button onClick={() => onEdit(event)}>編輯</Button>
    </CardContent>
  </Card>
)
```

---

### 2. 公設系統 (FacilitySystem)

**需求規格**:
```
公設租借改名公設系統  預設大分頁 棟別為區塊 小分頁 1.現在 2.過去 3.取消 4.刪除
現在 當前預約清單 
過去 當資料卡 按下已付款按鈕 
取消 當資料卡 按下取消按鈕後 資料移至
刪除 當資料卡 按下取刪除鈕後 資料移至

租借設定ui
  1.勾選租借人  住戶  其他 勾選後顯示如下
  租借住戶 設定 棟別 戶別 樓層 姓名(自由輸入)
  租借其他  姓名(自由輸入)
  租借日期
  租借時間
  預約人[顯示工作人員填寫](自由輸入)
  付款狀態:按鈕  已付款or未付款
租借資料卡 
  需顯示租借人資料 租借時間 預約時間  已預約or已取消  已付款or未付款  備註區 編輯按鈕 取消按鈕 已付款按鈕
```

**具體實作**:

#### 2.1 公設預約類型
```typescript
// src/types/facility.ts

type BookingStatus = 'confirmed' | 'pending_approval' | 'cancelled' | 'completed'
type PaymentStatus = 'paid' | 'pending' | 'refunded'

interface FacilityBooking {
  id: string
  facilityId: string            // 公設ID
  facilityName: string          // 公設名稱

  // 租借人類型 (區分住戶/其他)
  bookingType: 'resident' | 'other'
  residentInfo?: {
    buildingId: string          // 棟別
    unitId: string              // 戶別
    floorNumber: string         // 樓層
    residentName: string        // 姓名
  }
  otherInfo?: {
    name: string                // 姓名 (自由輸入)
  }

  // 時間
  bookingDate: string           // 租借日期
  startTime: string             // 開始時間
  endTime: string               // 結束時間

  // 預約人 (工作人員)
  bookedBy: string              // 預約人

  // 狀態
  status: BookingStatus         // 預約狀態
  paymentStatus: PaymentStatus  // 付款狀態

  // 備註
  note: string

  // 日誌
  createdAt: string
  updatedAt: string
  cancelledAt?: string
  paidAt?: string
}
```

#### 2.2 公設系統 UI
```tsx
// src/views/Frontstage/FacilitySystemV2.tsx

<FacilitySystem>
  {/* 大分頁: 棟別區塊 */}
  <BuildingTabs>
    {buildings.map(building => (
      <Tab key={building.id} value={building.id}>
        {building.name}
      </Tab>
    ))}
  </BuildingTabs>

  {/* 小分頁: 狀態分類 */}
  <StatusTabs>
    <Tab value="current">現在</Tab>
    <Tab value="past">過去</Tab>
    <Tab value="cancelled">取消</Tab>
    <Tab value="deleted">刪除</Tab>
  </StatusTabs>

  {/* 公設選擇 */}
  <FacilitySelector
    facilities={facilities}
    selectedId={selectedFacilityId}
    onChange={setSelectedFacilityId}
  />

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
      /* 租借住戶 UI */
      <ResidentBookingForm>
        <Select
          label="棟別"
          options={buildings.map(b => ({ value: b.id, label: b.name }))}
          value={form.buildingId}
          onChange={setBuildingId}
        />
        <UnitSelector
          buildingId={form.buildingId}
          value={form.unitId}
          onChange={setUnitId}
        />
        <Input
          label="姓名"
          value={form.residentName}
          onChange={setResidentName}
        />
      </ResidentBookingForm>
    ) : (
      /* 租借其他 UI */
      <OtherBookingForm>
        <Input
          label="姓名"
          value={form.otherName}
          onChange={setOtherName}
        />
      </OtherBookingForm>
    )}

    <DatePicker label="租借日期" value={form.bookingDate} />
    <TimeRangePicker
      start={form.startTime}
      end={form.endTime}
      onChange={handleTimeChange}
    />
    <Input
      label="預約人"
      value={form.bookedBy}
      onChange={setBookedBy}
      readOnly  // 顯示當前登入工作人員
    />

    {/* 付款狀態按鈕 */}
    <PaymentButton
      status={form.paymentStatus}
      onToggle={togglePaymentStatus}
    />
  </BookingModal>
</FacilitySystem>
```

#### 2.3 預約卡片
```tsx
const BookingCard: React.FC<{ booking: FacilityBooking }> = ({ booking }) => (
  <Card>
    <CardHeader>
      <Title>{booking.facilityName}</Title>
      <Badge color={getStatusColor(booking.status)}>
        {getStatusLabel(booking.status)}
      </Badge>
    </CardHeader>
    <CardContent>
      {/* 租借人資料 */}
      {booking.bookingType === 'resident' ? (
        <ResidentInfo>
          <Text>{booking.residentInfo?.buildingName}</Text>
          <Text>{booking.residentInfo?.unitNumber}</Text>
          <Text>{booking.residentInfo?.floorNumber}</Text>
          <Text>{booking.residentInfo?.residentName}</Text>
        </ResidentInfo>
      ) : (
        <OtherInfo>
          <Text>{booking.otherInfo?.name}</Text>
        </OtherInfo>
      )}

      {/* 時間 */}
      <TimeInfo>
        <Text>租借日期: {booking.bookingDate}</Text>
        <Text>租借時間: {booking.startTime} - {booking.endTime}</Text>
        <Text>預約人: {booking.bookedBy}</Text>
      </TimeInfo>

      {/* 付款狀態 */}
      <PaymentBadge
        status={booking.paymentStatus}
        onClick={() => onMarkPaid(booking.id)}
      />

      {/* 備註 */}
      <Note>{booking.note}</Note>

      {/* 操作按鈕 */}
      <Actions>
        <Button onClick={() => onEdit(booking)}>編輯</Button>
        <Button onClick={() => onCancel(booking.id)}>取消</Button>
        <Button onClick={() => onMarkPaid(booking.id)}>
          {booking.paymentStatus === 'paid' ? '已付款' : '未付款'}
        </Button>
      </Actions>
    </CardContent>
  </Card>
)
```

---

### 3. 住戶系統 (ResidentSystem)

**需求規格**:
```
住戶資料改名住戶系統 自動依照 格局棟數產生分頁 並且依照格局產生對應 戶別-樓層 的資料卡
需依照設定之住戶狀態顯示 每一狀態數量 顯示於棟別分頁上方 依棟別排列
住戶資料卡編輯之UI:
  住戶資料  依設定顯示房屋狀態 
  區權人 電話 備註
  成員名單 電話 備註(人數自由新增 預設0)
  承租名單 電話 備註(人數自由新增 預設0)
  車牌名單  對應車位系統中 車位主 登記之車牌顯示預先選項 可複選  並且要可以直接對車牌進行編輯 新增 刪減 車位系統同步更改
  假如是其他住戶承租人  其車牌僅顯示於 其他住戶承租人承租人 的住戶資料卡設定之車位名單
  磁扣設定:
   1.一般磁扣 2.汽車ETC 3.其他ETC 已小分頁顯示
   設定詳情 
   一般磁扣 輸入框1依上面成員名單 承租名單選擇 也可以自由輸入   輸入框2 用於輸入磁扣號碼
   汽車ETC  輸入框1依照車牌名單選擇  輸入框2 用於輸入磁扣號碼
   其他ETC  輸入框1依照車位系統自訂類型名單選擇  輸入框2 用於輸入磁扣號碼
```

**具體實演**:

#### 3.1 住戶類型
```typescript
// src/types/resident.ts

type ResidentStatus = 'active' | 'pending' | 'inactive'

interface Resident {
  id: string
  unitId: string              // 關聯戶別
  unitNumber: string          // 戶別編號 (e.g., "A01-1F-01")

  // 房屋狀態 (依後台設定)
  statusId: string
  status?: HouseStatusConfig

  // 區權人
  ownerName: string
  ownerPhone: string
  ownerNote: string

  // 成員名單
  familyMembers: FamilyMember[]

  // 承租名單
  tenants: Tenant[]

  // 車牌名單 (與車位系統同步)
  licensePlates: LicensePlate[]

  // 磁扣 (三類)
  accessCards: AccessCard[]

  createdAt: string
  updatedAt: string
}

interface FamilyMember {
  id: string
  name: string
  relationship: 'owner' | 'spouse' | 'child' | 'parent' | 'other'
  phone: string
  note: string
}

interface Tenant {
  id: string
  name: string
  phone: string
  note: string
}

interface LicensePlate {
  id: string
  number: string
  type: 'car' | 'motorcycle' | 'bicycle'
  isParkingOwner: boolean    // 是否為車位主
}

interface AccessCard {
  id: string
  type: 'normal' | 'car_etc' | 'other_etc'
  memberName: string         // 依成員/承租人/車牌選擇 或 自由輸入
  cardNumber: string         // 磁扣號碼
}
```

#### 3.2 住戶系統 UI
```tsx
// src/views/Frontstage/ResidentSystemV2.tsx

<ResidentSystem>
  {/* 大分頁: 棟別 */}
  <BuildingTabs>
    {buildings.map(building => (
      <Tab key={building.id} value={building.id}>
        {building.name}
        {/* 狀態數量統計 */}
        <StatusCount>
          {getStatusCounts(building.id).map(stat => (
            <Badge key={stat.statusId} color={stat.color}>
              {stat.count}
            </Badge>
          ))}
        </StatusCount>
      </Tab>
    ))}
  </BuildingTabs>

  {/* 戶別-樓層 卡片列表 */}
  <UnitGrid>
    {units
      .filter(u => u.buildingId === selectedBuildingId)
      .map(unit => (
        <ResidentCard
          unit={unit}
          resident={getResidentByUnit(unit.id)}
          onEdit={handleEdit}
        />
      ))}
  </UnitGrid>

  {/* 住戶編輯 Modal */}
  <ResidentModal>
    {/* 房屋狀態 (依後台設定) */}
    <StatusSelector
      statuses={houseStatuses}
      selectedId={form.statusId}
      onChange={setStatusId}
    />

    {/* 區權人 */}
    <Input label="區權人" value={form.ownerName} />
    <Input label="電話" value={form.ownerPhone} />
    <Textarea label="備註" value={form.ownerNote} />

    {/* 成員名單 */}
    <MemberSection title="成員名單">
      {form.familyMembers.map((member, index) => (
        <MemberRow>
          <Select
            options={memberOptions}
            value={member.relationship}
            onChange={(v) => updateMember(index, 'relationship', v)}
          />
          <Input
            value={member.name}
            onChange={(v) => updateMember(index, 'name', v)}
          />
          <Input
            value={member.phone}
            onChange={(v) => updateMember(index, 'phone', v)}
          />
          <Button onClick={() => deleteMember(index)}>刪除</Button>
        </MemberRow>
      ))}
      <Button onClick={() => addMember()}>+ 新增成員</Button>
    </MemberSection>

    {/* 承租名單 */}
    <TenantSection title="承租名單">
      {form.tenants.map((tenant, index) => (
        <TenantRow>
          <Input value={tenant.name} />
          <Input value={tenant.phone} />
          <Textarea value={tenant.note} />
          <Button onClick={() => deleteTenant(index)}>刪除</Button>
        </TenantRow>
      ))}
      <Button onClick={() => addTenant()}>+ 新增承租人</Button>
    </TenantSection>

    {/* 車牌名單 (與車位系統同步) */}
    <LicensePlateSection title="車牌名單">
      {form.licensePlates.map((plate, index) => (
        <PlateRow>
          <Checkbox
            label="車位主"
            checked={plate.isParkingOwner}
            onChange={(v) => updatePlate(index, 'isParkingOwner', v)}
          />
          <Input
            value={plate.number}
            onChange={(v) => updatePlate(index, 'number', v)}
            // 預設選項: 車位系統中該住戶的車牌
            suggestions={getParkingPlatesByUnit(unitId)}
          />
          <Select
            options={['汽車', '機車', '腳踏車']}
            value={plate.type}
            onChange={(v) => updatePlate(index, 'type', v)}
          />
          <Button onClick={() => deletePlate(index)}>刪除</Button>
        </PlateRow>
      ))}
      <Button onClick={() => addPlate()}>+ 新增車牌</Button>
    </LicensePlateSection>

    {/* 磁扣設定 (三類) */}
    <AccessCardSection title="磁扣設定">
      <CardTabs>
        <Tab value="normal">一般磁扣</Tab>
        <Tab value="car_etc">汽車ETC</Tab>
        <Tab value="other_etc">其他ETC</Tab>
      </CardTabs>

      {/* 一般磁扣 */}
      {activeCardTab === 'normal' && (
        <NormalCardForm>
          {form.accessCards
            .filter(c => c.type === 'normal')
            .map((card, index) => (
              <CardRow key={index}>
                {/* 輸入框1: 依成員/承租人選擇 或 自由輸入 */}
                <Input
                  value={card.memberName}
                  onChange={(v) => updateCard(index, 'memberName', v)}
                  suggestions={[
                    ...familyMembers.map(m => m.name),
                    ...tenants.map(t => t.name)
                  ]}
                />
                {/* 輸入框2: 磁扣號碼 */}
                <Input
                  value={card.cardNumber}
                  onChange={(v) => updateCard(index, 'cardNumber', v)}
                />
                <Button onClick={() => deleteCard(index)}>刪除</Button>
              </CardRow>
            ))}
          <Button onClick={() => addCard('normal')}>+ 新增一般磁扣</Button>
        </NormalCardForm>
      )}

      {/* 汽車ETC */}
      {activeCardTab === 'car_etc' && (
        <CarEtcForm>
          {form.accessCards
            .filter(c => c.type === 'car_etc')
            .map((card, index) => (
              <CardRow key={index}>
                {/* 輸入框1: 依車牌名單選擇 */}
                <Select
                  options={licensePlates.map(p => p.number)}
                  value={card.memberName}
                  onChange={(v) => updateCard(index, 'memberName', v)}
                />
                {/* 輸入框2: 磁扣號碼 */}
                <Input
                  value={card.cardNumber}
                  onChange={(v) => updateCard(index, 'cardNumber', v)}
                />
                <Button onClick={() => deleteCard(index)}>刪除</Button>
              </CardRow>
            ))}
          <Button onClick={() => addCard('car_etc')}>+ 新增汽車ETC</Button>
        </CarEtcForm>
      )}

      {/* 其他ETC */}
      {activeCardTab === 'other_etc' && (
        <OtherEtcForm>
          {form.accessCards
            .filter(c => c.type === 'other_etc')
            .map((card, index) => (
              <CardRow key={index}>
                {/* 輸入框1: 依車位系統自訂類型選擇 */}
                <Select
                  options={getCustomParkingTypes()}
                  value={card.memberName}
                  onChange={(v) => updateCard(index, 'memberName', v)}
                />
                {/* 輸入框2: 磁扣號碼 */}
                <Input
                  value={card.cardNumber}
                  onChange={(v) => updateCard(index, 'cardNumber', v)}
                />
                <Button onClick={() => deleteCard(index)}>刪除</Button>
              </CardRow>
            ))}
          <Button onClick={() => addCard('other_etc')}>+ 新增其他ETC</Button>
        </OtherEtcForm>
      )}
    </AccessCardSection>
  </ResidentModal>
</ResidentSystem>
```

---

### 4. 車位統計 (ParkingSystem)

**需求規格**:
```
依設定顯示狀態 
顯示車位號碼 當前使用者  假如是租用除了資料卡顏色會變還會顯示(租)
```

**具體實作**:

```tsx
// src/views/Frontstage/ParkingSystem.tsx

<ParkingSystem>
  {/* 棟別篩選 */}
  <BuildingFilter
    buildings={buildings}
    selectedId={selectedBuildingId}
    onChange={setBuildingId}
  />

  {/* 車位卡片網格 */}
  <ParkingGrid>
    {parkingSpaces
      .filter(s => s.buildingId === selectedBuildingId)
      .map(space => (
        <ParkingCard
          space={space}
          // 依後台設定顯示顏色
          statusColor={getStatusColor(space.statusId, 'parking')}
          // 顯示租用標記
          rentalMark={space.type === 'resident' ? '(租)' : ''}
          // 當前使用者
          currentUser={space.currentUser}
          // 點擊編輯
          onEdit={() => openEditModal(space)}
        />
      ))}
  </ParkingGrid>
</ParkingSystem>

// 車位卡片
const ParkingCard: React.FC<{ space: ParkingSpace }> = ({ space }) => (
  <Card
    style={{
      backgroundColor: getStatusColor(space.statusId, 'parking'),
      opacity: space.status === 'maintenance' ? 0.7 : 1
    }}
  >
    <CardHeader>
      <Title>{space.number}</Title>
      {/* 租用標記 */}
      {space.type === 'resident' && <Badge>(租)</Badge>}
    </CardHeader>
    <CardContent>
      <Text>狀態: {getStatusName(space.statusId, 'parking')}</Text>
      {space.currentUser && (
        <Text>使用者: {space.currentUser}</Text>
      )}
      {space.rentalNote && (
        <Text>備註: {space.rentalNote}</Text>
      )}
    </CardContent>
  </Card>
)
```

---

### 5. 寄放系統 (DepositSystem)

**需求規格**:
```
寄放兩者 整合為 寄KEY/寄MONEY
依照後臺設定 選戶別 選樓層  選選項 備註
寄錢 點開設定後  選戶別 選樓層  輸入金額  備註
關於錢的部分需要一個功能  每筆資料都要有 加款 減款功能
加款 數目 收款時間 誰收的 備註 
減款 數目 付款時間 誰收的 備註 
自帶日誌功能 保留紀錄
```

**具體實作**:

#### 5.1 寄放類型
```typescript
// src/types/deposit.ts

type DepositCategory = 'key' | 'money'
type DepositType = 'deposit' | 'refund' | 'adjustment'

interface Deposit {
  id: string
  category: DepositCategory       // 'key' | 'money'
  unitId: string                 // 戶別ID
  unitNumber: string             // 戶別編號
  floorNumber: string            // 樓層

  // 鑰匙/磁扣
  keyInfo?: {
    type: 'key' | 'card'
    description: string          // 說明
    count: number                // 數量
  }

  // 款項
  moneyInfo?: {
    balance: number              // 當前餘額
    transactions: MoneyTransaction[]
  }

  note: string
  status: 'active' | 'refunded'

  createdAt: string
  updatedAt: string
}

interface MoneyTransaction {
  id: string
  type: 'add' | 'subtract'
  amount: number
  transactionDate: string
  collectedBy: string            // 誰收的
  note: string
  createdAt: string
}
```

#### 5.2 寄放系統 UI
```tsx
// src/views/Frontstage/DepositSystem.tsx

<DepositSystem>
  {/* 大分類切換 */}
  <CategoryTabs>
    <Tab value="key">寄KEY/寄磁扣</Tab>
    <Tab value="money">寄錢</Tab>
  </CategoryTabs>

  {/* 寄KEY/寄磁扣 */}
  {activeCategory === 'key' && (
    <KeyDepositSection>
      {/* 戶別選擇 */}
      <UnitSelector
        buildings={buildings}
        units={units}
        selectedUnitId={selectedUnitId}
        onChange={setSelectedUnitId}
      />

      {/* 寄放列表 */}
      <DepositList>
        {keyDeposits.map(deposit => (
          <DepositCard
            category="key"
            deposit={deposit}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </DepositList>

      {/* 新增寄放 */}
      <AddDepositForm category="key">
        <Select
          label="戶別"
          options={unitOptions}
          value={form.unitId}
          onChange={setUnitId}
        />
        <Select
          label="樓層"
          options={floorOptions}
          value={form.floorNumber}
          onChange={setFloorNumber}
        />
        <Select
          label="類型"
          options={[
            { value: 'key', label: '鑰匙' },
            { value: 'card', label: '磁扣' }
          ]}
          value={form.type}
          onChange={setType}
        />
        <Input label="說明" value={form.description} />
        <Input label="數量" type="number" value={form.count} />
        <Textarea label="備註" value={form.note} />
        <Button onClick={handleSubmit}>新增寄放</Button>
      </AddDepositForm>
    </KeyDepositSection>
  )}

  {/* 寄錢 */}
  {activeCategory === 'money' && (
    <MoneyDepositSection>
      {/* 戶別選擇 */}
      <UnitSelector
        buildings={buildings}
        units={units}
        selectedUnitId={selectedUnitId}
        onChange={setSelectedUnitId}
      />

      {/* 寄放列表 (顯示餘額) */}
      <DepositList>
        {moneyDeposits.map(deposit => (
          <DepositCard
            category="money"
            deposit={deposit}
            onEdit={handleEdit}
            onAddTransaction={handleAddTransaction}
          />
        ))}
      </DepositList>

      {/* 新增寄放 */}
      <AddDepositForm category="money">
        <Select
          label="戶別"
          options={unitOptions}
          value={form.unitId}
          onChange={setUnitId}
        />
        <Select
          label="樓層"
          options={floorOptions}
          value={form.floorNumber}
          onChange={setFloorNumber}
        />
        <Input label="初始金額" type="number" value={form.amount} />
        <Textarea label="備註" value={form.note} />
        <Button onClick={handleSubmit}>新增寄放</Button>
      </AddDepositForm>
    </MoneyDepositSection>
  )}
</DepositSystem>

// 寄放卡片 (含加/減款功能)
const DepositCard: React.FC<{ category: string, deposit: Deposit }> = ({ deposit }) => (
  <Card>
    <CardHeader>
      <Title>{deposit.unitNumber} - {deposit.floorNumber}</Title>
      <Badge>{deposit.status}</Badge>
    </CardHeader>
    <CardContent>
      {deposit.category === 'money' && (
        <>
          {/* 當前餘額 */}
          <BalanceDisplay>
            當前餘額: ${deposit.moneyInfo?.balance}
          </BalanceDisplay>

          {/* 交易記錄 */}
          <TransactionList>
            {deposit.moneyInfo?.transactions.map(tx => (
              <TransactionRow key={tx.id}>
                <Badge color={tx.type === 'add' ? 'green' : 'red'}>
                  {tx.type === 'add' ? '加款' : '減款'}
                </Badge>
                <Text>${tx.amount}</Text>
                <Text>{tx.transactionDate}</Text>
                <Text>收款人: {tx.collectedBy}</Text>
                <Text>備註: {tx.note}</Text>
              </TransactionRow>
            ))}
          </TransactionList>

          {/* 加款/減款按鈕 */}
          <Actions>
            <Button onClick={() => openTransactionModal(deposit, 'add')}>
              加款
            </Button>
            <Button onClick={() => openTransactionModal(deposit, 'subtract')}>
              減款
            </Button>
          </Actions>
        </>
      )}

      {/* 鑰匙/磁扣資訊 */}
      {deposit.category === 'key' && (
        <KeyInfo>
          <Text>類型: {deposit.keyInfo?.type === 'key' ? '鑰匙' : '磁扣'}</Text>
          <Text>說明: {deposit.keyInfo?.description}</Text>
          <Text>數量: {deposit.keyInfo?.count}</Text>
        </KeyInfo>
      )}

      {/* 備註 */}
      <Note>{deposit.note}</Note>

      {/* 操作日誌 */}
      <ActionLog
        createdAt={deposit.createdAt}
        updatedAt={deposit.updatedAt}
      />
    </CardContent>
  </Card>
)

// 加/減款 Modal
const TransactionModal: React.FC<{ type: 'add' | 'subtract' }> = ({ type }) => (
  <Modal>
    <Title>{type === 'add' ? '加款' : '減款'}</Title>
    <Input label="數目" type="number" value={form.amount} />
    <Input label="收款時間" type="datetime-local" value={form.transactionDate} />
    <Input label="誰收的" value={form.collectedBy} />
    <Textarea label="備註" value={form.note} />
    <Button onClick={handleSubmit}>
      {type === 'add' ? '確認加款' : '確認減款'}
    </Button>
  </Modal>
)
```

---

### 6. 管理費系統 (FeeSystem) - 新功能

**需求規格**:
```
自動依照 格局棟數產生分頁 並且依照格局產生對應 
戶別 的資料卡  每一戶別 可設定 多少坪數  1坪多少元 自動計算總數 每一戶別 要有備註欄
並且多一個 特殊戶型設定 可勾選多數戶別加總 可選自由輸入坪數 價錢 也可以依照 每一戶別坪數 價錢 計算
```

**具體實作**:

```typescript
// src/types/fee.ts

interface FeeConfig {
  id: string
  buildingId: string
  unitId: string
  unitNumber: string
  area: number              // 坪數
  pricePerArea: number      // 每坪多少元
  totalFee: number          // 自動計算: area * pricePerArea
  note: string              // 備註
  status: 'paid' | 'unpaid' | 'pending'
  dueDate: string
}

interface SpecialFeeConfig {
  id: string
  buildingId: string
  name: string              // 特殊費用名稱
  selectedUnitIds: string[] // 勾選的戶別
  type: 'total' | 'custom'  // 加總方式
  customArea?: number        // 自訂坪數 (自由輸入)
  customPrice?: number       // 自訂價錢 (自由輸入)
  calculatedAmount?: number  // 計算結果
}
```

```tsx
// src/views/Frontstage/FeeSystem.tsx

<FeeSystem>
  {/* 棟別分頁 */}
  <BuildingTabs>
    {buildings.map(building => (
      <Tab key={building.id} value={building.id}>
        {building.name}
      </Tab>
    ))}
  </BuildingTabs>

  {/* 一般戶型費用 */}
  <FeeSection title="一般戶型費用">
    <FeeGrid>
      {units
        .filter(u => u.buildingId === selectedBuildingId)
        .map(unit => (
          <FeeCard
            unit={unit}
            config={getFeeConfig(unit.id)}
            onEdit={handleEditFee}
          />
        ))}
    </FeeGrid>
  </FeeSection>

  {/* 特殊戶型設定 */}
  <SpecialFeeSection title="特殊戶型設定">
    <SpecialFeeForm>
      <Input label="費用名稱" value={form.name} />

      {/* 戶別勾選 */}
      <UnitCheckboxList
        units={units.filter(u => u.buildingId === selectedBuildingId)}
        selectedIds={form.selectedUnitIds}
        onChange={setSelectedUnitIds}
      />

      {/* 計算方式 */}
      <RadioGroup
        options={[
          { value: 'total', label: '依照每戶別坪數 x 單價計算' },
          { value: 'custom', label: '自由輸入坪數與單價' }
        ]}
        value={form.type}
        onChange={setType}
      />

      {form.type === 'custom' && (
        <>
          <Input
            label="自由輸入坪數"
            type="number"
            value={form.customArea}
            onChange={setCustomArea}
          />
          <Input
            label="自由輸入單價"
            type="number"
            value={form.customPrice}
            onChange={setCustomPrice}
          />
        </>
      )}

      {/* 計算結果 */}
      <CalculatedAmount>
        計算結果: ${form.calculatedAmount}
      </CalculatedAmount>

      <Button onClick={handleSave}>儲存特殊費用</Button>
    </SpecialFeeForm>
  </SpecialFeeSection>
</FeeSystem>

// 費用卡片
const FeeCard: React.FC<{ unit: Unit; config?: FeeConfig }> = ({ unit, config }) => (
  <Card>
    <CardHeader>
      <Title>{unit.unitNumber}</Title>
      <Badge status={config?.status}>{config?.status}</Badge>
    </CardHeader>
    <CardContent>
      <Input
        label="坪數"
        type="number"
        value={config?.area || 0}
        onChange={(v) => updateFeeConfig(unit.id, 'area', v)}
      />
      <Input
        label="每坪多少元"
        type="number"
        value={config?.pricePerArea || 0}
        onChange={(v) => updateFeeConfig(unit.id, 'pricePerArea', v)}
      />
      <CalculatedFee>
        應繳費用: ${(config?.area || 0) * (config?.pricePerArea || 0)}
      </CalculatedFee>
      <Textarea
        label="備註"
        value={config?.note || ''}
        onChange={(v) => updateFeeConfig(unit.id, 'note', v)}
      />
    </CardContent>
  </Card>
)
```

---

## 📁 相關檔案清單

### 需要修改的檔案

| 檔案 | 動作 | 說明 |
|------|------|------|
| `src/types/calendar.ts` | 新建 | 行事曆類型 |
| `src/types/facility.ts` | 新建 | 公設類型 |
| `src/types/resident.ts` | 新建 | 住戶類型 |
| `src/types/deposit.ts` | 新建 | 寄放類型 |
| `src/types/fee.ts` | 新建 | 管理費類型 |
| `src/views/Frontstage/CalendarSystem.tsx` | 重構 | 行事曆系統 |
| `src/views/Frontstage/FacilitySystemV2.tsx` | 重構 | 公設系統 |
| `src/views/Frontstage/ResidentSystemV2.tsx` | 重構 | 住戶系統 |
| `src/views/Frontstage/ParkingSystem.tsx` | 修改 | 車位統計 |
| `src/views/Frontstage/DepositSystem.tsx` | 重構 | 寄放系統 |
| `src/views/Frontstage/FeeSystem.tsx` | 重構 | 管理費系統 |

### 需要新增的檔案

| 檔案 | 說明 |
|------|------|
| `src/components/calendar/EventCard.tsx` | 行事曆卡片 |
| `src/components/calendar/EventModal.tsx` | 行事曆 Modal |
| `src/components/facility/BookingCard.tsx` | 預約卡片 |
| `src/components/facility/BookingModal.tsx` | 預約 Modal |
| `src/components/resident/ResidentCard.tsx` | 住戶卡片 |
| `src/components/resident/ResidentModal.tsx` | 住戶 Modal |
| `src/components/parking/ParkingCard.tsx` | 車位卡片 |
| `src/components/deposit/DepositCard.tsx` | 寄放卡片 |
| `src/components/deposit/TransactionModal.tsx` | 交易 Modal |
| `src/components/fee/FeeCard.tsx` | 費用卡片 |

---

## ✅ 完成標準

1. [ ] 行事曆: 支援圖片無限新增、狀態顏色、編輯追蹤
2. [ ] 公設: 棟別過濾、住戶選擇、付款按鈕、操作日誌
3. [ ] 住戶: 棟別分頁、狀態統計、承租名單、三類磁扣、車牌同步
4. [ ] 車位: 狀態顏色、租用標記、使用者顯示
5. [ ] 寄放: 分類寄放、加減款、收款人、日誌
6. [ ] 管理費: 棟數分頁、坪數單價、自動計算、特殊戶型
7. [ ] 所有狀態從後台讀取，即時更新
8. [ ] 通過 ESLint 檢查，無 TypeScript 錯誤

---

## 🔗 依賴後台介面

```typescript
// 後台提供的資料 (從 store 讀取)
const parkingStatuses = useAppSelector(state => state.config.parkingStatuses)
const calendarStatuses = useAppSelector(state => state.config.calendarStatuses)
const houseStatuses = useAppSelector(state => state.config.houseStatuses)

const buildings = useAppSelector(state => state.building.buildings)
const units = useAppSelector(state => state.unit.units)
const floors = useAppSelector(state => state.floor.floors)
const parkingSpaces = useAppSelector(state => state.parking.spaces)
const facilities = useAppSelector(state => state.facility.facilities)

// 車位系統同步
const updateLicensePlate = useAppDispatch().parking.updateLicensePlate
const updateAccessCard = useAppDispatch().parking.updateAccessCard
```

**重要**: 前台所有狀態顏色必須從後台的 `config` store 讀取，確保前後台一致。
