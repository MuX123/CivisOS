// src/lib/apiErrors.ts
import type { ApiErrorResponse, AppError, ErrorCodeType } from '@/types/error';
import { ErrorCode, ErrorMessage } from '@/types/error';

interface AxiosErrorResponse {
  data?: ApiErrorResponse;
  status?: number;
  message?: string;
}

/**
 * 判斷是否為 Axios 錯誤
 */
export function isAxiosError(error: unknown): error is { response?: AxiosErrorResponse } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error
  );
}

/**
 * 將錯誤響應轉換為標準格式
 */
export function parseApiError(error: unknown): AppError {
  const timestamp = new Date().toISOString();

  // 網路錯誤
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      code: ErrorCode.NETWORK_ERROR,
      message: ErrorMessage[ErrorCode.NETWORK_ERROR],
      timestamp,
    };
  }

  // Axios 錯誤
  if (isAxiosError(error)) {
    const response = error.response;
    const status = response?.status;

    // 根據 HTTP 狀態碼映射錯誤
    if (status === 401) {
      return {
        code: ErrorCode.AUTH_REQUIRED,
        message: ErrorMessage[ErrorCode.AUTH_REQUIRED],
        details: response?.data?.details,
        timestamp,
      };
    }

    if (status === 403) {
      return {
        code: ErrorCode.PERMISSION_DENIED,
        message: ErrorMessage[ErrorCode.PERMISSION_DENIED],
        details: response?.data?.details,
        timestamp,
      };
    }

    if (status === 404) {
      return {
        code: ErrorCode.NOT_FOUND,
        message: ErrorMessage[ErrorCode.NOT_FOUND],
        details: response?.data?.details,
        timestamp,
      };
    }

    if (status === 422 || status === 400) {
      return {
        code: ErrorCode.VALIDATION_ERROR,
        message: response?.data?.error || ErrorMessage[ErrorCode.VALIDATION_ERROR],
        details: response?.data?.details,
        timestamp,
      };
    }

    if (status === 409) {
      return {
        code: ErrorCode.CONFLICT,
        message: ErrorMessage[ErrorCode.CONFLICT],
        details: response?.data?.details,
        timestamp,
      };
    }

    if (status && status >= 500) {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: ErrorMessage[ErrorCode.INTERNAL_ERROR],
        timestamp,
      };
    }

    // 其他狀態碼
    return {
      code: ErrorCode.UNKNOWN,
      message: response?.data?.error || (error instanceof Error ? error.message : ErrorMessage[ErrorCode.UNKNOWN]),
      timestamp,
    };
  }

  // Promise 錯誤
  if (error instanceof Error) {
    if (error.name === 'TimeoutError') {
      return {
        code: ErrorCode.TIMEOUT,
        message: ErrorMessage[ErrorCode.TIMEOUT],
        timestamp,
      };
    }

    return {
      code: ErrorCode.UNKNOWN,
      message: error.message || ErrorMessage[ErrorCode.UNKNOWN],
      timestamp,
    };
  }

  // 未知錯誤
  return {
    code: ErrorCode.UNKNOWN,
    message: ErrorMessage[ErrorCode.UNKNOWN],
    timestamp,
  };
}

/**
 * 建立自定義錯誤
 */
export function createAppError(
  code: ErrorCodeType,
  details?: Record<string, unknown>
): AppError {
  return {
    code,
    message: ErrorMessage[code],
    details,
    timestamp: new Date().toISOString(),
  };
}
