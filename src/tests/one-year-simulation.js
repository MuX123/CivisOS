/**
 * 真实使用场景模拟：1年使用记录生成器
 * 
 * 配置：
 * - 1栋建筑 (A栋)
 * - 6户住戶
 * - 1年时间 (365天)
 * - 包含：节日、计划、管理费、公设租借等
 * 
 * 运行方式：在浏览器控制台中粘贴运行
 */

(function runOneYearSimulation() {
  console.clear();
  console.log('🚀 开始1年真实使用场景模拟...\n');
  console.log('='.repeat(70));
  
  // ==================== 配置 ====================
  const CONFIG = {
    building: {
      code: 'A',
      name: '第一棟',
      units: 6,
      residentsPerUnit: 2 + Math.floor(Math.random() * 3), // 2-4人/户
    },
    facilities: [
      { id: 'f1', name: '健身房', hourlyRate: 100, maxBookingsPerDay: 3 },
      { id: 'f2', name: '會議室', hourlyRate: 200, maxBookingsPerDay: 2 },
      { id: 'f3', name: 'KTV室', hourlyRate: 150, maxBookingsPerDay: 2 },
      { id: 'f4', name: '游泳池', hourlyRate: 50, maxBookingsPerDay: 5 },
    ],
    fee: {
      pricePerPing: 80,
      avgArea: 35, // 平均35坪
      dueDay: 10, // 每月10号缴费
    },
    probabilities: {
      bookingPerDay: 0.3, // 30%概率每天有人预约
      latePayment: 0.2, // 20%概率迟缴费
      eventPerMonth: 0.8, // 80%概率每月有活动
    }
  };
  
  // ==================== 初始化数据 ====================
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
  
  // 时间范围：从今天开始往前1年
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  
  console.log('📅 模拟时间范围:', formatDate(startDate), '至', formatDate(endDate));
  console.log('🏢 建筑配置:', CONFIG.building.name, '-', CONFIG.building.units, '户');
  console.log('🏊 公设数量:', CONFIG.facilities.length, '个');
  console.log('');
  
  // ==================== Step 1: 创建基础数据 ====================
  console.log('📋 Step 1: 创建基础建筑数据...');
  createBuildingData();
  console.log('✅ 创建完成');
  console.log('   楼层:', simulationData.floors.length, '层');
  console.log('   户别:', simulationData.units.length, '户');
  console.log('   住戶:', simulationData.residents.length, '人');
  console.log('   车位:', simulationData.parkingSpaces.length, '个');
  
  // ==================== Step 2: 生成日历事件 ====================
  console.log('\n📋 Step 2: 生成1年日历事件...');
  generateCalendarEvents(startDate, endDate);
  console.log('✅ 生成', simulationData.calendarEvents.length, '个事件');
  
  // ==================== Step 3: 生成管理费记录 ====================
  console.log('\n📋 Step 3: 生成1年管理费缴费记录...');
  generateFeeRecords(startDate, endDate);
  console.log('✅ 生成', simulationData.feeRecords.length, '笔缴费记录');
  
  // ==================== Step 4: 生成公设租借记录 ====================
  console.log('\n📋 Step 4: 生成1年公设租借记录...');
  generateFacilityBookings(startDate, endDate);
  console.log('✅ 生成', simulationData.facilityBookings.length, '笔租借记录');
  
  // ==================== Step 5: 生成通知公告 ====================
  console.log('\n📋 Step 5: 生成通知公告...');
  generateNotifications(startDate, endDate);
  console.log('✅ 生成', simulationData.notifications.length, '条通知');
  
  // ==================== Step 6: 生成押金/寄放记录 ====================
  console.log('\n📋 Step 6: 生成押金/寄放记录...');
  generateDeposits(startDate, endDate);
  console.log('✅ 生成', simulationData.deposits.length, '条记录');
  
  // ==================== 统计与总结 ====================
  console.log('\n' + '='.repeat(70));
  printSimulationSummary();
  console.log('='.repeat(70));
  
  // 保存数据到全局
  window.simulationData = simulationData;
  window.simulationConfig = CONFIG;
  
  console.log('\n💡 提示: 完整模拟数据已保存到 window.simulationData');
  console.log('   可访问 window.simulationData 查看所有生成的数据');
  
  return simulationData;
})();

// ==================== 数据生成函数 ====================

function createBuildingData() {
  // 创建栋数
  const building = {
    id: 'sim-bld-A',
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
  
  simulationData.building = building;
  
  // 创建楼层
  const floors = [
    { id: 'f1', buildingId: building.id, floorNumber: 'R1', name: 'R1樓', floorType: 'roof', sortOrder: -101 },
    { id: 'f2', buildingId: building.id, floorNumber: '1F', name: '1樓', floorType: 'residential', sortOrder: 1 },
    { id: 'f3', buildingId: building.id, floorNumber: '2F', name: '2樓', floorType: 'residential', sortOrder: 2 },
    { id: 'f4', buildingId: building.id, floorNumber: '3F', name: '3樓', floorType: 'residential', sortOrder: 3 },
    { id: 'f5', buildingId: building.id, floorNumber: 'B1', name: 'B1地下室', floorType: 'basement', sortOrder: 101 },
  ];
  simulationData.floors = floors;
  
  // 创建户别
  const units = [];
  const residentialFloors = floors.filter(f => f.floorType === 'residential');
  residentialFloors.forEach(floor => {
    for (let i = 1; i <= 2; i++) {
      const floorNum = floor.floorNumber.replace('F', '');
      units.push({
        id: `unit-${floor.id}-${i}`,
        buildingId: building.id,
        floorId: floor.id,
        unitNumber: `${building.buildingCode}${floorNum}${String(i).padStart(2, '0')}`,
        floorNumber: floor.floorNumber,
        floorType: 'residential',
        area: 30 + Math.floor(Math.random() * 20), // 30-50坪
        sortOrder: floor.sortOrder * 10 + i,
        status: 'occupied',
      });
    }
  });
  simulationData.units = units;
  
  // 创建住戶
  const firstNames = ['陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊'];
  const lastNames = ['大明', '小華', '志偉', '雅芳', '淑芬', '建宏', '婷婷', '俊杰', '美玲', '志成'];
  
  units.forEach(unit => {
    const numResidents = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numResidents; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      simulationData.residents.push({
        id: `resident-${unit.id}-${i}`,
        unitId: unit.id,
        name: firstName + lastName,
        phone: `09${String(Math.floor(Math.random() * 1000000000)).padStart(8, '0')}`,
        email: `${firstName}${lastName}@example.com`,
        moveInDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      });
    }
  });
  
  // 创建车位分区
  const basementFloor = floors.find(f => f.floorType === 'basement');
  const zones = [
    { id: 'zone-b1-1', buildingId: building.id, floorId: basementFloor.id, name: 'B1住戶區', type: 'resident' },
    { id: 'zone-b1-2', buildingId: building.id, floorId: basementFloor.id, name: 'B1訪客區', type: 'visitor' },
  ];
  simulationData.parkingZones = zones;
  
  // 创建车位
  zones.forEach((zone, zoneIdx) => {
    for (let i = 1; i <= 6; i++) {
      simulationData.parkingSpaces.push({
        id: `space-${zone.id}-${i}`,
        area: zone.id,
        number: `${zone.type === 'resident' ? 'A' : 'V'}${String(i).padStart(2, '0')}`,
        type: zone.type,
        status: zone.type === 'resident' ? 'occupied' : 'available',
        occupantName: zone.type === 'resident' ? simulationData.residents[i - 1]?.name : null,
      });
    }
  });
}

function generateCalendarEvents(startDate, endDate) {
  const holidays = [
    { month: 1, day: 1, name: '元旦', type: 'holiday' },
    { month: 2, day: 10, name: '農曆新年', type: 'holiday' },
    { month: 4, day: 4, name: '兒童節', type: 'holiday' },
    { month: 4, day: 5, name: '清明節', type: 'holiday' },
    { month: 5, day: 1, name: '勞動節', type: 'holiday' },
    { month: 6, day: 10, name: '端午節', type: 'holiday' },
    { month: 9, day: 17, name: '中秋節', type: 'holiday' },
    { month: 10, day: 10, name: '國慶日', type: 'holiday' },
    { month: 12, day: 25, name: '聖誕節', type: 'holiday' },
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
    
    // 添加固定节日
    const holiday = holidays.find(h => h.month === month && h.day === day);
    if (holiday) {
      simulationData.calendarEvents.push({
        id: `evt-holiday-${formatDateKey(currentDate)}`,
        title: holiday.name,
        date: new Date(currentDate).toISOString(),
        type: 'holiday',
        color: '#EF4444',
        description: `慶祝${holiday.name}`,
      });
    }
    
    // 随机生成社区活动
    if (Math.random() < CONFIG.probabilities.eventPerMonth / 30) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      simulationData.calendarEvents.push({
        id: `evt-${formatDateKey(currentDate)}-${Math.random().toString(36).substr(2, 9)}`,
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

function generateFeeRecords(startDate, endDate) {
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // 每月10号生成缴费记录
    if (currentDate.getDate() === CONFIG.fee.dueDay) {
      simulationData.units.forEach(unit => {
        const baseFee = unit.area * CONFIG.fee.pricePerPing;
        const isLate = Math.random() < CONFIG.probabilities.latePayment;
        const daysLate = isLate ? Math.floor(Math.random() * 15) + 1 : 0;
        
        simulationData.feeRecords.push({
          id: `fee-${unit.id}-${formatDateKey(currentDate)}`,
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

function generateFacilityBookings(startDate, endDate) {
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // 每天有一定概率有预约
    if (Math.random() < CONFIG.probabilities.bookingPerDay) {
      const numBookings = 1 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numBookings; i++) {
        const facility = CONFIG.facilities[Math.floor(Math.random() * CONFIG.facilities.length)];
        const resident = simulationData.residents[Math.floor(Math.random() * simulationData.residents.length)];
        const unit = simulationData.units.find(u => u.id === resident.unitId);
        
        const startHour = 9 + Math.floor(Math.random() * 10); // 9:00 - 19:00
        const duration = 1 + Math.floor(Math.random() * 3); // 1-3小时
        
        simulationData.facilityBookings.push({
          id: `booking-${formatDateKey(currentDate)}-${i}`,
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
          paymentStatus: Math.random() > 0.1 ? 'paid' : 'unpaid', // 90%已付款
          bookingStatus: Math.random() > 0.05 ? 'confirmed' : 'cancelled', // 5%取消率
          notes: generateBookingNotes(),
        });
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

function generateNotifications(startDate, endDate) {
  const notificationTypes = [
    { type: 'info', title: '社區公告', frequency: 0.1 },
    { type: 'warning', title: '停水停電通知', frequency: 0.05 },
    { type: 'success', title: '活動報名成功', frequency: 0.08 },
    { type: 'error', title: '費用催繳通知', frequency: 0.03 },
  ];
  
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    notificationTypes.forEach(notifType => {
      if (Math.random() < notifType.frequency) {
        simulationData.notifications.push({
          id: `notif-${formatDateKey(currentDate)}-${Math.random().toString(36).substr(2, 9)}`,
          type: notifType.type,
          title: notifType.title,
          message: generateNotificationMessage(notifType.type),
          createdAt: new Date(currentDate).toISOString(),
          read: Math.random() > 0.3, // 70%已读
        });
      }
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

function generateDeposits(startDate, endDate) {
  const depositTypes = ['key', 'card', 'parcel'];
  
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // 每周有一定概率有押金/寄放记录
    if (currentDate.getDay() === 1 && Math.random() < 0.3) { // 周一
      const numDeposits = 1 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numDeposits; i++) {
        const resident = simulationData.residents[Math.floor(Math.random() * simulationData.residents.length)];
        const depositType = depositTypes[Math.floor(Math.random() * depositTypes.length)];
        
        simulationData.deposits.push({
          id: `deposit-${formatDateKey(currentDate)}-${i}`,
          residentId: resident.id,
          type: depositType,
          itemName: generateDepositItemName(depositType),
          depositedAt: new Date(currentDate).toISOString(),
          status: Math.random() > 0.2 ? 'retrieved' : 'deposited',
          retrievedAt: Math.random() > 0.2 
            ? new Date(currentDate.getTime() + (1 + Math.floor(Math.random() * 7)) * 24 * 60 * 60 * 1000).toISOString()
            : null,
          notes: generateDepositNotes(),
        });
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

// ==================== 辅助函数 ====================

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateKey(date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

function generateEventDescription(type) {
  const descriptions = {
    community: ['社區聯誼活動，歡迎住戶參加', '社區清潔日，請住戶配合', '社區電影欣賞會'],
    maintenance: ['電梯定期保養', '消防設備檢修', '水塔清洗作業'],
    security: ['社區安全巡邏', '門禁系統更新', '監視器維護'],
    meeting: ['管委會例會', '財務報告說明會', '社區規約修訂討論'],
  };
  const descs = descriptions[type] || ['社區活動'];
  return descs[Math.floor(Math.random() * descs.length)];
}

function generateBookingNotes() {
  const notes = [
    '請保持清潔',
    '請準時到達',
    '如需取消請提前24小時通知',
    '請攜帶證件',
    '最多可帶2位訪客',
  ];
  return Math.random() > 0.5 ? notes[Math.floor(Math.random() * notes.length)] : '';
}

function generateNotificationMessage(type) {
  const messages = {
    info: ['社區新設施已啟用', '管理費調整通知', '社區活動報名開始'],
    warning: ['明日10:00-14:00停水', '本週六電梯保養', '颱風來襲請做好防護'],
    success: ['您已成功報名社區活動', '您的預約已確認', '費用繳納成功'],
    error: ['您的管理費尚未繳納', '您的預約已逾期', '請盡速補繳費用'],
  };
  const msgs = messages[type] || ['通知'];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

function generateDepositItemName(type) {
  const items = {
    key: ['備用鑰匙', '信箱鑰匙', '停車位鑰匙'],
    card: ['門禁卡', '電梯卡', '訪客卡'],
    parcel: ['包裹', '信件', '貨到付款包裹'],
  };
  const itemList = items[type] || ['物品'];
  return itemList[Math.floor(Math.random() * itemList.length)];
}

function generateDepositNotes() {
  const notes = ['請妥善保管', '限時領取', '貴重物品請親領'];
  return notes[Math.floor(Math.random() * notes.length)];
}

function printSimulationSummary() {
  // 日历事件统计
  const holidayCount = simulationData.calendarEvents.filter(e => e.type === 'holiday').length;
  const activityCount = simulationData.calendarEvents.filter(e => e.type !== 'holiday').length;
  
  // 管理费统计
  const paidFees = simulationData.feeRecords.filter(f => f.paymentStatus === 'paid');
  const lateFees = simulationData.feeRecords.filter(f => f.daysLate > 0);
  const totalFeeAmount = simulationData.feeRecords.reduce((sum, f) => sum + f.amount, 0);
  const totalLateFee = simulationData.feeRecords.reduce((sum, f) => sum + (f.lateFee || 0), 0);
  
  // 公设租借统计
  const confirmedBookings = simulationData.facilityBookings.filter(b => b.bookingStatus === 'confirmed');
  const cancelledBookings = simulationData.facilityBookings.filter(b => b.bookingStatus === 'cancelled');
  const totalBookingAmount = confirmedBookings.reduce((sum, b) => sum + b.amount, 0);
  const facilityUsage = {};
  confirmedBookings.forEach(b => {
    facilityUsage[b.facilityName] = (facilityUsage[b.facilityName] || 0) + 1;
  });
  
  // 通知统计
  const unreadNotifs = simulationData.notifications.filter(n => !n.read);
  
  // 押金统计
  const activeDeposits = simulationData.deposits.filter(d => d.status === 'deposited');
  const retrievedDeposits = simulationData.deposits.filter(d => d.status === 'retrieved');
  
  console.log('📊 1年使用数据模拟总结\n');
  
  console.log('📅 日历事件:');
  console.log(`   节日: ${holidayCount} 个`);
  console.log(`   社区活动: ${activityCount} 个`);
  console.log(`   总计: ${simulationData.calendarEvents.length} 个事件\n`);
  
  console.log('💰 管理费缴费:');
  console.log(`   总记录: ${simulationData.feeRecords.length} 笔`);
  console.log(`   按时缴费: ${paidFees.length - lateFees.length} 笔`);
  console.log(`   迟缴: ${lateFees.length} 笔`);
  console.log(`   缴费总额: $${totalFeeAmount.toLocaleString()}`);
  console.log(`   滞纳金: $${totalLateFee.toLocaleString()}\n`);
  
  console.log('🏊 公设租借:');
  console.log(`   总预约: ${simulationData.facilityBookings.length} 笔`);
  console.log(`   已确认: ${confirmedBookings.length} 笔`);
  console.log(`   已取消: ${cancelledBookings.length} 笔`);
  console.log(`   收入总额: $${totalBookingAmount.toLocaleString()}`);
  console.log('   设施使用排行:');
  Object.entries(facilityUsage)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, count]) => {
      console.log(`      ${name}: ${count} 次`);
    });
  console.log('');
  
  console.log('📢 通知公告:');
  console.log(`   总数: ${simulationData.notifications.length} 条`);
  console.log(`   已读: ${simulationData.notifications.length - unreadNotifs.length} 条`);
  console.log(`   未读: ${unreadNotifs.length} 条\n`);
  
  console.log('📦 押金/寄放:');
  console.log(`   总数: ${simulationData.deposits.length} 条`);
  console.log(`   寄存中: ${activeDeposits.length} 条`);
  console.log(`   已领回: ${retrievedDeposits.length} 条\n`);
  
  console.log('🏢 基础数据:');
  console.log(`   建筑: ${simulationData.building.name}`);
  console.log(`   楼层: ${simulationData.floors.length} 层`);
  console.log(`   户别: ${simulationData.units.length} 户`);
  console.log(`   住戶: ${simulationData.residents.length} 人`);
  console.log(`   车位: ${simulationData.parkingSpaces.length} 个`);
  
  console.log('\n✅ 模拟完成！数据已保存到 window.simulationData');
}

// 导出函数
window.runOneYearSimulation = runOneYearSimulation;
console.log('✅ 1年使用模拟脚本已加载');
console.log('💡 运行方式: 直接回车或运行 window.runOneYearSimulation()');
