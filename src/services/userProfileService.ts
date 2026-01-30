import { supabase } from '../lib/supabase'
import { authService, AuthUser } from './authService'

export interface UserProfile {
  id: string
  auth_id: string
  email: string
  name?: string
  avatar_url?: string
  role: 'admin' | 'manager' | 'staff' | 'resident'
  phone?: string
  created_at: string
  updated_at: string
}

class UserProfileService {
  private currentProfile: UserProfile | null = null

  async createProfileFromAuth(): Promise<UserProfile | null> {
    const authUser = await authService.getCurrentUser()
    if (!authUser) {
      return null
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        auth_id: authUser.id,
        email: authUser.email || '',
        name: authUser.name,
        avatar_url: authUser.avatar_url,
        role: 'resident'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }

    this.currentProfile = data as UserProfile
    return this.currentProfile
  }

  async getProfile(): Promise<UserProfile | null> {
    const authUser = await authService.getCurrentUser()
    if (!authUser) {
      return null
    }

    if (this.currentProfile && this.currentProfile.auth_id === authUser.id) {
      return this.currentProfile
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_id', authUser.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user profile:', error)
      return null
    }

    if (!data) {
      return await this.createProfileFromAuth()
    }

    this.currentProfile = data as UserProfile
    return this.currentProfile
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const authUser = await authService.getCurrentUser()
    if (!authUser) {
      return null
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('auth_id', authUser.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return null
    }

    this.currentProfile = data as UserProfile
    return this.currentProfile
  }

  async isAdmin(): Promise<boolean> {
    const profile = await this.getProfile()
    return profile?.role === 'admin'
  }

  async isStaff(): Promise<boolean> {
    const profile = await this.getProfile()
    return ['admin', 'manager', 'staff'].includes(profile?.role || '')
  }

  async isResident(): Promise<boolean> {
    const profile = await this.getProfile()
    return profile?.role === 'resident'
  }

  clearCache() {
    this.currentProfile = null
  }
}

export const userProfileService = new UserProfileService()
export default userProfileService