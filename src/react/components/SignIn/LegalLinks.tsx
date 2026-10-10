import { Anchor, Text } from '@mantine/core';
import type { ReactNode } from 'react';

import { useT } from '../../context';

// One sentence — "By continuing, you agree to the Terms of Service and Privacy Policy." — not a row of joined links
export function LegalLinks({ privacyUrl, termsUrl }: { privacyUrl?: string; termsUrl?: string }) {
  const t = useT();
  const link = (href: string, label: string) => (
    <Anchor href={href} target="_blank" rel="noopener noreferrer" fz="xs" c="dimmed" td="underline">
      {label}
    </Anchor>
  );
  const terms = termsUrl && link(termsUrl, t('legal.terms'));
  const privacy = privacyUrl && link(privacyUrl, t('legal.privacy'));
  if (!terms && !privacy) return null;

  const links: ReactNode =
    terms && privacy ? (
      <>
        {terms} {t('legal.and')} {privacy}
      </>
    ) : (
      terms || privacy
    );
  const [before, after = ''] = t('legal.sentence').split('{links}');

  return (
    <Text fz="xs" c="dimmed" ta="center">
      {before}
      {links}
      {after}
    </Text>
  );
}
