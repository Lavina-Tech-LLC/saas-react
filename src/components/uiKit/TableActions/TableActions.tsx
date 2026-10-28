import { Group, Menu, type MantineColor } from '@mantine/core';
import { MoreHorizontal, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useScreen } from '@/hooks/useScreen';

import { ACTION_COLOR } from './actionColors';
import { ACTION_GAP, TableAction } from './TableAction';

export interface RowAction {
  key: string;
  /** A verb ("Duplicate", "Run history"): the button's tooltip and name, or the menu item's text. */
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  /** Renders the action as a link (a router Link, an `<a href>`); dropped while the action is disabled. */
  renderRoot?: (props: Record<string, unknown>) => ReactNode;
  /** The button's fill, from ACTION_COLOR: the brand when not set, red when destructive. */
  color?: MantineColor;
  disabled?: boolean;
  /** Delete, remove…: red, and last — after a divider in the menu. */
  destructive?: boolean;
}

interface TableActionsProps {
  /** What the row is ("Order #10001"), for the ⋯ button's name: "More actions for Order #10001". */
  name: string;
  /** The row's secondary actions — not its main one, which is the press on the row (rowPress): everyday ones first. */
  actions: RowAction[];
  /** Turns every action off, e.g. while the row saves. */
  disabled?: boolean;
}

/** Up to three actions are all buttons; with more, the first two are and the ⋯ takes the third slot. */
const MAX_BUTTONS = 3;
const BUTTONS_WITH_MENU = 2;

const colorOf = (action: RowAction) => action.color ?? (action.destructive ? ACTION_COLOR.delete : undefined);

// LM3 §14 — a row's secondary actions; its main one is the press on the row. Put it in a narrow end-aligned cell
// (`w={1}`, header `ta="end"`) marked `data-row-controls`.
export function TableActions({ name, actions, disabled }: TableActionsProps) {
  const { t } = useTranslation();
  const { isMobile: phone } = useScreen();
  if (actions.length === 0) return null;

  const ordered = [...actions.filter((a) => !a.destructive), ...actions.filter((a) => a.destructive)];
  const inline = phone ? [] : ordered.length <= MAX_BUTTONS ? ordered : ordered.slice(0, BUTTONS_WITH_MENU);
  const menu = ordered.slice(inline.length);
  const firstDestructive = menu.findIndex((a) => a.destructive);
  const off = (action: RowAction) => disabled || action.disabled;

  return (
    <Group gap={ACTION_GAP} wrap="nowrap" justify="flex-end">
      {inline.map((action) => (
        <TableAction
          key={action.key}
          label={action.label}
          icon={action.icon}
          color={colorOf(action)}
          onClick={action.onClick}
          renderRoot={off(action) ? undefined : action.renderRoot}
          disabled={off(action)}
        />
      ))}
      {menu.length > 0 && (
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <TableAction
              tonal
              label={t('common.moreActions')}
              aria-label={t('common.moreActionsFor', { name })}
              icon={MoreHorizontal}
              disabled={disabled}
            />
          </Menu.Target>
          <Menu.Dropdown>
            {menu.map((action, index) => [
              index === firstDestructive && index > 0 && <Menu.Divider key={`${action.key}-divider`} />,
              <Menu.Item
                key={action.key}
                color={action.destructive ? ACTION_COLOR.delete : undefined}
                leftSection={<action.icon size={16} aria-hidden />}
                onClick={action.onClick}
                renderRoot={off(action) ? undefined : action.renderRoot}
                disabled={off(action)}
              >
                {action.label}
              </Menu.Item>,
            ])}
          </Menu.Dropdown>
        </Menu>
      )}
    </Group>
  );
}
