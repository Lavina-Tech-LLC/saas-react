import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useAuth, useOrg } from './hooks'
import { SettingsPanel } from './SettingsPanel'
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
  const [showSettings, setShowSettings] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [createOrgError, setCreateOrgError] = useState<string | null>(null)
  const [isCreatingOrg, setIsCreatingOrg] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { orgs, selectedOrg, selectOrg, createOrg, refresh: refreshOrgs } = useOrg()

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
        {/* Trigger: avatar + org name */}
        <button
          type="button"
          className="ss-auth-user-trigger"
          onClick={() => setOpen(!open)}
          aria-label="User menu"
        >
          <span className="ss-auth-avatar-trigger">
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
          </span>
          {selectedOrg && (
            <span className="ss-auth-trigger-org-name">{selectedOrg.name}</span>
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

            {/* Settings link */}
            <div style={{ padding: '4px 8px' }}>
              <button
                type="button"
                className="ss-auth-dropdown-action"
                onClick={() => {
                  setOpen(false)
                  setShowSettings(true)
                }}
              >
                <span className="material-symbols-outlined">{ICONS.settings}</span>
                Settings
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
                          {org.planName && (
                            <span className="ss-auth-plan-badge">{org.planName}</span>
                          )}
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

        {/* Settings Panel (full-page overlay) */}
        {showSettings && (
          <SettingsPanel
            onClose={() => setShowSettings(false)}
            afterDeleteAccountUrl={afterDeleteAccountUrl}
            onOrgDeleted={refreshOrgs}
            onOrgUpdated={refreshOrgs}
          />
        )}
      </div>
    </ShadowHost>
  )
}
