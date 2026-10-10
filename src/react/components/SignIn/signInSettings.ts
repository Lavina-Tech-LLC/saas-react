import type { ProjectSettings } from '../../../auth/types';

export const DEFAULT_DIAL_CODE = '+998';
export const DEFAULT_FACE_POSES = ['center', 'left', 'right', 'up', 'down'];

/** Project settings that shape the sign-in screen, with their defaults. */
export function deriveSignInSettings(settings: ProjectSettings | null) {
  const emailAuthEnabled = settings?.emailAuthEnabled ?? settings?.emailEnabled ?? true;
  const phoneAuthEnabled = settings?.phoneAuthEnabled ?? false;
  return {
    registrationEnabled: settings?.registrationEnabled ?? true,
    emailAuthEnabled,
    phoneAuthEnabled,
    showIdentifierToggle: emailAuthEnabled && phoneAuthEnabled,
    dialCode: settings?.defaultPhoneCountryCode || DEFAULT_DIAL_CODE,
    googleEnabled: !!settings?.googleEnabled,
    githubEnabled: !!settings?.githubEnabled,
    hasOAuth: !!(settings?.googleEnabled || settings?.githubEnabled),
    phoneOtpRequired: !!settings?.phoneOtpRequired,
    passwordMinLength: settings?.passwordMinLength ?? 8,
    privacyPolicyUrl: settings?.privacyPolicyUrl,
    termsOfServiceUrl: settings?.termsOfServiceUrl,
    faceModelUrl: settings?.faceModelUrl,
  };
}

export type SignInSettings = ReturnType<typeof deriveSignInSettings>;
