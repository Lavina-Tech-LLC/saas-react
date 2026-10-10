import { createTranslate } from '../../../i18n';
import { clearInviteFromUrl, formatInviterName, resolveInitialInviteCode } from './inviteUrl';

const t = createTranslate('en');
const invite = { type: 'link', orgId: 'o', orgName: 'Acme', role: 'member', expiresAt: '' } as const;

describe('invite URL helpers', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('reads the code from the prop, else from ?invite_code=', () => {
    window.history.replaceState(null, '', '/login?invite_code=abc&x=1');
    expect(resolveInitialInviteCode('explicit')).toBe('explicit');
    expect(resolveInitialInviteCode()).toBe('abc');
  });

  it('removes only invite_code from the URL', () => {
    window.history.replaceState(null, '', '/login?invite_code=abc&x=1#top');
    clearInviteFromUrl();
    expect(window.location.pathname + window.location.search + window.location.hash).toBe('/login?x=1#top');
  });

  it('names the inviter by name, then email, then "Someone"', () => {
    expect(formatInviterName({ ...invite, inviterName: ' Dilnoza ' }, t)).toBe('Dilnoza');
    expect(formatInviterName({ ...invite, inviterEmail: 'jasur@acme.uz' }, t)).toBe('jasur');
    expect(formatInviterName(invite, t)).toBe('Someone');
  });
});
