import type { Transport } from '../core/transport'
import type {
  Customer, Subscription, Invoice, UsageSummary,
  ApplyCouponResult, PortalTokenResult,
} from './types'

export class BillingClient {
  private transport: Transport

  constructor(transport: Transport) {
    this.transport = transport
  }

  // --- Customer ---

  async createCustomer(params: { email: string; name?: string; metadata?: string }): Promise<Customer> {
    return this.transport.post<Customer>('/billing/customers', params)
  }

  async getCustomer(customerId: string): Promise<Customer> {
    return this.transport.get<Customer>(`/billing/customers/${customerId}`)
  }

  async updateCustomer(customerId: string, params: { email?: string; name?: string; metadata?: string }): Promise<Customer> {
    return this.transport.patch<Customer>(`/billing/customers/${customerId}`, params)
  }

  // --- Subscription ---

  async subscribe(customerId: string, planId: string): Promise<Subscription> {
    return this.transport.post<Subscription>(`/billing/customers/${customerId}/subscribe`, { planId })
  }

  async changePlan(customerId: string, planId: string): Promise<Subscription> {
    return this.transport.patch<Subscription>(`/billing/customers/${customerId}/subscription`, { planId })
  }

  async cancelSubscription(customerId: string): Promise<{ canceledAtPeriodEnd: boolean }> {
    return this.transport.del(`/billing/customers/${customerId}/subscription`)
  }

  // --- Invoices ---

  async getInvoices(customerId: string): Promise<Invoice[]> {
    return this.transport.get<Invoice[]>(`/billing/customers/${customerId}/invoices`)
  }

  // --- Usage ---

  async ingestUsageEvent(params: {
    customerId: string
    metric: string
    quantity: number
    timestamp?: string
    idempotencyKey?: string
  }): Promise<{ id: string; ingested: boolean }> {
    return this.transport.post('/billing/events', params)
  }

  async getCurrentUsage(customerId: string): Promise<UsageSummary[]> {
    return this.transport.get<UsageSummary[]>(`/billing/customers/${customerId}/usage`)
  }

  // --- Portal ---

  async createPortalToken(customerId: string, expiresIn?: number): Promise<PortalTokenResult> {
    return this.transport.post<PortalTokenResult>('/billing/portal-tokens', { customerId, expiresIn })
  }

  // --- Coupon ---

  async applyCoupon(customerId: string, code: string): Promise<ApplyCouponResult> {
    return this.transport.post<ApplyCouponResult>(`/billing/customers/${customerId}/coupon`, { code })
  }
}
