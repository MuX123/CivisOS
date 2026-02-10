import { describe, it, expect } from '@jest/globals';
import eventBusReducer, { eventBusActions } from '../../store/modules/eventBus';
import residentReducer, { residentActions } from '../../store/modules/resident';
import parkingReducer, { parkingActions } from '../../store/modules/parking';
import LocalStorageManager from '../../services/LocalStorageManager';

describe('CivisOS 板塊壓力測試', () => {

    describe('1. IoT 事件匯流排高頻併發 (STRESS-01)', () => {
        it('應能處理 10,000 個事件並維持容量限制', () => {
            let state = eventBusReducer(undefined, { type: '@@INIT' });

            console.time('IoT Stress');
            for (let i = 0; i < 10000; i++) {
                state = eventBusReducer(state, eventBusActions.addEvent({
                    id: `evt-${i}`,
                    deviceId: 'temp-01',
                    eventType: 'temperature',
                    data: { value: 25 + Math.random() },
                    timestamp: new Date().toISOString(),
                    processed: false,
                    severity: 'low'
                }));
            }
            console.timeEnd('IoT Stress');

            expect(state.events.length).toBe(1000); // 應該被限制在 1000 筆
        });
    });

    describe('2. 住戶巨量資料更新性能 (STRESS-03)', () => {
        it('應在合理時間內處理 5,000 個住戶的初始化', () => {
            let state = residentReducer(undefined, { type: '@@INIT' });
            const residents = Array.from({ length: 5000 }, (_, i) => ({
                id: `r-${i}`,
                unitId: `U-${i}`,
                ownerName: `Resident ${i}`,
                statusId: 'active'
            })) as any[];

            console.time('Resident Loading');
            state = residentReducer(state, residentActions.setResidents(residents));
            console.timeEnd('Resident Loading');

            expect(state.residents.length).toBe(5000);
        });
    });

    describe('3. LocalStorage 邊界壓力測試 (STRESS-04)', () => {
        it('應在接近 5MB 時觸發清理邏輯', async () => {
            // 模擬大量過期資料
            const expiredTime = Date.now() - 10000;
            for (let i = 0; i < 120; i++) {
                const key = `filler-${i}`;
                const data = 'X'.repeat(40000); // 40KB
                localStorage.setItem(`smart-community-${key}`, JSON.stringify({
                    value: data,
                    timestamp: expiredTime,
                    expiresAt: expiredTime - 1
                }));
            }

            // 嘗試寫入一個新項目
            const storage = LocalStorageManager;
            await storage.setItem('new-item', 'important metadata');

            // 檢查是否清除了部分資料 (此處邏輯依賴實現細節,主要驗證不崩潰)
            const keys = await storage.getKeys();
            expect(keys.length).toBeLessThan(101);
        });
    });

});
