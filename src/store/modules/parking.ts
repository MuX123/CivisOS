import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ParkingSpace, ParkingStats, ParkingArea } from '../../types/domain';

interface ParkingState {
  spaces: ParkingSpace[];
  areas: ParkingArea[];
  stats: ParkingStats;
  loading: boolean;
  error: string | null;
}

const initialState: ParkingState = {
  spaces: [],
  areas: [],
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
      if (action.payload.stats) {
        state.stats = action.payload.stats;
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
    
    updateSpaceStatus: (state, action: PayloadAction<{ id: string; status: string; reason?: string }>) => {
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
    }>) => {
      const { id, residentId, plateNumber, startTime, monthlyFee, hourlyRate } = action.payload;
      const spaceIndex = state.spaces.findIndex(space => space.id === id);
      
      if (spaceIndex !== -1) {
        state.spaces[spaceIndex].status = 'occupied';
        if (residentId) state.spaces[spaceIndex].residentId = residentId;
        if (plateNumber) state.spaces[spaceIndex].plateNumber = plateNumber;
        if (startTime) state.spaces[spaceIndex].startTime = startTime;
        if (monthlyFee) state.spaces[spaceIndex].monthlyFee = monthlyFee;
        if (hourlyRate) state.spaces[spaceIndex].hourlyRate = hourlyRate;
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
    
    updateStats: (state, action: PayloadAction<Partial<ParkingStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
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