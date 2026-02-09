/**
 * 快速添加测试公设数据
 * 方便验证公设设定与公设系统关联功能
 * 
 * 运行方式：在浏览器控制台中粘贴运行
 */

(function addTestFacilities() {
  console.log('🏊 添加测试公设数据...\n');
  
  const store = window.store;
  if (!store) {
    console.error('❌ 未找到 Redux store');
    return;
  }
  
  const dispatch = store.dispatch;
  const state = store.getState();
  
  // 获取建筑列表
  const buildings = state.building?.buildings || [];
  if (buildings.length === 0) {
    console.error('❌ 没有建筑数据，请先创建栋数');
    return;
  }
  
  const buildingId = buildings[0].id;
  console.log(`📍 使用建筑: ${buildings[0].buildingCode}棟 (ID: ${buildingId})`);
  
  // 测试公设数据
  const testFacilities = [
    {
      name: '游泳池',
      type: 'recreation',
      capacity: 20,
      location: '一樓',
      description: '社區游泳池，開放時間請遵守規定',
      hourlyRate: 50,
    },
    {
      name: '健身房',
      type: 'fitness',
      capacity: 15,
      location: '二樓',
      description: '專業健身器材，請著運動服裝',
      hourlyRate: 100,
    },
    {
      name: '會議室',
      type: 'meeting',
      capacity: 10,
      location: '一樓',
      description: '多功能會議室，提供投影設備',
      hourlyRate: 200,
    },
    {
      name: 'KTV室',
      type: 'recreation',
      capacity: 8,
      location: '地下室',
      description: '卡拉OK娛樂室，請注意音量',
      hourlyRate: 150,
    },
  ];
  
  console.log(`\n📝 准备添加 ${testFacilities.length} 个公设：\n`);
  
  testFacilities.forEach((facility, index) => {
    const newFacility = {
      id: `facility-${Date.now()}-${index}`,
      name: facility.name,
      type: facility.type,
      capacity: facility.capacity,
      location: facility.location,
      description: facility.description,
      buildingId: buildingId,
      operatingHours: { start: '09:00', end: '22:00' },
      status: 'available',
      hourlyRate: facility.hourlyRate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    dispatch({
      type: 'facility/addFacility',
      payload: newFacility,
    });
    
    console.log(`   ✅ ${facility.name}`);
    console.log(`      - 类型: ${facility.type}`);
    console.log(`      - 容量: ${facility.capacity}人`);
    console.log(`      - 位置: ${facility.location}`);
    console.log(`      - 费用: $${facility.hourlyRate}/小时`);
  });
  
  // 保存数据
  if (window.forcePersist) {
    window.forcePersist(store.getState());
    console.log('\n💾 数据已保存');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ 测试公设已添加完成！');
  console.log('='.repeat(60));
  console.log('\n📋 接下来：');
  console.log('   1. 前往前台「公設預約」页面');
  console.log('   2. 点击「新增」按钮');
  console.log('   3. 在「公設項目」下拉菜单中选择公设');
  console.log('   4. 可以看到刚添加的游泳池、健身房等选项');
  
})();

window.addTestFacilities = addTestFacilities;
console.log('✅ 测试数据添加脚本已加载');
console.log('💡 运行: window.addTestFacilities()');
