import type { Locale } from '.';
import { en, type Dictionary } from './locales/en';

// English is built in (the source and the fallback); Russian and Uzbek load for the language on screen, so an app's
// first download carries one language instead of three
const LOADERS: Record<Exclude<Locale, 'en'>, () => Promise<Dictionary>> = {
  ru: () => import('./locales/ru').then((module) => module.ru),
  uz: () => import('./locales/uz').then((module) => module.uz),
};

export function loadDictionary(locale: Locale): Promise<Dictionary> {
  return locale === 'en' ? Promise.resolve(en) : LOADERS[locale]();
}
