import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useSubscription } from './hooks'
import type { Appearance } from '../../core/types'

export interface SubscriptionStatusProps {
  customerId: string
  portalToken?: string
  onChangePlan?: () => void
  onCancel?: () => void
  appearance?: Appearance
}

const STATUS_BADGE: Record<string, string> = {
  active: 'ss-badge-active',
  trialing: 'ss-badge-trialing',
  past_due: 'ss-badge-past-due',
  paused: 'ss-badge-paused',
  canceled: 'ss-badge-canceled',
}

export function SubscriptionStatus({
  customerId, portalToken, onChangePlan, onCancel, appearance: localAppearance,
}: SubscriptionStatusProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const { customer, isLoading, error } = useSubscription(customerId, portalToken)
  const appearance = localAppearance ?? globalAppearance

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-card">
        <h2 className="ss-title">Subscription</h2>

        {isLoading && <div className="ss-loading"><span className="ss-spinner" /> Loading...</div>}
        {error && <div className="ss-global-error">{error}</div>}

        {customer && !isLoading && (
          <>
            <div className="ss-field">
              <label className="ss-label">Customer</label>
              <input className="ss-input" value={customer.name || customer.email} disabled readOnly />
            </div>

            <div className="ss-field">
              <label className="ss-label">Status</label>
              <div>
                <span className={`ss-badge ${STATUS_BADGE['active'] || ''}`}>
                  Active
                </span>
              </div>
            </div>

            <div className="ss-btn-group">
              {onChangePlan && (
                <button type="button" className="ss-btn ss-btn-primary" onClick={onChangePlan}>
                  Change plan
                </button>
              )}
              {onCancel && (
                <button type="button" className="ss-btn ss-btn-danger" onClick={onCancel}>
                  Cancel subscription
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </ShadowHost>
  )
}
