import { Trash2 } from 'lucide-react';

import { UnsavedChangesDialog } from '@/components/uiKit/UnsavedChangesDialog';
import { render, screen, userEvent, waitFor, within } from '@/test/index';

import { ConfirmDialog } from './ConfirmDialog';

type Props = Parameters<typeof ConfirmDialog>[0];

const dialog = (props: Partial<Props> = {}, handlers = { onClose: vi.fn(), onConfirm: vi.fn() }) => (
  <ConfirmDialog opened title="Delete order?" description="This cannot be undone." {...handlers} {...props} />
);

const setup = (props: Partial<Props> = {}) => {
  const handlers = { onClose: vi.fn(), onConfirm: vi.fn() };
  const { rerender } = render(dialog(props, handlers));
  return { ...handlers, rerender: (next: Partial<Props>) => rerender(dialog(next, handlers)) };
};

// The scrim behind the dialog — it has no role or name to find it by
const scrim = () => document.querySelector<HTMLElement>('.mantine-Modal-overlay')!;

describe('ConfirmDialog', () => {
  it('confirms with the red action and cancels with Cancel', async () => {
    const { onClose, onConfirm } = setup();
    expect(screen.getByRole('dialog', { name: 'Delete order?' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  // Android 16 dialogs: the dismissive action outlined, the confirming one filled (Mantine drops data-variant on filled)
  it('draws Cancel outlined and the confirm filled in its color', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('data-variant', 'default');
    const confirm = screen.getByRole('button', { name: 'Delete' });
    expect(confirm).not.toHaveAttribute('data-variant');
    expect(confirm).toHaveStyle({ '--button-bg': 'var(--mantine-color-red-filled)' });
  });

  it('uses the given labels', () => {
    setup({ confirmLabel: 'Archive', cancelLabel: 'Keep' });
    expect(screen.getByRole('button', { name: 'Archive' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
  });

  // The modal header: a start-aligned title with the icon as a tonal tile before it; the tile is decoration
  it('with an icon, shows it as a tile before a start-aligned title and is still named by the title alone', () => {
    setup({ icon: Trash2 });
    const dialogEl = screen.getByRole('dialog', { name: 'Delete order?' });
    const title = dialogEl.querySelector<HTMLElement>('.mantine-Modal-title')!;

    expect(title.querySelector('.mantine-ThemeIcon-root')).toHaveAttribute('aria-hidden', 'true');
    expect(title).not.toHaveStyle({ textAlign: 'center' });
  });

  // Like every modal: the plain ✕ closes it
  it('closes with the ✕', async () => {
    const { onClose } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('starts with focus on Cancel', async () => {
    setup();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus());
  });

  it('closes on Esc and on the scrim', async () => {
    const { onClose } = setup();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(scrim());
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('cannot be closed or confirmed again while the request runs', async () => {
    const { onClose, onConfirm } = setup({ loading: true });
    const dialogEl = within(screen.getByRole('dialog', { name: 'Delete order?' }));

    for (const name of ['Cancel', 'Delete']) {
      const button = dialogEl.getByRole('button', { name });
      expect(button).toBeDisabled();
      await userEvent.click(button);
    }
    await userEvent.keyboard('{Escape}');
    await userEvent.click(scrim());

    expect(onClose).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('keeps confirm disabled until the exact text is typed', async () => {
    const { onConfirm } = setup({ confirmText: 'Acme Inc' });
    const confirm = screen.getByRole('button', { name: 'Delete' });
    expect(confirm).toBeDisabled();

    await userEvent.type(screen.getByRole('textbox', { name: 'Type Acme Inc to confirm' }), 'Acme');
    expect(confirm).toBeDisabled();
    await userEvent.type(screen.getByRole('textbox'), ' Inc');
    await userEvent.click(confirm);

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('starts with focus on the field when the name has to be typed', async () => {
    setup({ confirmText: 'Acme Inc' });
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Type Acme Inc to confirm' })).toHaveFocus());
  });

  it('shows why the request failed and keeps what was typed', async () => {
    const { rerender } = setup({ confirmText: 'Acme Inc' });
    await userEvent.type(screen.getByRole('textbox', { name: 'Type Acme Inc to confirm' }), 'Acme Inc');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender({ confirmText: 'Acme Inc', loading: true });
    rerender({ confirmText: 'Acme Inc', error: 'The connection was lost. Try again.' });

    expect(screen.getByRole('alert')).toHaveTextContent('The connection was lost. Try again.');
    expect(screen.getByRole('textbox')).toHaveValue('Acme Inc');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  });
});

describe('UnsavedChangesDialog', () => {
  it('stays or leaves', async () => {
    const onStay = vi.fn();
    const onLeave = vi.fn();
    render(<UnsavedChangesDialog opened onStay={onStay} onLeave={onLeave} description="3 rows will be lost." />);

    expect(screen.getByRole('dialog', { name: 'Leave without saving?' })).toHaveTextContent('3 rows will be lost.');
    await userEvent.click(screen.getByRole('button', { name: 'Stay' }));
    await userEvent.click(screen.getByRole('button', { name: 'Leave' }));

    expect(onStay).toHaveBeenCalledOnce();
    expect(onLeave).toHaveBeenCalledOnce();
  });
});
