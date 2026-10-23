import type { ProjectSettings } from '../../../auth/types';
import { channelProblem, needsChannelChoice, onlyChannel } from './otpChannels';
import { deriveSignInSettings } from './signInSettings';

const settings = (overrides: Partial<ProjectSettings>) => overrides as ProjectSettings;

describe('deriveSignInSettings', () => {
  it('reads a server without messenger delivery as "no channel list"', () => {
    expect(deriveSignInSettings(null)).toMatchObject({ phoneOtpChannels: null, phoneOtpLoginEnabled: false });
    expect(deriveSignInSettings(settings({ phoneOtpRequired: true }))).toMatchObject({
      phoneOtpChannels: null,
      phoneOtpLoginEnabled: false,
    });
  });

  it('passes the channels through in the server order', () => {
    const cfg = deriveSignInSettings(settings({ phoneOtpChannels: ['sms', 'whatsapp'] }));
    expect(cfg.phoneOtpChannels).toEqual(['sms', 'whatsapp']);
  });

  it('turns passwordless sign-in on only with a channel to send the code through', () => {
    expect(
      deriveSignInSettings(settings({ phoneOtpLoginEnabled: true, phoneOtpChannels: ['telegram'] }))
        .phoneOtpLoginEnabled,
    ).toBe(true);
    expect(
      deriveSignInSettings(settings({ phoneOtpLoginEnabled: true, phoneOtpChannels: [] })).phoneOtpLoginEnabled,
    ).toBe(false);
    expect(deriveSignInSettings(settings({ phoneOtpLoginEnabled: true })).phoneOtpLoginEnabled).toBe(false);
    expect(
      deriveSignInSettings(settings({ phoneOtpLoginEnabled: false, phoneOtpChannels: ['sms'] })).phoneOtpLoginEnabled,
    ).toBe(false);
  });
});

describe('otp channel helpers', () => {
  it('asks for a channel only when there is more than one', () => {
    expect(needsChannelChoice(null)).toBe(false);
    expect(needsChannelChoice(['sms'])).toBe(false);
    expect(needsChannelChoice(['sms', 'telegram'])).toBe(true);
    expect(onlyChannel(['whatsapp'])).toBe('whatsapp');
    expect(onlyChannel(['sms', 'telegram'])).toBeUndefined();
    expect(onlyChannel(null)).toBeUndefined();
  });

  it('names the problem another channel may fix', () => {
    expect(channelProblem({ status: 'error', reason: 'notReachable' }, 'telegram')).toBe(
      'phoneCode.notReachable.telegram',
    );
    expect(channelProblem({ status: 'error', reason: 'channelUnavailable' }, 'sms')).toBe('phoneCode.unavailable.sms');
    expect(channelProblem({ status: 'error' }, 'telegram')).toBeNull();
    expect(channelProblem({ status: 'error', reason: 'notReachable' })).toBeNull();
  });
});
