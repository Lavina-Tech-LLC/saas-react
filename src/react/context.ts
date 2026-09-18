import { createContext, useContext } from 'react'
import type { SaaSSupport } from '../core/client'
import type { User, ProjectSettings } from '../auth/types'
import type { Appearance } from '../core/types'
import type { Locale, Translate } from '../i18n'

export interface SaaSContextValue {
  client: SaaSSupport
  user: User | null
  isLoaded: boolean
  appearance?: Appearance
  settings: ProjectSettings | null
  /** Resolved UI language of the embedded components. */
  locale: Locale
  /** Translates a UI string into `locale`. */
  t: Translate
}

export const SaaSContext = createContext<SaaSContextValue | null>(null)

export function useSaaSContext(): SaaSContextValue {
  const ctx = useContext(SaaSContext)
  if (!ctx) {
    throw new Error('useSaaSContext must be used within a <SaaSProvider>')
  }
  return ctx
}

/** Shorthand for the translate function inside a component. */
export function useT(): Translate {
  return useSaaSContext().t
}
