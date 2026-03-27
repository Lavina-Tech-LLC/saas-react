import { useState, useCallback, type FormEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useQuery } from './hooks'
import type { Appearance } from '../../core/types'
import type { QueryResult } from '../types'

export interface QueryInputProps {
  onResult?: (result: QueryResult) => void
  mode?: 'nl' | 'sql' | 'both'
  placeholder?: string
  appearance?: Appearance
}

export function QueryInput({ onResult, mode = 'both', placeholder, appearance: localAppearance }: QueryInputProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const { execute, isLoading, error } = useQuery()
  const appearance = localAppearance ?? globalAppearance

  const [input, setInput] = useState('')
  const [inputMode, setInputMode] = useState<'nl' | 'sql'>(mode === 'sql' ? 'sql' : 'nl')

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const params = inputMode === 'sql'
      ? { sql: input }
      : { naturalLanguage: input }

    const result = await execute(params)
    if (result) onResult?.(result)
  }, [input, inputMode, execute, onResult])

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-card ss-card-wide">
        {mode === 'both' && (
          <div className="ss-tab-group ss-tab-group-sm">
            <button
              type="button"
              className={`ss-tab ${inputMode === 'nl' ? 'ss-tab-active' : ''}`}
              onClick={() => setInputMode('nl')}
            >
              Natural Language
            </button>
            <button
              type="button"
              className={`ss-tab ${inputMode === 'sql' ? 'ss-tab-active' : ''}`}
              onClick={() => setInputMode('sql')}
            >
              SQL
            </button>
          </div>
        )}

        {error && <div className="ss-global-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="ss-field">
            <textarea
              className="ss-input ss-query-textarea"
              placeholder={placeholder ?? (inputMode === 'sql' ? 'SELECT ...' : 'Ask a question about your data...')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
            />
          </div>

          <button type="submit" className="ss-btn ss-btn-primary" disabled={isLoading || !input.trim()}>
            {isLoading && <span className="ss-spinner" />}
            Run query
          </button>
        </form>
      </div>
    </ShadowHost>
  )
}
