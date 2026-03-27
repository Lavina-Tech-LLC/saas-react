import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSaaSContext } from '../../react/context'
import { Transport } from '../../core/transport'
import { ReportClient } from '../client'
import type { QueryParams, QueryResult, SavedQuery, Dashboard, ListParams, OffsetPage } from '../types'

export function useReport() {
  const { client } = useSaaSContext()
  return { report: client.report }
}

export function useQuery() {
  const { client } = useSaaSContext()
  const [result, setResult] = useState<QueryResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (params: QueryParams) => {
    setIsLoading(true)
    setError(null)
    try {
      const r = await client.report.executeQuery(params)
      setResult(r)
      return r
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query failed')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [client])

  return { result, execute, isLoading, error }
}

export function useSavedQueries(params?: ListParams) {
  const { client } = useSaaSContext()
  const [page, setPage] = useState<OffsetPage<SavedQuery> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const p = await client.report.listQueries(params)
      setPage(p)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queries')
    } finally {
      setIsLoading(false)
    }
  }, [client, params])

  useEffect(() => { refresh() }, [refresh])

  return { queries: page?.data ?? [], meta: page?.meta, isLoading, error, refresh }
}

export function useDashboard(dashboardId: string) {
  const { client } = useSaaSContext()
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const d = await client.report.getDashboard(dashboardId)
      setDashboard(d)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [client, dashboardId])

  useEffect(() => { refresh() }, [refresh])

  return { dashboard, isLoading, error, refresh }
}

export function useEmbedDashboard(embedToken: string, dashboardId: string, baseUrl = 'https://api.saas-support.com/v1') {
  const reportClient = useMemo(() => {
    const transport = new Transport(baseUrl, { type: 'embedToken', token: embedToken })
    return new ReportClient(transport)
  }, [embedToken, baseUrl])

  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const d = await reportClient.getDashboard(dashboardId)
      setDashboard(d)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [reportClient, dashboardId])

  useEffect(() => { refresh() }, [refresh])

  return { dashboard, reportClient, isLoading, error, refresh }
}
