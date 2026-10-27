import { useEffect, useState } from 'react';

import type { Locale } from '../i18n';
import { loadDictionary } from '../i18n/loadDictionary';
import { en, type Dictionary } from '../i18n/locales/en';

interface Loaded {
  locale: Locale;
  words: Dictionary;
}

/**
 * The words for `locale`. `ready` is false until the first dictionary has loaded; while another language loads, the
 * last one stays on screen. A dictionary that fails to load falls back to English, so the app never waits forever.
 */
export function useDictionary(locale: Locale) {
  const [loaded, setLoaded] = useState<Loaded | null>(() => (locale === 'en' ? { locale, words: en } : null));

  useEffect(() => {
    let cancelled = false;
    loadDictionary(locale)
      .catch(() => en)
      .then((words) => {
        if (!cancelled) setLoaded({ locale, words });
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return { words: loaded?.words ?? en, ready: loaded !== null };
}
