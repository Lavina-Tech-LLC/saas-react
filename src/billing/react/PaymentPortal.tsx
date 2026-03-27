import { useState } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { SubscriptionStatus } from './SubscriptionStatus'
import { InvoiceHistory } from './InvoiceHistory'
import { UsageDisplay } from './UsageDisplay'
import type { Appearance } from '../../core/types'

export interface PaymentPortalProps {
  customerId: string
  portalToken?: string
  limits?: Record<string, number>
  onChangePlan?: () => void
  onCancel?: () => void
  appearance?: Appearance
}

type Tab = 'subscription' | 'invoices' | 'usage'

export function PaymentPortal({
  customerId, portalToken, limits, onChangePlan, onCancel, appearance: localAppearance,
}: PaymentPortalProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const appearance = localAppearance ?? globalAppearance
  const [activeTab, setActiveTab] = useState<Tab>('subscription')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'subscription', label: 'Subscription' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'usage', label: 'Usage' },
  ]

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-card ss-card-wide">
        <h2 className="ss-title">Billing</h2>

        <div className="ss-tab-group">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`ss-tab ${activeTab === tab.id ? 'ss-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ss-tab-content">
          {activeTab === 'subscription' && (
            <SubscriptionStatus
              customerId={customerId}
              portalToken={portalToken}
              onChangePlan={onChangePlan}
              onCancel={onCancel}
            />
          )}
          {activeTab === 'invoices' && (
            <InvoiceHistory customerId={customerId} portalToken={portalToken} />
          )}
          {activeTab === 'usage' && (
            <UsageDisplay customerId={customerId} portalToken={portalToken} limits={limits} />
          )}
        </div>
      </div>
    </ShadowHost>
  )
}
