import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useOrg } from './hooks'
import { ICONS } from '../../styles/icons'
import type { Appearance } from '../../core/types'
import type { Org } from '../types'

export interface OrgSwitcherProps {
  appearance?: Appearance
  onOrgChange?: (org: Org) => void
}

export function OrgSwitcher({ appearance: localAppearance, onOrgChange }: OrgSwitcherProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const { orgs, selectedOrg, selectOrg, createOrg, isLoading } = useOrg()
  const appearance = localAppearance ?? globalAppearance

  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
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

  const handleNameChange = useCallback((value: string) => {
    setNewName(value)
    setNewSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  }, [])

  const handleCreate = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setCreateError(null)
      setIsCreating(true)
      try {
        const org = await createOrg(newName, newSlug)
        if (org) {
          await selectOrg(org.id)
          onOrgChange?.(org)
          setNewName('')
          setNewSlug('')
          setOpen(false)
        }
      } catch (err) {
        setCreateError(err instanceof Error ? err.message : 'Failed to create organization')
      } finally {
        setIsCreating(false)
      }
    },
    [newName, newSlug, createOrg, selectOrg, onOrgChange],
  )

  if (isLoading) return null

  const displayName = selectedOrg?.name ?? (orgs.length === 0 ? 'No organization' : 'Select organization')
  const orgInitials = selectedOrg
    ? selectedOrg.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '--'

  return (
    <ShadowHost appearance={appearance}>
      <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '360px' }} ref={dropdownRef}>
        {/* Trigger */}
        <button
          type="button"
          className="ss-auth-org-trigger"
          onClick={() => setOpen(!open)}
        >
          <div className="ss-auth-org-trigger-inner">
            <div className="ss-auth-org-avatar">{orgInitials}</div>
            <div style={{ textAlign: 'left' }}>
              <div className="ss-auth-org-trigger-label">Current Organization</div>
              <div className="ss-auth-org-trigger-name">{displayName}</div>
            </div>
          </div>
          <span className="material-symbols-outlined">{ICONS.unfoldMore}</span>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="ss-auth-dropdown ss-auth-dropdown-left ss-auth-glass-panel" style={{ width: '100%' }}>
            <div className="ss-auth-section-label">Your Organizations</div>

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

            {/* Create Section (tonal shift) */}
            <div className="ss-auth-org-create">
              <div className="ss-auth-org-create-header">
                <span className="material-symbols-outlined">{ICONS.addCircle}</span>
                <span>Create organization</span>
              </div>

              {createError && (
                <div className="ss-auth-error" style={{ marginBottom: '12px', fontSize: '12px' }}>
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreate}>
                <div className="ss-auth-field">
                  <label className="ss-auth-label" style={{ fontSize: '10px' }}>Org Name</label>
                  <input
                    className="ss-auth-input"
                    type="text"
                    placeholder="e.g. Nexus Dynamics"
                    value={newName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    style={{ fontSize: '13px', padding: '10px 12px' }}
                  />
                </div>
                <div className="ss-auth-field">
                  <label className="ss-auth-label" style={{ fontSize: '10px' }}>Workspace Slug</label>
                  <div style={{ position: 'relative' }}>
                    <span className="ss-auth-org-slug-prefix">/</span>
                    <input
                      className="ss-auth-input"
                      type="text"
                      placeholder="nexus-dynamics"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      required
                      style={{ fontSize: '13px', padding: '10px 12px 10px 22px' }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="ss-auth-btn-primary"
                  disabled={isCreating || !newName.trim()}
                  style={{ marginTop: '8px' }}
                >
                  {isCreating && <span className="ss-auth-spinner" />}
                  Initialize Organization
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </ShadowHost>
  )
}
