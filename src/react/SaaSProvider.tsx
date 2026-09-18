import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { SaaSSupport } from '../core/client'
import type { User } from '../auth/types'
import type { ProjectSettings } from '../auth/types'
import type { Appearance } from '../core/types'
import { createTranslate, resolveLocale } from '../i18n'
import { SaaSContext } from './context'

export interface SaaSProviderProps {
  publishableKey?: string
  apiKey?: string
  baseUrl?: string
  appearance?: Appearance
  /**
   * UI language of the embedded components: "en", "ru" or "uz". Regional tags
   * like "ru-RU" are accepted. Pass your app's current language here to keep
   * the sign-in screen in step with the rest of your interface.
   *
   * When omitted, the project's default language from the dashboard is used,
   * then the browser's, then English.
   */
  locale?: string
  children: ReactNode
}

export function SaaSProvider({ publishableKey, apiKey, baseUrl, appearance, locale, children }: SaaSProviderProps) {
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

  // Settings arrive asynchronously, so the language can shift from the browser
  // default to the project's once they land.
  const resolvedLocale = resolveLocale(locale, settings?.defaultLocale)
  const t = useMemo(() => createTranslate(resolvedLocale), [resolvedLocale])

  return (
    <SaaSContext.Provider
      value={{ client, user, isLoaded, appearance, settings, locale: resolvedLocale, t }}
    >
      {children}
    </SaaSContext.Provider>
  )
}
