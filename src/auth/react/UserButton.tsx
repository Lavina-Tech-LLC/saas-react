import { useState, useRef, useEffect, useCallback } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useAuth } from './hooks'
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

  if (!user) return null

  const initial = user.email.charAt(0).toUpperCase()

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-user-btn" ref={dropdownRef}>
        <button
          type="button"
          className="ss-avatar"
          onClick={() => setOpen(!open)}
          aria-label="User menu"
        >
          {initial}
        </button>

        {open && (
          <div className="ss-dropdown">
            <div className="ss-dropdown-header">
              <div className="ss-dropdown-email">{user.email}</div>
            </div>
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
      </div>
    </ShadowHost>
  )
}
