import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FeeUnit } from '../../types/domain';
import { feeActions } from '../../store/modules/fee';
import type { UnitFeeDetail, SpecialFeeConfig, FeeBaseConfig, PaymentRecord } from '../../types/fee';
import '../../assets/styles/fee.css';

// ==================== 管理費系統頁面（含繳款記錄、搜尋、分頁）====================

const FeeSystem: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // 從 Redux Store 取得資料
  const buildings = useAppSelector((state) => state.building.buildings);
  const units = useAppSelector((state) => state.building.units);
  const floors = useAppSelector((state) => state.building.floors);
  const feeState = useAppSelector((state) => state.fee);
  const { defaultPricePerPing, baseConfigs, specialConfigs, unitFeeDetails, units: feeUnits } = feeState;
  
  // 本地狀態
  const [activeTab, setActiveTab] = useState<'overview' | 'records'>('overview');
  const [activeBuildingId, setActiveBuildingId] = useState<string>('all');
  
  // 搜尋狀態
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBuildingId, setSearchBuildingId] = useState<string>('all');
  const [searchPeriod, setSearchPeriod] = useState('');
  
  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // 繳款記錄狀態
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [selectedUnitForPayment, setSelectedUnitForPayment] = useState<string | null>(null);
  const [newPaymentData, setNewPaymentData] = useState({
    amount: 0,
    paymentMethod: 'cash' as const,
    paymentPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM
    note: '',
  });

  // 初始化管理費資料
  useEffect(() => {
    if (units.length > 0) {
      initializeFeeData();
    }
  }, [units.length]);

  // 當設定變更時重新計算
  useEffect(() => {
    if (units.length > 0 && unitFeeDetails.length > 0) {
      recalculateFees();
    }
  }, [defaultPricePerPing, baseConfigs, specialConfigs]);

  // 初始化管理費資料
  const initializeFeeData = () => {
    const details: UnitFeeDetail[] = units.map((unit) => {
      const config = getUnitConfig(unit.id);
      const area = (unit as any).size || (unit as any).area || 30;
      const pricePerPing = config.pricePerPing;
      
      return {
        unitId: unit.id,
        buildingId: unit.buildingId || '',
        unitNumber: (unit as any).unitNumber || '',
        displayName: (unit as any).displayName || (unit as any).unitNumber || '',
        size: area,
        pricePerPing: pricePerPing,
        monthlyFee: area * pricePerPing,
        remark: '',
        source: (config.isSpecial ? 'special' : 'default') as 'default' | 'special' | 'manual',
        specialConfigId: config.specialConfigId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    dispatch(feeActions.setUnitFeeDetails(details));
  };

  // 重新計算管理費
  const recalculateFees = () => {
    const updatedDetails = unitFeeDetails.map((detail) => {
      const config = getUnitConfig(detail.unitId);
      const area = detail.size;
      const pricePerPing = config.pricePerPing;
      
      return {
        ...detail,
        pricePerPing,
        monthlyFee: area * pricePerPing,
        source: (config.isSpecial ? 'special' : 'default') as 'default' | 'special' | 'manual',
        specialConfigId: config.specialConfigId,
        updatedAt: new Date().toISOString(),
      };
    });

    dispatch(feeActions.setUnitFeeDetails(updatedDetails));
  };

  // 取得該戶的配置
  const getUnitConfig = (unitId: string): { pricePerPing: number; isSpecial: boolean; specialConfigId?: string } => {
    const unit = units.find((u) => u.id === unitId);
    if (!unit) return { pricePerPing: defaultPricePerPing, isSpecial: false };

    const specialConfig = specialConfigs.find(
      (c: SpecialFeeConfig) => c.unitIds.includes(unitId) && c.buildingId === unit.buildingId
    );
    
    if (specialConfig) {
      return {
        pricePerPing: specialConfig.customPrice || defaultPricePerPing,
        isSpecial: true,
        specialConfigId: specialConfig.id,
      };
    }

    const baseConfig = baseConfigs.find(
      (c: FeeBaseConfig) => c.buildingId === unit.buildingId && c.isActive
    );

    return {
      pricePerPing: baseConfig?.pricePerPing || defaultPricePerPing,
      isSpecial: false,
    };
  };

  // 添加繳款記錄
  const handleAddPayment = () => {
    if (!selectedUnitForPayment) return;
    
    const unit = units.find((u) => u.id === selectedUnitForPayment);
    if (!unit) return;

    const detail = unitFeeDetails.find((d) => d.unitId === selectedUnitForPayment);
    if (!detail) return;

    const newRecord: PaymentRecord = {
      id: `PAY_${Date.now()}`,
      unitId: selectedUnitForPayment,
      unitNumber: detail.unitNumber,
      buildingId: unit.buildingId || '',
      amount: newPaymentData.amount || detail.monthlyFee,
      paymentDate: new Date().toISOString(),
      paymentMethod: newPaymentData.paymentMethod,
      paymentPeriod: newPaymentData.paymentPeriod,
      note: newPaymentData.note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPaymentRecords([newRecord, ...paymentRecords]);
    
    // 同時更新 FeeUnit 的繳款狀態
    const feeUnit: FeeUnit = {
      id: `F_${selectedUnitForPayment}`,
      unitId: selectedUnitForPayment,
      unit: unit as any,
      area: detail.size,
      pricePerPing: detail.pricePerPing,
      totalFee: detail.monthlyFee,
      baseFee: detail.monthlyFee,
      additionalItems: [],
      additionalTotal: 0,
      notes: detail.remark,
      paymentStatus: 'paid',
      paymentDate: new Date().toISOString(),
      lastPaymentDate: new Date().toISOString(),
      isSpecial: detail.source === 'special',
      createdAt: detail.createdAt,
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = feeUnits.findIndex((u) => u.unitId === selectedUnitForPayment);
    if (existingIndex >= 0) {
      dispatch(feeActions.updateFeeUnit({ id: feeUnits[existingIndex].id, updates: feeUnit }));
    } else {
      dispatch(feeActions.addFeeUnit(feeUnit));
    }

    setIsAddingPayment(false);
    setSelectedUnitForPayment(null);
    setNewPaymentData({
      amount: 0,
      paymentMethod: 'cash',
      paymentPeriod: new Date().toISOString().slice(0, 7),
      note: '',
    });
  };

  // 搜尋和過濾繳款記錄
  const filteredRecords = useMemo(() => {
    let records = [...paymentRecords];

    // 依棟別過濾
    if (searchBuildingId !== 'all') {
      records = records.filter((r) => r.buildingId === searchBuildingId);
    }

    // 依週期過濾
    if (searchPeriod) {
      records = records.filter((r) => r.paymentPeriod === searchPeriod);
    }

    // 依搜尋字串過濾（戶別編號）
    if (searchQuery) {
      records = records.filter((r) => 
        r.unitNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 依繳款時間排序（最新的在前）
    return records.sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }, [paymentRecords, searchBuildingId, searchPeriod, searchQuery]);

  // 分頁計算
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRecords, currentPage]);

  // 統計資料
  const stats = {
    totalUnits: units.length,
    paidUnits: feeUnits.filter((u) => u.paymentStatus === 'paid').length,
    unpaidUnits: units.length - feeUnits.filter((u) => u.paymentStatus === 'paid').length,
    totalAmount: unitFeeDetails.reduce((sum, d) => sum + d.monthlyFee, 0),
    totalPaid: paymentRecords.reduce((sum, r) => sum + r.amount, 0),
    recordCount: paymentRecords.length,
  };

  return (
    <div className="fee-system p-6">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-normal)] mb-2">管理費系統</h2>
        <p className="text-[var(--text-muted)]">
          管理住戶管理費繳納狀況與繳款記錄
        </p>
      </div>

      {/* 頁籤切換 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-[var(--brand-experiment)] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          戶別總覽
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'records'
              ? 'bg-[var(--brand-experiment)] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          繳款記錄 ({stats.recordCount})
        </button>
      </div>

      {/* 統計資訊 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--color-border)]">
          <p className="text-sm text-[var(--text-muted)]">總戶數</p>
          <p className="text-2xl font-bold text-[var(--text-normal)]">{stats.totalUnits}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--color-border)]">
          <p className="text-sm text-[var(--text-muted)]">已繳款</p>
          <p className="text-2xl font-bold text-green-500">{stats.paidUnits}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--color-border)]">
          <p className="text-sm text-[var(--text-muted)]">未繳款</p>
          <p className="text-2xl font-bold text-red-500">{stats.unpaidUnits}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--color-border)]">
          <p className="text-sm text-[var(--text-muted)]">應收總額</p>
          <p className="text-2xl font-bold text-[var(--brand-experiment)]">
            NT$ {stats.totalAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--color-border)]">
          <p className="text-sm text-[var(--text-muted)]">已收金額</p>
          <p className="text-2xl font-bold text-green-500">
            NT$ {stats.totalPaid.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 戶別總覽頁籤 */}
      {activeTab === 'overview' && (
        <>
          {/* 棟別書籤分頁 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
              選擇棟別
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveBuildingId('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeBuildingId === 'all'
                    ? 'bg-[var(--brand-experiment)] text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                全部棟別
              </button>
              {buildings.map((building) => (
                <button
                  key={building.id}
                  onClick={() => setActiveBuildingId(building.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeBuildingId === building.id
                      ? 'bg-[var(--brand-experiment)] text-white'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {building.buildingCode}棟
                </button>
              ))}
            </div>
          </div>

          {/* 當前費率顯示 */}
          <div className="mb-6 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--color-border)]">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--text-muted)]">目前費率：</span>
              <span className="font-bold text-[var(--text-normal)]">
                {defaultPricePerPing} 元/坪
              </span>
              {baseConfigs.length > 0 && (
                <span className="text-xs text-[var(--brand-experiment)]">
                  ({baseConfigs.filter((c: { isActive: boolean }) => c.isActive).length} 個棟別已設定基礎費率)
                </span>
              )}
              {specialConfigs.length > 0 && (
                <span className="text-xs text-yellow-500">
                  ({specialConfigs.length} 個特殊費率設定)
                </span>
              )}
            </div>
          </div>

          {/* 樓層戶別列表 */}
          <div className="space-y-8">
            {(() => {
              // 依棟別過濾
              const filteredDetails = activeBuildingId === 'all'
                ? unitFeeDetails
                : unitFeeDetails.filter((d) => d.buildingId === activeBuildingId);

              // 依樓層分組
              const grouped: Record<string, UnitFeeDetail[]> = {};
              filteredDetails.forEach((detail) => {
                const unit = units.find((u) => u.id === detail.unitId);
                const floorId = unit?.floorId || 'unknown';
                if (!grouped[floorId]) {
                  grouped[floorId] = [];
                }
                grouped[floorId].push(detail);
              });

              // 排序樓層（由高到低）
              const sortedGroups = Object.entries(grouped).sort((a, b) => {
                const floorA = floors.find((f) => f.id === a[0]);
                const floorB = floors.find((f) => f.id === b[0]);
                const numA = parseInt(floorA?.floorNumber || '0');
                const numB = parseInt(floorB?.floorNumber || '0');
                return numB - numA;
              });

              return sortedGroups.map(([floorId, details]) => {
                const floor = floors.find((f) => f.id === floorId);
                return (
                  <div key={floorId} className="space-y-4">
                    {/* 樓層標題 */}
                    <div className="flex items-center gap-2 py-2 border-b-2 border-[var(--brand-experiment)]">
                      <h3 className="text-xl font-bold text-[var(--brand-experiment)]">
                        {floor?.name || '未知樓層'}
                      </h3>
                      <span className="text-sm text-[var(--text-muted)]">
                        ({details.length} 戶)
                      </span>
                    </div>

                    {/* 戶別卡片網格 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {details.map((detail) => {
                        const feeUnit = feeUnits.find((u) => u.unitId === detail.unitId);
                        const isPaid = feeUnit?.paymentStatus === 'paid';
                        const isSpecial = detail.source === 'special';

                        return (
                          <div
                            key={detail.unitId}
                            className={`border rounded-lg p-4 transition-all ${
                              isPaid
                                ? 'border-green-500/50 bg-green-500/5'
                                : 'border-[var(--color-border)] bg-[var(--bg-secondary)]'
                            }`}
                          >
                            {/* 戶別資訊 */}
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-lg text-[var(--text-normal)]">
                                  {detail.unitNumber}
                                </h4>
                                <p className="text-xs text-[var(--text-muted)]">
                                  {detail.size} 坪 × {detail.pricePerPing} 元/坪
                                  {isSpecial && (
                                    <span className="text-yellow-500 ml-1">(特殊)</span>
                                  )}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                isPaid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                              }`}>
                                {isPaid ? '已繳款' : '未繳款'}
                              </span>
                            </div>

                            {/* 金額資訊 */}
                            <div className="mb-3">
                              <p className="text-sm text-[var(--text-muted)]">應繳金額</p>
                              <p className="text-2xl font-bold text-[var(--brand-experiment)]">
                                NT$ {detail.monthlyFee.toLocaleString()}
                              </p>
                            </div>

                            {/* 繳款時間 */}
                            {feeUnit?.paymentDate && (
                              <div className="mb-3 text-sm">
                                <span className="text-[var(--text-muted)]">繳款時間：</span>
                                <span className="text-green-500">
                                  {new Date(feeUnit.paymentDate).toLocaleDateString('zh-TW')}
                                </span>
                              </div>
                            )}

                            {/* 備註 */}
                            <div className="mb-3 text-sm text-[var(--text-muted)]">
                              {detail.remark || '無備註'}
                            </div>

                            {/* 操作按鈕 */}
                            <div className="flex gap-2">
                              {!isPaid ? (
                                <Button
                                  variant="success"
                                  size="small"
                                  className="flex-1"
                                  onClick={() => {
                                    // 快速繳款：使用預設資料新增繳款記錄
                                    const newRecord: PaymentRecord = {
                                      id: `PAY_${Date.now()}`,
                                      unitId: detail.unitId,
                                      unitNumber: detail.unitNumber,
                                      buildingId: detail.buildingId,
                                      amount: detail.monthlyFee,
                                      paymentDate: new Date().toISOString(),
                                      paymentMethod: 'cash',
                                      paymentPeriod: new Date().toISOString().slice(0, 7),
                                      note: '快速繳款',
                                      createdAt: new Date().toISOString(),
                                      updatedAt: new Date().toISOString(),
                                    };
                                    setPaymentRecords([newRecord, ...paymentRecords]);
                                    
                                    // 更新 FeeUnit 狀態
                                    const unit = units.find((u) => u.id === detail.unitId);
                                    const updatedFeeUnit: FeeUnit = {
                                      id: `F_${detail.unitId}`,
                                      unitId: detail.unitId,
                                      unit: unit as any,
                                      area: detail.size,
                                      pricePerPing: detail.pricePerPing,
                                      totalFee: detail.monthlyFee,
                                      baseFee: detail.monthlyFee,
                                      additionalItems: [],
                                      additionalTotal: 0,
                                      notes: detail.remark,
                                      paymentStatus: 'paid',
                                      paymentDate: new Date().toISOString(),
                                      lastPaymentDate: new Date().toISOString(),
                                      isSpecial: detail.source === 'special',
                                      createdAt: detail.createdAt,
                                      updatedAt: new Date().toISOString(),
                                    };
                                    
                                    const existingIndex = feeUnits.findIndex((u) => u.unitId === detail.unitId);
                                    if (existingIndex >= 0) {
                                      dispatch(feeActions.updateFeeUnit({ id: feeUnits[existingIndex].id, updates: updatedFeeUnit }));
                                    } else {
                                      dispatch(feeActions.addFeeUnit(updatedFeeUnit));
                                    }
                                  }}
                                >
                                  標記已繳款
                                </Button>
                              ) : (
                                <Button
                                  variant="secondary"
                                  size="small"
                                  className="flex-1"
                                  onClick={() => {
                                    // 取消繳款
                                    const unit = units.find((u) => u.id === detail.unitId);
                                    const updatedFeeUnit: FeeUnit = {
                                      id: `F_${detail.unitId}`,
                                      unitId: detail.unitId,
                                      unit: unit as any,
                                      area: detail.size,
                                      pricePerPing: detail.pricePerPing,
                                      totalFee: detail.monthlyFee,
                                      baseFee: detail.monthlyFee,
                                      additionalItems: [],
                                      additionalTotal: 0,
                                      notes: detail.remark,
                                      paymentStatus: 'unpaid',
                                      isSpecial: detail.source === 'special',
                                      createdAt: detail.createdAt,
                                      updatedAt: new Date().toISOString(),
                                    };
                                    
                                    const existingIndex = feeUnits.findIndex((u) => u.unitId === detail.unitId);
                                    if (existingIndex >= 0) {
                                      dispatch(feeActions.updateFeeUnit({ id: feeUnits[existingIndex].id, updates: updatedFeeUnit }));
                                    }
                                  }}
                                >
                                  取消繳款
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}

            {unitFeeDetails.length === 0 && (
              <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-lg border border-dashed border-[var(--color-border)]">
                <svg className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
                <p className="text-[var(--text-muted)]">尚無管理費資料</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  請先在後台「管理費設定」中設定費率
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* 繳款記錄頁籤 */}
      {activeTab === 'records' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>繳款記錄列表</CardTitle>
              <Button 
                variant="primary" 
                size="small"
                onClick={() => setIsAddingPayment(true)}
              >
                + 新增繳款記錄
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 搜尋和過濾區域 */}
            <div className="flex flex-wrap gap-3 mb-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
              {/* 搜尋輸入 */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="搜尋戶別編號..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                />
              </div>
              
              {/* 棟別選擇 */}
              <select
                value={searchBuildingId}
                onChange={(e) => setSearchBuildingId(e.target.value)}
                className="px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
              >
                <option value="all">全部棟別</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.buildingCode}棟</option>
                ))}
              </select>

              {/* 週期選擇 */}
              <input
                type="month"
                value={searchPeriod}
                onChange={(e) => setSearchPeriod(e.target.value)}
                className="px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
              />

              {/* 清除搜尋 */}
              <Button 
                variant="secondary" 
                size="small"
                onClick={() => {
                  setSearchQuery('');
                  setSearchBuildingId('all');
                  setSearchPeriod('');
                  setCurrentPage(1);
                }}
              >
                清除
              </Button>
            </div>

            {/* 繳款記錄表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">序號</th>
                    <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">戶別</th>
                    <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">繳款週期</th>
                    <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">金額</th>
                    <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">繳款方式</th>
                    <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">繳款時間</th>
                    <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">備註</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-[var(--text-muted)]">
                        尚無繳款記錄
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((record, index) => (
                      <tr 
                        key={record.id} 
                        className="border-b border-[var(--color-border)] hover:bg-[var(--bg-hover)]"
                      >
                        <td className="py-3 px-4 text-[var(--text-normal)]">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="py-3 px-4 font-medium text-[var(--text-normal)]">
                          {record.unitNumber}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-normal)]">
                          {record.paymentPeriod}
                        </td>
                        <td className="py-3 px-4 font-bold text-[var(--brand-experiment)]">
                          NT$ {record.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-normal)]">
                          {record.paymentMethod === 'cash' && '現金'}
                          {record.paymentMethod === 'transfer' && '轉帳'}
                          {record.paymentMethod === 'check' && '支票'}
                          {record.paymentMethod === 'credit_card' && '信用卡'}
                          {record.paymentMethod === 'other' && '其他'}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)] text-sm">
                          {new Date(record.paymentDate).toLocaleString('zh-TW')}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)] text-sm">
                          {record.note || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 分頁控制 */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--color-border)]">
                <span className="text-sm text-[var(--text-muted)]">
                  顯示 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredRecords.length)} 筆，
                  共 {filteredRecords.length} 筆
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    上一頁
                  </Button>
                  <span className="px-3 py-1 text-[var(--text-normal)]">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    下一頁
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 新增繳款記錄對話框 */}
      {isAddingPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-11/12 max-w-lg shadow-2xl border border-[var(--color-border)]">
            <h3 className="text-xl font-bold text-[var(--text-normal)] mb-4">
              新增繳款記錄
            </h3>
            
            <div className="space-y-4">
              {/* 選擇戶別 */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  選擇戶別
                </label>
                <select
                  value={selectedUnitForPayment || ''}
                  onChange={(e) => setSelectedUnitForPayment(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                >
                  <option value="">請選擇戶別</option>
                  {unitFeeDetails.map((detail) => (
                    <option key={detail.unitId} value={detail.unitId}>
                      {detail.unitNumber} - NT$ {detail.monthlyFee.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* 繳款金額 */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  繳款金額
                </label>
                <input
                  type="number"
                  value={newPaymentData.amount || (selectedUnitForPayment ? unitFeeDetails.find(d => d.unitId === selectedUnitForPayment)?.monthlyFee : '')}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, amount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                />
              </div>

              {/* 繳款週期 */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  繳款週期
                </label>
                <input
                  type="month"
                  value={newPaymentData.paymentPeriod}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, paymentPeriod: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                />
              </div>

              {/* 繳款方式 */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  繳款方式
                </label>
                <select
                  value={newPaymentData.paymentMethod}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                >
                  <option value="cash">現金</option>
                  <option value="transfer">轉帳</option>
                  <option value="check">支票</option>
                  <option value="credit_card">信用卡</option>
                  <option value="other">其他</option>
                </select>
              </div>

              {/* 備註 */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  備註
                </label>
                <input
                  type="text"
                  value={newPaymentData.note}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                  placeholder="選填"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                variant="primary" 
                onClick={handleAddPayment}
                disabled={!selectedUnitForPayment}
                className="flex-1"
              >
                確認繳款
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setIsAddingPayment(false);
                  setSelectedUnitForPayment(null);
                }}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeSystem;
