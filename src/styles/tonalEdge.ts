import { rem, type MantineTheme } from '@mantine/core';

// A tonal (light) button, badge or alert gets a thin border in its own color, so it reads as one shape on any surface.
// `byDefault` is the variant the component has without a variant prop.
export const tonalEdge =
  (prefix: string, variants: string[], byDefault: string) => (_theme: MantineTheme, props: { variant?: string }) => {
    const edge = `color-mix(in srgb, var(--${prefix}-color) var(--m3-tonal-edge), transparent)`;
    if (!variants.includes(props.variant ?? byDefault)) return { root: {} };
    // `adaptive` is tonal only in light (filled in dark)
    const color = props.variant === 'adaptive' ? `light-dark(${edge}, transparent)` : edge;
    return { root: { [`--${prefix}-bd`]: `${rem(1)} solid ${color}` } };
  };
