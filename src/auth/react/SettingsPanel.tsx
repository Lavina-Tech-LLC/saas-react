import { useState, useCallback, useEffect, useRef, type FormEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useAuth, useProfile, useOrg, useDeleteAccount, useInvites } from './hooks'
import { AvatarUploadModal } from './AvatarUploadModal'
import { ICONS } from '../../styles/icons'

type SettingsTab = 'profile' | 'organization' | 'people' | 'invites' | 'billing'

export interface SettingsPanelProps {
  onClose: () => void
  afterDeleteAccountUrl?: string
  defaultTab?: SettingsTab
  onOrgDeleted?: () => void
  onOrgUpdated?: () => void
}

export function SettingsPanel({ onClose, afterDeleteAccountUrl, defaultTab = 'profile', onOrgDeleted, onOrgUpdated }: SettingsPanelProps) {
  const { appearance } = useSaaSContext()
  const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab)
  const { invites: pendingInvites } = useInvites()
  const { user } = useAuth()
  const { selectedOrg, members } = useOrg()

  // Determine the caller's role in the selected org.
  const myRole = selectedOrg?.role
    ?? members.find((m) => m.userId === user?.id)?.role
  const isOwner = myRole === 'owner'
  const isAdminOrOwner = isOwner || myRole === 'admin'

  const allTabs: { key: SettingsTab; label: string; icon: string; badge?: number }[] = [
    { key: 'profile', label: 'Profile', icon: ICONS.person },
    { key: 'organization', label: 'Organization', icon: ICONS.corporateFare },
    { key: 'people', label: 'People', icon: ICONS.group },
    { key: 'invites', label: 'Invites', icon: ICONS.mail, badge: pendingInvites.length || undefined },
    { key: 'billing', label: 'Billing', icon: ICONS.creditCard },
  ]

  const tabs = allTabs.filter((tab) => {
    switch (tab.key) {
      case 'profile': return true
      case 'invites': return true
      case 'organization': return isOwner
      case 'people': return isAdminOrOwner
      case 'billing': return isOwner
      default: return false
    }
  })

  // Redirect to profile if the active tab is no longer visible.
  useEffect(() => {
    if (tabs.length > 0 && !tabs.some((t) => t.key === activeTab)) {
      setActiveTab('profile')
    }
  }, [myRole, activeTab])

  return (
    <ShadowHost appearance={appearance} portalToBody>
    <div className="ss-auth-settings-page">
      {/* Header */}
      <div className="ss-auth-settings-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="ss-auth-settings-back" onClick={onClose}>
            <span className="material-symbols-outlined">{ICONS.arrowBack}</span>
          </button>
          <h2>Settings</h2>
        </div>
        <button type="button" className="ss-auth-modal-close" onClick={onClose}>
          <span className="material-symbols-outlined">{ICONS.close}</span>
        </button>
      </div>

      <div className="ss-auth-settings-layout">
        {/* Nav */}
        <nav className="ss-auth-settings-nav">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`ss-auth-settings-nav-item${activeTab === tab.key ? ' ss-auth-settings-nav-item-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
              {tab.badge != null && tab.badge > 0 && (
                <span className="ss-auth-invite-badge" style={{ position: 'static', marginLeft: '6px' }}>{tab.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="ss-auth-settings-content">
          {activeTab === 'profile' && (
            <ProfileSection afterDeleteAccountUrl={afterDeleteAccountUrl} />
          )}
          {activeTab === 'organization' && <OrganizationSection onOrgDeleted={onOrgDeleted} onOrgUpdated={onOrgUpdated} />}
          {activeTab === 'people' && <PeopleSection />}
          {activeTab === 'invites' && <InvitesSection />}
          {activeTab === 'billing' && <BillingSection />}
        </div>
      </div>
    </div>
    </ShadowHost>
  )
}

/* -------------------------------------------------------------------------- */
/* Profile Section                                                            */
/* -------------------------------------------------------------------------- */

function ProfileSection({ afterDeleteAccountUrl }: { afterDeleteAccountUrl?: string }) {
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
    <>
      <h3>Profile</h3>

      {/* Avatar + Info */}
      <div className="ss-auth-settings-card">
        <div className="ss-auth-profile-header" style={{ border: 'none', background: 'none', padding: 0, marginBottom: 16 }}>
          <div className="ss-auth-avatar-lg" onClick={() => setShowAvatarUpload(true)}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '48px', fontWeight: 800, opacity: 0.4,
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
      </div>

      {/* Password Section */}
      {isEmailProvider && (
        <div className="ss-auth-settings-card">
          <h4>
            <span className="material-symbols-outlined">{ICONS.security}</span>
            Security Credentials
          </h4>

          {passwordError && (
            <div className="ss-auth-error" style={{ marginBottom: '16px' }}>
              <span className="material-symbols-outlined">{ICONS.errorOutline}</span>
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword}>
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
      <div className="ss-auth-settings-card ss-auth-settings-danger">
        <h4>Danger Zone</h4>
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

      {showAvatarUpload && (
        <AvatarUploadModal
          onUpload={handleAvatarUpload}
          onClose={() => setShowAvatarUpload(false)}
          isLoading={isLoading}
        />
      )}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Organization Section                                                       */
/* -------------------------------------------------------------------------- */

function OrganizationSection({ onOrgDeleted, onOrgUpdated }: { onOrgDeleted?: () => void; onOrgUpdated?: () => void }) {
  const { selectedOrg, updateOrg, deleteOrg, uploadOrgAvatar, isLoading, error, setError } = useOrg()
  const [orgName, setOrgName] = useState(selectedOrg?.name ?? '')
  const [orgAvatarUrl, setOrgAvatarUrl] = useState(selectedOrg?.avatarUrl ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [showOrgAvatarUpload, setShowOrgAvatarUpload] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteNameConfirm, setDeleteNameConfirm] = useState('')

  useEffect(() => {
    if (selectedOrg) {
      setOrgName(selectedOrg.name)
      setOrgAvatarUrl(selectedOrg.avatarUrl ?? '')
      setDeleted(false)
    }
  }, [selectedOrg])

  const handleOrgAvatarUpload = useCallback(
    async (blob: Blob) => {
      if (!selectedOrg) return
      const result = await uploadOrgAvatar(selectedOrg.id, blob)
      if (result) {
        setOrgAvatarUrl(result.avatarUrl)
        setShowOrgAvatarUpload(false)
        onOrgUpdated?.()
      }
    },
    [selectedOrg, uploadOrgAvatar, onOrgUpdated],
  )

  if (deleted) {
    return (
      <>
        <h3>Organization</h3>
        <div className="ss-auth-settings-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.4, marginBottom: '16px', display: 'block' }}>{ICONS.check}</span>
          <h4 style={{ margin: '0 0 8px' }}>Organization deleted</h4>
          <p className="ss-auth-section-desc">The organization has been permanently deleted.</p>
        </div>
      </>
    )
  }

  if (!selectedOrg) {
    return (
      <>
        <h3>Organization</h3>
        <div className="ss-auth-settings-empty">
          <span className="material-symbols-outlined">{ICONS.corporateFare}</span>
          <div>Select an organization from the user menu to manage its settings.</div>
        </div>
      </>
    )
  }

  const handleSaveName = async (e: FormEvent) => {
    e.preventDefault()
    if (!orgName.trim()) return
    setIsSaving(true)
    setSaveSuccess(false)
    const result = await updateOrg(selectedOrg.id, { name: orgName.trim() })
    setIsSaving(false)
    if (result) {
      setSaveSuccess(true)
      onOrgUpdated?.()
    }
  }

  const handleDeleteOrg = async () => {
    const ok = await deleteOrg(selectedOrg.id)
    if (ok) {
      setShowDeleteConfirm(false)
      setDeleted(true)
      onOrgDeleted?.()
    }
  }

  return (
    <>
      <h3>Organization</h3>

      <div className="ss-auth-settings-card">
        <h4>
          <span className="material-symbols-outlined">{ICONS.corporateFare}</span>
          General
        </h4>

        {error && (
          <div className="ss-auth-error" style={{ marginBottom: '16px' }}>
            <span className="material-symbols-outlined">{ICONS.errorOutline}</span>
            <span>{error}</span>
          </div>
        )}
        {saveSuccess && (
          <div className="ss-auth-info-box" style={{ marginBottom: '16px' }}>
            <span className="material-symbols-outlined">{ICONS.check}</span>
            <span>Organization updated</span>
          </div>
        )}

        {/* Org Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div className="ss-auth-avatar-lg" onClick={() => setShowOrgAvatarUpload(true)} style={{ width: '72px', height: '72px', borderRadius: '12px' }}>
            {orgAvatarUrl ? (
              <img src={orgAvatarUrl} alt="" style={{ borderRadius: '12px' }} />
            ) : (
              <div className="ss-auth-org-avatar" style={{
                width: '100%', height: '100%', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: 800,
              }}>
                {selectedOrg.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="ss-auth-avatar-overlay" style={{ borderRadius: '12px' }}>
              <span className="material-symbols-outlined">{ICONS.camera}</span>
              <span>Edit</span>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>{selectedOrg.name}</div>
            <div style={{ fontSize: '13px', opacity: 0.6 }}>{selectedOrg.slug}</div>
          </div>
        </div>

        <form onSubmit={handleSaveName}>
          <div className="ss-auth-field">
            <label className="ss-auth-label">Organization Name</label>
            <input
              className="ss-auth-input"
              type="text"
              value={orgName}
              onChange={(e) => { setOrgName(e.target.value); setSaveSuccess(false) }}
            />
          </div>
          <div className="ss-auth-field">
            <label className="ss-auth-label">Slug</label>
            <input className="ss-auth-input ss-auth-input-readonly" type="text" value={selectedOrg.slug} readOnly />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="ss-auth-btn-primary ss-auth-btn-sm" disabled={isSaving} style={{ width: 'auto' }}>
              {isSaving && <span className="ss-auth-spinner" />}
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="ss-auth-settings-card ss-auth-settings-danger">
        <h4>Danger Zone</h4>
        <p className="ss-auth-section-desc" style={{ marginBottom: '16px' }}>
          Deleting this organization is permanent and will remove all members.
        </p>

        {showDeleteConfirm ? (
          <div>
            <div className="ss-auth-field">
              <label className="ss-auth-label">Type the organization name to confirm</label>
              <input
                className="ss-auth-input"
                type="text"
                placeholder={selectedOrg.name}
                value={deleteNameConfirm}
                onChange={(e) => setDeleteNameConfirm(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" className="ss-auth-btn-ghost" onClick={() => { setShowDeleteConfirm(false); setDeleteNameConfirm('') }}>
                Cancel
              </button>
              <button
                type="button"
                className="ss-auth-btn-primary ss-auth-btn-sm"
                style={{ width: 'auto', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                disabled={deleteNameConfirm !== selectedOrg.name || isLoading}
                onClick={handleDeleteOrg}
              >
                {isLoading && <span className="ss-auth-spinner" />}
                Delete organization
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
            Delete this organization
          </button>
        )}
      </div>

      {showOrgAvatarUpload && (
        <AvatarUploadModal
          onUpload={handleOrgAvatarUpload}
          onClose={() => setShowOrgAvatarUpload(false)}
          isLoading={isSaving}
        />
      )}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Role Select (custom dropdown to match dark UI)                             */
/* -------------------------------------------------------------------------- */

function RoleSelect({ value, onChange, roles, style }: {
  value: string
  onChange: (value: string) => void
  roles: { id: string; key: string; name: string }[]
  style?: React.CSSProperties
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      // `contains()` fails for events inside a ShadowRoot because the browser
      // retargets the event's `target` to the shadow host. Use composedPath()
      // to reach the real target across the shadow boundary.
      if (ref.current && !e.composedPath().includes(ref.current)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const selected = roles.find((r) => r.key === value)

  return (
    <div ref={ref} className="ss-auth-role-select" style={style}>
      <button
        type="button"
        className="ss-auth-role-select-trigger ss-auth-input"
        onClick={() => setOpen(!open)}
      >
        <span>{selected?.name ?? value}</span>
        <span className="material-symbols-outlined" style={{ fontSize: '16px', marginLeft: 'auto' }}>
          {open ? ICONS.expandLess : ICONS.expandMore}
        </span>
      </button>
      {open && (
        <div className="ss-auth-role-select-menu">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`ss-auth-role-select-option${r.key === value ? ' ss-auth-role-select-option-active' : ''}`}
              onClick={() => { onChange(r.key); setOpen(false) }}
            >
              {r.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* People Section                                                             */
/* -------------------------------------------------------------------------- */

function PeopleSection() {
  const {
    selectedOrg, members, invites, inviteLinks, roles, isLoading, error, setError,
    sendInvite, refreshInvites, revokeInvite,
    createInviteLink, refreshInviteLinks, revokeInviteLink, getInviteLinkUrl,
    updateMemberRoles, removeMember, refreshMembers,
  } = useOrg()

  // Assignable roles: all roles except "owner" (owner is assigned at org creation only).
  const assignableRoles = roles.filter((r) => r.key !== 'owner')

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState<{ email: string; url?: string } | null>(null)
  const [copiedInviteEmail, setCopiedInviteEmail] = useState(false)

  const [editMember, setEditMember] = useState<{ userId: string; email: string; role: string } | null>(null)
  const [editRoles, setEditRoles] = useState<string[]>([])

  const [removingMember, setRemovingMember] = useState<{ userId: string; email: string } | null>(null)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [linkRole, setLinkRole] = useState('member')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyLinkToClipboard = (link: { code: string; url?: string }) => {
    const url = getInviteLinkUrl(link)
    navigator.clipboard.writeText(url)
    setCopiedCode(link.code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  useEffect(() => {
    if (selectedOrg) {
      refreshMembers(selectedOrg.id)
      refreshInvites(selectedOrg.id)
      refreshInviteLinks(selectedOrg.id)
    }
  }, [selectedOrg, refreshMembers, refreshInvites, refreshInviteLinks])

  if (!selectedOrg) {
    return (
      <>
        <h3>People</h3>
        <div className="ss-auth-settings-empty">
          <span className="material-symbols-outlined">{ICONS.group}</span>
          <div>Select an organization from the user menu to manage members.</div>
        </div>
      </>
    )
  }

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault()
    setInviteSuccess(null)
    const result = await sendInvite(selectedOrg.id, inviteEmail, inviteRole)
    if (result) {
      setInviteSuccess({ email: inviteEmail, url: result.url })
      setInviteEmail('')
      setInviteRole('member')
      setShowInviteForm(false)
      refreshInvites(selectedOrg.id)
    }
  }

  const handleEditConfirm = async () => {
    if (!editMember || editRoles.length === 0) return
    const ok = await updateMemberRoles(selectedOrg.id, editMember.userId, editRoles)
    if (ok) setEditMember(null)
  }

  const handleRemoveConfirm = async () => {
    if (!removingMember) return
    const ok = await removeMember(selectedOrg.id, removingMember.userId)
    if (ok) setRemovingMember(null)
  }

  const handleRevokeInvite = async (inviteId: string) => {
    await revokeInvite(selectedOrg.id, inviteId)
  }

  const roleBadgeClass = (role: string) => {
    if (role === 'owner') return 'ss-auth-role-badge ss-auth-role-badge-owner'
    if (role === 'admin') return 'ss-auth-role-badge ss-auth-role-badge-admin'
    return 'ss-auth-role-badge ss-auth-role-badge-member'
  }

  return (
    <>
      <h3>People</h3>

      {error && (
        <div className="ss-auth-error" style={{ marginBottom: '16px' }}>
          <span className="material-symbols-outlined">{ICONS.errorOutline}</span>
          <span>{error}</span>
        </div>
      )}
      {inviteSuccess && (
        <div className="ss-auth-info-box" style={{ marginBottom: '16px', flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined">{ICONS.check}</span>
            <span>Invitation created for <strong>{inviteSuccess.email}</strong></span>
          </div>
          {inviteSuccess.url && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                className="ss-auth-input"
                readOnly
                value={inviteSuccess.url}
                style={{ flex: 1, fontFamily: 'monospace', fontSize: '12px' }}
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                type="button"
                className="ss-auth-icon-btn"
                title={copiedInviteEmail ? 'Copied!' : 'Copy invite link'}
                onClick={() => {
                  if (!inviteSuccess.url) return
                  navigator.clipboard.writeText(inviteSuccess.url)
                  setCopiedInviteEmail(true)
                  setTimeout(() => setCopiedInviteEmail(false), 2000)
                }}
              >
                <span className="material-symbols-outlined">
                  {copiedInviteEmail ? ICONS.check : ICONS.copy}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Members */}
      <div className="ss-auth-settings-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h4 style={{ margin: 0 }}>
            <span className="material-symbols-outlined">{ICONS.group}</span>
            Members
          </h4>
          <button
            type="button"
            className="ss-auth-btn-primary ss-auth-btn-sm"
            style={{ width: 'auto' }}
            onClick={() => setShowInviteForm(!showInviteForm)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{ICONS.add}</span>
            Invite
          </button>
        </div>

        {/* Inline invite form */}
        {showInviteForm && (
          <form onSubmit={handleInvite} style={{ marginBottom: '16px', padding: '16px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label className="ss-auth-label">Email</label>
                <input
                  className="ss-auth-input"
                  type="email"
                  placeholder="member@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div style={{ width: '160px' }}>
                <label className="ss-auth-label">Role</label>
                <RoleSelect value={inviteRole} onChange={setInviteRole} roles={assignableRoles} />
              </div>
              <button type="submit" className="ss-auth-btn-primary ss-auth-btn-sm" disabled={isLoading} style={{ width: 'auto', marginBottom: '0' }}>
                Send
              </button>
            </div>
          </form>
        )}

        {members.length === 0 ? (
          <div className="ss-auth-settings-empty" style={{ padding: '20px' }}>
            <div>No members yet.</div>
          </div>
        ) : (
          <table className="ss-auth-settings-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.userId}>
                  <td>{member.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {member.roles && member.roles.length > 0
                        ? member.roles.map((r) => (
                            <span key={r.id} className={roleBadgeClass(r.key)}>{r.name}</span>
                          ))
                        : <span className={roleBadgeClass(member.role)}>{member.roleName || member.role}</span>
                      }
                    </div>
                  </td>
                  <td>
                    {member.role === 'owner' ? (
                      <span style={{ fontSize: '12px', opacity: 0.4 }}>—</span>
                    ) : (
                      <div className="ss-auth-settings-actions">
                        <button
                          type="button"
                          className="ss-auth-icon-btn"
                          title="Edit role"
                          onClick={() => { setEditMember(member); setEditRoles(member.roles?.map((r) => r.key) ?? [member.role]) }}
                        >
                          <span className="material-symbols-outlined">{ICONS.edit}</span>
                        </button>
                        <button
                          type="button"
                          className="ss-auth-icon-btn ss-auth-icon-btn-danger"
                          title="Remove member"
                          onClick={() => setRemovingMember(member)}
                        >
                          <span className="material-symbols-outlined">{ICONS.personRemove}</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div className="ss-auth-settings-card">
          <h4>
            <span className="material-symbols-outlined">{ICONS.send}</span>
            Pending Invites
          </h4>

          <table className="ss-auth-settings-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr key={invite.id}>
                  <td>{invite.email}</td>
                  <td><span className={roleBadgeClass(invite.role)}>{invite.role}</span></td>
                  <td>
                    <button
                      type="button"
                      className="ss-auth-icon-btn ss-auth-icon-btn-danger"
                      title="Revoke invite"
                      onClick={() => handleRevokeInvite(invite.id)}
                    >
                      <span className="material-symbols-outlined">{ICONS.close}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Links */}
      <div className="ss-auth-settings-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h4 style={{ margin: 0 }}>
            <span className="material-symbols-outlined">{ICONS.link}</span>
            Invite Links
          </h4>
          <button
            type="button"
            className="ss-auth-btn-primary ss-auth-btn-sm"
            style={{ width: 'auto' }}
            onClick={() => setShowLinkForm(!showLinkForm)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{ICONS.add}</span>
            Create Link
          </button>
        </div>

        {showLinkForm && (
          <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ width: '160px' }}>
                <label className="ss-auth-label">Role</label>
                <RoleSelect value={linkRole} onChange={setLinkRole} roles={assignableRoles} />
              </div>
              <button
                type="button"
                className="ss-auth-btn-primary ss-auth-btn-sm"
                disabled={isLoading}
                style={{ width: 'auto', marginBottom: '0' }}
                onClick={async () => {
                  const link = await createInviteLink(selectedOrg.id, linkRole)
                  if (link) {
                    setShowLinkForm(false)
                    setLinkRole('member')
                  }
                }}
              >
                Create
              </button>
            </div>
          </div>
        )}

        {inviteLinks.length === 0 ? (
          <div className="ss-auth-settings-empty" style={{ padding: '20px' }}>
            <div>No active invite links.</div>
          </div>
        ) : (
          <table className="ss-auth-settings-table">
            <thead>
              <tr>
                <th>Link</th>
                <th>Role</th>
                <th>Uses</th>
                <th>Expires</th>
                <th style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inviteLinks.map((link) => {
                const linkUrl = getInviteLinkUrl(link)
                return (
                  <tr key={link.id}>
                    <td>
                      <span
                        style={{ fontFamily: 'monospace', fontSize: '12px', cursor: 'pointer', opacity: 0.7 }}
                        title={linkUrl}
                        onClick={() => copyLinkToClipboard(link)}
                      >
                        {copiedCode === link.code ? 'Copied!' : `...${link.code.slice(-12)}`}
                      </span>
                    </td>
                    <td><span className={roleBadgeClass(link.role)}>{link.roleName || link.role}</span></td>
                    <td>{link.useCount}{link.maxUses > 0 ? `/${link.maxUses}` : ''}</td>
                    <td style={{ fontSize: '12px' }}>{new Date(link.expiresAt).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          className="ss-auth-icon-btn"
                          title={copiedCode === link.code ? 'Copied!' : 'Copy invite link'}
                          onClick={() => copyLinkToClipboard(link)}
                        >
                          <span className="material-symbols-outlined">
                            {copiedCode === link.code ? ICONS.check : ICONS.copy}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="ss-auth-icon-btn ss-auth-icon-btn-danger"
                          title="Revoke link"
                          onClick={() => revokeInviteLink(selectedOrg.id, link.id)}
                        >
                          <span className="material-symbols-outlined">{ICONS.close}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Roles Modal */}
      {editMember && (
        <div className="ss-auth-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditMember(null) }}>
          <div className="ss-auth-modal" style={{ maxWidth: '400px' }}>
            <div className="ss-auth-modal-header">
              <h2>Edit Roles</h2>
              <button type="button" className="ss-auth-modal-close" onClick={() => setEditMember(null)}>
                <span className="material-symbols-outlined">{ICONS.close}</span>
              </button>
            </div>
            <div className="ss-auth-modal-body">
              <p style={{ fontSize: '14px', marginBottom: '16px', margin: '0 0 16px 0' }}>
                Change roles for <strong>{editMember.email}</strong>
              </p>
              <div className="ss-auth-field">
                <label className="ss-auth-label">Roles</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {assignableRoles.map((r) => (
                    <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        checked={editRoles.includes(r.key)}
                        onChange={() => {
                          if (editRoles.includes(r.key)) {
                            setEditRoles(editRoles.filter((k) => k !== r.key))
                          } else {
                            setEditRoles([...editRoles, r.key])
                          }
                        }}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span className={roleBadgeClass(r.key)}>{r.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="ss-auth-btn-ghost" onClick={() => setEditMember(null)}>Cancel</button>
                <button
                  type="button"
                  className="ss-auth-btn-primary ss-auth-btn-sm"
                  style={{ width: 'auto' }}
                  onClick={handleEditConfirm}
                  disabled={editRoles.length === 0}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation */}
      {removingMember && (
        <div className="ss-auth-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setRemovingMember(null) }}>
          <div className="ss-auth-modal" style={{ maxWidth: '400px' }}>
            <div className="ss-auth-modal-header">
              <h2>Remove Member</h2>
              <button type="button" className="ss-auth-modal-close" onClick={() => setRemovingMember(null)}>
                <span className="material-symbols-outlined">{ICONS.close}</span>
              </button>
            </div>
            <div className="ss-auth-modal-body">
              <p style={{ fontSize: '14px', margin: '0 0 16px 0' }}>
                Are you sure you want to remove <strong>{removingMember.email}</strong> from the organization?
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="ss-auth-btn-ghost" onClick={() => setRemovingMember(null)}>Cancel</button>
                <button
                  type="button"
                  className="ss-auth-btn-primary ss-auth-btn-sm"
                  style={{ width: 'auto', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                  onClick={handleRemoveConfirm}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Invites Section                                                            */
/* -------------------------------------------------------------------------- */

function InvitesSection() {
  const { invites, isLoading, error, setError, accept, decline, refresh } = useInvites()
  const { refresh: refreshOrgs } = useOrg()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleAccept = async (inviteId: string) => {
    setActionLoading(inviteId)
    setError(null)
    const result = await accept(inviteId)
    setActionLoading(null)
    if (result) {
      refreshOrgs()
    }
  }

  const handleDecline = async (inviteId: string) => {
    setActionLoading(inviteId)
    setError(null)
    await decline(inviteId)
    setActionLoading(null)
  }

  return (
    <>
      <h3>Invites</h3>

      {error && (
        <div className="ss-auth-error" style={{ marginBottom: '16px' }}>
          <span className="material-symbols-outlined">{ICONS.errorOutline}</span>
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="ss-auth-settings-empty" style={{ padding: '40px' }}>
          <span className="ss-auth-spinner" />
        </div>
      ) : invites.length === 0 ? (
        <div className="ss-auth-settings-empty">
          <span className="material-symbols-outlined">{ICONS.mail}</span>
          <div>No pending invitations</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {invites.map((invite) => (
            <div key={invite.id} className="ss-auth-settings-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div className="ss-auth-org-avatar" style={{ width: '40px', height: '40px', fontSize: '14px', flexShrink: 0 }}>
                    {invite.orgName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {invite.orgName}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.6, display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="ss-auth-role-badge ss-auth-role-badge-member">{invite.role}</span>
                      <span>Expires {new Date(invite.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    type="button"
                    className="ss-auth-btn-ghost"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                    onClick={() => handleDecline(invite.id)}
                    disabled={actionLoading === invite.id}
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    className="ss-auth-btn-primary ss-auth-btn-sm"
                    style={{ width: 'auto', padding: '6px 16px', fontSize: '13px' }}
                    onClick={() => handleAccept(invite.id)}
                    disabled={actionLoading === invite.id}
                  >
                    {actionLoading === invite.id && <span className="ss-auth-spinner" />}
                    Accept
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Billing Section                                                            */
/* -------------------------------------------------------------------------- */

function BillingSection() {
  const { selectedOrg } = useOrg()

  if (!selectedOrg) {
    return (
      <>
        <h3>Billing</h3>
        <div className="ss-auth-settings-empty">
          <span className="material-symbols-outlined">{ICONS.creditCard}</span>
          <div>Select an organization from the user menu to manage billing.</div>
        </div>
      </>
    )
  }

  return (
    <>
      <h3>Billing</h3>

      <div className="ss-auth-settings-card">
        <h4>
          <span className="material-symbols-outlined">{ICONS.creditCard}</span>
          Plan &amp; Billing
        </h4>
        <div className="ss-auth-settings-empty" style={{ padding: '20px' }}>
          <div>No billing plan configured for this organization.</div>
        </div>
      </div>
    </>
  )
}
