import { calendarActions } from '../../store/modules/calendar';
import { feeActions, FeeState, recalculateAllFees } from '../../store/modules/fee';
import { depositV2Actions, DepositItemV2, PersonInfo } from '../../store/modules/depositV2';
import { CalendarEvent, BuildingConfig, UnitConfig, FeeUnit } from '../../types/domain';
import { PaymentPeriod } from '../../types/fee';

export class YearlyUsageSimulator {
  private dispatch: any;
  private getState: any;
  private buildings: BuildingConfig[];
  private units: UnitConfig[];
  private year: number;
  private logs: string[] = [];

  constructor(dispatch: any, getState: any, buildings: BuildingConfig[], units: UnitConfig[], year: number = new Date().getFullYear()) {
    this.dispatch = dispatch;
    this.getState = getState;
    this.buildings = buildings;
    this.units = units;
    this.year = year;
  }

  private addLog(message: string) {
    this.logs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
    console.log(message);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getRandomDate(month: number): Date {
    const start = new Date(this.year, month, 1);
    const end = new Date(this.year, month + 1, 0);
    const timeDiff = end.getTime() - start.getTime();
    return new Date(start.getTime() + Math.random() * timeDiff);
  }

  // --- Calendar Simulation ---
  private async simulateCalendar(): Promise<void> {
    this.addLog(`📅 開始模擬 ${this.year} 年行事曆資料...`);
    const eventTypes = ['meeting', 'maintenance', 'activity', 'notice'];
    const locations = ['會議室A', '大廳', '中庭', '健身房', '管理室'];
    const titles = ['管委會月例會', '電梯保養', '社區大掃除', '消防安檢', '中秋晚會', '聖誕裝飾佈置', '包裹代收公告', '停水通知'];
    
    let count = 0;
    // 每個月產生 5-10 個事件
    for (let m = 0; m < 12; m++) {
      const eventsInMonth = 5 + Math.floor(Math.random() * 6);
      for (let i = 0; i < eventsInMonth; i++) {
        const date = this.getRandomDate(m);
        const startHour = 9 + Math.floor(Math.random() * 9); // 09:00 - 18:00
        
        const start = new Date(date);
        start.setHours(startHour, 0, 0, 0);
        
        const end = new Date(start);
        end.setHours(startHour + 1 + Math.floor(Math.random() * 2), 0, 0, 0);

        const format = (d: Date) => {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        };

        const event: CalendarEvent = {
          id: `SIM_${this.year}_${m}_${i}_${Date.now()}`,
          title: titles[Math.floor(Math.random() * titles.length)],
          description: `模擬產生的年度事件資料`,
          start: format(start),
          end: format(end),
          category: eventTypes[Math.floor(Math.random() * eventTypes.length)] as any,
          location: locations[Math.floor(Math.random() * locations.length)],
          allDay: Math.random() > 0.9,
          color: ['#FF5733', '#33FF57', '#3357FF', '#F333FF'][Math.floor(Math.random() * 4)],
        };

        this.dispatch(calendarActions.addEvent(event));
        count++;
      }
      await this.delay(20);
    }
    this.addLog(`✅ 行事曆模擬完成，共產生 ${count} 筆事件`);
  }

  // --- Fee Simulation ---
  private async simulateFees(): Promise<void> {
    this.addLog(`💰 開始模擬 ${this.year} 年管理費資料...`);
    
    // 1. 產生 12 個月的期數
    for (let m = 0; m < 12; m++) {
      const periodStr = `${this.year}-${String(m + 1).padStart(2, '0')}`;
      
      // 檢查是否已存在
      const state = this.getState() as { fee: FeeState };
      if (state.fee.periods.some(p => p.period === periodStr)) continue;

      const dueDate = new Date(this.year, m + 1, 15); // 次月 15 日

      const period: Omit<PaymentPeriod, 'id' | 'createdAt' | 'updatedAt'> = {
        period: periodStr,
        name: `${this.year}年${m + 1}月管理費`,
        dueDate: dueDate.toISOString(),
        isActive: true,
        note: '年度模擬產生',
        basePricePerPing: state.fee.defaultPricePerPing || 100,
        defaultSize: 30,
        baseFee: 30 * (state.fee.defaultPricePerPing || 100),
        additionalTotal: 0,
        additionalItems: [],
        unitFeeConfigs: [],
      };

      this.dispatch(feeActions.addPeriod(period));
      await this.delay(50);
    }
    this.addLog(`   已建立 ${this.year} 年所有繳費期數`);

    // 2. 模擬繳款 (只針對當前月份，避免歷史數據衝突)
    const state = this.getState() as { fee: FeeState };
    const currentMonthStr = `${this.year}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const activePeriod = state.fee.periods.find(p => p.period === currentMonthStr) || 
                         state.fee.periods[state.fee.periods.length - 1]; // Fallback to last period if current not found

    if (activePeriod) {
        let paidCount = 0;
        for (const unit of this.units) {
            // 90% 機率已繳款
            if (Math.random() > 0.1) {
               const amount = 3000; 
               const paymentDate = new Date();

               // Use a unique ID for simulation fee units
               const feeUnitId = `SIM_FEE_${activePeriod.period}_${unit.id}`;
               
               // 檢查是否已存在 (這裡假設一個單位只有一筆繳費資料，實際情況可能更複雜)
               // 為避免影響正常資料，我們只在沒有資料時新增
               const existing = state.fee.units.find(u => u.unitId === unit.id);
               
               if (existing) {
                   // 如果已存在，僅更新付款狀態 (如果是未付款)
                   if (existing.paymentStatus !== 'paid') {
                       this.dispatch(feeActions.updateFeeUnit({
                           id: existing.id,
                           updates: {
                               paymentStatus: 'paid',
                               lastPaymentDate: paymentDate.toISOString(),
                               paymentDate: paymentDate.toISOString(),
                               notes: '年度模擬自動繳款'
                           }
                       }));
                   }
               } else {
                   const newFeeUnit: FeeUnit = {
                        id: feeUnitId,
                        unitId: unit.id,
                        unit: unit as any,
                        area: 30, // 模擬
                        pricePerPing: 100,
                        totalFee: amount,
                        baseFee: amount,
                        additionalItems: [],
                        additionalTotal: 0,
                        notes: '年度模擬自動繳款',
                        paymentStatus: 'paid',
                        paymentDate: paymentDate.toISOString(),
                        lastPaymentDate: paymentDate.toISOString(),
                        isSpecial: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                   };
                   this.dispatch(feeActions.addFeeUnit(newFeeUnit));
               }
               paidCount++;
            }
        }
        this.addLog(`   已模擬本期 (${activePeriod.name}) ${paidCount} 戶繳款完成`);
    }
    
    this.addLog(`✅ 管理費模擬完成`);
  }

  // --- Deposit Simulation ---
  private async simulateDeposits(): Promise<void> {
    this.addLog(`📦 開始模擬 ${this.year} 年寄放物品資料...`);
    const items = ['包裹', '掛號信', '外送', '乾洗', '生鮮雜貨'];
    
    let count = 0;
    // 每個月約 20-30 筆
    for (let m = 0; m < 12; m++) {
      // 如果是未來月份，跳過
      if (this.year === new Date().getFullYear() && m > new Date().getMonth()) break;

      const itemsInMonth = 20 + Math.floor(Math.random() * 10);
      for (let i = 0; i < itemsInMonth; i++) {
        const date = this.getRandomDate(m);
        const itemName = items[Math.floor(Math.random() * items.length)];
        
        // 隨機住戶
        const unit = this.units[Math.floor(Math.random() * this.units.length)];
        if (!unit) continue;
        
        // 建立寄放項目
        // 確保 sender/receiver 結構完整，避免 UI 錯誤
        const sender: PersonInfo = { 
            type: 'external', 
            name: '物流司機',
            buildingId: undefined, // Explicitly undefined
            unitId: undefined 
        };
        
        const receiver: PersonInfo = { 
            type: 'resident', 
            name: `住戶-${unit.unitNumber || unit.id.slice(0, 4)}`, 
            buildingId: unit.buildingId, 
            unitId: unit.id 
        };

        const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
            types: ['item'],
            itemName: itemName,
            sender: sender,
            receiver: receiver,
            depositTime: date.toISOString(),
            staffName: '模擬管理員',
            status: 'active',
            transactions: [],
            currentBalance: 0,
            notes: '年度模擬',
        };

        this.dispatch(depositV2Actions.addDepositItem(item));
        count++;
      }
      await this.delay(20);
    }
    
    // 模擬領取：遍歷所有 active 且是模擬產生的項目，將其設為 retrieved
    // 這裡需要 getState
    const state = this.getState();
    const activeItems = (state.depositV2?.items || []).filter((i: DepositItemV2) => i.status === 'active' && i.notes === '年度模擬');
    
    for (const item of activeItems) {
        // 隨機領取時間 (寄放時間後 1-3 天)
        const depositTime = new Date(item.depositTime);
        const retrieveTime = new Date(depositTime.getTime() + (1 + Math.random() * 48) * 3600000);
        
        if (retrieveTime < new Date()) { // 只領取過去時間
            this.dispatch(depositV2Actions.retrieveDepositItem({
                id: item.id,
                staffName: '模擬住戶',
            }));
        }
        await this.delay(5);
    }

    this.addLog(`✅ 寄放物品模擬完成，共產生約 ${count} 筆資料`);
  }
  
  // --- Cleanup Simulation Data ---
  public async clearSimulationData(): Promise<void> {
      this.addLog('🧹 開始清除模擬資料...');
      
      // 1. Clear Calendar Events
      const state = this.getState();
      const simEvents = (state.calendar?.events || []).filter((e: CalendarEvent) => e.id.startsWith('SIM_'));
      for (const e of simEvents) {
          this.dispatch(calendarActions.deleteEvent(e.id));
      }
      this.addLog(`   已清除 ${simEvents.length} 筆行事曆模擬資料`);
      
      // 2. Clear Fee Periods & Units
      // Clean FeeUnits first
      const simFeeUnits = (state.fee?.units || []).filter((u: FeeUnit) => u.notes === '年度模擬自動繳款' || u.id.startsWith('SIM_FEE_'));
      for (const u of simFeeUnits) {
          this.dispatch(feeActions.deleteFeeUnit(u.id));
      }
       
      const simPeriods = (state.fee?.periods || []).filter((p: PaymentPeriod) => p.note === '年度模擬產生');
      for (const p of simPeriods) {
          this.dispatch(feeActions.deletePeriod(p.id));
      }
      this.addLog(`   已清除 ${simPeriods.length} 筆繳費期數與 ${simFeeUnits.length} 筆繳費紀錄`);
      
      // 3. Clear Deposit Items (Revert active, then they become cancelled. Or hard delete if we had delete action, but we only have revert/retrieve)
      // Since there is no "hard delete" action in depositV2, we might need to assume the user manually cleans up or we just revert them.
      // Wait, we can't hard delete from UI easily if store doesn't support it. 
      // But we can Revert them so they are cancelled.
      // Or if this is a development tool, maybe we should add a hard delete action to reducer?
      // For now, let's just Revert all 'active' simulation items.
      const simDeposits = (state.depositV2?.items || []).filter((i: DepositItemV2) => i.notes === '年度模擬');
      let clearedDeposits = 0;
      for (const item of simDeposits) {
          if (item.status === 'active') {
             this.dispatch(depositV2Actions.revertDepositItem({ id: item.id, staffName: '系統自動清除' }));
             clearedDeposits++;
          }
          // If retrieved or cancelled, they stay as history. To fully remove, we'd need a delete action.
      }
      this.addLog(`   已還原 ${clearedDeposits} 筆進行中的模擬寄放項目 (歷史紀錄保留)`);
      
      this.addLog('✨ 清除完成');
  }

  // --- Main Runner ---
  public async run(): Promise<string[]> {
    this.logs = [];
    this.addLog(`🚀 開始執行 ${this.year} 年度全系統模擬...`);
    
    try {
      await this.simulateCalendar();
      await this.simulateFees();
      await this.simulateDeposits();
      
      this.addLog(`🏁 年度模擬全數完成！`);
    } catch (error) {
      this.addLog(`❌ 模擬過程發生錯誤: ${error}`);
      console.error(error);
    }
    
    return this.logs;
  }
}
