import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { SystemConfig, StatusConfig } from '../../types/domain';
import type { StatusColorConfig, StatusColorState } from '../../types/statusColor';
import { themeService } from '../../services/themeService';
import { DEFAULT_THEME, DEFAULT_PARKING_STATUS_COLORS, DEFAULT_CALENDAR_STATUS_COLORS, DEFAULT_UNIT_STATUS_COLORS } from '../../types/statusColor';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const initialColorState: StatusColorState = {
  configs: [],
  activeConfigId: null,
  loading: false,
  error: null,
};

// 任務 2: 新增 Redux Store 模組要求的狀態
interface ExtendedConfigState {
  configs: SystemConfig[];
  colorConfigs: StatusColorState;
  loading: boolean;
  error: string | null;
  
  // 新增的狀態管理
  parkingStatuses: StatusConfig[];
  calendarStatuses: StatusConfig[];
  houseStatuses: StatusConfig[];
  
  // 預設值
  defaultParkingStatuses: StatusConfig[];
  defaultCalendarStatuses: StatusConfig[];
  defaultHouseStatuses: StatusConfig[];
}

const defaultParkingStatuses: StatusConfig[] = [
  { id: '1', type: 'parking', name: '可租用', color: '#22c55e' },
  { id: '2', type: 'parking', name: '已佔用', color: '#ef4444' },
  { id: '3', type: 'parking', name: '保留', color: '#f59e0b' },
  { id: '4', type: 'parking', name: '維護中', color: '#6b7280' },
];

const defaultCalendarStatuses: StatusConfig[] = [
  { id: '1', type: 'calendar', name: '一般', color: '#6366f1' },
  { id: '2', type: 'calendar', name: '重要', color: '#f59e0b' },
  { id: '3', type: 'calendar', name: '緊急', color: '#ef4444' },
  { id: '4', type: 'calendar', name: '完成', color: '#22c55e' },
];

const defaultHouseStatuses: StatusConfig[] = [
  { id: '1', type: 'house', name: '空屋', color: '#22c55e' },
  { id: '2', type: 'house', name: '已入住', color: '#3b82f6' },
  { id: '3', type: 'house', name: '裝修中', color: '#f59e0b' },
];

const initialState: ExtendedConfigState = {
  configs: [],
  colorConfigs: initialColorState,
  loading: false,
  error: null,
  
  parkingStatuses: defaultParkingStatuses,
  calendarStatuses: defaultCalendarStatuses,
  houseStatuses: defaultHouseStatuses,
  
  defaultParkingStatuses,
  defaultCalendarStatuses,
  defaultHouseStatuses,
};

export const initializeTheme = createAsyncThunk(
  'config/initializeTheme',
  async () => {
    const configs = themeService.getAllConfigs();
    const activeConfig = themeService.getActiveConfig();

    if (configs.length === 0) {
      // 創建預設主題
      const defaultConfig = themeService.createConfig('預設主題');
      themeService.applyTheme(defaultConfig);
      themeService.setActiveConfig(defaultConfig.id);

      return {
        configs: [defaultConfig],
        activeConfigId: defaultConfig.id,
      };
    }

    // 應用當前主題
    if (activeConfig) {
      themeService.applyTheme(activeConfig);
    }

    return {
      configs,
      activeConfigId: activeConfig?.id || configs[0]?.id || null,
    };
  }
);

export const createColorTheme = createAsyncThunk(
  'config/createColorTheme',
  async (name: string, { rejectWithValue }) => {
    try {
      const config = themeService.createConfig(name);
      return config;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '創建失敗');
    }
  }
);

export const updateColorTheme = createAsyncThunk(
  'config/updateColorTheme',
  async ({ id, updates }: { id: string; updates: Partial<StatusColorConfig> }, { rejectWithValue }) => {
    try {
      const config = themeService.updateConfig(id, updates);
      if (!config) {
        return rejectWithValue('主題不存在');
      }
      return config;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '更新失敗');
    }
  }
);

export const updateCategoryColor = createAsyncThunk(
  'config/updateCategoryColor',
  async (
    { configId, category, key, color }: { configId: string; category: string; key: string; color: string },
    { rejectWithValue }
  ) => {
    try {
      const config = themeService.updateCategoryColor(
        configId,
        category as any,
        key,
        color
      );
      if (!config) {
        return rejectWithValue('更新失敗');
      }
      return config;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '更新失敗');
    }
  }
);

export const applyTheme = createAsyncThunk(
  'config/applyTheme',
  async (configId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { config: { colorConfigs: StatusColorState } };
      const config = state.config.colorConfigs.configs.find(c => c.id === configId);

      if (!config) {
        return rejectWithValue('主題不存在');
      }

      themeService.applyTheme(config);
      themeService.setActiveConfig(configId);

      return configId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '應用失敗');
    }
  }
);

export const exportTheme = createAsyncThunk(
  'config/exportTheme',
  async (configId: string, { rejectWithValue }) => {
    try {
      const json = themeService.exportConfig(configId);
      if (!json) {
        return rejectWithValue('導出失敗');
      }
      return json;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '導出失敗');
    }
  }
);

export const importTheme = createAsyncThunk(
  'config/importTheme',
  async (jsonString: string, { rejectWithValue }) => {
    try {
      const config = themeService.importConfig(jsonString);
      if (!config) {
        return rejectWithValue('導入失敗，無效的格式');
      }
      return config;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '導入失敗');
    }
  }
);

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    rehydrate: (state, action: PayloadAction<Partial<ExtendedConfigState>>) => {
      if (action.payload) {
        // Merge payload with state, be careful with arrays
        Object.assign(state, action.payload);
      }
    },
    setConfigs: (state, action: PayloadAction<SystemConfig[]>) => {
      state.configs = action.payload;
      state.loading = false;
    },
    // ... existing reducers ...
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
    deleteConfig: (state, action: PayloadAction<string>) => {
      state.configs = state.configs.filter(c => c.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // 顏色配置相關 (舊)
    setColorConfigs: (state, action: PayloadAction<StatusColorConfig[]>) => {
      state.colorConfigs.configs = action.payload;
    },
    setActiveColorConfig: (state, action: PayloadAction<string | null>) => {
      state.colorConfigs.activeConfigId = action.payload;
    },
    deleteColorConfig: (state, action: PayloadAction<string>) => {
      state.colorConfigs.configs = state.colorConfigs.configs.filter(c => c.id !== action.payload);
      if (state.colorConfigs.activeConfigId === action.payload) {
        state.colorConfigs.activeConfigId = null;
      }
    },
    
    // 新增：統一狀態顏色管理
    updateStatusConfig: (state, action: PayloadAction<{ type: 'parking' | 'calendar' | 'house', id: string, color: string }>) => {
      const { type, id, color } = action.payload;
      let targetArray: StatusConfig[] | undefined;
      
      switch (type) {
        case 'parking':
          targetArray = state.parkingStatuses;
          break;
        case 'calendar':
          targetArray = state.calendarStatuses;
          break;
        case 'house':
          targetArray = state.houseStatuses;
          break;
      }
      
      if (targetArray) {
        const index = targetArray.findIndex(s => s.id === id);
        if (index !== -1) {
          targetArray[index].color = color;
        }
      }
    },
    
    resetStatusConfig: (state, action: PayloadAction<'parking' | 'calendar' | 'house'>) => {
       switch (action.payload) {
        case 'parking':
          state.parkingStatuses = [...state.defaultParkingStatuses];
          break;
        case 'calendar':
          state.calendarStatuses = [...state.defaultCalendarStatuses];
          break;
        case 'house':
          state.houseStatuses = [...state.defaultHouseStatuses];
          break;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // 初始化主題
      .addCase(initializeTheme.pending, (state) => {
        state.colorConfigs.loading = true;
        state.colorConfigs.error = null;
      })
      .addCase(initializeTheme.fulfilled, (state, action) => {
        state.colorConfigs.loading = false;
        state.colorConfigs.configs = action.payload.configs;
        state.colorConfigs.activeConfigId = action.payload.activeConfigId;
      })
      .addCase(initializeTheme.rejected, (state, action) => {
        state.colorConfigs.loading = false;
        state.colorConfigs.error = action.error.message || '初始化失敗';
      })
      // 新增主題
      .addCase(createColorTheme.fulfilled, (state, action) => {
        state.colorConfigs.configs.push(action.payload);
      })
      // 更新主題
      .addCase(updateColorTheme.fulfilled, (state, action) => {
        const index = state.colorConfigs.configs.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.colorConfigs.configs[index] = action.payload;
        }
      })
      // 更新類別顏色
      .addCase(updateCategoryColor.fulfilled, (state, action) => {
        const index = state.colorConfigs.configs.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.colorConfigs.configs[index] = action.payload;
        }
      })
      // 應用主題
      .addCase(applyTheme.fulfilled, (state, action) => {
        state.colorConfigs.activeConfigId = action.payload;
      })
      // 導入主題
      .addCase(importTheme.fulfilled, (state, action) => {
        state.colorConfigs.configs.push(action.payload);
      });
  },
});

export const {
  setConfigs,
  updateConfig,
  updateConfigs,
  deleteConfig,
  setLoading,
  setError,
  setColorConfigs,
  setActiveColorConfig,
  deleteColorConfig,
  updateStatusConfig,
  resetStatusConfig,
} = configSlice.actions;

export const configActions = configSlice.actions;
export default configSlice.reducer;