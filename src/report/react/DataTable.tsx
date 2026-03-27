import { useState, useMemo } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import type { Appearance } from '../../core/types'

export interface DataTableProps {
  columns: string[]
  rows: Record<string, unknown>[]
  sortable?: boolean
  maxRows?: number
  appearance?: Appearance
}

export function DataTable({ columns, rows, sortable = true, maxRows, appearance: localAppearance }: DataTableProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const appearance = localAppearance ?? globalAppearance

  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sorted = useMemo(() => {
    if (!sortCol) return rows
    return [...rows].sort((a, b) => {
      const va = a[sortCol]
      const vb = b[sortCol]
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va
      }
      const sa = String(va)
      const sb = String(vb)
      return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa)
    })
  }, [rows, sortCol, sortDir])

  const displayed = maxRows ? sorted.slice(0, maxRows) : sorted

  const handleSort = (col: string) => {
    if (!sortable) return
    if (sortCol === col) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  function formatCell(val: unknown): string {
    if (val == null) return ''
    if (typeof val === 'object') return JSON.stringify(val)
    return String(val)
  }

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-table-container">
        <table className="ss-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className={`ss-th ${sortable ? 'ss-th-sortable' : ''} ${sortCol === col ? (sortDir === 'asc' ? 'ss-sorted-asc' : 'ss-sorted-desc') : ''}`}
                  onClick={() => handleSort(col)}
                >
                  {col}
                  {sortCol === col && (
                    <span className="ss-sort-indicator">{sortDir === 'asc' ? ' \u25B2' : ' \u25BC'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((row, i) => (
              <tr key={i} className="ss-tr">
                {columns.map((col) => (
                  <td key={col} className="ss-td">{formatCell(row[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {maxRows && rows.length > maxRows && (
          <div className="ss-table-footer">
            Showing {maxRows} of {rows.length} rows
          </div>
        )}
      </div>
    </ShadowHost>
  )
}
