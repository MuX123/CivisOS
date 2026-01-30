import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { RootState } from '../../store'
import { initializeAuth } from '../../store/modules/auth'
import LoginButton from './LoginButton'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const dispatch = useDispatch()
  const { user, loading, initialized } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeAuth() as any)
    }
  }, [dispatch, initialized])

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">智慧社區管理系統</h1>
            <p className="text-gray-600 mb-8">請登入以繼續使用</p>
            <LoginButton />
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default AuthGuard