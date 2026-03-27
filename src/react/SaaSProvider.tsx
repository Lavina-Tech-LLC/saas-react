import { useState, useEffect, type ReactNode } from 'react'
import { SaaSSupport } from '../core/client'
import type { User } from '../auth/types'
import type { ProjectSettings } from '../auth/types'
import type { Appearance } from '../core/types'
import { SaaSContext } from './context'

export interface SaaSProviderProps {
  publishableKey?: string
  apiKey?: string
  baseUrl?: string
  appearance?: Appearance
  children: ReactNode
}

export function SaaSProvider({ publishableKey, apiKey, baseUrl, appearance, children }: SaaSProviderProps) {
  const [client] = useState(() => new SaaSSupport({ publishableKey, apiKey, baseUrl }))
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [settings, setSettings] = useState<ProjectSettings | null>(null)

  useEffect(() => {
    let cancelled = false

    client.load().then(async () => {
      if (cancelled) return
      const u = await client.auth.getUser()
      const s = await client.auth.getSettings()
      setUser(u)
      setSettings(s)
      setIsLoaded(true)
    })

    const unsub = client.auth.onAuthStateChange((newUser) => {
      if (!cancelled) setUser(newUser)
    })

    return () => {
      cancelled = true
      unsub()
      client.destroy()
    }
  }, [client])

  return (
    <SaaSContext.Provider value={{ client, user, isLoaded, appearance, settings }}>
      {children}
    </SaaSContext.Provider>
  )
}
