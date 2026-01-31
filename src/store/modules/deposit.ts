import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DepositItem, DepositMoney } from '../../types/domain';

export interface DepositState {
  items: DepositItem[];
  moneyRecords: DepositMoney[];
  loading: boolean;
  error: string | null;
}

const initialState: DepositState = {
  items: [],
  moneyRecords: [],
  loading: false,
  error: null,
};

const depositSlice = createSlice({
  name: 'deposit',
  initialState,
  reducers: {
    // 初始化物品寄放
    initializeItems: (state, action: PayloadAction<DepositItem[]>) => {
      state.items = action.payload;
    },
    // 添加物品寄放
    addDepositItem: (state, action: PayloadAction<DepositItem>) => {
      state.items.push(action.payload);
    },
    // 更新物品寄放
    updateDepositItem: (state, action: PayloadAction<{ id: string; updates: Partial<DepositItem> }>) => {
      const index = state.items.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
      }
    },
    // 刪除物品寄放
    deleteDepositItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    // 領回物品
    retrieveItem: (state, action: PayloadAction<{ id: string; retrievedBy: string }>) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.status = 'retrieved';
        item.retrievedAt = new Date().toISOString();
        item.retrievedBy = action.payload.retrievedBy;
      }
    },
    // 初始化金額寄放
    initializeMoneyRecords: (state, action: PayloadAction<DepositMoney[]>) => {
      state.moneyRecords = action.payload;
    },
    // 添加金額寄放
    addMoneyRecord: (state, action: PayloadAction<DepositMoney>) => {
      state.moneyRecords.push(action.payload);
    },
    // 加款
    addMoney: (state, action: PayloadAction<{ recordId: string; transaction: Omit<import('../../types/domain').MoneyTransaction, 'id' | 'createdAt'> }>) => {
      const record = state.moneyRecords.find(r => r.id === action.payload.recordId);
      if (record) {
        const transaction: import('../../types/domain').MoneyTransaction = {
          ...action.payload.transaction,
          id: `txn-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        record.transactions.push(transaction);
        if (transaction.type === 'add') {
          record.balance += transaction.amount;
        } else {
          record.balance -= transaction.amount;
        }
        record.updatedAt = new Date().toISOString();
      }
    },
    // 刪除金額記錄
    deleteMoneyRecord: (state, action: PayloadAction<string>) => {
      state.moneyRecords = state.moneyRecords.filter(r => r.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const depositActions = depositSlice.actions;
export default depositSlice.reducer;
