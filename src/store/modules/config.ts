import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { SystemConfig } from '../../types/domain';
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
  initialState: {
    configs: [] as SystemConfig[],
    colorConfigs: initialColorState,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    rehydrate: (state, action: PayloadAction<Partial<typeof state.configs>>) => {
      if (action.payload) {
        state.configs = action.payload as SystemConfig[];
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
    deleteConfig: (state, action: PayloadAction<string>) => {
      state.configs = state.configs.filter(c => c.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // 顏色配置相關
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
} = configSlice.actions;

export const configActions = configSlice.actions;
export default configSlice.reducer;