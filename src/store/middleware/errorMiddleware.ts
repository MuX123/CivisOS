// src/store/middleware/errorMiddleware.ts
import { Middleware } from '@reduxjs/toolkit';
import type { RootState } from '../types';

// 錯誤日誌記錄
interface ErrorLog {
  type: 'action' | 'reducer' | 'middleware';
  actionType: string;
  error: string;
  timestamp: string;
  state?: Partial<RootState>;
}

// 錯誤監控 Middleware
export const errorMonitoringMiddleware: Middleware = (store) => (next) => (action) => {
  try {
    // 先執行 action
    const result = next(action);

    // 檢查 action 是否有 _error 屬性（自定義錯誤標記）
    if (action.meta?.arg?.name === 'thunk') {
      const thunkAction = action as any;

      if (thunkAction.error) {
        const errorLog: ErrorLog = {
          type: 'action',
          actionType: thunkAction.type,
          error: thunkAction.error.message || String(thunkAction.error),
          timestamp: new Date().toISOString(),
        };

        // 本地記錄
        console.error('[Redux Error]', errorLog);
      }
    }

    return result;
  } catch (error) {
    // 捕獲同步錯誤
    const errorLog: ErrorLog = {
      type: 'middleware',
      actionType: typeof action === 'object' && action !== null ? (action as any).type : String(action),
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      state: store.getState(),
    };

    console.error('[Redux Middleware Error]', errorLog);
    throw error;
  }
};

// 開發環境錯誤過濾（忽略預期錯誤）
export const ignoredErrors = [
  'Cannot read properties of null',
  'is not a function',
];

export function isIgnoredError(error: string): boolean {
  return ignoredErrors.some((ignored) => error.includes(ignored));
}
