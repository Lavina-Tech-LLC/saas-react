import { Button, Switch } from '@mantine/core';
import { Lock, Mail, ShieldCheck, Trash2 } from 'lucide-react';

import { SettingsGroup } from '@/components/uiKit/SettingsGroup';
import { render, screen, userEvent } from '@/test/index';

import { SettingsRow } from './SettingsRow';

describe('SettingsGroup + SettingsRow', () => {
  it('shows each row with its value and runs its action', async () => {
    const onChange = vi.fn();
    render(
      <SettingsGroup title="Account" description="How you sign in">
        <SettingsRow icon={Mail} label="Email" value="aziz@example.com" />
        <SettingsRow
          icon={Lock}
          color="orange"
          label="Password"
          description="Last changed in March"
          action={<Button onClick={onChange}>Change</Button>}
        />
      </SettingsGroup>,
    );

    expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByText('aziz@example.com')).toBeInTheDocument();
    expect(screen.getByText('Last changed in March')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Change' }));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('puts every row on its own tile, with no card around them, and renders nothing without rows', () => {
    const { container, rerender } = render(
      <SettingsGroup>
        <SettingsRow icon={Mail} label="Name" />
        <SettingsRow icon={Mail} label="Email" />
        <SettingsRow icon={Mail} label="Phone" />
      </SettingsGroup>,
    );
    expect(container.querySelectorAll('li')).toHaveLength(3);
    expect(container.querySelector('.mantine-Paper-root')).toBeNull();

    rerender(<SettingsGroup>{null}</SettingsGroup>);
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
  });

  it('leads every row with its icon, tinted by the row color — red for a danger row', () => {
    const { container } = render(
      <SettingsGroup>
        <SettingsRow icon={Lock} color="orange" label="Password" />
        <SettingsRow icon={Trash2} color="blue" danger label="Delete account" />
      </SettingsGroup>,
    );
    const icons = container.querySelectorAll('.mantine-ThemeIcon-root');
    expect(icons).toHaveLength(2);
    expect(icons[0]).toHaveStyle({ '--ti-color': 'var(--mantine-color-orange-light-color)' });
    expect(icons[1]).toHaveStyle({ '--ti-color': 'var(--mantine-color-red-light-color)' });
  });

  it('names and describes a switch action by the row label and description', () => {
    render(
      <SettingsGroup>
        <SettingsRow
          icon={ShieldCheck}
          label="Two-step verification"
          description="A code from your phone at every sign-in"
          action={(aria) => <Switch {...aria} />}
        />
        <SettingsRow icon={Mail} label="Newsletter" action={(aria) => <Switch {...aria} />} />
      </SettingsGroup>,
    );
    const twoStep = screen.getByRole('switch', { name: 'Two-step verification' });
    expect(twoStep).toHaveAccessibleDescription('A code from your phone at every sign-in');
    expect(screen.getByRole('switch', { name: 'Newsletter' })).not.toHaveAttribute('aria-describedby');
  });
});
