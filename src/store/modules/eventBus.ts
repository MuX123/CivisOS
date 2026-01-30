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

    updateDeviceData: (state, action: PayloadAction<{ deviceId: string; data: Record<string, any> }>) => {
      const { deviceId, data } = action.payload;
      const deviceIndex = state.devices.findIndex(device => device.id === deviceId);

      if (deviceIndex !== -1) {
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