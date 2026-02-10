/**
 * 資料驗證工具函式
 * 用於驗證 CSV 匯入和 IoT 裝置資料
 */

// 基本型別驗證
export const isString = (value: any): value is string => {
    return typeof value === 'string';
};

export const isNumber = (value: any): value is number => {
    return typeof value === 'number' && !isNaN(value);
};

export const isBoolean = (value: any): value is boolean => {
    return typeof value === 'boolean';
};

export const isDate = (value: any): boolean => {
    if (!value) return false;
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
};

// 範圍驗證
export const isInRange = (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
};

// 字串驗證
export const isEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
};

export const isNotEmpty = (value: string): boolean => {
    return value.trim().length > 0;
};

export const maxLength = (value: string, max: number): boolean => {
    return value.length <= max;
};

// 陣列驗證
export const isNonEmptyArray = (value: any): boolean => {
    return Array.isArray(value) && value.length > 0;
};

// 物件驗證
export const hasRequiredFields = <T extends Record<string, any>>(
    obj: any,
    requiredFields: (keyof T)[]
): obj is T => {
    if (!obj || typeof obj !== 'object') return false;
    return requiredFields.every(field => field in obj);
};

// CSV 資料驗證
export interface ValidationRule<T = any> {
    field: string;
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'date' | 'email';
    min?: number;
    max?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: T) => boolean;
    errorMessage?: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

export const validateData = <T extends Record<string, any>>(
    data: T,
    rules: ValidationRule[]
): ValidationResult => {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
        const value = data[rule.field];

        // 必填檢查
        if (rule.required && (value === undefined || value === null || value === '')) {
            errors.push({
                field: rule.field,
                message: rule.errorMessage || `${rule.field} 為必填欄位`,
                value,
            });
            continue;
        }

        // 如果不是必填且值為空,跳過後續驗證
        if (!rule.required && (value === undefined || value === null || value === '')) {
            continue;
        }

        // 型別驗證
        if (rule.type) {
            let typeValid = false;
            switch (rule.type) {
                case 'string':
                    typeValid = isString(value);
                    break;
                case 'number':
                    typeValid = isNumber(value) || (isString(value) && !isNaN(Number(value)));
                    break;
                case 'boolean':
                    typeValid = isBoolean(value) || value === 'true' || value === 'false';
                    break;
                case 'date':
                    typeValid = isDate(value);
                    break;
                case 'email':
                    typeValid = isString(value) && isEmail(value);
                    break;
            }

            if (!typeValid) {
                errors.push({
                    field: rule.field,
                    message: rule.errorMessage || `${rule.field} 型別錯誤,應為 ${rule.type}`,
                    value,
                });
                continue;
            }
        }

        // 數值範圍驗證
        if (rule.type === 'number' && (rule.min !== undefined || rule.max !== undefined)) {
            const numValue = typeof value === 'number' ? value : Number(value);
            if (rule.min !== undefined && numValue < rule.min) {
                errors.push({
                    field: rule.field,
                    message: rule.errorMessage || `${rule.field} 不能小於 ${rule.min}`,
                    value,
                });
            }
            if (rule.max !== undefined && numValue > rule.max) {
                errors.push({
                    field: rule.field,
                    message: rule.errorMessage || `${rule.field} 不能大於 ${rule.max}`,
                    value,
                });
            }
        }

        // 字串長度驗證
        if (rule.type === 'string' && rule.maxLength !== undefined) {
            if (value.length > rule.maxLength) {
                errors.push({
                    field: rule.field,
                    message: rule.errorMessage || `${rule.field} 長度不能超過 ${rule.maxLength}`,
                    value,
                });
            }
        }

        // 正則驗證
        if (rule.pattern && isString(value)) {
            if (!rule.pattern.test(value)) {
                errors.push({
                    field: rule.field,
                    message: rule.errorMessage || `${rule.field} 格式不正確`,
                    value,
                });
            }
        }

        // 自訂驗證
        if (rule.custom && !rule.custom(value)) {
            errors.push({
                field: rule.field,
                message: rule.errorMessage || `${rule.field} 驗證失敗`,
                value,
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

// IoT 感測器資料範圍驗證
export const IoTDataRanges = {
    temperature: { min: -50, max: 100, unit: '°C' },
    humidity: { min: 0, max: 100, unit: '%' },
    pressure: { min: 800, max: 1200, unit: 'hPa' },
    co2: { min: 0, max: 5000, unit: 'ppm' },
    pm25: { min: 0, max: 500, unit: 'μg/m³' },
    voltage: { min: 0, max: 500, unit: 'V' },
    current: { min: 0, max: 100, unit: 'A' },
    power: { min: 0, max: 50000, unit: 'W' },
};

export const validateIoTData = (
    deviceType: string,
    data: Record<string, any>
): ValidationResult => {
    const errors: ValidationError[] = [];

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'number') {
            const range = IoTDataRanges[key as keyof typeof IoTDataRanges];
            if (range) {
                if (!isInRange(value, range.min, range.max)) {
                    errors.push({
                        field: key,
                        message: `${key} 超出合理範圍 (${range.min}-${range.max} ${range.unit})`,
                        value,
                    });
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

export default {
    isString,
    isNumber,
    isBoolean,
    isDate,
    isInRange,
    isEmail,
    isNotEmpty,
    maxLength,
    isNonEmptyArray,
    hasRequiredFields,
    validateData,
    validateIoTData,
    IoTDataRanges,
};
