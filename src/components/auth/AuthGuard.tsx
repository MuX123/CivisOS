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
      <div className="login-container">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-gray-500">載入中...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return (
      <div className="login-container">
        <div className="login-decoration login-decoration-1"></div>
        <div className="login-decoration login-decoration-2"></div>
        <div className="login-card">
          <div className="text-center">
            <h1 className="login-title">智慧社區管理系統</h1>
            <p className="login-subtitle">請登入以繼續使用</p>
            <LoginButton />
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default AuthGuard