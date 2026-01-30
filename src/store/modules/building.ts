import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Building } from '../../types/domain'

export interface BuildingState {
  buildings: Building[]
  selectedBuilding: string | null
  loading: boolean
  error: string | null
}

const initialState: BuildingState = {
  buildings: [],
  selectedBuilding: null,
  loading: false,
  error: null,
}

const buildingSlice = createSlice({
  name: 'building',
  initialState,
  reducers: {
    rehydrate: (state, action: PayloadAction<Partial<BuildingState>>) => {
      return { ...state, ...action.payload, loading: false, error: null }
    },
    setBuildings: (state, action: PayloadAction<Building[]>) => {
      state.buildings = action.payload
      state.loading = false
      state.error = null
    },
    addBuilding: (state, action: PayloadAction<Building>) => {
      state.buildings.push(action.payload)
    },
    updateBuilding: (state, action: PayloadAction<Building>) => {
      const index = state.buildings.findIndex(b => b.id === action.payload.id)
      if (index !== -1) {
        state.buildings[index] = action.payload
      }
    },
    deleteBuilding: (state, action: PayloadAction<string>) => {
      state.buildings = state.buildings.filter(b => b.id !== action.payload)
    },
    setSelectedBuilding: (state, action: PayloadAction<string | null>) => {
      state.selectedBuilding = action.payload
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
  setBuildings,
  addBuilding,
  updateBuilding,
  deleteBuilding,
  setSelectedBuilding,
  setLoading,
  setError,
} = buildingSlice.actions

export const buildingActions = buildingSlice.actions
export default buildingSlice.reducer