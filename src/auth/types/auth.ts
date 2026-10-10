import type { IdentifierKind } from '../identifier';
import type { User } from './user';

export interface SignInResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface SignUpResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  /** The project requires face control and the new user has not scanned yet. */
  faceEnrollmentRequired?: boolean;
}

export interface SignUpOptions {
  /** Join the inviting organization instead of creating a personal one. */
  inviteCode?: string;
  /** Which field the identifier goes into. Inferred from its shape when omitted. */
  kind?: IdentifierKind;
  /** Proof of phone ownership from `verifyPhoneOtp`. */
  otpToken?: string;
  /**
   * Take a face challenge instead of a session when the project requires face
   * control. The account is created either way; the session then comes with
   * the enrollment (`enrollFace` with the challenge's `faceToken`), exactly as
   * on sign-in. Without it, registration returns a session flagged
   * `faceEnrollmentRequired` and the user is signed in before the scan.
   */
  faceChallenge?: boolean;
}

/** What a one-time code is issued for. */
export type PhoneOtpPurpose = 'register' | 'reset';

export interface PhoneOtpSendResult {
  sent: boolean;
  /** Seconds until another code may be requested. */
  resendAfterSeconds: number;
  /** Seconds until the delivered code stops working. */
  expiresInSeconds: number;
}

export interface PhoneOtpVerifyResult {
  verified: boolean;
  /** Pass to `signUp` or `resetPasswordByPhone`. */
  otpToken: string;
  expiresInSeconds: number;
}

export interface MfaRequiredResult {
  mfaRequired: true;
  mfaToken: string;
}

/**
 * Returned instead of a session when the project uses face control. The
 * sign-in is finished by `verifyFace` or, for a user who has not scanned yet,
 * by `enrollFace` with the same token.
 */
export interface FaceRequiredResult {
  faceRequired: true;
  faceToken: string;
  /** False when the user still has to go through the capture wizard. */
  enrolled: boolean;
  /** Capture sequence for a first-time enrollment. */
  poses?: string[];
}

export type AuthResult = SignInResult | MfaRequiredResult | FaceRequiredResult;

export function isMfaRequired(result: AuthResult): result is MfaRequiredResult {
  return 'mfaRequired' in result && result.mfaRequired === true;
}

export function isFaceRequired(result: AuthResult): result is FaceRequiredResult {
  return 'faceRequired' in result && result.faceRequired === true;
}

/** One captured head pose. Only the descriptor leaves the browser. */
export interface FaceSample {
  pose: string;
  descriptor: number[];
  quality: number;
}

export interface FaceStatus {
  mode: 'off' | 'optional' | 'required';
  enrolled: boolean;
  enrolledAt?: string;
  poseCount?: number;
  lastVerifiedAt?: string;
  /** Capture sequence the wizard should walk through. */
  poses: string[];
}

export interface FaceEnrollResult {
  enrolled: boolean;
  poseCount?: number;
  /** Present when the enrollment also completed a sign-in. */
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

export interface MfaSetupResult {
  secret: string;
  uri: string;
}

export interface MfaVerifyResult {
  backupCodes: string[];
}
