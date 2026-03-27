import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useInvoices } from './hooks'
import type { Appearance } from '../../core/types'

export interface InvoiceHistoryProps {
  customerId: string
  portalToken?: string
  appearance?: Appearance
}

const STATUS_BADGE: Record<string, string> = {
  paid: 'ss-badge-active',
  open: 'ss-badge-trialing',
  draft: 'ss-badge-paused',
  void: 'ss-badge-canceled',
  uncollectible: 'ss-badge-past-due',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatAmount(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(cents / 100)
}

export function InvoiceHistory({ customerId, portalToken, appearance: localAppearance }: InvoiceHistoryProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const { invoices, isLoading, error } = useInvoices(customerId, portalToken)
  const appearance = localAppearance ?? globalAppearance

  const sorted = [...invoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-card ss-card-wide">
        <h2 className="ss-title">Invoices</h2>

        {isLoading && <div className="ss-loading"><span className="ss-spinner" /> Loading...</div>}
        {error && <div className="ss-global-error">{error}</div>}

        {!isLoading && sorted.length === 0 && (
          <p className="ss-empty">No invoices yet.</p>
        )}

        {!isLoading && sorted.length > 0 && (
          <table className="ss-table">
            <thead>
              <tr>
                <th className="ss-th">Date</th>
                <th className="ss-th">Amount</th>
                <th className="ss-th">Status</th>
                <th className="ss-th">PDF</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((inv) => (
                <tr key={inv.id} className="ss-tr">
                  <td className="ss-td">{formatDate(inv.createdAt)}</td>
                  <td className="ss-td">{formatAmount(inv.amountCents)}</td>
                  <td className="ss-td">
                    <span className={`ss-badge ${STATUS_BADGE[inv.status] || ''}`}>{inv.status}</span>
                  </td>
                  <td className="ss-td">
                    {inv.pdfUrl ? (
                      <a className="ss-link" href={inv.pdfUrl} target="_blank" rel="noopener noreferrer">Download</a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ShadowHost>
  )
}
