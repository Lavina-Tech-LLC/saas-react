import type { Translate } from '.';
import { en, type Dictionary } from './locales/en';

/** The translate function over one dictionary; a key it lacks falls back to English rather than the raw key. */
export function translateWith(dictionary: Dictionary): Translate {
  return (key, vars) => {
    const template = dictionary[key] ?? en[key] ?? key;
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
  };
}
