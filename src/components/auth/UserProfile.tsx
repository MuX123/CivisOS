import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { signOut } from '../../store/modules/auth'

const UserProfile: React.FC = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)

  if (!user) {
    return null
  }

  const handleSignOut = () => {
    dispatch(signOut() as any)
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex-shrink-0">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name || '用戶頭像'}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.name || '用戶'}
        </p>
        {user.email && (
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        )}
      </div>

      <button
        onClick={handleSignOut}
        className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        title="登出"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  )
}

export default UserProfile