import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Resident } from '@/types/domain'

interface ResidentState {
  residents: Resident[]
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