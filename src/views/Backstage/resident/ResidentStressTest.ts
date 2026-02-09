import { residentActions } from '../../../store/modules/resident';
import { ResidentV2, ResidentStatus, Tenant } from '../../../types/domain';

// 住戶管理系統壓力測試 - 30次基準
export class ResidentStressTest {
  private dispatch: any;
  private getState: any;
  private buildings: any[];
  private units: any[];
  private testResults: string[] = [];
  private operationLog: Array<{
    round: number;
    operation: string;
    details: string;
    success: boolean;
  }> = [];
  private errorCount = 0;
  private successCount = 0;
  private readonly TEST_ITERATIONS = 30; // 基準：30次

  constructor(dispatch: any, getState: any, buildings: any[], units: any[]) {
    this.dispatch = dispatch;
    this.getState = getState;
    this.buildings = buildings;
    this.units = units;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 獲取隨機單位
  private getRandomUnit(): any {
    if (this.units.length === 0) {
      return { id: 'U1', unitNumber: 'A101', buildingId: 'B1' };
    }
    return this.units[Math.floor(Math.random() * this.units.length)];
  }

  // 隨機住戶姓名
  private getRandomResidentName(): string {
    const surnames = ['陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊', '許', '鄭', '謝', '洪', '郭', '邱', '曾', '廖', '賴', '徐'];
    const names = ['大偉', '志明', '淑芬', '雅婷', '家豪', '佳蓉', '志豪', '靜宜', '建宏', '佩珊', '承恩', '詩涵', '子軒', '怡君', '冠宇', '雅琪', '哲瑋', '美玲', '文傑', '婷婷'];
    return surnames[Math.floor(Math.random() * surnames.length)] + names[Math.floor(Math.random() * names.length)];
  }

  // 隨機手機號碼
  private getRandomPhone(): string {
    const prefix = ['0912', '0921', '0933', '0952', '0963', '0975', '0987'];
    const pre = prefix[Math.floor(Math.random() * prefix.length)];
    const suffix = Array(6).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
    return pre + suffix;
  }

  // 隨機車牌
  private getRandomLicensePlate(): string {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const prefix = letters[Math.floor(Math.random() * letters.length)] +
                   letters[Math.floor(Math.random() * letters.length)] +
                   letters[Math.floor(Math.random() * letters.length)];
    const numbers = Array(4).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
    return `${prefix}-${numbers}`;
  }

  // 隨機門禁卡號
  private getRandomCardNumber(): string {
    return Array(10).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
  }

  // 操作1: 創建住戶
  private async operationCreateResident(round: number): Promise<boolean> {
    try {
      const unit = this.getRandomUnit();
      const members: Tenant[] = [];
      const memberCount = 1 + Math.floor(Math.random() * 4); // 1-4人

      for (let i = 0; i < memberCount; i++) {
        members.push({
          id: `member_${Date.now()}_${round}_${i}`,
          name: this.getRandomResidentName(),
          phone: i === 0 ? this.getRandomPhone() : undefined,
        });
      }

      const resident: ResidentV2 = {
        id: `STRESS_RESIDENT_${Date.now()}_${round}`,
        unitId: unit.id,
        unit: unit,
        statusId: `status_${['owner', 'tenant', 'vacant', 'decoration'][Math.floor(Math.random() * 4)]}`,
        ownerName: members[0]?.name || this.getRandomResidentName(),
        ownerPhone: this.getRandomPhone(),
        ownerNotes: `[壓測]第${round}輪住戶`,
        members: members,
        tenants: Math.random() > 0.7 ? [{
          id: `tenant_${Date.now()}_${round}`,
          name: this.getRandomResidentName(),
          phone: this.getRandomPhone(),
        }] : [],
        licensePlates: Math.random() > 0.3 ? [
          this.getRandomLicensePlate(),
          ...(Math.random() > 0.5 ? [this.getRandomLicensePlate()] : []),
        ] : [],
        generalCards: Math.random() > 0.2 ? members.slice(0, 2).map((m, idx) => ({
          member: m.name,
          cardNumber: this.getRandomCardNumber(),
        })) : [],
        etcCards: [],
        otherEtcCards: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.dispatch(residentActions.upsertResident(resident));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_RESIDENT',
        details: `創建住戶: ${unit.unitNumber} (${memberCount}人)`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_RESIDENT',
        details: `創建住戶失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作2: 更新住戶
  private async operationUpdateResident(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const residents: ResidentV2[] = state.resident?.residents || [];
      
      if (residents.length === 0) {
        this.operationLog.push({
          round,
          operation: 'UPDATE_RESIDENT',
          details: '跳過：無可更新住戶',
          success: true,
        });
        return true;
      }

      const resident = residents[Math.floor(Math.random() * residents.length)];
      const newPhone = this.getRandomPhone();

      const updatedResident: ResidentV2 = {
        ...resident,
        ownerPhone: newPhone,
        ownerNotes: `[壓測]更新-${round}`,
        updatedAt: new Date().toISOString(),
      };

      this.dispatch(residentActions.upsertResident(updatedResident));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_RESIDENT',
        details: `更新住戶: ${resident.unit?.unitNumber || resident.unitId}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_RESIDENT',
        details: `更新住戶失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作3: 添加車牌
  private async operationAddLicensePlate(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const residents: ResidentV2[] = state.resident?.residents || [];
      
      if (residents.length === 0) {
        this.operationLog.push({
          round,
          operation: 'ADD_PLATE',
          details: '跳過：無可用住戶',
          success: true,
        });
        return true;
      }

      const resident = residents[Math.floor(Math.random() * residents.length)];
      const newPlate = this.getRandomLicensePlate();

      const updatedResident: ResidentV2 = {
        ...resident,
        licensePlates: [...(resident.licensePlates || []), newPlate],
        updatedAt: new Date().toISOString(),
      };

      this.dispatch(residentActions.upsertResident(updatedResident));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'ADD_PLATE',
        details: `添加車牌: ${resident.unit?.unitNumber || resident.unitId} (${newPlate})`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'ADD_PLATE',
        details: `添加車牌失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作4: 添加門禁卡
  private async operationAddCard(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const residents: ResidentV2[] = state.resident?.residents || [];
      
      if (residents.length === 0 || residents.filter(r => r.members?.length > 0).length === 0) {
        this.operationLog.push({
          round,
          operation: 'ADD_CARD',
          details: '跳過：無可用住戶或成員',
          success: true,
        });
        return true;
      }

      const residentsWithMembers = residents.filter(r => r.members?.length > 0);
      const resident = residentsWithMembers[Math.floor(Math.random() * residentsWithMembers.length)];
      const member = resident.members[Math.floor(Math.random() * resident.members.length)];

      const updatedResident: ResidentV2 = {
        ...resident,
        generalCards: [...(resident.generalCards || []), {
          member: member.name,
          cardNumber: this.getRandomCardNumber(),
        }],
        updatedAt: new Date().toISOString(),
      };

      this.dispatch(residentActions.upsertResident(updatedResident));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'ADD_CARD',
        details: `添加門禁卡: ${resident.unit?.unitNumber || resident.unitId} (${member.name})`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'ADD_CARD',
        details: `添加門禁卡失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作5: 添加承租人
  private async operationAddTenant(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const residents: ResidentV2[] = state.resident?.residents || [];
      
      if (residents.length === 0) {
        this.operationLog.push({
          round,
          operation: 'ADD_TENANT',
          details: '跳過：無可用住戶',
          success: true,
        });
        return true;
      }

      const resident = residents[Math.floor(Math.random() * residents.length)];

      const updatedResident: ResidentV2 = {
        ...resident,
        tenants: [...(resident.tenants || []), {
          id: `tenant_${Date.now()}_${round}`,
          name: this.getRandomResidentName(),
          phone: this.getRandomPhone(),
          notes: `[壓測]承租人`,
        }],
        updatedAt: new Date().toISOString(),
      };

      this.dispatch(residentActions.upsertResident(updatedResident));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'ADD_TENANT',
        details: `添加承租人: ${resident.unit?.unitNumber || resident.unitId}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'ADD_TENANT',
        details: `添加承租人失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作6: 添加家庭成員
  private async operationAddMember(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const residents: ResidentV2[] = state.resident?.residents || [];
      
      if (residents.length === 0) {
        this.operationLog.push({
          round,
          operation: 'ADD_MEMBER',
          details: '跳過：無可用住戶',
          success: true,
        });
        return true;
      }

      const resident = residents[Math.floor(Math.random() * residents.length)];

      const updatedResident: ResidentV2 = {
        ...resident,
        members: [...(resident.members || []), {
          id: `member_${Date.now()}_${round}`,
          name: this.getRandomResidentName(),
          phone: Math.random() > 0.5 ? this.getRandomPhone() : undefined,
        }],
        updatedAt: new Date().toISOString(),
      };

      this.dispatch(residentActions.upsertResident(updatedResident));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'ADD_MEMBER',
        details: `添加成員: ${resident.unit?.unitNumber || resident.unitId}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'ADD_MEMBER',
        details: `添加成員失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作7: 創建自定義狀態
  private async operationCreateStatus(round: number): Promise<boolean> {
    try {
      const statusNames = ['自住', '出租', '空屋', '裝潢中', '待售', '代管'];
      const colors = ['#10b981', '#f59e0b', '#9ca3af', '#8b5cf6', '#ec4899', '#06b6d4'];
      const idx = Math.floor(Math.random() * statusNames.length);

      const status: ResidentStatus = {
        id: `STRESS_STATUS_${Date.now()}_${round}`,
        name: `[壓測]${statusNames[idx]}-${round}`,
        color: colors[idx],
      };

      this.dispatch(residentActions.addStatus(status));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_STATUS',
        details: `創建狀態: ${status.name}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_STATUS',
        details: `創建狀態失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 執行隨機操作
  private async executeRandomOperation(round: number): Promise<boolean> {
    const operations = [
      { op: () => this.operationCreateResident(round), weight: 30 },
      { op: () => this.operationUpdateResident(round), weight: 15 },
      { op: () => this.operationAddLicensePlate(round), weight: 15 },
      { op: () => this.operationAddCard(round), weight: 15 },
      { op: () => this.operationAddTenant(round), weight: 10 },
      { op: () => this.operationAddMember(round), weight: 10 },
      { op: () => this.operationCreateStatus(round), weight: 5 },
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
    const state = this.getState();
    const residents: ResidentV2[] = state.resident?.residents || [];

    // 檢查1: 住戶必須有members
    residents.forEach((resident, index) => {
      if (!resident.members || resident.members.length === 0) {
        issues.push(`住戶[${index}]: ${resident.unitId} 無成員`);
      }
    });

    // 檢查2: 住戶必須有ownerName
    residents.forEach((resident, index) => {
      if (!resident.ownerName) {
        issues.push(`住戶[${index}]: ${resident.unitId} 無區權人姓名`);
      }
    });

    // 檢查3: 檢查unitId唯一性
    const unitIds = residents.map(r => r.unitId);
    const uniqueUnitIds = [...new Set(unitIds)];
    if (unitIds.length !== uniqueUnitIds.length) {
      issues.push(`住戶單位ID存在重複: ${unitIds.length - uniqueUnitIds.length}個重複`);
    }

    return { consistent: issues.length === 0, issues };
  }

  // 生成測試報告
  private generateReport(): string[] {
    const report: string[] = [];
    const state = this.getState();
    const residents: ResidentV2[] = state.resident?.residents || [];
    const statuses: ResidentStatus[] = state.resident?.statuses || [];

    const totalMembers = residents.reduce((sum, r) => sum + (r.members?.length || 0), 0);
    const totalTenants = residents.reduce((sum, r) => sum + (r.tenants?.length || 0), 0);
    const totalPlates = residents.reduce((sum, r) => sum + (r.licensePlates?.length || 0), 0);
    const totalCards = residents.reduce((sum, r) => sum + (r.generalCards?.length || 0), 0);

    report.push('\n' + '='.repeat(60));
    report.push('📊 住戶管理系統壓力測試報告 (30次基準)');
    report.push('='.repeat(60));

    report.push('\n📈 操作統計：');
    report.push(`   總操作次數: ${this.TEST_ITERATIONS}`);
    report.push(`   成功操作: ${this.successCount}`);
    report.push(`   失敗操作: ${this.errorCount}`);
    report.push(`   成功率: ${((this.successCount / (this.successCount + this.errorCount)) * 100).toFixed(1)}%`);

    report.push('\n👥 住戶統計：');
    report.push(`   總住戶數: ${residents.length}`);
    report.push(`   自定義狀態: ${statuses.length}`);

    report.push('\n🚗 車輛與門禁：');
    report.push(`   總成員數: ${totalMembers}`);
    report.push(`   總承租人數: ${totalTenants}`);
    report.push(`   總車牌數: ${totalPlates}`);
    report.push(`   總門禁卡數: ${totalCards}`);

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

    report.push('\n' + '='.repeat(60));

    return report;
  }

  // 自動清理壓力測試數據
  private async cleanupStressTestData(): Promise<void> {
    try {
      const state = this.getState();
      const residents: ResidentV2[] = state.resident?.residents || [];
      let cleanedCount = 0;

      // 清理壓力測試住戶
      for (const resident of residents) {
        if (resident.ownerNotes?.includes('[壓測]')) {
          // 標記為空屋
          const clearedResident: ResidentV2 = {
            ...resident,
            statusId: 'status_vacant',
            members: [],
            tenants: [],
            licensePlates: [],
            generalCards: [],
            etcCards: [],
            otherEtcCards: [],
            ownerNotes: '已清理壓力測試數據',
            updatedAt: new Date().toISOString(),
          };
          this.dispatch(residentActions.upsertResident(clearedResident));
          cleanedCount++;
          await this.delay(10);
        }
      }

      // 清理自定義狀態
      const statuses: ResidentStatus[] = state.resident?.statuses || [];
      for (const status of statuses) {
        if (status.name?.includes('[壓測]')) {
          this.dispatch(residentActions.deleteStatus(status.id as string));
          cleanedCount++;
          await this.delay(10);
        }
      }

      this.testResults.push(`   ✅ 已清理 ${cleanedCount} 個壓力測試項目`);
    } catch (error) {
      this.testResults.push(`   ❌ 清理過程中發生錯誤: ${error}`);
    }
  }

  // 執行30次壓力測試
  public async runStressTest(): Promise<string[]> {
    this.testResults = [];
    this.operationLog = [];
    this.errorCount = 0;
    this.successCount = 0;

    this.testResults.push('🚀 開始住戶管理系統壓力測試 (30次基準)...');
    this.testResults.push(`⏰ 開始時間: ${new Date().toLocaleString()}`);
    this.testResults.push('');

    // 執行30次隨機操作
    for (let i = 1; i <= this.TEST_ITERATIONS; i++) {
      await this.executeRandomOperation(i);

      // 每5輪輸出進度
      if (i % 5 === 0) {
        this.testResults.push(`   完成 ${i}/${this.TEST_ITERATIONS} 次操作...`);
      }
    }

    this.testResults.push('');
    this.testResults.push('✅ 30次操作執行完成！');

    // 生成詳細報告
    const report = this.generateReport();
    this.testResults.push(...report);

    // 自動清理
    this.testResults.push('\n🧹 開始自動清理壓力測試數據...');
    await this.cleanupStressTestData();

    return this.testResults;
  }

  public getOperationLog(): typeof this.operationLog {
    return this.operationLog;
  }
}

export default ResidentStressTest;
