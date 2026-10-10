import { Menu, Text, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { Check, Languages, Moon, Sun } from 'lucide-react';

import { SUPPORTED_LOCALES, type Locale } from '../../../i18n';
import { useSaaSContext } from '../../context';

// Each language is named in itself, so people find theirs whatever the current language is
const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', ru: 'Русский', uz: 'O‘zbekcha' };

// Theme and language for the whole app: the theme through the host's Mantine color scheme,
// the language through the host's onLocaleChange (shown only when the host provides it)
export function PreferencesMenuSection() {
  const { t, locale, onLocaleChange } = useSaaSContext();
  const { setColorScheme } = useMantineColorScheme();
  const isDark = useComputedColorScheme('dark') === 'dark';

  return (
    <>
      <Menu.Label>{t('user.preferences')}</Menu.Label>
      <Menu.Item
        leftSection={isDark ? <Sun size={14} /> : <Moon size={14} />}
        closeMenuOnClick={false}
        onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
      >
        {isDark ? t('user.lightTheme') : t('user.darkTheme')}
      </Menu.Item>
      {onLocaleChange && (
        <Menu.Sub>
          <Menu.Sub.Target>
            <Menu.Sub.Item leftSection={<Languages size={14} />}>
              {t('user.language')}
              <Text span fz="xs" c="dimmed" ml="xs">
                {LANGUAGE_NAMES[locale]}
              </Text>
            </Menu.Sub.Item>
          </Menu.Sub.Target>
          <Menu.Sub.Dropdown>
            {SUPPORTED_LOCALES.map((code) => (
              <Menu.Item
                key={code}
                lang={code}
                onClick={() => onLocaleChange(code)}
                rightSection={code === locale ? <Check size={14} /> : null}
              >
                {LANGUAGE_NAMES[code]}
              </Menu.Item>
            ))}
          </Menu.Sub.Dropdown>
        </Menu.Sub>
      )}
    </>
  );
}
