import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import type { Appearance } from '../../core/types'
import type { Plan } from '../types'

export interface PricingTableProps {
  plans: Plan[]
  currentPlanId?: string
  onSelectPlan: (planId: string) => void
  interval?: 'month' | 'year'
  appearance?: Appearance
}

function formatPrice(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
}

export function PricingTable({ plans, currentPlanId, onSelectPlan, interval, appearance: localAppearance }: PricingTableProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const appearance = localAppearance ?? globalAppearance

  const filteredPlans = interval
    ? plans.filter((p) => p.interval === interval || p.isFree)
    : plans

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-pricing-grid">
        {filteredPlans.map((plan) => {
          const isCurrent = plan.id === currentPlanId
          return (
            <div key={plan.id} className={`ss-pricing-card ${isCurrent ? 'ss-pricing-card-current' : ''}`}>
              <div className="ss-pricing-header">
                <h3 className="ss-pricing-name">{plan.name}</h3>
                {plan.trialDays > 0 && (
                  <span className="ss-badge ss-badge-trialing">{plan.trialDays}-day trial</span>
                )}
                {plan.isFree && (
                  <span className="ss-badge ss-badge-active">Free</span>
                )}
              </div>

              <div className="ss-pricing-price">
                {plan.isFree ? (
                  <span className="ss-pricing-amount">Free</span>
                ) : (
                  <>
                    <span className="ss-pricing-amount">{formatPrice(plan.amountCents, plan.currency)}</span>
                    <span className="ss-pricing-interval">/{plan.interval}</span>
                  </>
                )}
              </div>

              {plan.description && (
                <p className="ss-pricing-desc">{plan.description}</p>
              )}

              {plan.features.length > 0 && (
                <ul className="ss-pricing-features">
                  {plan.features.map((f, i) => (
                    <li key={i} className="ss-pricing-feature">
                      <span className="ss-check">{'\u2713'}</span> {f}
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                className={`ss-btn ${isCurrent ? 'ss-btn-current' : 'ss-btn-primary'}`}
                disabled={isCurrent}
                onClick={() => onSelectPlan(plan.id)}
              >
                {isCurrent ? 'Current plan' : 'Select plan'}
              </button>
            </div>
          )
        })}
      </div>
    </ShadowHost>
  )
}
