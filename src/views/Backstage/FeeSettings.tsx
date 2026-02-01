import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { BuildingConfig, UnitConfig } from '../../types/domain';
import type { FeeBaseConfig, SpecialFeeConfig } from '../../types/fee';
import { feeActions } from '../../store/modules/fee';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

// ==================== 後台管理費設定頁面 ====================

const FeeSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const buildings = useAppSelector((state) => state.building.buildings);
  const units = useAppSelector((state) => state.building.units);
  const floors = useAppSelector((state) => state.building.floors);
  
  // 從 fee store 取得設定
  const feeState = useAppSelector((state) => state.fee);
  const { defaultPricePerPing, baseConfigs, specialConfigs } = feeState;
  
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [newItemData, setNewItemData] = useState({
    name: '',
    amount: 0,
    isRecurring: true,
    note: '',
  });
  const [localPricePerPing, setLocalPricePerPing] = useState(defaultPricePerPing);

  // 同步本地狀態與 store
  useEffect(() => {
    setLocalPricePerPing(defaultPricePerPing);
  }, [defaultPricePerPing]);

  // 預設選中第一個棟別
  useEffect(() => {
    if (buildings.length > 0 && !selectedBuildingId) {
      setSelectedBuildingId(buildings[0].id);
    }
  }, [buildings, selectedBuildingId]);

  // 取得當前選中的棟別
  const currentBuilding = buildings.find((b) => b.id === selectedBuildingId);

  // 取得該棟的樓層和戶別（依樓層分組）
  const getBuildingUnitsByFloor = () => {
    if (!selectedBuildingId) return [];

    const buildingFloors = floors
      .filter((f) => f.buildingId === selectedBuildingId && f.floorType === 'residential')
      .sort((a, b) => {
        const aNum = parseInt(a.floorNumber) || 0;
        const bNum = parseInt(b.floorNumber) || 0;
        return bNum - aNum;
      });

    return buildingFloors.map((floor) => {
      const floorUnits = units
        .filter((u) => u.floorId === floor.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      return {
        floor,
        units: floorUnits,
      };
    });
  };

  // 取得該戶的費用設定
  const getUnitFeeConfig = (unitId: string) => {
    // 先檢查特殊配置
    const specialConfig = specialConfigs.find(
      (c) => c.unitIds.includes(unitId) && c.buildingId === selectedBuildingId
    );
    
    if (specialConfig) {
      return {
        pricePerPing: specialConfig.customPrice || defaultPricePerPing,
        additionalItems: [], // 特殊配置暫不支援額外項目
        isSpecial: true,
      };
    }

    // 檢查基礎配置
    const baseConfig = baseConfigs.find(
      (c) => c.buildingId === selectedBuildingId && c.isActive
    );

    return {
      pricePerPing: baseConfig?.pricePerPing || defaultPricePerPing,
      additionalItems: [],
      isSpecial: false,
    };
  };

  // 更新預設費率
  const handleUpdateDefaultPrice = () => {
    dispatch(feeActions.batchUpdateSettings({ pricePerPing: localPricePerPing }));
    alert(`已更新預設費率為 ${localPricePerPing} 元/坪`);
  };

  // 為特定戶別設定特殊費率
  const handleSetSpecialPrice = (unitId: string, price: number) => {
    if (!selectedBuildingId) return;

    // 檢查是否已存在特殊配置
    const existingIndex = specialConfigs.findIndex(
      (c) => c.unitIds.includes(unitId) && c.buildingId === selectedBuildingId
    );

    if (existingIndex >= 0) {
      // 更新現有配置
      const updatedConfig = {
        ...specialConfigs[existingIndex],
        customPrice: price,
        updatedAt: new Date().toISOString(),
      };
      dispatch(feeActions.updateSpecialConfig(updatedConfig));
    } else {
      // 新增特殊配置
      const unit = units.find((u) => u.id === unitId);
      dispatch(
        feeActions.addSpecialConfig({
          buildingId: selectedBuildingId,
          name: `${unit?.unitNumber || unitId} 特殊費率`,
          type: 'custom',
          unitIds: [unitId],
          customPrice: price,
          description: '',
        })
      );
    }
  };

  // 移除特殊費率設定
  const handleRemoveSpecialPrice = (unitId: string) => {
    const config = specialConfigs.find(
      (c) => c.unitIds.includes(unitId) && c.buildingId === selectedBuildingId
    );
    if (config) {
      dispatch(feeActions.deleteSpecialConfig(config.id));
    }
  };

  // 批次套用預設費率
  const applyDefaultToAll = () => {
    if (!confirm(`確定要將預設費率 ${defaultPricePerPing} 元/坪 套用到所有戶別嗎？`)) return;

    if (!selectedBuildingId) return;

    // 為該棟建立基礎配置
    const existingBaseIndex = baseConfigs.findIndex(
      (c) => c.buildingId === selectedBuildingId
    );

    if (existingBaseIndex >= 0) {
      // 更新現有配置
      const updatedConfig = {
        ...baseConfigs[existingBaseIndex],
        pricePerPing: defaultPricePerPing,
        updatedAt: new Date().toISOString(),
      };
      dispatch(feeActions.updateBaseConfig(updatedConfig));
    } else {
      // 新增基礎配置
      dispatch(
        feeActions.addBaseConfig({
          buildingId: selectedBuildingId,
          name: `${currentBuilding?.buildingCode || ''}棟 基礎費率`,
          pricePerPing: defaultPricePerPing,
          defaultSize: 30,
          isActive: true,
          description: '',
        })
      );
    }

    alert('已套用預設費率到所有戶別');
  };

  // 計算該戶的總費用
  const calculateTotalFee = (unit: UnitConfig, config: { pricePerPing: number; isSpecial: boolean }): number => {
    const area = (unit as any).size || (unit as any).area || 30;
    return area * config.pricePerPing;
  };

  const floorData = getBuildingUnitsByFloor();

  return (
    <div className="fee-settings p-6 max-w-7xl mx-auto">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-normal)] mb-2">管理費設定</h2>
        <p className="text-[var(--text-muted)]">
          設定各戶別的管理費率及額外付費項目
        </p>
      </div>

      {/* 預設費率設定 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[var(--text-muted)]">
                預設管理費率（每坪）
              </label>
              <input
                type="number"
                value={localPricePerPing}
                onChange={(e) => setLocalPricePerPing(parseInt(e.target.value) || 0)}
                className="w-24 px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
              />
              <span className="text-[var(--text-muted)]">元/坪</span>
            </div>
            <Button variant="primary" size="small" onClick={handleUpdateDefaultPrice}>
              更新預設費率
            </Button>
            <Button variant="secondary" size="small" onClick={applyDefaultToAll}>
              批次套用到該棟
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 棟別分頁 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          選擇棟別
        </h3>
        <div className="flex flex-wrap gap-2">
          {buildings.map((building) => (
            <button
              key={building.id}
              onClick={() => setSelectedBuildingId(building.id)}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 border-2 ${
                selectedBuildingId === building.id
                  ? 'border-[var(--brand-experiment)] bg-[var(--brand-experiment)] bg-opacity-10 text-[var(--brand-experiment)]'
                  : 'border-[var(--color-border)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:text-[var(--text-normal)]'
              }`}
            >
              {building.buildingCode}棟
            </button>
          ))}
          {buildings.length === 0 && (
            <p className="text-[var(--text-muted)] italic">
              尚未設定棟別，請先在「棟數設定」中新增棟別
            </p>
          )}
        </div>
      </div>

      {/* 樓層戶別列表 */}
      {selectedBuildingId && currentBuilding && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-[var(--text-normal)]">
              {currentBuilding.buildingCode}棟 管理費設定
            </h3>
            <span className="text-sm text-[var(--text-muted)]">
              共 {floorData.reduce((sum, f) => sum + f.units.length, 0)} 戶
            </span>
          </div>

          {floorData.map(({ floor, units: floorUnits }) => (
            <div key={floor.id} className="space-y-3">
              {/* 樓層標題 */}
              <div className="flex items-center gap-2 py-2 border-b border-[var(--color-border)]">
                <span className="text-lg font-bold text-[var(--brand-experiment)]">
                  {floor.name}
                </span>
                <span className="text-sm text-[var(--text-muted)]">
                  ({floorUnits.length} 戶)
                </span>
              </div>

              {/* 戶別卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {floorUnits.map((unit) => {
                  const config = getUnitFeeConfig(unit.id);
                  const totalFee = calculateTotalFee(unit, config);
                  const area = (unit as any).size || (unit as any).area || 30;

                  return (
                    <div
                      key={unit.id}
                      className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--bg-secondary)]"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-[var(--text-normal)]">
                            {unit.unitNumber}
                          </h4>
                          <p className="text-xs text-[var(--text-muted)]">
                            坪數: {area} 坪
                          </p>
                        </div>
                        {config.isSpecial && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded">
                            特殊費率
                          </span>
                        )}
                      </div>

                      {/* 費率設定 */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.isSpecial}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // 啟用特殊費率，預設為目前價格
                                handleSetSpecialPrice(unit.id, config.pricePerPing);
                              } else {
                                // 取消特殊費率
                                handleRemoveSpecialPrice(unit.id);
                              }
                            }}
                            className="rounded border-[var(--color-border)]"
                          />
                          <span className="text-sm text-[var(--text-muted)]">自定義費率</span>
                        </div>
                        
                        {config.isSpecial ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={config.pricePerPing}
                              onChange={(e) => handleSetSpecialPrice(unit.id, parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] text-sm"
                            />
                            <span className="text-sm text-[var(--text-muted)]">元/坪</span>
                          </div>
                        ) : (
                          <p className="text-sm text-[var(--text-muted)]">
                            使用費率: {config.pricePerPing} 元/坪
                            {baseConfigs.find((c) => c.buildingId === selectedBuildingId)?.isActive 
                              ? ' (基礎配置)' 
                              : ' (預設)'}
                          </p>
                        )}
                      </div>

                      {/* 總計 */}
                      <div className="border-t border-[var(--color-border)] pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--text-muted)]">每月應繳:</span>
                          <span className="font-bold text-[var(--brand-experiment)] text-lg">
                            ${totalFee.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {area} 坪 × {config.pricePerPing} 元/坪
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {floorData.length === 0 && (
            <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-lg border border-dashed border-[var(--color-border)]">
              <p className="text-[var(--text-muted)]">該棟尚未設定樓層和戶別資料</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeeSettings;
