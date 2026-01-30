import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DepositRecord, FinancialStats } from '../../types/domain';

export interface DepositState {
  deposits: DepositRecord[];
  stats: FinancialStats;
  loading: boolean;
  error: string | null;
}

const initialState: DepositState = {
  deposits: [],
  stats: {
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    totalDeposits: 0,
    totalRefunds: 0,
    pendingTransactions: 0,
  },
  loading: false,
  error: null,
};

const depositSlice = createSlice({
  name: 'deposit',
  initialState,
  reducers: {
    rehydrate: (state, action: PayloadAction<Partial<DepositState>>) => {
      return { ...state, ...action.payload, loading: false, error: null };
    },
    setDeposits: (state, action: PayloadAction<DepositRecord[]>) => {
      state.deposits = action.payload;
      state.loading = false;
    },
    addDeposit: (state, action: PayloadAction<DepositRecord>) => {
      state.deposits.push(action.payload);
    },
    updateDeposit: (state, action: PayloadAction<{ id: string; updates: Partial<DepositRecord> }>) => {
      const { id, updates } = action.payload;
      const index = state.deposits.findIndex(deposit => deposit.id === id);

      if (index !== -1) {
        state.deposits[index] = { ...state.deposits[index], ...updates };
      }
    },
    deleteDeposit: (state, action: PayloadAction<string>) => {
      state.deposits = state.deposits.filter(deposit => deposit.id !== action.payload);
    },
    updateStats: (state, action: PayloadAction<Partial<FinancialStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setDeposits, addDeposit, updateDeposit, deleteDeposit, updateStats, setLoading, setError } = depositSlice.actions;

export default depositSlice.reducer;