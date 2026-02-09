import { BuildingConfig, Floor, UnitConfig, ParkingSpaceConfig } from '../types/domain';

// 1. 自動生成樓層
export function autoGenerateFloors(building: BuildingConfig): Floor[] {
  const floors: Floor[] = [];
  const now = new Date().toISOString();
  
  // R樓
  for (let i = 1; i <= building.roofFloors; i++) {
    floors.push({
      id: `${building.id}-R${i}`,
      buildingId: building.id,
      floorNumber: `R${i}`,
      name: `R${i}樓`,
      floorType: 'roof',
      totalUnits: 0,
      sortOrder: -100 - i, // R樓通常在最上面，但在列表排序可能依需求調整，這裡假設負數
      createdAt: now,
      updatedAt: now,
    });
  }
  
  // 居住層 (1F, 2F, ...) - 通常由低到高，或者由高到低
  for (let i = 1; i <= building.residentialFloors; i++) {
    floors.push({
      id: `${building.id}-F${i}`,
      buildingId: building.id,
      floorNumber: `${i}F`,
      name: `${i}樓`,
      floorType: 'residential',
      totalUnits: building.unitsPerFloor,
      sortOrder: i,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  // 地下室 (B1, B2, ...)
  for (let i = 1; i <= building.basementFloors; i++) {
    floors.push({
      id: `${building.id}-B${i}`,
      buildingId: building.id,
      floorNumber: `B${i}`,
      name: `B${i}地下室`,
      floorType: 'basement',
      totalUnits: 0,
      sortOrder: 100 + i, // 地下室在最下面
      createdAt: now,
      updatedAt: now,
    });
  }
  
  return floors;
}

// 2. 自動生成戶別
export function autoGenerateUnits(building: BuildingConfig, floors: Floor[]): UnitConfig[] {
  const units: UnitConfig[] = [];
  const residentialFloors = floors.filter(f => f.floorType === 'residential');
  
  residentialFloors.forEach(floor => {
    // 從 floorNumber 提取數字 (例如 "1F" -> 1)
    const floorNumStr = floor.floorNumber.replace(/\D/g, '');
    const floorNum = parseInt(floorNumStr) || 0;

    if (building.unitRules && building.unitRules.length > 0) {
      // 使用自訂戶別規則
      building.unitRules.forEach((rule, index) => {
        // 格式：{rule.code}({rule.unitNumber})
        const unitLabel = `${rule.code}(${rule.unitNumber})`;
        
        units.push({
          id: `${building.id}-${floor.floorNumber}-${rule.code || index + 1}`,
          buildingId: building.id,
          floorId: floor.id,
          unitNumber: unitLabel,
          floorNumber: floor.floorNumber,
          floorType: 'residential',
          sortOrder: (floorNum * 100) + (index + 1),
          status: 'vacant',
          note: rule.code // 將代號放入備註或擴充欄位
        });
      });
    } else {
      // 原有邏輯
      for (let i = 1; i <= building.unitsPerFloor; i++) {
        // 使用 houseNumberPrefix 來生成戶號
      // 格式：{houseNumberPrefix}{floorNumStr}{i} 
      // 例如：houseNumberPrefix="101", floorNumStr="1", i=1 → "101101"
      // 例如：houseNumberPrefix="A", floorNumStr="1", i=1 → "A11"
      const prefix = building.houseNumberPrefix || building.buildingCode;
      const unitLabel = `${prefix}${floorNumStr}${String(i).padStart(2, '0')}`;
      
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
    }
  });
  
  return units;
}

// 3. 自動生成車位
export function autoGenerateParkingSpaces(
  building: BuildingConfig,
  floors: Floor[],
  spacesPerFloor: number = 20,
  areas: string[] = ['A', 'B']
): ParkingSpaceConfig[] {
  const parkingSpaces: ParkingSpaceConfig[] = [];
  const basementFloors = floors.filter(f => f.floorType === 'basement');
  
  basementFloors.forEach(floor => {
    areas.forEach(area => {
      for (let i = 1; i <= spacesPerFloor; i++) {
        const spaceNumStr = String(i).padStart(3, '0');
        parkingSpaces.push({
          id: `${area}-${building.buildingCode}-${floor.floorNumber}-${spaceNumStr}`,
          buildingId: building.id,
          floorId: floor.id,
          areaId: area,
          number: `${area}${building.buildingCode}-${floor.floorNumber}-${spaceNumStr}`,
          type: area === 'A' ? 'resident' : 'visitor', // 簡單預設邏輯
          status: 'available',
        });
      }
    });
  });
  
  return parkingSpaces;
}
