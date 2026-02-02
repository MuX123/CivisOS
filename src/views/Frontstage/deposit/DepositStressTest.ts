import { DepositItemV2, PersonInfo, depositV2Actions } from '../../../store/modules/depositV2';
import DepositTestSimulator from './DepositTestSimulator';

// 100次實際操作測試 - 壓力測試與隨機操作序列
export class DepositStressTest {
  private dispatch: any;
  private getState: any;
  private buildings: any[];
  private units: any[];
  private testResults: string[] = [];
  private operationLog: Array<{
    round: number;
    operation: string;
    itemId?: string;
    details: string;
    success: boolean;
    beforeState?: any;
    afterState?: any;
  }> = [];
  private createdItemIds: string[] = [];
  private errorCount = 0;
  private successCount = 0;

  constructor(dispatch: any, getState: any, buildings: any[], units: any[]) {
    this.dispatch = dispatch;
    this.getState = getState;
    this.buildings = buildings;
    this.units = units;
  }

  // 獲取隨機棟和戶
  private getRandomBuildingAndUnit(): { buildingId: string; unitId: string } {
    if (this.buildings.length === 0) {
      return { buildingId: 'B1', unitId: 'U1' };
    }
    const building = this.buildings[Math.floor(Math.random() * this.buildings.length)];
    const buildingUnits = this.units.filter((u) => u.buildingId === building.id);
    const unit = buildingUnits.length > 0 
      ? buildingUnits[Math.floor(Math.random() * buildingUnits.length)]
      : null;
    return { 
      buildingId: building.id, 
      unitId: unit?.id || 'U1',
    };
  }

  // 創建隨機人員（壓力測試專用，帶特殊前墜）
  private createRandomPerson(): PersonInfo {
    const names = ['張三', '李四', '王五', '趙六', '陳七', '劉八', '楊九', '黃十', '周杰', '吳剛', '鄭偉', '孫燕'];
    const name = names[Math.floor(Math.random() * names.length)];
    const type: 'resident' | 'external' = Math.random() > 0.3 ? 'resident' : 'external';
    
    // 壓力測試人員前墜
    const prefix = '[壓測]';
    
    if (type === 'resident') {
      const { buildingId, unitId } = this.getRandomBuildingAndUnit();
      return { type: 'resident', name: `${prefix}${name}`, buildingId, unitId };
    }
    return { type: 'external', name: `${prefix}訪客-${name}` };
  }

  // 獲取隨機物品名稱
  private getRandomItemName(): string {
    const items = [
      '行李箱', '文件袋', '筆記本電腦', '手機', '平板', '相機', '雨傘', '運動背包',
      '鑰匙', '門禁卡', '管理費押金', '維修押金', '臨時押金', '包裹', '快遞',
      '裝修押金', '租車押金', '停車位押金', '電梯卡', '信箱鑰匙'
    ];
    return items[Math.floor(Math.random() * items.length)];
  }

  // 獲取隨機類型組合
  private getRandomTypes(): Array<'item' | 'money' | 'key'> {
    const types: Array<'item' | 'money' | 'key'> = [];
    if (Math.random() > 0.3) types.push('item');
    if (Math.random() > 0.5) types.push('money');
    if (Math.random() > 0.6) types.push('key');
    if (types.length === 0) types.push('item'); // 至少一種類型
    return types;
  }

  // 獲取隨機金額
  private getRandomAmount(): number {
    const amounts = [100, 500, 1000, 2000, 3000, 5000, 8000, 10000, 15000, 20000, 50000];
    return amounts[Math.floor(Math.random() * amounts.length)];
  }

  // 獲取所有活動項目
  private getActiveItems(): DepositItemV2[] {
    const state = this.getState();
    return (state.depositV2?.items || []).filter((i: DepositItemV2) => i.status === 'active');
  }

  // 獲取所有項目（包含已領取/取消）
  private getAllItems(): DepositItemV2[] {
    const state = this.getState();
    return state.depositV2?.items || [];
  }

  // 獲取指定ID項目
  private getItemById(id: string): DepositItemV2 | null {
    const state = this.getState();
    return (state.depositV2?.items || []).find((i: DepositItemV2) => i.id === id) || null;
  }

  // 操作1: 新增登記
  private async operationCreate(round: number): Promise<boolean> {
    try {
      const staffName = `管理員-${String.fromCharCode(65 + (round % 26))}`;
      const sender = this.createRandomPerson();
      const receiver = this.createRandomPerson();
      const types = this.getRandomTypes();
      const itemName = this.getRandomItemName();
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types,
        itemName,
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
        transactions: types.includes('money') ? [] : undefined,
        currentBalance: types.includes('money') ? 0 : undefined,
        notes: Math.random() > 0.7 ? `測試備註-${round}` : undefined,
      };

      const beforeCount = this.getActiveItems().length;
      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(20);
      const afterCount = this.getActiveItems().length;
      
      const success = afterCount === beforeCount + 1;
      if (success) {
        this.successCount++;
        const newItem = this.getActiveItems()[this.getActiveItems().length - 1];
        this.createdItemIds.push(newItem.id);
      } else {
        this.errorCount++;
      }
      
      this.operationLog.push({
        round,
        operation: 'CREATE',
        details: `創建${types.join('+')}項目：${itemName}`,
        success,
        beforeState: { count: beforeCount },
        afterState: { count: afterCount },
      });
      
      return success;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE',
        details: `創建失敗：${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作2: 加款
  private async operationAddMoney(round: number): Promise<boolean> {
    try {
      // 獲取所有活動項目（不限制必須已有寄錢類型）
      const activeItems = this.getActiveItems();
      if (activeItems.length === 0) {
        this.operationLog.push({
          round,
          operation: 'ADD_MONEY',
          details: '跳過：無可用活動項目',
          success: true,
        });
        return true;
      }
      
      const item = activeItems[Math.floor(Math.random() * activeItems.length)];
      const amount = this.getRandomAmount();
      const beforeBalance = item.currentBalance || 0;
      
      this.dispatch(depositV2Actions.addMoney({
        id: item.id,
        amount,
        staffName: `管理員-${String.fromCharCode(65 + (round % 26))}`,
      }));
      await this.delay(20);
      
      const updatedItem = this.getItemById(item.id);
      const afterBalance = updatedItem?.currentBalance || 0;
      const success = afterBalance === beforeBalance + amount;
      
      if (success) this.successCount++;
      else this.errorCount++;
      
      this.operationLog.push({
        round,
        operation: 'ADD_MONEY',
        itemId: item.id,
        details: `加款$${amount}，餘額：${beforeBalance} → ${afterBalance}，類型：${item.types.join('+')} -> ${updatedItem?.types.join('+')}`,
        success,
        beforeState: { balance: beforeBalance },
        afterState: { balance: afterBalance },
      });
      
      return success;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'ADD_MONEY',
        details: `加款失敗：${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作3: 扣款（帶餘額檢查）
  private async operationSubtractMoney(round: number): Promise<boolean> {
    try {
      const activeItems = this.getActiveItems().filter(i => i.types.includes('money'));
      if (activeItems.length === 0) {
        this.operationLog.push({
          round,
          operation: 'SUBTRACT_MONEY',
          details: '跳過：無可用寄錢項目',
          success: true,
        });
        return true;
      }
      
      const item = activeItems[Math.floor(Math.random() * activeItems.length)];
      const amount = this.getRandomAmount();
      const beforeBalance = item.currentBalance || 0;
      
      // 檢查餘額是否充足
      const isSufficient = amount <= beforeBalance;
      
      this.dispatch(depositV2Actions.subtractMoney({
        id: item.id,
        amount,
        staffName: `管理員-${String.fromCharCode(65 + (round % 26))}`,
      }));
      await this.delay(20);
      
      const updatedItem = this.getItemById(item.id);
      const afterBalance = updatedItem?.currentBalance || 0;
      
      // 驗證結果
      let success: boolean;
      let details: string;
      
      if (isSufficient) {
        // 餘額充足，應該扣款成功
        success = afterBalance === beforeBalance - amount;
        details = `扣款$${amount}，餘額：${beforeBalance} → ${afterBalance}`;
      } else {
        // 餘額不足，應該被拒絕
        success = afterBalance === beforeBalance;
        details = `扣款被拒絕：餘額不足（嘗試扣款$${amount}，目前餘額$${beforeBalance}），餘額維持$${afterBalance}`;
      }
      
      if (success) this.successCount++;
      else this.errorCount++;
      
      this.operationLog.push({
        round,
        operation: 'SUBTRACT_MONEY',
        itemId: item.id,
        details,
        success,
        beforeState: { balance: beforeBalance },
        afterState: { balance: afterBalance },
      });
      
      return success;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'SUBTRACT_MONEY',
        details: `扣款失敗：${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作4: 編輯
  private async operationEdit(round: number): Promise<boolean> {
    try {
      const activeItems = this.getActiveItems();
      if (activeItems.length === 0) {
        this.operationLog.push({
          round,
          operation: 'EDIT',
          details: '跳過：無可用項目',
          success: true,
        });
        return true;
      }
      
      const item = activeItems[Math.floor(Math.random() * activeItems.length)];
      const newName = this.getRandomItemName();
      const beforeName = item.itemName;
      
      this.dispatch(depositV2Actions.editDepositItem({
        id: item.id,
        updates: { itemName: newName },
        staffName: `管理員-${String.fromCharCode(65 + (round % 26))}`,
      }));
      await this.delay(20);
      
      const updatedItem = this.getItemById(item.id);
      const success = updatedItem?.itemName === newName;
      
      if (success) this.successCount++;
      else this.errorCount++;
      
      this.operationLog.push({
        round,
        operation: 'EDIT',
        itemId: item.id,
        details: `編輯名稱：${beforeName} → ${newName}`,
        success,
        beforeState: { name: beforeName },
        afterState: { name: updatedItem?.itemName },
      });
      
      return success;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'EDIT',
        details: `編輯失敗：${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作5: 領取
  private async operationRetrieve(round: number): Promise<boolean> {
    try {
      const activeItems = this.getActiveItems();
      if (activeItems.length === 0) {
        this.operationLog.push({
          round,
          operation: 'RETRIEVE',
          details: '跳過：無可用項目',
          success: true,
        });
        return true;
      }
      
      const item = activeItems[Math.floor(Math.random() * activeItems.length)];
      const beforeStatus = item.status;
      const beforeCount = this.getActiveItems().length;
      
      this.dispatch(depositV2Actions.retrieveDepositItem({
        id: item.id,
        staffName: `管理員-${String.fromCharCode(65 + (round % 26))}`,
      }));
      await this.delay(20);
      
      const updatedItem = this.getItemById(item.id);
      const afterStatus = updatedItem?.status;
      const afterCount = this.getActiveItems().length;
      const success = afterStatus === 'retrieved' && afterCount === beforeCount - 1;
      
      if (success) this.successCount++;
      else this.errorCount++;
      
      this.operationLog.push({
        round,
        operation: 'RETRIEVE',
        itemId: item.id,
        details: `領取項目：${item.itemName}，狀態：${beforeStatus} → ${afterStatus}，數量：${beforeCount} → ${afterCount}`,
        success,
        beforeState: { status: beforeStatus, count: beforeCount },
        afterState: { status: afterStatus, count: afterCount },
      });
      
      return success;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'RETRIEVE',
        details: `領取失敗：${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作6: 還原
  private async operationRevert(round: number): Promise<boolean> {
    try {
      const activeItems = this.getActiveItems();
      if (activeItems.length === 0) {
        this.operationLog.push({
          round,
          operation: 'REVERT',
          details: '跳過：無可用項目',
          success: true,
        });
        return true;
      }
      
      const item = activeItems[Math.floor(Math.random() * activeItems.length)];
      const beforeStatus = item.status;
      const beforeCount = this.getActiveItems().length;
      const beforeBalance = item.currentBalance || 0;
      
      this.dispatch(depositV2Actions.revertDepositItem({
        id: item.id,
        staffName: `管理員-${String.fromCharCode(65 + (round % 26))}`,
      }));
      await this.delay(20);
      
      const updatedItem = this.getItemById(item.id);
      const afterStatus = updatedItem?.status;
      const afterCount = this.getActiveItems().length;
      const afterBalance = updatedItem?.currentBalance || 0;
      
      // 還原後狀態應為cancelled，數量減少1，餘額歸0
      const success = afterStatus === 'cancelled' && 
                      afterCount === beforeCount - 1 && 
                      afterBalance === 0;
      
      if (success) this.successCount++;
      else this.errorCount++;
      
      this.operationLog.push({
        round,
        operation: 'REVERT',
        itemId: item.id,
        details: `還原項目：${item.itemName}，狀態：${beforeStatus} → ${afterStatus}，餘額：${beforeBalance} → ${afterBalance}`,
        success,
        beforeState: { status: beforeStatus, count: beforeCount, balance: beforeBalance },
        afterState: { status: afterStatus, count: afterCount, balance: afterBalance },
      });
      
      return success;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'REVERT',
        details: `還原失敗：${error}`,
        success: false,
      });
      return false;
    }
  }

  // 執行隨機操作
  private async executeRandomOperation(round: number): Promise<boolean> {
    const operations = [
      { op: () => this.operationCreate(round), weight: 30 },      // 30% 機率創建
      { op: () => this.operationAddMoney(round), weight: 15 },   // 15% 機率加款
      { op: () => this.operationSubtractMoney(round), weight: 15 }, // 15% 機率扣款
      { op: () => this.operationEdit(round), weight: 10 },       // 10% 機率編輯
      { op: () => this.operationRetrieve(round), weight: 15 },   // 15% 機率領取
      { op: () => this.operationRevert(round), weight: 15 },     // 15% 機率還原
    ];
    
    const totalWeight = operations.reduce((sum, o) => sum + o.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const { op, weight } of operations) {
      random -= weight;
      if (random <= 0) {
        return await op();
      }
    }
    
    return await operations[0].op();
  }

  // 數據一致性檢查
  private checkDataConsistency(): { consistent: boolean; issues: string[] } {
    const issues: string[] = [];
    const allItems = this.getAllItems();
    
    allItems.forEach((item: DepositItemV2, index: number) => {
      // 檢查1: 金額項目必須有餘額欄位
      if (item.types.includes('money')) {
        if (item.currentBalance === undefined) {
          issues.push(`項目[${index}]: 寄錢類型但無餘額欄位`);
        }
        if (!item.transactions) {
          issues.push(`項目[${index}]: 寄錢類型但無交易記錄`);
        }
      }
      
      // 檢查2: 日誌完整性
      if (!item.logs || item.logs.length === 0) {
        issues.push(`項目[${index}]: 無日誌記錄`);
      }
      
      // 檢查3: 取消項目必須有取消時間和人員
      if (item.status === 'cancelled') {
        if (!item.cancelledAt) {
          issues.push(`項目[${index}]: 已取消但無取消時間`);
        }
        if (!item.cancelledBy) {
          issues.push(`項目[${index}]: 已取消但無取消人`);
        }
      }
      
      // 檢查4: 領取項目必須有領取時間
      if (item.status === 'retrieved' && !item.retrievedAt) {
        issues.push(`項目[${index}]: 已領取但無領取時間`);
      }
      
      // 檢查5: 餘額計算正確性（對寄錢項目）
      if (item.types.includes('money') && item.transactions) {
        const calculatedBalance = item.transactions.reduce((sum: number, t: any) => {
          return t.type === 'add' ? sum + t.amount : sum - t.amount;
        }, 0);
        
        // 對於已還原項目，餘額應為0，且交易總和也應為0（因為包含了返還交易）
        // 對於活動/已領取項目，餘額應等於交易總和
        if (calculatedBalance !== (item.currentBalance || 0)) {
          issues.push(`項目[${index}]: 餘額計算不匹配（記錄總和：${calculatedBalance}，當前餘額：${item.currentBalance}）`);
        }
      }
    });
    
    return { consistent: issues.length === 0, issues };
  }

  // 延遲函數
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 生成測試報告
  private generateReport(): string[] {
    const report: string[] = [];
    const allItems = this.getAllItems();
    const activeItems = this.getActiveItems();
    const completedItems = allItems.filter((i: DepositItemV2) => i.status === 'retrieved');
    const cancelledItems = allItems.filter((i: DepositItemV2) => i.status === 'cancelled');
    const moneyItems = allItems.filter((i: DepositItemV2) => i.types.includes('money'));
    
    report.push('\n' + '='.repeat(60));
    report.push('📊 100次操作測試報告');
    report.push('='.repeat(60));
    
    report.push('\n📈 操作統計：');
    report.push(`   總操作次數: 100`);
    report.push(`   成功操作: ${this.successCount}`);
    report.push(`   失敗操作: ${this.errorCount}`);
    report.push(`   成功率: ${((this.successCount / 100) * 100).toFixed(1)}%`);
    
    report.push('\n📦 數據統計：');
    report.push(`   總項目數: ${allItems.length}`);
    report.push(`   活動項目: ${activeItems.length}`);
    report.push(`   已領取: ${completedItems.length}`);
    report.push(`   已還原: ${cancelledItems.length}`);
    report.push(`   寄錢項目: ${moneyItems.length}`);
    
    // 操作類型統計
    const opStats: Record<string, number> = {};
    this.operationLog.forEach(log => {
      opStats[log.operation] = (opStats[log.operation] || 0) + 1;
    });
    
    report.push('\n🔧 操作類型分布：');
    Object.entries(opStats).forEach(([op, count]) => {
      const successCount = this.operationLog.filter(l => l.operation === op && l.success).length;
      report.push(`   ${op}: ${count}次 (成功${successCount}次)`);
    });
    
    // 數據一致性檢查
    const consistency = this.checkDataConsistency();
    report.push('\n🔍 數據一致性檢查：');
    if (consistency.consistent) {
      report.push('   ✅ 所有數據一致，無異常');
    } else {
      report.push(`   ❌ 發現${consistency.issues.length}個問題：`);
      consistency.issues.forEach(issue => report.push(`      - ${issue}`));
    }
    
    // 餘額統計
    if (moneyItems.length > 0) {
      const totalBalance = moneyItems.reduce((sum: number, i: DepositItemV2) => sum + (i.currentBalance || 0), 0);
      const positiveBalance = moneyItems.filter((i: DepositItemV2) => (i.currentBalance || 0) > 0).length;
      const negativeBalance = moneyItems.filter((i: DepositItemV2) => (i.currentBalance || 0) < 0).length;
      
      report.push('\n💰 金額統計：');
      report.push(`   總餘額: $${totalBalance.toLocaleString()}`);
      report.push(`   正餘額項目: ${positiveBalance}個`);
      report.push(`   負餘額項目: ${negativeBalance}個`);
    }
    
    report.push('\n' + '='.repeat(60));
    
    return report;
  }

  // 執行100次測試
  async runStressTest(): Promise<string[]> {
    this.testResults = [];
    this.operationLog = [];
    this.createdItemIds = [];
    this.errorCount = 0;
    this.successCount = 0;
    
    this.testResults.push('🚀 開始執行100次隨機操作測試...');
    this.testResults.push(`⏰ 開始時間: ${new Date().toLocaleString()}`);
    this.testResults.push('');
    
    // 先執行20輪基礎測試確保系統正常
    this.testResults.push('📝 階段1: 執行基礎功能測試（20輪）...');
    const baseSimulator = new DepositTestSimulator(this.dispatch, this.getState, this.buildings, this.units);
    const baseResults = await baseSimulator.runAllTests();
    const baseSuccess = baseResults.filter(r => r.includes('✅')).length;
    this.testResults.push(`   基礎測試結果: ${baseSuccess}/20 通過`);
    
    if (baseSuccess < 15) {
      this.testResults.push('   ❌ 基礎測試失敗過多，中止壓力測試');
      return this.testResults;
    }
    
    this.testResults.push('');
    this.testResults.push('🔥 階段2: 執行100次隨機操作測試...');
    this.testResults.push('');
    
    // 執行100次隨機操作
    for (let i = 1; i <= 100; i++) {
      await this.executeRandomOperation(i);
      
      // 每10輪輸出進度
      if (i % 10 === 0) {
        this.testResults.push(`   完成 ${i}/100 次操作...`);
      }
    }
    
    this.testResults.push('');
    this.testResults.push('✅ 100次操作執行完成！');
    
    // 生成詳細報告
    const report = this.generateReport();
    this.testResults.push(...report);
    
    // 自動清理壓力測試數據
    this.testResults.push('\n🧹 開始自動清理壓力測試數據...');
    await this.cleanupStressTestData();
    
    return this.testResults;
  }

  // 自動清理壓力測試數據
  private async cleanupStressTestData(): Promise<void> {
    try {
      const allItems = this.getAllItems();
      let cleanedCount = 0;
      
      // 查找所有壓力測試創建的項目（寄件人或收件人名稱包含[壓測]前墜）
      for (const item of allItems) {
        const isStressTestItem = 
          item.sender.name.includes('[壓測]') || 
          item.receiver.name.includes('[壓測]');
        
        if (isStressTestItem && item.status === 'active') {
          // 對活動項目執行還原操作（確保金額返還並標記為取消）
          this.dispatch(depositV2Actions.revertDepositItem({
            id: item.id,
            staffName: '壓力測試自動清理',
          }));
          cleanedCount++;
          await this.delay(10); // 給予一點延遲避免阻塞
        }
      }
      
      this.testResults.push(`   ✅ 已清理 ${cleanedCount} 個壓力測試項目`);
      
      // 統計最終數據狀態
      const remainingActive = this.getActiveItems().filter(
        (i: DepositItemV2) => 
          i.sender.name.includes('[壓測]') || 
          i.receiver.name.includes('[壓測]')
      ).length;
      
      if (remainingActive > 0) {
        this.testResults.push(`   ⚠️ 仍有 ${remainingActive} 個壓力測試項目未清理（可能已還原或狀態異常）`);
      } else {
        this.testResults.push('   ✅ 所有壓力測試項目已清理完成');
      }
    } catch (error) {
      this.testResults.push(`   ❌ 清理過程中發生錯誤: ${error}`);
    }
  }

  // 獲取詳細操作日誌
  getOperationLog(): typeof this.operationLog {
    return this.operationLog;
  }
}

export default DepositStressTest;
