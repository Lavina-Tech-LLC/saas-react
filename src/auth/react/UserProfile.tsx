import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useAuth } from './hooks'
import type { Appearance } from '../../core/types'

export interface UserProfileProps {
  appearance?: Appearance
}

export function UserProfile({ appearance: localAppearance }: UserProfileProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const { user, signOut } = useAuth()
  const appearance = localAppearance ?? globalAppearance

  if (!user) return null

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-card">
        <h2 className="ss-title">Profile</h2>

        <div className="ss-field">
          <label className="ss-label">Email</label>
          <input className="ss-input" type="email" value={user.email} disabled readOnly />
        </div>

        <div className="ss-field">
          <label className="ss-label">Provider</label>
          <input
            className="ss-input"
            type="text"
            value={user.provider}
            disabled
            readOnly
          />
        </div>

        <div className="ss-field">
          <label className="ss-label">Email verified</label>
          <input
            className="ss-input"
            type="text"
            value={user.emailVerified ? 'Yes' : 'No'}
            disabled
            readOnly
          />
        </div>

        <div style={{ marginTop: '24px' }}>
          <button
            type="button"
            className="ss-btn ss-btn-primary"
            onClick={() => signOut()}
            style={{ background: '#ef4444' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </ShadowHost>
  )
}
