import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { initializeAuth, selectAuth } from '../../store/modules/auth'
import LoginButton from './LoginButton'
import type { AuthUser } from '@/services/authService'

// 權限定義
export type Permission =
  | 'dashboard:view'
  | 'parking:view'
  | 'parking:manage'
  | 'facility:view'
  | 'facility:manage'
  | 'facility:book'
  | 'resident:view'
  | 'resident:manage'
  | 'deposit:manage'
  | 'settings:manage'
  | 'user:manage';

// 角色權限映射
const RolePermissions: Record<string, Permission[]> = {
  admin: [
    'dashboard:view',
    'parking:view',
    'parking:manage',
    'facility:view',
    'facility:manage',
    'facility:book',
    'resident:view',
    'resident:manage',
    'deposit:manage',
    'settings:manage',
    'user:manage',
  ],
  manager: [
    'dashboard:view',
    'parking:view',
    'parking:manage',
    'facility:view',
    'facility:manage',
    'resident:view',
    'resident:manage',
    'deposit:manage',
  ],
  staff: [
    'dashboard:view',
    'parking:view',
    'facility:view',
    'facility:book',
    'resident:view',
  ],
  resident: [
    'dashboard:view',
    'facility:view',
    'facility:book',
  ],
};

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredPermissions?: Permission[]
  requiredRoles?: AuthUser['role'][]
  redirectTo?: string
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requiredPermissions = [],
  requiredRoles = [],
  redirectTo = '/login',
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { user, loading, initialized } = useSelector((state: RootState) => selectAuth(state))
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeAuth())
    }
  }, [dispatch, initialized])

  useEffect(() => {
    if (initialized && !loading) {
      setAuthChecked(true)
    }
  }, [initialized, loading])

  // 載入中
  if (!authChecked || loading) {
    return (
      <div className="login-container">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-white">載入中...</p>
        </div>
        <style>{`
          .login-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .text-white {
            color: rgba(255,255,255,0.8);
          }
          .text-center {
            text-align: center;
          }
        `}</style>
      </div>
    )
  }

  // 未登入
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
        <style>{`
          .login-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            position: relative;
            overflow: hidden;
          }
          .login-decoration {
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
          }
          .login-decoration-1 {
            width: 300px;
            height: 300px;
            top: -100px;
            right: -100px;
          }
          .login-decoration-2 {
            width: 200px;
            height: 200px;
            bottom: -50px;
            left: -50px;
          }
          .login-card {
            background: white;
            padding: 48px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            z-index: 1;
          }
          .login-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
          }
          .login-subtitle {
            color: #666;
            margin-bottom: 24px;
          }
          .text-center {
            text-align: center;
          }
        `}</style>
      </div>
    )
  }

  // 角色檢查
  if (user && requiredRoles.length > 0 && user.role && !requiredRoles.includes(user.role)) {
    return (
      <div className="permission-denied">
        <div className="denied-card">
          <h1>權限不足</h1>
          <p>您的帳號權限無法訪問此頁面</p>
          <p className="user-role">當前角色：{user.role}</p>
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            返回首頁
          </button>
        </div>
        <style>{`
          .permission-denied {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f5f5f5;
          }
          .denied-card {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            text-align: center;
          }
          .denied-card h1 {
            color: #e53935;
            margin-bottom: 12px;
          }
          .user-role {
            font-size: 14px;
            color: #999;
            margin: 16px 0;
          }
          .btn {
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 14px;
          }
          .btn-secondary {
            background: #e0e0e0;
            color: #333;
          }
        `}</style>
      </div>
    )
  }

  // 權限檢查
  if (user && requiredPermissions.length > 0) {
    const userPermissions = RolePermissions[user.role || 'resident'] || []
    const hasPermission = requiredPermissions.some(
      (perm) => userPermissions.includes(perm)
    )

    if (!hasPermission) {
      return (
        <div className="permission-denied">
          <div className="denied-card">
            <h1>權限不足</h1>
            <p>您沒有權限執行此操作</p>
            <button onClick={() => navigate(-1)} className="btn btn-secondary">
              返回上一頁
            </button>
          </div>
          <style>{`
            .permission-denied {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: #f5f5f5;
            }
            .denied-card {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              text-align: center;
            }
            .btn {
              padding: 10px 20px;
              border-radius: 8px;
              border: none;
              cursor: pointer;
              font-size: 14px;
            }
            .btn-secondary {
              background: #e0e0e0;
              color: #333;
            }
          `}</style>
        </div>
      )
    }
  }

  return <>{children}</>
}

// Hook：檢查權限
export function useAuth() {
  const { user, loading, initialized } = useSelector((state: RootState) => selectAuth(state))

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    const permissions = RolePermissions[user.role || 'resident'] || []
    return permissions.includes(permission)
  }

  return {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    hasPermission,
  }
}

export default AuthGuard