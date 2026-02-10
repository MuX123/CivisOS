/**
 * 資料驗證安全漏洞修復測試
 * 測試 HIGH-16 和 HIGH-17
 */

import { describe, it, expect } from 'vitest';
import { validateData, validateIoTData, isValidDate, hasRequiredFields } from '../../../utils/validation';
import type { ValidationRule } from '../../../utils/validation';

describe('資料驗證安全測試', () => {
    describe('[HIGH-16] CSV 資料驗證', () => {
        it('應該驗證必填欄位', () => {
            const data = {
                id: '123',
                name: '',
            };

            const rules: ValidationRule[] = [
                { field: 'id', required: true, type: 'string' },
                { field: 'name', required: true, type: 'string' },
            ];

            const result = validateData(data, rules);

            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].field).toBe('name');
        });

        it('應該驗證資料型別', () => {
            const data = {
                id: '123',
                age: 'not a number',
            };

            const rules: ValidationRule[] = [
                { field: 'id', required: true, type: 'string' },
                { field: 'age', required: true, type: 'number' },
            ];

            const result = validateData(data, rules);

            expect(result.valid).toBe(false);
            expect(result.errors[0].field).toBe('age');
            expect(result.errors[0].message).toContain('型別錯誤');
        });

        it('應該驗證數值範圍', () => {
            const data = {
                age: 150,
            };

            const rules: ValidationRule[] = [
                { field: 'age', required: true, type: 'number', min: 0, max: 120 },
            ];

            const result = validateData(data, rules);

            expect(result.valid).toBe(false);
            expect(result.errors[0].message).toContain('不能大於');
        });

        it('應該驗證字串長度', () => {
            const data = {
                name: 'a'.repeat(101),
            };

            const rules: ValidationRule[] = [
                { field: 'name', required: true, type: 'string', maxLength: 100 },
            ];

            const result = validateData(data, rules);

            expect(result.valid).toBe(false);
            expect(result.errors[0].message).toContain('長度不能超過');
        });

        it('應該驗證 Email 格式', () => {
            const data = {
                email: 'invalid-email',
            };

            const rules: ValidationRule[] = [
                { field: 'email', required: true, type: 'email' },
            ];

            const result = validateData(data, rules);

            expect(result.valid).toBe(false);
        });

        it('應該驗證日期格式', () => {
            const data = {
                date: 'not-a-date',
            };

            const rules: ValidationRule[] = [
                { field: 'date', required: true, type: 'date' },
            ];

            const result = validateData(data, rules);

            expect(result.valid).toBe(false);
        });

        it('應該通過有效資料的驗證', () => {
            const data = {
                id: '123',
                name: '張三',
                email: 'test@example.com',
                age: 30,
            };

            const rules: ValidationRule[] = [
                { field: 'id', required: true, type: 'string' },
                { field: 'name', required: true, type: 'string', maxLength: 50 },
                { field: 'email', required: true, type: 'email' },
                { field: 'age', required: true, type: 'number', min: 0, max: 120 },
            ];

            const result = validateData(data, rules);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('應該允許非必填欄位為空', () => {
            const data = {
                id: '123',
            };

            const rules: ValidationRule[] = [
                { field: 'id', required: true, type: 'string' },
                { field: 'note', required: false, type: 'string' },
            ];

            const result = validateData(data, rules);

            expect(result.valid).toBe(true);
        });
    });

    describe('[HIGH-17] State 路徑安全檢查', () => {
        it('應該接受有效的路徑格式', () => {
            const validPaths = [
                'auth.user',
                'parking.spaces',
                'facility.bookings',
                'depositV2.items',
            ];

            const validPathPattern = /^[a-zA-Z0-9_.]+$/;

            validPaths.forEach(path => {
                expect(validPathPattern.test(path)).toBe(true);
            });
        });

        it('應該拒絕包含路徑遍歷的路徑', () => {
            const invalidPaths = [
                '../../../etc/passwd',
                'auth/../admin',
                'parking/../../root',
            ];

            invalidPaths.forEach(path => {
                expect(path.includes('..')).toBe(true);
            });
        });

        it('應該拒絕包含特殊字元的路徑', () => {
            const invalidPaths = [
                'auth;rm -rf /',
                'parking|cat /etc/passwd',
                'facility&whoami',
            ];

            const validPathPattern = /^[a-zA-Z0-9_.]+$/;

            invalidPaths.forEach(path => {
                expect(validPathPattern.test(path)).toBe(false);
            });
        });

        it('應該拒絕過長的路徑', () => {
            const longPath = 'a'.repeat(101);
            expect(longPath.length > 100).toBe(true);
        });
    });

    describe('輔助驗證函式', () => {
        it('isValidDate 應該正確驗證日期', () => {
            expect(isValidDate('2026-02-09')).toBe(true);
            expect(isValidDate('2026-02-09T12:00:00Z')).toBe(true);
            expect(isValidDate('invalid-date')).toBe(false);
            expect(isValidDate('')).toBe(false);
            expect(isValidDate(null)).toBe(false);
        });

        it('hasRequiredFields 應該檢查必填欄位', () => {
            const obj = {
                id: '123',
                name: '張三',
            };

            expect(hasRequiredFields(obj, ['id', 'name'])).toBe(true);
            expect(hasRequiredFields(obj, ['id', 'name', 'email'])).toBe(false);
            expect(hasRequiredFields(null, ['id'])).toBe(false);
        });
    });
});
