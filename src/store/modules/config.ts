import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { SystemConfig, StatusConfig, StatusConfigType } from '../../types/domain';
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
  lightModeColors: StatusConfig[];
  darkModeColors: StatusConfig[];

  // 預設值
  defaultParkingStatuses: StatusConfig[];
  defaultCalendarStatuses: StatusConfig[];
  defaultHouseStatuses: StatusConfig[];
  defaultLightModeColors: StatusConfig[];
  defaultDarkModeColors: StatusConfig[];

  // Global Theme Colors
  globalThemeColors: {
    light: { textNormal: string };
    dark: { textNormal: string };
  };
  defaultGlobalThemeColors: {
    light: { textNormal: string };
    dark: { textNormal: string };
  };
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

const defaultLightModeColors: StatusConfig[] = [
  // 背景色
  { id: 'bgPrimary', type: 'lightMode', name: '應用程式背景 (最底層)', color: '#ffffff' },
  { id: 'bgSecondary', type: 'lightMode', name: '側邊欄/次要背景', color: '#ffffff' },
  { id: 'bgTertiary', type: 'lightMode', name: '內容區域背景', color: '#f0f7ff' },
  { id: 'bgCard', type: 'lightMode', name: '卡片/區塊背景', color: '#ffffff' },
  { id: 'bgFloating', type: 'lightMode', name: '懸浮/彈窗背景', color: '#ffffff' },
  { id: 'bgHover', type: 'lightMode', name: '鼠標懸停背景', color: '#eff6ff' },
  { id: 'bgActive', type: 'lightMode', name: '點擊/活動狀態背景', color: '#dbeafe' },
  // 文字顏色
  { id: 'textNormal', type: 'lightMode', name: '主要文字', color: '#1e3a8a' },
  { id: 'textMuted', type: 'lightMode', name: '次要/提示文字', color: '#64748b' },
  { id: 'textHeader', type: 'lightMode', name: '標題文字', color: '#1e40af' },
  // 品牌色
  { id: 'brandPrimary', type: 'lightMode', name: '主品牌色', color: '#3b82f6' },
  { id: 'brandHover', type: 'lightMode', name: '品牌色懸停', color: '#2563eb' },
  { id: 'brandLight', type: 'lightMode', name: '品牌色淺色變體', color: '#60a5fa' },
  // 功能色
  { id: 'success', type: 'lightMode', name: '成功狀態', color: '#10b981' },
  { id: 'warning', type: 'lightMode', name: '警告狀態', color: '#f59e0b' },
  { id: 'danger', type: 'lightMode', name: '危險/錯誤狀態', color: '#ef4444' },
  { id: 'info', type: 'lightMode', name: '資訊狀態', color: '#3b82f6' },
  // 邊框
  { id: 'border', type: 'lightMode', name: '一般邊框', color: '#bfdbfe' },
  { id: 'borderLight', type: 'lightMode', name: '淺色邊框', color: '#dbeafe' },
];

const defaultDarkModeColors: StatusConfig[] = [
  // 背景色
  { id: 'bgPrimary', type: 'darkMode', name: '應用程式背景 (最底層)', color: '#121212' },
  { id: 'bgSecondary', type: 'darkMode', name: '側邊欄/次要背景', color: '#1a1a1a' },
  { id: 'bgTertiary', type: 'darkMode', name: '內容區域背景', color: '#0f0f0f' },
  { id: 'bgCard', type: 'darkMode', name: '卡片/區塊背景', color: '#2f3136' },
  { id: 'bgFloating', type: 'darkMode', name: '懸浮/彈窗背景', color: '#2f3136' },
  { id: 'bgHover', type: 'darkMode', name: '鼠標懸停背景', color: '#36393f' },
  { id: 'bgActive', type: 'darkMode', name: '點擊/活動狀態背景', color: '#3f3f46' },
  // 文字顏色
  { id: 'textNormal', type: 'darkMode', name: '主要文字', color: '#b9bbbe' },
  { id: 'textMuted', type: 'darkMode', name: '次要/提示文字', color: '#a1a1aa' },
  { id: 'textHeader', type: 'darkMode', name: '標題文字', color: '#f4f4f5' },
  // 品牌色
  { id: 'brandPrimary', type: 'darkMode', name: '主品牌色', color: '#818cf8' },
  { id: 'brandHover', type: 'darkMode', name: '品牌色懸停', color: '#6366f1' },
  { id: 'brandLight', type: 'darkMode', name: '品牌色淺色變體', color: '#a5b4fc' },
  // 功能色
  { id: 'success', type: 'darkMode', name: '成功狀態', color: '#34d399' },
  { id: 'warning', type: 'darkMode', name: '警告狀態', color: '#fbbf24' },
  { id: 'danger', type: 'darkMode', name: '危險/錯誤狀態', color: '#f87171' },
  { id: 'info', type: 'darkMode', name: '資訊狀態', color: '#60a5fa' },
  // 邊框
  { id: 'border', type: 'darkMode', name: '一般邊框', color: '#27272a' },
  { id: 'borderLight', type: 'darkMode', name: '淺色邊框', color: '#3f3f46' },
];

const initialState: ExtendedConfigState = {
  configs: [],
  colorConfigs: initialColorState,
  loading: false,
  error: null,
  
  parkingStatuses: defaultParkingStatuses,
  calendarStatuses: defaultCalendarStatuses,
  houseStatuses: defaultHouseStatuses,
  lightModeColors: defaultLightModeColors,
  darkModeColors: defaultDarkModeColors,

  defaultParkingStatuses,
  defaultCalendarStatuses,
  defaultHouseStatuses,
  defaultLightModeColors,
  defaultDarkModeColors,

  // Global Theme Colors
  globalThemeColors: {
    light: { textNormal: '#000000' },
    dark: { textNormal: '#e4e4e7' }
  },
  defaultGlobalThemeColors: {
    light: { textNormal: '#000000' },
    dark: { textNormal: '#e4e4e7' }
  }
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

        // Migration Check: Check if lightModeColors has the new 'bgPrimary' key
        // If not (it's using old schema), force reset to new defaults
        const hasNewSchema = state.lightModeColors && state.lightModeColors.some(c => c.id === 'bgPrimary');
        if (!hasNewSchema) {
          console.log('Migrating color config to new schema...');
          state.lightModeColors = [...defaultLightModeColors];
          state.darkModeColors = [...defaultDarkModeColors];
          state.defaultLightModeColors = [...defaultLightModeColors];
          state.defaultDarkModeColors = [...defaultDarkModeColors];
        }
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
    updateStatusConfig: (state, action: PayloadAction<{ type: StatusConfigType, id: string, color: string }>) => {
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
        case 'lightMode':
          targetArray = state.lightModeColors;
          break;
        case 'darkMode':
          targetArray = state.darkModeColors;
          break;
      }
      
      if (targetArray) {
        const index = targetArray.findIndex(s => s.id === id);
        if (index !== -1) {
          targetArray[index].color = color;
        }
      }
    },
    
    addStatusConfig: (state, action: PayloadAction<{ type: StatusConfigType, name: string, color: string }>) => {
      const { type, name, color } = action.payload;
      const newConfig: StatusConfig = {
        id: generateId(),
        type,
        name,
        color
      };
      
      switch (type) {
        case 'parking':
          state.parkingStatuses.push(newConfig);
          break;
        case 'calendar':
          state.calendarStatuses.push(newConfig);
          break;
        case 'house':
          state.houseStatuses.push(newConfig);
          break;
        case 'lightMode':
          state.lightModeColors.push(newConfig);
          break;
        case 'darkMode':
          state.darkModeColors.push(newConfig);
          break;
      }
    },

    deleteStatusConfig: (state, action: PayloadAction<{ type: StatusConfigType, id: string }>) => {
      const { type, id } = action.payload;
      
      switch (type) {
        case 'parking':
          state.parkingStatuses = state.parkingStatuses.filter(s => s.id !== id);
          break;
        case 'calendar':
          state.calendarStatuses = state.calendarStatuses.filter(s => s.id !== id);
          break;
        case 'house':
          state.houseStatuses = state.houseStatuses.filter(s => s.id !== id);
          break;
        case 'lightMode':
          state.lightModeColors = state.lightModeColors.filter(s => s.id !== id);
          break;
        case 'darkMode':
          state.darkModeColors = state.darkModeColors.filter(s => s.id !== id);
          break;
      }
    },

    resetStatusConfig: (state, action: PayloadAction<StatusConfigType>) => {
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
        case 'lightMode':
          state.lightModeColors = [...state.defaultLightModeColors];
          break;
        case 'darkMode':
          state.darkModeColors = [...state.defaultDarkModeColors];
          break;
      }
    },

    // Global Font Color Reducers
    updateGlobalThemeColor: (state, action: PayloadAction<{ theme: 'light' | 'dark'; color: string }>) => {
      const { theme, color } = action.payload;
      if (state.globalThemeColors && state.globalThemeColors[theme]) {
        state.globalThemeColors[theme].textNormal = color;
      }
    },
    resetGlobalThemeColor: (state, action: PayloadAction<'light' | 'dark' | 'all'>) => {
      if (action.payload === 'all') {
        state.globalThemeColors = { ...state.defaultGlobalThemeColors };
      } else {
        state.globalThemeColors[action.payload] = { ...state.defaultGlobalThemeColors[action.payload] };
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

        // Sync Redux editable state with active config
        const activeConfig = action.payload.configs.find(c => c.id === action.payload.activeConfigId);
        if (activeConfig) {
          // Sync Light Mode Colors
          state.lightModeColors.forEach(status => {
            if (activeConfig.lightMode && (activeConfig.lightMode as any)[status.id]) {
              status.color = (activeConfig.lightMode as any)[status.id];
            }
          });

          // Sync Dark Mode Colors
          state.darkModeColors.forEach(status => {
            if (activeConfig.darkMode && (activeConfig.darkMode as any)[status.id]) {
              status.color = (activeConfig.darkMode as any)[status.id];
            }
          });
          
          // Sync Parking Colors
          state.parkingStatuses.forEach(status => {
             // Map status name to key (assuming fixed names/keys or need a mapping strategy)
             // This part is tricky because status.name might not match keys directly
             // But let's at least sync the main UI colors which are ID-based
          });
        }
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
  addStatusConfig,
  deleteStatusConfig,
  updateGlobalThemeColor,
  resetGlobalThemeColor,
} = configSlice.actions;

export const configActions = configSlice.actions;
export default configSlice.reducer;