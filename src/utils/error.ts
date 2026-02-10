/**
 * 統一錯誤處理機制 - 修復 LOW-24
 * 提供一致的錯誤紀錄、格式化與處理方式
 */

export enum ErrorLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    CRITICAL = 'CRITICAL'
}

export interface AppError {
    code: string;
    message: string;
    level: ErrorLevel;
    timestamp: string;
    context?: Record<string, any>;
    originalError?: any;
}

export class ErrorHandler {
    private static instance: ErrorHandler;
    private errorLog: AppError[] = [];
    private readonly MAX_LOG_SIZE = 500;

    private constructor() { }

    static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    /**
     * 處理錯誤並記錄
     */
    handle(message: string, options: {
        code?: string,
        level?: ErrorLevel,
        context?: Record<string, any>,
        originalError?: any
    } = {}): AppError {
        const error: AppError = {
            code: options.code || 'UNKNOWN_ERROR',
            message: message,
            level: options.level || ErrorLevel.ERROR,
            timestamp: new Date().toISOString(),
            context: options.context,
            originalError: options.originalError
        };

        // 輸出到控制台
        this.logToConsole(error);

        // 保存到記憶體日誌
        this.errorLog.unshift(error);
        if (this.errorLog.length > this.MAX_LOG_SIZE) {
            this.errorLog = this.errorLog.slice(0, this.MAX_LOG_SIZE);
        }

        return error;
    }

    private logToConsole(error: AppError) {
        const logMsg = `[${error.level}] ${error.code}: ${error.message}`;

        switch (error.level) {
            case ErrorLevel.INFO:
                console.info(logMsg, error.context || '');
                break;
            case ErrorLevel.WARN:
                console.warn(logMsg, error.context || '');
                break;
            case ErrorLevel.ERROR:
            case ErrorLevel.CRITICAL:
                console.error(logMsg, error.context || '', error.originalError || '');
                break;
        }
    }

    /**
     * 獲取錯誤日誌
     */
    getErrors(): AppError[] {
        return [...this.errorLog];
    }

    /**
     * 清除日誌
     */
    clearLog() {
        this.errorLog = [];
    }
}

export const errorHandler = ErrorHandler.getInstance();
export default errorHandler;

/**
 * 便利包裝函式：建立與處理特定的錯誤類型
 */
export const logError = (msg: string, code = 'ERR', context?: any) =>
    errorHandler.handle(msg, { code, level: ErrorLevel.ERROR, context });

export const logWarning = (msg: string, code = 'WARN', context?: any) =>
    errorHandler.handle(msg, { code, level: ErrorLevel.WARN, context });

export const logCritical = (msg: string, code = 'FATAL', originalError?: any) =>
    errorHandler.handle(msg, { code, level: ErrorLevel.CRITICAL, originalError });
