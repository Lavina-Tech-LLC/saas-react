import { useEffect, useMemo, useState, type ReactNode } from 'react';

import type { ProjectSettings, User } from '../auth/types';
import { SaaSSupport } from '../core/client';
import { createTranslate, resolveLocale, type Locale } from '../i18n';
import { SaaSContext } from './context';
import { useMyInvitesState } from './hooks/useMyInvitesState';
import { useOrgState } from './hooks/useOrgState';
import { InvitesContext, OrgContext } from './sharedState';

export interface SaaSProviderProps {
  publishableKey?: string;
  apiKey?: string;
  baseUrl?: string;
  /**
   * UI language of the embedded components: "en", "ru" or "uz". Regional tags like "ru-RU" are accepted.
   * Pass your app's current language to keep the sign-in screen in step with the rest of your interface.
   * When omitted: the project's default language from the dashboard, then the browser's, then English.
   */
  locale?: string;
  /**
   * Adds a Language picker to UserButton's menu. Change your app's language here — the SDK follows through `locale`,
   * so the whole interface switches together.
   */
  onLocaleChange?: (locale: Locale) => void;
  children: ReactNode;
}

/**
 * Initializes the SDK. Must be rendered inside the host app's <MantineProvider> —
 * every component is built from Mantine and takes its look from the host theme.
 */
export function SaaSProvider({ publishableKey, apiKey, baseUrl, locale, onLocaleChange, children }: SaaSProviderProps) {
  const [client] = useState(() => new SaaSSupport({ publishableKey, apiKey, baseUrl }));
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState<ProjectSettings | null>(null);

  useEffect(() => {
    let cancelled = false;

    client.load().then(async () => {
      if (cancelled) return;
      const [u, s] = await Promise.all([client.auth.getUser(), client.auth.getSettings()]);
      setUser(u);
      setSettings(s);
      setIsLoaded(true);
    });

    const unsubscribe = client.auth.onAuthStateChange((newUser) => {
      if (!cancelled) setUser(newUser);
    });

    return () => {
      cancelled = true;
      unsubscribe();
      client.destroy();
    };
  }, [client]);

  // Settings arrive asynchronously, so the language can shift from the browser default to the project's
  const resolvedLocale = resolveLocale(locale, settings?.defaultLocale);
  const t = useMemo(() => createTranslate(resolvedLocale), [resolvedLocale]);
  const value = useMemo(
    () => ({ client, user, isLoaded, settings, locale: resolvedLocale, t, onLocaleChange }),
    [client, user, isLoaded, settings, resolvedLocale, t, onLocaleChange],
  );

  return (
    <SaaSContext.Provider value={value}>
      <SharedState>{children}</SharedState>
    </SaaSContext.Provider>
  );
}

function SharedState({ children }: { children: ReactNode }) {
  const org = useOrgState();
  const invites = useMyInvitesState();
  return (
    <OrgContext.Provider value={org}>
      <InvitesContext.Provider value={invites}>{children}</InvitesContext.Provider>
    </OrgContext.Provider>
  );
}
