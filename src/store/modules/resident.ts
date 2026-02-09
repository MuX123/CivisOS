import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ResidentV2, Tenant, ResidentStatus } from '../../types/domain'

// NOTE: Using ResidentV2 as per domain.ts for the refactored system
// Need to support new structure: Members, Tenants, License Plates (in resident), Cards.

export interface ResidentState {
  residents: ResidentV2[] // Using V2
  statuses: ResidentStatus[] // Custom statuses
  loading: boolean
  error: string | null
}

const defaultStatuses: ResidentStatus[] = [
    { id: 'status-owner', name: '自住', color: '#10b981' }, // emerald-500
    { id: 'status-rent', name: '出租', color: '#f59e0b' }, // amber-500
    { id: 'status-vacant', name: '空屋', color: '#9ca3af' }, // gray-400
    { id: 'status-decoration', name: '裝潢中', color: '#8b5cf6' }, // violet-500
];

const initialState: ResidentState = {
  residents: [],
  statuses: defaultStatuses,
  loading: false,
  error: null,
}

const residentSlice = createSlice({
  name: 'resident',
  initialState,
  reducers: {
    rehydrate: (state, action: PayloadAction<Partial<ResidentState>>) => {
      // Logic to merge persisted state
      if (action.payload.residents) state.residents = action.payload.residents;
      if (action.payload.statuses) state.statuses = action.payload.statuses;
    },
    
    // Resident CRUD
    setResidents: (state, action: PayloadAction<ResidentV2[]>) => {
      state.residents = action.payload;
    },
    
    upsertResident: (state, action: PayloadAction<ResidentV2>) => {
      const index = state.residents.findIndex(r => r.unitId === action.payload.unitId);
      if (index !== -1) {
        // Merge or replace? Usually replace for full edit
        state.residents[index] = action.payload;
      } else {
        state.residents.push(action.payload);
      }
    },
    
    // Status CRUD
    addStatus: (state, action: PayloadAction<ResidentStatus>) => {
        state.statuses.push(action.payload);
    },
    updateStatus: (state, action: PayloadAction<ResidentStatus>) => {
        const index = state.statuses.findIndex(s => s.id === action.payload.id);
        if (index !== -1) state.statuses[index] = action.payload;
    },
    deleteStatus: (state, action: PayloadAction<string>) => {
        state.statuses = state.statuses.filter(s => s.id !== action.payload);
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const residentActions = residentSlice.actions

export default residentSlice.reducer
