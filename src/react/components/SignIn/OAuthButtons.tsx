import { Button, SimpleGrid } from '@mantine/core';

import type { OAuthProvider } from '../../../auth/types';
import { GitHubIcon, GoogleIcon } from '../ui/ProviderIcons';

// Brand names are not translated
const LABELS: Record<OAuthProvider, string> = { google: 'Google', github: 'GitHub' };

interface OAuthButtonsProps {
  google: boolean;
  github: boolean;
  loading: boolean;
  onSelect: (provider: OAuthProvider) => void;
}

export function OAuthButtons({ google, github, loading, onSelect }: OAuthButtonsProps) {
  const providers = [google && 'google', github && 'github'].filter(Boolean) as OAuthProvider[];
  return (
    <SimpleGrid cols={providers.length > 1 ? 2 : 1} spacing="sm">
      {providers.map((provider) => (
        <Button
          key={provider}
          variant="default"
          leftSection={provider === 'google' ? <GoogleIcon /> : <GitHubIcon />}
          disabled={loading}
          onClick={() => onSelect(provider)}
        >
          {LABELS[provider]}
        </Button>
      ))}
    </SimpleGrid>
  );
}
