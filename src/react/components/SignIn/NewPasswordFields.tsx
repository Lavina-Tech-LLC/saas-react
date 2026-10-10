import { PasswordInput } from '@mantine/core';

import type { Translate } from '../../../i18n';
import { useT } from '../../context';

interface NewPasswordFieldsProps {
  password: string;
  confirm: string;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
}

export function NewPasswordFields({ password, confirm, onPasswordChange, onConfirmChange }: NewPasswordFieldsProps) {
  const t = useT();
  return (
    <>
      <PasswordInput
        label={t('settings.newPassword')}
        autoComplete="new-password"
        value={password}
        onChange={(e) => onPasswordChange(e.currentTarget.value)}
        required
      />
      <PasswordInput
        label={t('settings.confirmNewPassword')}
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => onConfirmChange(e.currentTarget.value)}
        required
      />
    </>
  );
}

/** The same checks as sign-up: matching and long enough. Returns the error key, if any. */
export function checkNewPassword(password: string, confirm: string, minLength: number, t: Translate) {
  if (password !== confirm) return t('error.passwordMismatch');
  if (password.length < minLength) return t('error.passwordTooShort', { min: minLength });
  return null;
}
