import type { ProjectSettings } from '../../../auth/types';

export const DEFAULT_DIAL_CODE = '+998';
export const DEFAULT_FACE_POSES = ['center', 'left', 'right', 'up', 'down'];

/** Project settings that shape the sign-in screen, with their defaults. */
export function deriveSignInSettings(settings: ProjectSettings | null) {
  const emailAuthEnabled = settings?.emailAuthEnabled ?? settings?.emailEnabled ?? true;
  const phoneAuthEnabled = settings?.phoneAuthEnabled ?? false;
  // null: a server from before messenger delivery — it picks the channel itself, so none is ever sent to it
  const phoneOtpChannels = settings?.phoneOtpChannels ?? null;
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
    phoneOtpChannels,
    /** Sign-in with a phone number and a code alone, no password. */
    phoneOtpLoginEnabled: !!settings?.phoneOtpLoginEnabled && (phoneOtpChannels?.length ?? 0) > 0,
    passwordMinLength: settings?.passwordMinLength ?? 8,
    privacyPolicyUrl: settings?.privacyPolicyUrl,
    termsOfServiceUrl: settings?.termsOfServiceUrl,
    faceModelUrl: settings?.faceModelUrl,
  };
}

export type SignInSettings = ReturnType<typeof deriveSignInSettings>;
