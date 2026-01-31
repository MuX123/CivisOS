import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { Building } from '../../types/domain'
import type { BuildingConfig, FloorConfig, UnitConfig, ParkingSpaceConfig } from '../../types/building'
import { buildingService } from '../../services/buildingService'

// UUID 生成
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export interface BuildingState {
  buildings: BuildingConfig[]
  floors: FloorConfig[]
  units: UnitConfig[]
  parkingSpaces: ParkingSpaceConfig[]
  selectedBuildingId: string | null
  loading: boolean
  error: string | null
}

const initialState: BuildingState = {
  buildings: [],
  floors: [],
  units: [],
  parkingSpaces: [],
  selectedBuildingId: null,
  loading: false,
  error: null,
}

// 異步操作：新增棟數並自動生成樓層/戶別/車位
export const addBuildingWithGeneration = createAsyncThunk(
  'building/addWithGeneration',
  async (buildingData: Omit<BuildingConfig, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const building: BuildingConfig = {
        ...buildingData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const { floors, units, parkingSpaces } = buildingService.autoGenerateAll(
        { buildingId: building.id, generateFloors: true, generateUnits: true, generateParkingSpaces: true },
        building
      )

      return { building, floors, units, parkingSpaces }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '新增失敗')
    }
  }
)

// 異步操作：更新棟數並重新生成
export const updateBuildingWithRegeneration = createAsyncThunk(
  'building/updateWithRegeneration',
  async (
    { id, updates, regenerateUnits }: { id: string; updates: Partial<BuildingConfig>; regenerateUnits?: boolean },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { building: BuildingState }
      const building = state.building.buildings.find(b => b.id === id)

      if (!building) {
        return rejectWithValue('棟數不存在')
      }

      const result = buildingService.updateBuildingWithRegeneration(
        building,
        state.building.floors,
        state.building.units,
        state.building.parkingSpaces,
        updates
      )

      return result
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '更新失敗')
    }
  }
)

// 異步操作：重新生成指定棟數的樓層/戶別/車位
export const regenerateBuildingStructure = createAsyncThunk(
  'building/regenerateStructure',
  async (buildingId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { building: BuildingState }
      const building = state.building.buildings.find(b => b.id === buildingId)

      if (!building) {
        return rejectWithValue('棟數不存在')
      }

      const { floors, units, parkingSpaces } = buildingService.autoGenerateAll(
        { buildingId, generateFloors: true, generateUnits: true, generateParkingSpaces: true },
        building
      )

      return { buildingId, floors, units, parkingSpaces }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '重新生成失敗')
    }
  }
)

const buildingSlice = createSlice({
  name: 'building',
  initialState,
  reducers: {
    rehydrate: (state, action: PayloadAction<Partial<BuildingState>>) => {
      return { ...state, ...action.payload, loading: false, error: null }
    },
    setBuildings: (state, action: PayloadAction<BuildingConfig[]>) => {
      state.buildings = action.payload
      state.loading = false
      state.error = null
    },
    addBuilding: (state, action: PayloadAction<BuildingConfig>) => {
      state.buildings.push(action.payload)
    },
    updateBuilding: (state, action: PayloadAction<BuildingConfig>) => {
      const index = state.buildings.findIndex(b => b.id === action.payload.id)
      if (index !== -1) {
        state.buildings[index] = action.payload
      }
    },
    deleteBuilding: (state, action: PayloadAction<string>) => {
      state.buildings = state.buildings.filter(b => b.id !== action.payload)
      // 同時刪除關聯的樓層、戶別、車位
      state.floors = state.floors.filter(f => f.buildingId !== action.payload)
      state.units = state.units.filter(u => u.buildingId !== action.payload)
      state.parkingSpaces = state.parkingSpaces.filter(p => p.buildingId !== action.payload)
    },
    setSelectedBuilding: (state, action: PayloadAction<string | null>) => {
      state.selectedBuildingId = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    // 樓層操作
    setFloors: (state, action: PayloadAction<FloorConfig[]>) => {
      state.floors = action.payload
    },
    addFloor: (state, action: PayloadAction<FloorConfig>) => {
      state.floors.push(action.payload)
    },
    updateFloor: (state, action: PayloadAction<FloorConfig>) => {
      const index = state.floors.findIndex(f => f.id === action.payload.id)
      if (index !== -1) {
        state.floors[index] = action.payload
      }
    },
    deleteFloor: (state, action: PayloadAction<string>) => {
      state.floors = state.floors.filter(f => f.id !== action.payload)
      // 刪除關聯的戶別和車位
      state.units = state.units.filter(u => u.floorId !== action.payload)
      state.parkingSpaces = state.parkingSpaces.filter(p => p.floorId !== action.payload)
    },
    // 戶別操作
    setUnits: (state, action: PayloadAction<UnitConfig[]>) => {
      state.units = action.payload
    },
    addUnit: (state, action: PayloadAction<UnitConfig>) => {
      state.units.push(action.payload)
    },
    updateUnit: (state, action: PayloadAction<UnitConfig>) => {
      const index = state.units.findIndex(u => u.id === action.payload.id)
      if (index !== -1) {
        state.units[index] = action.payload
      }
    },
    updateUnitSize: (state, action: PayloadAction<{ id: string; size: number; monthlyFee: number }>) => {
      const unit = state.units.find(u => u.id === action.payload.id)
      if (unit) {
        unit.size = action.payload.size
        unit.monthlyFee = action.payload.monthlyFee
        unit.updatedAt = new Date().toISOString()
      }
    },
    deleteUnit: (state, action: PayloadAction<string>) => {
      state.units = state.units.filter(u => u.id !== action.payload)
    },
    reorderUnits: (state, action: PayloadAction<string[]>) => {
      const newOrder = action.payload
      state.units = buildingService.reorderUnits(state.units, newOrder)
    },
    // 車位操作
    setParkingSpaces: (state, action: PayloadAction<ParkingSpaceConfig[]>) => {
      state.parkingSpaces = action.payload
    },
    addParkingSpace: (state, action: PayloadAction<ParkingSpaceConfig>) => {
      state.parkingSpaces.push(action.payload)
    },
    updateParkingSpace: (state, action: PayloadAction<ParkingSpaceConfig>) => {
      const index = state.parkingSpaces.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.parkingSpaces[index] = action.payload
      }
    },
    deleteParkingSpace: (state, action: PayloadAction<string>) => {
      state.parkingSpaces = state.parkingSpaces.filter(p => p.id !== action.payload)
    },
    associateParkingWithUnit: (state, action: PayloadAction<{ unitId: string; parkingSpaceIds: string[] }>) => {
      const { unitId, parkingSpaceIds } = action.payload
      state.parkingSpaces = state.parkingSpaces.map(space => {
        if (parkingSpaceIds.includes(space.id)) {
          return {
            ...space,
            unitId,
            status: 'occupied' as const,
            updatedAt: new Date().toISOString(),
          }
        }
        return space
      })
    },
  },
  extraReducers: (builder) => {
    builder
      // 新增棟數並生成
      .addCase(addBuildingWithGeneration.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addBuildingWithGeneration.fulfilled, (state, action) => {
        state.loading = false
        state.buildings.push(action.payload.building)
        state.floors.push(...action.payload.floors)
        state.units.push(...action.payload.units)
        state.parkingSpaces.push(...action.payload.parkingSpaces)
      })
      .addCase(addBuildingWithGeneration.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 更新棟數並重新生成
      .addCase(updateBuildingWithRegeneration.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateBuildingWithRegeneration.fulfilled, (state, action) => {
        state.loading = false
        const index = state.buildings.findIndex(b => b.id === action.payload.building.id)
        if (index !== -1) {
          state.buildings[index] = action.payload.building
        }
        state.floors = state.floors.filter(f => f.buildingId !== action.payload.building.id)
        state.floors.push(...action.payload.floors)
        state.units = state.units.filter(u => u.buildingId !== action.payload.building.id)
        state.units.push(...action.payload.units)
        state.parkingSpaces = state.parkingSpaces.filter(p => p.buildingId !== action.payload.building.id)
        state.parkingSpaces.push(...action.payload.parkingSpaces)
      })
      .addCase(updateBuildingWithRegeneration.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 重新生成結構
      .addCase(regenerateBuildingStructure.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(regenerateBuildingStructure.fulfilled, (state, action) => {
        state.loading = false
        state.floors = state.floors.filter(f => f.buildingId !== action.payload.buildingId)
        state.floors.push(...action.payload.floors)
        state.units = state.units.filter(u => u.buildingId !== action.payload.buildingId)
        state.units.push(...action.payload.units)
        state.parkingSpaces = state.parkingSpaces.filter(p => p.buildingId !== action.payload.buildingId)
        state.parkingSpaces.push(...action.payload.parkingSpaces)
      })
      .addCase(regenerateBuildingStructure.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
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
  setFloors,
  addFloor,
  updateFloor,
  deleteFloor,
  setUnits,
  addUnit,
  updateUnit,
  updateUnitSize,
  deleteUnit,
  reorderUnits,
  setParkingSpaces,
  addParkingSpace,
  updateParkingSpace,
  deleteParkingSpace,
  associateParkingWithUnit,
} = buildingSlice.actions

export const buildingActions = buildingSlice.actions
export default buildingSlice.reducer

// Selector
export const selectBuilding = (state: { building: BuildingState }) => state.building