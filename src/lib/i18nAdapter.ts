import { useContext } from 'react';

import { createTranslate, type TranslationKey } from '../i18n';
import { SaaSContext } from '../react/context';

const english = createTranslate('en');

/**
 * The kit's `react-i18next` (the build and the tests alias the package to this file): the kit's components, copied
 * unchanged from the boilerplate, read the SDK's own dictionaries and language. Outside a SaaSProvider (the kit's
 * own tests) they speak English.
 */
export function useTranslation() {
  const context = useContext(SaaSContext);
  const translate = context?.t ?? english;
  const language = context?.locale ?? 'en';
  const t = (key: string, vars?: Record<string, string | number>) => translate(key as TranslationKey, vars);
  return { t, i18n: { language, resolvedLanguage: language } };
}
