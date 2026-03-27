import { useState, useEffect, useCallback, useMemo } from 'react'
import { Transport } from '../../core/transport'
import { ReportClient } from '../client'
import { resolveTheme, generateCSS } from '../../styles/theme'
import type { Appearance } from '../../core/types'
import type { QueryResult } from '../types'

export interface ReportEmbedProps {
  embedToken: string
  dashboardId: string
  baseUrl?: string
  refreshInterval?: number
  appearance?: Appearance
}

interface Widget {
  queryId: string
  chartType: string
  title?: string
}

/**
 * Standalone embeddable dashboard viewer.
 * Does NOT require SaaSProvider — creates its own transport with embedToken.
 */
export function ReportEmbed({ embedToken, dashboardId, baseUrl = 'https://api.saas-support.com/v1', refreshInterval, appearance }: ReportEmbedProps) {
  const reportClient = useMemo(() => {
    const transport = new Transport(baseUrl, { type: 'embedToken', token: embedToken })
    return new ReportClient(transport)
  }, [embedToken, baseUrl])

  const [widgets, setWidgets] = useState<(Widget & { result?: QueryResult })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const theme = useMemo(() => resolveTheme(appearance), [appearance])
  const css = useMemo(() => generateCSS(theme), [theme])

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const dashboard = await reportClient.getDashboard(dashboardId)
      const layout: Widget[] = JSON.parse(dashboard.layoutJson || '[]')
      const loaded = await Promise.all(
        layout.map(async (w) => {
          try {
            const queries = await reportClient.listQueries({ search: w.queryId, perPage: 1 })
            if (queries.data.length > 0 && queries.data[0].generatedSql) {
              const result = await reportClient.executeQuery({ sql: queries.data[0].generatedSql })
              return { ...w, result }
            }
          } catch { /* skip */ }
          return w
        }),
      )
      setWidgets(loaded)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [reportClient, dashboardId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return
    const timer = setInterval(load, refreshInterval * 1000)
    return () => clearInterval(timer)
  }, [refreshInterval, load])

  return (
    <div
      ref={(el) => {
        if (!el || el.shadowRoot) return
        const shadow = el.attachShadow({ mode: 'open' })
        const style = document.createElement('style')
        style.textContent = css
        shadow.appendChild(style)
        const container = document.createElement('div')
        shadow.appendChild(container)
      }}
      style={{ display: 'contents' }}
    >
      <div className="ss-dashboard-grid">
        {isLoading && <div className="ss-loading">Loading dashboard...</div>}
        {error && <div className="ss-global-error">{error}</div>}

        {!isLoading && widgets.map((widget, i) => {
          if (!widget.result) return null
          const { columns, rows } = widget.result

          return (
            <div key={i} className="ss-widget">
              {widget.title && <h4 className="ss-widget-header">{widget.title}</h4>}
              <table className="ss-table">
                <thead>
                  <tr>{columns.map((c) => <th key={c} className="ss-th">{c}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.slice(0, 50).map((row, ri) => (
                    <tr key={ri} className="ss-tr">
                      {columns.map((c) => <td key={c} className="ss-td">{String(row[c] ?? '')}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </div>
  )
}
