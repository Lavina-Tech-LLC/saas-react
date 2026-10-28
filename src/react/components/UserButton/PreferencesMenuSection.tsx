import { Menu, Text, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { Languages } from 'lucide-react';

import { SUPPORTED_LOCALES, type Locale } from '../../../i18n';
import { useSaaSContext } from '../../context';

// Each language named in itself, so people find theirs whatever the current language is
const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', ru: 'Русский', uz: 'O‘zbekcha' };

// LM3 §21 — theme and language for the whole app, as one-of choices: the theme through the host's Mantine color
// scheme, the language through the host's onLocaleChange (only when the host provides it)
export function PreferencesMenuSection() {
  const { t, locale, onLocaleChange } = useSaaSContext();
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme('dark');

  return (
    <>
      <Menu.Label>{t('user.preferences')}</Menu.Label>
      <Menu.RadioGroup value={scheme} onChange={(value) => setColorScheme(value as 'light' | 'dark')}>
        <Menu.RadioItem value="light">{t('user.lightTheme')}</Menu.RadioItem>
        <Menu.RadioItem value="dark">{t('user.darkTheme')}</Menu.RadioItem>
      </Menu.RadioGroup>
      {onLocaleChange && (
        <Menu.Sub>
          <Menu.Sub.Target>
            <Menu.Sub.Item leftSection={<Languages size={20} />}>
              {t('user.language')}
              <Text span fz="sm" c="dimmed" ml="xs">
                {LANGUAGE_NAMES[locale]}
              </Text>
            </Menu.Sub.Item>
          </Menu.Sub.Target>
          <Menu.Sub.Dropdown>
            <Menu.RadioGroup value={locale} onChange={(value) => onLocaleChange(value as Locale)}>
              {SUPPORTED_LOCALES.map((code) => (
                <Menu.RadioItem key={code} value={code} lang={code}>
                  {LANGUAGE_NAMES[code]}
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Sub.Dropdown>
        </Menu.Sub>
      )}
    </>
  );
}
