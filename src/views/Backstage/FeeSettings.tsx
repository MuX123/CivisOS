import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { BuildingConfig, UnitConfig } from '../../types/domain';
import { feeActions } from '../../store/modules/fee';
import type { SpecialFeeConfig, FeeBaseConfig, PaymentPeriod, FeeAdditionalItem } from '../../types/fee';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import IntroductionButton from '../../components/ui/IntroductionButton';
import { useStore } from 'react-redux';
import { FeeStressTest } from './fee/FeeStressTest';

// ==================== 後台管理費設定頁面（含期數設定）====================

const FeeSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const store = useStore();
  const buildings = useAppSelector((state) => state.building.buildings);
  const units = useAppSelector((state) => state.building.units);
  const floors = useAppSelector((state) => state.building.floors);
  
  // 從 fee store 取得設定
  const feeState = useAppSelector((state) => state.fee);
  const { defaultPricePerPing, baseConfigs, specialConfigs, periods, customFeeItems, unitFeeDetails } = feeState;
  
  // 分頁狀態
  const [activeTab, setActiveTab] = useState<'fee' | 'period' | 'custom'>('fee');
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

  // 自訂費用項目狀態
  const [isAddingCustomItem, setIsAddingCustomItem] = useState(false);
  const [editingCustomItem, setEditingCustomItem] = useState<FeeAdditionalItem | null>(null);
  const [newCustomItem, setNewCustomItem] = useState<Omit<FeeAdditionalItem, 'id'>>({
    name: '',
    amount: 0,
    isFixed: true,
    note: '',
  });

  // 戶別編輯對話框狀態
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [unitAdditionalItems, setUnitAdditionalItems] = useState<FeeAdditionalItem[]>([]);

  // 期數費用編輯對話框狀態
  const [editingPeriodFee, setEditingPeriodFee] = useState<PaymentPeriod | null>(null);
  const [periodEditBuildingTab, setPeriodEditBuildingTab] = useState<string>('all');
  const [periodUnitFees, setPeriodUnitFees] = useState<Record<string, { baseFee: number; additionalItems: FeeAdditionalItem[]; additionalTotal: number }>>({});
  
  // 測試狀態
  const [isTesting, setIsTesting] = useState(false);

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

    // 計算當前的費用快照（用於此期數）
    const sampleUnit = units[0];
    const sampleArea = (sampleUnit as any).size || (sampleUnit as any).area || 30;
    const baseFee = sampleArea * defaultPricePerPing;

    dispatch(
      feeActions.addPeriod({
        period: newPeriodData.period,
        name: newPeriodData.name,
        dueDate: newPeriodData.dueDate,
        isActive: true,
        note: newPeriodData.note,
        // 費用快照
        basePricePerPing: defaultPricePerPing,
        defaultSize: 30,
        baseFee: baseFee,
        additionalItems: [],
        additionalTotal: 0,
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

  // ========== 自訂費用項目管理 ==========
  const handleAddCustomItem = () => {
    if (!newCustomItem.name || newCustomItem.amount <= 0) {
      alert('請輸入名稱和金額');
      return;
    }
    dispatch(feeActions.addCustomFeeItem(newCustomItem));
    setIsAddingCustomItem(false);
    setNewCustomItem({ name: '', amount: 0, isFixed: true, note: '' });
  };

  const handleUpdateCustomItem = () => {
    if (!editingCustomItem) return;
    dispatch(feeActions.updateCustomFeeItem(editingCustomItem));
    setEditingCustomItem(null);
  };

  const handleDeleteCustomItem = (itemId: string) => {
    if (!confirm('確定要刪除此費用項目嗎？')) return;
    dispatch(feeActions.deleteCustomFeeItem(itemId));
  };

  // ========== 戶別額外費用編輯 ==========
  const handleOpenUnitEditor = (unitId: string) => {
    const config = specialConfigs.find(
      (c) => c.unitIds.includes(unitId) && c.buildingId === selectedBuildingId
    );
    setUnitAdditionalItems(config?.additionalItems || []);
    setEditingUnitId(unitId);
  };

  const handleSaveUnitAdditionalItems = () => {
    if (!editingUnitId || !selectedBuildingId) return;

    const config = specialConfigs.find(
      (c) => c.unitIds.includes(editingUnitId) && c.buildingId === selectedBuildingId
    );

    if (config) {
      dispatch(
        feeActions.updateSpecialConfig({
          ...config,
          additionalItems: unitAdditionalItems,
          updatedAt: new Date().toISOString(),
        })
      );
    } else {
      const unit = units.find((u) => u.id === editingUnitId);
      dispatch(
        feeActions.addSpecialConfig({
          buildingId: selectedBuildingId,
          name: `${unit?.unitNumber || editingUnitId} 特殊設定`,
          type: 'custom',
          unitIds: [editingUnitId],
          customPrice: defaultPricePerPing,
          additionalItems: unitAdditionalItems,
          description: '',
        })
      );
    }

    setEditingUnitId(null);
    setUnitAdditionalItems([]);
  };

  const handleAddUnitItem = () => {
    const newItem: FeeAdditionalItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '新費用項目',
      amount: 0,
      isFixed: true,
      note: '',
    };
    setUnitAdditionalItems([...unitAdditionalItems, newItem]);
  };

  const handleUpdateUnitItem = (itemId: string, updates: Partial<FeeAdditionalItem>) => {
    setUnitAdditionalItems(
      unitAdditionalItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  };

  const handleRemoveUnitItem = (itemId: string) => {
    setUnitAdditionalItems(unitAdditionalItems.filter((item) => item.id !== itemId));
  };

  const handleApplyCustomItemToUnit = (item: FeeAdditionalItem) => {
    // 檢查是否已存在相同名稱的項目
    const exists = unitAdditionalItems.find((i) => i.name === item.name);
    if (exists) {
      alert(`已存在相同名稱的費用項目：${item.name}`);
      return;
    }
    setUnitAdditionalItems([
      ...unitAdditionalItems,
      { ...item, id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
    ]);
  };

  // 計算該戶的總費用（包含額外費用）
  const calculateTotalFee = (unit: UnitConfig, config: { pricePerPing: number; additionalItems?: FeeAdditionalItem[] }): number => {
    const area = (unit as any).size || (unit as any).area || 30;
    const baseFee = area * config.pricePerPing;
    const additionalTotal = (config.additionalItems || []).reduce((sum, item) => sum + item.amount, 0);
    return baseFee + additionalTotal;
  };

  const runStressTest = async () => {
    if (isTesting) return;
    if (!confirm('即將執行管理費系統壓力測試，這將會：\n1. 隨機修改費率設定\n2. 產生大量繳費期數\n3. 模擬大量繳款操作\n\n確定要繼續嗎？')) return;

    setIsTesting(true);
    try {
      const stressTest = new FeeStressTest(dispatch, store.getState, buildings, units);
      const results = await stressTest.runTest();
      
      console.log('=== 管理費系統壓力測試結果 ===');
      results.forEach(r => console.log(r));
      
      const successCount = results.filter(r => !r.includes('❌') && !r.includes('⚠️')).length;
      alert(`壓力測試完成！\n\n詳細結果請查看 Console。\n總計步驟: ${results.length}\n無錯誤步驟: ${successCount}`);
    } catch (error) {
      console.error('壓力測試發生錯誤:', error);
      alert('壓力測試發生未預期的錯誤');
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearAllData = () => {
    if (confirm('⚠️ 危險操作警告 ⚠️\n\n您確定要清除管理費系統內的「所有資料」嗎？\n這將會刪除：\n1. 所有費率設定\n2. 所有特殊收費規則\n3. 所有繳費期數與繳款記錄\n4. 自訂費用項目\n\n此操作無法復原！')) {
      if (confirm('請再次確認：真的要清除所有資料嗎？')) {
        dispatch((feeActions as any).clearAllData());
        alert('已清除所有管理費設定與資料。');
      }
    }
  };

  const floorData = getBuildingUnitsByFloor();

  return (
    <div className="fee-settings p-6 max-w-7xl mx-auto">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
        <h2 className="text-3xl font-bold text-white">管理費設定</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="danger" 
            size="small" 
            onClick={runStressTest}
            disabled={isTesting}
            className="mr-2"
          >
            {isTesting ? '⏳ 測試中...' : '🔥 執行壓力測試'}
          </Button>
          <Button 
            variant="danger" 
            size="small" 
            onClick={handleClearAllData}
            disabled={isTesting}
            className="mr-2"
          >
            🗑️ 清除所有資料
          </Button>
          <IntroductionButton pageId="fee-settings" />
        </div>
      </div>

      {/* 分頁標籤 */}
      <div className="flex gap-2 mb-6">
          <button
          onClick={() => setActiveTab('fee')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'fee'
              ? 'bg-[#5865F2] text-white'
              : 'bg-[var(--bg-secondary)] text-white hover:bg-[var(--bg-hover)]'
          }`}
        >
          費率設定
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'custom'
              ? 'bg-[#5865F2] text-white'
              : 'bg-[var(--bg-secondary)] text-white hover:bg-[var(--bg-hover)]'
          }`}
        >
          自訂項目 ({customFeeItems.length})
        </button>
        <button
          onClick={() => setActiveTab('period')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'period'
              ? 'bg-[#5865F2] text-white'
              : 'bg-[var(--bg-secondary)] text-white hover:bg-[var(--bg-hover)]'
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
                  <label className="text-sm font-medium text-white/70">
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
                      ? 'border-[#5865F2] bg-[#5865F2] bg-opacity-10 text-[#5865F2]'
                      : 'border-[var(--color-border)] bg-[var(--bg-secondary)] text-white hover:border-white hover:text-white'
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
                  <div className="flex items-center gap-2 py-2 border-b border-[#5865F2]">
                    <span className="text-lg font-bold text-white">
                      {floor.name}
                    </span>
                    <span className="text-sm text-white/70">
                      ({floorUnits.length} 戶)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {floorUnits.map((unit) => {
                      const config = getFeeConfig(unit.id);
                      const totalFee = calculateTotalFee(unit, config);
                      const isCustomPrice = config.isSpecial;

                      return (
                        <div
                          key={unit.id}
                          className="border border-[var(--color-border)] rounded-lg p-3 bg-[var(--bg-secondary)] flex flex-col justify-between"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-white">
                                {unit.unitNumber}
                              </h4>
                              <p className="text-xs text-white/70">
                                {(unit as any).size || (unit as any).area || 30} 坪
                              </p>
                            </div>
                            {isCustomPrice && (
                              <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded">
                                特殊
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 mb-2">
                            <div className="flex items-center gap-1">
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
                                className="rounded border-[var(--color-border)] w-3 h-3"
                              />
                              <span className="text-xs text-white/70">自定義</span>
                            </div>
                            
                            {config.isSpecial ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={config.pricePerPing}
                                  onChange={(e) => handleSetSpecialPrice(unit.id, parseInt(e.target.value) || 0)}
                                  className="w-16 px-1 py-0.5 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-white text-xs"
                                />
                                <span className="text-xs text-white/70">元/坪</span>
                              </div>
                            ) : (
                              <p className="text-xs text-white/70">
                                {config.pricePerPing} 元/坪
                              </p>
                            )}
                          </div>

                          <div className="border-t border-[var(--color-border)] pt-2 mt-auto">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-white/70">每月:</span>
                              <span className="font-bold text-[#57F287] text-base">
                                ${totalFee.toLocaleString()}
                              </span>
                            </div>
                            {/* 額外費用摘要 */}
                            {(config.additionalItems?.length || 0) > 0 && (
                              <div className="text-xs text-white/50 mb-1">
                                +{(config.additionalItems || []).length} 項
                              </div>
                            )}
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => handleOpenUnitEditor(unit.id)}
                              className="w-full text-xs py-1"
                            >
                              編輯
                            </Button>
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

      {/* 自訂費用項目分頁 */}
      {activeTab === 'custom' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>自訂費用項目</CardTitle>
              <Button variant="primary" size="small" onClick={() => setIsAddingCustomItem(true)}>
                + 新增項目
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              這些是全域的自訂費用項目，可以套用到各戶別。輸入名稱和金額後，可在個別戶別的「編輯費用項目」中選擇套用。
            </p>

            {customFeeItems.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">
                <p>尚無自訂費用項目</p>
                <p className="text-sm mt-2">點擊「+ 新增項目」按鈕建立費用項目</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customFeeItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg bg-[var(--bg-secondary)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-[#5865F2]" />
                      <div>
                        <h4 className="font-bold text-[var(--text-normal)]">{item.name}</h4>
                         <p className="text-sm">
                          <span className="text-white/70">金額：</span><span className="text-[#57F287]">${item.amount.toLocaleString()}</span> <span className="text-white/70">{item.isFixed ? '(固定)' : '(按坪數)'}</span>
                          {item.note && <span className="text-white/70"> | 備註：${item.note}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => setEditingCustomItem(item)}
                      >
                        編輯
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleDeleteCustomItem(item.id)}
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
                           {/* 顯示期數金額 */}
                          <p className="text-xs mt-1">
                            <span className="text-white/70">金額：</span><span className="text-[#57F287]">${((period.baseFee !== undefined ? period.baseFee : defaultPricePerPing * (period.defaultSize || 30)) + (period.additionalTotal || 0)).toLocaleString()}</span>
                            {period.unitFeeConfigs && period.unitFeeConfigs.length > 0 && (
                              <span className="text-[var(--text-muted)] ml-2">
                                ({period.unitFeeConfigs.length} 戶自定義)
                              </span>
                            )}
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
                          onClick={() => {
                            setEditingPeriodFee(period);
                            setPeriodEditBuildingTab('all');
                            setPeriodUnitFees({});
                          }}
                        >
                          編輯費用
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
                <label className="block text-sm font-medium text-white/70 mb-1">
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
                <label className="block text-sm font-medium text-white/70 mb-1">
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
                <label className="block text-sm font-medium text-white/70 mb-1">
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
                <label className="block text-sm font-medium text-white/70 mb-1">
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
                <label className="block text-sm font-medium text-white/70 mb-1">
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
                <label className="block text-sm font-medium text-white/70 mb-1">
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
                <label className="block text-sm font-medium text-white/70 mb-1">
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

      {/* ===================== 新增/編輯自訂費用項目對話框 ===================== */}
      {/* 新增自訂項目對話框 */}
      {isAddingCustomItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-11/12 max-w-md shadow-2xl border border-[var(--color-border)]">
            <h3 className="text-xl font-bold text-[var(--text-normal)] mb-4">新增費用項目</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  項目名稱
                </label>
                <input
                  type="text"
                  value={newCustomItem.name}
                  onChange={(e) => setNewCustomItem({ ...newCustomItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                  placeholder="例如：垃圾處理費"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  金額（元）
                </label>
                <input
                  type="number"
                  value={newCustomItem.amount}
                  onChange={(e) => setNewCustomItem({ ...newCustomItem, amount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newCustomItem.isFixed}
                  onChange={(e) => setNewCustomItem({ ...newCustomItem, isFixed: e.target.checked })}
                  className="rounded border-[var(--color-border)]"
                />
                <span className="text-sm text-[var(--text-muted)]">固定金額（不按坪數計算）</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  備註
                </label>
                <input
                  type="text"
                  value={newCustomItem.note}
                  onChange={(e) => setNewCustomItem({ ...newCustomItem, note: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                  placeholder="選填"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={handleAddCustomItem} className="flex-1">
                確認新增
              </Button>
              <Button variant="secondary" onClick={() => setIsAddingCustomItem(false)} className="flex-1">
                取消
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 編輯自訂項目對話框 */}
      {editingCustomItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-11/12 max-w-md shadow-2xl border border-[var(--color-border)]">
            <h3 className="text-xl font-bold text-[var(--text-normal)] mb-4">編輯費用項目</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  項目名稱
                </label>
                <input
                  type="text"
                  value={editingCustomItem.name}
                  onChange={(e) => setEditingCustomItem({ ...editingCustomItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  金額（元）
                </label>
                <input
                  type="number"
                  value={editingCustomItem.amount}
                  onChange={(e) => setEditingCustomItem({ ...editingCustomItem, amount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingCustomItem.isFixed}
                  onChange={(e) => setEditingCustomItem({ ...editingCustomItem, isFixed: e.target.checked })}
                  className="rounded border-[var(--color-border)]"
                />
                <span className="text-sm text-[var(--text-muted)]">固定金額（不按坪數計算）</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  備註
                </label>
                <input
                  type="text"
                  value={editingCustomItem.note || ''}
                  onChange={(e) => setEditingCustomItem({ ...editingCustomItem, note: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                  placeholder="選填"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={handleUpdateCustomItem} className="flex-1">
                儲存變更
              </Button>
              <Button variant="secondary" onClick={() => setEditingCustomItem(null)} className="flex-1">
                取消
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 戶別費用項目編輯對話框 ===================== */}
      {editingUnitId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-11/12 max-w-2xl shadow-2xl border border-[var(--color-border)] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[var(--text-normal)] mb-4">編輯費用項目</h3>
            
            {/* 從全域套用 */}
            {customFeeItems.length > 0 && (
              <div className="mb-4 p-3 bg-[var(--bg-secondary)] rounded-lg">
                <p className="text-sm text-[#FEE75C] mb-2">從自訂項目快速套用：</p>
                <div className="flex flex-wrap gap-2">
                  {customFeeItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleApplyCustomItemToUnit(item)}
                      className="px-3 py-1 text-xs bg-[#FEE75C] bg-opacity-20 text-[#FEE75C] rounded-full hover:bg-opacity-30 transition-colors"
                    >
                      + {item.name} (<span className="text-[#57F287]">${item.amount}</span>)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 費用項目列表 */}
            <div className="space-y-3">
              {unitAdditionalItems.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)] border border-dashed border-[var(--color-border)] rounded-lg">
                  <p>尚無費用項目</p>
                  <p className="text-sm mt-1">點擊下方「+ 新增費用項目」按鈕或從上方快速套用</p>
                </div>
              ) : (
                unitAdditionalItems.map((item, index) => (
                  <div key={item.id} className="p-3 border border-[var(--color-border)] rounded-lg bg-[var(--bg-secondary)]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-[var(--text-muted)]">#{index + 1}</span>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateUnitItem(item.id, { name: e.target.value })}
                        className="flex-1 px-2 py-1 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] text-sm"
                        placeholder="項目名稱"
                      />
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => handleUpdateUnitItem(item.id, { amount: parseInt(e.target.value) || 0 })}
                        className="w-24 px-2 py-1 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] text-sm"
                        placeholder="金額"
                      />
                      <button
                        onClick={() => handleRemoveUnitItem(item.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.isFixed}
                        onChange={(e) => handleUpdateUnitItem(item.id, { isFixed: e.target.checked })}
                        className="rounded border-[var(--color-border)]"
                      />
                      <span className="text-xs text-[var(--text-muted)]">固定金額</span>
                      <input
                        type="text"
                        value={item.note || ''}
                        onChange={(e) => handleUpdateUnitItem(item.id, { note: e.target.value })}
                        className="flex-1 px-2 py-1 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] text-xs"
                        placeholder="備註（選填）"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 總計 */}
            <div className="mt-4 p-3 bg-[var(--bg-secondary)] rounded-lg flex justify-between items-center">
              <span className="text-sm text-[#57F287]">額外費用總計：</span>
              <span className="font-bold text-[#57F287]">
                ${unitAdditionalItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </span>
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="secondary" onClick={handleAddUnitItem} className="flex-1">
                + 新增費用項目
              </Button>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--color-border)]">
              <Button variant="primary" onClick={handleSaveUnitAdditionalItems} className="flex-1">
                儲存變更
              </Button>
              <Button variant="secondary" onClick={() => setEditingUnitId(null)} className="flex-1">
                取消
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 期數費用編輯對話框 ==================== */}
      {editingPeriodFee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-11/12 max-w-4xl shadow-2xl border border-[var(--color-border)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--text-normal)]">
                編輯費用 - {editingPeriodFee.name}
              </h3>
              <button
                onClick={() => {
                  setEditingPeriodFee(null);
                  setPeriodUnitFees({});
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-normal)]"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 棟別分頁 */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setPeriodEditBuildingTab('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  periodEditBuildingTab === 'all'
                    ? 'bg-[#5865F2] text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                全部棟別
              </button>
              {buildings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setPeriodEditBuildingTab(b.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    periodEditBuildingTab === b.id
                      ? 'bg-[#5865F2] text-white'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {b.buildingCode}棟
                </button>
              ))}
            </div>

            {/* 戶別費用清單 */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {(() => {
                // 過濾棟別
                let filteredUnits = unitFeeDetails;
                if (periodEditBuildingTab !== 'all') {
                  filteredUnits = unitFeeDetails.filter((d) => d.buildingId === periodEditBuildingTab);
                }

                if (filteredUnits.length === 0) {
                  return (
                    <div className="text-center py-8 text-[var(--text-muted)]">
                      沒有找到戶別資料
                    </div>
                  );
                }

                return filteredUnits.map((detail) => {
                  // 取得該戶在期數中的費用設定
                  const unitFeeKey = detail.unitId;
                  const existingFee = periodUnitFees[unitFeeKey];
                  const periodConfig = editingPeriodFee.unitFeeConfigs?.find((c) => c.unitId === detail.unitId);

                  // 計算費用
                  const unit = units.find((u) => u.id === detail.unitId);
                  const area = (unit as any).size || (unit as any).area || 30;
                  const baseFee = area * (editingPeriodFee.basePricePerPing || defaultPricePerPing);
                  const additionalItems = existingFee?.additionalItems || periodConfig?.additionalItems || [];
                  const additionalTotal = existingFee?.additionalTotal ?? periodConfig?.additionalTotal ?? additionalItems.reduce((sum, item) => sum + item.amount, 0);
                  const totalFee = baseFee + additionalTotal;

                  return (
                    <div
                      key={detail.unitId}
                      className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--bg-secondary)]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-[var(--text-normal)]">{detail.unitNumber}</h4>
                          <p className="text-xs text-[var(--text-muted)]">
                            {detail.size} 坪 × {editingPeriodFee.basePricePerPing || defaultPricePerPing} 元/坪
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[#57F287]">應繳金額</p>
                          <p className="text-xl font-bold text-[#57F287]">
                            NT$ {totalFee.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* 費用明細 */}
                      <div className="mb-3 p-2 bg-[var(--bg-tertiary)] rounded text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/70">基本費用：</span>
                          <span className="text-[#57F287]">${baseFee.toLocaleString()}</span>
                        </div>
                        {additionalItems.length > 0 ? (
                          additionalItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between mt-1">
                              <span className="text-white/70">+ {item.name}：</span>
                              <span className="text-[#57F287]">${item.amount.toLocaleString()}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex justify-between mt-1">
                            <span className="text-white/70">額外費用：</span>
                            <span className="text-[#57F287]">$0</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold mt-2 pt-2 border-t border-[var(--color-border)]">
                          <span className="text-white">小計：</span>
                          <span className="text-[#57F287]">${additionalTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* 編輯額外費用按鈕 */}
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => {
                          const currentItems = existingFee?.additionalItems || periodConfig?.additionalItems || [];
                          setPeriodUnitFees({
                            ...periodUnitFees,
                            [unitFeeKey]: {
                              baseFee,
                              additionalItems: [...currentItems],
                              additionalTotal: currentItems.reduce((sum, item) => sum + item.amount, 0),
                            },
                          });
                        }}
                        className="w-full"
                      >
                        編輯額外費用
                      </Button>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--color-border)]">
              <Button
                variant="primary"
                onClick={() => {
                  // 儲存期數費用設定
                  const unitFeeConfigs = Object.entries(periodUnitFees).map(([unitId, fee]) => ({
                    unitId,
                    baseFee: fee.baseFee,
                    additionalItems: fee.additionalItems,
                    additionalTotal: fee.additionalTotal,
                    isCustomized: true,
                  }));

                  dispatch(
                    feeActions.updatePeriod({
                      ...editingPeriodFee,
                      unitFeeConfigs: [
                        ...(editingPeriodFee.unitFeeConfigs?.filter((c) => !periodUnitFees[c.unitId]) || []),
                        ...unitFeeConfigs,
                      ],
                      updatedAt: new Date().toISOString(),
                    })
                  );

                  setEditingPeriodFee(null);
                  setPeriodUnitFees({});
                }}
                className="flex-1"
              >
                儲存變更
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingPeriodFee(null);
                  setPeriodUnitFees({});
                }}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 額外費用編輯對話框 ==================== */}
      {(() => {
        // 找出正在編輯的戶別
        const editingUnitId = Object.keys(periodUnitFees)[0];
        if (!editingUnitId || !editingPeriodFee) return null;

        const fee = periodUnitFees[editingUnitId];
        const detail = unitFeeDetails.find((d) => d.unitId === editingUnitId);
        if (!detail) return null;

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm">
            <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-11/12 max-w-md shadow-2xl border border-[var(--color-border)]">
              <h3 className="text-xl font-bold text-[var(--text-normal)] mb-4">
                編輯額外費用 - {detail.unitNumber}
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {fee.additionalItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-[var(--bg-secondary)] rounded">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...fee.additionalItems];
                        newItems[idx] = { ...item, name: e.target.value };
                        setPeriodUnitFees({
                          ...periodUnitFees,
                          [editingUnitId]: {
                            ...fee,
                            additionalItems: newItems,
                            additionalTotal: newItems.reduce((sum, i) => sum + i.amount, 0),
                          },
                        });
                      }}
                      className="flex-1 px-2 py-1 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] text-sm"
                    />
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => {
                        const newItems = [...fee.additionalItems];
                        newItems[idx] = { ...item, amount: parseInt(e.target.value) || 0 };
                        setPeriodUnitFees({
                          ...periodUnitFees,
                          [editingUnitId]: {
                            ...fee,
                            additionalItems: newItems,
                            additionalTotal: newItems.reduce((sum, i) => sum + i.amount, 0),
                          },
                        });
                      }}
                      className="w-24 px-2 py-1 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] text-sm"
                    />
                    <button
                      onClick={() => {
                        const newItems = fee.additionalItems.filter((_, i) => i !== idx);
                        setPeriodUnitFees({
                          ...periodUnitFees,
                          [editingUnitId]: {
                            ...fee,
                            additionalItems: newItems,
                            additionalTotal: newItems.reduce((sum, i) => sum + i.amount, 0),
                          },
                        });
                      }}
                      className="text-red-500 hover:text-red-400"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  const newItems = [
                    ...fee.additionalItems,
                    { id: `item-${Date.now()}`, name: '新費用', amount: 0, isFixed: true, note: '' },
                  ];
                  setPeriodUnitFees({
                    ...periodUnitFees,
                    [editingUnitId]: {
                      ...fee,
                      additionalItems: newItems,
                      additionalTotal: newItems.reduce((sum, i) => sum + i.amount, 0),
                    },
                  });
                }}
                className="w-full mt-3"
              >
                + 新增額外費用
              </Button>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="primary"
                  onClick={() => {
                    // 清除編輯狀態，返回期數編輯對話框
                    setPeriodUnitFees({
                      ...periodUnitFees,
                      [editingUnitId]: {
                        ...fee,
                        additionalItems: fee.additionalItems.filter((i) => i.name && i.amount > 0),
                        additionalTotal: fee.additionalItems
                          .filter((i) => i.name && i.amount > 0)
                          .reduce((sum, i) => sum + i.amount, 0),
                      },
                    });
                  }}
                  className="flex-1"
                >
                  完成
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default FeeSettings;
