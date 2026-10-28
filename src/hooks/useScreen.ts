import { em, px, useMantineTheme, type MantineBreakpoint } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

/** Narrower than a theme breakpoint: 0.1px under it, like Mantine's own smaller-than, so no width is both. */
export const belowBreakpoint = (breakpoint: string) => `(max-width: ${em(Number(px(breakpoint)) - 0.1)})`;

/** "Narrower than this theme breakpoint" — e.g. a phone, `useBelow('xs')`. */
export function useBelow(breakpoint: MantineBreakpoint, options?: { getInitialValueInEffect: boolean }) {
  const { breakpoints } = useMantineTheme();
  return useMediaQuery(belowBreakpoint(breakpoints[breakpoint]), undefined, options);
}

/**
 * LM3 §27 screen classes: phone below xs (600), tablet from xs to md (1200), desktop from md.
 * Desktop first: useMediaQuery answers in an effect and is false until then, so the first paint is the desktop layout,
 * never a flash of the phone one.
 */
export function useScreen() {
  const belowXs = useBelow('xs');
  const belowMd = useBelow('md');
  return { isMobile: belowXs, isTablet: !belowXs && belowMd };
}
