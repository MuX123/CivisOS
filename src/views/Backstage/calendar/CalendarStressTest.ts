import { calendarActions } from '../../../store/modules/calendar';
import { CalendarEvent } from '../../../types/domain';

export class CalendarStressTest {
  private dispatch: any;
  private getState: any;
  private testResults: string[] = [];

  constructor(dispatch: any, getState: any) {
    this.dispatch = dispatch;
    this.getState = getState;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 產生隨機日期 (前後 6 個月內)
  private getRandomDate(startOffsetMonths: number = -6, endOffsetMonths: number = 6): Date {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + startOffsetMonths, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + endOffsetMonths + 1, 0);
    const timeDiff = end.getTime() - start.getTime();
    return new Date(start.getTime() + Math.random() * timeDiff);
  }

  // 產生隨機時間 (08:00 - 20:00)
  private getRandomTime(date: Date): { start: string; end: string } {
    const startHour = 8 + Math.floor(Math.random() * 10); // 08:00 - 18:00
    const durationHours = 1 + Math.floor(Math.random() * 3); // 1-3 hours
    
    const startDate = new Date(date);
    startDate.setHours(startHour, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(startHour + durationHours, 0, 0, 0);

    // Format to YYYY-MM-DD HH:mm
    const format = (d: Date) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    return {
        start: format(startDate),
        end: format(endDate)
    };
  }

  // 1. 產生大量單一事件
  private async simulateMassiveEvents(count: number): Promise<boolean> {
    try {
        this.testResults.push(`🚀 開始產生 ${count} 筆隨機事件...`);
        const categories = ['meeting', 'maintenance', 'activity', 'notice'];
        const locations = ['會議室A', '大廳', '中庭', '健身房', '管理室'];

        for (let i = 0; i < count; i++) {
            const date = this.getRandomDate();
            const { start, end } = this.getRandomTime(date);
            const category = categories[Math.floor(Math.random() * categories.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];

            const event: CalendarEvent = {
                id: `STRESS_${Date.now()}_${i}`,
                title: `[壓測] 事件 ${i + 1}`,
                description: `這是第 ${i + 1} 筆壓力測試產生的事件內容。`,
                start: start, // Corrected property name from startTime
                end: end,     // Corrected property name from endTime
                category: category as any, // Cast to any because the string literals might not match exactly if strict
                location: location,
                allDay: Math.random() > 0.9, // Corrected property name from isAllDay
                color: ['#FF5733', '#33FF57', '#3357FF', '#F333FF'][Math.floor(Math.random() * 4)],
            };

            this.dispatch(calendarActions.addEvent(event));
            
            // 每 50 筆休息一下，避免卡死 UI
            if (i % 50 === 0) await this.delay(10);
        }

        this.testResults.push(`✅ 已成功產生 ${count} 筆事件`);
        return true;
    } catch (error) {
        this.testResults.push(`❌ 產生事件失敗: ${error}`);
        return false;
    }
  }

  // 2. 產生密集事件 (單日多事件)
  private async simulateDenseEvents(dayCount: number, eventsPerDay: number): Promise<boolean> {
      try {
          this.testResults.push(`🚀 開始在 ${dayCount} 個日期產生密集事件 (每日 ${eventsPerDay} 筆)...`);
          
          for (let i = 0; i < dayCount; i++) {
              const date = this.getRandomDate(-1, 1); // 集中在前後一個月
              
              for (let j = 0; j < eventsPerDay; j++) {
                  const { start, end } = this.getRandomTime(date);
                  
                  const event: CalendarEvent = {
                      id: `STRESS_DENSE_${Date.now()}_${i}_${j}`,
                      title: `[壓測] 密集事件 ${i}-${j}`,
                      start: start, // Corrected property name
                      end: end,     // Corrected property name
                      category: 'community', // Valid category
                      color: '#FF0000', // 紅色標示
                  };
                  this.dispatch(calendarActions.addEvent(event));
              }
              await this.delay(20);
          }

          this.testResults.push(`✅ 密集事件產生完成`);
          return true;
      } catch (error) {
          this.testResults.push(`❌ 產生密集事件失敗: ${error}`);
          return false;
      }
  }

  // 執行完整測試 - 30次基準
  public async runTest(): Promise<string[]> {
    this.testResults = [];
    this.testResults.push('=== 行事曆系統壓力測試開始 (30次基準) ===');
    this.testResults.push(`⏰ 開始時間: ${new Date().toLocaleString()}`);

    // 測試 1: 隨機分佈的大量事件 (30輪)
    await this.simulateMassiveEvents(30);

    // 測試 2: 特定日期的密集事件 (測試渲染堆疊)
    await this.simulateDenseEvents(5, 20); // 5天，每天20個事件

    this.testResults.push('=== 測試結束 ===');
    return this.testResults;
  }

  // 30次基準測試 - 產生30筆事件
  private async simulateMassiveEvents30(): Promise<boolean> {
    return this.simulateMassiveEvents(30);
  }
}
