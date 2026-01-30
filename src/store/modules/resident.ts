import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Resident, AccessCard, LicensePlate, ResidentStats } from '@/types/domain'

export interface ResidentState {
  residents: Resident[]
  accessCards: AccessCard[]
  licensePlates: LicensePlate[]
  stats: ResidentStats
  selectedResident: string | null
  filter: {
    buildingId: string
    floorId: string
    unitId: string
    houseStatus: string
    searchText: string
  }
  loading: boolean
  error: string | null
}

const initialState: ResidentState = {
  residents: [],
  accessCards: [],
  licensePlates: [],
  stats: {
    totalResidents: 0,
    activeResidents: 0,
    pendingResidents: 0,
    totalMembers: 0,
    activeAccessCards: 0,
    expiredAccessCards: 0,
    lostAccessCards: 0,
    registeredPlates: 0,
    pendingPlates: 0,
  },
  selectedResident: null,
  filter: {
    buildingId: '',
    floorId: '',
    unitId: '',
    houseStatus: '',
    searchText: '',
  },
  loading: false,
  error: null,
}

const residentSlice = createSlice({
  name: 'resident',
  initialState,
  reducers: {
    rehydrate: (state, action: PayloadAction<Partial<ResidentState>>) => {
      return { ...state, ...action.payload, loading: false, error: null }
    },
    initializeResidents: (state, action: PayloadAction<Resident[]>) => {
      state.residents = action.payload
      state.loading = false
    },
    initializeAccessCards: (state, action: PayloadAction<AccessCard[]>) => {
      state.accessCards = action.payload
    },
    initializeLicensePlates: (state, action: PayloadAction<LicensePlate[]>) => {
      state.licensePlates = action.payload
    },
    updateStats: (state, action: PayloadAction<ResidentStats>) => {
      state.stats = action.payload
    },
    setResidents: (state, action: PayloadAction<Resident[]>) => {
      state.residents = action.payload
      state.loading = false
    },
    addResident: (state, action: PayloadAction<Resident>) => {
      state.residents.push(action.payload)
    },
    updateResident: (state, action: PayloadAction<Resident>) => {
      const index = state.residents.findIndex(r => r.id === action.payload.id)
      if (index !== -1) {
        state.residents[index] = action.payload
      }
    },
    deleteResident: (state, action: PayloadAction<string>) => {
      state.residents = state.residents.filter(r => r.id !== action.payload)
    },
    setSelectedResident: (state, action: PayloadAction<string | null>) => {
      state.selectedResident = action.payload
    },
    setResidentFilter: (state, action: PayloadAction<Partial<ResidentState['filter']>>) => {
      state.filter = { ...state.filter, ...action.payload }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  addResident,
  updateResident,
  deleteResident,
  setSelectedResident,
  setResidentFilter,
  setLoading,
  setError,
} = residentSlice.actions

export const residentActions = residentSlice.actions

export default residentSlice.reducer