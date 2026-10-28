// LM3 §7 — the page's spacing tokens: the page frame, sections, cards and headings use them alike

/** Side padding of the header, the footer and the content — M3's margins: 16px on phones, 24px from xs (600). */
export const PAGE_PADDING_X = { base: 'md', xs: 'lg' };

/** Space between a page's sections (and between form sections): 24px. Space alone separates them — no lines. */
export const SECTION_GAP = 'lg';

/** Space between sibling cards (a stat-card grid, a column of cards): 12px on phones, 16px from xs (600). */
export const CARD_GAP = { base: 'sm', xs: 'md' };

/** Space from a section heading to its content: 8px. */
export const HEADING_GAP = 'xs';
