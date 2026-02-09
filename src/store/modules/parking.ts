import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ParkingSpace, ParkingStats, ParkingArea, ParkingZoneConfig } from '../../types/domain';

export interface ParkingSpaceType {
    id: string;
    name: string;
    code: string; // e.g., 'resident', 'visitor', 'reserved'
}

export interface ParkingState {
  spaces: ParkingSpace[];
  areas: ParkingArea[];
  zones: ParkingZoneConfig[]; // 新增：用於存儲分區設定
  stats: ParkingStats;
  spaceTypes: ParkingSpaceType[]; // New field for customizable types
  loading: boolean;
  error: string | null;
}

const defaultSpaceTypes: ParkingSpaceType[] = [
    { id: 'type-resident', name: '住戶車位', code: 'resident' },
    { id: 'type-visitor', name: '訪客車位', code: 'visitor' },
    { id: 'type-reserved', name: '保留車位', code: 'reserved' },
    { id: 'type-disabled', name: '身心障礙車位', code: 'disabled' },
];

const initialState: ParkingState = {
  spaces: [],
  areas: [],
  zones: [], // 初始化
  stats: {
    total: 0,
    occupied: 0,
    available: 0,
    reserved: 0,
    maintenance: 0,
    residentOccupied: 0,
    visitorOccupied: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
  },
  spaceTypes: defaultSpaceTypes,
  loading: false,
  error: null,
};

const parkingSlice = createSlice({
  name: 'parking',
  initialState,
  reducers: {
    rehydrate: (state, action: PayloadAction<Partial<ParkingState>>) => {
      if (action.payload.spaces) {
        state.spaces = action.payload.spaces;
      }
      if (action.payload.areas) {
        state.areas = action.payload.areas;
      }
      if (action.payload.zones) {
        state.zones = action.payload.zones; // 還原
      }
      if (action.payload.stats) {
        state.stats = action.payload.stats;
      }
      if (action.payload.spaceTypes) {
        state.spaceTypes = action.payload.spaceTypes;
      }
      if (action.payload.loading !== undefined) {
        state.loading = action.payload.loading;
      }
      if (action.payload.error !== undefined) {
        state.error = action.payload.error;
      }
    },
    initializeSpaces: (state, action: PayloadAction<ParkingSpace[]>) => {
      state.spaces = action.payload;
      state.loading = false;
    },

    initializeAreas: (state, action: PayloadAction<ParkingArea[]>) => {
      state.areas = action.payload;
    },

    updateSpaceStatus: (state, action: PayloadAction<{ id: string; status: 'available' | 'occupied' | 'reserved' | 'maintenance'; reason?: string }>) => {
      const { id, status, reason } = action.payload;
      const spaceIndex = state.spaces.findIndex(space => space.id === id);

      if (spaceIndex !== -1) {
        state.spaces[spaceIndex].status = status;
        if (reason) {
          state.spaces[spaceIndex].reason = reason;
        }

        if (status === 'available') {
          state.spaces[spaceIndex].residentId = undefined;
          state.spaces[spaceIndex].plateNumber = undefined;
          state.spaces[spaceIndex].startTime = undefined;
          state.spaces[spaceIndex].reason = undefined;
          state.spaces[spaceIndex].reservedUntil = undefined;
          state.spaces[spaceIndex].maintenanceUntil = undefined;
        }
      }
    },

    assignParkingSpace: (state, action: PayloadAction<{
      id: string;
      residentId?: string;
      plateNumber?: string;
      startTime?: Date;
      monthlyFee?: number;
      hourlyRate?: number;
      // Extended fields
      occupantType?: 'owner' | 'custom_tenant' | 'resident_tenant';
      occupantName?: string;
      occupantBuildingId?: string;
      occupantUnitId?: string;
      licensePlates?: { number: string; note?: string }[];
    }>) => {
      const { id, residentId, plateNumber, startTime, monthlyFee, hourlyRate, occupantType, occupantName, occupantBuildingId, occupantUnitId, licensePlates } = action.payload;
      const spaceIndex = state.spaces.findIndex(space => space.id === id);

      if (spaceIndex !== -1) {
        state.spaces[spaceIndex].status = 'occupied';
        if (residentId) state.spaces[spaceIndex].residentId = residentId;
        if (plateNumber) state.spaces[spaceIndex].plateNumber = plateNumber;
        if (startTime) state.spaces[spaceIndex].startTime = startTime;
        if (monthlyFee) state.spaces[spaceIndex].monthlyFee = monthlyFee;
        if (hourlyRate) state.spaces[spaceIndex].hourlyRate = hourlyRate;
        
        // New fields
        if (occupantType) state.spaces[spaceIndex].occupantType = occupantType;
        if (occupantName) state.spaces[spaceIndex].occupantName = occupantName;
        if (occupantBuildingId) state.spaces[spaceIndex].occupantBuildingId = occupantBuildingId;
        if (occupantUnitId) state.spaces[spaceIndex].occupantUnitId = occupantUnitId;
        if (licensePlates) state.spaces[spaceIndex].licensePlates = licensePlates;
      }
    },

    releaseParkingSpace: (state, action: PayloadAction<string>) => {
      const spaceIndex = state.spaces.findIndex(space => space.id === action.payload);

      if (spaceIndex !== -1) {
        state.spaces[spaceIndex].status = 'available';
        state.spaces[spaceIndex].residentId = undefined;
        state.spaces[spaceIndex].plateNumber = undefined;
        state.spaces[spaceIndex].startTime = undefined;
        state.spaces[spaceIndex].reason = undefined;
        state.spaces[spaceIndex].reservedUntil = undefined;
        state.spaces[spaceIndex].maintenanceUntil = undefined;
      }
    },

    addParkingArea: (state, action: PayloadAction<ParkingArea>) => {
      state.areas.push(action.payload);
    },

    updateParkingArea: (state, action: PayloadAction<{ id: string; updates: Partial<ParkingArea> }>) => {
      const { id, updates } = action.payload;
      const areaIndex = state.areas.findIndex(area => area.id === id);

      if (areaIndex !== -1) {
        state.areas[areaIndex] = { ...state.areas[areaIndex], ...updates };
      }
    },

    // Zones CRUD
    addZone: (state, action: PayloadAction<ParkingZoneConfig>) => {
      state.zones.push(action.payload);
    },

    updateZone: (state, action: PayloadAction<{ id: string; updates: Partial<ParkingZoneConfig> }>) => {
      const { id, updates } = action.payload;
      const index = state.zones.findIndex(z => z.id === id);
      if (index !== -1) {
        state.zones[index] = { ...state.zones[index], ...updates };
      }
    },

    deleteZone: (state, action: PayloadAction<string>) => {
      state.zones = state.zones.filter(z => z.id !== action.payload);
    },
    
    // CRUD for Parking Spaces
    addParkingSpace: (state, action: PayloadAction<ParkingSpace>) => {
      state.spaces.push(action.payload);
    },
    
    batchAddParkingSpaces: (state, action: PayloadAction<ParkingSpace[]>) => {
      state.spaces.push(...action.payload);
    },
    
    updateParkingSpace: (state, action: PayloadAction<{ id: string; updates: Partial<ParkingSpace> }>) => {
      const { id, updates } = action.payload;
      const spaceIndex = state.spaces.findIndex(space => space.id === id);
      if (spaceIndex !== -1) {
        state.spaces[spaceIndex] = { ...state.spaces[spaceIndex], ...updates };
      }
    },
    
    deleteParkingSpace: (state, action: PayloadAction<string>) => {
      state.spaces = state.spaces.filter(space => space.id !== action.payload);
    },
    
    deleteParkingSpacesByArea: (state, action: PayloadAction<string>) => {
      state.spaces = state.spaces.filter(space => space.area !== action.payload);
    },

    updateStats: (state, action: PayloadAction<Partial<ParkingStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },

    // Space Types CRUD
    addSpaceType: (state, action: PayloadAction<ParkingSpaceType>) => {
        state.spaceTypes.push(action.payload);
    },
    updateSpaceType: (state, action: PayloadAction<ParkingSpaceType>) => {
        const index = state.spaceTypes.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
            state.spaceTypes[index] = action.payload;
        }
    },
    deleteSpaceType: (state, action: PayloadAction<string>) => {
        state.spaceTypes = state.spaceTypes.filter(t => t.id !== action.payload);
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const parkingActions = parkingSlice.actions;

export default parkingSlice.reducer;
