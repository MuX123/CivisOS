import { parkingActions, ParkingSpaceType } from '../../../store/modules/parking';
import { ParkingSpace, ParkingArea, ParkingZoneConfig, ParkingStats } from '../../../types/domain';

// 停車管理系統壓力測試 - 30次基準
export class ParkingStressTest {
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

  // 獲取隨機棟和戶
  private getRandomBuildingAndUnit(): { buildingId: string; unitId: string; unitNumber: string } {
    if (this.buildings.length === 0 || this.units.length === 0) {
      return { buildingId: 'B1', unitId: 'U1', unitNumber: 'A101' };
    }
    const building = this.buildings[Math.floor(Math.random() * this.buildings.length)];
    const buildingUnits = this.units.filter((u) => u.buildingId === building.id);
    const unit = buildingUnits.length > 0
      ? buildingUnits[Math.floor(Math.random() * buildingUnits.length)]
      : null;
    return {
      buildingId: building.id,
      unitId: unit?.id || 'U1',
      unitNumber: unit?.unitNumber || 'A101',
    };
  }

  // 隨機車位類型
  private getRandomSpaceType(): string {
    const types = ['resident', 'visitor', 'reserved', 'disabled'];
    return types[Math.floor(Math.random() * types.length)];
  }

  // 隨機車位狀態
  private getRandomStatus(): 'available' | 'occupied' | 'reserved' | 'maintenance' {
    const statuses: ('available' | 'occupied' | 'reserved' | 'maintenance')[] = 
      ['available', 'occupied', 'reserved', 'maintenance'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  // 隨機車牌
  private getRandomLicensePlate(): string {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '0123456789';
    const prefix = letters[Math.floor(Math.random() * letters.length)] +
                   letters[Math.floor(Math.random() * letters.length)] +
                   letters[Math.floor(Math.random() * letters.length)];
    const suffix = numbers[Math.floor(Math.random() * 10)] +
                   numbers[Math.floor(Math.random() * 10)] +
                   numbers[Math.floor(Math.random() * 10)] +
                   numbers[Math.floor(Math.random() * 10)];
    return `${prefix}-${suffix}`;
  }

  // 操作1: 創建車位分區
  private async operationCreateZone(round: number): Promise<boolean> {
    try {
      const zoneNames = ['住戶A區', '住戶B區', '訪客區', '機車區', '貴賓區'];
      const zoneTypes = ['resident', 'visitor', 'motorcycle', 'reserved'];
      
      const zone: ParkingZoneConfig = {
        id: `STRESS_ZONE_${Date.now()}_${round}`,
        name: `[壓測]${zoneNames[Math.floor(Math.random() * zoneNames.length)]}-${round}`,
        variableName: `zone_${round}_${Math.floor(Math.random() * 1000)}`,
        spaceCount: 5 + Math.floor(Math.random() * 15), // 5-20個車位
        startNumber: 1,
        type: zoneTypes[Math.floor(Math.random() * zoneTypes.length)] as any,
        buildingId: this.getRandomBuildingAndUnit().buildingId,
        floorId: `floor_${Math.floor(Math.random() * 3)}`,
        sortOrder: round,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.dispatch(parkingActions.addZone(zone));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_ZONE',
        details: `創建分區: ${zone.name} (${zone.spaceCount}車位)`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_ZONE',
        details: `創建分區失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作2: 創建車位
  private async operationCreateSpace(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const zones = state.parking?.zones || [];
      
      if (zones.length === 0) {
        this.operationLog.push({
          round,
          operation: 'CREATE_SPACE',
          details: '跳過：無可用分區',
          success: true,
        });
        return true;
      }

      const zone = zones[Math.floor(Math.random() * zones.length)];
      const spaceType = this.getRandomSpaceType();
      const status = this.getRandomStatus();
      
      const space: ParkingSpace = {
        id: `STRESS_SPACE_${Date.now()}_${round}`,
        number: `${zone.variableName}-${String(round).padStart(3, '0')}`,
        area: zone.id,
        type: spaceType as any,
        status: status,
        occupantType: status === 'occupied' ? 'resident_tenant' : undefined,
        occupantName: status === 'occupied' ? `[壓測]住戶${round}` : undefined,
        licensePlates: status === 'occupied' ? [
          { number: this.getRandomLicensePlate(), note: '主要車牌' },
        ] : [],
        monthlyFee: 2000 + Math.floor(Math.random() * 10) * 100,
        note: `[壓測]第${round}輪測試`,
      };

      this.dispatch(parkingActions.addParkingSpace(space));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_SPACE',
        details: `創建車位: ${space.number} (${status})`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_SPACE',
        details: `創建車位失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作3: 更新車位狀態
  private async operationUpdateSpaceStatus(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const spaces = state.parking?.spaces || [];
      
      if (spaces.length === 0) {
        this.operationLog.push({
          round,
          operation: 'UPDATE_STATUS',
          details: '跳過：無可用車位',
          success: true,
        });
        return true;
      }

      const space = spaces[Math.floor(Math.random() * spaces.length)];
      const newStatus = this.getRandomStatus();
      const beforeStatus = space.status;

      this.dispatch(parkingActions.updateSpaceStatus({
        id: space.id,
        status: newStatus,
        reason: `[壓測]第${round}輪狀態更新`,
      }));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_STATUS',
        details: `更新狀態: ${space.number} ${beforeStatus} → ${newStatus}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_STATUS',
        details: `更新狀態失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作4: 分配車位
  private async operationAssignSpace(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const spaces = state.parking?.spaces || [];
      const availableSpaces = spaces.filter((s: ParkingSpace) => s.status === 'available');
      
      if (availableSpaces.length === 0) {
        this.operationLog.push({
          round,
          operation: 'ASSIGN_SPACE',
          details: '跳過：無可用空車位',
          success: true,
        });
        return true;
      }

      const space = availableSpaces[Math.floor(Math.random() * availableSpaces.length)];
      const { unitId, unitNumber } = this.getRandomBuildingAndUnit();

      this.dispatch(parkingActions.assignParkingSpace({
        id: space.id,
        residentId: unitId,
        occupantType: 'resident_tenant',
        occupantName: `[壓測]承租人${round}`,
        licensePlates: [
          { number: this.getRandomLicensePlate(), note: '車牌1' },
          { number: this.getRandomLicensePlate(), note: '車牌2' },
        ],
        monthlyFee: 2000 + Math.floor(Math.random() * 1000),
      }));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'ASSIGN_SPACE',
        details: `分配車位: ${space.number} → ${unitNumber}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'ASSIGN_SPACE',
        details: `分配車位失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作5: 釋放車位
  private async operationReleaseSpace(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const spaces = state.parking?.spaces || [];
      const occupiedSpaces = spaces.filter((s: ParkingSpace) => s.status === 'occupied');
      
      if (occupiedSpaces.length === 0) {
        this.operationLog.push({
          round,
          operation: 'RELEASE_SPACE',
          details: '跳過：無已佔用車位',
          success: true,
        });
        return true;
      }

      const space = occupiedSpaces[Math.floor(Math.random() * occupiedSpaces.length)];

      this.dispatch(parkingActions.releaseParkingSpace(space.id));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'RELEASE_SPACE',
        details: `釋放車位: ${space.number}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'RELEASE_SPACE',
        details: `釋放車位失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作6: 編輯車位資訊
  private async operationEditSpace(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const spaces = state.parking?.spaces || [];
      
      if (spaces.length === 0) {
        this.operationLog.push({
          round,
          operation: 'EDIT_SPACE',
          details: '跳過：無可用車位',
          success: true,
        });
        return true;
      }

      const space = spaces[Math.floor(Math.random() * spaces.length)];
      const newNote = `[壓測]更新備註-${round}`;

      this.dispatch(parkingActions.updateParkingSpace({
        id: space.id,
        updates: { note: newNote, monthlyFee: 2000 + Math.floor(Math.random() * 2000) },
      }));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'EDIT_SPACE',
        details: `編輯車位: ${space.number}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'EDIT_SPACE',
        details: `編輯車位失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作7: 批量創建車位
  private async operationBatchCreateSpaces(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const zones = state.parking?.zones || [];
      
      if (zones.length === 0) {
        this.operationLog.push({
          round,
          operation: 'BATCH_CREATE',
          details: '跳過：無可用分區',
          success: true,
        });
        return true;
      }

      const zone = zones[Math.floor(Math.random() * zones.length)];
      const batchSize = 5 + Math.floor(Math.random() * 10); // 5-15個車位
      const newSpaces: ParkingSpace[] = [];

      for (let i = 0; i < batchSize; i++) {
        newSpaces.push({
          id: `STRESS_BATCH_${Date.now()}_${round}_${i}`,
          number: `${zone.variableName}-B${String(round).padStart(2, '0')}${String(i).padStart(2, '0')}`,
          area: zone.id,
          type: zone.type as any,
          status: 'available',
          note: `[壓測]批次創建`,
        });
      }

      this.dispatch(parkingActions.batchAddParkingSpaces(newSpaces));
      await this.delay(50);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'BATCH_CREATE',
        details: `批次創建: ${batchSize}個車位在${zone.name}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'BATCH_CREATE',
        details: `批次創建失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 執行隨機操作
  private async executeRandomOperation(round: number): Promise<boolean> {
    const operations = [
      { op: () => this.operationCreateZone(round), weight: 15 },
      { op: () => this.operationCreateSpace(round), weight: 25 },
      { op: () => this.operationUpdateSpaceStatus(round), weight: 15 },
      { op: () => this.operationAssignSpace(round), weight: 15 },
      { op: () => this.operationReleaseSpace(round), weight: 10 },
      { op: () => this.operationEditSpace(round), weight: 10 },
      { op: () => this.operationBatchCreateSpaces(round), weight: 10 },
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
    const spaces: ParkingSpace[] = state.parking?.spaces || [];
    const zones: ParkingZoneConfig[] = state.parking?.zones || [];

    // 檢查1: 所有車位的area必須對應存在的zone
    spaces.forEach((space, index) => {
      if (!zones.find(z => z.id === space.area)) {
        issues.push(`車位[${index}]: ${space.number} 的area無對應分區`);
      }
    });

    // 檢查2: occupied車位必須有承租人資訊
    spaces.forEach((space, index) => {
      if (space.status === 'occupied') {
        if (!space.occupantName) {
          issues.push(`車位[${index}]: ${space.number} 已佔用但無承租人`);
        }
      }
    });

    // 檢查3: 檢查車位編號唯一性
    const numbers = spaces.map(s => s.number);
    const uniqueNumbers = [...new Set(numbers)];
    if (numbers.length !== uniqueNumbers.length) {
      issues.push(`車位編號存在重複: ${numbers.length - uniqueNumbers.length}個重複`);
    }

    return { consistent: issues.length === 0, issues };
  }

  // 生成測試報告
  private generateReport(): string[] {
    const report: string[] = [];
    const state = this.getState();
    const spaces: ParkingSpace[] = state.parking?.spaces || [];
    const zones: ParkingZoneConfig[] = state.parking?.zones || [];

    const availableCount = spaces.filter(s => s.status === 'available').length;
    const occupiedCount = spaces.filter(s => s.status === 'occupied').length;
    const reservedCount = spaces.filter(s => s.status === 'reserved').length;
    const maintenanceCount = spaces.filter(s => s.status === 'maintenance').length;

    report.push('\n' + '='.repeat(60));
    report.push('📊 停車管理系統壓力測試報告 (30次基準)');
    report.push('='.repeat(60));

    report.push('\n📈 操作統計：');
    report.push(`   總操作次數: ${this.TEST_ITERATIONS}`);
    report.push(`   成功操作: ${this.successCount}`);
    report.push(`   失敗操作: ${this.errorCount}`);
    report.push(`   成功率: ${((this.successCount / (this.successCount + this.errorCount)) * 100).toFixed(1)}%`);

    report.push('\n🅿️ 車位統計：');
    report.push(`   總車位數: ${spaces.length}`);
    report.push(`   分區數: ${zones.length}`);
    report.push(`   可租用: ${availableCount}`);
    report.push(`   已佔用: ${occupiedCount}`);
    report.push(`   保留中: ${reservedCount}`);
    report.push(`   維護中: ${maintenanceCount}`);

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
      const spaces: ParkingSpace[] = state.parking?.spaces || [];
      let cleanedCount = 0;

      for (const space of spaces) {
        if (space.number?.includes('[壓測]') || space.note?.includes('[壓測]')) {
          this.dispatch(parkingActions.deleteParkingSpace(space.id));
          cleanedCount++;
          await this.delay(10);
        }
      }

      const zones: ParkingZoneConfig[] = state.parking?.zones || [];
      for (const zone of zones) {
        if (zone.name?.includes('[壓測]')) {
          this.dispatch(parkingActions.deleteZone(zone.id));
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

    this.testResults.push('🚀 開始停車管理系統壓力測試 (30次基準)...');
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

export default ParkingStressTest;
