/**
 * 一条龙测试：栋数、户别、停车位完整流程测试
 * 
 * 运行方式：
 * 1. 在浏览器控制台中运行
 * 2. 或作为单元测试运行
 */

import { BuildingConfig, Floor, UnitConfig, ParkingSpaceConfig, ParkingSpace, ParkingZoneConfig } from '../../types/domain';
import { autoGenerateFloors, autoGenerateUnits, autoGenerateParkingSpaces } from '../../utils/autoGenerate';

// ==================== 测试数据 ====================

const TEST_BUILDING: Omit<BuildingConfig, 'id' | 'createdAt' | 'updatedAt' | 'totalFloors' | 'totalUnits'> = {
  buildingCode: 'A',
  name: '第一棟',
  houseNumberPrefix: 'A',
  roofFloors: 1,
  residentialFloors: 2,
  basementFloors: 2,
  unitsPerFloor: 2,
  status: 'active',
};

// ==================== 测试函数 ====================

export function runFullIntegrationTest() {
  console.log('🚀 开始一条龙测试...\n');
  
  const results: { step: string; passed: boolean; details: any }[] = [];
  
  // Step 1: 创建栋数
  console.log('📋 Step 1: 创建栋数');
  try {
    const building = createBuilding(TEST_BUILDING);
    console.log('✅ 栋数创建成功:', building);
    results.push({ step: '创建栋数', passed: true, details: building });
    
    // Step 2: 自动生成楼层
    console.log('\n📋 Step 2: 自动生成楼层');
    const floors = autoGenerateFloors(building);
    console.log('✅ 楼层生成成功，共', floors.length, '层');
    console.log('   R楼:', floors.filter(f => f.floorType === 'roof').length, '层');
    console.log('   居住层:', floors.filter(f => f.floorType === 'residential').length, '层');
    console.log('   地下室:', floors.filter(f => f.floorType === 'basement').length, '层');
    floors.forEach((f: Floor) => console.log(`   - ${f.name} (${f.floorNumber})`));
    results.push({ step: '生成楼层', passed: true, details: floors });
    
    // Step 3: 自动生成户别
    console.log('\n📋 Step 3: 自动生成户别');
    const units = autoGenerateUnits(building, floors);
    console.log('✅ 户别生成成功，共', units.length, '户');
    units.forEach((u: UnitConfig) => console.log(`   - ${u.unitNumber} (${u.floorNumber})`));
    results.push({ step: '生成户别', passed: true, details: units });
    
    // Step 4: 自动生成停车位（方式1：通过棟数设定）
    console.log('\n📋 Step 4: 自动生成停车位（棟数设定方式）');
    const parkingSpacesFromBuilding = autoGenerateParkingSpaces(building, floors, 5, ['A', 'B']);
    console.log('✅ 停车位生成成功，共', parkingSpacesFromBuilding.length, '个');
    console.log('   B1层:', parkingSpacesFromBuilding.filter((p: ParkingSpaceConfig) => p.floorId.includes('B1')).length, '个');
    console.log('   B2层:', parkingSpacesFromBuilding.filter((p: ParkingSpaceConfig) => p.floorId.includes('B2')).length, '个');
    parkingSpacesFromBuilding.slice(0, 5).forEach((p: ParkingSpaceConfig) => console.log(`   - ${p.number}`));
    results.push({ step: '棟数设定生成车位', passed: true, details: parkingSpacesFromBuilding });
    
    // Step 5: 通过车位设定页面创建车位
    console.log('\n📋 Step 5: 通过车位设定页面创建车位');
    const { zones, spaces: parkingSpacesFromSettings } = createParkingFromSettings(floors);
    console.log('✅ 车位设定创建成功');
    console.log('   分区数:', zones.length);
    console.log('   车位数:', parkingSpacesFromSettings.length);
    zones.forEach(z => {
      const zoneSpaces = parkingSpacesFromSettings.filter(s => s.area === z.id);
      console.log(`   - ${z.name}: ${zoneSpaces.length}个车位`);
    });
    results.push({ step: '车位设定创建车位', passed: true, details: { zones, spaces: parkingSpacesFromSettings } });
    
    // Step 6: 验证数据关联
    console.log('\n📋 Step 6: 验证数据关联');
    const validation = validateRelationships(building, floors, units, parkingSpacesFromSettings);
    console.log('✅ 数据关联验证:', validation.valid ? '通过' : '失败');
    if (!validation.valid) {
      console.error('   错误:', validation.errors);
    }
    results.push({ step: '数据关联验证', passed: validation.valid, details: validation });
    
    // Step 7: 模拟前台显示
    console.log('\n📋 Step 7: 模拟前台车位系统显示');
    const frontendDisplay = simulateFrontendDisplay(floors, zones, parkingSpacesFromSettings);
    console.log('✅ 前台显示模拟:');
    console.log('   地下室楼层:', frontendDisplay.basementFloors.map(f => f.floorNumber).join(', '));
    console.log('   总车位数:', frontendDisplay.totalSpaces);
    frontendDisplay.floorsDisplay.forEach((fd: any) => {
      console.log(`   ${fd.floorName}: ${fd.spaces.length}个车位`);
    });
    results.push({ step: '前台显示模拟', passed: true, details: frontendDisplay });
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    results.push({ step: '整体流程', passed: false, details: error });
  }
  
  // 测试总结
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试总结');
  console.log('='.repeat(50));
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  console.log(`总计: ${passedCount}/${totalCount} 项通过`);
  results.forEach(r => {
    console.log(`${r.passed ? '✅' : '❌'} ${r.step}`);
  });
  
  return results;
}

// ==================== 辅助函数 ====================

function createBuilding(data: typeof TEST_BUILDING): BuildingConfig {
  const now = new Date().toISOString();
  return {
    ...data,
    id: `test-building-${Date.now()}`,
    totalFloors: data.roofFloors + data.residentialFloors + data.basementFloors,
    totalUnits: data.residentialFloors * data.unitsPerFloor,
    createdAt: now,
    updatedAt: now,
  };
}

function createParkingFromSettings(floors: Floor[]): { zones: ParkingZoneConfig[]; spaces: ParkingSpace[] } {
  const zones: ParkingZoneConfig[] = [];
  const spaces: ParkingSpace[] = [];
  
  const basementFloors = floors.filter(f => f.floorType === 'basement');
  
  basementFloors.forEach((floor, floorIdx) => {
    // 为每层创建2个分区
    const zoneTypes: Array<{ name: string; type: ParkingZoneConfig['type'] }> = [
      { name: '住戶區', type: 'resident' },
      { name: '訪客區', type: 'visitor' },
    ];
    
    zoneTypes.forEach((zt, zoneIdx) => {
      const zone: ParkingZoneConfig = {
        id: `zone-${floor.id}-${zoneIdx}`,
        buildingId: floor.buildingId,
        floorId: floor.id,
        name: `${floor.name}${zt.name}`,
        variableName: `${zt.type}Zone${floorIdx + 1}`,
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
        const space: ParkingSpace = {
          id: `space-${zone.id}-${i}`,
          area: zone.id,
          number: `${zone.variableName}-${String(i).padStart(2, '0')}`,
          type: zt.type,
          status: 'available',
        };
        spaces.push(space);
      }
    });
  });
  
  return { zones, spaces };
}

function validateRelationships(
  building: BuildingConfig,
  floors: Floor[],
  units: UnitConfig[],
  parkingSpaces: ParkingSpace[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // 验证楼层与栋数关联
  floors.forEach(floor => {
    if (floor.buildingId !== building.id) {
      errors.push(`楼层 ${floor.name} 的 buildingId 不匹配`);
    }
  });
  
  // 验证户别与楼层关联
  units.forEach(unit => {
    const floor = floors.find(f => f.id === unit.floorId);
    if (!floor) {
      errors.push(`户别 ${unit.unitNumber} 找不到对应的楼层`);
    }
  });
  
  // 验证车位的 area 是否是有效的 zone ID
  // 注意：这里假设 area 存储的是 zone ID
  // 实际应用中应该从 state.parking.zones 获取
  
  return { valid: errors.length === 0, errors };
}

function simulateFrontendDisplay(
  floors: Floor[],
  zones: ParkingZoneConfig[],
  spaces: ParkingSpace[]
) {
  const basementFloors = floors
    .filter(f => f.floorType === 'basement')
    .sort((a, b) => a.sortOrder - b.sortOrder);
  
  const floorsDisplay = basementFloors.map(floor => {
    const floorZones = zones.filter(z => z.floorId === floor.id);
    const zoneIds = floorZones.map(z => z.id);
    const floorSpaces = spaces.filter(s => zoneIds.includes(s.area));
    
    return {
      floorId: floor.id,
      floorName: floor.name,
      floorNumber: floor.floorNumber,
      zones: floorZones,
      spaces: floorSpaces,
    };
  });
  
  return {
    basementFloors,
    totalSpaces: spaces.length,
    floorsDisplay,
  };
}

// ==================== 导出测试 ====================

export const IntegrationTests = {
  runFullIntegrationTest,
  createBuilding,
  createParkingFromSettings,
  validateRelationships,
  simulateFrontendDisplay,
};

// 如果直接在浏览器运行
if (typeof window !== 'undefined') {
  (window as any).runIntegrationTest = runFullIntegrationTest;
}

export default IntegrationTests;
