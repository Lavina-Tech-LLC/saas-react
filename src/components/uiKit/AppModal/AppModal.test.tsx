import { Button } from '@mantine/core';

import { useScreen } from '@/hooks/useScreen';
import { render, screen, userEvent, within } from '@/test/index';

import { AppModal, type AppModalAction } from './AppModal';

vi.mock('@/hooks/useScreen', () => ({ useScreen: vi.fn() }));

const onPhone = (isMobile: boolean) => vi.mocked(useScreen).mockReturnValue({ isMobile, isTablet: false });

function FormModal({ onClose, onSubmit, extra }: { onClose: () => void; onSubmit: () => void; extra?: boolean }) {
  const save: AppModalAction = { label: 'Save', form: 'member-form' };
  return (
    <AppModal
      opened
      onClose={onClose}
      title="New member"
      mainAction={save}
      footer={extra ? <Button variant="subtle">Save as draft</Button> : undefined}
    >
      <form
        id="member-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        Email
      </form>
    </AppModal>
  );
}

const setup = (extra?: boolean) => {
  const handlers = { onClose: vi.fn(), onSubmit: vi.fn() };
  render(<FormModal {...handlers} extra={extra} />);
  return { ...handlers, dialog: screen.getByRole('dialog', { name: 'New member' }) };
};

// A button's visible label, or its aria-label for an icon button
const names = (buttons: HTMLElement[]) => buttons.map((b) => b.textContent || b.getAttribute('aria-label'));

describe('AppModal', () => {
  beforeEach(() => onPhone(false));

  it('is named by its title and closes from its labeled ✕', async () => {
    const onClose = vi.fn();
    render(
      <AppModal opened onClose={onClose} title="Details" footer={<Button>Invite</Button>}>
        Email
      </AppModal>,
    );

    expect(screen.getByRole('dialog', { name: 'Details' })).toHaveTextContent('Email');
    expect(screen.getByRole('button', { name: 'Invite' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('ends the action row with Cancel and the main action, which submits its form', async () => {
    const { onClose, onSubmit } = setup(true);

    expect(names(screen.getAllByRole('button')).slice(-3)).toEqual(['Save as draft', 'Cancel', 'Save']);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('keeps Cancel from closing while the main action runs', () => {
    render(
      <AppModal opened onClose={vi.fn()} title="New member" mainAction={{ label: 'Save', loading: true }}>
        Email
      </AppModal>,
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  describe('on phones (full screen)', () => {
    beforeEach(() => onPhone(true));

    it('puts the ✕, the title and the main action in the top bar; the ✕ is the cancel', async () => {
      const { onClose, onSubmit, dialog } = setup();
      const header = within(dialog.querySelector<HTMLElement>('.mantine-Modal-header')!);

      expect(names(header.getAllByRole('button'))).toEqual(['Close', 'Save']);
      expect(within(dialog).queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();

      await userEvent.click(header.getByRole('button', { name: 'Save' }));
      expect(onSubmit).toHaveBeenCalledOnce();
      await userEvent.click(header.getByRole('button', { name: 'Close' }));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('keeps a bottom row only for the other actions', () => {
      const { dialog } = setup(true);
      const body = within(dialog.querySelector<HTMLElement>('.mantine-Modal-body')!);

      expect(names(body.getAllByRole('button'))).toEqual(['Save as draft']);
    });

    it('has no bottom row with just the main action', () => {
      const { dialog } = setup();
      expect(within(dialog.querySelector<HTMLElement>('.mantine-Modal-body')!).queryAllByRole('button')).toEqual([]);
    });
  });
});
