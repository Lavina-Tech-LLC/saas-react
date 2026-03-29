import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useAuth, useProfile } from './hooks'
import { AvatarUploadModal } from './AvatarUploadModal'
import type { Appearance } from '../../core/types'

export interface UserButtonProps {
  appearance?: Appearance
  afterSignOutUrl?: string
}

export function UserButton({ appearance: localAppearance }: UserButtonProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const { user, signOut } = useAuth()
  const appearance = localAppearance ?? globalAppearance

  const [open, setOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !e.composedPath().includes(dropdownRef.current)) {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 0)
      return () => {
        clearTimeout(timer)
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [open, handleClickOutside])

  if (!user) return null

  const initial = (user.name || user.email).charAt(0).toUpperCase()

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-user-btn" ref={dropdownRef}>
        <button
          type="button"
          className="ss-avatar"
          onClick={() => setOpen(!open)}
          aria-label="User menu"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            initial
          )}
        </button>

        {open && (
          <div className="ss-dropdown">
            <div className="ss-dropdown-header">
              {user.name && <div style={{ fontWeight: 600, fontSize: '14px', color: 'inherit' }}>{user.name}</div>}
              <div className="ss-dropdown-email">{user.email}</div>
            </div>
            <button
              type="button"
              className="ss-dropdown-item"
              onClick={() => {
                setOpen(false)
                setShowProfile(true)
              }}
            >
              Profile
            </button>
            <button
              type="button"
              className="ss-dropdown-item ss-dropdown-item-danger"
              onClick={async () => {
                setOpen(false)
                await signOut()
              }}
            >
              Sign out
            </button>
          </div>
        )}

        {showProfile && (
          <ProfileModal onClose={() => setShowProfile(false)} />
        )}
      </div>
    </ShadowHost>
  )
}

function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, updateProfile, uploadAvatar, changePassword, isLoading, error, success, setError, setSuccess } = useProfile()

  const [name, setName] = useState(user?.name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleSaveProfile = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setError(null)
      setSuccess(null)
      await updateProfile({ name, avatarUrl: avatarUrl || undefined })
    },
    [name, avatarUrl, updateProfile, setError, setSuccess],
  )

  const handleAvatarUpload = useCallback(
    async (blob: Blob) => {
      const result = await uploadAvatar(blob)
      if (result) {
        setAvatarUrl(result.avatarUrl)
        setShowAvatarUpload(false)
      }
    },
    [uploadAvatar],
  )

  const handleChangePassword = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setPasswordError(null)
      setError(null)
      setSuccess(null)
      if (newPassword !== confirmPassword) {
        setPasswordError('Passwords do not match')
        return
      }
      if (newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters')
        return
      }
      const ok = await changePassword(currentPassword, newPassword)
      if (ok) {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    },
    [currentPassword, newPassword, confirmPassword, changePassword, setError, setSuccess],
  )

  const isEmailProvider = user?.provider === 'email'

  return (
    <div className="ss-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="ss-modal">
        <div className="ss-modal-header">
          <span className="ss-modal-title">Profile</span>
          <button type="button" className="ss-modal-close" onClick={onClose}>
            &#x2715;
          </button>
        </div>

        {error && <div className="ss-global-error">{error}</div>}
        {success && <div className="ss-success-msg">{success}</div>}

        <div
          className="ss-avatar-preview ss-avatar-hoverable"
          onClick={() => setShowAvatarUpload(true)}
          title="Click to change avatar"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" />
          ) : (
            (name || user?.email || '?').charAt(0).toUpperCase()
          )}
          <div className="ss-avatar-overlay">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 16a4 4 0 100-8 4 4 0 000 8z" />
              <path d="M3 16.8V9.2c0-1.12 0-1.68.218-2.108a2 2 0 01.874-.874C4.52 6 5.08 6 6.2 6h.382c.246 0 .37 0 .482-.022a1 1 0 00.513-.29c.08-.082.148-.186.284-.392l.079-.118C8.08 4.968 8.15 4.863 8.234 4.77a2 2 0 01.965-.61C9.346 4.1 9.508 4.1 9.834 4.1h4.332c.326 0 .488 0 .636.06a2 2 0 01.965.61c.083.094.153.198.293.408l.079.118c.136.206.204.31.284.392a1 1 0 00.513.29c.112.022.236.022.482.022h.382c1.12 0 1.68 0 2.108.218a2 2 0 01.874.874C21 7.52 21 8.08 21 9.2v7.6c0 1.12 0 1.68-.218 2.108a2 2 0 01-.874.874C19.48 20 18.92 20 17.8 20H6.2c-1.12 0-1.68 0-2.108-.218a2 2 0 01-.874-.874C3 18.48 3 17.92 3 16.8z" />
            </svg>
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="ss-field">
            <label className="ss-label">Name</label>
            <input
              className="ss-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="ss-field">
            <label className="ss-label">Email</label>
            <input className="ss-input ss-input-readonly" type="email" value={user?.email ?? ''} disabled readOnly />
          </div>

          <div className="ss-field">
            <label className="ss-label">Provider</label>
            <input className="ss-input ss-input-readonly" type="text" value={user?.provider ?? ''} disabled readOnly />
          </div>

          <button type="submit" className="ss-btn ss-btn-primary" disabled={isLoading}>
            {isLoading && <span className="ss-spinner" />}
            Save changes
          </button>
        </form>

        {isEmailProvider && (
          <div className="ss-modal-section">
            <div className="ss-modal-section-title">Change password</div>

            {passwordError && <div className="ss-global-error">{passwordError}</div>}

            <form onSubmit={handleChangePassword}>
              <div className="ss-field">
                <label className="ss-label">Current password</label>
                <input
                  className="ss-input"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="ss-field">
                <label className="ss-label">New password</label>
                <input
                  className="ss-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="ss-field">
                <label className="ss-label">Confirm new password</label>
                <input
                  className="ss-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="ss-btn ss-btn-primary" disabled={isLoading}>
                {isLoading && <span className="ss-spinner" />}
                Update password
              </button>
            </form>
          </div>
        )}

        {showAvatarUpload && (
          <AvatarUploadModal
            onUpload={handleAvatarUpload}
            onClose={() => setShowAvatarUpload(false)}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}
