import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FeeUnit, FeeAdditionalItem as DomainAdditionalItem } from '../../types/domain';
import { feeActions } from '../../store/modules/fee';
import type { UnitFeeDetail, SpecialFeeConfig, FeeBaseConfig, PaymentRecord, PaymentPeriod, FeeAdditionalItem } from '../../types/fee';
import '../../assets/styles/fee.css';

// ==================== 管理費系統頁面（含繳款記錄、搜尋、分頁）====================

const FeeSystem: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // 從 Redux Store 取得資料
  const buildings = useAppSelector((state) => state.building.buildings);
  const units = useAppSelector((state) => state.building.units);
  const floors = useAppSelector((state) => state.building.floors);
  const feeState = useAppSelector((state) => state.fee);
  const { defaultPricePerPing, baseConfigs, specialConfigs, unitFeeDetails, units: feeUnits, periods, selectedPeriod } = feeState;
  
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

  // 期數選擇對話框狀態
  const [showPeriodDialog, setShowPeriodDialog] = useState(false);
  const [pendingPaymentUnit, setPendingPaymentUnit] = useState<UnitFeeDetail | null>(null);

  // 取消繳款確認對話框
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [recordToCancel, setRecordToCancel] = useState<PaymentRecord | null>(null);

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
  }, [defaultPricePerPing, baseConfigs, specialConfigs, unitFeeDetails.length]);

  // 初始化管理費資料
  const initializeFeeData = () => {
    const details: UnitFeeDetail[] = units.map((unit) => {
      const config = getUnitConfig(unit.id);
      const area = (unit as any).size || (unit as any).area || 30;
      const pricePerPing = config.pricePerPing;
      const baseFee = area * pricePerPing;
      const additionalTotal = (config.additionalItems || []).reduce((sum, item) => sum + item.amount, 0);
      
      return {
        unitId: unit.id,
        buildingId: unit.buildingId || '',
        unitNumber: (unit as any).unitNumber || '',
        displayName: (unit as any).displayName || (unit as any).unitNumber || '',
        size: area,
        pricePerPing: pricePerPing,
        monthlyFee: baseFee + additionalTotal,
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
      const baseFee = area * pricePerPing;
      const additionalTotal = (config.additionalItems || []).reduce((sum, item) => sum + item.amount, 0);
      
      return {
        ...detail,
        pricePerPing,
        monthlyFee: baseFee + additionalTotal,
        source: (config.isSpecial ? 'special' : 'default') as 'default' | 'special' | 'manual',
        specialConfigId: config.specialConfigId,
        updatedAt: new Date().toISOString(),
      };
    });

    dispatch(feeActions.setUnitFeeDetails(updatedDetails));
  };

  // 取得該戶的配置
  const getUnitConfig = (unitId: string): { pricePerPing: number; isSpecial: boolean; specialConfigId?: string; additionalItems: FeeAdditionalItem[] } => {
    const unit = units.find((u) => u.id === unitId);
    if (!unit) return { pricePerPing: defaultPricePerPing, isSpecial: false, additionalItems: [] };

    const specialConfig = specialConfigs.find(
      (c: SpecialFeeConfig) => c.unitIds.includes(unitId) && c.buildingId === unit.buildingId
    );
    
    if (specialConfig) {
      return {
        pricePerPing: specialConfig.customPrice || defaultPricePerPing,
        isSpecial: true,
        specialConfigId: specialConfig.id,
        additionalItems: specialConfig.additionalItems || [],
      };
    }

    const baseConfig = baseConfigs.find(
      (c: FeeBaseConfig) => c.buildingId === unit.buildingId && c.isActive
    );

    return {
      pricePerPing: baseConfig?.pricePerPing || defaultPricePerPing,
      isSpecial: false,
      additionalItems: [],
    };
  };

  // 計算顯示費用（根據選中的期數，金額跟随后台當期設定）
  const getDisplayFee = (unitId: string, currentMonthlyFee: number): { amount: number; baseFee: number; additionalTotal: number; additionalItems: FeeAdditionalItem[]; source: string } => {
    // 計算顯示費用（有選擇期數時顯示當前設定金額，否則顯示空白）
  const getDisplayFee = (unitId: string, currentMonthlyFee: number): { amount: number; baseFee: number; additionalTotal: number; additionalItems: FeeAdditionalItem[]; source: string } => {
    // 如果沒有選中期數，顯示空白
    if (!selectedPeriod) {
      return {
        amount: 0,
        baseFee: 0,
        additionalTotal: 0,
        additionalItems: [],
        source: 'none',
      };
    }
    
    // 有選中期數時，金額使用當前設定
    const period = periods.find((p: PaymentPeriod) => p.period === selectedPeriod);
    if (period) {
      // 檢查是否有該戶的個別設定
      const unitConfig = period.unitFeeConfigs?.find((c) => c.unitId === unitId);
      if (unitConfig) {
        // 使用該戶的個別設定
        return {
          amount: unitConfig.baseFee + unitConfig.additionalTotal,
          baseFee: unitConfig.baseFee,
          additionalTotal: unitConfig.additionalTotal,
          additionalItems: unitConfig.additionalItems,
          source: 'period-custom',
        };
      }
    }
    
    // 使用當前設定（跟随后台費率）
    const feeCalc = calculateTotalFee(unitId);
    return {
      amount: currentMonthlyFee,
      baseFee: feeCalc.baseFee,
      additionalTotal: feeCalc.additionalTotal,
      additionalItems: feeCalc.additionalItems,
      source: 'current',
    };
  };
    
    // 使用當前設定（跟随后台費率）
    const feeCalc = calculateTotalFee(unitId);
    return {
      amount: currentMonthlyFee,
      baseFee: feeCalc.baseFee,
      additionalTotal: feeCalc.additionalTotal,
      additionalItems: feeCalc.additionalItems,
      source: 'current',
    };
  };

  // 計算該戶的總費用（包含額外費用）
  const calculateTotalFee = (unitId: string): { baseFee: number; additionalTotal: number; total: number; additionalItems: FeeAdditionalItem[] } => {
    const config = getUnitConfig(unitId);
    const unit = units.find((u) => u.id === unitId);
    const area = (unit as any).size || (unit as any).area || 30;
    const baseFee = area * config.pricePerPing;
    const additionalTotal = (config.additionalItems || []).reduce((sum, item) => sum + item.amount, 0);
    return {
      baseFee,
      additionalTotal,
      total: baseFee + additionalTotal,
      additionalItems: config.additionalItems || [],
    };
  };

  // 添加繳款記錄
  const handleAddPayment = () => {
    if (!selectedUnitForPayment) return;
    
    const unit = units.find((u) => u.id === selectedUnitForPayment);
    if (!unit) return;

    const detail = unitFeeDetails.find((d) => d.unitId === selectedUnitForPayment);
    if (!detail) return;

    // 計算當時的費用結構（使用選中期數的快照或當前設定）
    const displayFee = getDisplayFee(selectedUnitForPayment, detail.monthlyFee);
    
    // 轉換 additionalItems 格式（從 fee.ts 到 domain.ts）
    const convertedAdditionalItems: DomainAdditionalItem[] = displayFee.additionalItems.map(item => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      isRecurring: item.isFixed,
      note: item.note,
    }));

    const newRecord: PaymentRecord = {
      id: `PAY_${Date.now()}`,
      unitId: selectedUnitForPayment,
      unitNumber: detail.unitNumber,
      buildingId: unit.buildingId || '',
      amount: newPaymentData.amount || displayFee.amount,
      paymentDate: new Date().toISOString(),
      paymentMethod: newPaymentData.paymentMethod,
      paymentPeriod: newPaymentData.paymentPeriod,
      // 費用快照
      baseFee: displayFee.baseFee,
      additionalItems: displayFee.additionalItems,
      additionalTotal: displayFee.additionalTotal,
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
      totalFee: displayFee.amount,
      baseFee: displayFee.baseFee,
      additionalItems: convertedAdditionalItems,
      additionalTotal: displayFee.additionalTotal,
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

  // 快速繳款（單一期數）
  const handleQuickPayment = (detail: UnitFeeDetail, period: string) => {
    // 檢查是否有期數費用快照
    const periodData = periods.find((p: PaymentPeriod) => p.period === period);
    
    let feeCalc;
    if (periodData && periodData.baseFee !== undefined) {
      // 使用期數的費用快照
      const unit = units.find((u) => u.id === detail.unitId);
      const area = (unit as any).size || (unit as any).area || 30;
      const baseFee = area * (periodData.basePricePerPing || defaultPricePerPing);
      feeCalc = {
        total: baseFee + (periodData.additionalTotal || 0),
        baseFee,
        additionalTotal: periodData.additionalTotal || 0,
        additionalItems: periodData.additionalItems || [],
      };
    } else {
      // 否則使用當前設定
      feeCalc = calculateTotalFee(detail.unitId);
    }
    
    const newRecord: PaymentRecord = {
      id: `PAY_${Date.now()}`,
      unitId: detail.unitId,
      unitNumber: detail.unitNumber,
      buildingId: detail.buildingId,
      amount: feeCalc.total,
      paymentDate: new Date().toISOString(),
      paymentMethod: 'cash',
      paymentPeriod: period,
      note: '快速繳款',
      // 費用快照
      baseFee: feeCalc.baseFee,
      additionalItems: feeCalc.additionalItems,
      additionalTotal: feeCalc.additionalTotal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPaymentRecords([newRecord, ...paymentRecords]);
    
    // 更新 FeeUnit 狀態
    const unit = units.find((u) => u.id === detail.unitId);
    
    // 轉換 additionalItems 格式
    const convertedAdditionalItems: DomainAdditionalItem[] = feeCalc.additionalItems.map(item => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      isRecurring: item.isFixed,
      note: item.note,
    }));
    
    const updatedFeeUnit: FeeUnit = {
      id: `F_${detail.unitId}`,
      unitId: detail.unitId,
      unit: unit as any,
      area: detail.size,
      pricePerPing: detail.pricePerPing,
      totalFee: feeCalc.total,
      baseFee: feeCalc.baseFee,
      additionalItems: convertedAdditionalItems,
      additionalTotal: feeCalc.additionalTotal,
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
  };

  // 確認繳款（從期數選擇對話框）
  const handleConfirmPayment = () => {
    if (!pendingPaymentUnit || !newPaymentData.paymentPeriod) return;
    handleQuickPayment(pendingPaymentUnit, newPaymentData.paymentPeriod);
    setShowPeriodDialog(false);
    setPendingPaymentUnit(null);
  };

  // 處理取消繳款請求
  const onCancelClick = (record: PaymentRecord) => {
    setRecordToCancel(record);
    setShowCancelDialog(true);
  };

  // 確認取消繳款
  const handleConfirmCancel = () => {
    if (!recordToCancel) return;
    
    // 從記錄中移除
    const updatedRecords = paymentRecords.filter(r => r.id !== recordToCancel.id);
    setPaymentRecords(updatedRecords);

    // 重新檢查該戶的繳款狀態
    // 檢查是否所有「過去」期數都已繳款
    const unitId = recordToCancel.unitId;
    
    // 取得該戶的所有應繳期數
    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7);
    
    // 找出所有未來的未繳期數 (這部分不影響「已結清」狀態)
    // 我們需要檢查是否還有「過去」的未繳期數
    
    // 注意：因為 updatedRecords 已經排除了被取消的這一筆
    // 所以如果被取消的是過去的期數，這裡就會檢測到「未繳」
    
    // 這裡我們需要更新 Redux 中的 FeeUnit 狀態
    // 如果取消後，變為有欠款，則 paymentStatus 應為 'unpaid'
    // 這裡簡化邏輯：只要有取消，就設為 'unpaid'，讓使用者自己再去按「繳款」
    // 或者更精確地計算：
    
    // 重新計算是否還有欠款
    const hasUnpaidPast = periods.some(p => {
        if (!p.isActive || !p.period) return false;
        if (p.period >= currentMonthStr) return false; // 未來或當月不算欠款
        
        // 檢查該期是否有繳款記錄
        const isPaid = updatedRecords.some(r => r.unitId === unitId && r.paymentPeriod === p.period);
        return !isPaid;
    });

    const unit = units.find((u) => u.id === unitId);
    const detail = unitFeeDetails.find((d) => d.unitId === unitId);
    
    if (unit && detail) {
        // 更新 Redux 狀態
        // 如果有過去未繳款，則狀態為 unpaid
        // 如果沒有過去未繳款，則狀態為 paid (已結清)
        const newStatus = hasUnpaidPast ? 'unpaid' : 'paid';
        
        const feeCalc = calculateTotalFee(unitId);
        // Note: We need to reconstruct FeeUnit. Ideally this logic should be centralized or in a reducer.
        // For now, we update it here to sync UI.
        
        const existingIndex = feeUnits.findIndex((u) => u.unitId === unitId);
        if (existingIndex >= 0) {
             const oldFeeUnit = feeUnits[existingIndex];
             const updatedFeeUnit: FeeUnit = {
                 ...oldFeeUnit,
                 paymentStatus: newStatus,
                 updatedAt: new Date().toISOString(),
             };
             dispatch(feeActions.updateFeeUnit({ id: oldFeeUnit.id, updates: updatedFeeUnit }));
        }
    }
    
    // Close dialog
    setShowCancelDialog(false);
    setRecordToCancel(null);
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
              ? 'bg-[#5865F2] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          戶別總覽
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'records'
              ? 'bg-[#5865F2] text-white'
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
          {/* 搜尋和過濾區域 */}
          <div className="flex flex-wrap gap-3 mb-6 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--color-border)]">
            {/* 棟別選擇 */}
            <select
              value={activeBuildingId}
              onChange={(e) => setActiveBuildingId(e.target.value)}
              className="px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
            >
              <option value="all">全部棟別</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>{b.buildingCode}棟</option>
              ))}
            </select>

            {/* 期數選擇 */}
            <select
              value={feeState.selectedPeriod || ''}
              onChange={(e) => dispatch(feeActions.setSelectedPeriod(e.target.value || null))}
              className="px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
            >
              <option value="">全部期數</option>
              {periods
                .filter((p: PaymentPeriod) => p.isActive)
                .sort((a: PaymentPeriod, b: PaymentPeriod) => b.period.localeCompare(a.period))
                .map((p: PaymentPeriod) => (
                  <option key={p.id} value={p.period}>
                    {p.name}
                  </option>
                ))}
            </select>

            {/* 搜尋戶別 */}
            <input
              type="text"
              placeholder="搜尋戶別編號..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
            />

            {/* 清除按鈕 */}
            <Button
              variant="secondary"
              size="small"
              onClick={() => {
                setActiveBuildingId('all');
                dispatch(feeActions.setSelectedPeriod(null));
                setSearchQuery('');
              }}
            >
              清除
            </Button>
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

                    {/* 戶別卡片網格 - 左右分欄布局 */}
                    <div className="grid grid-cols-1 gap-4">
                      {details.map((detail) => {
                        const feeUnit = feeUnits.find((u) => u.unitId === detail.unitId);
                        const isPaid = feeUnit?.paymentStatus === 'paid';
                        const isSpecial = detail.source === 'special';
                        
                        // 計算顯示費用
                        const displayFee = getDisplayFee(detail.unitId, detail.monthlyFee);

                        // 定義日期比較函式
                        const getMonthDiff = (d1: Date, d2: Date) => {
                          return (d1.getFullYear() - d2.getFullYear()) * 12 + (d1.getMonth() - d2.getMonth());
                        };

                        const now = new Date();
                        const currentMonthStr = now.toISOString().slice(0, 7);

                        // 計算需顯示的期數範圍（前後10個月）
                        const displayPeriods = periods.filter((p: PaymentPeriod) => {
                           if (!p.period) return false;
                           const pDate = new Date(p.period + '-01');
                           const diff = getMonthDiff(pDate, now);
                           return diff >= -10 && diff <= 10;
                        }).sort((a, b) => a.period.localeCompare(b.period));

                        // 判斷是否還有未繳款期數（用於決定卡片狀態）
                        // 這裡可以根據具體業務邏輯調整，目前僅計算過去的未繳款
                        const actualUnpaidPastPeriods = periods.filter((p: PaymentPeriod) => {
                           const isPeriodPaid = paymentRecords.some(
                             (r) => r.unitId === detail.unitId && r.paymentPeriod === p.period
                           );
                           if (!p.period) return false;
                           return p.isActive && !isPeriodPaid && p.period < currentMonthStr;
                        });

                        // 計算所有未繳款期數 (恢復變數供按鈕邏輯使用)
                        const unpaidPeriods = periods.filter((p: PaymentPeriod) => {
                          const isPeriodPaid = paymentRecords.some(
                            (r) => r.unitId === detail.unitId && r.paymentPeriod === p.period
                          );
                          return p.isActive && !isPeriodPaid;
                        });

                        return (
                          <div
                            key={detail.unitId}
                            className={`border rounded-lg p-4 transition-all ${
                              actualUnpaidPastPeriods.length === 0
                                ? 'border-green-500/50 bg-green-500/5'
                                : 'border-[var(--color-border)] bg-[var(--bg-secondary)]'
                            }`}
                          >
                            <div className="flex gap-4">
                              {/* 左側：基本資訊 */}
                              <div className={`${displayPeriods.length > 0 ? 'w-2/3' : 'w-full'}`}>
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
                                </div>

                                  {/* 金額資訊 */}
                                  <div className="mb-3">
                                    {selectedPeriod ? (
                                      <>
                                        <p className="text-sm text-[var(--text-muted)]">此期數應繳</p>
                                        <p className="text-2xl font-bold text-[var(--brand-experiment)]">
                                          NT$ {displayFee.amount.toLocaleString()}
                                        </p>
                                        {/* 顯示費用明細 */}
                                        {(displayFee.additionalTotal > 0 || displayFee.source === 'period-custom') && (
                                          <div className="text-xs text-[var(--text-muted)] mt-1">
                                            <span>基本: ${displayFee.baseFee.toLocaleString()}</span>
                                            {displayFee.additionalTotal > 0 && (
                                              <>
                                                <span className="mx-1">+</span>
                                                <span>額外: ${displayFee.additionalTotal.toLocaleString()}</span>
                                              </>
                                            )}
                                          </div>
                                        )}
                                        {/* 顯示額外項目細項 */}
                                        {displayFee.additionalItems.length > 0 && (
                                          <div className="text-xs text-[var(--text-muted)] mt-1 ml-2">
                                            {displayFee.additionalItems.map((item, i) => (
                                              <div key={i}>+ {item.name}: ${item.amount.toLocaleString()}</div>
                                            ))}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-sm text-[var(--text-muted)]">請選擇期數</p>
                                    )}
                                  </div>

                                {/* 繳款時間 */}
                                {feeUnit?.paymentDate && (
                                  <div className="mb-3 text-sm">
                                    <span className="text-[var(--text-muted)]">上次繳款：</span>
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
                                  {actualUnpaidPastPeriods.length === 0 ? (
                                    <span className="text-green-500 font-bold flex items-center justify-center px-4 w-full border border-green-500/20 bg-green-500/10 rounded">
                                      ✓ 已結清
                                    </span>
                                  ) : (
                                    <Button
                                      variant="primary"
                                      size="small"
                                      className="flex-1"
                                      onClick={() => {
                                        // 計算未繳款期數
                                        const unpaidPeriods = periods.filter((p: PaymentPeriod) => {
                                          const isPeriodPaid = paymentRecords.some(
                                            (r) => r.unitId === detail.unitId && r.paymentPeriod === p.period
                                          );
                                          return p.isActive && !isPeriodPaid;
                                        });

                                        // 如果有多個未繳期數，彈出選擇對話框
                                        if (unpaidPeriods.length > 1) {
                                          setPendingPaymentUnit(detail);
                                          setNewPaymentData({
                                            ...newPaymentData,
                                            amount: detail.monthlyFee,
                                            paymentPeriod: unpaidPeriods[0]?.period || new Date().toISOString().slice(0, 7),
                                          });
                                          setShowPeriodDialog(true);
                                        } else {
                                          // 只有一個期數或沒有選擇期數，直接繳款
                                          const targetPeriod = selectedPeriod || unpaidPeriods[0]?.period || new Date().toISOString().slice(0, 7);
                                          handleQuickPayment(detail, targetPeriod);
                                        }
                                      }}
                                    >
                                      繳款
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* 右側：期數狀態區塊 (顯示前後10個月) */}
                              {displayPeriods.length > 0 && (
                                <div className="w-1/3 border-l border-[var(--color-border)] pl-4">
                                  <p className="text-sm font-bold text-[var(--text-muted)] mb-2">
                                    期數狀態 (+/- 10期)
                                  </p>
                                  <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
                                    {displayPeriods.map((p: PaymentPeriod) => {
                                      const isPeriodPaid = paymentRecords.some(
                                        (r) => r.unitId === detail.unitId && r.paymentPeriod === p.period
                                      );
                                      const isPast = p.period < currentMonthStr;
                                      
                                      // Determine Color
                                      // Past Unpaid: Red
                                      // Past Paid: Green
                                      // Future Unpaid: Yellow
                                      // Future Paid: Green (Assuming paid future is good)
                                      
                                      let bgColor = 'bg-[var(--bg-tertiary)]';
                                      let borderColor = 'border-[var(--color-border)]';
                                      let textColor = 'text-[var(--text-muted)]';
                                      
                                      if (isPeriodPaid) {
                                        bgColor = 'bg-green-500/10';
                                        borderColor = 'border-green-500/30';
                                        textColor = 'text-green-600';
                                      } else {
                                        if (isPast) {
                                            bgColor = 'bg-red-500/10';
                                            borderColor = 'border-red-500/30';
                                            textColor = 'text-red-500';
                                        } else {
                                            bgColor = 'bg-yellow-500/10';
                                            borderColor = 'border-yellow-500/30';
                                            textColor = 'text-yellow-600';
                                        }
                                      }

                                      return (
                                        <div
                                          key={p.id}
                                          className={`p-2 border rounded text-sm ${bgColor} ${borderColor}`}
                                        >
                                          <div className="flex justify-between items-center">
                                            <p className={`font-medium ${textColor}`}>
                                              {p.name}
                                            </p>
                                            <span className={`text-xs ${isPeriodPaid ? 'text-green-600' : 'text-[var(--text-muted)]'}`}>
                                                {isPeriodPaid ? '已繳' : '未繳'}
                                            </span>
                                          </div>
                                          <p className="text-xs text-[var(--text-muted)] mt-1">
                                            截止：{new Date(p.dueDate).toLocaleDateString('zh-TW')}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
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
                    <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">費用明細</th>
                    <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">繳款方式</th>
                    <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">繳款時間</th>
                    <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">備註</th>
                    <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-[var(--text-muted)]">
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
                        <td className="py-3 px-4">
                          <div className="font-bold text-[var(--brand-experiment)]">
                            NT$ {record.amount.toLocaleString()}
                          </div>
                          {record.additionalTotal > 0 && (
                            <div className="text-xs text-[var(--text-muted)]">
                              <span>基本: ${record.baseFee.toLocaleString()}</span>
                              <span className="mx-1">+</span>
                              <span>額外: ${record.additionalTotal.toLocaleString()}</span>
                            </div>
                          )}
                          {record.additionalItems && record.additionalItems.length > 0 && (
                            <div className="text-xs text-[var(--text-muted)] mt-1">
                              {record.additionalItems.map((item, i) => (
                                <div key={i}>
                                  + {item.name}: ${item.amount.toLocaleString()}
                                </div>
                              ))}
                            </div>
                          )}
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
                        <td className="py-3 px-4">
                          <Button
                            variant="danger"
                            size="small"
                            onClick={() => onCancelClick(record)}
                          >
                            取消
                          </Button>
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
                  {unitFeeDetails.map((detail) => {
                    const displayFee = getDisplayFee(detail.unitId, detail.monthlyFee);
                    return (
                      <option key={detail.unitId} value={detail.unitId}>
                        {detail.unitNumber} - NT$ {displayFee.amount.toLocaleString()}
                        {selectedPeriod && displayFee.source === 'period' ? ' (期數費用)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 繳款金額 */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  繳款金額
                </label>
                <input
                  type="number"
                  value={newPaymentData.amount || (selectedUnitForPayment ? getDisplayFee(selectedUnitForPayment, unitFeeDetails.find(d => d.unitId === selectedUnitForPayment)?.monthlyFee || 0).amount : '')}
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

      {/* 期數選擇對話框（多期數未繳時彈出） */}
      {showPeriodDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-11/12 max-w-md shadow-2xl border border-[var(--color-border)]">
            <h3 className="text-xl font-bold text-[var(--text-normal)] mb-4">
              選擇繳款期數
            </h3>
            <p className="text-[var(--text-muted)] mb-4">
              該戶有多期未繳款，請選擇要繳納的期數：
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(() => {
                if (!pendingPaymentUnit) return null;
                const unpaidPeriods = periods.filter((p: PaymentPeriod) => {
                  const isPeriodPaid = paymentRecords.some(
                    (r) => r.unitId === pendingPaymentUnit.unitId && r.paymentPeriod === p.period
                  );
                  return p.isActive && !isPeriodPaid;
                });

                return unpaidPeriods.map((p: PaymentPeriod) => (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      newPaymentData.paymentPeriod === p.period
                        ? 'border-[var(--brand-experiment)] bg-[var(--brand-experiment)] bg-opacity-10'
                        : 'border-[var(--color-border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentPeriod"
                        value={p.period}
                        checked={newPaymentData.paymentPeriod === p.period}
                        onChange={(e) => setNewPaymentData({ ...newPaymentData, paymentPeriod: e.target.value })}
                        className="w-4 h-4 text-[var(--brand-experiment)]"
                      />
                      <div>
                        <p className="font-medium text-[var(--text-normal)]">{p.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          截止：{new Date(p.dueDate).toLocaleDateString('zh-TW')}
                        </p>
                        {/* 顯示期數費用快照 */}
                        {p.baseFee !== undefined && (
                          <p className="text-xs text-yellow-500 mt-1">
                            基本: ${p.baseFee.toLocaleString()}
                            {p.additionalTotal ? ` + 額外: ${p.additionalTotal.toLocaleString()}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-[var(--brand-experiment)]">
                      NT$ {((p.baseFee || 0) + (p.additionalTotal || 0)).toLocaleString()}
                    </span>
                  </label>
                ));
              })()}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={handleConfirmPayment}
                disabled={!newPaymentData.paymentPeriod}
                className="flex-1"
              >
                確認繳款
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPeriodDialog(false);
                  setPendingPaymentUnit(null);
                }}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 取消繳款確認對話框 */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-11/12 max-w-sm shadow-2xl border border-[var(--color-border)]">
            <h3 className="text-xl font-bold text-[var(--text-normal)] mb-4">
              確認取消繳款
            </h3>
            <p className="text-[var(--text-muted)] mb-6">
              確定要取消此筆繳款記錄嗎？取消後該期數將恢復為未繳款狀態。
            </p>
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleConfirmCancel}
                className="flex-1"
              >
                確認取消
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCancelDialog(false);
                  setRecordToCancel(null);
                }}
                className="flex-1"
              >
                關閉
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FeeSystem;
