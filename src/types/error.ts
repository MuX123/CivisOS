// src/types/error.ts

// 基礎錯誤介面
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// API 錯誤響應
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// 錯誤碼定義
export const ErrorCode = {
  // 通用錯誤
  UNKNOWN: 'UNKNOWN',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // 認證錯誤
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  PERMISSION_DENIED: 'PERMISSION_DENIED',

  // 業務錯誤
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',

  // 伺服器錯誤
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_GATEWAY: 'BAD_GATEWAY',
} as const;

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

// 錯誤碼對應訊息
export const ErrorMessage: Record<ErrorCodeType, string> = {
  [ErrorCode.UNKNOWN]: '發生未知錯誤，請稍後再試',
  [ErrorCode.NETWORK_ERROR]: '網路連線異常，請檢查網路設定',
  [ErrorCode.TIMEOUT]: '請求超時，請稍後再試',
  [ErrorCode.AUTH_REQUIRED]: '請先登入以繼續操作',
  [ErrorCode.AUTH_EXPIRED]: '登入已過期，請重新登入',
  [ErrorCode.AUTH_INVALID]: '登入狀態無效，請重新登入',
  [ErrorCode.PERMISSION_DENIED]: '您沒有權限執行此操作',
  [ErrorCode.VALIDATION_ERROR]: '資料驗證失敗，請檢查輸入內容',
  [ErrorCode.NOT_FOUND]: '找不到請求的資源',
  [ErrorCode.CONFLICT]: '資料衝突，請重新操作',
  [ErrorCode.INTERNAL_ERROR]: '伺服器內部錯誤',
  [ErrorCode.BAD_GATEWAY]: '服務暫時不可用',
};
