import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SystemConfig } from '../../types/domain';

export interface ConfigState {
  configs: SystemConfig[];
  loading: boolean;
  error: string | null;
}

const initialState: ConfigState = {
  configs: [],
  loading: false,
  error: null,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    rehydrate: (state, action: PayloadAction<Partial<ConfigState>>) => {
      if (action.payload.configs) {
        state.configs = action.payload.configs;
      }
      if (action.payload.loading !== undefined) {
        state.loading = action.payload.loading;
      }
      if (action.payload.error !== undefined) {
        state.error = action.payload.error;
      }
    },
    setConfigs: (state, action: PayloadAction<SystemConfig[]>) => {
      state.configs = action.payload;
      state.loading = false;
    },
    updateConfig: (state, action: PayloadAction<SystemConfig>) => {
      const index = state.configs.findIndex(config => config.id === action.payload.id);
      if (index !== -1) {
        state.configs[index] = action.payload;
      } else {
        state.configs.push(action.payload);
      }
    },
    updateConfigs: (state, action: PayloadAction<Partial<SystemConfig>[]>) => {
      action.payload.forEach(config => {
        const index = state.configs.findIndex(c => c.id === config.id);
        if (index !== -1) {
          state.configs[index] = { ...state.configs[index], ...config };
        } else if (config.id && config.key) {
          state.configs.push(config as SystemConfig);
        }
      });
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { rehydrate, setConfigs, updateConfig, updateConfigs, setLoading, setError } = configSlice.actions;

export const configActions = configSlice.actions;
export default configSlice.reducer;