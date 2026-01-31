import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../../store'
import { signOut } from '../../store/modules/auth'

const UserProfile: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading } = useSelector((state: RootState) => state.auth)

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await dispatch(signOut() as any)
    navigate('/', { replace: true })
  }

  return (
    <div className="user-profile">
      <div className="user-avatar">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name || '用戶頭像'}
            className="avatar-img"
          />
        ) : (
          <div className="avatar-placeholder">
            <span>{user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
        )}
      </div>

      <div className="user-info">
        <p className="user-name">{user.name || '用戶'}</p>
        {user.email && (
          <p className="user-email">{user.email}</p>
        )}
      </div>

      <button
        onClick={handleSignOut}
        className="logout-button"
        title="登出"
        disabled={loading}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  )
}

export default UserProfile