import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email?: string
  name?: string
  avatar_url?: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

class AuthService {
  private authState: AuthState = {
    user: null,
    loading: false,
    error: null
  }

  constructor() {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.authState.user = {
          id: session.user.id,
          email: session.user.email || undefined,
          name: session.user.user_metadata?.full_name as string || session.user.email?.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url as string
        }
      } else {
        this.authState.user = null
      }
      this.authState.loading = false
      this.authState.error = null
    })
  }

  async signInWithGoogle() {
    try {
      this.authState.loading = true
      this.authState.error = null

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        this.authState.error = error.message
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登入失敗'
      this.authState.error = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      this.authState.loading = false
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        this.authState.error = error.message
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登出失敗'
      this.authState.error = errorMessage
      return { success: false, error: errorMessage }
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        this.authState.error = error.message
        return null
      }

      if (user) {
        this.authState.user = {
          id: user.id,
          email: user.email || undefined,
          name: user.user_metadata?.full_name as string || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url as string
        }
      }

      return this.authState.user
    } catch (error) {
      this.authState.error = error instanceof Error ? error.message : '獲取用戶資訊失敗'
      return null
    }
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

export const authService = new AuthService()
export default authService