import type { MantineSize } from '@mantine/core';

/**
 * LM3 §9 — the icon size for a control of each Mantine size (M3's 18px at sm). Buttons, icon buttons and menu items
 * size their own icons whatever is passed.
 */
export const ICON_SIZE: Record<MantineSize, number> = { xs: 16, sm: 18, md: 20, lg: 22, xl: 24 };

/** An icon set in 12–14px text, such as a table header's sort arrow: it stays at the text's size. */
export const INLINE_ICON_SIZE = 14;
