import { createSlice, PayloadAction } from '@reduxjs/toolkit';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 人員類型
export type PersonType = 'resident' | 'external';

// 人員資訊
export interface PersonInfo {
  type: PersonType;
  name: string;
  buildingId?: string;
  unitId?: string;
}

// 寄放類型
export type DepositType = 'item' | 'money' | 'key';

// 交易記錄（僅限寄錢）
export interface MoneyTransaction {
  id: string;
  type: 'add' | 'subtract';
  amount: number;
  timestamp: string;
  staffName: string;
  note?: string; // 修復 lint 錯誤
}

// 寄放項目狀態
export type DepositStatus = 'active' | 'retrieved' | 'cancelled';

// 寄放項目
export interface DepositItemV2 {
  id: string;
  types: DepositType[]; // 可同時是多種類型
  itemName: string;
  sender: PersonInfo;
  receiver: PersonInfo;
  depositTime: string;
  staffName: string;
  notes?: string;
  status: DepositStatus;

  // 寄錄專用欄位
  transactions?: MoneyTransaction[];
  currentBalance?: number;

  // 日誌相關
  logs: DepositLog[];

  createdAt: string;
  updatedAt: string;
  retrievedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
}

// 日誌項目
export interface DepositLog {
  id: string;
  action: 'create' | 'edit' | 'retrieve' | 'cancel' | 'add_money' | 'subtract_money';
  timestamp: string;
  staffName: string;
  details: string;
  amount?: number;
  isReverted?: boolean; // 是否已被取消/返還
}

// 搜尋條件
export interface SearchCriteria {
  keyword: string;
  fields: ('sender' | 'receiver' | 'itemName' | 'staff' | 'notes')[];
  dateFrom?: string;
  dateTo?: string;
}

export interface DepositV2State {
  items: DepositItemV2[];
  searchCriteria: SearchCriteria;
  loading: boolean;
  error: string | null;
}

const initialState: DepositV2State = {
  items: [],
  searchCriteria: {
    keyword: '',
    fields: ['sender', 'receiver', 'itemName', 'staff', 'notes'],
  },
  loading: false,
  error: null,
};

const depositV2Slice = createSlice({
  name: 'depositV2',
  initialState,
  reducers: {
    rehydrate: (state, action: PayloadAction<Partial<DepositV2State>>) => {
      if (action.payload) {
        Object.assign(state, action.payload);
      }
    },

    // 新增寄放項目
    addDepositItem: (state, action: PayloadAction<Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'>>) => {
      const now = new Date().toISOString();
      const newItem: DepositItemV2 = {
        ...action.payload,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        logs: [
          {
            id: generateId(),
            action: 'create',
            timestamp: now,
            staffName: action.payload.staffName,
            details: `新增登記：${action.payload.itemName || '無物品名稱'}`,
          },
        ],
      };
      state.items.push(newItem);
    },

    // 編輯寄放項目
    editDepositItem: (state, action: PayloadAction<{ id: string; updates: Partial<DepositItemV2>; staffName: string }>) => {
      const { id, updates, staffName } = action.payload;
      const index = state.items.findIndex((i) => i.id === id);
      if (index !== -1) {
        const now = new Date().toISOString();
        state.items[index] = {
          ...state.items[index],
          ...updates,
          updatedAt: now,
        };
        state.items[index].logs.push({
          id: generateId(),
          action: 'edit',
          timestamp: now,
          staffName,
          details: `編輯資料`,
        });
      }
    },

    // 領取寄放項目
    retrieveDepositItem: (state, action: PayloadAction<{ id: string; staffName: string }>) => {
      const { id, staffName } = action.payload;
      const index = state.items.findIndex((i) => i.id === id);
      if (index !== -1 && state.items[index].status === 'active') {
        const now = new Date().toISOString();
        state.items[index].status = 'retrieved';
        state.items[index].retrievedAt = now;
        state.items[index].updatedAt = now;
        state.items[index].logs.push({
          id: generateId(),
          action: 'retrieve',
          timestamp: now,
          staffName,
          details: `完成領取`,
        });
      }
    },

    // 還原寄放項目 - 修復 HIGH-12 & MEDIUM-13
    revertDepositItem: (state, action: PayloadAction<{ id: string; staffName: string }>) => {
      const { id, staffName } = action.payload;
      const index = state.items.findIndex((i) => i.id === id);
      if (index !== -1) {
        const item = state.items[index];

        // 修復 MEDIUM-13: 檢查狀態，防止對已領收或已取消的項目進行還原
        if (item.status !== 'active') {
          console.error(`[Deposit] 無法還原項目 ${id}: 狀態為 ${item.status}`);
          state.error = `無法還原：項目目前狀態為 ${item.status === 'retrieved' ? '已領取' : '已取消'}。`;
          return;
        }

        const now = new Date().toISOString();

        // 標記為已還原（使用取消狀態）
        item.status = 'cancelled';
        item.cancelledAt = now;
        item.cancelledBy = staffName;
        item.updatedAt = now;

        // 修復 HIGH-12: 優化還原操作的金額處理
        const currentBalance = item.currentBalance || 0;
        if (item.types.includes('money') && currentBalance !== 0) {
          // 確保如果是正數，則返還給用戶；如果是負數，則補正
          // 這筆記錄必須清楚說明是「還原時的金額清算」
          const revertTransaction: MoneyTransaction = {
            id: generateId(),
            type: currentBalance > 0 ? 'subtract' : 'add',
            amount: Math.abs(currentBalance),
            timestamp: now,
            staffName,
            note: '還原時自動平衡餘額'
          };

          item.transactions = item.transactions || [];
          item.transactions.push(revertTransaction);

          // 餘額清零
          item.currentBalance = 0;
        }

        item.logs.push({
          id: generateId(),
          action: 'cancel',
          timestamp: now,
          staffName,
          details: `還原登記 - 現有餘額 ${currentBalance} 已${currentBalance >= 0 ? '返還' : '補繳'}並結清`,
        });

        state.error = null;
      }
    },

    // 加款
    addMoney: (state, action: PayloadAction<{ id: string; amount: number; staffName: string }>) => {
      const { id, amount, staffName } = action.payload;
      const index = state.items.findIndex((i) => i.id === id);
      if (index !== -1 && state.items[index].status === 'active') {
        const now = new Date().toISOString();
        const item = state.items[index];

        if (!item.types.includes('money')) {
          item.types.push('money');
        }

        const transaction: MoneyTransaction = {
          id: generateId(),
          type: 'add',
          amount,
          timestamp: now,
          staffName,
        };

        item.transactions = item.transactions || [];
        item.transactions.push(transaction);
        item.currentBalance = (item.currentBalance || 0) + amount;
        item.updatedAt = now;

        item.logs.push({
          id: generateId(),
          action: 'add_money',
          timestamp: now,
          staffName,
          details: `加款 $${amount.toLocaleString()}`,
          amount,
        });
      }
    },

    // 扣款(帶餘額檢查) - 修復 CRITICAL-11: 移除 skipCheck 參數
    subtractMoney: (state, action: PayloadAction<{ id: string; amount: number; staffName: string }>) => {
      const { id, amount, staffName } = action.payload;
      const index = state.items.findIndex((i) => i.id === id);
      if (index !== -1 && state.items[index].status === 'active') {
        const item = state.items[index];
        const currentBalance = item.currentBalance || 0;

        // 強制檢查餘額是否充足
        if (amount > currentBalance) {
          // 餘額不足,記錄錯誤並設置錯誤狀態
          const now = new Date().toISOString();
          item.logs.push({
            id: generateId(),
            action: 'subtract_money',
            timestamp: now,
            staffName,
            details: `扣款失敗：餘額不足（嘗試扣款$${amount.toLocaleString()}，目前餘額$${currentBalance.toLocaleString()}）`,
            amount,
          });
          state.error = `餘額不足: 嘗試扣款 $${amount.toLocaleString()}, 目前餘額 $${currentBalance.toLocaleString()}`;
          return;
        }

        const now = new Date().toISOString();

        if (!item.types.includes('money')) {
          item.types.push('money');
        }

        const transaction: MoneyTransaction = {
          id: generateId(),
          type: 'subtract',
          amount,
          timestamp: now,
          staffName,
        };

        item.transactions = item.transactions || [];
        item.transactions.push(transaction);
        item.currentBalance = currentBalance - amount;
        item.updatedAt = now;

        item.logs.push({
          id: generateId(),
          action: 'subtract_money',
          timestamp: now,
          staffName,
          details: `扣款 $${amount.toLocaleString()}，餘額 $${currentBalance.toLocaleString()} → $${item.currentBalance.toLocaleString()}`,
          amount,
        });

        // 清除錯誤狀態
        state.error = null;
      }
    },

    // 更新搜尋條件
    setSearchCriteria: (state, action: PayloadAction<Partial<SearchCriteria>>) => {
      state.searchCriteria = { ...state.searchCriteria, ...action.payload };
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 清除所有資料
    clearAllData: (state) => {
      state.items = [];
      state.searchCriteria = initialState.searchCriteria;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  rehydrate,
  addDepositItem,
  editDepositItem,
  retrieveDepositItem,
  revertDepositItem,
  addMoney,
  subtractMoney,
  setSearchCriteria,
  setLoading,
  setError,
  clearAllData,
} = depositV2Slice.actions;

export const depositV2Actions = depositV2Slice.actions;
export default depositV2Slice.reducer;
