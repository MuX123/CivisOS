/**
 * CivisOS 数据管理控制台
 * 提供一键模拟和清空功能
 * 
 * 功能：
 * 1. 模拟1年使用数据
 * 2. 清空所有数据
 * 3. 查看当前数据状态
 * 
 * 运行方式：在浏览器控制台中运行
 */

window.CivisDataManager = {
  // ==================== 状态检查 ====================
  checkStatus() {
    console.log('📊 当前数据状态检查\n');
    console.log('='.repeat(70));
    
    const store = window.store;
    if (!store) {
      console.error('❌ 未找到 Redux store');
      return null;
    }
    
    const state = store.getState();
    const status = {
      buildings: state.building?.buildings?.length || 0,
      floors: state.building?.floors?.length || 0,
      units: state.building?.units?.length || 0,
      residents: state.resident?.residents?.length || 0,
      parkingSpaces: state.parking?.spaces?.length || 0,
      facilities: state.facility?.facilities?.length || 0,
      facilityBookings: state.facility?.bookings?.length || 0,
      calendarEvents: state.calendar?.events?.length || 0,
      feeRecords: state.fee?.unitFees?.length || 0,
      notifications: state.notification?.notifications?.length || 0,
      deposits: state.depositV2?.items?.length || 0,
    };
    
    const totalRecords = Object.values(status).reduce((a, b) => a + b, 0);
    
    console.log('📋 数据概览：');
    console.log(`   🏢 建筑: ${status.buildings} 栋`);
    console.log(`   📐 楼层: ${status.floors} 层`);
    console.log(`   🏠 户别: ${status.units} 户`);
    console.log(`   👥 住戶: ${status.residents} 人`);
    console.log(`   🚗 车位: ${status.parkingSpaces} 个`);
    console.log(`   🏊 公设: ${status.facilities} 个`);
    console.log(`   📅 公设预约: ${status.facilityBookings} 笔`);
    console.log(`   📆 日历事件: ${status.calendarEvents} 个`);
    console.log(`   💰 管理费: ${status.feeRecords} 笔`);
    console.log(`   📢 通知: ${status.notifications} 条`);
    console.log(`   📦 押金/寄放: ${status.deposits} 条`);
    console.log('\n' + '-'.repeat(70));
    console.log(`📊 总记录数: ${totalRecords} 条`);
    
    if (totalRecords === 0) {
      console.log('\n💡 系统为空，建议运行模拟数据功能');
    } else {
      console.log('\n💡 系统已有数据，可以运行清空功能重置');
    }
    
    console.log('='.repeat(70));
    return status;
  },

  // ==================== 清空所有数据 ====================
  async clearAllData() {
    console.clear();
    console.log('🧹 清空所有数据\n');
    console.log('='.repeat(70));
    
    const store = window.store;
    if (!store) {
      console.error('❌ 未找到 Redux store');
      return;
    }
    
    const dispatch = store.dispatch;
    const getState = store.getState;
    
    // 确认对话框
    const confirmed = confirm(
      '⚠️ 警告：此操作将删除所有数据！\n\n' +
      '包括：\n' +
      '- 建筑、楼层、户别\n' +
      '- 住戶信息\n' +
      '- 车位数据\n' +
      '- 公设和预约\n' +
      '- 日历事件\n' +
      '- 管理费记录\n' +
      '- 通知公告\n' +
      '- 押金/寄放记录\n\n' +
      '此操作不可恢复，确定要继续吗？'
    );
    
    if (!confirmed) {
      console.log('❎ 操作已取消');
      return;
    }
    
    console.log('⏳ 正在清空数据...\n');
    
    // 1. 清除建筑数据
    dispatch({
      type: 'building/rehydrate',
      payload: {
        buildings: [],
        floors: [],
        units: [],
        parkingSpaces: [],
      }
    });
    console.log('   ✅ 已清除建筑、楼层、户别、车位数据');
    
    // 2. 清住戶数据
    dispatch({
      type: 'resident/rehydrate',
      payload: {
        residents: [],
      }
    });
    console.log('   ✅ 已清除住戶数据');
    
    // 3. 清除车位数据
    dispatch({
      type: 'parking/rehydrate',
      payload: {
        spaces: [],
        zones: [],
        areas: [],
      }
    });
    console.log('   ✅ 已清除车位系统数据');
    
    // 4. 清除日历事件
    dispatch({
      type: 'calendar/rehydrate',
      payload: {
        events: [],
      }
    });
    console.log('   ✅ 已清除日历事件');
    
    // 5. 清除管理费
    dispatch({
      type: 'fee/rehydrate',
      payload: {
        periods: [],
        unitFees: [],
      }
    });
    console.log('   ✅ 已清除管理费记录');
    
    // 6. 清除公设和预约
    dispatch({
      type: 'facility/rehydrate',
      payload: {
        facilities: [],
        bookings: [],
        stats: {
          totalFacilities: 0,
          availableFacilities: 0,
          totalBookings: 0,
          todayBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          totalRevenue: 0,
          averageUtilizationRate: 0,
        },
      }
    });
    console.log('   ✅ 已清除公设和预约记录');
    
    // 7. 清除通知
    dispatch({
      type: 'notification/rehydrate',
      payload: {
        notifications: [],
      }
    });
    console.log('   ✅ 已清除通知公告');
    
    // 8. 清除押金/寄放
    dispatch({
      type: 'depositV2/rehydrate',
      payload: {
        items: [],
      }
    });
    console.log('   ✅ 已清除押金/寄放记录');
    
    // 9. 清除配置（可选，保留主题等配置）
    // 不清除 config，保留用户的主题设置等
    
    // 等待 Redux 更新
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 10. 清除本地存储
    console.log('\n💾 正在清除本地存储...');
    
    try {
      // 清除主要存储键
      localStorage.removeItem('full-state');
      localStorage.removeItem('user-data');
      localStorage.removeItem('theme-config');
      localStorage.removeItem('quick-access');
      console.log('   ✅ 已清除 localStorage');
    } catch (e) {
      console.warn('   ⚠️ 清除 localStorage 失败:', e.message);
    }
    
    // 11. 强制保存空状态
    if (window.forcePersist) {
      try {
        await window.forcePersist(getState());
        console.log('   ✅ 已保存清空状态');
      } catch (e) {
        console.warn('   ⚠️ 立即保存失败:', e.message);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ 所有数据已清空！');
    console.log('='.repeat(70));
    console.log('\n💡 系统已重置为初始状态');
    console.log('   建议刷新页面以完全清除所有状态');
    
    // 显示清空后的状态
    setTimeout(() => this.checkStatus(), 100);
  },

  // ==================== 模拟1年使用数据 ====================
  async simulateOneYear() {
    console.clear();
    console.log('🚀 开始模拟1年使用数据\n');
    console.log('='.repeat(70));
    
    const store = window.store;
    if (!store) {
      console.error('❌ 未找到 Redux store');
      return;
    }
    
    const state = store.getState();
    const dispatch = store.dispatch;
    
    // 检查是否已有数据
    const hasData = state.building?.buildings?.length > 0;
    if (hasData) {
      const overwrite = confirm(
        '⚠️ 系统已有数据！\n\n' +
        '是否先清空现有数据再生成新的模拟数据？\n' +
        '点击「确定」先清空再生成\n' +
        '点击「取消」直接生成（可能产生冲突）'
      );
      
      if (overwrite) {
        await this.clearAllData();
        console.log('\n' + '='.repeat(70));
        console.log('🔄 开始生成新的模拟数据...\n');
      }
    }
    
    // 配置
    const CONFIG = {
      building: {
        code: 'A',
        name: '第一棟',
        units: 6,
        residentsPerUnit: 3,
      },
      facilities: [
        { id: 'f1', name: '游泳池', type: 'recreation', capacity: 20, location: '一樓', hourlyRate: 50 },
        { id: 'f2', name: '健身房', type: 'fitness', capacity: 15, location: '二樓', hourlyRate: 100 },
        { id: 'f3', name: '會議室', type: 'meeting', capacity: 10, location: '一樓', hourlyRate: 200 },
        { id: 'f4', name: 'KTV室', type: 'recreation', capacity: 8, location: '地下室', hourlyRate: 150 },
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
    
    console.log('📅 模拟时间范围:', this.formatDate(startDate), '至', this.formatDate(endDate));
    
    // Step 1: 创建基础数据
    console.log('\n📋 Step 1: 创建基础建筑数据...');
    this.createBuildingData(simulationData, CONFIG);
    console.log('   ✅ 楼层:', simulationData.floors.length);
    console.log('   ✅ 户别:', simulationData.units.length);
    console.log('   ✅ 住戶:', simulationData.residents.length);
    console.log('   ✅ 车位:', simulationData.parkingSpaces.length);
    
    // Step 2: 生成日历事件
    console.log('\n📋 Step 2: 生成日历事件...');
    this.generateCalendarEvents(simulationData, CONFIG, startDate, endDate);
    console.log('   ✅ 日历事件:', simulationData.calendarEvents.length, '个');
    
    // Step 3: 生成管理费
    console.log('\n📋 Step 3: 生成管理费记录...');
    this.generateFeeRecords(simulationData, CONFIG, startDate, endDate);
    console.log('   ✅ 管理费:', simulationData.feeRecords.length, '笔');
    
    // Step 4: 生成公设租借
    console.log('\n📋 Step 4: 生成公设租借记录...');
    this.generateFacilityBookings(simulationData, CONFIG, startDate, endDate);
    console.log('   ✅ 公设租借:', simulationData.facilityBookings.length, '笔');
    
    // Step 5: 生成通知
    console.log('\n📋 Step 5: 生成通知公告...');
    this.generateNotifications(simulationData, CONFIG, startDate, endDate);
    console.log('   ✅ 通知:', simulationData.notifications.length, '条');
    
    // Step 6: 生成押金/寄放
    console.log('\n📋 Step 6: 生成押金/寄放记录...');
    this.generateDeposits(simulationData, CONFIG, startDate, endDate);
    console.log('   ✅ 押金/寄放:', simulationData.deposits.length, '条');
    
    // Step 7: 导入到系统
    console.log('\n' + '='.repeat(70));
    console.log('📋 Step 7: 导入数据到系统...');
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
    console.log('   ✅ 建筑数据已导入');
    
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
    console.log('   ✅ 住戶数据已导入');
    
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
    console.log('   ✅ 车位数据已导入');
    
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
    console.log('   ✅ 日历事件已导入');
    
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
    console.log('   ✅ 管理费记录已导入');
    
    // 导入公设和预约
    console.log('\n6️⃣ 导入公设和租借记录...');
    dispatch({
      type: 'facility/rehydrate',
      payload: {
        facilities: CONFIG.facilities.map(f => ({
          ...f,
          buildingId: simulationData.building.id,
          operatingHours: { start: '09:00', end: '22:00' },
          status: 'available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
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
    console.log('   ✅ 公设和租借记录已导入');
    
    // 导入通知
    console.log('\n7️⃣ 导入通知公告...');
    dispatch({
      type: 'notification/rehydrate',
      payload: {
        notifications: simulationData.notifications,
      }
    });
    console.log('   ✅ 通知公告已导入');
    
    // 导入押金/寄放
    console.log('\n8️⃣ 导入押金/寄放记录...');
    dispatch({
      type: 'depositV2/rehydrate',
      payload: {
        items: simulationData.deposits,
      }
    });
    console.log('   ✅ 押金/寄放记录已导入');
    
    // 保存数据
    console.log('\n' + '='.repeat(70));
    console.log('💾 保存数据到本地存储...');
    console.log('='.repeat(70));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (window.forcePersist) {
      try {
        await window.forcePersist(store.getState());
        console.log('✅ 数据已保存到本地存储');
      } catch (e) {
        console.warn('⚠️ 立即保存失败，数据将在下次操作时自动保存');
      }
    }
    
    // 总结
    console.log('\n' + '='.repeat(70));
    console.log('🎉 完成！1年使用数据已生成并导入');
    console.log('='.repeat(70));
    
    console.log('\n📊 生成的数据：');
    console.log(`   🏢 建筑: ${simulationData.building.name} (A栋)`);
    console.log(`   📐 楼层: ${simulationData.floors.length} 层`);
    console.log(`   🏠 户别: ${simulationData.units.length} 户`);
    console.log(`   👥 住戶: ${simulationData.residents.length} 人`);
    console.log(`   🚗 车位: ${simulationData.parkingSpaces.length} 个`);
    console.log(`   🏊 公设: ${CONFIG.facilities.length} 个`);
    console.log(`   📅 日历: ${simulationData.calendarEvents.length} 个事件`);
    console.log(`   💰 管理费: ${simulationData.feeRecords.length} 笔`);
    console.log(`   📅 公设租借: ${simulationData.facilityBookings.length} 笔`);
    console.log(`   📢 通知: ${simulationData.notifications.length} 条`);
    console.log(`   📦 押金/寄放: ${simulationData.deposits.length} 条`);
    
    console.log('\n💡 提示: 刷新页面查看所有数据');
    
    // 保存到全局
    window.simulationData = simulationData;
    window.simulationConfig = CONFIG;
    
    return simulationData;
  },

  // ==================== 辅助函数 ====================
  formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  createBuildingData(data, CONFIG) {
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
  },

  generateCalendarEvents(data, CONFIG, startDate, endDate) {
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
          description: this.generateEventDescription(eventType.type),
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  },

  generateFeeRecords(data, CONFIG, startDate, endDate) {
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (currentDate.getDate() === CONFIG.fee.dueDay) {
        data.units.forEach(unit => {
          const baseFee = unit.area * CONFIG.fee.pricePerPing;
          const isLate = Math.random() < CONFIG.probabilities.latePayment;
          const daysLate = isLate ? Math.floor(Math.random() * 15) + 1 : 0;
          
          data.feeRecords.push({
            id: `fee-${unit.id}-${this.formatDate(currentDate)}`,
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
  },

  generateFacilityBookings(data, CONFIG, startDate, endDate) {
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
  },

  generateNotifications(data, CONFIG, startDate, endDate) {
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
            message: this.generateNotificationMessage(notifType.type),
            createdAt: new Date(currentDate).toISOString(),
            read: Math.random() > 0.3,
          });
        }
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  },

  generateDeposits(data, CONFIG, startDate, endDate) {
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
            itemName: this.generateDepositItemName(depositType),
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
  },

  generateEventDescription(type) {
    const descs = {
      community: ['社區聯誼活動', '社區清潔日', '電影欣賞會'],
      maintenance: ['電梯保養', '消防檢修', '水塔清洗'],
      security: ['安全巡邏', '門禁更新', '監視器維護'],
      meeting: ['管委會例會', '財務報告', '規約修訂'],
    };
    const list = descs[type] || ['活動'];
    return list[Math.floor(Math.random() * list.length)];
  },

  generateNotificationMessage(type) {
    const msgs = {
      info: ['新設施啟用', '管理費調整', '活動報名開始'],
      warning: ['明日停水', '電梯保養', '颱風防護'],
      success: ['報名成功', '預約確認', '繳費成功'],
      error: ['費用未繳', '預約逾期', '請補繳費用'],
    };
    const list = msgs[type] || ['通知'];
    return list[Math.floor(Math.random() * list.length)];
  },

  generateDepositItemName(type) {
    const items = {
      key: ['備用鑰匙', '信箱鑰匙', '停車位鑰匙'],
      card: ['門禁卡', '電梯卡', '訪客卡'],
      parcel: ['包裹', '信件', '貨到付款'],
    };
    const list = items[type] || ['物品'];
    return list[Math.floor(Math.random() * list.length)];
  },
};

// 显示使用说明
console.log('✅ CivisOS 数据管理控制台已加载！\n');
console.log('📋 可用命令：');
console.log('   window.CivisDataManager.checkStatus()      - 查看当前数据状态');
console.log('   window.CivisDataManager.simulateOneYear()  - 模拟1年使用数据');
console.log('   window.CivisDataManager.clearAllData()     - 清空所有数据');
console.log('\n💡 快速使用：');
console.log('   CivisDataManager.checkStatus()');
console.log('');
console.log('='.repeat(70));
