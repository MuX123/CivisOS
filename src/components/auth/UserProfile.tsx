import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
// import { useNavigate } from 'react-router-dom'
import { RootState } from '../../store'
// import { signOut } from '../../store/modules/auth'

const UserProfile: React.FC = () => {
  // const dispatch = useDispatch()
  // const navigate = useNavigate()
  // const { user, loading } = useSelector((state: RootState) => state.auth)

  // 模擬固定管理員用戶 (登入模塊已移除)
  const user = {
    name: '系統管理員',
    email: 'admin@civisos.local',
    avatar_url: undefined
  };

  /*
  const handleSignOut = async () => {
    await dispatch(signOut() as any)
    navigate('/', { replace: true })
  }
  */

  return (
    <div className="user-profile flex items-center gap-3 bg-gray-800 rounded-full pr-4 pl-1 py-1 border border-gray-700">
      <div className="user-avatar flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/20">
          <span>{user.name.charAt(0)}</span>
        </div>
      </div>

      <div className="user-info hidden md:block">
        <p className="user-name text-sm font-medium text-gray-200">{user.name}</p>
        {/* <p className="user-email text-xs text-gray-400">{user.email}</p> */}
      </div>

      {/* 移除登出按鈕
      <button
        onClick={handleSignOut}
        className="logout-button ml-2 p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full transition-colors"
        title="登出"
        // disabled={loading}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
      */}
    </div>
  )
}

export default UserProfile