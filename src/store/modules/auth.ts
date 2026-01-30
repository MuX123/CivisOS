import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authService, AuthUser, AuthState } from '../../services/authService'

export interface AuthSliceState {
  user: AuthUser | null
  loading: boolean
  error: string | null
  initialized: boolean
}

const initialState: AuthSliceState = {
  user: null,
  loading: false,
  error: null,
  initialized: false
}

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    return await authService.getCurrentUser()
  }
)

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    const result = await authService.signInWithGoogle()
    if (!result.success) {
      return rejectWithValue(result.error)
    }
    // 登入成功後獲取用戶信息
    const user = await authService.getCurrentUser()
    return user
  }
)

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    const result = await authService.signOut()
    if (!result.success) {
      return rejectWithValue(result.error)
    }
    return result
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.initialized = true
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false
        state.initialized = true
      })
      .addCase(signInWithGoogle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.initialized = true
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(signOut.pending, (state) => {
        state.loading = true
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false
        state.user = null
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer