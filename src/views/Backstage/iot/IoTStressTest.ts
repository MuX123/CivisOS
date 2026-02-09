import { eventBusActions } from '../../../store/modules/eventBus';

// IoT事件匯流排壓力測試 - 30次基準
export class IoTStressTest {
  private dispatch: any;
  private getState: any;
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

  constructor(dispatch: any, getState: any) {
    this.dispatch = dispatch;
    this.getState = getState;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 隨機裝置名稱
  private getRandomDeviceName(): string {
    const prefixes = ['溫度感測器', '濕度感測器', '門禁讀卡機', '攝影機', '電表', '水表', '煙霧偵測器', '智慧插座', '紅外線感應器', '空氣品質監測器'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${Math.floor(Math.random() * 100)}`;
  }

  // 隨機裝置類型
  private getRandomDeviceType(): 'sensor' | 'actuator' | 'camera' | 'access_control' | 'meter' {
    const types: ('sensor' | 'actuator' | 'camera' | 'access_control' | 'meter')[] = 
      ['sensor', 'actuator', 'camera', 'access_control', 'meter'];
    return types[Math.floor(Math.random() * types.length)];
  }

  // 隨機裝置狀態
  private getRandomDeviceStatus(): 'online' | 'offline' | 'error' | 'maintenance' {
    const statuses: ('online' | 'offline' | 'error' | 'maintenance')[] = 
      ['online', 'online', 'online', 'offline', 'error', 'maintenance']; // 增加online的權重
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  // 隨機事件類型
  private getRandomEventType(deviceType: string): string {
    const eventMap: Record<string, string[]> = {
      sensor: ['temperature_change', 'humidity_change', 'motion_detected', 'data_report'],
      actuator: ['command_executed', 'status_changed', 'action_completed'],
      camera: ['motion_detected', 'recording_started', 'recording_stopped', 'alert_triggered'],
      access_control: ['card_swiped', 'access_granted', 'access_denied', 'door_opened', 'door_closed'],
      meter: ['reading_reported', 'threshold_exceeded', 'usage_alert'],
    };
    const events = eventMap[deviceType] || ['status_update'];
    return events[Math.floor(Math.random() * events.length)];
  }

  // 隨機嚴重程度
  private getRandomSeverity(): 'low' | 'medium' | 'high' | 'critical' {
    const severities: ('low' | 'medium' | 'high' | 'critical')[] = 
      ['low', 'low', 'low', 'medium', 'medium', 'high', 'critical']; // 增加low的權重
    return severities[Math.floor(Math.random() * severities.length)];
  }

  // 操作1: 創建裝置
  private async operationCreateDevice(round: number): Promise<boolean> {
    try {
      const deviceType = this.getRandomDeviceType();
      const device = {
        id: `STRESS_DEVICE_${Date.now()}_${round}`,
        name: `[壓測]${this.getRandomDeviceName()}`,
        type: deviceType,
        location: `${Math.floor(Math.random() * 5) + 1}樓`,
        unitId: Math.random() > 0.7 ? `unit_${Math.floor(Math.random() * 100)}` : undefined,
        status: this.getRandomDeviceStatus(),
        lastSeen: new Date().toISOString(),
        data: this.generateDeviceData(deviceType),
        configuration: {
          interval: 60,
          threshold: 100,
          sensitivity: 'medium',
        },
      };

      this.dispatch(eventBusActions.addDevice(device));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_DEVICE',
        details: `創建裝置: ${device.name} (${deviceType})`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_DEVICE',
        details: `創建裝置失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 生成裝置數據
  private generateDeviceData(deviceType: string): Record<string, any> {
    switch (deviceType) {
      case 'sensor':
        return {
          temperature: 20 + Math.random() * 15,
          humidity: 40 + Math.random() * 40,
          battery: 50 + Math.random() * 50,
        };
      case 'meter':
        return {
          reading: Math.floor(Math.random() * 10000),
          delta: Math.floor(Math.random() * 100),
          unit: 'kWh',
        };
      case 'camera':
        return {
          isRecording: Math.random() > 0.5,
          resolution: '1080p',
          fps: 30,
        };
      case 'access_control':
        return {
          doorStatus: Math.random() > 0.5 ? 'locked' : 'unlocked',
          lastAccess: new Date().toISOString(),
          accessCount: Math.floor(Math.random() * 1000),
        };
      default:
        return {
          status: 'active',
          lastUpdate: new Date().toISOString(),
        };
    }
  }

  // 操作2: 更新裝置狀態
  private async operationUpdateDeviceStatus(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const devices = state.eventBus?.devices || [];
      
      if (devices.length === 0) {
        this.operationLog.push({
          round,
          operation: 'UPDATE_DEVICE_STATUS',
          details: '跳過：無可用裝置',
          success: true,
        });
        return true;
      }

      const device = devices[Math.floor(Math.random() * devices.length)];
      const newStatus = this.getRandomDeviceStatus();

      this.dispatch(eventBusActions.setDeviceStatus({
        id: device.id,
        status: newStatus,
        lastSeen: new Date().toISOString(),
      }));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_DEVICE_STATUS',
        details: `更新狀態: ${device.name} → ${newStatus}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_DEVICE_STATUS',
        details: `更新裝置狀態失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作3: 更新裝置數據
  private async operationUpdateDeviceData(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const devices = state.eventBus?.devices || [];
      const onlineDevices = devices.filter((d: any) => d.status === 'online');
      
      if (onlineDevices.length === 0) {
        this.operationLog.push({
          round,
          operation: 'UPDATE_DEVICE_DATA',
          details: '跳過：無線上裝置',
          success: true,
        });
        return true;
      }

      const device = onlineDevices[Math.floor(Math.random() * onlineDevices.length)];

      this.dispatch(eventBusActions.updateDeviceData({
        deviceId: device.id,
        data: this.generateDeviceData(device.type),
      }));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_DEVICE_DATA',
        details: `更新數據: ${device.name}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_DEVICE_DATA',
        details: `更新裝置數據失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作4: 創建事件
  private async operationCreateEvent(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const devices = state.eventBus?.devices || [];
      
      if (devices.length === 0) {
        // 如果沒有裝置，先創建一個
        await this.operationCreateDevice(round);
        return true;
      }

      const device = devices[Math.floor(Math.random() * devices.length)];
      const severity = this.getRandomSeverity();

      const event = {
        id: `STRESS_EVENT_${Date.now()}_${round}`,
        deviceId: device.id,
        eventType: this.getRandomEventType(device.type),
        timestamp: new Date().toISOString(),
        data: {
          message: `[壓測]第${round}輪事件`,
          value: Math.floor(Math.random() * 100),
          unit: 'unit',
        },
        processed: false,
        severity: severity,
      };

      this.dispatch(eventBusActions.addEvent(event));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_EVENT',
        details: `創建事件: ${device.name} (${event.eventType}, ${severity})`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'CREATE_EVENT',
        details: `創建事件失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作5: 處理事件
  private async operationProcessEvent(round: number): Promise<boolean> {
    try {
      const state = this.getState();
      const events = state.eventBus?.events || [];
      const unprocessedEvents = events.filter((e: any) => !e.processed);
      
      if (unprocessedEvents.length === 0) {
        this.operationLog.push({
          round,
          operation: 'PROCESS_EVENT',
          details: '跳過：無未處理事件',
          success: true,
        });
        return true;
      }

      const event = unprocessedEvents[Math.floor(Math.random() * unprocessedEvents.length)];

      this.dispatch(eventBusActions.processEvent(event.id));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'PROCESS_EVENT',
        details: `處理事件: ${event.eventType}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'PROCESS_EVENT',
        details: `處理事件失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作6: 更新連線狀態
  private async operationUpdateConnection(round: number): Promise<boolean> {
    try {
      const statuses: ('connecting' | 'connected' | 'disconnected' | 'error')[] = 
        ['connecting', 'connected', 'connected', 'connected', 'disconnected', 'error'];
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

      this.dispatch(eventBusActions.setConnectionStatus(newStatus));
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_CONNECTION',
        details: `更新連線: ${newStatus}`,
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_CONNECTION',
        details: `更新連線狀態失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 操作7: 更新心跳
  private async operationUpdateHeartbeat(round: number): Promise<boolean> {
    try {
      this.dispatch(eventBusActions.updateHeartbeat());
      await this.delay(20);

      this.successCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_HEARTBEAT',
        details: '更新心跳',
        success: true,
      });
      return true;
    } catch (error) {
      this.errorCount++;
      this.operationLog.push({
        round,
        operation: 'UPDATE_HEARTBEAT',
        details: `更新心跳失敗: ${error}`,
        success: false,
      });
      return false;
    }
  }

  // 執行隨機操作
  private async executeRandomOperation(round: number): Promise<boolean> {
    const operations = [
      { op: () => this.operationCreateDevice(round), weight: 20 },
      { op: () => this.operationUpdateDeviceStatus(round), weight: 15 },
      { op: () => this.operationUpdateDeviceData(round), weight: 15 },
      { op: () => this.operationCreateEvent(round), weight: 25 },
      { op: () => this.operationProcessEvent(round), weight: 15 },
      { op: () => this.operationUpdateConnection(round), weight: 5 },
      { op: () => this.operationUpdateHeartbeat(round), weight: 5 },
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
    const devices = state.eventBus?.devices || [];
    const events = state.eventBus?.events || [];

    // 檢查1: 所有事件的deviceId必須對應存在的device
    events.forEach((event: any, index: number) => {
      if (!devices.find((d: any) => d.id === event.deviceId)) {
        issues.push(`事件[${index}]: ${event.id} 的deviceId無對應裝置`);
      }
    });

    // 檢查2: 檢查裝置狀態合理性
    devices.forEach((device: any, index: number) => {
      const validStatuses = ['online', 'offline', 'error', 'maintenance'];
      if (!validStatuses.includes(device.status)) {
        issues.push(`裝置[${index}]: ${device.name} 狀態無效 (${device.status})`);
      }
    });

    // 檢查3: 檢查事件嚴重程度
    events.forEach((event: any, index: number) => {
      const validSeverities = ['low', 'medium', 'high', 'critical'];
      if (!validSeverities.includes(event.severity)) {
        issues.push(`事件[${index}]: ${event.id} 嚴重程度無效 (${event.severity})`);
      }
    });

    return { consistent: issues.length === 0, issues };
  }

  // 生成測試報告
  private generateReport(): string[] {
    const report: string[] = [];
    const state = this.getState();
    const devices = state.eventBus?.devices || [];
    const events = state.eventBus?.events || [];

    const onlineCount = devices.filter((d: any) => d.status === 'online').length;
    const offlineCount = devices.filter((d: any) => d.status === 'offline').length;
    const errorCount = devices.filter((d: any) => d.status === 'error').length;
    const maintenanceCount = devices.filter((d: any) => d.status === 'maintenance').length;
    const processedEvents = events.filter((e: any) => e.processed).length;
    const unprocessedEvents = events.filter((e: any) => !e.processed).length;

    report.push('\n' + '='.repeat(60));
    report.push('📊 IoT事件匯流排壓力測試報告 (30次基準)');
    report.push('='.repeat(60));

    report.push('\n📈 操作統計：');
    report.push(`   總操作次數: ${this.TEST_ITERATIONS}`);
    report.push(`   成功操作: ${this.successCount}`);
    report.push(`   失敗操作: ${this.errorCount}`);
    report.push(`   成功率: ${((this.successCount / (this.successCount + this.errorCount)) * 100).toFixed(1)}%`);

    report.push('\n🔌 裝置統計：');
    report.push(`   總裝置數: ${devices.length}`);
    report.push(`   線上: ${onlineCount}`);
    report.push(`   離線: ${offlineCount}`);
    report.push(`   錯誤: ${errorCount}`);
    report.push(`   維護中: ${maintenanceCount}`);

    report.push('\n📡 事件統計：');
    report.push(`   總事件數: ${events.length}`);
    report.push(`   已處理: ${processedEvents}`);
    report.push(`   未處理: ${unprocessedEvents}`);

    // 裝置類型分布
    const deviceTypeStats: Record<string, number> = {};
    devices.forEach((d: any) => {
      deviceTypeStats[d.type] = (deviceTypeStats[d.type] || 0) + 1;
    });
    report.push('\n🔧 裝置類型分布：');
    Object.entries(deviceTypeStats).forEach(([type, count]) => {
      report.push(`   ${type}: ${count}個`);
    });

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
      const devices = state.eventBus?.devices || [];
      const events = state.eventBus?.events || [];
      let cleanedCount = 0;

      // 刪除壓力測試裝置
      for (const device of devices) {
        if (device.name?.includes('[壓測]')) {
          this.dispatch(eventBusActions.removeDevice(device.id));
          cleanedCount++;
          await this.delay(10);
        }
      }

      // 清理壓力測試事件
      this.dispatch(eventBusActions.clearEvents());

      this.testResults.push(`   ✅ 已清理 ${cleanedCount} 個壓力測試裝置`);
      this.testResults.push(`   ✅ 已清除所有事件`);
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

    this.testResults.push('🚀 開始IoT事件匯流排壓力測試 (30次基準)...');
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

export default IoTStressTest;
