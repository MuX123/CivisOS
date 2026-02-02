import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { FeeUnit } from '../../types/domain';
import type { FeeBaseConfig, SpecialFeeConfig, UnitFeeDetail, FeeStats, PaymentPeriod, FeeAdditionalItem } from '../../types/fee';
import { feeService } from '../../services/feeService';
import type { UnitConfig } from '../../types/building';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export interface FeeState {
  // 戶別管理費資料
  units: FeeUnit[];
  // 基礎配置 (區塊一新增)
  baseConfigs: FeeBaseConfig[];
  // 特殊配置 (區塊一新增)
  specialConfigs: SpecialFeeConfig[];
  // 戶別管理費詳情 (區塊一新增)
  unitFeeDetails: UnitFeeDetail[];
  // 統計資料 (區塊一新增)
  stats: FeeStats | null;
  // 繳費期數設定
  periods: PaymentPeriod[];
  selectedPeriod: string | null;
  // 預設費率
  defaultArea: number;
  defaultPricePerPing: number;
  // 全域自訂費用項目
  customFeeItems: FeeAdditionalItem[];
  // 狀態
  loading: boolean;
  error: string | null;
}

const initialState: FeeState = {
  units: [],
  baseConfigs: [],
  specialConfigs: [],
  unitFeeDetails: [],
  stats: null,
  periods: [], // 繳費期數設定
  selectedPeriod: null, // 目前選中的期數
  defaultArea: 30, // 預設 30 坪
  defaultPricePerPing: 100, // 預設每坪 100 元
  customFeeItems: [], // 全域自訂費用項目
  loading: false,
  error: null,
};

// 初始化管理費計算 (區塊一新增)
export const initializeFeeCalculation = createAsyncThunk(
  'fee/initialize',
  async (
    { units, baseConfigs }: { units: UnitConfig[]; baseConfigs: FeeBaseConfig[] },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { fee: FeeState };
      const specialConfigs = state.fee.specialConfigs;

      const details = feeService.calculateAllUnitFees(units, baseConfigs, specialConfigs);
      const stats = feeService.calculateStats(details);

      return { details, stats };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '初始化失敗');
    }
  }
);

// 重新計算所有管理費 (區塊一新增)
export const recalculateAllFees = createAsyncThunk(
  'fee/recalculateAll',
  async (
    { units, baseConfigs }: { units: UnitConfig[]; baseConfigs: FeeBaseConfig[] },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { fee: FeeState };
      const specialConfigs = state.fee.specialConfigs;

      const details = feeService.calculateAllUnitFees(units, baseConfigs, specialConfigs);
      const stats = feeService.calculateStats(details);

      return { details, stats };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '重新計算失敗');
    }
  }
);

const feeSlice = createSlice({
  name: 'fee',
  initialState,
  reducers: {
    initializeUnits: (state, action: PayloadAction<FeeUnit[]>) => {
      state.units = action.payload;
      state.loading = false;
    },
    addFeeUnit: (state, action: PayloadAction<FeeUnit>) => {
      state.units.push(action.payload);
    },
    updateFeeUnit: (state, action: PayloadAction<{ id: string; updates: Partial<FeeUnit> }>) => {
      const index = state.units.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.units[index] = { ...state.units[index], ...action.payload.updates };
      }
    },
    deleteFeeUnit: (state, action: PayloadAction<string>) => {
      state.units = state.units.filter(u => u.id !== action.payload);
    },
    // 批量設定坪數和單價
    batchUpdateSettings: (state, action: PayloadAction<{ area?: number; pricePerPing?: number }>) => {
      if (action.payload.area) {
        state.defaultArea = action.payload.area;
      }
      if (action.payload.pricePerPing) {
        state.defaultPricePerPing = action.payload.pricePerPing;
      }
    },
    // 計算總費
    calculateTotalFee: (state, action: PayloadAction<string>) => {
      const unit = state.units.find(u => u.id === action.payload);
      if (unit) {
        const area = unit.customArea || state.defaultArea;
        const price = unit.customPrice || state.defaultPricePerPing;
        unit.area = area;
        unit.pricePerPing = price;
        unit.totalFee = area * price;
      }
    },
    setPaymentStatus: (state, action: PayloadAction<{ id: string; status: 'paid' | 'unpaid' | 'partial' }>) => {
      const unit = state.units.find(u => u.id === action.payload.id);
      if (unit) {
        unit.paymentStatus = action.payload.status;
        if (action.payload.status === 'paid') {
          unit.lastPaymentDate = new Date().toISOString();
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // ========== 區塊一新增 ==========
    // 基礎配置
    setBaseConfigs: (state, action: PayloadAction<FeeBaseConfig[]>) => {
      state.baseConfigs = action.payload;
    },
    addBaseConfig: (state, action: PayloadAction<Omit<FeeBaseConfig, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const config: FeeBaseConfig = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.baseConfigs.push(config);
    },
    updateBaseConfig: (state, action: PayloadAction<FeeBaseConfig>) => {
      const index = state.baseConfigs.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.baseConfigs[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteBaseConfig: (state, action: PayloadAction<string>) => {
      state.baseConfigs = state.baseConfigs.filter(c => c.id !== action.payload);
    },
    // 特殊配置
    setSpecialConfigs: (state, action: PayloadAction<SpecialFeeConfig[]>) => {
      state.specialConfigs = action.payload;
    },
    addSpecialConfig: (state, action: PayloadAction<Omit<SpecialFeeConfig, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const config: SpecialFeeConfig = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.specialConfigs.push(config);
    },
    updateSpecialConfig: (state, action: PayloadAction<SpecialFeeConfig>) => {
      const index = state.specialConfigs.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.specialConfigs[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteSpecialConfig: (state, action: PayloadAction<string>) => {
      state.specialConfigs = state.specialConfigs.filter(c => c.id !== action.payload);
    },
    // 戶別管理費詳情
    setUnitFeeDetails: (state, action: PayloadAction<UnitFeeDetail[]>) => {
      state.unitFeeDetails = action.payload;
    },
    updateUnitFeeRemark: (state, action: PayloadAction<{ unitId: string; remark: string }>) => {
      const detail = state.unitFeeDetails.find(d => d.unitId === action.payload.unitId);
      if (detail) {
        detail.remark = action.payload.remark;
        detail.updatedAt = new Date().toISOString();
      }
    },
    // 統計
    setStats: (state, action: PayloadAction<FeeStats>) => {
      state.stats = action.payload;
    },
    // ========== 繳費期數管理 ==========
    setPeriods: (state, action: PayloadAction<PaymentPeriod[]>) => {
      state.periods = action.payload;
    },
    addPeriod: (state, action: PayloadAction<Omit<PaymentPeriod, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const period: PaymentPeriod = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.periods.push(period);
    },
    updatePeriod: (state, action: PayloadAction<PaymentPeriod>) => {
      const index = state.periods.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.periods[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deletePeriod: (state, action: PayloadAction<string>) => {
      state.periods = state.periods.filter((p) => p.id !== action.payload);
    },
    setSelectedPeriod: (state, action: PayloadAction<string | null>) => {
      state.selectedPeriod = action.payload;
    },
    // ========== 全域自訂費用項目管理 ==========
    setCustomFeeItems: (state, action: PayloadAction<FeeAdditionalItem[]>) => {
      state.customFeeItems = action.payload;
    },
    addCustomFeeItem: (state, action: PayloadAction<Omit<FeeAdditionalItem, 'id'>>) => {
      const item: FeeAdditionalItem = {
        ...action.payload,
        id: generateId(),
      };
      state.customFeeItems.push(item);
    },
    updateCustomFeeItem: (state, action: PayloadAction<FeeAdditionalItem>) => {
      const index = state.customFeeItems.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.customFeeItems[index] = action.payload;
      }
    },
    deleteCustomFeeItem: (state, action: PayloadAction<string>) => {
      state.customFeeItems = state.customFeeItems.filter(i => i.id !== action.payload);
    },
    // 重新水合（從持久化儲存恢復）
    rehydrate: (state, action: PayloadAction<FeeState>) => {
      // 合併持久化資料與當前狀態
      Object.assign(state, action.payload);
    },
    // 清除所有設定資料
    clearAllData: (state) => {
      state.baseConfigs = [];
      state.specialConfigs = [];
      state.unitFeeDetails = [];
      state.periods = [];
      state.customFeeItems = [];
      state.stats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 初始化
      .addCase(initializeFeeCalculation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeFeeCalculation.fulfilled, (state, action) => {
        state.loading = false;
        state.unitFeeDetails = action.payload.details;
        state.stats = action.payload.stats;
      })
      .addCase(initializeFeeCalculation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 重新計算
      .addCase(recalculateAllFees.pending, (state) => {
        state.loading = true;
      })
      .addCase(recalculateAllFees.fulfilled, (state, action) => {
        state.loading = false;
        state.unitFeeDetails = action.payload.details;
        state.stats = action.payload.stats;
      })
      .addCase(recalculateAllFees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const feeActions = feeSlice.actions;
export default feeSlice.reducer;

// Selector
export const selectFee = (state: { fee: FeeState }) => state.fee;
