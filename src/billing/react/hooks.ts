import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSaaSContext } from '../../react/context'
import { Transport } from '../../core/transport'
import { BillingClient } from '../client'
import type { Customer, Invoice, UsageSummary } from '../types'

export function useBilling() {
  const { client } = useSaaSContext()
  return { billing: client.billing }
}

export function useBillingClient(portalToken?: string): BillingClient {
  const { client } = useSaaSContext()
  return useMemo(() => {
    if (portalToken) {
      const transport = new Transport('https://api.saas-support.com/v1', { type: 'portalToken', token: portalToken })
      return new BillingClient(transport)
    }
    return client.billing
  }, [client, portalToken])
}

export function useSubscription(customerId: string, portalToken?: string) {
  const billing = useBillingClient(portalToken)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const c = await billing.getCustomer(customerId)
      setCustomer(c)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription')
    } finally {
      setIsLoading(false)
    }
  }, [billing, customerId])

  useEffect(() => { refresh() }, [refresh])

  return { customer, isLoading, error, refresh }
}

export function useInvoices(customerId: string, portalToken?: string) {
  const billing = useBillingClient(portalToken)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await billing.getInvoices(customerId)
      setInvoices(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices')
    } finally {
      setIsLoading(false)
    }
  }, [billing, customerId])

  useEffect(() => { refresh() }, [refresh])

  return { invoices, isLoading, error, refresh }
}

export function useUsage(customerId: string, portalToken?: string) {
  const billing = useBillingClient(portalToken)
  const [usage, setUsage] = useState<UsageSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await billing.getCurrentUsage(customerId)
      setUsage(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage')
    } finally {
      setIsLoading(false)
    }
  }, [billing, customerId])

  useEffect(() => { refresh() }, [refresh])

  return { usage, isLoading, error, refresh }
}
