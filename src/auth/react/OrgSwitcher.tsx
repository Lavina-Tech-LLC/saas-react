import { useState, useRef, useEffect, useCallback } from 'react'
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
  const { orgs, selectedOrg, selectOrg, isLoading } = useOrg()
  const appearance = localAppearance ?? globalAppearance

  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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

  if (isLoading || orgs.length === 0) return null

  const displayName = selectedOrg?.name ?? 'Select organization'

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
                  await selectOrg(org.id)
                  onOrgChange?.(org)
                }}
              >
                {org.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </ShadowHost>
  )
}
