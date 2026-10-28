import { Avatar, Group, Stack, Text, UnstyledButton, type AvatarProps, type TextProps } from '@mantine/core';
import type { ReactNode } from 'react';

import classes from './CellText.module.css';

interface CellTextProps extends TextProps {
  children: ReactNode;
  /** The full text on hover; plain text and numbers are their own title. */
  title?: string;
}

const titleOf = (children: ReactNode, title?: string) =>
  title ?? (typeof children === 'string' || typeof children === 'number' ? String(children) : undefined);

/** LM3 §14 — a cell's main line, with the full text on hover. Names take `fw={600}`; a CellSubtext holds the detail. */
export function CellText({ children, title, className, ...props }: CellTextProps) {
  return (
    <Text
      fz="sm"
      lh={1.5}
      {...props}
      title={titleOf(children, title)}
      className={[classes.text, className].filter(Boolean).join(' ')}
    >
      {children}
    </Text>
  );
}

/** The dimmed secondary line under a CellText. */
export function CellSubtext({ children, title, className, ...props }: CellTextProps) {
  return (
    <Text
      fz="xs"
      fw={400}
      c="dimmed"
      lh={1.4}
      {...props}
      title={titleOf(children, title)}
      className={[classes.text, className].filter(Boolean).join(' ')}
    >
      {children}
    </Text>
  );
}

/** The row's picture, or the name's initials while there is none. */
export function CellImage({ name, src }: { name: string; src?: AvatarProps['src'] }) {
  return <Avatar src={src} name={name} alt={name} size={48} radius="sm" />;
}

interface CellNameProps {
  name: string;
  detail?: ReactNode;
  src?: AvatarProps['src'];
  /** The row's main action (its row press): the name becomes a button for it — the keyboard path to the record. */
  onOpen?: () => void;
}

/** The lead cell of a people or product row: the picture, then the name over its detail (email, SKU). */
export function CellName({ name, detail, src, onOpen }: CellNameProps) {
  return (
    <Group gap="sm" wrap="nowrap">
      <CellImage name={name} src={src} />
      <Stack gap={2} miw={0}>
        <CellText fw={600} title={name}>
          {onOpen ? (
            <UnstyledButton className={classes.open} onClick={onOpen}>
              {name}
            </UnstyledButton>
          ) : (
            name
          )}
        </CellText>
        {detail && <CellSubtext>{detail}</CellSubtext>}
      </Stack>
    </Group>
  );
}
