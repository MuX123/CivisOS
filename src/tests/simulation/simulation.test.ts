import { describe, it, expect, beforeEach } from '@jest/globals';
import parkingReducer, { parkingActions } from '../../store/modules/parking';
import facilityReducer, { facilityActions } from '../../store/modules/facility';
import depositReducer, { depositV2Actions } from '../../store/modules/depositV2';
import feeReducer, { feeActions } from '../../store/modules/fee';
import residentReducer, { residentActions } from '../../store/modules/resident';
import { ResidentV2, ParkingSpace } from '../../types/domain';

describe('CivisOS 全功能模擬測試', () => {

    describe('1. 認證超時模擬 (TEST-CONFIG-01)', () => {
        it('應在 8 小時後自動過期 (MockAuth)', async () => {
            const mockUser = { id: 'test', email: 'test@test.com' };
            const expiredTimestamp = Date.now() - (8 * 60 * 60 * 1000 + 1000);

            localStorage.setItem('civisos_mock_user', JSON.stringify({
                user: mockUser,
                timestamp: expiredTimestamp
            }));

            // 重新加載服務 (模擬重啟)
            const { MockAuthService } = require('../../services/authService');
            const service = new MockAuthService();
            expect(await service.getCurrentUser()).toBeNull();
        });
    });

    describe('2. 停車配置模擬 (TEST-CONFIG-02)', () => {
        it('應能正確配置區域、分區與車位並執行連鎖刪除檢查', () => {
            let state = parkingReducer(undefined, { type: '@@INIT' });

            // 配置區域
            state = parkingReducer(state, parkingActions.addParkingArea({ id: 'area-1', name: '地下停車場', totalSpaces: 100, monthlyRate: 3000, visitorRate: 50 }));

            // 配置車位
            const space: ParkingSpace = { id: 's1', number: 'A01', area: 'area-1', status: 'occupied', type: 'resident' };
            state = parkingReducer(state, parkingActions.addParkingSpace(space));

            // 驗證級聯檢查 (不允許刪除佔用中車位)
            state = parkingReducer(state, parkingActions.deleteParkingSpace('s1'));
            expect(state.spaces.find(s => s.id === 's1')).toBeDefined();
            expect(state.error).toContain('使用中');
        });
    });

    describe('3. 設施預約流程模擬 (TEST-CONFIG-03)', () => {
        it('應能執行完整預約生命週期並阻斷非法修改', () => {
            let state = facilityReducer(undefined, { type: '@@INIT' });

            const booking = {
                id: 'b1',
                facilityId: 'f1',
                bookingDate: '2026-02-15',
                startTime: '10:00',
                endTime: '11:00',
                bookingStatus: 'confirmed',
                paymentStatus: 'unpaid' as const
            };

            state = facilityReducer(state, { type: 'facility/createBooking', payload: booking });

            // 模擬軟刪除 (取消)
            state = facilityReducer(state, facilityActions.cancelBooking('b1'));

            // 驗證取消後不可修改資料 (MEDIUM-10)
            state = facilityReducer(state, facilityActions.updateBooking({ id: 'b1', updates: { startTime: '12:00' } }));
            expect(state.bookings[0].startTime).toBe('10:00');
            expect(state.error).toContain('無法修改');
        });
    });

    describe('4. 押金管理流程模擬 (TEST-CONFIG-04)', () => {
        it('應正確處理還原時的金額平衡 (HIGH-12)', () => {
            let state = depositReducer(undefined, { type: '@@INIT' });

            const item = {
                id: 'd1',
                types: ['money'] as any[],
                itemName: '押金項目',
                status: 'active' as any,
                currentBalance: 500,
                transactions: [],
                logs: [],
                sender: { type: 'resident', name: '張三' },
                receiver: { type: 'external', name: '物管' }
            };

            state = { ...state, items: [item as any] };

            // 執行還原
            state = depositReducer(state, depositV2Actions.revertDepositItem({ id: 'd1', staffName: 'Admin' }));

            const revertedItem = state.items[0];
            expect(revertedItem.status).toBe('cancelled');
            expect(revertedItem.currentBalance).toBe(0);
            expect(revertedItem.transactions?.length).toBe(1);
            expect(revertedItem.transactions?.[0].type).toBe('subtract');
        });
    });

    describe('5. 管理費精度與狀態驗證 (TEST-CONFIG-05)', () => {
        it('應使用 Decimal 處理大額計算並防止非法狀態回退', () => {
            let state = feeReducer(undefined, { type: '@@INIT' });
            const unit = { id: 'u1', customArea: 33.3333, customPrice: 100.5, paymentStatus: 'paid' as any };
            state = { ...state, units: [unit as any], defaultArea: 30, defaultPricePerPing: 100 };

            // 驗證計算
            state = feeReducer(state, feeActions.calculateTotalFee('u1'));
            expect(state.units[0].totalFee).toBeCloseTo(3349.99665, 5);

            // 驗證狀態回退限制 (MEDIUM-23)
            state = feeReducer(state, feeActions.setPaymentStatus({ id: 'u1', status: 'unpaid' }));
            expect(state.units[0].paymentStatus).toBe('paid');
            expect(state.error).toContain('調整功能');
        });
    });

    describe('6. 住戶更新與級聯模擬 (TEST-CONFIG-06)', () => {
        it('應確保住戶更新不覆蓋既有 ID 並檢查狀態依賴', () => {
            let state = residentReducer(undefined, { type: '@@INIT' });

            const r1: ResidentV2 = { id: 'r1', unitId: '10A', statusId: 's-active', ownerName: '王五', ownerPhone: '0912345678', members: [], tenants: [], licensePlates: [], generalCards: [], etcCards: [], otherEtcCards: [], createdAt: '', updatedAt: '' };
            state = residentReducer(state, residentActions.upsertResident(r1));

            // 更新時應基於 ID 或 UnitId
            const update = { unitId: '10A', ownerName: '王五(更新)' } as any;
            state = residentReducer(state, residentActions.upsertResident(update));

            expect(state.residents.length).toBe(1);
            expect(state.residents[0].ownerName).toBe('王五(更新)');

            // 驗證狀態刪除級聯 (MEDIUM-15)
            state = residentReducer(state, residentActions.deleteStatus('s-active'));
            expect(state.error).toContain('仍有住戶使用');
        });
    });

});
