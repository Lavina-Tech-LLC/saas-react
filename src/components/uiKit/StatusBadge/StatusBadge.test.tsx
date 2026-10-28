import { CheckCircle, Circle } from 'lucide-react';

import { render, screen } from '@/test/index';

import { defineStatuses } from './defineStatuses';
import { StatusBadge } from './StatusBadge';

const STATUS = defineStatuses({ done: { color: 'green', icon: CheckCircle }, draft: { color: 'gray', icon: Circle } });

describe('StatusBadge', () => {
  it('shows the label in the status color with its icon', () => {
    render(<StatusBadge {...STATUS.done}>Completed</StatusBadge>);
    const badge = screen.getByText('Completed').closest('.mantine-Badge-root')!;

    expect(badge).toHaveStyle({ '--badge-color': 'var(--mantine-color-green-light-color)' });
    expect(badge.querySelector('svg')).toBeInTheDocument();
  });

  it('is size lg and tonal by default, like every badge', () => {
    render(<StatusBadge {...STATUS.draft}>Draft</StatusBadge>);
    const badge = screen.getByText('Draft').closest('.mantine-Badge-root')!;

    expect(badge.querySelector('svg')).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-size', 'lg');
    expect(badge).toHaveAttribute('data-variant', 'light');
  });

  it('takes the size it is given, its icon a step per size', () => {
    render(
      <StatusBadge {...STATUS.draft} size="xs">
        Draft
      </StatusBadge>,
    );
    const badge = screen.getByText('Draft').closest('.mantine-Badge-root')!;

    expect(badge).toHaveAttribute('data-size', 'xs');
    expect(badge.querySelector('svg')).toHaveAttribute('width', '10');
  });
});
