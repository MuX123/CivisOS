/**
 * 清除原有数据 → 重新模拟 → 保留数据
 * 一键完成全部操作
 * 
 * 运行方式：在浏览器控制台中粘贴运行
 */

(async function clearAndResimulate() {
  console.clear();
  console.log('🚀 开始清除数据并重新模拟...\n');
  console.log('='.repeat(70));
  
  // 检查 Redux store
  const store = window.store;
  if (!store) {
    console.error('❌ 未找到 Redux store！请确保在应用页面中运行');
    return;
  }
  
  const dispatch = store.dispatch;
  const getState = store.getState;
  
  // ==================== Step 1: 清除所有原有数据 ====================
  console.log('\n📋 Step 1: 清除所有原有数据...');
  
  // 清除建筑数据
  dispatch({
    type: 'building/rehydrate',
    payload: {
      buildings: [],
      floors: [],
      units: [],
      parkingSpaces: [],
    }
  });
  console.log('✅ 已清除建筑、楼层、户别、车位数据');
  
  // 清住戶数据
  dispatch({
    type: 'resident/rehydrate',
    payload: {
      residents: [],
    }
  });
  console.log('✅ 已清除住戶数据');
  
  // 清除车位数据
  dispatch({
    type: 'parking/rehydrate',
    payload: {
      spaces: [],
      zones: [],
      areas: [],
    }
  });
  console.log('✅ 已清除车位系统数据');
  
  // 清除日历事件
  dispatch({
    type: 'calendar/rehydrate',
    payload: {
      events: [],
    }
  });
  console.log('✅ 已清除日历事件');
  
  // 清除管理费
  dispatch({
    type: 'fee/rehydrate',
    payload: {
      periods: [],
      unitFees: [],
    }
  });
  console.log('✅ 已清除管理费记录');
  
  // 清除公设租借
  dispatch({
    type: 'facility/rehydrate',
    payload: {
      bookings: [],
    }
  });
  console.log('✅ 已清除公设租借记录');
  
  // 清除通知
  dispatch({
    type: 'notification/rehydrate',
    payload: {
      notifications: [],
    }
  });
  console.log('✅ 已清除通知公告');
  
  // 清除押金/寄放
  dispatch({
    type: 'depositV2/rehydrate',
    payload: {
      items: [],
    }
  });
  console.log('✅ 已清除押金/寄放记录');
  
  // 立即持久化清除操作
  if (window.forcePersist) {
    await window.forcePersist(getState());
    console.log('✅ 数据清除已保存到本地存储');
  }
  
  console.log('\n' + '-'.repeat(70));
  console.log('🧹 所有原有数据已清除！');
  console.log('-'.repeat(70));
  
  // ==================== Step 2: 运行新的模拟 ====================
  console.log('\n📋 Step 2: 开始生成新的1年模拟数据...\n');
  
  // 配置
  const CONFIG = {
    building: {
      code: 'A',
      name: '第一棟',
      units: 6,
      residentsPerUnit: 3,
    },
    facilities: [
      { id: 'f1', name: '健身房', hourlyRate: 100 },
      { id: 'f2', name: '會議室', hourlyRate: 200 },
      { id: 'f3', name: 'KTV室', hourlyRate: 150 },
      { id: 'f4', name: '游泳池', hourlyRate: 50 },
    ],
    fee: {
      pricePerPing: 80,
      avgArea: 35,
      dueDay: 10,
    },
    probabilities: {
      bookingPerDay: 0.3,
      latePayment: 0.2,
      eventPerMonth: 0.8,
    }
  };
  
  // 数据容器
  const simulationData = {
    building: null,
    floors: [],
    units: [],
    residents: [],
    parkingZones: [],
    parkingSpaces: [],
    calendarEvents: [],
    facilityBookings: [],
    feeRecords: [],
    notifications: [],
    deposits: [],
  };
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  
  // 生成数据
  console.log('📅 模拟时间:', formatDate(startDate), '至', formatDate(endDate));
  
  // Step 2.1: 创建基础数据
  console.log('\n📋 创建基础建筑数据...');
  createBuildingData(simulationData, CONFIG);
  console.log('✅ 楼层:', simulationData.floors.length);
  console.log('✅ 户别:', simulationData.units.length);
  console.log('✅ 住戶:', simulationData.residents.length);
  console.log('✅ 车位:', simulationData.parkingSpaces.length);
  
  // Step 2.2: 生成日历事件
  console.log('\n📋 生成日历事件...');
  generateCalendarEvents(simulationData, CONFIG, startDate, endDate);
  console.log('✅ 日历事件:', simulationData.calendarEvents.length, '个');
  
  // Step 2.3: 生成管理费
  console.log('\n📋 生成管理费记录...');
  generateFeeRecords(simulationData, CONFIG, startDate, endDate);
  console.log('✅ 管理费:', simulationData.feeRecords.length, '笔');
  
  // Step 2.4: 生成公设租借
  console.log('\n📋 生成公设租借记录...');
  generateFacilityBookings(simulationData, CONFIG, startDate, endDate);
  console.log('✅ 公设租借:', simulationData.facilityBookings.length, '笔');
  
  // Step 2.5: 生成通知
  console.log('\n📋 生成通知公告...');
  generateNotifications(simulationData, CONFIG, startDate, endDate);
  console.log('✅ 通知:', simulationData.notifications.length, '条');
  
  // Step 2.6: 生成押金/寄放
  console.log('\n📋 生成押金/寄放记录...');
  generateDeposits(simulationData, CONFIG, startDate, endDate);
  console.log('✅ 押金/寄放:', simulationData.deposits.length, '条');
  
  // ==================== Step 3: 导入到系统 ====================
  console.log('\n' + '='.repeat(70));
  console.log('📋 Step 3: 导入数据到系统...');
  console.log('='.repeat(70));
  
  // 导入建筑数据
  console.log('\n1️⃣ 导入建筑数据...');
  dispatch({
    type: 'building/rehydrate',
    payload: {
      buildings: [simulationData.building],
      floors: simulationData.floors,
      units: simulationData.units,
      parkingSpaces: simulationData.parkingSpaces.map(ps => ({
        id: ps.id,
        buildingId: simulationData.building.id,
        floorId: simulationData.parkingZones.find(z => z.id === ps.area)?.floorId,
        areaId: ps.area,
        number: ps.number,
        type: ps.type,
        status: ps.status,
        occupantName: ps.occupantName,
      })),
    }
  });
  console.log('✅ 建筑数据已导入');
  
  // 导入住戶
  console.log('\n2️⃣ 导入住戶数据...');
  dispatch({
    type: 'resident/rehydrate',
    payload: {
      residents: simulationData.residents.map(r => ({
        ...r,
        members: [],
      })),
    }
  });
  console.log('✅ 住戶数据已导入');
  
  // 导入车位
  console.log('\n3️⃣ 导入车位数据...');
  dispatch({
    type: 'parking/rehydrate',
    payload: {
      spaces: simulationData.parkingSpaces,
      zones: simulationData.parkingZones,
      areas: simulationData.parkingZones.map(z => ({
        id: z.id,
        name: z.name,
        totalSpaces: simulationData.parkingSpaces.filter(s => s.area === z.id).length,
      })),
    }
  });
  console.log('✅ 车位数据已导入');
  
  // 导入日历
  console.log('\n4️⃣ 导入日历事件...');
  dispatch({
    type: 'calendar/rehydrate',
    payload: {
      events: simulationData.calendarEvents.map(evt => ({
        id: evt.id,
        title: evt.title,
        start: evt.date,
        end: evt.date,
        category: evt.type,
        color: evt.color,
        description: evt.description,
        allDay: evt.type === 'holiday',
      })),
    }
  });
  console.log('✅ 日历事件已导入');
  
  // 导入管理费
  console.log('\n5️⃣ 导入管理费...');
  const feePeriods = {};
  simulationData.feeRecords.forEach(fee => {
    if (!feePeriods[fee.period]) {
      feePeriods[fee.period] = {
        id: `period-${fee.period}`,
        name: fee.period,
        dueDate: fee.dueDate,
        status: 'closed',
      };
    }
  });
  
  dispatch({
    type: 'fee/rehydrate',
    payload: {
      periods: Object.values(feePeriods),
      unitFees: simulationData.feeRecords.map(fee => ({
        id: fee.id,
        unitId: fee.unitId,
        period: fee.period,
        baseFee: fee.amount,
        additionalTotal: fee.lateFee || 0,
        totalFee: fee.amount + (fee.lateFee || 0),
        paymentStatus: fee.paymentStatus,
        paymentDate: fee.paymentDate,
        paymentMethod: fee.paymentMethod,
      })),
    }
  });
  console.log('✅ 管理费记录已导入');
  
  // 导入公设租借
  console.log('\n6️⃣ 导入公设租借...');
  dispatch({
    type: 'facility/rehydrate',
    payload: {
      bookings: simulationData.facilityBookings.map(booking => ({
        id: booking.id,
        facilityId: booking.facilityId,
        facilityName: booking.facilityName,
        residentId: booking.residentId,
        residentName: booking.residentName,
        unitNumber: booking.unitNumber,
        startTime: new Date(new Date(booking.bookingDate).setHours(parseInt(booking.startTime))),
        endTime: new Date(new Date(booking.bookingDate).setHours(parseInt(booking.endTime))),
        totalAmount: booking.amount,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
        notes: booking.notes,
      })),
    }
  });
  console.log('✅ 公设租借已导入');
  
  // ==================== Step 4: 保存数据 ====================
  console.log('\n' + '='.repeat(70));
  console.log('💾 Step 4: 保存数据到本地存储...');
  console.log('='.repeat(70));
  
  // 等待一下确保 state 更新
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 强制持久化
  if (window.forcePersist) {
    try {
      await window.forcePersist(getState());
      console.log('✅ 数据已保存到本地存储');
    } catch (e) {
      console.warn('⚠️ 立即保存失败，数据将在下次操作时自动保存');
    }
  } else {
    console.log('ℹ️ 数据将在下次操作时自动保存');
  }
  
  // ==================== 总结 ====================
  console.log('\n' + '='.repeat(70));
  console.log('🎉 完成！数据已清除并重新模拟');
  console.log('='.repeat(70));
  
  console.log('\n📊 新生成的数据：');
  console.log(`   🏢 建筑: ${simulationData.building.name} (A栋)`);
  console.log(`   📐 楼层: ${simulationData.floors.length} 层`);
  console.log(`   🏠 户别: ${simulationData.units.length} 户`);
  console.log(`   👥 住戶: ${simulationData.residents.length} 人`);
  console.log(`   🚗 车位: ${simulationData.parkingSpaces.length} 个`);
  console.log(`   📅 日历: ${simulationData.calendarEvents.length} 个事件`);
  console.log(`   💰 管理费: ${simulationData.feeRecords.length} 笔`);
  console.log(`   🏊 公设租借: ${simulationData.facilityBookings.length} 笔`);
  console.log(`   📢 通知: ${simulationData.notifications.length} 条`);
  console.log(`   📦 押金/寄放: ${simulationData.deposits.length} 条`);
  
  console.log('\n💡 提示: 刷新页面查看新数据');
  
  // 保存到全局
  window.simulationData = simulationData;
  window.simulationConfig = CONFIG;
  
  return simulationData;
})();

// ==================== 数据生成函数 ====================

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function createBuildingData(data, CONFIG) {
  const building = {
    id: 'sim-bld-A-' + Date.now(),
    buildingCode: 'A',
    name: '第一棟',
    houseNumberPrefix: 'A',
    roofFloors: 1,
    residentialFloors: 3,
    basementFloors: 1,
    unitsPerFloor: 2,
    totalFloors: 5,
    totalUnits: 6,
    status: 'active',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  };
  
  data.building = building;
  
  data.floors = [
    { id: 'f1-' + Date.now(), buildingId: building.id, floorNumber: 'R1', name: 'R1樓', floorType: 'roof', sortOrder: -101 },
    { id: 'f2-' + Date.now(), buildingId: building.id, floorNumber: '1F', name: '1樓', floorType: 'residential', sortOrder: 1 },
    { id: 'f3-' + Date.now(), buildingId: building.id, floorNumber: '2F', name: '2樓', floorType: 'residential', sortOrder: 2 },
    { id: 'f4-' + Date.now(), buildingId: building.id, floorNumber: '3F', name: '3樓', floorType: 'residential', sortOrder: 3 },
    { id: 'f5-' + Date.now(), buildingId: building.id, floorNumber: 'B1', name: 'B1地下室', floorType: 'basement', sortOrder: 101 },
  ];
  
  const firstNames = ['陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊'];
  const lastNames = ['大明', '小華', '志偉', '雅芳', '淑芬', '建宏', '婷婷', '俊杰', '美玲', '志成'];
  
  const residentialFloors = data.floors.filter(f => f.floorType === 'residential');
  residentialFloors.forEach(floor => {
    for (let i = 1; i <= 2; i++) {
      const floorNum = floor.floorNumber.replace('F', '');
      const unitId = `unit-${floor.id}-${i}`;
      
      data.units.push({
        id: unitId,
        buildingId: building.id,
        floorId: floor.id,
        unitNumber: `${building.buildingCode}${floorNum}${String(i).padStart(2, '0')}`,
        floorNumber: floor.floorNumber,
        floorType: 'residential',
        area: 30 + Math.floor(Math.random() * 20),
        sortOrder: floor.sortOrder * 10 + i,
        status: 'occupied',
      });
      
      const numResidents = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < numResidents; j++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        data.residents.push({
          id: `resident-${unitId}-${j}-${Date.now()}`,
          unitId: unitId,
          name: firstName + lastName,
          phone: `09${String(Math.floor(Math.random() * 1000000000)).padStart(8, '0')}`,
          email: `${firstName}${lastName}@example.com`,
          moveInDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
        });
      }
    }
  });
  
  const basementFloor = data.floors.find(f => f.floorType === 'basement');
  data.parkingZones = [
    { id: 'zone-b1-1-' + Date.now(), buildingId: building.id, floorId: basementFloor.id, name: 'B1住戶區', type: 'resident' },
    { id: 'zone-b1-2-' + Date.now(), buildingId: building.id, floorId: basementFloor.id, name: 'B1訪客區', type: 'visitor' },
  ];
  
  data.parkingZones.forEach((zone, zoneIdx) => {
    for (let i = 1; i <= 6; i++) {
      data.parkingSpaces.push({
        id: `space-${zone.id}-${i}`,
        area: zone.id,
        number: `${zone.type === 'resident' ? 'A' : 'V'}${String(i).padStart(2, '0')}`,
        type: zone.type,
        status: zone.type === 'resident' ? 'occupied' : 'available',
        occupantName: zone.type === 'resident' ? data.residents[i - 1]?.name : null,
      });
    }
  });
}

function generateCalendarEvents(data, CONFIG, startDate, endDate) {
  const holidays = [
    { month: 1, day: 1, name: '元旦' },
    { month: 2, day: 10, name: '農曆新年' },
    { month: 4, day: 4, name: '兒童節' },
    { month: 4, day: 5, name: '清明節' },
    { month: 5, day: 1, name: '勞動節' },
    { month: 6, day: 10, name: '端午節' },
    { month: 9, day: 17, name: '中秋節' },
    { month: 10, day: 10, name: '國慶日' },
    { month: 12, day: 25, name: '聖誕節' },
  ];
  
  const eventTypes = [
    { type: 'community', name: '社區活動', color: '#5865F2' },
    { type: 'maintenance', name: '設施維護', color: '#F59E0B' },
    { type: 'security', name: '安全檢查', color: '#EF4444' },
    { type: 'meeting', name: '管委會會議', color: '#10B981' },
  ];
  
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    
    const holiday = holidays.find(h => h.month === month && h.day === day);
    if (holiday) {
      data.calendarEvents.push({
        id: `evt-holiday-${month}-${day}`,
        title: holiday.name,
        date: new Date(currentDate).toISOString(),
        type: 'holiday',
        color: '#EF4444',
        description: `慶祝${holiday.name}`,
      });
    }
    
    if (Math.random() < CONFIG.probabilities.eventPerMonth / 30) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      data.calendarEvents.push({
        id: `evt-${Date.now()}-${Math.random()}`,
        title: eventType.name,
        date: new Date(currentDate).toISOString(),
        type: eventType.type,
        color: eventType.color,
        description: generateEventDescription(eventType.type),
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

function generateFeeRecords(data, CONFIG, startDate, endDate) {
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    if (currentDate.getDate() === CONFIG.fee.dueDay) {
      data.units.forEach(unit => {
        const baseFee = unit.area * CONFIG.fee.pricePerPing;
        const isLate = Math.random() < CONFIG.probabilities.latePayment;
        const daysLate = isLate ? Math.floor(Math.random() * 15) + 1 : 0;
        
        data.feeRecords.push({
          id: `fee-${unit.id}-${formatDate(currentDate)}`,
          unitId: unit.id,
          period: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
          amount: baseFee,
          area: unit.area,
          pricePerPing: CONFIG.fee.pricePerPing,
          dueDate: new Date(currentDate).toISOString(),
          paymentStatus: isLate ? (daysLate > 10 ? 'unpaid' : 'partial') : 'paid',
          paymentDate: isLate 
            ? new Date(currentDate.getTime() + daysLate * 24 * 60 * 60 * 1000).toISOString()
            : new Date(currentDate).toISOString(),
          daysLate: daysLate,
          lateFee: daysLate > 10 ? Math.floor(baseFee * 0.05) : 0,
          paymentMethod: ['cash', 'transfer', 'credit_card'][Math.floor(Math.random() * 3)],
        });
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

function generateFacilityBookings(data, CONFIG, startDate, endDate) {
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    if (Math.random() < CONFIG.probabilities.bookingPerDay) {
      const numBookings = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numBookings; i++) {
        const facility = CONFIG.facilities[Math.floor(Math.random() * CONFIG.facilities.length)];
        const resident = data.residents[Math.floor(Math.random() * data.residents.length)];
        const unit = data.units.find(u => u.id === resident.unitId);
        const startHour = 9 + Math.floor(Math.random() * 10);
        const duration = 1 + Math.floor(Math.random() * 3);
        
        data.facilityBookings.push({
          id: `booking-${Date.now()}-${i}`,
          facilityId: facility.id,
          facilityName: facility.name,
          residentId: resident.id,
          residentName: resident.name,
          unitNumber: unit?.unitNumber || 'Unknown',
          bookingDate: new Date(currentDate).toISOString(),
          startTime: `${String(startHour).padStart(2, '0')}:00`,
          endTime: `${String(startHour + duration).padStart(2, '0')}:00`,
          duration: duration,
          amount: facility.hourlyRate * duration,
          paymentStatus: Math.random() > 0.1 ? 'paid' : 'unpaid',
          bookingStatus: Math.random() > 0.05 ? 'confirmed' : 'cancelled',
          notes: Math.random() > 0.5 ? '請保持清潔' : '',
        });
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

function generateNotifications(data, CONFIG, startDate, endDate) {
  const notifTypes = [
    { type: 'info', title: '社區公告', frequency: 0.1 },
    { type: 'warning', title: '停水停電通知', frequency: 0.05 },
    { type: 'success', title: '活動報名成功', frequency: 0.08 },
    { type: 'error', title: '費用催繳通知', frequency: 0.03 },
  ];
  
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    notifTypes.forEach(notifType => {
      if (Math.random() < notifType.frequency) {
        data.notifications.push({
          id: `notif-${Date.now()}-${Math.random()}`,
          type: notifType.type,
          title: notifType.title,
          message: generateNotificationMessage(notifType.type),
          createdAt: new Date(currentDate).toISOString(),
          read: Math.random() > 0.3,
        });
      }
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

function generateDeposits(data, CONFIG, startDate, endDate) {
  const depositTypes = ['key', 'card', 'parcel'];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (currentDate.getDay() === 1 && Math.random() < 0.3) {
      const numDeposits = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numDeposits; i++) {
        const resident = data.residents[Math.floor(Math.random() * data.residents.length)];
        const depositType = depositTypes[Math.floor(Math.random() * depositTypes.length)];
        
        data.deposits.push({
          id: `deposit-${Date.now()}-${i}`,
          residentId: resident.id,
          type: depositType,
          itemName: generateDepositItemName(depositType),
          depositedAt: new Date(currentDate).toISOString(),
          status: Math.random() > 0.2 ? 'retrieved' : 'deposited',
          retrievedAt: Math.random() > 0.2 
            ? new Date(currentDate.getTime() + (1 + Math.floor(Math.random() * 7)) * 24 * 60 * 60 * 1000).toISOString()
            : null,
          notes: '請妥善保管',
        });
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

function generateEventDescription(type) {
  const descs = {
    community: ['社區聯誼活動', '社區清潔日', '電影欣賞會'],
    maintenance: ['電梯保養', '消防檢修', '水塔清洗'],
    security: ['安全巡邏', '門禁更新', '監視器維護'],
    meeting: ['管委會例會', '財務報告', '規約修訂'],
  };
  const list = descs[type] || ['活動'];
  return list[Math.floor(Math.random() * list.length)];
}

function generateNotificationMessage(type) {
  const msgs = {
    info: ['新設施啟用', '管理費調整', '活動報名開始'],
    warning: ['明日停水', '電梯保養', '颱風防護'],
    success: ['報名成功', '預約確認', '繳費成功'],
    error: ['費用未繳', '預約逾期', '請補繳費用'],
  };
  const list = msgs[type] || ['通知'];
  return list[Math.floor(Math.random() * list.length)];
}

function generateDepositItemName(type) {
  const items = {
    key: ['備用鑰匙', '信箱鑰匙', '停車位鑰匙'],
    card: ['門禁卡', '電梯卡', '訪客卡'],
    parcel: ['包裹', '信件', '貨到付款'],
  };
  const list = items[type] || ['物品'];
  return list[Math.floor(Math.random() * list.length)];
}

// 导出
window.clearAndResimulate = clearAndResimulate;
console.log('✅ 清除并重模拟脚本已加载');
console.log('💡 运行方式: 直接回车或运行 window.clearAndResimulate()');
