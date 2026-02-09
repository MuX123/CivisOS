/**
 * 将模拟数据导入到 Redux Store
 * 配合 one-year-simulation.js 使用
 * 
 * 运行方式：
 * 1. 先运行 one-year-simulation.js 生成数据
 * 2. 再运行此脚本导入数据
 */

(function importSimulationToStore() {
  console.log('🚀 开始将模拟数据导入到系统...\n');
  
  // 检查是否有模拟数据
  if (!window.simulationData) {
    console.error('❌ 未找到模拟数据！请先运行 one-year-simulation.js');
    return;
  }
  
  const data = window.simulationData;
  const dispatch = window.store?.dispatch;
  
  if (!dispatch) {
    console.error('❌ 未找到 Redux store！请确保在应用页面中运行');
    return;
  }
  
  console.log('📋 导入步骤：\n');
  
  // ==================== 1. 导入栋数、楼层、户别 ====================
  console.log('1️⃣ 导入建筑基础数据...');
  
  // 使用 building/rehydrate action
  dispatch({
    type: 'building/rehydrate',
    payload: {
      buildings: [data.building],
      floors: data.floors,
      units: data.units,
      parkingSpaces: data.parkingSpaces.map(ps => ({
        id: ps.id,
        buildingId: data.building.id,
        floorId: data.parkingZones.find(z => z.id === ps.area)?.floorId,
        areaId: ps.area,
        number: ps.number,
        type: ps.type,
        status: ps.status,
        occupantName: ps.occupantName,
      })),
    }
  });
  console.log('✅ 建筑数据导入完成');
  
  // ==================== 2. 导入住戶 ====================
  console.log('\n2️⃣ 导入住戶数据...');
  dispatch({
    type: 'resident/rehydrate',
    payload: {
      residents: data.residents.map(r => ({
        ...r,
        members: [],
        status: r.status,
      })),
    }
  });
  console.log('✅ 住戶数据导入完成');
  
  // ==================== 3. 导入车位数据 ====================
  console.log('\n3️⃣ 导入车位数据...');
  dispatch({
    type: 'parking/rehydrate',
    payload: {
      spaces: data.parkingSpaces.map(ps => ({
        id: ps.id,
        area: ps.area,
        number: ps.number,
        type: ps.type,
        status: ps.status,
        occupantName: ps.occupantName,
      })),
      zones: data.parkingZones,
      areas: data.parkingZones.map(z => ({
        id: z.id,
        name: z.name,
        totalSpaces: data.parkingSpaces.filter(s => s.area === z.id).length,
      })),
    }
  });
  console.log('✅ 车位数据导入完成');
  
  // ==================== 4. 导入日历事件 ====================
  console.log('\n4️⃣ 导入日历事件...');
  dispatch({
    type: 'calendar/rehydrate',
    payload: {
      events: data.calendarEvents.map(evt => ({
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
  console.log('✅ 日历事件导入完成');
  
  // ==================== 5. 导入管理费 ====================
  console.log('\n5️⃣ 导入管理费记录...');
  dispatch({
    type: 'fee/rehydrate',
    payload: {
      periods: generateFeePeriods(data.feeRecords),
      unitFees: data.feeRecords.map(fee => ({
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
  console.log('✅ 管理费记录导入完成');
  
  // ==================== 6. 导入公设租借 ====================
  console.log('\n6️⃣ 导入公设租借记录...');
  dispatch({
    type: 'facility/rehydrate',
    payload: {
      bookings: data.facilityBookings.map(booking => ({
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
  console.log('✅ 公设租借记录导入完成');
  
  // ==================== 7. 导入通知 ====================
  console.log('\n7️⃣ 导入通知公告...');
  dispatch({
    type: 'notification/rehydrate',
    payload: {
      notifications: data.notifications,
    }
  });
  console.log('✅ 通知公告导入完成');
  
  // ==================== 8. 导入押金/寄放 ====================
  console.log('\n8️⃣ 导入押金/寄放记录...');
  dispatch({
    type: 'depositV2/rehydrate',
    payload: {
      items: data.deposits.filter(d => d.type !== 'money').map(d => ({
        id: d.id,
        residentId: d.residentId,
        type: d.type,
        itemName: d.itemName,
        depositedAt: d.depositedAt,
        status: d.status,
        retrievedAt: d.retrievedAt,
        notes: d.notes,
      })),
    }
  });
  console.log('✅ 押金/寄放记录导入完成');
  
  // ==================== 总结 ====================
  console.log('\n' + '='.repeat(60));
  console.log('🎉 所有数据导入完成！');
  console.log('='.repeat(60));
  console.log('\n📊 导入统计：');
  console.log(`   建筑: 1 栋`);
  console.log(`   楼层: ${data.floors.length} 层`);
  console.log(`   户别: ${data.units.length} 户`);
  console.log(`   住戶: ${data.residents.length} 人`);
  console.log(`   车位: ${data.parkingSpaces.length} 个`);
  console.log(`   日历事件: ${data.calendarEvents.length} 个`);
  console.log(`   管理费: ${data.feeRecords.length} 笔`);
  console.log(`   公设租借: ${data.facilityBookings.length} 笔`);
  console.log(`   通知: ${data.notifications.length} 条`);
  console.log(`   押金/寄放: ${data.deposits.length} 条`);
  
  console.log('\n💡 提示: 数据已导入到 Redux Store，刷新页面即可查看');
  console.log('   建议运行 window.forcePersist(window.store.getState()) 立即保存数据');
  
})();

// 辅助函数：生成管理费期数
function generateFeePeriods(feeRecords) {
  const periods = {};
  
  feeRecords.forEach(fee => {
    if (!periods[fee.period]) {
      periods[fee.period] = {
        id: `period-${fee.period}`,
        name: fee.period,
        dueDate: fee.dueDate,
        status: 'closed',
      };
    }
  });
  
  return Object.values(periods);
}

// 导出函数
window.importSimulationToStore = importSimulationToStore;
console.log('✅ 数据导入脚本已加载');
console.log('💡 运行方式: 先运行 one-year-simulation.js，再运行此脚本');
