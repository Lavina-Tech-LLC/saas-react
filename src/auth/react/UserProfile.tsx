import { useState, useCallback, type FormEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useAuth, useProfile } from './hooks'
import type { Appearance } from '../../core/types'

export interface UserProfileProps {
  appearance?: Appearance
}

export function UserProfile({ appearance: localAppearance }: UserProfileProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const { user, signOut } = useAuth()
  const { updateProfile, changePassword, isLoading, error, success, setError, setSuccess } = useProfile()
  const appearance = localAppearance ?? globalAppearance

  const [name, setName] = useState(user?.name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleSaveProfile = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setError(null)
      setSuccess(null)
      await updateProfile({ name, avatarUrl })
    },
    [name, avatarUrl, updateProfile, setError, setSuccess],
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

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-card ss-card-wide">
        <h2 className="ss-title">Profile</h2>

        {error && <div className="ss-global-error">{error}</div>}
        {success && <div className="ss-success-msg">{success}</div>}

        <div className="ss-avatar-preview" style={{ margin: '0 auto 16px' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="" />
          ) : (
            (name || user.email).charAt(0).toUpperCase()
          )}
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="ss-field">
            <label className="ss-label">Name</label>
            <input className="ss-input" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="ss-field">
            <label className="ss-label">Avatar URL</label>
            <input className="ss-input" type="url" placeholder="https://example.com/avatar.jpg" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
          </div>

          <div className="ss-field">
            <label className="ss-label">Email</label>
            <input className="ss-input ss-input-readonly" type="email" value={user.email} disabled readOnly />
          </div>

          <div className="ss-field">
            <label className="ss-label">Provider</label>
            <input className="ss-input ss-input-readonly" type="text" value={user.provider} disabled readOnly />
          </div>

          <div className="ss-field">
            <label className="ss-label">Email verified</label>
            <input className="ss-input ss-input-readonly" type="text" value={user.emailVerified ? 'Yes' : 'No'} disabled readOnly />
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
                <input className="ss-input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div className="ss-field">
                <label className="ss-label">New password</label>
                <input className="ss-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <div className="ss-field">
                <label className="ss-label">Confirm new password</label>
                <input className="ss-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" className="ss-btn ss-btn-primary" disabled={isLoading}>
                {isLoading && <span className="ss-spinner" />}
                Update password
              </button>
            </form>
          </div>
        )}

        <div style={{ marginTop: '24px' }}>
          <button type="button" className="ss-btn ss-btn-danger" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </div>
    </ShadowHost>
  )
}
