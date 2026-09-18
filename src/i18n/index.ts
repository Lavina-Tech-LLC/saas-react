import { dictionaries, en, type Dictionary, type TranslationKey } from './locales'

export type { Dictionary, TranslationKey }
// `en` is not re-exported under that name: it is far too generic for a package
// top level, and `dictionaries.en` reaches the same object.
export { dictionaries }

/** Languages the embedded components ship with. */
export const SUPPORTED_LOCALES = ['en', 'ru', 'uz'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

/** Translates a key, substituting `{name}` placeholders. */
export type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

/**
 * Maps anything a host or a browser might report onto a supported locale:
 * "ru-RU" and "RU" both become "ru". Returns null when nothing matches, so the
 * caller can fall through to the next source.
 */
export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null
  const base = value.toLowerCase().split(/[-_]/)[0]
  return isLocale(base) ? base : null
}

/**
 * Picks the UI language, most explicit source first:
 *
 *   1. the `locale` prop on <SaaSProvider> — the host app's own language;
 *   2. the project's default, configured in the dashboard;
 *   3. the browser;
 *   4. English.
 */
export function resolveLocale(
  explicit?: string | null,
  projectDefault?: string | null,
): Locale {
  const browser =
    typeof navigator !== 'undefined'
      ? navigator.language ?? (navigator.languages && navigator.languages[0])
      : null

  return (
    normalizeLocale(explicit) ??
    normalizeLocale(projectDefault) ??
    normalizeLocale(browser) ??
    'en'
  )
}

/**
 * Builds the translate function for a locale. A key missing from a translation
 * falls back to English rather than rendering the raw key.
 */
export function createTranslate(locale: Locale): Translate {
  const dictionary: Dictionary = dictionaries[locale] ?? en

  return (key, vars) => {
    const template = dictionary[key] ?? en[key] ?? key
    if (!vars) return template
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in vars ? String(vars[name]) : match,
    )
  }
}
