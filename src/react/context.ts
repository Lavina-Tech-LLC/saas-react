import { createContext, useContext } from 'react'
import type { SaaSSupport } from '../core/client'
import type { User, ProjectSettings } from '../auth/types'
import type { Appearance } from '../core/types'

export interface SaaSContextValue {
  client: SaaSSupport
  user: User | null
  isLoaded: boolean
  appearance?: Appearance
  settings: ProjectSettings | null
}

export const SaaSContext = createContext<SaaSContextValue | null>(null)

export function useSaaSContext(): SaaSContextValue {
  const ctx = useContext(SaaSContext)
  if (!ctx) {
    throw new Error('useSaaSContext must be used within a <SaaSProvider>')
  }
  return ctx
}
