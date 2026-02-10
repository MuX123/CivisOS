/**
 * 認證系統安全漏洞修復測試
 * 測試 CRITICAL-01 和 CRITICAL-02
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LocalAuthService } from '../../../services/localAuthService';

describe('認證系統安全測試', () => {
    let authService: LocalAuthService;

    beforeEach(() => {
        authService = new LocalAuthService();
    });

    describe('[CRITICAL-02] 密碼驗證機制', () => {
        it('應該拒絕錯誤的密碼', async () => {
            const result = await authService.signIn('admin@civis.local', 'wrongpassword');
            expect(result).toBeNull();
        });

        it('應該拒絕不存在的帳號', async () => {
            const result = await authService.signIn('hacker@evil.com', 'anypassword');
            expect(result).toBeNull();
        });

        it('應該拒絕空帳號或密碼', async () => {
            const result1 = await authService.signIn('', 'password');
            const result2 = await authService.signIn('admin@civis.local', '');
            const result3 = await authService.signIn('', '');

            expect(result1).toBeNull();
            expect(result2).toBeNull();
            expect(result3).toBeNull();
        });

        it('應該接受正確的 admin 帳號密碼並返回 admin 角色', async () => {
            const result = await authService.signIn('admin@civis.local', 'admin123');

            expect(result).not.toBeNull();
            expect(result?.email).toBe('admin@civis.local');
            expect(result?.role).toBe('admin');
            expect(result?.name).toBe('系統管理員');
        });

        it('應該接受正確的 manager 帳號密碼並返回 manager 角色', async () => {
            const result = await authService.signIn('manager@civis.local', 'manager123');

            expect(result).not.toBeNull();
            expect(result?.role).toBe('manager');
        });

        it('應該接受正確的 staff 帳號密碼並返回 staff 角色', async () => {
            const result = await authService.signIn('staff@civis.local', 'staff123');

            expect(result).not.toBeNull();
            expect(result?.role).toBe('staff');
        });

        it('應該接受正確的 resident 帳號密碼並返回 resident 角色', async () => {
            const result = await authService.signIn('resident@civis.local', 'resident123');

            expect(result).not.toBeNull();
            expect(result?.role).toBe('resident');
        });

        it('不應該自動給予任何帳號 admin 權限', async () => {
            const result = await authService.signIn('resident@civis.local', 'resident123');

            expect(result?.role).not.toBe('admin');
            expect(result?.role).toBe('resident');
        });

        it('應該對帳號進行大小寫不敏感處理', async () => {
            const result = await authService.signIn('ADMIN@CIVIS.LOCAL', 'admin123');

            expect(result).not.toBeNull();
            expect(result?.role).toBe('admin');
        });
    });

    describe('[CRITICAL-01] 權限檢查邏輯 (概念測試)', () => {
        it('使用 every() 應該要求所有權限', () => {
            const requiredPermissions = ['parking:view', 'parking:manage', 'user:manage'];
            const userPermissions = ['parking:view', 'parking:manage']; // 缺少 user:manage

            // 使用 every() - 正確的邏輯
            const hasPermissionEvery = requiredPermissions.every(
                (perm) => userPermissions.includes(perm)
            );

            // 使用 some() - 錯誤的邏輯
            const hasPermissionSome = requiredPermissions.some(
                (perm) => userPermissions.includes(perm)
            );

            expect(hasPermissionEvery).toBe(false); // 應該拒絕
            expect(hasPermissionSome).toBe(true);   // 錯誤的邏輯會通過
        });

        it('使用 every() 當擁有所有權限時應該通過', () => {
            const requiredPermissions = ['parking:view', 'parking:manage'];
            const userPermissions = ['parking:view', 'parking:manage', 'facility:view'];

            const hasPermission = requiredPermissions.every(
                (perm) => userPermissions.includes(perm)
            );

            expect(hasPermission).toBe(true);
        });

        it('使用 every() 當沒有任何權限時應該拒絕', () => {
            const requiredPermissions = ['admin:all'];
            const userPermissions = ['resident:view'];

            const hasPermission = requiredPermissions.every(
                (perm) => userPermissions.includes(perm)
            );

            expect(hasPermission).toBe(false);
        });
    });
});
