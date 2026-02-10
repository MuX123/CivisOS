/**
 * 設施預約安全漏洞修復測試
 * 測試 HIGH-08 和 HIGH-09
 */

import { describe, it, expect } from 'vitest';
import facilityReducer, { createBooking, setPaymentStatus } from '../../../store/modules/facility';
import type { FacilityState } from '../../../store/modules/facility';
import type { FacilityBookingV2 } from '../../../types/domain';

describe('設施預約安全測試', () => {
    const createMockBooking = (overrides: Partial<FacilityBookingV2> = {}): FacilityBookingV2 => ({
        id: `booking-${Date.now()}`,
        facilityId: 'facility-1',
        bookingType: 'resident',
        residentBuildingId: 'building-1',
        residentUnitId: 'unit-1',
        residentName: '張三',
        bookingDate: '2026-02-10',
        startTime: '09:00',
        endTime: '11:00',
        staffName: '管理員',
        paymentStatus: 'unpaid',
        bookingStatus: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
    });

    const initialState: FacilityState = {
        facilities: [],
        bookings: [
            createMockBooking({
                id: 'booking-1',
                startTime: '09:00',
                endTime: '11:00',
            }),
        ],
        loading: false,
        error: null,
    };

    describe('[HIGH-08] 預約時間衝突檢查', () => {
        it('應該成功創建無衝突的預約', () => {
            const newBooking = createMockBooking({
                id: 'booking-2',
                startTime: '14:00',
                endTime: '16:00',
            });

            const state = facilityReducer(initialState, createBooking(newBooking));

            expect(state.bookings).toHaveLength(2);
            expect(state.error).toBeNull();
        });

        it('應該拒絕完全重疊的預約', () => {
            const newBooking = createMockBooking({
                id: 'booking-2',
                startTime: '09:00',
                endTime: '11:00',
            });

            const state = facilityReducer(initialState, createBooking(newBooking));

            expect(state.bookings).toHaveLength(1);
            expect(state.error).not.toBeNull();
            expect(state.error).toContain('該時段已被預約');
        });

        it('應該拒絕開始時間重疊的預約', () => {
            const newBooking = createMockBooking({
                id: 'booking-2',
                startTime: '10:00',
                endTime: '12:00',
            });

            const state = facilityReducer(initialState, createBooking(newBooking));

            expect(state.bookings).toHaveLength(1);
            expect(state.error).not.toBeNull();
        });

        it('應該拒絕結束時間重疊的預約', () => {
            const newBooking = createMockBooking({
                id: 'booking-2',
                startTime: '08:00',
                endTime: '10:00',
            });

            const state = facilityReducer(initialState, createBooking(newBooking));

            expect(state.bookings).toHaveLength(1);
            expect(state.error).not.toBeNull();
        });

        it('應該拒絕完全包含現有預約的新預約', () => {
            const newBooking = createMockBooking({
                id: 'booking-2',
                startTime: '08:00',
                endTime: '12:00',
            });

            const state = facilityReducer(initialState, createBooking(newBooking));

            expect(state.bookings).toHaveLength(1);
            expect(state.error).not.toBeNull();
        });

        it('應該允許不同設施的相同時間預約', () => {
            const newBooking = createMockBooking({
                id: 'booking-2',
                facilityId: 'facility-2', // 不同設施
                startTime: '09:00',
                endTime: '11:00',
            });

            const state = facilityReducer(initialState, createBooking(newBooking));

            expect(state.bookings).toHaveLength(2);
            expect(state.error).toBeNull();
        });

        it('應該允許相同設施不同日期的預約', () => {
            const newBooking = createMockBooking({
                id: 'booking-2',
                bookingDate: '2026-02-11', // 不同日期
                startTime: '09:00',
                endTime: '11:00',
            });

            const state = facilityReducer(initialState, createBooking(newBooking));

            expect(state.bookings).toHaveLength(2);
            expect(state.error).toBeNull();
        });

        it('應該允許預約已取消的時段', () => {
            const stateWithCancelled: FacilityState = {
                ...initialState,
                bookings: [
                    createMockBooking({
                        id: 'booking-1',
                        bookingStatus: 'cancelled',
                        startTime: '09:00',
                        endTime: '11:00',
                    }),
                ],
            };

            const newBooking = createMockBooking({
                id: 'booking-2',
                startTime: '09:00',
                endTime: '11:00',
            });

            const state = facilityReducer(stateWithCancelled, createBooking(newBooking));

            expect(state.bookings).toHaveLength(2);
            expect(state.error).toBeNull();
        });

        it('應該允許預約已刪除的時段', () => {
            const stateWithDeleted: FacilityState = {
                ...initialState,
                bookings: [
                    createMockBooking({
                        id: 'booking-1',
                        bookingStatus: 'deleted',
                        startTime: '09:00',
                        endTime: '11:00',
                    }),
                ],
            };

            const newBooking = createMockBooking({
                id: 'booking-2',
                startTime: '09:00',
                endTime: '11:00',
            });

            const state = facilityReducer(stateWithDeleted, createBooking(newBooking));

            expect(state.bookings).toHaveLength(2);
            expect(state.error).toBeNull();
        });
    });

    describe('[HIGH-09] 付款狀態更新驗證', () => {
        it('應該成功更新 confirmed 狀態的預約付款狀態', () => {
            const state = facilityReducer(
                initialState,
                setPaymentStatus({ id: 'booking-1', status: 'paid' })
            );

            expect(state.bookings[0].paymentStatus).toBe('paid');
            expect(state.error).toBeNull();
        });

        it('應該拒絕更新 cancelled 狀態的預約付款狀態', () => {
            const stateWithCancelled: FacilityState = {
                ...initialState,
                bookings: [
                    createMockBooking({
                        id: 'booking-1',
                        bookingStatus: 'cancelled',
                    }),
                ],
            };

            const state = facilityReducer(
                stateWithCancelled,
                setPaymentStatus({ id: 'booking-1', status: 'paid' })
            );

            expect(state.bookings[0].paymentStatus).toBe('unpaid');
            expect(state.error).not.toBeNull();
            expect(state.error).toContain('已取消');
        });

        it('應該拒絕更新 deleted 狀態的預約付款狀態', () => {
            const stateWithDeleted: FacilityState = {
                ...initialState,
                bookings: [
                    createMockBooking({
                        id: 'booking-1',
                        bookingStatus: 'deleted',
                    }),
                ],
            };

            const state = facilityReducer(
                stateWithDeleted,
                setPaymentStatus({ id: 'booking-1', status: 'paid' })
            );

            expect(state.bookings[0].paymentStatus).toBe('unpaid');
            expect(state.error).not.toBeNull();
            expect(state.error).toContain('已刪除');
        });

        it('成功更新後應該清除之前的錯誤', () => {
            // 先製造一個錯誤
            const stateWithCancelled: FacilityState = {
                ...initialState,
                bookings: [
                    createMockBooking({ id: 'booking-1', bookingStatus: 'cancelled' }),
                    createMockBooking({ id: 'booking-2', bookingStatus: 'confirmed' }),
                ],
            };

            let state = facilityReducer(
                stateWithCancelled,
                setPaymentStatus({ id: 'booking-1', status: 'paid' })
            );
            expect(state.error).not.toBeNull();

            // 再進行成功的更新
            state = facilityReducer(
                state,
                setPaymentStatus({ id: 'booking-2', status: 'paid' })
            );

            expect(state.error).toBeNull();
        });
    });
});
