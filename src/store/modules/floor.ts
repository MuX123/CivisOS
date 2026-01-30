import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Floor } from '../types/domain';

interface FloorState {
  floors: Floor[];
  loading: boolean;
  error: string | null;
}

const initialState: FloorState = {
  floors: [],
  loading: false,
  error: null,
};

const floorSlice = createSlice({
  name: 'floor',
  initialState,
  reducers: {
    setFloors: (state, action: PayloadAction<Floor[]>) => {
      state.floors = action.payload;
      state.loading = false;
    },
    addFloor: (state, action: PayloadAction<Floor>) => {
      state.floors.push(action.payload);
    },
    updateFloor: (state, action: PayloadAction<{ id: string; updates: Partial<Floor> }>) => {
      const { id, updates } = action.payload;
      const floorIndex = state.floors.findIndex(floor => floor.id === id);
      
      if (floorIndex !== -1) {
        state.floors[floorIndex] = { ...state.floors[floorIndex], ...updates };
      }
    },
    deleteFloor: (state, action: PayloadAction<string>) => {
      state.floors = state.floors.filter(floor => floor.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setFloors, addFloor, updateFloor, deleteFloor, setLoading, setError } = floorSlice.actions;

export default floorSlice.reducer;