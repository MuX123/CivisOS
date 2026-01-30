import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Unit } from '../types/domain';

interface UnitState {
  units: Unit[];
  loading: boolean;
  error: string | null;
}

const initialState: UnitState = {
  units: [],
  loading: false,
  error: null,
};

const unitSlice = createSlice({
  name: 'unit',
  initialState,
  reducers: {
    setUnits: (state, action: PayloadAction<Unit[]>) => {
      state.units = action.payload;
      state.loading = false;
    },
    addUnit: (state, action: PayloadAction<Unit>) => {
      state.units.push(action.payload);
    },
    updateUnit: (state, action: PayloadAction<{ id: string; updates: Partial<Unit> }>) => {
      const { id, updates } = action.payload;
      const unitIndex = state.units.findIndex(unit => unit.id === id);
      
      if (unitIndex !== -1) {
        state.units[unitIndex] = { ...state.units[unitIndex], ...updates };
      }
    },
    deleteUnit: (state, action: PayloadAction<string>) => {
      state.units = state.units.filter(unit => unit.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setUnits, addUnit, updateUnit, deleteUnit, setLoading, setError } = unitSlice.actions;

export default unitSlice.reducer;