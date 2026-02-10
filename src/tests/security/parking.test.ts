/**
 * 停車管理安全漏洞修復測試
 * 測試 CRITICAL-05
 */

import { describe, it, expect } from 'vitest';
import parkingReducer, { assignParkingSpace } from '../../../store/modules/parking';
import type { ParkingState } from '../../../store/modules/parking';

describe('停車管理安全測試', () => {
    const initialState: ParkingState = {
        spaces: [
            {
                id: 'space-1',
                area: 'A',
                number: '001',
                type: 'resident',
                status: 'available',
            },
            {
                id: 'space-2',
                area: 'A',
                number: '002',
                type: 'resident',
                status: 'occupied',
                residentId: 'resident-1',
                occupantName: '張三',
            },
            {
                id: 'space-3',
                area: 'A',
                number: '003',
                type: 'resident',
                status: 'reserved',
            },
            {
                id: 'space-4',
                area: 'A',
                number: '004',
                type: 'resident',
                status: 'maintenance',
            },
        ],
        areas: [],
        zones: [],
        spaceTypes: [],
        stats: {
            total: 4,
            occupied: 1,
            available: 1,
            reserved: 1,
            maintenance: 1,
            residentOccupied: 1,
            visitorOccupied: 0,
            monthlyRevenue: 0,
            dailyRevenue: 0,
        },
        loading: false,
        error: null,
    };

    describe('[CRITICAL-05] 車位狀態競爭條件', () => {
        it('應該成功分配可用車位', () => {
            const state = parkingReducer(
                initialState,
                assignParkingSpace({
                    id: 'space-1',
                    residentId: 'resident-2',
                    occupantName: '李四',
                })
            );

            expect(state.spaces[0].status).toBe('occupied');
            expect(state.spaces[0].residentId).toBe('resident-2');
            expect(state.spaces[0].occupantName).toBe('李四');
            expect(state.error).toBeNull();
        });

        it('應該拒絕分配已佔用的車位', () => {
            const state = parkingReducer(
                initialState,
                assignParkingSpace({
                    id: 'space-2',
                    residentId: 'resident-2',
                    occupantName: '李四',
                })
            );

            // 狀態應該保持不變
            expect(state.spaces[1].status).toBe('occupied');
            expect(state.spaces[1].residentId).toBe('resident-1');
            expect(state.spaces[1].occupantName).toBe('張三');

            // 應該設置錯誤訊息
            expect(state.error).not.toBeNull();
            expect(state.error).toContain('已被佔用');
        });

        it('應該拒絕分配保留中的車位', () => {
            const state = parkingReducer(
                initialState,
                assignParkingSpace({
                    id: 'space-3',
                    residentId: 'resident-2',
                })
            );

            expect(state.spaces[2].status).toBe('reserved');
            expect(state.error).not.toBeNull();
            expect(state.error).toContain('已被保留');
        });

        it('應該拒絕分配維護中的車位', () => {
            const state = parkingReducer(
                initialState,
                assignParkingSpace({
                    id: 'space-4',
                    residentId: 'resident-2',
                })
            );

            expect(state.spaces[3].status).toBe('maintenance');
            expect(state.error).not.toBeNull();
            expect(state.error).toContain('維護中');
        });

        it('成功分配後應該清除之前的錯誤', () => {
            // 先製造一個錯誤
            let state = parkingReducer(
                initialState,
                assignParkingSpace({
                    id: 'space-2',
                    residentId: 'resident-2',
                })
            );
            expect(state.error).not.toBeNull();

            // 再進行成功的分配
            state = parkingReducer(
                state,
                assignParkingSpace({
                    id: 'space-1',
                    residentId: 'resident-2',
                })
            );

            expect(state.error).toBeNull();
        });
    });
});
