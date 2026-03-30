import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useAuth, useProfile, useOrg, useDeleteAccount } from './hooks'
import { AvatarUploadModal } from './AvatarUploadModal'
import { ICONS } from '../../styles/icons'
import type { Appearance } from '../../core/types'
import type { Org } from '../types'

export interface UserButtonProps {
  appearance?: Appearance
  afterSignOutUrl?: string
  afterDeleteAccountUrl?: string
  showOrgSwitcher?: boolean
  onOrgChange?: (org: Org) => void
  onOrgSettingsClick?: (org: Org) => void
}

export function UserButton({
  appearance: localAppearance,
  afterSignOutUrl,
  afterDeleteAccountUrl,
  showOrgSwitcher = true,
  onOrgChange,
  onOrgSettingsClick,
}: UserButtonProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const { user, signOut } = useAuth()
  const appearance = localAppearance ?? globalAppearance

  const [open, setOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [createOrgError, setCreateOrgError] = useState<string | null>(null)
  const [isCreatingOrg, setIsCreatingOrg] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { orgs, selectedOrg, selectOrg, createOrg } = useOrg()

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

  const handleCreateOrg = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setCreateOrgError(null)
      setIsCreatingOrg(true)
      const slug = newOrgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      try {
        const org = await createOrg(newOrgName, slug)
        if (org) {
          await selectOrg(org.id)
          onOrgChange?.(org)
          setNewOrgName('')
          setOpen(false)
        }
      } catch (err) {
        setCreateOrgError(err instanceof Error ? err.message : 'Failed to create organization')
      } finally {
        setIsCreatingOrg(false)
      }
    },
    [newOrgName, createOrg, selectOrg, onOrgChange],
  )

  if (!user) return null

  return (
    <ShadowHost appearance={appearance}>
      <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
        {/* Trigger */}
        <button
          type="button"
          className="ss-auth-avatar-trigger"
          onClick={() => setOpen(!open)}
          aria-label="User menu"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 700,
            }}>
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="ss-auth-dropdown ss-auth-glass-panel" style={{ minWidth: '320px' }}>
            {/* Header */}
            <div className="ss-auth-dropdown-header">
              <div className="ss-auth-dropdown-avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 800,
                  }}>
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                {user.name && <div className="ss-auth-dropdown-name">{user.name}</div>}
                <div className="ss-auth-dropdown-email">{user.email}</div>
              </div>
            </div>

            {/* Profile link */}
            <div style={{ padding: '4px 8px' }}>
              <button
                type="button"
                className="ss-auth-dropdown-action"
                onClick={() => {
                  setOpen(false)
                  setShowProfile(true)
                }}
              >
                <span className="material-symbols-outlined">{ICONS.person}</span>
                Profile
              </button>
            </div>

            {/* Organizations */}
            {showOrgSwitcher && (
              <>
                <div className="ss-auth-section-label">Organizations</div>
                <div style={{ padding: '0 8px 4px' }}>
                  {orgs.map((org) => {
                    const isActive = selectedOrg?.id === org.id
                    const initials = org.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                    return (
                      <button
                        key={org.id}
                        type="button"
                        className={`ss-auth-org-item${isActive ? ' ss-auth-org-item-active' : ''}`}
                        onClick={async () => {
                          setOpen(false)
                          await selectOrg(org.id)
                          onOrgChange?.(org)
                        }}
                      >
                        <div className="ss-auth-org-item-inner">
                          <div className={`ss-auth-org-avatar${isActive ? '' : ' ss-auth-org-avatar-inactive'}`}>
                            {initials}
                          </div>
                          <span style={{ fontFamily: "'Manrope', sans-serif", letterSpacing: '-0.01em' }}>{org.name}</span>
                        </div>
                        {isActive && (
                          <span className="material-symbols-outlined ss-auth-org-check" style={{ fontSize: '18px' }}>
                            {ICONS.checkCircle}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Inline create org */}
                <div className="ss-auth-inline-create">
                  {createOrgError && (
                    <div className="ss-auth-error" style={{ marginBottom: '8px', fontSize: '12px' }}>
                      <span>{createOrgError}</span>
                    </div>
                  )}
                  <form onSubmit={handleCreateOrg}>
                    <div className="ss-auth-inline-create-input">
                      <input
                        className="ss-auth-input"
                        type="text"
                        placeholder="New organization name"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        required
                        style={{ fontSize: '13px', padding: '10px 40px 10px 12px' }}
                      />
                      <button
                        type="submit"
                        className="ss-auth-inline-create-btn"
                        disabled={isCreatingOrg || !newOrgName.trim()}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{ICONS.add}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {selectedOrg && onOrgSettingsClick && (
                  <div style={{ padding: '0 8px 4px' }}>
                    <button
                      type="button"
                      className="ss-auth-dropdown-action"
                      onClick={() => {
                        setOpen(false)
                        onOrgSettingsClick(selectedOrg)
                      }}
                    >
                      <span className="material-symbols-outlined">{ICONS.corporateFare}</span>
                      Org settings
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Sign out */}
            <div className="ss-auth-signout-section" style={{ padding: '8px' }}>
              <button
                type="button"
                className="ss-auth-dropdown-action"
                onClick={async () => {
                  setOpen(false)
                  await signOut()
                  if (afterSignOutUrl) {
                    window.location.href = afterSignOutUrl
                  }
                }}
                style={{ color: 'inherit' }}
              >
                <span className="material-symbols-outlined" style={{ color: 'inherit' }}>{ICONS.logout}</span>
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {showProfile && (
          <ProfileModal
            onClose={() => setShowProfile(false)}
            afterDeleteAccountUrl={afterDeleteAccountUrl}
          />
        )}
      </div>
    </ShadowHost>
  )
}

function ProfileModal({ onClose, afterDeleteAccountUrl }: { onClose: () => void; afterDeleteAccountUrl?: string }) {
  const { user, updateProfile, uploadAvatar, changePassword, isLoading, error, success, setError, setSuccess } = useProfile()
  const { signOut } = useAuth()
  const { deleteAccount, isLoading: isDeleting, error: deleteError, setError: setDeleteError } = useDeleteAccount()

  const [name, setName] = useState(user?.name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState('')

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

  const handleDeleteAccount = useCallback(async () => {
    const ok = await deleteAccount()
    if (ok) {
      await signOut()
      if (afterDeleteAccountUrl) {
        window.location.href = afterDeleteAccountUrl
      }
    }
  }, [deleteAccount, signOut, afterDeleteAccountUrl])

  const isEmailProvider = user?.provider === 'email'
  const emailMatches = deleteEmailConfirm === user?.email
  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase()

  return (
    <div className="ss-auth-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="ss-auth-modal" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="ss-auth-modal-header">
          <h2>Profile</h2>
          <button type="button" className="ss-auth-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">{ICONS.close}</span>
          </button>
        </div>

        {/* Profile Header */}
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
              {user?.name || 'Unnamed User'}
              {user?.emailVerified && (
                <span className="ss-auth-badge ss-auth-badge-success">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>{ICONS.verified}</span>
                  Verified
                </span>
              )}
            </h2>
            <p className="ss-auth-profile-desc">{user?.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="ss-auth-modal-body">
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
                  <input className="ss-auth-input ss-auth-input-readonly" type="email" value={user?.email ?? ''} readOnly />
                  <span className="ss-auth-visibility-toggle" style={{ cursor: 'default' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{ICONS.lock}</span>
                  </span>
                </div>
              </div>
              <div>
                <label className="ss-auth-label">Auth Provider</label>
                <input className="ss-auth-input ss-auth-input-readonly" type="text" value={user?.provider ?? ''} readOnly />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="ss-auth-btn-primary ss-auth-btn-sm" disabled={isLoading} style={{ width: 'auto' }}>
                {isLoading && <span className="ss-auth-spinner" />}
                Save changes
              </button>
            </div>
          </form>

          {/* Password Section */}
          {isEmailProvider && (
            <div className="ss-auth-section">
              <div className="ss-auth-section-title">
                <span className="material-symbols-outlined">{ICONS.security}</span>
                Security Credentials
              </div>

              {passwordError && (
                <div className="ss-auth-error" style={{ marginTop: '16px' }}>
                  <span className="material-symbols-outlined">{ICONS.errorOutline}</span>
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} style={{ marginTop: '16px' }}>
                <div className="ss-auth-field">
                  <label className="ss-auth-label">Current Password</label>
                  <input className="ss-auth-input" type="password" placeholder="••••••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="ss-auth-profile-grid" style={{ marginBottom: '16px' }}>
                  <div>
                    <label className="ss-auth-label">New Password</label>
                    <input className="ss-auth-input" type="password" placeholder="Min. 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  </div>
                  <div>
                    <label className="ss-auth-label">Confirm New Password</label>
                    <input className="ss-auth-input" type="password" placeholder="Repeat new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="ss-auth-btn-ghost" disabled={isLoading}>Update Security</button>
                </div>
              </form>
            </div>
          )}

          {/* Danger Zone */}
          <div className="ss-auth-section">
            <div className="ss-auth-section-title" style={{ color: 'inherit' }}>Danger Zone</div>
            <p className="ss-auth-section-desc" style={{ marginBottom: '16px' }}>
              Deleting your account is permanent. All organizations you own will also be deleted.
            </p>

            {deleteError && (
              <div className="ss-auth-error">
                <span className="material-symbols-outlined">{ICONS.errorOutline}</span>
                <span>{deleteError}</span>
              </div>
            )}

            {showDeleteConfirm ? (
              <div>
                <div className="ss-auth-field">
                  <label className="ss-auth-label">Type your email to confirm</label>
                  <input
                    className="ss-auth-input"
                    type="email"
                    placeholder={user?.email}
                    value={deleteEmailConfirm}
                    onChange={(e) => setDeleteEmailConfirm(e.target.value)}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="ss-auth-btn-ghost"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteEmailConfirm('')
                      setDeleteError(null)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="ss-auth-btn-primary ss-auth-btn-sm"
                    style={{ width: 'auto', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                    disabled={!emailMatches || isDeleting}
                    onClick={handleDeleteAccount}
                  >
                    {isDeleting && <span className="ss-auth-spinner" />}
                    Delete account
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="ss-auth-btn-outline"
                style={{ borderColor: 'currentColor', width: 'auto' }}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete my account
              </button>
            )}
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
    </div>
  )
}
