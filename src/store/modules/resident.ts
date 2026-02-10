import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ResidentV2, Tenant, ResidentStatus } from '../../types/domain'

// NOTE: Using ResidentV2 as per domain.ts for the refactored system
// Need to support new structure: Members, Tenants, License Plates (in resident), Cards.

export interface ResidentState {
  residents: ResidentV2[] // Using V2
  accessCards: any[] // 增加以解決型別錯誤
  licensePlates: any[] // 增加以解決型別錯誤
  stats: any // 增加以解決型別錯誤
  statuses: ResidentStatus[] // Custom statuses
  loading: boolean
  error: string | null
}

const defaultStatuses: ResidentStatus[] = [
  { id: 'status-owner', name: '自住', color: '#10b981' }, // emerald-500
  { id: 'status-rent', name: '出租', color: '#f59e0b' }, // amber-500
  { id: 'status-vacant', name: '空屋', color: '#9ca3af' }, // gray-400
  { id: 'status-decoration', name: '裝潢中', color: '#8b5cf6' }, // violet-500
];

const initialState: ResidentState = {
  residents: [],
  accessCards: [],
  licensePlates: [],
  stats: {
    totalResidents: 0,
    activeResidents: 0,
    pendingResidents: 0,
    totalMembers: 0,
    activeAccessCards: 0,
    expiredAccessCards: 0,
    lostAccessCards: 0,
    registeredPlates: 0,
    pendingPlates: 0,
  },
  statuses: defaultStatuses,
  loading: false,
  error: null,
}

const residentSlice = createSlice({
  name: 'resident',
  initialState,
  reducers: {
    rehydrate: (state, action: PayloadAction<Partial<ResidentState>>) => {
      // Logic to merge persisted state
      if (action.payload.residents) state.residents = action.payload.residents;
      if (action.payload.statuses) state.statuses = action.payload.statuses;
    },

    // Resident CRUD
    setResidents: (state, action: PayloadAction<ResidentV2[]>) => {
      state.residents = action.payload;
    },

    upsertResident: (state, action: PayloadAction<ResidentV2>) => {
      // 修復 HIGH-14: 使用 id 優先匹配，次之使用 unitId，確保更新目標準確
      const index = state.residents.findIndex(r =>
        (action.payload.id && r.id === action.payload.id) ||
        (r.unitId === action.payload.unitId && !action.payload.id)
      );

      if (index !== -1) {
        // 合併更新，保留未更新的欄位 (如原有成員名單)
        state.residents[index] = { ...state.residents[index], ...action.payload };
        state.residents[index].updatedAt = new Date().toISOString();
      } else {
        // 新增住戶，確保有 ID
        const newResident = {
          ...action.payload,
          id: action.payload.id || `resident_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        state.residents.push(newResident);
      }
      state.error = null;
    },

    // Status CRUD
    addStatus: (state, action: PayloadAction<ResidentStatus>) => {
      state.statuses.push(action.payload);
    },
    updateStatus: (state, action: PayloadAction<ResidentStatus>) => {
      const index = state.statuses.findIndex(s => s.id === action.payload.id);
      if (index !== -1) state.statuses[index] = action.payload;
    },
    deleteStatus: (state, action: PayloadAction<string>) => {
      // 修復 MEDIUM-15: 級聯檢查 - 確保該狀態未被任何住戶使用
      const isUsed = state.residents.some(r => r.statusId === action.payload);
      if (isUsed) {
        console.warn(`[Resident] 無法刪除狀態 ${action.payload}: 仍有住戶在使用`);
        state.error = '無法刪除：仍有住戶使用此狀態，請先變更住戶狀態。';
        return;
      }

      state.statuses = state.statuses.filter(s => s.id !== action.payload);
      state.error = null;
    },

    // 初始化 Actions
    initializeResidents: (state, action: PayloadAction<ResidentV2[]>) => {
      state.residents = action.payload;
    },
    initializeAccessCards: (state, action: PayloadAction<any[]>) => {
      state.accessCards = action.payload;
    },
    initializeLicensePlates: (state, action: PayloadAction<any[]>) => {
      state.licensePlates = action.payload;
    },
    updateStats: (state, action: PayloadAction<any>) => {
      state.stats = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const residentActions = residentSlice.actions

export default residentSlice.reducer
