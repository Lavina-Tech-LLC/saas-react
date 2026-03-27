export interface Customer {
  id: string
  projectId: string
  email: string
  name?: string
  stripeCustomerId?: string
  balanceCents: number
  metadata?: string
  taxExempt: boolean
  taxId?: string
  createdAt: string
  updatedAt: string
}

export interface Plan {
  id: string
  name: string
  description?: string
  amountCents: number
  interval: 'month' | 'year'
  currency: string
  trialDays: number
  isFree: boolean
  features: string[]
  isActive: boolean
}

export interface Subscription {
  id: string
  customerId: string
  planId: string
  projectId: string
  status: 'trialing' | 'active' | 'past_due' | 'paused' | 'canceled'
  stripeSubscriptionId?: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
  currentPeriodStart: string
  currentPeriodEnd: string
  canceledAt?: string
  createdAt: string
}

export interface Invoice {
  id: string
  projectId: string
  customerId: string
  subscriptionId?: string
  amountCents: number
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  stripeInvoiceId?: string
  pdfUrl?: string
  dueDate?: string
  paidAt?: string
  createdAt: string
}

export interface UsageSummary {
  metric: string
  total: number
}

export interface ApplyCouponResult {
  applied: boolean
  discountType: string
  amount: number
  duration: string
}

export interface PortalTokenResult {
  portalToken: string
  expiresAt: string
}
