import { createContext, useContext } from 'react';

import type { ProjectSettings, User } from '../auth/types';
import type { SaaSSupport } from '../core/client';
import type { Locale, Translate } from '../i18n';

export interface SaaSContextValue {
  client: SaaSSupport;
  user: User | null;
  isLoaded: boolean;
  settings: ProjectSettings | null;
  /** Resolved UI language of the embedded components. */
  locale: Locale;
  /** Translates a UI string into `locale`. */
  t: Translate;
  /** Set by the host to offer a language picker (UserButton); the host changes its language and passes it back as `locale`. */
  onLocaleChange?: (locale: Locale) => void;
}

export const SaaSContext = createContext<SaaSContextValue | null>(null);

export function useSaaSContext(): SaaSContextValue {
  const ctx = useContext(SaaSContext);
  if (!ctx) throw new Error('useSaaSContext must be used within a <SaaSProvider>');
  return ctx;
}

/** Shorthand for the translate function inside a component. */
export function useT(): Translate {
  return useSaaSContext().t;
}
