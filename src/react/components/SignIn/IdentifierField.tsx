import { TextInput } from '@mantine/core';

import { looksLikePhone, type IdentifierKind } from '../../../auth/identifier';
import type { TranslationKey } from '../../../i18n';
import { useT } from '../../context';

interface IdentifierFieldProps {
  id: string;
  kind: IdentifierKind;
  value: string;
  onChange: (value: string) => void;
  onKindChange: (kind: IdentifierKind) => void;
  /** The project accepts both: one "Email or phone" field that classifies what is typed. */
  acceptsBoth: boolean;
  dialCode: string;
  error?: string | null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** What is wrong with the identifier, if anything — checked before moving on to the password step. */
export function identifierProblem(value: string, kind: IdentifierKind): TranslationKey | null {
  const trimmed = value.trim();
  if (kind === 'phone') return trimmed.replace(/\D/g, '').length >= 9 ? null : 'identifier.invalidPhone';
  return EMAIL.test(trimmed) ? null : 'identifier.invalidEmail';
}

// Email, phone, or one field for both — the kind follows what the user types, so there is no Email / Phone switch
export function IdentifierField({
  id,
  kind,
  value,
  onChange,
  onKindChange,
  acceptsBoth,
  dialCode,
  error,
}: IdentifierFieldProps) {
  const t = useT();
  const isPhone = kind === 'phone';

  const change = (next: string) => {
    onChange(next);
    if (!acceptsBoth) return;
    const detected: IdentifierKind = looksLikePhone(next) ? 'phone' : 'email';
    if (detected !== kind) onKindChange(detected);
  };

  return (
    <TextInput
      id={id}
      label={acceptsBoth ? t('identifier.emailOrPhone') : isPhone ? t('identifier.phone') : t('identifier.email')}
      type={acceptsBoth ? 'text' : isPhone ? 'tel' : 'email'}
      inputMode={isPhone && !acceptsBoth ? 'tel' : 'email'}
      autoComplete="username"
      placeholder={
        acceptsBoth
          ? t('identifier.bothPlaceholder', { dial: dialCode })
          : isPhone
            ? `${dialCode} 90 111 22 33`
            : t('identifier.emailPlaceholder')
      }
      value={value}
      onChange={(e) => change(e.currentTarget.value)}
      error={error}
      required
      autoFocus
    />
  );
}
