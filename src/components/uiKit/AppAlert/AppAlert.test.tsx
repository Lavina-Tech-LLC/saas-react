import { render, screen, userEvent } from '@/test/index';

import { AppAlert } from './AppAlert';

describe('AppAlert', () => {
  it('shows the title and the description as an alert', () => {
    render(
      <AppAlert severity="error" title="Payment failed">
        Check the card details
      </AppAlert>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed');
    expect(screen.getByText('Check the card details')).toBeInTheDocument();
  });

  it('shows a close button only with onClose', async () => {
    const { unmount } = render(<AppAlert>Saved</AppAlert>);
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    unmount();

    const onClose = vi.fn();
    render(<AppAlert onClose={onClose}>Saved</AppAlert>);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('runs its one action from a button beside the text', async () => {
    const onClick = vi.fn();
    render(<AppAlert action={{ label: 'Retry', onClick }}>Sync failed</AppAlert>);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
