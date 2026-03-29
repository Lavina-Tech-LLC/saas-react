import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useOrg } from './hooks'
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
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !e.composedPath().includes(dropdownRef.current)) {
      setOpen(false)
      setShowCreateForm(false)
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
          setShowCreateForm(false)
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

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-user-btn" ref={dropdownRef}>
        <button
          type="button"
          className="ss-btn ss-btn-org-switcher"
          onClick={() => setOpen(!open)}
        >
          {displayName}
          <span className="ss-chevron">{open ? '\u25B2' : '\u25BC'}</span>
        </button>

        {open && (
          <div className="ss-dropdown ss-dropdown-org">
            {orgs.map((org) => (
              <button
                key={org.id}
                type="button"
                className={`ss-dropdown-item ${selectedOrg?.id === org.id ? 'ss-dropdown-item-active' : ''}`}
                onClick={async () => {
                  setOpen(false)
                  setShowCreateForm(false)
                  await selectOrg(org.id)
                  onOrgChange?.(org)
                }}
              >
                {org.name}
              </button>
            ))}

            <div className="ss-dropdown-divider" />

            {showCreateForm ? (
              <div className="ss-inline-form">
                {createError && <div className="ss-global-error" style={{ marginBottom: '8px', fontSize: '12px' }}>{createError}</div>}
                <form onSubmit={handleCreate}>
                  <div className="ss-field">
                    <input
                      className="ss-input"
                      type="text"
                      placeholder="Organization name"
                      value={newName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="ss-field">
                    <input
                      className="ss-input"
                      type="text"
                      placeholder="org-slug"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ss-btn-group" style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      className="ss-btn ss-btn-sm ss-btn-current"
                      onClick={() => {
                        setShowCreateForm(false)
                        setCreateError(null)
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ss-btn ss-btn-sm ss-btn-primary"
                      disabled={isCreating}
                    >
                      {isCreating && <span className="ss-spinner" />}
                      Create
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                type="button"
                className="ss-dropdown-item"
                onClick={() => setShowCreateForm(true)}
                style={{ fontWeight: 500 }}
              >
                + Create organization
              </button>
            )}
          </div>
        )}
      </div>
    </ShadowHost>
  )
}
