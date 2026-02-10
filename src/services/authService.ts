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

export class MockAuthService {
  private authState: AuthState = {
    user: null,
    loading: false,
    error: null
  }

  constructor() {
    // 嘗試從 localStorage 恢復登入狀態 - 修復 MEDIUM-04: 添加過期檢查
    const savedUserStr = localStorage.getItem('civisos_mock_user')
    if (savedUserStr) {
      try {
        const savedData = JSON.parse(savedUserStr)
        const { user, timestamp } = savedData

        // 檢查是否超過 8 小時 (8 * 60 * 60 * 1000 ms)
        const EIGHT_HOURS = 8 * 60 * 60 * 1000
        const now = Date.now()

        if (user && timestamp && (now - timestamp < EIGHT_HOURS)) {
          this.authState.user = user
        } else {
          console.warn('[Auth] 會話已過期，請重新登入')
          localStorage.removeItem('civisos_mock_user')
        }
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
      // 修復 MEDIUM-04: 存儲時添加時間戳
      localStorage.setItem('civisos_mock_user', JSON.stringify({
        user: mockUser,
        timestamp: Date.now()
      }))

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
