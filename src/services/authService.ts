// Mock Auth Service - 模擬 Google 登入
// 當 Supabase 不可用時使用此服務

export interface AuthUser {
  id: string
  email?: string
  name?: string
  avatar_url?: string
  role?: 'admin' | 'manager' | 'staff' | 'resident'
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

class MockAuthService {
  private authState: AuthState = {
    user: null,
    loading: false,
    error: null
  }

  constructor() {
    // 嘗試從 localStorage 恢復登入狀態
    const savedUser = localStorage.getItem('civisos_mock_user')
    if (savedUser) {
      try {
        this.authState.user = JSON.parse(savedUser)
      } catch (e) {
        localStorage.removeItem('civisos_mock_user')
      }
    }
  }

  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      this.authState.loading = true
      this.authState.error = null

      // 模擬 Google 登入延遲
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 創建模擬用戶
      const mockUser: AuthUser = {
        id: 'mock-user-' + Date.now(),
        email: 'demo@civisos.local',
        name: 'Demo 用戶',
        avatar_url: undefined
      }

      this.authState.user = mockUser
      localStorage.setItem('civisos_mock_user', JSON.stringify(mockUser))

      this.authState.loading = false
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登入失敗'
      this.authState.error = errorMessage
      this.authState.loading = false
      return { success: false, error: errorMessage }
    }
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      this.authState.loading = true
      this.authState.error = null

      await new Promise(resolve => setTimeout(resolve, 500))

      this.authState.user = null
      localStorage.removeItem('civisos_mock_user')

      this.authState.loading = false
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登出失敗'
      this.authState.error = errorMessage
      this.authState.loading = false
      return { success: false, error: errorMessage }
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.authState.user
  }

  getAuthState(): AuthState {
    return { ...this.authState }
  }

  isAuthenticated(): boolean {
    return this.authState.user !== null
  }

  clearError() {
    this.authState.error = null
  }
}

export const authService = new MockAuthService()
export default authService
