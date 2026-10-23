import type { PhoneOtpChannel } from './auth';

export interface User {
  id: string;
  /** Empty for accounts registered with a phone number only. */
  email: string;
  /** E.164 phone number. Empty for accounts registered with an e-mail only. */
  phone?: string;
  provider: string;
  emailVerified: boolean;
  phoneVerified?: boolean;
  source?: 'self' | 'invite';
  metadata: Record<string, unknown>;
  mfaEnabled?: boolean;
  name?: string;
  avatarUrl?: string;
}

export interface ProjectSettings {
  googleEnabled: boolean;
  githubEnabled: boolean;
  /** @deprecated Legacy name of `emailAuthEnabled`. */
  emailEnabled: boolean;
  /** Whether the project accepts an e-mail address as the login identifier. */
  emailAuthEnabled: boolean;
  /** Whether the project accepts a phone number as the login identifier. */
  phoneAuthEnabled: boolean;
  /** Dial code ("+992") used for numbers typed without one. */
  defaultPhoneCountryCode?: string;
  /**
   * Whether a phone sign-up must carry a verified code. Already resolved
   * against the project's delivery channels — a project that asks for
   * verification without a working channel reports `false` here.
   */
  phoneOtpRequired: boolean;
  /**
   * Channels a one-time code can be sent through right now, in the order to
   * offer them. May be empty; missing from servers without messenger delivery.
   */
  phoneOtpChannels?: PhoneOtpChannel[];
  /**
   * Whether a phone number and a code alone sign a user in — creating the
   * account when registration is open. Missing from older servers.
   */
  phoneOtpLoginEnabled?: boolean;
  /**
   * Face control: "off", "optional" (users opt in, then it is enforced for
   * them) or "required" (everyone enrolls and verifies).
   */
  faceVerificationMode: 'off' | 'optional' | 'required';
  /** Overrides where the SDK downloads the face model weights from. */
  faceModelUrl?: string;
  /**
   * Default UI language of the embedded components for this project
   * ("en" | "ru" | "uz"). A `locale` prop on `<SaaSProvider>` overrides it.
   */
  defaultLocale?: string;
  mfaEnforced: boolean;
  passwordMinLength: number;
  emailVerification: boolean;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  orgCreationPolicy: 'anyone' | 'self_registered_only';
  inviteLinkBaseUrl?: string;
  /**
   * Whether self-service sign-up is open. When false the sign-up form is
   * hidden, but registration through an invite code still works.
   */
  registrationEnabled: boolean;
  /** Whether a personal organization is created for a new self-registered user. */
  createOrgOnRegistration: boolean;
}

export type AuthStateCallback = (user: User | null) => void;
export type OAuthProvider = 'google' | 'github';
