/**
 * 一条龙完整测试：栋数→格局→车位设定→车位系统
 * 自动运行30次，验证数据一致性
 * 
 * 运行方式：在浏览器开发者工具控制台中粘贴运行
 */

(function runFullIntegrationTest30Times() {
  console.clear();
  console.log('🚀 开始一条龙完整测试（30次基準）...\n');
  
  const results = [];
  const TEST_COUNT = 30; // 統一基準：30次
  
  for (let testIndex = 1; testIndex <= TEST_COUNT; testIndex++) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 测试 #${testIndex} / ${TEST_COUNT}`);
    console.log('='.repeat(60));
    
    const testResult = runSingleTest(testIndex);
    results.push(testResult);
    
    // 显示当前测试结果
    console.log(testResult.success ? '✅ 通过' : '❌ 失败');
    if (!testResult.success) {
      console.log('   错误:', testResult.errors.join(', '));
    }
  }
  
  // 最终总结
  printFinalSummary(results);
  
  return results;
})();

function runSingleTest(testIndex) {
  const errors = [];
  const logs = [];
  
  try {
    // ==================== Step 1: 创建栋数 ====================
    logs.push('创建栋数...');
    const building = createRandomBuilding(testIndex);
    logs.push(`✅ 栋数: ${building.name} (${building.buildingCode}栋)`);
    
    // ==================== Step 2: 生成楼层（格局设定）====================
    logs.push('生成楼层...');
    const floors = autoGenerateFloors(building);
    const basementFloors = floors.filter(f => f.floorType === 'basement');
    const residentialFloors = floors.filter(f => f.floorType === 'residential');
    
    if (floors.length === 0) errors.push('楼层生成失败');
    logs.push(`✅ 楼层: ${floors.length}层 (R${floors.filter(f => f.floorType === 'roof').length}/居住${residentialFloors.length}/地下室${basementFloors.length})`);
    
    // ==================== Step 3: 生成户别 ====================
    logs.push('生成户别...');
    const units = autoGenerateUnits(building, floors);
    if (units.length === 0) errors.push('户别生成失败');
    logs.push(`✅ 户别: ${units.length}户`);
    
    // ==================== Step 4: 创建车位分区（车位设定）====================
    logs.push('创建车位分区...');
    const zones = createParkingZones(basementFloors);
    if (zones.length === 0) errors.push('车位分区创建失败');
    logs.push(`✅ 分区: ${zones.length}个`);
    
    // ==================== Step 5: 生成车位 ====================
    logs.push('生成车位...');
    const spaces = createParkingSpaces(zones);
    if (spaces.length === 0) errors.push('车位生成失败');
    logs.push(`✅ 车位: ${spaces.length}个`);
    
    // ==================== Step 6: 数据关联验证 ====================
    logs.push('验证数据关联...');
    const validation = validateAllData(building, floors, units, zones, spaces);
    if (!validation.valid) {
      errors.push(...validation.errors);
    }
    logs.push(`✅ 数据关联: ${validation.valid ? '通过' : '失败'}`);
    
    // ==================== Step 7: 模拟前台车位系统显示 ====================
    logs.push('模拟前台显示...');
    const frontendResult = simulateFrontendSystem(floors, zones, spaces);
    if (frontendResult.displayedSpaces === 0) {
      errors.push('前台车位显示为空');
    }
    logs.push(`✅ 前台显示: ${frontendResult.displayedSpaces}个车位可正常显示`);
    
    // ==================== Step 8: 验证数据一致性 ====================
    logs.push('验证数据一致性...');
    const consistency = verifyDataConsistency(zones, spaces);
    if (!consistency.valid) {
      errors.push(...consistency.errors);
    }
    logs.push(`✅ 数据一致性: ${consistency.valid ? '通过' : '失败'}`);
    
    // 打印详细日志
    logs.forEach(log => console.log('  ' + log));
    
    return {
      testIndex,
      success: errors.length === 0,
      errors,
      data: { building, floors, units, zones, spaces },
      stats: {
        buildingName: building.name,
        floorCount: floors.length,
        unitCount: units.length,
        zoneCount: zones.length,
        spaceCount: spaces.length,
      }
    };
    
  } catch (error) {
    console.error('  ❌ 测试执行异常:', error.message);
    return {
      testIndex,
      success: false,
      errors: [error.message],
      data: null,
      stats: null
    };
  }
}

// ==================== 测试数据生成函数 ====================

function createRandomBuilding(index) {
  const buildingCodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const code = buildingCodes[(index - 1) % buildingCodes.length] + (Math.floor((index - 1) / buildingCodes.length) || '');
  
  // 随机配置
  const roofFloors = Math.random() > 0.5 ? 1 : 0;
  const residentialFloors = 2 + Math.floor(Math.random() * 3); // 2-4层
  const basementFloors = 1 + Math.floor(Math.random() * 3); // 1-3层
  const unitsPerFloor = 2 + Math.floor(Math.random() * 4); // 2-5户/层
  
  return {
    id: `test-bld-${Date.now()}-${index}`,
    buildingCode: code,
    name: `第${index}棟`,
    houseNumberPrefix: code,
    roofFloors,
    residentialFloors,
    basementFloors,
    unitsPerFloor,
    totalFloors: roofFloors + residentialFloors + basementFloors,
    totalUnits: residentialFloors * unitsPerFloor,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function autoGenerateFloors(building) {
  const floors = [];
  
  // R楼
  for (let i = 1; i <= building.roofFloors; i++) {
    floors.push({
      id: `${building.id}-R${i}`,
      buildingId: building.id,
      floorNumber: `R${i}`,
      name: `R${i}樓`,
      floorType: 'roof',
      totalUnits: 0,
      sortOrder: -100 - i,
    });
  }
  
  // 居住层
  for (let i = 1; i <= building.residentialFloors; i++) {
    floors.push({
      id: `${building.id}-F${i}`,
      buildingId: building.id,
      floorNumber: `${i}F`,
      name: `${i}樓`,
      floorType: 'residential',
      totalUnits: building.unitsPerFloor,
      sortOrder: i,
    });
  }
  
  // 地下室
  for (let i = 1; i <= building.basementFloors; i++) {
    floors.push({
      id: `${building.id}-B${i}`,
      buildingId: building.id,
      floorNumber: `B${i}`,
      name: `B${i}地下室`,
      floorType: 'basement',
      totalUnits: 0,
      sortOrder: 100 + i,
    });
  }
  
  return floors;
}

function autoGenerateUnits(building, floors) {
  const units = [];
  const residentialFloors = floors.filter(f => f.floorType === 'residential');
  
  residentialFloors.forEach(floor => {
    const floorNum = parseInt(floor.floorNumber.replace(/\D/g, '')) || 0;
    for (let i = 1; i <= building.unitsPerFloor; i++) {
      const unitLabel = `${building.houseNumberPrefix}${floorNum}${String(i).padStart(2, '0')}`;
      units.push({
        id: `${building.id}-${floor.floorNumber}-${i}`,
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
  
  return units;
}

function createParkingZones(basementFloors) {
  const zones = [];
  const zoneTypes = [
    { name: '住戶區', type: 'resident' },
    { name: '訪客區', type: 'visitor' },
    { name: '機車區', type: 'motorcycle' },
  ];
  
  basementFloors.forEach((floor, floorIdx) => {
    // 每层随机创建1-3个分区
    const numZones = 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numZones; i++) {
      const zt = zoneTypes[i % zoneTypes.length];
      zones.push({
        id: `zone-${floor.id}-${i}`,
        buildingId: floor.buildingId,
        floorId: floor.id,
        name: `${floor.name}${zt.name}`,
        variableName: `${zt.type}Zone${floorIdx + 1}-${i}`,
        spaceCount: 0, // 稍后更新
        startNumber: 1,
        type: zt.type,
        sortOrder: i,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  });
  
  return zones;
}

function createParkingSpaces(zones) {
  const spaces = [];
  
  zones.forEach(zone => {
    // 每个分区随机创建2-8个车位
    const numSpaces = 2 + Math.floor(Math.random() * 7);
    zone.spaceCount = numSpaces;
    
    for (let i = 1; i <= numSpaces; i++) {
      spaces.push({
        id: `space-${zone.id}-${i}`,
        area: zone.id,
        number: `${zone.variableName}-${String(i).padStart(2, '0')}`,
        type: zone.type,
        status: Math.random() > 0.7 ? 'occupied' : 'available', // 30% 已占用
        occupantName: Math.random() > 0.7 ? `測試用戶${i}` : undefined,
      });
    }
  });
  
  return spaces;
}

// ==================== 验证函数 ====================

function validateAllData(building, floors, units, zones, spaces) {
  const errors = [];
  
  // 1. 验证楼层与栋数关联
  floors.forEach(floor => {
    if (floor.buildingId !== building.id) {
      errors.push(`楼层${floor.name}的buildingId不匹配`);
    }
  });
  
  // 2. 验证户别与楼层关联
  units.forEach(unit => {
    const floor = floors.find(f => f.id === unit.floorId);
    if (!floor) {
      errors.push(`户别${unit.unitNumber}找不到对应楼层`);
    }
  });
  
  // 3. 验证分区与楼层关联
  zones.forEach(zone => {
    const floor = floors.find(f => f.id === zone.floorId);
    if (!floor) {
      errors.push(`分区${zone.name}找不到对应楼层`);
    }
  });
  
  // 4. 验证车位与分区关联
  spaces.forEach(space => {
    const zone = zones.find(z => z.id === space.area);
    if (!zone) {
      errors.push(`车位${space.number}找不到对应分区`);
    }
  });
  
  // 5. 验证车位ID唯一性
  const spaceIds = spaces.map(s => s.id);
  const uniqueSpaceIds = [...new Set(spaceIds)];
  if (spaceIds.length !== uniqueSpaceIds.length) {
    errors.push('车位ID存在重复');
  }
  
  return { valid: errors.length === 0, errors };
}

function simulateFrontendSystem(floors, zones, spaces) {
  const basementFloors = floors
    .filter(f => f.floorType === 'basement')
    .sort((a, b) => a.sortOrder - b.sortOrder);
  
  if (basementFloors.length === 0) {
    return { displayedSpaces: 0, selectedFloor: null };
  }
  
  // 模拟选择第一个地下室楼层
  const selectedFloor = basementFloors[0];
  const floorZones = zones.filter(z => z.floorId === selectedFloor.id);
  const floorZoneIds = floorZones.map(z => z.id);
  const floorSpaces = spaces.filter(s => floorZoneIds.includes(s.area));
  
  return {
    displayedSpaces: floorSpaces.length,
    selectedFloor: selectedFloor.name,
    totalBasementFloors: basementFloors.length,
  };
}

function verifyDataConsistency(zones, spaces) {
  const errors = [];
  
  // 1. 验证每个分区的车位数是否正确
  zones.forEach(zone => {
    const zoneSpaces = spaces.filter(s => s.area === zone.id);
    if (zoneSpaces.length !== zone.spaceCount) {
      errors.push(`分区${zone.name}的车位数不匹配: 预期${zone.spaceCount}, 实际${zoneSpaces.length}`);
    }
  });
  
  // 2. 验证所有车位的类型是否与其分区类型一致
  spaces.forEach(space => {
    const zone = zones.find(z => z.id === space.area);
    if (zone && space.type !== zone.type) {
      errors.push(`车位${space.number}的类型与分区${zone.name}不匹配`);
    }
  });
  
  // 3. 验证车位编号格式
  spaces.forEach(space => {
    if (!space.number.includes('-')) {
      errors.push(`车位${space.id}的编号格式不正确: ${space.number}`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

// ==================== 总结函数 ====================

function printFinalSummary(results) {
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 最终测试总结');
  console.log('='.repeat(70));
  
  const passedTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  
  console.log(`\n✅ 通过: ${passedTests.length} / ${results.length}`);
  console.log(`❌ 失败: ${failedTests.length} / ${results.length}`);
  console.log(`📈 通过率: ${((passedTests.length / results.length) * 100).toFixed(1)}%`);
  
  // 统计数据
  if (passedTests.length > 0) {
    const avgStats = {
      floors: passedTests.reduce((sum, r) => sum + (r.stats?.floorCount || 0), 0) / passedTests.length,
      units: passedTests.reduce((sum, r) => sum + (r.stats?.unitCount || 0), 0) / passedTests.length,
      zones: passedTests.reduce((sum, r) => sum + (r.stats?.zoneCount || 0), 0) / passedTests.length,
      spaces: passedTests.reduce((sum, r) => sum + (r.stats?.spaceCount || 0), 0) / passedTests.length,
    };
    
    console.log('\n📈 平均数据量:');
    console.log(`   楼层: ${avgStats.floors.toFixed(1)}层`);
    console.log(`   户别: ${avgStats.units.toFixed(1)}户`);
    console.log(`   分区: ${avgStats.zones.toFixed(1)}个`);
    console.log(`   车位: ${avgStats.spaces.toFixed(1)}个`);
  }
  
  // 失败的测试详情
  if (failedTests.length > 0) {
    console.log('\n❌ 失败的测试详情:');
    failedTests.forEach(r => {
      console.log(`\n   测试 #${r.testIndex}:`);
      r.errors.forEach(e => console.log(`     - ${e}`));
    });
  }
  
  // 错误类型统计
  const allErrors = results.flatMap(r => r.errors);
  if (allErrors.length > 0) {
    const errorCounts = {};
    allErrors.forEach(e => {
      errorCounts[e] = (errorCounts[e] || 0) + 1;
    });
    
    console.log('\n📋 错误类型统计:');
    Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([error, count]) => {
        console.log(`   ${error}: ${count}次`);
      });
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(failedTests.length === 0 ? '🎉 所有测试全部通过！' : '⚠️ 部分测试未通过，请检查上述错误');
  console.log('='.repeat(70));
  
  // 返回结果供后续使用
  window.testResults = results;
  console.log('\n💡 提示: 完整结果已保存到 window.testResults');
}

// 导出函数
window.runFullIntegrationTest30Times = runFullIntegrationTest30Times;
window.runSingleTest = runSingleTest;

console.log('✅ 测试脚本已加载（30次基準版本）');
console.log('💡 运行方式: 直接回车或运行 window.runFullIntegrationTest30Times()');
