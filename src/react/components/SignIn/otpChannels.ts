import type { PhoneOtpChannel } from '../../../auth/types';
import type { TranslationKey } from '../../../i18n';
import type { PhoneOtpSendOutcome } from '../../hooks/usePhoneOtp';

type RetryReason = NonNullable<Extract<PhoneOtpSendOutcome, { status: 'error' }>['reason']>;

const PROBLEMS: Record<RetryReason, Record<PhoneOtpChannel, TranslationKey>> = {
  notReachable: {
    sms: 'phoneCode.notReachable.sms',
    telegram: 'phoneCode.notReachable.telegram',
    whatsapp: 'phoneCode.notReachable.whatsapp',
  },
  channelUnavailable: {
    sms: 'phoneCode.unavailable.sms',
    telegram: 'phoneCode.unavailable.telegram',
    whatsapp: 'phoneCode.unavailable.whatsapp',
  },
};

/** The user picks the channel only when the project has more than one. */
export const needsChannelChoice = (channels: PhoneOtpChannel[] | null): boolean => !!channels && channels.length > 1;

/** The channel to send through without asking: the only one, else none and the server picks. */
export const onlyChannel = (channels: PhoneOtpChannel[] | null): PhoneOtpChannel | undefined =>
  channels?.length === 1 ? channels[0] : undefined;

/** "Not on Telegram" / "Telegram is down" — for a failed send that another channel may fix. */
export function channelProblem(outcome: PhoneOtpSendOutcome, channel?: PhoneOtpChannel): TranslationKey | null {
  if (outcome.status !== 'error' || !outcome.reason || !channel) return null;
  return PROBLEMS[outcome.reason][channel];
}

/** The same message for "this channel cannot send right now", whatever the server answered. */
export const channelUnavailableKey = (channel: PhoneOtpChannel): TranslationKey => PROBLEMS.channelUnavailable[channel];
