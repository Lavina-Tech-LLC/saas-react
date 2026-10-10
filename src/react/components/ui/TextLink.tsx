import { Anchor } from '@mantine/core';
import type { ReactNode } from 'react';

// A link-styled button for in-component navigation (switch mode, go back, resend)
export function TextLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <Anchor component="button" type="button" fz="sm" fw={500} onClick={onClick}>
      {children}
    </Anchor>
  );
}
