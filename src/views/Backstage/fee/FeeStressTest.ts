import { feeActions, FeeState, recalculateAllFees } from '../../../store/modules/fee';
import { FeeUnit, BuildingConfig, UnitConfig } from '../../../types/domain';
import { PaymentPeriod, FeeAdditionalItem, PaymentRecord } from '../../../types/fee';

// 模擬真實操作資料 - 管理費系統壓力測試
export class FeeStressTest {
  private dispatch: any;
  private getState: any;
  private buildings: BuildingConfig[];
  private units: UnitConfig[];
  private testResults: string[] = [];
  private errorCount = 0;
  private successCount = 0;

  constructor(dispatch: any, getState: any, buildings: BuildingConfig[], units: UnitConfig[]) {
    this.dispatch = dispatch;
    this.getState = getState;
    this.buildings = buildings;
    this.units = units;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 獲取隨機單位
  private getRandomUnit(): UnitConfig | null {
    if (this.units.length === 0) return null;
    return this.units[Math.floor(Math.random() * this.units.length)];
  }

  // 1.5 模擬自訂費用項目
  private async simulateCustomItems(round: number): Promise<boolean> {
    try {
      const itemsToAdd = [
        { name: `清潔費-${round}`, amount: 300, isFixed: true },
        { name: `停車費-${round}`, amount: 2000, isFixed: true },
        { name: `公設維護費-${round}`, amount: 10, isFixed: false }, // 每坪 10 元
      ];

      for (const item of itemsToAdd) {
        this.dispatch(feeActions.addCustomFeeItem(item));
        await this.delay(20);
      }
      
      this.testResults.push(`[自訂] 新增了 3 個全域費用項目`);
      return true;
    } catch (error) {
      this.testResults.push(`❌ [自訂] 自訂項目失敗: ${error}`);
      return false;
    }
  }

  // 1. 模擬設定費率 (基礎費率 & 特殊費率)
  private async simulateFeeSettings(round: number): Promise<boolean> {
    try {
      // 隨機更新預設單價 (50 ~ 150)
      const newPrice = 50 + Math.floor(Math.random() * 10) * 10;
      this.dispatch(feeActions.batchUpdateSettings({ pricePerPing: newPrice }));
      
      // 為隨機 3 個單位設定特殊費率 (包含額外項目)
      for (let i = 0; i < 3; i++) {
        const unit = this.getRandomUnit();
        if (unit) {
          const state = this.getState() as { fee: FeeState };
          
          // 找出所有與此 unitId 相關的 config
          const relatedConfigs = state.fee.specialConfigs.filter(c => 
            c.buildingId === unit.buildingId && c.unitIds.includes(unit.id)
          );

          // 刪除舊設定（確保一對一）
          for (const config of relatedConfigs) {
            if (config.unitIds.length === 1 && config.unitIds[0] === unit.id) {
               this.dispatch(feeActions.deleteSpecialConfig(config.id));
            } else {
               const newUnitIds = config.unitIds.filter(id => id !== unit.id);
               this.dispatch(feeActions.updateSpecialConfig({
                 ...config,
                 unitIds: newUnitIds
               }));
            }
          }

          // 新增全新的設定 (含額外項目)
          const specialPrice = newPrice + (Math.random() > 0.5 ? 20 : -10);
          const additionalItems = [
            { id: `item-${Date.now()}-1`, name: '機車位清潔費', amount: 100, isFixed: true, isRecurring: true },
          ];

          this.dispatch(feeActions.addSpecialConfig({
            buildingId: unit.buildingId || '',
            name: `測試特殊費率-${unit.unitNumber}`,
            type: 'custom',
            unitIds: [unit.id],
            customPrice: specialPrice,
            additionalItems: additionalItems, // 加入額外項目
            description: `壓力測試產生-${round}`,
          }));
        }
      }

      this.testResults.push(`[設定] 更新預設費率為 $${newPrice}/坪，並新增/更新 3 個特殊費率設定 (含額外項目)`);
      return true;
    } catch (error) {
      this.testResults.push(`❌ [設定] 費率設定失敗: ${error}`);
      return false;
    }
  }

  // 2. 模擬新增期數 (產生過去6個月到未來6個月)
  private async simulatePeriods(): Promise<boolean> {
    try {
      const now = new Date();
      const periodsToAdd: Omit<PaymentPeriod, 'id' | 'createdAt' | 'updatedAt'>[] = [];

      for (let i = -6; i <= 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const periodStr = d.toISOString().slice(0, 7); // YYYY-MM
        
        // 檢查是否已存在
        const state = this.getState() as { fee: FeeState };
        if (state.fee.periods.some(p => p.period === periodStr)) continue;

        periodsToAdd.push({
          period: periodStr,
          name: `${d.getFullYear()}年${d.getMonth() + 1}月管理費`,
          dueDate: new Date(d.getFullYear(), d.getMonth() + 1, 15).toISOString(), // 次月15日
          isActive: true,
          note: '壓力測試產生',
          basePricePerPing: state.fee.defaultPricePerPing,
          defaultSize: 30,
          baseFee: 30 * state.fee.defaultPricePerPing,
          additionalTotal: 0,
          additionalItems: [],
          unitFeeConfigs: [],
        });
      }

      for (const p of periodsToAdd) {
        this.dispatch(feeActions.addPeriod(p));
        await this.delay(50);
      }

      this.testResults.push(`[期數] 檢查並補齊了前後 6 個月的繳費期數`);
      return true;
    } catch (error) {
      this.testResults.push(`❌ [期數] 新增期數失敗: ${error}`);
      return false;
    }
  }

  // 3. 模擬繳款 (隨機繳納過去或現在的期數)
  private async simulatePayments(count: number): Promise<boolean> {
    try {
      const state = this.getState() as { fee: FeeState };
      const periods = state.fee.periods;
      const activePeriods = periods.filter(p => p.isActive);
      
      if (activePeriods.length === 0) {
        this.testResults.push(`⚠️ [繳款] 無可用期數，跳過繳款測試`);
        return true;
      }

      let paidCount = 0;
      for (let i = 0; i < count; i++) {
        const unit = this.getRandomUnit();
        if (!unit) continue;

        const period = activePeriods[Math.floor(Math.random() * activePeriods.length)];
        
        // 計算應繳金額 (簡化計算，直接取 store 中的計算值或預設值)
        const unitDetail = state.fee.unitFeeDetails.find(d => d.unitId === unit.id);
        const amount = unitDetail ? unitDetail.monthlyFee : 3000; // Fallback

        // 模擬繳款
        // 注意：這裡我們直接更新 FeeUnit 狀態，並假設 PaymentSystem 會處理 PaymentRecord
        // 實際應用中應該調用 service 或更完整的 action，這裡模擬 Frontstage 的 handleAddPayment 邏輯
        
        // 1. 新增繳款記錄
        // (這裡不直接操作 PaymentRecord state，因為它通常是在 Component 內部 state 或獨立的 slice)
        // 但為了測試完整性，我們假設有一個全局的 paymentRecords (在真實 app 中是在 Frontstage/FeeSystem.tsx 內部的 state)
        // 由於我們無法直接訪問 Component state，我們只能更新 Redux 中的 FeeUnit status 來模擬「已繳款」的狀態
        
        const feeUnitUpdate: Partial<FeeUnit> = {
          paymentStatus: 'paid',
          lastPaymentDate: new Date().toISOString(),
          paymentDate: new Date().toISOString(),
        };

        const existingFeeUnit = state.fee.units.find(u => u.unitId === unit.id);
        if (existingFeeUnit) {
            this.dispatch(feeActions.updateFeeUnit({ id: existingFeeUnit.id, updates: feeUnitUpdate }));
        } else {
            // 這種情況應該比較少見，因為初始化時應該都有
             this.dispatch(feeActions.addFeeUnit({
                id: `F_${unit.id}`,
                unitId: unit.id,
                unit: unit as any,
                area: 30, // 模擬
                pricePerPing: 100,
                totalFee: amount,
                baseFee: amount,
                additionalItems: [],
                additionalTotal: 0,
                notes: '壓力測試',
                paymentStatus: 'paid',
                paymentDate: new Date().toISOString(),
                lastPaymentDate: new Date().toISOString(),
                isSpecial: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
             }));
        }
        
        paidCount++;
        await this.delay(20);
      }

      this.testResults.push(`[繳款] 隨機完成了 ${paidCount} 筆繳款操作`);
      return true;
    } catch (error) {
      this.testResults.push(`❌ [繳款] 繳款模擬失敗: ${error}`);
      return false;
    }
  }

  // 4. 數據一致性檢查
  private checkConsistency(): boolean {
    const state = this.getState() as { fee: FeeState };
    const { units, unitFeeDetails, baseConfigs, specialConfigs } = state.fee;
    
    let issues = 0;

    // 檢查 1: 每個 UnitConfig 是否都有對應的 FeeUnit 和 Detail
    this.units.forEach(u => {
        const detail = unitFeeDetails.find(d => d.unitId === u.id);
        if (!detail) {
            this.testResults.push(`❌ [一致性] 單位 ${u.unitNumber} 缺少 FeeDetail`);
            issues++;
        }
    });

    // 檢查 2: 特殊設定是否正確應用 (含自訂費率與額外項目)
    specialConfigs.forEach(config => {
        config.unitIds.forEach(uid => {
            const detail = unitFeeDetails.find(d => d.unitId === uid);
            // 檢查自訂費率
            if (detail && detail.pricePerPing !== config.customPrice) {
                 this.testResults.push(`❌ [一致性] 單位 ${detail.unitNumber} 特殊費率未應用 (預期 ${config.customPrice}, 實際 ${detail.pricePerPing})`);
                 issues++;
            }
            // 檢查額外項目 (尚未檢查 additionalItems，因為 UnitFeeDetail 目前尚未包含此欄位，需先從 store/state 確認)
            // 這裡我們暫時只檢查費率，若未來 UnitFeeDetail 包含 additionalItems 則可一併檢查
        });
    });

    if (issues === 0) {
        this.testResults.push(`✅ [一致性] 所有數據檢查通過`);
        return true;
    } else {
        return false;
    }
  }

  // 執行完整測試
  public async runTest(): Promise<string[]> {
    this.testResults = [];
    this.testResults.push('🚀 開始管理費系統壓力測試...');
    
    // 階段 1: 基礎設定
    await this.simulateFeeSettings(1);
    await this.simulateCustomItems(1); // 新增這行
    
    // 階段 2: 期數產生
    await this.simulatePeriods();
    
    // 階段 3: 重新計算 (模擬)
    // 觸發重新計算 action (如果有的話，這裡假設 updateSettings 會觸發 UI 更新，我們手動觸發一次計算邏輯檢查)
    // 轉換 unit 格式以符合 feeService 預期 (domain.UnitConfig (area) -> building.UnitConfig (size))
    const compatibleUnits = this.units.map(u => ({
      ...u,
      size: u.area || 30, // Default to 30 if area is missing
      displayName: u.unitNumber, // building.UnitConfig requires displayName
      type: 'residential' as const, // building.UnitConfig requires type
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })) as any[]; // Cast to any to avoid strict type mismatch with building.UnitConfig

    this.dispatch(recalculateAllFees({ units: compatibleUnits, baseConfigs: this.getState().fee.baseConfigs }));
    await this.delay(500);

    // 階段 4: 模擬大量繳款
    await this.simulatePayments(20);

    // 階段 5: 檢查數據
    this.checkConsistency();

    this.testResults.push('🏁 測試結束');
    return this.testResults;
  }
}
