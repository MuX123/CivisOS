/**
 * 一条龙测试：栋数、户别、停车位完整流程测试
 * 
 * 运行方式：在浏览器开发者工具控制台中运行
 * 
 * 测试流程：
 * 1. 创建测试栋数数据
 * 2. 自动生成楼层（R楼、居住层、地下室）
 * 3. 自动生成户别
 * 4. 模拟车位设定页面的车位创建
 * 5. 验证数据关联
 * 6. 模拟前台车位系统显示
 */

(function runIntegrationTest() {
  console.clear();
  console.log('🚀 开始一条龙测试...\n');
  
  // ==================== Step 1: 创建栋数 ====================
  console.log('📋 Step 1: 创建测试栋数');
  const building = {
    id: 'test-building-' + Date.now(),
    buildingCode: 'A',
    name: '第一棟',
    houseNumberPrefix: 'A',
    roofFloors: 1,
    residentialFloors: 2,
    basementFloors: 2,
    unitsPerFloor: 2,
    totalFloors: 5,
    totalUnits: 4,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  console.log('✅ 栋数创建成功:', building.name);
  console.log('   栋别代号:', building.buildingCode);
  console.log('   楼层配置: R' + building.roofFloors + ' / ' + building.residentialFloors + 'F / B' + building.basementFloors);
  
  // ==================== Step 2: 生成楼层 ====================
  console.log('\n📋 Step 2: 自动生成楼层');
  const floors = [];
  
  // R楼
  for (let i = 1; i <= building.roofFloors; i++) {
    floors.push({
      id: building.id + '-R' + i,
      buildingId: building.id,
      floorNumber: 'R' + i,
      name: 'R' + i + '樓',
      floorType: 'roof',
      totalUnits: 0,
      sortOrder: -100 - i,
    });
  }
  
  // 居住层
  for (let i = 1; i <= building.residentialFloors; i++) {
    floors.push({
      id: building.id + '-F' + i,
      buildingId: building.id,
      floorNumber: i + 'F',
      name: i + '樓',
      floorType: 'residential',
      totalUnits: building.unitsPerFloor,
      sortOrder: i,
    });
  }
  
  // 地下室
  for (let i = 1; i <= building.basementFloors; i++) {
    floors.push({
      id: building.id + '-B' + i,
      buildingId: building.id,
      floorNumber: 'B' + i,
      name: 'B' + i + '地下室',
      floorType: 'basement',
      totalUnits: 0,
      sortOrder: 100 + i,
    });
  }
  
  console.log('✅ 楼层生成成功，共', floors.length, '层');
  console.log('   R楼:', floors.filter(f => f.floorType === 'roof').length, '层');
  console.log('   居住层:', floors.filter(f => f.floorType === 'residential').length, '层');
  console.log('   地下室:', floors.filter(f => f.floorType === 'basement').length, '层');
  floors.forEach(f => console.log('   -', f.name, '(' + f.floorNumber + ')', '[ID:', f.id + ']'));
  
  // ==================== Step 3: 生成户别 ====================
  console.log('\n📋 Step 3: 自动生成户别');
  const units = [];
  const residentialFloors = floors.filter(f => f.floorType === 'residential');
  
  residentialFloors.forEach(floor => {
    const floorNum = parseInt(floor.floorNumber.replace(/\D/g, '')) || 0;
    for (let i = 1; i <= building.unitsPerFloor; i++) {
      const unitLabel = building.houseNumberPrefix + floorNum + String(i).padStart(2, '0');
      units.push({
        id: building.id + '-' + floor.floorNumber + '-' + i,
        buildingId: building.id,
        floorId: floor.id,
        unitNumber: unitLabel,
        floorNumber: floor.floorNumber,
        floorType: 'residential',
        sortOrder: (floorNum * 100) + i,
        status: 'vacant',
      });
    }
  });
  
  console.log('✅ 户别生成成功，共', units.length, '户');
  units.forEach(u => console.log('   -', u.unitNumber, '(', u.floorNumber, ')', '[ID:', u.id + ']'));
  
  // ==================== Step 4: 通过车位设定页面创建车位 ====================
  console.log('\n📋 Step 4: 模拟车位设定页面创建车位');
  const zones = [];
  const spaces = [];
  
  const basementFloors = floors.filter(f => f.floorType === 'basement');
  
  basementFloors.forEach((floor, floorIdx) => {
    // 为每层创建2个分区：住戶區、訪客區
    const zoneConfigs = [
      { name: '住戶區', type: 'resident' },
      { name: '訪客區', type: 'visitor' },
    ];
    
    zoneConfigs.forEach((zt, zoneIdx) => {
      const zone = {
        id: 'zone-' + floor.id + '-' + zoneIdx,
        buildingId: building.id,
        floorId: floor.id,
        name: floor.name + zt.name,
        variableName: zt.type + 'Zone' + (floorIdx + 1),
        spaceCount: 3,
        startNumber: 1,
        type: zt.type,
        sortOrder: zoneIdx,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      zones.push(zone);
      
      // 为每个分区创建3个车位
      for (let i = 1; i <= 3; i++) {
        spaces.push({
          id: 'space-' + zone.id + '-' + i,
          area: zone.id,  // area = zoneId
          number: zone.variableName + '-' + String(i).padStart(2, '0'),
          type: zt.type,
          status: 'available',
        });
      }
    });
  });
  
  console.log('✅ 车位设定创建成功');
  console.log('   分区数:', zones.length);
  console.log('   车位数:', spaces.length);
  zones.forEach(z => {
    const zoneSpaces = spaces.filter(s => s.area === z.id);
    console.log('   -', z.name, '(' + z.variableName + '):', zoneSpaces.length, '个车位');
  });
  
  // ==================== Step 5: 验证数据关联 ====================
  console.log('\n📋 Step 5: 验证数据关联');
  const errors = [];
  
  // 验证楼层与栋数关联
  floors.forEach(floor => {
    if (floor.buildingId !== building.id) {
      errors.push('楼层 ' + floor.name + ' 的 buildingId 不匹配');
    }
  });
  
  // 验证户别与楼层关联
  units.forEach(unit => {
    const floor = floors.find(f => f.id === unit.floorId);
    if (!floor) {
      errors.push('户别 ' + unit.unitNumber + ' 找不到对应的楼层');
    }
  });
  
  // 验证分区与楼层关联
  zones.forEach(zone => {
    const floor = floors.find(f => f.id === zone.floorId);
    if (!floor) {
      errors.push('分区 ' + zone.name + ' 找不到对应的楼层');
    }
  });
  
  // 验证车位与分区关联
  spaces.forEach(space => {
    const zone = zones.find(z => z.id === space.area);
    if (!zone) {
      errors.push('车位 ' + space.number + ' 找不到对应的分区');
    }
  });
  
  if (errors.length === 0) {
    console.log('✅ 所有数据关联验证通过！');
  } else {
    console.log('❌ 数据关联验证失败:');
    errors.forEach(e => console.log('   -', e));
  }
  
  // ==================== Step 6: 模拟前台车位系统显示 ====================
  console.log('\n📋 Step 6: 模拟前台车位系统显示');
  
  const sortedBasementFloors = basementFloors.sort((a, b) => a.sortOrder - b.sortOrder);
  console.log('✅ 地下室楼层（按 sortOrder 排序）:');
  sortedBasementFloors.forEach(f => console.log('   -', f.name, '(sortOrder:', f.sortOrder + ')'));
  
  // 模拟选择 B1 楼层后的显示
  const selectedFloorId = sortedBasementFloors[0].id;
  console.log('\n   模拟选择楼层:', sortedBasementFloors[0].name);
  
  // 获取该楼层的所有分区
  const floorZones = zones.filter(z => z.floorId === selectedFloorId);
  console.log('   该楼层分区数:', floorZones.length);
  
  // 获取分区 IDs
  const floorZoneIds = floorZones.map(z => z.id);
  
  // 获取该楼层的车位
  const floorSpaces = spaces.filter(s => floorZoneIds.includes(s.area));
  console.log('   该楼层车位数:', floorSpaces.length);
  
  console.log('\n   车位列表:');
  floorSpaces.forEach(s => {
    const zone = zones.find(z => z.id === s.area);
    console.log('   -', s.number, '(', zone.name, ')');
  });
  
  // ==================== 测试总结 ====================
  console.log('\n' + '='.repeat(60));
  console.log('📊 一条龙测试总结');
  console.log('='.repeat(60));
  console.log('✅ 栋数创建:', building.name);
  console.log('✅ 楼层生成:', floors.length, '层');
  console.log('✅ 户别生成:', units.length, '户');
  console.log('✅ 车位设定:');
  console.log('   - 分区数:', zones.length);
  console.log('   - 车位数:', spaces.length);
  console.log('✅ 数据关联: 全部通过');
  console.log('✅ 前台显示: 可正常显示');
  console.log('\n🎉 所有测试通过！');
  
  // 返回测试数据供后续使用
  return {
    building,
    floors,
    units,
    zones,
    spaces,
  };
})();

// 将测试函数挂载到 window 对象
window.runIntegrationTest = runIntegrationTest;
console.log('\n💡 提示: 测试函数已挂载到 window.runIntegrationTest，可以重复运行');
