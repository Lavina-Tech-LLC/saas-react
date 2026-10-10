import { useComputedColorScheme } from '@mantine/core';

// LM3 §21 — secondary actions: filled in dark mode, light in light mode
export function useColorVariant(): 'filled' | 'light' {
  return useComputedColorScheme('dark') === 'dark' ? 'filled' : 'light';
}
