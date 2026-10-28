import type { ActionIconVariant, ButtonVariant } from '@mantine/core';

// The LM3 theme's own variants (the boilerplate's styles/theme.ts): `adaptive` buttons and `standard` icon buttons.
// The host app's theme draws them; the kit's components name them.
declare module '@mantine/core' {
  export interface ButtonProps {
    variant?: ButtonVariant | 'adaptive';
  }
  export interface ActionIconProps {
    variant?: ActionIconVariant | 'standard';
  }
}
