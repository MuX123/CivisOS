/**
 * IoT 系統安全漏洞修復測試
 * 測試 HIGH-20
 */

import { describe, it, expect } from 'vitest';
import eventBusReducer, { updateDeviceData } from '../../../store/modules/eventBus';
import type { EventBusState } from '../../../store/modules/eventBus';

describe('IoT 系統安全測試', () => {
    const initialState: EventBusState = {
        devices: [
            {
                id: 'sensor-1',
                name: '溫濕度感測器',
                type: 'sensor',
                location: 'A棟1樓',
                status: 'online',
                lastSeen: new Date().toISOString(),
                data: {
                    temperature: 25,
                    humidity: 60,
                },
                configuration: {},
            },
        ],
        events: [],
        lastHeartbeat: new Date().toISOString(),
    };

    describe('[HIGH-20] IoT 裝置資料驗證', () => {
        it('應該接受合理範圍內的溫度資料', () => {
            const state = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { temperature: 30 },
                })
            );

            expect(state.devices[0].data.temperature).toBe(30);
            expect(state.devices[0].status).toBe('online');
        });

        it('應該拒絕超出範圍的溫度資料', () => {
            const state = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { temperature: 150 },
                })
            );

            // 資料不應該被更新
            expect(state.devices[0].data.temperature).toBe(25);
            // 裝置應該被標記為錯誤狀態
            expect(state.devices[0].status).toBe('error');
        });

        it('應該拒絕負溫度超出範圍的資料', () => {
            const state = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { temperature: -100 },
                })
            );

            expect(state.devices[0].data.temperature).toBe(25);
            expect(state.devices[0].status).toBe('error');
        });

        it('應該接受合理範圍內的濕度資料', () => {
            const state = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { humidity: 70 },
                })
            );

            expect(state.devices[0].data.humidity).toBe(70);
            expect(state.devices[0].status).toBe('online');
        });

        it('應該拒絕超出範圍的濕度資料', () => {
            const state = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { humidity: 150 },
                })
            );

            expect(state.devices[0].data.humidity).toBe(60);
            expect(state.devices[0].status).toBe('error');
        });

        it('應該拒絕負濕度資料', () => {
            const state = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { humidity: -10 },
                })
            );

            expect(state.devices[0].data.humidity).toBe(60);
            expect(state.devices[0].status).toBe('error');
        });

        it('應該驗證 CO2 濃度範圍', () => {
            const validState = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { co2: 800 },
                })
            );

            expect(validState.devices[0].data.co2).toBe(800);
            expect(validState.devices[0].status).toBe('online');

            const invalidState = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { co2: 6000 },
                })
            );

            expect(invalidState.devices[0].status).toBe('error');
        });

        it('應該驗證 PM2.5 濃度範圍', () => {
            const validState = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { pm25: 50 },
                })
            );

            expect(validState.devices[0].data.pm25).toBe(50);

            const invalidState = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { pm25: 600 },
                })
            );

            expect(invalidState.devices[0].status).toBe('error');
        });

        it('應該驗證電壓範圍', () => {
            const validState = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { voltage: 220 },
                })
            );

            expect(validState.devices[0].data.voltage).toBe(220);

            const invalidState = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { voltage: 600 },
                })
            );

            expect(invalidState.devices[0].status).toBe('error');
        });

        it('應該驗證電流範圍', () => {
            const validState = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { current: 10 },
                })
            );

            expect(validState.devices[0].data.current).toBe(10);

            const invalidState = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { current: 150 },
                })
            );

            expect(invalidState.devices[0].status).toBe('error');
        });

        it('應該拒絕無效的資料格式', () => {
            const state = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: null as any,
                })
            );

            // 資料不應該被更新
            expect(state.devices[0].data.temperature).toBe(25);
        });

        it('應該接受非數值型別的資料', () => {
            const state = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { status: 'active', message: 'OK' },
                })
            );

            expect(state.devices[0].data.status).toBe('active');
            expect(state.devices[0].data.message).toBe('OK');
            expect(state.devices[0].status).toBe('online');
        });

        it('應該更新 lastSeen 時間戳', () => {
            const oldTimestamp = initialState.devices[0].lastSeen;

            // 等待一小段時間確保時間戳不同
            const state = eventBusReducer(
                initialState,
                updateDeviceData({
                    deviceId: 'sensor-1',
                    data: { temperature: 26 },
                })
            );

            expect(state.devices[0].lastSeen).not.toBe(oldTimestamp);
        });
    });
});
