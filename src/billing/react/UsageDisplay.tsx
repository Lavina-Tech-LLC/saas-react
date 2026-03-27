import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useUsage } from './hooks'
import type { Appearance } from '../../core/types'

export interface UsageDisplayProps {
  customerId: string
  limits?: Record<string, number>
  portalToken?: string
  appearance?: Appearance
}

export function UsageDisplay({ customerId, limits, portalToken, appearance: localAppearance }: UsageDisplayProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const { usage, isLoading, error } = useUsage(customerId, portalToken)
  const appearance = localAppearance ?? globalAppearance

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-card">
        <h2 className="ss-title">Usage</h2>

        {isLoading && <div className="ss-loading"><span className="ss-spinner" /> Loading...</div>}
        {error && <div className="ss-global-error">{error}</div>}

        {!isLoading && usage.length === 0 && (
          <p className="ss-empty">No usage data.</p>
        )}

        {!isLoading && usage.map((u) => {
          const limit = limits?.[u.metric]
          const pct = limit ? Math.min(100, (u.total / limit) * 100) : null

          return (
            <div key={u.metric} className="ss-usage-item">
              <div className="ss-usage-header">
                <span className="ss-usage-metric">{u.metric}</span>
                <span className="ss-usage-value">
                  {u.total.toLocaleString()}
                  {limit ? ` / ${limit.toLocaleString()}` : ''}
                </span>
              </div>
              {pct !== null && (
                <div className="ss-progress-bar">
                  <div
                    className={`ss-progress-fill ${pct > 90 ? 'ss-progress-danger' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </ShadowHost>
  )
}
