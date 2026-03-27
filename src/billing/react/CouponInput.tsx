import { useState, useCallback, type FormEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useBillingClient } from './hooks'
import type { Appearance } from '../../core/types'
import type { ApplyCouponResult } from '../types'

export interface CouponInputProps {
  customerId: string
  portalToken?: string
  onApplied?: (result: ApplyCouponResult) => void
  appearance?: Appearance
}

export function CouponInput({ customerId, portalToken, onApplied, appearance: localAppearance }: CouponInputProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const billing = useBillingClient(portalToken)
  const appearance = localAppearance ?? globalAppearance

  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await billing.applyCoupon(customerId, code.trim())
      setSuccess(`Coupon applied! ${result.discountType === 'percent' ? `${result.amount}% off` : `$${(result.amount / 100).toFixed(2)} off`}`)
      setCode('')
      onApplied?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid coupon code')
    } finally {
      setIsLoading(false)
    }
  }, [billing, customerId, code, onApplied])

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-card">
        <h2 className="ss-title">Apply coupon</h2>

        {error && <div className="ss-global-error">{error}</div>}
        {success && <div className="ss-success-msg">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="ss-field">
            <label className="ss-label" htmlFor="ss-coupon-code">Coupon code</label>
            <input
              id="ss-coupon-code"
              className="ss-input"
              type="text"
              placeholder="Enter coupon code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="ss-btn ss-btn-primary" disabled={isLoading || !code.trim()}>
            {isLoading && <span className="ss-spinner" />}
            Apply
          </button>
        </form>
      </div>
    </ShadowHost>
  )
}
