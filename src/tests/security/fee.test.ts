/**
 * 管理費計算安全漏洞修復測試
 * 測試 HIGH-22
 */

import { describe, it, expect } from 'vitest';
import feeReducer, { calculateTotalFee } from '../../../store/modules/fee';
import type { FeeState } from '../../../store/modules/fee';
import Decimal from 'decimal.js';

describe('管理費計算安全測試', () => {
    const initialState: FeeState = {
        units: [
            {
                id: 'unit-1',
                unitId: 'unit-1',
                area: 0,
                pricePerPing: 0,
                totalFee: 0,
                baseFee: 0,
                paymentStatus: 'unpaid',
                additionalItems: [],
                additionalTotal: 0,
                isSpecial: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ],
        periods: [],
        baseConfigs: [],
        specialConfigs: [],
        defaultArea: 30,
        defaultPricePerPing: 50,
        loading: false,
        error: null,
    };

    describe('[HIGH-22] 金額計算精度', () => {
        it('應該使用 Decimal 進行精確計算', () => {
            const state = feeReducer(initialState, calculateTotalFee('unit-1'));

            // 使用 Decimal 計算
            const expected = new Decimal(30).times(new Decimal(50)).toNumber();

            expect(state.units[0].totalFee).toBe(expected);
            expect(state.units[0].totalFee).toBe(1500);
        });

        it('應該正確處理浮點數精度問題', () => {
            // 設置會產生浮點數精度問題的數值
            const stateWithCustom: FeeState = {
                ...initialState,
                units: [
                    {
                        ...initialState.units[0],
                        customArea: 0.1,
                        customPrice: 0.2,
                    },
                ],
            };

            const state = feeReducer(stateWithCustom, calculateTotalFee('unit-1'));

            // JavaScript 浮點數: 0.1 * 0.2 = 0.020000000000000004
            // Decimal: 0.1 * 0.2 = 0.02
            const expected = new Decimal(0.1).times(new Decimal(0.2)).toNumber();

            expect(state.units[0].totalFee).toBe(expected);
            expect(state.units[0].totalFee).toBe(0.02);
        });

        it('應該正確計算大額費用', () => {
            const stateWithLarge: FeeState = {
                ...initialState,
                units: [
                    {
                        ...initialState.units[0],
                        customArea: 100.5,
                        customPrice: 88.8,
                    },
                ],
            };

            const state = feeReducer(stateWithLarge, calculateTotalFee('unit-1'));

            const expected = new Decimal(100.5).times(new Decimal(88.8)).toNumber();

            expect(state.units[0].totalFee).toBe(expected);
            expect(state.units[0].totalFee).toBe(8924.4);
        });

        it('應該正確處理小數點後多位的計算', () => {
            const stateWithPrecise: FeeState = {
                ...initialState,
                units: [
                    {
                        ...initialState.units[0],
                        customArea: 33.333,
                        customPrice: 66.666,
                    },
                ],
            };

            const state = feeReducer(stateWithPrecise, calculateTotalFee('unit-1'));

            const expected = new Decimal(33.333).times(new Decimal(66.666)).toNumber();

            expect(state.units[0].totalFee).toBe(expected);
            // 精確值應該是 2221.977778
            expect(state.units[0].totalFee).toBeCloseTo(2221.977778, 6);
        });

        it('應該使用預設值當沒有自訂值時', () => {
            const state = feeReducer(initialState, calculateTotalFee('unit-1'));

            expect(state.units[0].area).toBe(30);
            expect(state.units[0].pricePerPing).toBe(50);
            expect(state.units[0].totalFee).toBe(1500);
        });

        it('應該使用自訂值覆蓋預設值', () => {
            const stateWithCustom: FeeState = {
                ...initialState,
                units: [
                    {
                        ...initialState.units[0],
                        customArea: 40,
                        customPrice: 60,
                    },
                ],
            };

            const state = feeReducer(stateWithCustom, calculateTotalFee('unit-1'));

            expect(state.units[0].area).toBe(40);
            expect(state.units[0].pricePerPing).toBe(60);
            expect(state.units[0].totalFee).toBe(2400);
        });

        it('應該正確處理零值', () => {
            const stateWithZero: FeeState = {
                ...initialState,
                units: [
                    {
                        ...initialState.units[0],
                        customArea: 0,
                        customPrice: 50,
                    },
                ],
            };

            const state = feeReducer(stateWithZero, calculateTotalFee('unit-1'));

            expect(state.units[0].totalFee).toBe(0);
        });

        it('Decimal 計算應該避免 JavaScript 浮點數問題', () => {
            // 驗證 JavaScript 浮點數問題
            const jsResult = 0.1 + 0.2;
            expect(jsResult).not.toBe(0.3); // JavaScript 問題
            expect(jsResult).toBeCloseTo(0.3, 10);

            // 驗證 Decimal 正確性
            const decimalResult = new Decimal(0.1).plus(new Decimal(0.2)).toNumber();
            expect(decimalResult).toBe(0.3); // Decimal 正確
        });

        it('應該正確處理連續計算', () => {
            let state = initialState;

            // 第一次計算
            state = feeReducer(state, calculateTotalFee('unit-1'));
            expect(state.units[0].totalFee).toBe(1500);

            // 修改數值後再次計算
            state = {
                ...state,
                units: [
                    {
                        ...state.units[0],
                        customArea: 35,
                    },
                ],
            };

            state = feeReducer(state, calculateTotalFee('unit-1'));
            expect(state.units[0].totalFee).toBe(1750);
        });
    });
});
