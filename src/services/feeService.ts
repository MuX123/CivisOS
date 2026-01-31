// src/services/feeService.ts
// 管理費計算服務

import type {
  FeeBaseConfig,
  SpecialFeeConfig,
  UnitFeeDetail,
  FeeCalculationResult,
} from '@/types/fee';
import type { UnitConfig } from '@/types/building';

class FeeService {
  /**
   * 計算管理費
   * 公式: 坪數 × 單價
   */
  calculateFee(size: number, pricePerPing: number): number {
    return Math.round(size * pricePerPing);
  }

  /**
   * 計算單一戶別的管理費
   */
  calculateUnitFee(
    unit: UnitConfig,
    baseConfigs: FeeBaseConfig[],
    specialConfigs: SpecialFeeConfig[]
  ): FeeCalculationResult {
    // 先檢查是否有特殊配置
    const specialConfig = specialConfigs.find(
      config =>
        config.buildingId === unit.buildingId &&
        config.type === 'unit_range' &&
        config.unitIds.includes(unit.id)
    );

    if (specialConfig) {
      if (specialConfig.type === 'custom' && specialConfig.customSize && specialConfig.customPrice) {
        return {
          unitId: unit.id,
          size: specialConfig.customSize,
          pricePerPing: specialConfig.customPrice,
          monthlyFee: this.calculateFee(specialConfig.customSize, specialConfig.customPrice),
          calculationMethod: 'special',
          appliedConfig: {
            type: 'special',
            id: specialConfig.id,
            name: specialConfig.name,
          },
        };
      }
    }

    // 使用基礎配置
    const baseConfig = baseConfigs.find(
      config => config.buildingId === unit.buildingId || config.buildingId === null
    );

    const pricePerPing = baseConfig?.pricePerPing || 0;
    const size = unit.size || baseConfig?.defaultSize || 0;

    return {
      unitId: unit.id,
      size,
      pricePerPing,
      monthlyFee: this.calculateFee(size, pricePerPing),
      calculationMethod: baseConfig ? 'default' : 'default',
      appliedConfig: {
        type: baseConfig ? 'base' : 'base',
      },
    };
  }

  /**
   * 批量計算所有戶別的管理費
   */
  calculateAllUnitFees(
    units: UnitConfig[],
    baseConfigs: FeeBaseConfig[],
    specialConfigs: SpecialFeeConfig[]
  ): UnitFeeDetail[] {
    return units.map(unit => {
      const result = this.calculateUnitFee(unit, baseConfigs, specialConfigs);

      return {
        unitId: unit.id,
        buildingId: unit.buildingId,
        unitNumber: unit.unitNumber,
        displayName: unit.displayName,
        size: result.size,
        pricePerPing: result.pricePerPing,
        monthlyFee: result.monthlyFee,
        source: result.calculationMethod,
        specialConfigId: result.appliedConfig.type === 'special' ? result.appliedConfig.id : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
  }

  /**
   * 更新戶別坪數並重新計算管理費
   */
  updateUnitSizeAndRecalculate(
    unit: UnitConfig,
    newSize: number,
    baseConfigs: FeeBaseConfig[]
  ): { unit: UnitConfig; monthlyFee: number } {
    const baseConfig = baseConfigs.find(
      config => config.buildingId === unit.buildingId || config.buildingId === null
    );
    const pricePerPing = baseConfig?.pricePerPing || 0;
    const monthlyFee = this.calculateFee(newSize, pricePerPing);

    return {
      unit: {
        ...unit,
        size: newSize,
        monthlyFee,
        updatedAt: new Date().toISOString(),
      },
      monthlyFee,
    };
  }

  /**
   * 批量更新多戶別的坪數
   */
  batchUpdateUnitSizes(
    units: UnitConfig[],
    updates: { unitId: string; size: number }[],
    baseConfigs: FeeBaseConfig[]
  ): UnitConfig[] {
    const updateMap = new Map(updates.map(u => [u.unitId, u.size]));

    return units.map(unit => {
      const newSize = updateMap.get(unit.id);
      if (newSize !== undefined) {
        const baseConfig = baseConfigs.find(
          config => config.buildingId === unit.buildingId || config.buildingId === null
        );
        const pricePerPing = baseConfig?.pricePerPing || 0;
        const monthlyFee = this.calculateFee(newSize, pricePerPing);

        return {
          ...unit,
          size: newSize,
          monthlyFee,
          updatedAt: new Date().toISOString(),
        };
      }
      return unit;
    });
  }

  /**
   * 計算統計資料
   */
  calculateStats(details: UnitFeeDetail[]): {
    totalUnits: number;
    totalMonthlyFee: number;
    averageMonthlyFee: number;
    maxMonthlyFee: number;
    minMonthlyFee: number;
    sizedUnits: number;
    unsizedUnits: number;
  } {
    const sizedDetails = details.filter(d => d.size > 0);

    const monthlyFees = details.map(d => d.monthlyFee);
    const totalMonthlyFee = monthlyFees.reduce((sum, fee) => sum + fee, 0);
    const maxMonthlyFee = Math.max(...monthlyFees, 0);
    const minMonthlyFee = Math.min(...monthlyFees.filter(f => f > 0), 0);

    return {
      totalUnits: details.length,
      totalMonthlyFee,
      averageMonthlyFee: details.length > 0 ? totalMonthlyFee / details.length : 0,
      maxMonthlyFee,
      minMonthlyFee: minMonthlyFee || 0,
      sizedUnits: sizedDetails.length,
      unsizedUnits: details.length - sizedDetails.length,
    };
  }

  /**
   * 為特殊配置查找適用的戶別
   */
  findUnitsForSpecialConfig(
    units: UnitConfig[],
    buildingId: string,
    floorFilter?: string
  ): UnitConfig[] {
    return units.filter(unit => {
      if (unit.buildingId !== buildingId) return false;
      if (floorFilter && unit.floorId !== floorFilter) return false;
      return true;
    });
  }
}

export const feeService = new FeeService();
export default feeService;
