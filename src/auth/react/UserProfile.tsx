import { useState, useCallback, type FormEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useAuth, useProfile } from './hooks'
import { AvatarUploadModal } from './AvatarUploadModal'
import { ICONS } from '../../styles/icons'
import type { Appearance } from '../../core/types'

export interface UserProfileProps {
  appearance?: Appearance
}

export function UserProfile({ appearance: localAppearance }: UserProfileProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const { user, signOut } = useAuth()
  const { updateProfile, uploadAvatar, changePassword, isLoading, error, success, setError, setSuccess } = useProfile()
  const appearance = localAppearance ?? globalAppearance

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

  if (!user) return null

  const isEmailProvider = user.provider === 'email'
  const initial = (user.name || user.email).charAt(0).toUpperCase()

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-auth-card" style={{ maxWidth: '640px' }}>
        {/* Profile Header with gradient background */}
        <div className="ss-auth-profile-header">
          <div className="ss-auth-avatar-lg" onClick={() => setShowAvatarUpload(true)}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                fontWeight: 800,
                opacity: 0.4,
              }}>
                {initial}
              </div>
            )}
            <div className="ss-auth-avatar-overlay">
              <span className="material-symbols-outlined">{ICONS.camera}</span>
              <span>Edit</span>
            </div>
          </div>
          <div className="ss-auth-profile-info">
            <h2 className="ss-auth-profile-name">
              {user.name || 'Unnamed User'}
              {user.emailVerified && (
                <span className="ss-auth-badge ss-auth-badge-success">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>{ICONS.verified}</span>
                  Verified
                </span>
              )}
            </h2>
            <p className="ss-auth-profile-desc">{user.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="ss-auth-card-body">
          {error && (
            <div className="ss-auth-error">
              <span className="material-symbols-outlined">{ICONS.errorOutline}</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="ss-auth-info-box" style={{ marginBottom: '16px' }}>
              <span className="material-symbols-outlined">{ICONS.check}</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className="ss-auth-field">
              <label className="ss-auth-label">Full Name</label>
              <input
                className="ss-auth-input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="ss-auth-profile-grid" style={{ marginBottom: '16px' }}>
              <div>
                <label className="ss-auth-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input className="ss-auth-input ss-auth-input-readonly" type="email" value={user.email} readOnly />
                  <span className="ss-auth-visibility-toggle" style={{ cursor: 'default' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{ICONS.lock}</span>
                  </span>
                </div>
              </div>
              <div>
                <label className="ss-auth-label">Auth Provider</label>
                <div style={{ position: 'relative' }}>
                  <input className="ss-auth-input ss-auth-input-readonly" type="text" value={user.provider} readOnly />
                  <span className="ss-auth-visibility-toggle" style={{ cursor: 'default' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{ICONS.cloudDone}</span>
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="ss-auth-btn-primary ss-auth-btn-sm" disabled={isLoading} style={{ width: 'auto' }}>
                {isLoading && <span className="ss-auth-spinner" />}
                Save changes
              </button>
            </div>
          </form>

          {/* Security Section */}
          {isEmailProvider && (
            <div className="ss-auth-section">
              <div className="ss-auth-section-title">
                <span className="material-symbols-outlined">{ICONS.security}</span>
                Security Credentials
              </div>
              <p className="ss-auth-section-desc" style={{ marginBottom: '24px' }}>Update your password to keep your account secure.</p>

              {passwordError && (
                <div className="ss-auth-error">
                  <span className="material-symbols-outlined">{ICONS.errorOutline}</span>
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="ss-auth-field">
                  <label className="ss-auth-label">Current Password</label>
                  <input
                    className="ss-auth-input"
                    type="password"
                    placeholder="••••••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="ss-auth-profile-grid" style={{ marginBottom: '16px' }}>
                  <div>
                    <label className="ss-auth-label">New Password</label>
                    <input
                      className="ss-auth-input"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="ss-auth-label">Confirm New Password</label>
                    <input
                      className="ss-auth-input"
                      type="password"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="ss-auth-info-box" style={{ marginBottom: '16px' }}>
                  <span className="material-symbols-outlined">{ICONS.info}</span>
                  <span>Password must be at least 8 characters long.</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="ss-auth-btn-ghost" disabled={isLoading}>
                    Update Security
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sign Out Section */}
          <div className="ss-auth-section" style={{ borderTop: 'none', paddingTop: 0, marginTop: '24px' }}>
            <div className="ss-auth-signout-section" style={{ borderRadius: '12px', padding: '16px 20px' }}>
              <div className="ss-auth-signout-row">
                <div className="ss-auth-signout-info">
                  <div className="ss-auth-signout-icon">
                    <span className="material-symbols-outlined">{ICONS.logout}</span>
                  </div>
                  <div>
                    <div className="ss-auth-signout-title">End Session</div>
                    <div className="ss-auth-signout-desc">Terminate your active session</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="ss-auth-btn-outline"
                  onClick={() => signOut()}
                  style={{ width: 'auto', flexShrink: 0 }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {showAvatarUpload && (
          <AvatarUploadModal
            onUpload={handleAvatarUpload}
            onClose={() => setShowAvatarUpload(false)}
            isLoading={isLoading}
          />
        )}
      </div>
    </ShadowHost>
  )
}
