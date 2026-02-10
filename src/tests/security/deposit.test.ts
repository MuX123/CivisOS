/**
 * 押金管理安全漏洞修復測試
 * 測試 CRITICAL-11
 */

import { describe, it, expect } from 'vitest';
import depositReducer, { subtractMoney } from '../../../store/modules/depositV2';
import type { DepositState } from '../../../store/modules/depositV2';

describe('押金管理安全測試', () => {
    const initialState: DepositState = {
        items: [
            {
                id: 'deposit-1',
                unitId: 'unit-1',
                types: ['money'],
                itemName: '押金',
                sender: '張三',
                receiver: '管理員',
                status: 'active',
                currentBalance: 1000,
                transactions: [],
                logs: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'deposit-2',
                unitId: 'unit-2',
                types: ['money'],
                itemName: '押金',
                sender: '李四',
                receiver: '管理員',
                status: 'active',
                currentBalance: 300,
                transactions: [],
                logs: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ],
        loading: false,
        error: null,
    };

    describe('[CRITICAL-11] 扣款餘額檢查', () => {
        it('應該成功扣款當餘額充足', () => {
            const state = depositReducer(
                initialState,
                subtractMoney({
                    id: 'deposit-1',
                    amount: 500,
                    staffName: '管理員',
                })
            );

            expect(state.items[0].currentBalance).toBe(500);
            expect(state.items[0].transactions).toHaveLength(1);
            expect(state.items[0].transactions![0].type).toBe('subtract');
            expect(state.items[0].transactions![0].amount).toBe(500);
            expect(state.error).toBeNull();
        });

        it('應該拒絕扣款當餘額不足', () => {
            const state = depositReducer(
                initialState,
                subtractMoney({
                    id: 'deposit-2',
                    amount: 500,
                    staffName: '管理員',
                })
            );

            // 餘額應該保持不變
            expect(state.items[1].currentBalance).toBe(300);

            // 不應該新增交易記錄
            expect(state.items[1].transactions).toHaveLength(0);

            // 應該設置錯誤訊息
            expect(state.error).not.toBeNull();
            expect(state.error).toContain('餘額不足');

            // 應該記錄失敗日誌
            expect(state.items[1].logs.length).toBeGreaterThan(0);
            const lastLog = state.items[1].logs[state.items[1].logs.length - 1];
            expect(lastLog.details).toContain('扣款失敗');
        });

        it('應該成功扣款當餘額剛好', () => {
            const state = depositReducer(
                initialState,
                subtractMoney({
                    id: 'deposit-2',
                    amount: 300,
                    staffName: '管理員',
                })
            );

            expect(state.items[1].currentBalance).toBe(0);
            expect(state.error).toBeNull();
        });

        it('應該拒絕扣款當餘額為零', () => {
            // 先將餘額扣到零
            let state = depositReducer(
                initialState,
                subtractMoney({
                    id: 'deposit-2',
                    amount: 300,
                    staffName: '管理員',
                })
            );

            // 再嘗試扣款
            state = depositReducer(
                state,
                subtractMoney({
                    id: 'deposit-2',
                    amount: 100,
                    staffName: '管理員',
                })
            );

            expect(state.items[1].currentBalance).toBe(0);
            expect(state.error).not.toBeNull();
        });

        it('不應該接受 skipCheck 參數 (型別測試)', () => {
            // 這個測試確保 TypeScript 不允許傳遞 skipCheck 參數
            // @ts-expect-error - skipCheck 參數應該不存在
            const action = subtractMoney({
                id: 'deposit-1',
                amount: 500,
                staffName: '管理員',
                skipCheck: true, // 這應該產生型別錯誤
            });

            // 即使傳遞了 skipCheck,也應該執行餘額檢查
            const state = depositReducer(initialState, action);

            // 這個測試主要是為了確保型別系統的正確性
            expect(state).toBeDefined();
        });

        it('成功扣款後應該清除之前的錯誤', () => {
            // 先製造一個錯誤
            let state = depositReducer(
                initialState,
                subtractMoney({
                    id: 'deposit-2',
                    amount: 500,
                    staffName: '管理員',
                })
            );
            expect(state.error).not.toBeNull();

            // 再進行成功的扣款
            state = depositReducer(
                state,
                subtractMoney({
                    id: 'deposit-2',
                    amount: 100,
                    staffName: '管理員',
                })
            );

            expect(state.error).toBeNull();
        });
    });
});
