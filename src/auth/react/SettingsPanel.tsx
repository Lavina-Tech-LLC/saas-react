import { useState, useCallback, useEffect, type FormEvent } from 'react'
import { useAuth, useProfile, useOrg, useDeleteAccount } from './hooks'
import { AvatarUploadModal } from './AvatarUploadModal'
import { ICONS } from '../../styles/icons'

type SettingsTab = 'profile' | 'organization' | 'people' | 'billing'

export interface SettingsPanelProps {
  onClose: () => void
  afterDeleteAccountUrl?: string
  defaultTab?: SettingsTab
}

export function SettingsPanel({ onClose, afterDeleteAccountUrl, defaultTab = 'profile' }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab)

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'profile', label: 'Profile', icon: ICONS.person },
    { key: 'organization', label: 'Organization', icon: ICONS.corporateFare },
    { key: 'people', label: 'People', icon: ICONS.group },
    { key: 'billing', label: 'Billing', icon: ICONS.creditCard },
  ]

  return (
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
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="ss-auth-settings-content">
          {activeTab === 'profile' && (
            <ProfileSection afterDeleteAccountUrl={afterDeleteAccountUrl} />
          )}
          {activeTab === 'organization' && <OrganizationSection />}
          {activeTab === 'people' && <PeopleSection />}
          {activeTab === 'billing' && <BillingSection />}
        </div>
      </div>
    </div>
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

function OrganizationSection() {
  const { selectedOrg, updateOrg, deleteOrg, isLoading, error, setError } = useOrg()
  const [orgName, setOrgName] = useState(selectedOrg?.name ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteNameConfirm, setDeleteNameConfirm] = useState('')

  useEffect(() => {
    if (selectedOrg) setOrgName(selectedOrg.name)
  }, [selectedOrg])

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
    if (result) setSaveSuccess(true)
  }

  const handleDeleteOrg = async () => {
    const ok = await deleteOrg(selectedOrg.id)
    if (ok) {
      setShowDeleteConfirm(false)
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
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* People Section                                                             */
/* -------------------------------------------------------------------------- */

function PeopleSection() {
  const {
    selectedOrg, members, invites, isLoading, error, setError,
    sendInvite, refreshInvites, revokeInvite,
    updateMemberRole, removeMember, refreshMembers,
  } = useOrg()

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)

  const [editMember, setEditMember] = useState<{ userId: string; email: string; role: string } | null>(null)
  const [editRole, setEditRole] = useState('')

  const [removingMember, setRemovingMember] = useState<{ userId: string; email: string } | null>(null)

  useEffect(() => {
    if (selectedOrg) {
      refreshMembers(selectedOrg.id)
      refreshInvites(selectedOrg.id)
    }
  }, [selectedOrg, refreshMembers, refreshInvites])

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
    setInviteSuccess(false)
    const result = await sendInvite(selectedOrg.id, inviteEmail, inviteRole)
    if (result) {
      setInviteEmail('')
      setInviteRole('member')
      setInviteSuccess(true)
      setShowInviteForm(false)
      refreshInvites(selectedOrg.id)
    }
  }

  const handleEditConfirm = async () => {
    if (!editMember) return
    const ok = await updateMemberRole(selectedOrg.id, editMember.userId, editRole)
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
        <div className="ss-auth-info-box" style={{ marginBottom: '16px' }}>
          <span className="material-symbols-outlined">{ICONS.check}</span>
          <span>Invitation sent</span>
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
              <div style={{ width: '120px' }}>
                <label className="ss-auth-label">Role</label>
                <select
                  className="ss-auth-input"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
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
                  <td><span className={roleBadgeClass(member.role)}>{member.role}</span></td>
                  <td>
                    {member.role === 'owner' ? (
                      <span style={{ fontSize: '12px', opacity: 0.4 }}>—</span>
                    ) : (
                      <div className="ss-auth-settings-actions">
                        <button
                          type="button"
                          className="ss-auth-icon-btn"
                          title="Edit role"
                          onClick={() => { setEditMember(member); setEditRole(member.role) }}
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

      {/* Edit Role Inline Modal */}
      {editMember && (
        <div className="ss-auth-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditMember(null) }}>
          <div className="ss-auth-modal" style={{ maxWidth: '400px' }}>
            <div className="ss-auth-modal-header">
              <h2>Edit Role</h2>
              <button type="button" className="ss-auth-modal-close" onClick={() => setEditMember(null)}>
                <span className="material-symbols-outlined">{ICONS.close}</span>
              </button>
            </div>
            <div className="ss-auth-modal-body">
              <p style={{ fontSize: '14px', marginBottom: '16px', margin: '0 0 16px 0' }}>
                Change role for <strong>{editMember.email}</strong>
              </p>
              <div className="ss-auth-field">
                <label className="ss-auth-label">Role</label>
                <select
                  className="ss-auth-input"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="ss-auth-btn-ghost" onClick={() => setEditMember(null)}>Cancel</button>
                <button type="button" className="ss-auth-btn-primary ss-auth-btn-sm" style={{ width: 'auto' }} onClick={handleEditConfirm}>
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
