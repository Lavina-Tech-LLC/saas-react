import { Button } from '@mantine/core';
import { fireEvent } from '@testing-library/react';

import { render, screen, userEvent } from '@/test/index';

import { BottomSheet } from './BottomSheet';
import { SideSheet } from './SideSheet';

describe('BottomSheet', () => {
  it('shows its title and content and closes from the drag handle', async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet opened onClose={onClose} title="Share">
        Copy link
      </BottomSheet>,
    );

    expect(screen.getByRole('heading', { name: 'Share' })).toBeInTheDocument();
    expect(screen.getByText('Copy link')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('is a dialog named by its title', () => {
    render(
      <BottomSheet opened onClose={() => {}} title="Share">
        Copy link
      </BottomSheet>,
    );

    expect(screen.getByRole('dialog', { name: 'Share' })).toBeInTheDocument();
    // The name comes from a hidden copy of the title — only one heading shows
    expect(screen.getAllByRole('heading', { name: 'Share' })).toHaveLength(1);
  });

  it('closes when its top is swiped down, not when it is pushed up', () => {
    const onClose = vi.fn();
    render(
      <BottomSheet opened onClose={onClose} title="Share">
        Copy link
      </BottomSheet>,
    );
    const top = screen.getByRole('heading', { name: 'Share' }).parentElement!;

    fireEvent.pointerDown(top, { clientY: 300, pointerId: 1 });
    fireEvent.pointerMove(top, { clientY: 200, pointerId: 1 });
    fireEvent.pointerUp(top, { clientY: 200, pointerId: 1 });
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.pointerDown(top, { clientY: 300, pointerId: 1 });
    fireEvent.pointerMove(top, { clientY: 500, pointerId: 1 });
    fireEvent.pointerUp(top, { clientY: 500, pointerId: 1 });
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('SideSheet', () => {
  it('shows the title, the content and the action bar', () => {
    render(
      <SideSheet opened onClose={() => {}} title="Filters" actions={<Button>Apply</Button>}>
        Status
      </SideSheet>,
    );

    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  });

  it('closes from its labeled ✕', async () => {
    const onClose = vi.fn();
    render(<SideSheet opened onClose={onClose} title="Filters" />);

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows a back arrow only when onBack is given', async () => {
    const onBack = vi.fn();
    const { rerender } = render(<SideSheet opened onClose={() => {}} title="Details" />);
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();

    rerender(<SideSheet opened onClose={() => {}} title="Details" onBack={onBack} />);
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
