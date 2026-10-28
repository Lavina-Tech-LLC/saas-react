import { Menu, Text, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { Check, Languages, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';

import { SUPPORTED_LOCALES, type Locale } from '../../../i18n';
import { useSaaSContext } from '../../context';

// Each language named in itself, so people find theirs whatever the current language is
const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', ru: 'Русский', uz: 'O‘zbekcha' };
// M3 marks the chosen option with a check, not a radio dot
const CHECK = <Check size={18} />;

/** A row that opens its choices to the side: the icon, the setting's name and its current value, dimmed. */
function ChoiceRow({
  icon,
  label,
  value,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <Menu.Sub>
      <Menu.Sub.Target>
        <Menu.Sub.Item leftSection={icon}>
          {label}
          <Text span fz="sm" c="dimmed" ml="xs">
            {value}
          </Text>
        </Menu.Sub.Item>
      </Menu.Sub.Target>
      <Menu.Sub.Dropdown>{children}</Menu.Sub.Dropdown>
    </Menu.Sub>
  );
}

// LM3 §21 — theme and language for the whole app, each a row that opens its one-of choices: the theme through the
// host's Mantine color scheme, the language through the host's onLocaleChange (only when the host provides it)
export function PreferencesMenuSection() {
  const { t, locale, onLocaleChange } = useSaaSContext();
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme('dark');
  const themes = { light: t('user.light'), dark: t('user.dark') };

  return (
    <>
      <Menu.Label>{t('user.preferences')}</Menu.Label>
      <ChoiceRow
        icon={scheme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        label={t('user.theme')}
        value={themes[scheme]}
      >
        <Menu.RadioGroup value={scheme} onChange={(value) => setColorScheme(value as 'light' | 'dark')}>
          <Menu.RadioItem value="light" checkIcon={CHECK}>
            {themes.light}
          </Menu.RadioItem>
          <Menu.RadioItem value="dark" checkIcon={CHECK}>
            {themes.dark}
          </Menu.RadioItem>
        </Menu.RadioGroup>
      </ChoiceRow>
      {onLocaleChange && (
        <ChoiceRow icon={<Languages size={20} />} label={t('user.language')} value={LANGUAGE_NAMES[locale]}>
          <Menu.RadioGroup value={locale} onChange={(value) => onLocaleChange(value as Locale)}>
            {SUPPORTED_LOCALES.map((code) => (
              <Menu.RadioItem key={code} value={code} lang={code} checkIcon={CHECK}>
                {LANGUAGE_NAMES[code]}
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        </ChoiceRow>
      )}
    </>
  );
}
