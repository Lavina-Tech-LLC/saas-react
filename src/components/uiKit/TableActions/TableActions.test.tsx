import { Copy, Pencil, Trash2 } from 'lucide-react';

import { render, screen, userEvent, within } from '@/test/index';

import { ACTION_COLOR } from './actionColors';
import { TableActions, type RowAction } from './TableActions';

const action = (label: string, extra: Partial<RowAction> = {}): RowAction => ({
  key: label,
  label,
  icon: Pencil,
  onClick: vi.fn(),
  ...extra,
});

const more = () => screen.queryByRole('button', { name: 'More actions for Order #1' });
const buttons = () => screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'));

// The setup's matchMedia (no query matches); vi.spyOn would reuse that mock and restoreAllMocks would not undo it
const defaultMatchMedia = vi.mocked(window.matchMedia).getMockImplementation()!;

// Phones: the component's max-width query matches
const onPhone = () =>
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    ...defaultMatchMedia(query),
    matches: query.includes('max-width'),
  }));

afterEach(() => {
  vi.mocked(window.matchMedia).mockImplementation(defaultMatchMedia);
  vi.restoreAllMocks();
});

describe('TableActions', () => {
  // Icons need 3:1: green at shade 7 is too light for a white icon, so it deepens to 8 instead of turning black
  it('keeps every filled action icon white, deepening a light color', () => {
    render(
      <TableActions
        name="Order #1"
        actions={[action('View', { color: 'green' }), action('Edit', { color: 'indigo' })]}
      />,
    );
    const view = screen.getByRole('button', { name: 'View' });
    expect(view.style.getPropertyValue('--ai-bg')).toBe('var(--mantine-color-green-8)');
    expect(view.style.getPropertyValue('--ai-color')).toBe('var(--mantine-color-white)');
    expect(screen.getByRole('button', { name: 'Edit' }).style.getPropertyValue('--ai-bg')).toBe(
      'var(--mantine-color-indigo-7)',
    );
  });

  it('shows two actions as two filled buttons, each in its color, the brand without one', async () => {
    const actions = [action('Duplicate', { icon: Copy, color: ACTION_COLOR.duplicate }), action('Email')];
    render(<TableActions name="Order #1" actions={actions} />);

    expect(buttons()).toEqual(['Duplicate', 'Email']);
    const duplicate = screen.getByRole('button', { name: 'Duplicate' });
    expect(duplicate).toHaveAttribute('data-variant', 'filled');
    expect(duplicate.getAttribute('style')).toContain('indigo');
    expect(screen.getByRole('button', { name: 'Email' }).getAttribute('style')).toContain('brand');
    await userEvent.click(screen.getByRole('button', { name: 'Email' }));
    expect(actions[1].onClick).toHaveBeenCalledOnce();
  });

  it('shows three actions as three buttons, the destructive one last', () => {
    render(
      <TableActions
        name="Order #1"
        actions={[action('Delete', { icon: Trash2, destructive: true }), action('Duplicate'), action('Email')]}
      />,
    );
    expect(buttons()).toEqual(['Duplicate', 'Email', 'Delete']);
    expect(more()).not.toBeInTheDocument();
  });

  it('shows the first two of four and puts the other two in a tonal ⋯, a divider before the destructive one', async () => {
    const actions = [action('One'), action('Two'), action('Three'), action('Delete', { destructive: true })];
    render(<TableActions name="Order #1" actions={actions} />);

    expect(buttons()).toEqual(['One', 'Two', 'More actions for Order #1']);
    expect(more()).toHaveAttribute('data-variant', 'light');
    await userEvent.click(more()!);
    const menu = await screen.findByRole('menu');
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent),
    ).toEqual(['Three', 'Delete']);
    expect(menu.querySelector('.mantine-Menu-divider')).toBeInTheDocument();
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Three' }));
    expect(actions[2].onClick).toHaveBeenCalledOnce();
  });

  it('makes a destructive action red at rest, a filled button and a red menu item', async () => {
    const { unmount } = render(
      <TableActions name="Order #1" actions={[action('Edit'), action('Delete', { destructive: true })]} />,
    );
    const inline = screen.getByRole('button', { name: 'Delete' });
    expect(inline).toHaveAttribute('data-variant', 'filled');
    expect(inline.getAttribute('style')).toContain('red');
    expect(screen.getByRole('button', { name: 'Edit' }).getAttribute('style') ?? '').not.toContain('red');
    unmount();

    render(
      <TableActions
        name="Order #1"
        actions={['One', 'Two', 'Three'].map((label) => action(label)).concat(action('Delete', { destructive: true }))}
      />,
    );
    await userEvent.click(more()!);
    const item = await screen.findByRole('menuitem', { name: 'Delete' });
    expect(item.getAttribute('style')).toContain('red');
    expect(screen.getByRole('menuitem', { name: 'Three' }).getAttribute('style') ?? '').not.toContain('red');
  });

  it('puts every action in the ⋯ on phones', async () => {
    onPhone();
    render(<TableActions name="Order #1" actions={[action('Duplicate'), action('Email')]} />);

    expect(buttons()).toEqual(['More actions for Order #1']);
    await userEvent.click(more()!);
    expect(await screen.findByRole('menuitem', { name: 'Duplicate' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Email' })).toBeInTheDocument();
  });

  it('disables an action without exposing its link, and leaves the others alone', () => {
    const link = (href: string) => (props: Record<string, unknown>) => <a {...props} href={href} />;
    render(
      <TableActions
        name="Order #1"
        actions={[
          action('Unavailable', { disabled: true, renderRoot: link('https://example.com/off') }),
          action('Available', { renderRoot: link('https://example.com/on') }),
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Unavailable' })).not.toHaveAttribute('href');
    expect(screen.getByRole('link', { name: 'Available' })).toHaveAttribute('href', 'https://example.com/on');
  });

  it('turns every action off with disabled, the ⋯ included', () => {
    render(
      <TableActions name="Order #1" actions={['One', 'Two', 'Three', 'Four'].map((label) => action(label))} disabled />,
    );
    expect(screen.getByRole('button', { name: 'One' })).toBeDisabled();
    expect(more()).toBeDisabled();
  });

  it('renders nothing without actions', () => {
    render(<TableActions name="Order #1" actions={[]} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
