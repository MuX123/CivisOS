import { facilityActions } from '../../../store/modules/facility';
import { Facility, FacilityBookingV2, FacilityBooking } from '../../../types/domain';

// 公設預約系統壓力測試 - 30次基準
export class FacilityStressTest {
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

  // 隨機公設名稱
  private getRandomFacilityName(): string {
    const names = ['游泳池', '健身房', '會議室', 'KTV室', '桌球室', '羽球場', '籃球場', '閱覽室', '多功能廳', '烤肉區'];
    return names[Math.floor(Math.random() * names.length)];
  }

  // 隨機公設類型
  private getRandomFacilityType(): string {
    const types = ['recreation', 'fitness', 'meeting', 'sports', 'other'];
    return types[Math.floor(Math.random() * types.length)];
  }

  // 隨機預約類型
  private getRandomBookingType(): 'resident' | 'other' {
    return Math.random() > 0.3 ? 'resident' : 'other';
  }

  // 隨機預約時段
  private getRandomTimeSlot(): { startTime: string; endTime: string } {
    const startHour = 8 + Math.floor(Math.random() * 12); // 08:00 - 19:00
    const duration = 1 + Math.floor(Math.random() * 3); // 1-4小時
    const endHour = startHour + duration;
    return {
      startTime: `${String(startHour).padStart(2, '0')}:00`,
      endTime: `${String(endHour).padStart(2, '0')}:00`,
    };
  }

  // 隨機預約日期
  private getRandomBookingDate(): string {
    const today = new Date();
    const offset = Math.floor(Math.random() * 30) - 15; // 前15天到後15天
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return date.toISOString();
  }

  // 操作1: 創建公設
  private async operationCreateFacility(round: number): Promise<boolean> {
    try {
      const facility: Facility = {
        id: `STRESS_FACILITY_${Date.now()}_${round}`,
        name: `[壓測]${this.getRandomFacilityName()}-${round}`,
        type: this.getRandomFacilityType() as any,
        capacity: 5 + Math.floor(Math.random() * 20),
        location: `${Math.floor(Math.random() * 5) + 1}樓`,
        description: `[壓測]第${round}輪測試公設`,
        buildingId: this.getRandomBuildingAndUnit().buildingId,
        operatingHours: { start: '09:00', end: '22:00' },
        status: Math.random() > 0.2 ? 'available' : 'maintenance',
        hourlyRate: 50 + Math.floor(Math.random() * 20) * 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.dispatch(facilityActions.addFacility(facility));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_FACILITY',
        details: `創建公設: ${facility.name} (容量:${facility.capacity})`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_FACILITY',
        details: `創建公設失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作2: 更新公設
  private async operationUpdateFacility(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const facilities: Facility[] = state.facility?.facilities || [];
      
      if (facilities.length === 0) {
        this.operationLog.push({
          round,
          operation: 'UPDATE_FACILITY',
          details: '跳過：無可用公設',
          success: true,
        });
        return true;
      }

      const facility = facilities[Math.floor(Math.random() * facilities.length)];
      const newCapacity = 5 + Math.floor(Math.random() * 30);
      const newRate = 50 + Math.floor(Math.random() * 20) * 10;

      this.dispatch(facilityActions.updateFacility({
        id: facility.id,
        updates: { 
          capacity: newCapacity, 
          hourlyRate: newRate,
          description: `[壓測]更新-${round}`,
        },
      }));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_FACILITY',
        details: `更新公設: ${facility.name} (容量:${newCapacity},費率:${newRate})`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_FACILITY',
        details: `更新公設失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作3: 創建預約
  private async operationCreateBooking(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const facilities: Facility[] = state.facility?.facilities || [];
      
      if (facilities.length === 0) {
        this.operationLog.push({
          round,
          operation: 'CREATE_BOOKING',
          details: '跳過：無可用公設',
          success: true,
        });
        return true;
      }

      const facility = facilities[Math.floor(Math.random() * facilities.length)];
      const bookingType = this.getRandomBookingType();
      const { unitNumber, buildingId, unitId } = this.getRandomBuildingAndUnit();
      const { startTime, endTime } = this.getRandomTimeSlot();
      const bookingDate = this.getRandomBookingDate();

      const booking: FacilityBookingV2 = {
        id: `STRESS_BOOKING_${Date.now()}_${round}`,
        facilityId: facility.id,
        facility: facility,
        bookingType: bookingType,
        residentBuildingId: bookingType === 'resident' ? buildingId : undefined,
        residentFloorId: bookingType === 'resident' ? `floor_${Math.floor(Math.random() * 5)}` : undefined,
        residentUnitId: bookingType === 'resident' ? unitId : undefined,
        residentName: bookingType === 'resident' ? `[壓測]住戶${round}-${unitNumber}` : undefined,
        otherName: bookingType === 'other' ? `[壓測]訪客${round}` : undefined,
        bookingDate: bookingDate,
        startTime: startTime,
        endTime: endTime,
        staffName: `管理員${String.fromCharCode(65 + (round % 26))}`,
        paymentStatus: Math.random() > 0.5 ? 'paid' : 'unpaid',
        bookingStatus: 'confirmed',
        notes: `[壓測]第${round}輪預約`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.dispatch(facilityActions.createBooking(booking));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_BOOKING',
        details: `創建預約: ${facility.name} (${startTime}-${endTime})`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_BOOKING',
        details: `創建預約失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作4: 更新付款狀態
  private async operationUpdatePayment(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const bookings: FacilityBookingV2[] = state.facility?.bookings || [];
      const unpaidBookings = bookings.filter(b => b.paymentStatus === 'unpaid');
      
      if (unpaidBookings.length === 0) {
        this.operationLog.push({
          round,
          operation: 'UPDATE_PAYMENT',
          details: '跳過：無未付款預約',
          success: true,
        });
        return true;
      }

      const booking = unpaidBookings[Math.floor(Math.random() * unpaidBookings.length)];

      this.dispatch(facilityActions.setPaymentStatus({
        id: booking.id,
        status: 'paid',
      }));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_PAYMENT',
        details: `付款完成: ${booking.facility?.name || '未知公設'}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_PAYMENT',
        details: `更新付款失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作5: 取消預約
  private async operationCancelBooking(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const bookings: FacilityBookingV2[] = state.facility?.bookings || [];
      const activeBookings = bookings.filter(b => b.bookingStatus === 'confirmed');
      
      if (activeBookings.length === 0) {
        this.operationLog.push({
          round,
          operation: 'CANCEL_BOOKING',
          details: '跳過：無可取消預約',
          success: true,
        });
        return true;
      }

      const booking = activeBookings[Math.floor(Math.random() * activeBookings.length)];

      this.dispatch(facilityActions.cancelBooking(booking.id));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'CANCEL_BOOKING',
        details: `取消預約: ${booking.facility?.name || '未知公設'}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'CANCEL_BOOKING',
        details: `取消預約失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作6: 刪除預約
  private async operationDeleteBooking(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const bookings: FacilityBookingV2[] = state.facility?.bookings || [];
      
      if (bookings.length === 0) {
        this.operationLog.push({
          round,
          operation: 'DELETE_BOOKING',
          details: '跳過：無可刪除預約',
          success: true,
        });
        return true;
      }

      const booking = bookings[Math.floor(Math.random() * bookings.length)];

      this.dispatch(facilityActions.softDeleteBooking(booking.id));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'DELETE_BOOKING',
        details: `刪除預約: ${booking.facility?.name || '未知公設'}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'DELETE_BOOKING',
        details: `刪除預約失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作7: 編輯預約
  private async operationEditBooking(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const bookings: FacilityBookingV2[] = state.facility?.bookings || [];
      
      if (bookings.length === 0) {
        this.operationLog.push({
          round,
          operation: 'EDIT_BOOKING',
          details: '跳過：無可編輯預約',
          success: true,
        });
        return true;
      }

      const booking = bookings[Math.floor(Math.random() * bookings.length)];
      const { startTime, endTime } = this.getRandomTimeSlot();

      this.dispatch(facilityActions.updateBooking({
        id: booking.id,
        updates: {
          startTime: startTime,
          endTime: endTime,
          notes: `[壓測]編輯-${round}`,
        },
      }));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'EDIT_BOOKING',
        details: `編輯預約: ${booking.facility?.name || '未知公設'} (${startTime}-${endTime})`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'EDIT_BOOKING',
        details: `編輯預約失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 執行隨機操作
  private async executeRandomOperation(round: number): Promise<boolean> {
    const operations = [
      { op: () => this.operationCreateFacility(round), weight: 15 },
      { op: () => this.operationUpdateFacility(round), weight: 10 },
      { op: () => this.operationCreateBooking(round), weight: 25 },
      { op: () => this.operationUpdatePayment(round), weight: 15 },
      { op: () => this.operationCancelBooking(round), weight: 10 },
      { op: () => this.operationDeleteBooking(round), weight: 10 },
      { op: () => this.operationEditBooking(round), weight: 15 },
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
    const facilities: Facility[] = state.facility?.facilities || [];
    const bookings: FacilityBookingV2[] = state.facility?.bookings || [];

    // 檢查1: 所有預約的facilityId必須對應存在的facility
    bookings.forEach((booking, index) => {
      if (!facilities.find(f => f.id === booking.facilityId)) {
        issues.push(`預約[${index}]: ${booking.id} 的facilityId無對應公設`);
      }
    });

    // 檢查2: resident類型預約必須有residentName
    bookings.forEach((booking, index) => {
      if (booking.bookingType === 'resident' && !booking.residentName) {
        issues.push(`預約[${index}]: ${booking.id} 為住戶類型但無姓名`);
      }
    });

    // 檢查3: other類型預約必須有otherName
    bookings.forEach((booking, index) => {
      if (booking.bookingType === 'other' && !booking.otherName) {
        issues.push(`預約[${index}]: ${booking.id} 為訪客類型但無姓名`);
      }
    });

    // 檢查4: 檢查預約時間合理性
    bookings.forEach((booking, index) => {
      if (booking.startTime >= booking.endTime) {
        issues.push(`預約[${index}]: ${booking.id} 結束時間早於開始時間`);
      }
    });

    return { consistent: issues.length === 0, issues };
  }

  // 生成測試報告
  private generateReport(): string[] {
    const report: string[] = [];
    const state = this.getState();
    const facilities: Facility[] = state.facility?.facilities || [];
    const bookings: FacilityBookingV2[] = state.facility?.bookings || [];

    const confirmedCount = bookings.filter(b => b.bookingStatus === 'confirmed').length;
    const cancelledCount = bookings.filter(b => b.bookingStatus === 'cancelled').length;
    const deletedCount = bookings.filter(b => b.bookingStatus === 'deleted').length;
    const paidCount = bookings.filter(b => b.paymentStatus === 'paid').length;
    const unpaidCount = bookings.filter(b => b.paymentStatus === 'unpaid').length;

    report.push('\n' + '='.repeat(60));
    report.push('📊 公設預約系統壓力測試報告 (30次基準)');
    report.push('='.repeat(60));

    report.push('\n📈 操作統計：');
    report.push(`   總操作次數: ${this.TEST_ITERATIONS}`);
    report.push(`   成功操作: ${this.successCount}`);
    report.push(`   失敗操作: ${this.errorCount}`);
    report.push(`   成功率: ${((this.successCount / (this.successCount + this.errorCount)) * 100).toFixed(1)}%`);

    report.push('\n🏢 公設統計：');
    report.push(`   總公設數: ${facilities.length}`);
    report.push(`   可用公設: ${facilities.filter(f => f.status === 'available').length}`);
    report.push(`   維護中: ${facilities.filter(f => f.status === 'maintenance').length}`);

    report.push('\n📅 預約統計：');
    report.push(`   總預約數: ${bookings.length}`);
    report.push(`   已確認: ${confirmedCount}`);
    report.push(`   已取消: ${cancelledCount}`);
    report.push(`   已刪除: ${deletedCount}`);
    report.push(`   已付款: ${paidCount}`);
    report.push(`   未付款: ${unpaidCount}`);

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
      const facilities: Facility[] = state.facility?.facilities || [];
      const bookings: FacilityBookingV2[] = state.facility?.bookings || [];
      let cleanedCount = 0;

      // 刪除預約
      for (const booking of bookings) {
        if (booking.notes?.includes('[壓測]') || 
            booking.residentName?.includes('[壓測]') || 
            booking.otherName?.includes('[壓測]')) {
          this.dispatch(facilityActions.deleteBookingPermanent(booking.id));
          cleanedCount++;
          await this.delay(10);
        }
      }

      // 刪除公設
      for (const facility of facilities) {
        if (facility.name?.includes('[壓測]') || facility.description?.includes('[壓測]')) {
          this.dispatch(facilityActions.deleteFacility(facility.id));
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

    this.testResults.push('🚀 開始公設預約系統壓力測試 (30次基準)...');
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

export default FacilityStressTest;
