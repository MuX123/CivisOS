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

  // 從 localStorage 加載用戶
  private loadUserFromStorage(): void {
    try {
      const userStr = localStorage.getItem(this.storageKey);
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
  }

  // 保存用戶到 localStorage
  private saveUserToStorage(user: LocalUser | null): void {
    try {
      if (user) {
        localStorage.setItem(this.storageKey, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.storageKey);
      }
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  }

  // 模擬登入（本地）
  async signIn(email: string, password: string): Promise<LocalUser | null> {
    // 模擬登入延遲
    await new Promise(resolve => setTimeout(resolve, 500));

    // 模擬用戶驗證
    if (!email || !password) {
      return null;
    }

    // 創建模擬用戶（實際應用中應該驗證密碼）
    const mockUser: LocalUser = {
      id: 'local_user_001',
      email: email,
      name: email.split('@')[0],
      role: 'admin',
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
