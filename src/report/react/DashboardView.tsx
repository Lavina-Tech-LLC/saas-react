import { useState, useEffect, useCallback, useMemo } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { Transport } from '../../core/transport'
import { ReportClient } from '../client'
import { Chart } from './Chart'
import { DataTable } from './DataTable'
import type { Appearance } from '../../core/types'
import type { QueryResult } from '../types'

export interface DashboardViewProps {
  dashboardId: string
  embedToken?: string
  baseUrl?: string
  refreshInterval?: number
  appearance?: Appearance
}

interface Widget {
  queryId: string
  chartType: string
  title?: string
  w?: number
  h?: number
}

export function DashboardView({ dashboardId, embedToken, baseUrl, refreshInterval, appearance: localAppearance }: DashboardViewProps) {
  const ctx = useSaaSContext()
  const appearance = localAppearance ?? ctx?.appearance

  const reportClient = useMemo(() => {
    if (embedToken) {
      const url = baseUrl ?? 'https://api.saas-support.com/v1'
      const transport = new Transport(url, { type: 'embedToken', token: embedToken })
      return new ReportClient(transport)
    }
    return ctx.client.report
  }, [embedToken, baseUrl, ctx])

  const [layout, setLayout] = useState<Widget[]>([])
  const [results, setResults] = useState<Record<string, QueryResult>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const dashboard = await reportClient.getDashboard(dashboardId)
      const widgets: Widget[] = JSON.parse(dashboard.layoutJson || '[]')
      setLayout(widgets)

      const queryResults: Record<string, QueryResult> = {}
      for (const widget of widgets) {
        try {
          const queries = await reportClient.listQueries({ search: widget.queryId, perPage: 1 })
          if (queries.data.length > 0 && queries.data[0].generatedSql) {
            const result = await reportClient.executeQuery({ sql: queries.data[0].generatedSql })
            queryResults[widget.queryId] = result
          }
        } catch {
          // Skip failed widget queries
        }
      }
      setResults(queryResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [reportClient, dashboardId])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return
    const timer = setInterval(loadDashboard, refreshInterval * 1000)
    return () => clearInterval(timer)
  }, [refreshInterval, loadDashboard])

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-dashboard-grid">
        {isLoading && <div className="ss-loading"><span className="ss-spinner" /> Loading dashboard...</div>}
        {error && <div className="ss-global-error">{error}</div>}

        {!isLoading && layout.map((widget, i) => {
          const result = results[widget.queryId]
          if (!result) return null

          const chartData = result.columns.length >= 2
            ? {
              labels: result.rows.map((r) => String(r[result.columns[0]] ?? '')),
              values: result.rows.map((r) => Number(r[result.columns[1]] ?? 0)),
            }
            : { labels: [], values: [] }

          return (
            <div key={i} className="ss-widget">
              {widget.title && <h4 className="ss-widget-header">{widget.title}</h4>}
              {widget.chartType === 'table' ? (
                <DataTable columns={result.columns} rows={result.rows} maxRows={50} />
              ) : (
                <Chart
                  type={(widget.chartType as 'bar' | 'line' | 'pie') || 'bar'}
                  data={chartData}
                  width={widget.w}
                  height={widget.h}
                />
              )}
            </div>
          )
        })}
      </div>
    </ShadowHost>
  )
}
