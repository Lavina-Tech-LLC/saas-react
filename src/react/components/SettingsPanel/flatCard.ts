import type { PaperProps } from '@mantine/core';

/** A table's card in the settings, flat like the tiles around it (no shadow, no hairline, their 20px ends), so a page
 *  of tiles and tables reads as one surface — as on myaccount.google.com. */
export const FLAT_CARD = {
  shadow: 'none',
  withBorder: false,
  radius: 20,
  style: { overflow: 'hidden' },
} satisfies PaperProps;
