import { useCallback } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useSavedQueries, useQuery } from './hooks'
import type { Appearance } from '../../core/types'
import type { SavedQuery, QueryResult } from '../types'

export interface SavedQueryListProps {
  onSelectQuery?: (query: SavedQuery) => void
  onRunQuery?: (result: QueryResult) => void
  appearance?: Appearance
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function SavedQueryList({ onSelectQuery, onRunQuery, appearance: localAppearance }: SavedQueryListProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const { queries, isLoading, error } = useSavedQueries()
  const { execute, isLoading: isRunning } = useQuery()
  const appearance = localAppearance ?? globalAppearance

  const handleRun = useCallback(async (query: SavedQuery) => {
    if (!query.generatedSql) return
    const result = await execute({ sql: query.generatedSql })
    if (result) onRunQuery?.(result)
  }, [execute, onRunQuery])

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-card ss-card-wide">
        <h2 className="ss-title">Saved Queries</h2>

        {isLoading && <div className="ss-loading"><span className="ss-spinner" /> Loading...</div>}
        {error && <div className="ss-global-error">{error}</div>}

        {!isLoading && queries.length === 0 && (
          <p className="ss-empty">No saved queries.</p>
        )}

        {!isLoading && queries.map((q) => (
          <div
            key={q.id}
            className="ss-saved-query-card"
            onClick={() => onSelectQuery?.(q)}
          >
            <div className="ss-saved-query-header">
              <span className="ss-saved-query-name">{q.name}</span>
              {q.chartType && <span className="ss-badge">{q.chartType}</span>}
            </div>
            {q.naturalLanguage && (
              <p className="ss-saved-query-desc">{q.naturalLanguage}</p>
            )}
            <div className="ss-saved-query-footer">
              <span className="ss-saved-query-date">{formatDate(q.createdAt)}</span>
              <button
                type="button"
                className="ss-btn ss-btn-sm ss-btn-primary"
                disabled={isRunning || !q.generatedSql}
                onClick={(e) => { e.stopPropagation(); handleRun(q) }}
              >
                {isRunning ? <span className="ss-spinner" /> : 'Run'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </ShadowHost>
  )
}
