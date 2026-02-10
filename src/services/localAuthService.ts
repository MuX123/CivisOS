// 本地認證服務 - 完全本地運行，不需要後端
// 模擬用戶登入/登出功能

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'admin' | 'manager' | 'staff' | 'resident';
}

class LocalAuthService {
  private currentUser: LocalUser | null = null;
  private storageKey = 'civis_auth_user';

  constructor() {
    // 從 localStorage 恢復用戶會話
    this.loadUserFromStorage();
  }

  // 從 localStorage 加載用戶 - 修復 MEDIUM-04: 添加過期檢查
  private loadUserFromStorage(): void {
    try {
      const userStr = localStorage.getItem(this.storageKey);
      if (userStr) {
        const savedData = JSON.parse(userStr);
        const { user, timestamp } = savedData;

        // 檢查是否超過 8 小時
        const EIGHT_HOURS = 8 * 60 * 60 * 1000;
        const now = Date.now();

        if (user && timestamp && (now - timestamp < EIGHT_HOURS)) {
          this.currentUser = user;
        } else {
          console.warn('[LocalAuth] 會話已過期，請重新登入');
          localStorage.removeItem(this.storageKey);
          this.currentUser = null;
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      localStorage.removeItem(this.storageKey);
    }
  }

  // 保存用戶到 localStorage
  private saveUserToStorage(user: LocalUser | null): void {
    try {
      if (user) {
        // 修復 MEDIUM-04: 存儲時添加時間戳
        localStorage.setItem(this.storageKey, JSON.stringify({
          user,
          timestamp: Date.now()
        }));
      } else {
        localStorage.removeItem(this.storageKey);
      }
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  }

  // 模擬登入(本地) - 修復 CRITICAL-02: 添加密碼驗證
  async signIn(email: string, password: string): Promise<LocalUser | null> {
    // 模擬登入延遲
    await new Promise(resolve => setTimeout(resolve, 500));

    // 基本驗證
    if (!email || !password) {
      return null;
    }

    // 預設測試帳號(實際應用中應使用資料庫和密碼雜湊)
    const testAccounts: Record<string, { password: string; role: LocalUser['role']; name: string }> = {
      'admin@civis.local': { password: 'admin123', role: 'admin', name: '系統管理員' },
      'manager@civis.local': { password: 'manager123', role: 'manager', name: '物業經理' },
      'staff@civis.local': { password: 'staff123', role: 'staff', name: '工作人員' },
      'resident@civis.local': { password: 'resident123', role: 'resident', name: '住戶' },
    };

    // 驗證帳號密碼
    const account = testAccounts[email.toLowerCase()];
    if (!account || account.password !== password) {
      console.warn('[LocalAuth] 登入失敗: 帳號或密碼錯誤');
      return null;
    }

    // 創建用戶
    const mockUser: LocalUser = {
      id: `local_user_${Date.now()}`,
      email: email,
      name: account.name,
      role: account.role,
    };

    this.currentUser = mockUser;
    this.saveUserToStorage(mockUser);

    return mockUser;
  }

  // 模擬 Google OAuth 登入（本地）
  async signInWithGoogle(): Promise<LocalUser | null> {
    // 模擬 OAuth 延遲
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockUser: LocalUser = {
      id: 'local_user_google_001',
      email: 'user@example.com',
      name: '本地用戶',
      avatar_url: 'https://via.placeholder.com/40',
      role: 'resident',
    };

    this.currentUser = mockUser;
    this.saveUserToStorage(mockUser);

    return mockUser;
  }

  // 登出
  async signOut(): Promise<void> {
    this.currentUser = null;
    this.saveUserToStorage(null);
  }

  // 獲取當前用戶
  async getCurrentUser(): Promise<LocalUser | null> {
    // 返回淺拷貝以防止外部修改
    return this.currentUser ? { ...this.currentUser } : null;
  }

  // 檢查是否已登入
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // 更新用戶資料
  async updateUser(updates: Partial<LocalUser>): Promise<LocalUser | null> {
    if (!this.currentUser) return null;

    this.currentUser = {
      ...this.currentUser,
      ...updates,
    };

    this.saveUserToStorage(this.currentUser);
    return { ...this.currentUser };
  }

  // 獲取用戶角色
  getUserRole(): LocalUser['role'] | null {
    return this.currentUser?.role || null;
  }

  // 檢查用戶權限
  hasRole(requiredRole: LocalUser['role']): boolean {
    if (!this.currentUser) return false;

    const roleHierarchy = {
      admin: 4,
      manager: 3,
      staff: 2,
      resident: 1,
    };

    return roleHierarchy[this.currentUser.role] >= roleHierarchy[requiredRole];
  }
}

export const localAuthService = new LocalAuthService();
export default localAuthService;
