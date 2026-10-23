import { Button, Stack } from '@mantine/core';
import { MessageSquare } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import type { PhoneOtpChannel } from '../../../auth/types';
import type { TranslationKey } from '../../../i18n';
import { useT } from '../../context';
import { TelegramIcon, WhatsAppIcon } from '../ui/ProviderIcons';

const ICONS: Record<PhoneOtpChannel, ReactNode> = {
  sms: <MessageSquare size={18} />,
  telegram: <TelegramIcon />,
  whatsapp: <WhatsAppIcon />,
};

const LABELS: Record<PhoneOtpChannel, TranslationKey> = {
  sms: 'phoneCode.via.sms',
  telegram: 'phoneCode.via.telegram',
  whatsapp: 'phoneCode.via.whatsapp',
};

interface ChannelButtonsProps {
  /** In the order the server lists them. */
  channels: PhoneOtpChannel[];
  /** A code is being requested — the picked button spins, the others wait. */
  loading: boolean;
  onSelect: (channel: PhoneOtpChannel) => void;
}

// One button per way the project can deliver a code: "Get code via Telegram", "… via WhatsApp", "… via SMS"
export function ChannelButtons({ channels, loading, onSelect }: ChannelButtonsProps) {
  const t = useT();
  const [picked, setPicked] = useState<PhoneOtpChannel | null>(null);
  return (
    <Stack gap="sm">
      {channels.map((channel) => (
        <Button
          key={channel}
          variant="default"
          fullWidth
          leftSection={ICONS[channel]}
          loading={loading && picked === channel}
          disabled={loading && picked !== channel}
          onClick={() => {
            setPicked(channel);
            onSelect(channel);
          }}
        >
          {t(LABELS[channel])}
        </Button>
      ))}
    </Stack>
  );
}
