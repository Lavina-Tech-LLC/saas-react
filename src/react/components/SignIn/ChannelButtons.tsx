import { Loader, ThemeIcon, type MantineColor } from '@mantine/core';
import { ChevronRight, MessageSquare } from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';

import { ListItem } from '@/components/uiKit/List';
import { SegmentedList } from '@/components/uiKit/SegmentedList';

import type { PhoneOtpChannel } from '../../../auth/types';
import type { TranslationKey } from '../../../i18n';
import { useT } from '../../context';
import { TelegramIcon, WhatsAppIcon } from '../ui/ProviderIcons';

const ICONS: Record<PhoneOtpChannel, ReactNode> = {
  sms: <MessageSquare size={20} />,
  telegram: <TelegramIcon size={20} />,
  whatsapp: <WhatsAppIcon size={20} />,
};
// The tonal circle behind each mark, by the service's own color family
const COLORS: Record<PhoneOtpChannel, MantineColor> = { sms: 'gray', telegram: 'blue', whatsapp: 'green' };

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

// In the sign-in card the tiles take the step-up tone it sets; on a phone, with no card, the page's card tone
const TILES = { '--segment-bg': 'var(--auth-tile-bg, var(--m3-surface))' } as CSSProperties;

// One row per way the project can deliver a code, as an M3 list: "Get code via Telegram", "… via WhatsApp", "… via SMS"
export function ChannelButtons({ channels, loading, onSelect }: ChannelButtonsProps) {
  const t = useT();
  const [picked, setPicked] = useState<PhoneOtpChannel | null>(null);
  return (
    <SegmentedList style={TILES}>
      {channels.map((channel) => (
        <ListItem
          key={channel}
          leadingType="avatar"
          leading={
            <ThemeIcon variant="light" color={COLORS[channel]} size={40} radius="xl">
              {ICONS[channel]}
            </ThemeIcon>
          }
          headline={t(LABELS[channel])}
          trailing={loading && picked === channel ? <Loader size={20} /> : <ChevronRight size={20} />}
          disabled={loading}
          onClick={() => {
            setPicked(channel);
            onSelect(channel);
          }}
        />
      ))}
    </SegmentedList>
  );
}
