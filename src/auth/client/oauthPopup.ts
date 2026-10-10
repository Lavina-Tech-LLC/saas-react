import type { AuthResult } from '../types';

const OAUTH_POPUP_WIDTH = 500;
const OAUTH_POPUP_HEIGHT = 600;
const OAUTH_TIMEOUT_MS = 5 * 60 * 1000;

interface OAuthCallbackData {
  code: string;
  state?: string;
}

/**
 * Opens the provider's consent page in a centered popup and resolves with
 * `exchange` once the popup posts its callback. Rejects when the provider
 * reports an error, the user closes the popup, or it times out.
 */
export function openOAuthPopup(
  authUrl: string,
  exchange: (data: OAuthCallbackData) => Promise<AuthResult>,
): Promise<AuthResult> {
  const left = window.screenX + (window.innerWidth - OAUTH_POPUP_WIDTH) / 2;
  const top = window.screenY + (window.innerHeight - OAUTH_POPUP_HEIGHT) / 2;
  const popup = window.open(
    authUrl,
    'saas-support-oauth',
    `width=${OAUTH_POPUP_WIDTH},height=${OAUTH_POPUP_HEIGHT},left=${left},top=${top},toolbar=no,menubar=no`,
  );

  return new Promise<AuthResult>((resolve, reject) => {
    let settled = false;

    const handler = async (event: MessageEvent) => {
      if (event.data?.type !== 'saas-support:oauth-callback') return;
      if (settled) return;
      settled = true;
      window.removeEventListener('message', handler);
      clearTimeout(timeout);
      clearInterval(pollClosed);
      popup?.close();

      if (event.data.error) {
        reject(new Error(`OAuth error: ${event.data.error}`));
        return;
      }

      try {
        resolve(await exchange({ code: event.data.code, state: event.data.state }));
      } catch (err) {
        reject(err);
      }
    };

    window.addEventListener('message', handler);

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      window.removeEventListener('message', handler);
      clearInterval(pollClosed);
      popup?.close();
      reject(new Error('OAuth popup timed out'));
    }, OAUTH_TIMEOUT_MS);

    const pollClosed = setInterval(() => {
      if (popup?.closed && !settled) {
        settled = true;
        clearInterval(pollClosed);
        clearTimeout(timeout);
        window.removeEventListener('message', handler);
        reject(new Error('OAuth popup was closed'));
      }
    }, 500);
  });
}
