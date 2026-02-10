import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'camera' | 'access_control' | 'meter';
  location: string;
  unitId?: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  lastSeen: Date | string;
  data: Record<string, any>;
  configuration: Record<string, any>;
}

interface IoTEvent {
  id: string;
  deviceId: string;
  eventType: string;
  timestamp: Date | string;
  data: Record<string, any>;
  processed: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface EventBusState {
  devices: IoTDevice[];
  events: IoTEvent[];
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastHeartbeat: Date | string | null;
}

const initialState: EventBusState = {
  devices: [],
  events: [],
  isConnected: false,
  connectionStatus: 'disconnected',
  lastHeartbeat: null,
};

const eventBusSlice = createSlice({
  name: 'eventBus',
  initialState,
  reducers: {
    addDevice: (state, action: PayloadAction<IoTDevice>) => {
      state.devices.push(action.payload);
    },

    updateDevice: (state, action: PayloadAction<{ id: string; updates: Partial<IoTDevice> }>) => {
      const { id, updates } = action.payload;
      const deviceIndex = state.devices.findIndex(device => device.id === id);

      if (deviceIndex !== -1) {
        state.devices[deviceIndex] = { ...state.devices[deviceIndex], ...updates };
      }
    },

    removeDevice: (state, action: PayloadAction<string>) => {
      state.devices = state.devices.filter(device => device.id !== action.payload);
    },

    setDeviceStatus: (state, action: PayloadAction<{ id: string; status: IoTDevice['status']; lastSeen?: Date | string }>) => {
      const { id, status, lastSeen } = action.payload;
      const deviceIndex = state.devices.findIndex(device => device.id === id);

      if (deviceIndex !== -1) {
        state.devices[deviceIndex].status = status;
        if (lastSeen) {
          state.devices[deviceIndex].lastSeen = lastSeen;
        }
      }
    },

    addEvent: (state, action: PayloadAction<IoTEvent>) => {
      state.events.unshift(action.payload);

      // 修復 MEDIUM-21: 添加容量限制 (例如最多保留 1000 條紀錄)
      const MAX_EVENTS = 1000;
      if (state.events.length > MAX_EVENTS) {
        state.events = state.events.slice(0, MAX_EVENTS);
      }
    },

    processEvent: (state, action: PayloadAction<string>) => {
      const eventIndex = state.events.findIndex(event => event.id === action.payload);

      if (eventIndex !== -1) {
        state.events[eventIndex].processed = true;
      }
    },

    clearEvents: (state) => {
      state.events = [];
    },

    setConnectionStatus: (state, action: PayloadAction<EventBusState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
      state.isConnected = action.payload === 'connected';
    },

    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      state.connectionStatus = action.payload ? 'connected' : 'disconnected';
    },

    updateHeartbeat: (state) => {
      state.lastHeartbeat = new Date().toISOString();
    },

    // 修復 HIGH-20: 添加資料驗證
    updateDeviceData: (state, action: PayloadAction<{ deviceId: string; data: Record<string, any> }>) => {
      const { deviceId, data } = action.payload;
      const deviceIndex = state.devices.findIndex(device => device.id === deviceId);

      if (deviceIndex !== -1) {
        const device = state.devices[deviceIndex];

        // 驗證資料格式
        if (!data || typeof data !== 'object') {
          console.error(`[EventBus] 無效的裝置資料格式: ${deviceId}`);
          return;
        }

        // 驗證感測器數值範圍
        const validationErrors: string[] = [];
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'number') {
            // 溫度範圍檢查
            if (key === 'temperature' && (value < -50 || value > 100)) {
              validationErrors.push(`溫度超出範圍: ${value}°C (合理範圍: -50~100°C)`);
            }
            // 濕度範圍檢查
            if (key === 'humidity' && (value < 0 || value > 100)) {
              validationErrors.push(`濕度超出範圍: ${value}% (合理範圍: 0~100%)`);
            }
            // CO2 範圍檢查
            if (key === 'co2' && (value < 0 || value > 5000)) {
              validationErrors.push(`CO2 超出範圍: ${value}ppm (合理範圍: 0~5000ppm)`);
            }
            // PM2.5 範圍檢查
            if (key === 'pm25' && (value < 0 || value > 500)) {
              validationErrors.push(`PM2.5 超出範圍: ${value}μg/m³ (合理範圍: 0~500μg/m³)`);
            }
            // 電壓範圍檢查
            if (key === 'voltage' && (value < 0 || value > 500)) {
              validationErrors.push(`電壓超出範圍: ${value}V (合理範圍: 0~500V)`);
            }
            // 電流範圍檢查
            if (key === 'current' && (value < 0 || value > 100)) {
              validationErrors.push(`電流超出範圍: ${value}A (合理範圍: 0~100A)`);
            }
          }
        }

        if (validationErrors.length > 0) {
          console.error(`[EventBus] 裝置 ${deviceId} 資料驗證失敗:`, validationErrors);
          // 標記裝置為錯誤狀態
          state.devices[deviceIndex].status = 'error';
          return;
        }

        // 資料驗證通過,更新裝置資料
        state.devices[deviceIndex].data = { ...state.devices[deviceIndex].data, ...data };
        state.devices[deviceIndex].lastSeen = new Date().toISOString();
        state.devices[deviceIndex].status = 'online';
      }
    },

    setDevices: (state, action: PayloadAction<IoTDevice[]>) => {
      state.devices = action.payload;
    },
  },
});

export const eventBusActions = eventBusSlice.actions;

export default eventBusSlice.reducer;