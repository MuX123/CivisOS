import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { BuildingConfig, UnitConfig } from '../../types/domain';
import { feeActions } from '../../store/modules/fee';
import type { SpecialFeeConfig, FeeBaseConfig, PaymentPeriod } from '../../types/fee';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

// ==================== 後台管理費設定頁面（含期數設定）====================

const FeeSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const buildings = useAppSelector((state) => state.building.buildings);
  const units = useAppSelector((state) => state.building.units);
  const floors = useAppSelector((state) => state.building.floors);
  
  // 從 fee store 取得設定
  const feeState = useAppSelector((state) => state.fee);
  const { defaultPricePerPing, baseConfigs, specialConfigs, periods } = feeState;
  
  // 分頁狀態
  const [activeTab, setActiveTab] = useState<'fee' | 'period'>('fee');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  
  // 期數設定狀態
  const [isAddingPeriod, setIsAddingPeriod] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PaymentPeriod | null>(null);
  const getDefaultPeriodData = () => {
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
    const year = currentPeriod.slice(0, 4);
    const month = parseInt(currentPeriod.slice(5));
    return {
      period: currentPeriod,
      name: `${year}年${month}月管理費`,
      dueDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      note: '',
    };
  };
  const [newPeriodData, setNewPeriodData] = useState(getDefaultPeriodData());
  
  // 費率設定狀態
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

  // 取得或建立費用設定
  const getFeeConfig = (unitId: string) => {
    // 從 specialConfigs 查找該戶的特殊設定
    const specialConfig = specialConfigs.find(
      (c) => c.unitIds.includes(unitId) && c.buildingId === selectedBuildingId
    );
    
    if (specialConfig) {
      return {
        pricePerPing: specialConfig.customPrice || defaultPricePerPing,
        additionalItems: specialConfig.additionalItems || [],
        isSpecial: true,
        configId: specialConfig.id,
      };
    }
    
    return {
      pricePerPing: defaultPricePerPing,
      additionalItems: [],
      isSpecial: false,
      configId: null,
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

    const existingIndex = specialConfigs.findIndex(
      (c) => c.unitIds.includes(unitId) && c.buildingId === selectedBuildingId
    );

    if (existingIndex >= 0) {
      const updatedConfig = {
        ...specialConfigs[existingIndex],
        customPrice: price,
        updatedAt: new Date().toISOString(),
      };
      dispatch(feeActions.updateSpecialConfig(updatedConfig));
    } else {
      const unit = units.find((u) => u.id === unitId);
      dispatch(
        feeActions.addSpecialConfig({
          buildingId: selectedBuildingId,
          name: `${unit?.unitNumber || unitId} 特殊費率`,
          type: 'custom',
          unitIds: [unitId],
          customPrice: price,
          additionalItems: [],
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

  // 新增額外費用項目
  const handleAddAdditionalItem = (unitId: string) => {
    const config = specialConfigs.find(
      (c) => c.unitIds.includes(unitId) && c.buildingId === selectedBuildingId
    );
    if (!config) return;

    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '額外費用',
      amount: 0,
      isFixed: true,
      note: '',
    };

    dispatch(
      feeActions.updateSpecialConfig({
        ...config,
        additionalItems: [...(config.additionalItems || []), newItem],
        updatedAt: new Date().toISOString(),
      })
    );
  };

  // 更新額外費用項目
  const handleUpdateAdditionalItem = (
    unitId: string,
    itemId: string,
    updates: Partial<{ name: string; amount: number; isFixed: boolean; note: string }>
  ) => {
    const config = specialConfigs.find(
      (c) => c.unitIds.includes(unitId) && c.buildingId === selectedBuildingId
    );
    if (!config) return;

    const updatedItems = (config.additionalItems || []).map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    dispatch(
      feeActions.updateSpecialConfig({
        ...config,
        additionalItems: updatedItems,
        updatedAt: new Date().toISOString(),
      })
    );
  };

  // 移除額外費用項目
  const handleRemoveAdditionalItem = (unitId: string, itemId: string) => {
    const config = specialConfigs.find(
      (c) => c.unitIds.includes(unitId) && c.buildingId === selectedBuildingId
    );
    if (!config) return;

    dispatch(
      feeActions.updateSpecialConfig({
        ...config,
        additionalItems: (config.additionalItems || []).filter((item) => item.id !== itemId),
        updatedAt: new Date().toISOString(),
      })
    );
  };

  // 批次套用預設費率
  const applyDefaultToAll = () => {
    if (!confirm(`確定要將預設費率 ${defaultPricePerPing} 元/坪 套用到所有戶別嗎？`)) return;

    if (!selectedBuildingId) return;

    const existingBaseIndex = baseConfigs.findIndex(
      (c) => c.buildingId === selectedBuildingId
    );

    if (existingBaseIndex >= 0) {
      const updatedConfig = {
        ...baseConfigs[existingBaseIndex],
        pricePerPing: defaultPricePerPing,
        updatedAt: new Date().toISOString(),
      };
      dispatch(feeActions.updateBaseConfig(updatedConfig));
    } else {
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

  // 新增期數
  const handleAddPeriod = () => {
    if (!newPeriodData.period || !newPeriodData.name || !newPeriodData.dueDate) return;

    dispatch(
      feeActions.addPeriod({
        period: newPeriodData.period,
        name: newPeriodData.name,
        dueDate: newPeriodData.dueDate,
        isActive: true,
        note: newPeriodData.note,
      })
    );

    setIsAddingPeriod(false);
    setNewPeriodData(getDefaultPeriodData());
  };

  // 更新期數
  const handleUpdatePeriod = () => {
    if (!editingPeriod) return;

    dispatch(
      feeActions.updatePeriod({
        ...editingPeriod,
        updatedAt: new Date().toISOString(),
      })
    );

    setEditingPeriod(null);
  };

  // 刪除期數
  const handleDeletePeriod = (periodId: string) => {
    if (!confirm('確定要刪除此期數嗎？')) return;
    dispatch(feeActions.deletePeriod(periodId));
  };

  // 計算該戶的總費用
  const calculateTotalFee = (unit: UnitConfig, config: { pricePerPing: number }): number => {
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
          設定各戶別的管理費率及繳費期數
        </p>
      </div>

      {/* 分頁標籤 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('fee')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'fee'
              ? 'bg-[var(--brand-experiment)] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          費率設定
        </button>
        <button
          onClick={() => setActiveTab('period')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'period'
              ? 'bg-[var(--brand-experiment)] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          期數設定 ({periods.length})
        </button>
      </div>

      {/* 費率設定分頁 */}
      {activeTab === 'fee' && (
        <>
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
                <Button variant="secondary" size="small" onClick={applyDefaultToAll}>
                  批次套用到該棟
                </Button>
              </div>

              {floorData.map(({ floor, units: floorUnits }) => (
                <div key={floor.id} className="space-y-3">
                  <div className="flex items-center gap-2 py-2 border-b border-[var(--color-border)]">
                    <span className="text-lg font-bold text-[var(--brand-experiment)]">
                      {floor.name}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">
                      ({floorUnits.length} 戶)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {floorUnits.map((unit) => {
                      const config = getFeeConfig(unit.id);
                      const totalFee = calculateTotalFee(unit, config);
                      const isCustomPrice = config.isSpecial;

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
                                坪數: {(unit as any).size || (unit as any).area || 30} 坪
                              </p>
                            </div>
                            {isCustomPrice && (
                              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded">
                                特殊費率
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={config.isSpecial}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleSetSpecialPrice(unit.id, config.pricePerPing);
                                  } else {
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
                              </p>
                            )}
                          </div>

                          <div className="border-t border-[var(--color-border)] pt-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-[var(--text-muted)]">每月應繳:</span>
                              <span className="font-bold text-[var(--brand-experiment)] text-lg">
                                ${totalFee.toLocaleString()}
                              </span>
                            </div>
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
        </>
      )}

      {/* 期數設定分頁 */}
      {activeTab === 'period' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>繳費期數設定</CardTitle>
              <Button variant="primary" size="small" onClick={() => setIsAddingPeriod(true)}>
                + 新增期數
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 期數列表 */}
            {periods.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">
                <p>尚無繳費期數設定</p>
                <p className="text-sm mt-2">點擊「+ 新增期數」按鈕建立第一期</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...periods]
                  .sort((a, b) => b.period.localeCompare(a.period))
                  .map((period) => (
                    <div
                      key={period.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        period.isActive
                          ? 'border-[var(--color-border)] bg-[var(--bg-secondary)]'
                          : 'border-gray-600 bg-gray-800/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          period.isActive ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                        <div>
                          <h4 className="font-bold text-[var(--text-normal)]">{period.name}</h4>
                          <p className="text-sm text-[var(--text-muted)]">
                            期數：{period.period} | 截止日：{new Date(period.dueDate).toLocaleDateString('zh-TW')}
                          </p>
                          {period.note && (
                            <p className="text-xs text-[var(--text-muted)] mt-1">{period.note}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => setEditingPeriod(period)}
                        >
                          編輯
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleDeletePeriod(period.id)}
                        >
                          刪除
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 新增期數對話框 */}
      {isAddingPeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-11/12 max-w-md shadow-2xl border border-[var(--color-border)]">
            <h3 className="text-xl font-bold text-[var(--text-normal)] mb-4">新增繳費期數</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  期數編號（YYYY-MM）
                </label>
                <input
                  type="month"
                  value={newPeriodData.period}
                  min="2020-01"
                  onChange={(e) => {
                    const period = e.target.value;
                    setNewPeriodData({
                      ...newPeriodData,
                      period,
                      name: period ? `${period.slice(0, 4)}年${parseInt(period.slice(5))}月管理費` : '',
                    });
                  }}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  顯示名稱
                </label>
                <input
                  type="text"
                  value={newPeriodData.name}
                  onChange={(e) => setNewPeriodData({ ...newPeriodData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  繳費截止日期
                </label>
                <input
                  type="date"
                  value={newPeriodData.dueDate}
                  min="2020-01-01"
                  onChange={(e) => setNewPeriodData({ ...newPeriodData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  備註
                </label>
                <input
                  type="text"
                  value={newPeriodData.note}
                  onChange={(e) => setNewPeriodData({ ...newPeriodData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                  placeholder="選填"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={handleAddPeriod} className="flex-1">
                確認新增
              </Button>
              <Button variant="secondary" onClick={() => setIsAddingPeriod(false)} className="flex-1">
                取消
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 編輯期數對話框 */}
      {editingPeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-11/12 max-w-md shadow-2xl border border-[var(--color-border)]">
            <h3 className="text-xl font-bold text-[var(--text-normal)] mb-4">編輯繳費期數</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  顯示名稱
                </label>
                <input
                  type="text"
                  value={editingPeriod.name}
                  onChange={(e) => setEditingPeriod({ ...editingPeriod, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  繳費截止日期
                </label>
                <input
                  type="date"
                  value={new Date(editingPeriod.dueDate).toISOString().slice(0, 10)}
                  min="2020-01-01"
                  onChange={(e) => setEditingPeriod({ ...editingPeriod, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingPeriod.isActive}
                  onChange={(e) => setEditingPeriod({ ...editingPeriod, isActive: e.target.checked })}
                  className="rounded border-[var(--color-border)]"
                />
                <span className="text-sm text-[var(--text-muted)]">啟用此期數</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  備註
                </label>
                <input
                  type="text"
                  value={editingPeriod.note || ''}
                  onChange={(e) => setEditingPeriod({ ...editingPeriod, note: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={handleUpdatePeriod} className="flex-1">
                儲存變更
              </Button>
              <Button variant="secondary" onClick={() => setEditingPeriod(null)} className="flex-1">
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeSettings;
