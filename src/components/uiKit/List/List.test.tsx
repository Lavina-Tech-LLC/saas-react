import { Avatar, Checkbox, Switch } from '@mantine/core';
import { Bell } from 'lucide-react';

import { render, screen, userEvent, within } from '@/test/index';

import { List } from './List';
import { ListItem } from './ListItem';

describe('List + ListItem', () => {
  it('is a list named by its subheader, its rows list items with their line count and leading kind', () => {
    render(
      <List subheader="Today" dividers="inset">
        <ListItem headline="Aziza Karimova" leading={<Avatar name="Aziza Karimova" />} leadingType="avatar" />
        <ListItem headline="Backup" supportingText="Up to date" leading={<Bell />} />
        <ListItem headline="Album" overline="Shared" supportingText="128 items" lines={3} />
      </List>,
    );

    const list = screen.getByRole('list', { name: 'Today' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(list).toHaveAttribute('data-dividers', 'inset');
    expect(items.map((item) => item.getAttribute('data-leading'))).toEqual(['avatar', 'icon', null]);
    expect(items.map((item) => item.firstElementChild?.getAttribute('data-lines'))).toEqual(['1', '2', '3']);
    // The avatar's initials are decoration next to the name
    expect(within(items[0]).getByText('AK').closest('[aria-hidden]')).not.toBeNull();
  });

  it('makes a clicked row a button, marks the chosen one and keeps a disabled one off', async () => {
    const onClick = vi.fn();
    render(
      <List aria-label="Frequency">
        <ListItem headline="Daily" onClick={onClick} selected />
        <ListItem headline="Weekly" onClick={onClick} selected={false} />
        <ListItem headline="Hourly" onClick={onClick} disabled />
      </List>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Weekly' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Daily' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Hourly' })).toBeDisabled();
  });

  it('runs the press of a row with controls, but not when one of its controls is pressed', async () => {
    const onPress = vi.fn();
    const onSwitch = vi.fn();
    render(
      <List aria-label="Settings">
        <ListItem
          headline="Notifications"
          onPress={onPress}
          trailing={<Switch aria-label="Notifications" onChange={onSwitch} />}
        />
      </List>,
    );

    await userEvent.click(screen.getByText('Notifications'));
    expect(onPress).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('switch', { name: 'Notifications' }));
    expect(onSwitch).toHaveBeenCalledOnce();
    expect(onPress).toHaveBeenCalledOnce();
    // Not a button itself: the switch is the keyboard path
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('keeps a leading checkbox reachable and renders a row as a link through renderRoot', () => {
    render(
      <List aria-label="Files">
        <ListItem headline="Q3-report.pdf" leading={<Checkbox aria-label="Q3-report.pdf" />} leadingType="control" />
        <ListItem headline="Open settings" renderRoot={(props) => <a href="/settings" {...props} />} />
      </List>,
    );

    expect(screen.getByRole('checkbox', { name: 'Q3-report.pdf' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open settings' })).toHaveAttribute('href', '/settings');
  });

  it('moves focus between button rows with the arrow keys, Home and End', async () => {
    render(
      <List aria-label="Pages">
        <ListItem headline="Dashboard" onClick={vi.fn()} />
        <ListItem headline="Orders" onClick={vi.fn()} />
        <ListItem headline="Archive" onClick={vi.fn()} disabled />
        <ListItem headline="Settings" onClick={vi.fn()} />
      </List>,
    );

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Orders' })).toHaveFocus();
    // A disabled row is skipped
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('button', { name: 'Orders' })).toHaveFocus();
  });

  it('is just the row outside a List, at its own size', () => {
    const { container } = render(<ListItem headline="Use “Navoi”" size="sm" trailingText="Enter" />);
    expect(container.querySelector('li')).toBeNull();
    expect(screen.getByText('Use “Navoi”').closest('[data-size]')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByText('Enter')).toBeInTheDocument();
  });

  it('joins the rows of a connected list in place of dividers, with details under a row', () => {
    render(
      <List connected dividers="full" aria-label="History">
        <ListItem headline="v2.0.0" supportingText="Design system upgrade" leading={<Bell />} leadingType="avatar">
          <p>Everything new in this release</p>
        </ListItem>
        <ListItem headline="v1.5.1" leading={<Bell />} leadingType="avatar" />
      </List>,
    );

    const list = screen.getByRole('list', { name: 'History' });
    expect(list).toHaveAttribute('data-connected');
    expect(list).not.toHaveAttribute('data-dividers');
    const [first] = within(list).getAllByRole('listitem');
    // The details sit in the same list item, after the row
    expect(within(first).getByText('Everything new in this release')).toBeInTheDocument();
    expect(within(first).getByText('Everything new in this release').closest('[data-lines]')).toBeNull();
  });
});
