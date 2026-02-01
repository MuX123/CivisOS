// src/services/buildingService.ts
// 棟數管理服務 - 包含樓層與戶別自動生成邏輯

import type {
  BuildingConfig,
  FloorConfig,
  UnitConfig,
  ParkingSpaceConfig,
  AutoGenerateConfig,
} from '@/types/building';

// UUID 生成工具
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 格式化樓層編號
function formatFloorNumber(type: 'basement' | 'residential' | 'roof', index: number): string {
  if (type === 'basement') {
    return `B${index}`;
  } else if (type === 'residential') {
    return `${index}F`;
  } else {
    return 'RF';
  }
}

// 格式化樓層名稱
function formatFloorName(type: 'basement' | 'residential' | 'roof', index: number): string {
  if (type === 'basement') {
    return `地下室 ${index}樓`;
  } else if (type === 'residential') {
    return `${index}樓`;
  } else {
    return '屋頂層';
  }
}

// 格式化戶別編號
function formatUnitNumber(floorIndex: number, unitIndex: number): string {
  // 確保號碼為兩位數，不足補零
  const paddedUnitIndex = String(unitIndex + 1).padStart(2, '0');
  return `${floorIndex}${paddedUnitIndex}`;
}

// 格式化戶別顯示名稱
// function formatUnitDisplayName(buildingCode: string, floorNumber: string, unitNumber: string): string {
//   return `${buildingCode}-${floorNumber}-${unitNumber}`;
// }

// 格式化車位號碼
function formatParkingSpaceNumber(startNumber: number, index: number, prefix?: string): string {
  const number = startNumber + index;
  const paddedNumber = String(number).padStart(3, '0');
  return prefix ? `${prefix}${paddedNumber}` : paddedNumber;
}

class BuildingService {
  /**
   * 根據棟數設定自動生成樓層
   */
  generateFloors(building: BuildingConfig): FloorConfig[] {
    const floors: FloorConfig[] = [];
    let sortOrder = 0;

    // 生成地下室樓層 (B1, B2, ...)，由下往上
    for (let i = building.basementFloors; i >= 1; i--) {
      const floorNumber = formatFloorNumber('basement', i);
      const floorName = formatFloorName('basement', i);
      const parkingStart = 1 + (building.basementFloors - i) * 20; // Default logic
      const parkingEnd = parkingStart + 20 - 1; // Default 20 per floor

      floors.push({
        id: generateId(),
        buildingId: building.id,
        floorNumber,
        name: floorName,
        floorType: 'basement',
        sortOrder: sortOrder++,
        totalUnits: 0, // 地下室沒有戶別
        // parkingSpaceStartNumber: parkingStart,
        // parkingSpaceEndNumber: parkingEnd,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 生成居住層 (1F, 2F, ...)，由下往上
    for (let i = 1; i <= building.residentialFloors; i++) {
      const floorNumber = formatFloorNumber('residential', i);
      const floorName = formatFloorName('residential', i);

      floors.push({
        id: generateId(),
        buildingId: building.id,
        floorNumber,
        name: floorName,
        floorType: 'residential',
        sortOrder: sortOrder++,
        totalUnits: building.unitsPerFloor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 生成屋頂層 (RF)
    if (building.roofFloors > 0) {
      floors.push({
        id: generateId(),
        buildingId: building.id,
        floorNumber: formatFloorNumber('roof', 0),
        name: formatFloorName('roof', 0),
        floorType: 'roof',
        sortOrder: sortOrder++,
        totalUnits: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return floors;
  }

  /**
   * 根據棟數與樓層自動生成戶別
   */
  generateUnits(building: BuildingConfig, floors: FloorConfig[]): UnitConfig[] {
    const units: UnitConfig[] = [];

    // 只為居住層生成戶別
    const residentialFloors = floors.filter(f => f.floorType === 'residential');

    residentialFloors.forEach((floor) => {
      for (let i = 0; i < building.unitsPerFloor; i++) {
        // const unitNumber = formatUnitNumber(parseInt(floor.floorNumber), i);
        // Use user defined format: {BuildingCode}{Index} (e.g. A1, A2)
        const unitNumber = `${building.buildingCode}${i + 1}`;
        const displayName = unitNumber; // formatUnitDisplayName(building.buildingCode, floor.floorNumber, unitNumber);

        units.push({
          id: generateId(),
          buildingId: building.id,
          floorId: floor.id,
          unitNumber,
          displayName: unitNumber,
          type: 'residential',
          size: 0,
          status: 'vacant',
          sortOrder: i,
          monthlyFee: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });

    return units;
  }

  /**
   * 根據棟數與樓層自動生成車位 (僅地下室)
   */
  generateParkingSpaces(building: BuildingConfig, floors: FloorConfig[]): ParkingSpaceConfig[] {
    const spaces: ParkingSpaceConfig[] = [];

    // 只為地下室樓層生成車位
    const basementFloors = floors.filter(f => f.floorType === 'basement');

    basementFloors.forEach((floor) => {
      if (floor.parkingSpaceStartNumber !== undefined && floor.parkingSpaceEndNumber !== undefined) {
        const totalSpaces = floor.parkingSpaceEndNumber - floor.parkingSpaceStartNumber + 1;

        for (let i = 0; i < totalSpaces; i++) {
          const spaceNumber = formatParkingSpaceNumber(
            floor.parkingSpaceStartNumber!,
            i,
            building.buildingCode
          );

          spaces.push({
            id: generateId(),
            buildingId: building.id,
            floorId: floor.id,
            spaceNumber,
            type: 'resident',
            status: 'available',
            sortOrder: i,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    });

    return spaces;
  }

  /**
   * 自動生成全部 (樓層 + 戶別 + 車位)
   */
  autoGenerateAll(config: AutoGenerateConfig, building: BuildingConfig): {
    floors: FloorConfig[];
    units: UnitConfig[];
    parkingSpaces: ParkingSpaceConfig[];
  } {
    const floors: FloorConfig[] = [];
    const units: UnitConfig[] = [];
    const parkingSpaces: ParkingSpaceConfig[] = [];

    if (config.generateFloors) {
      const generatedFloors = this.generateFloors(building);
      floors.push(...generatedFloors);

      if (config.generateUnits) {
        units.push(...this.generateUnits(building, generatedFloors));
      }

      if (config.generateParkingSpaces) {
        parkingSpaces.push(...this.generateParkingSpaces(building, generatedFloors));
      }
    }

    return { floors, units, parkingSpaces };
  }

  /**
   * 更新棟數設定並重新生成
   */
  updateBuildingWithRegeneration(
    building: BuildingConfig,
    floors: FloorConfig[],
    units: UnitConfig[],
    parkingSpaces: ParkingSpaceConfig[],
    updateData: Partial<BuildingConfig>
  ): {
    building: BuildingConfig;
    floors: FloorConfig[];
    units: UnitConfig[];
    parkingSpaces: ParkingSpaceConfig[];
  } {
    // 更新棟數
    const updatedBuilding: BuildingConfig = {
      ...building,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // 檢查是否需要重新生成
    const needsRegenerateFloors =
      updateData.basementFloors !== undefined ||
      updateData.residentialFloors !== undefined ||
      updateData.roofFloors !== undefined ||
      updateData.unitsPerFloor !== undefined;

    const needsRegenerateParking =
      updateData.parkingSpacesPerBasementFloor !== undefined ||
      updateData.parkingSpaceStartNumber !== undefined;

    let newFloors = floors;
    let newUnits = units;
    let newParkingSpaces = parkingSpaces;

    if (needsRegenerateFloors) {
      // 重新生成樓層
      newFloors = this.generateFloors(updatedBuilding);

      // 重新生成戶別 (如果需要)
      if (updateData.unitsPerFloor !== undefined) {
        newUnits = this.generateUnits(updatedBuilding, newFloors);
      }
    }

    if (needsRegenerateParking) {
      // 重新生成車位
      newParkingSpaces = this.generateParkingSpaces(updatedBuilding, newFloors);
    }

    return {
      building: updatedBuilding,
      floors: newFloors,
      units: newUnits,
      parkingSpaces: newParkingSpaces,
    };
  }

  /**
   * 重新排序戶別
   */
  reorderUnits(units: UnitConfig[], newOrder: string[]): UnitConfig[] {
    const unitMap = new Map(units.map(u => [u.id, u]));
    const reorderedUnits: UnitConfig[] = [];

    newOrder.forEach((id, index) => {
      const unit = unitMap.get(id);
      if (unit) {
        reorderedUnits.push({
          ...unit,
          sortOrder: index,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    return reorderedUnits;
  }

  /**
   * 戶別與車位關聯
   */
  associateUnitWithParking(
    unitId: string,
    parkingSpaceIds: string[],
    units: UnitConfig[],
    parkingSpaces: ParkingSpaceConfig[]
  ): {
    units: UnitConfig[];
    parkingSpaces: ParkingSpaceConfig[];
  } {
    // 更新戶別的車位關聯 (可以有多個車位)
    const updatedUnits = units.map(unit => {
      if (unit.id === unitId) {
        return {
          ...unit,
          updatedAt: new Date().toISOString(),
        };
      }
      return unit;
    });

    // 更新車位的戶別關聯
    const updatedParkingSpaces = parkingSpaces.map(space => {
      if (parkingSpaceIds.includes(space.id)) {
        return {
          ...space,
          unitId,
          status: 'occupied' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return space;
    });

    return {
      units: updatedUnits,
      parkingSpaces: updatedParkingSpaces,
    };
  }
}

export const buildingService = new BuildingService();
export default buildingService;
