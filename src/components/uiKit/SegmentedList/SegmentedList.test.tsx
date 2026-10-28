import { createRef, type CSSProperties } from 'react';

import { ListItem } from '@/components/uiKit/List';
import { render, screen, userEvent } from '@/test/index';

import { SegmentedList, SegmentedListItem } from './SegmentedList';

describe('SegmentedList', () => {
  it('makes a row with an action a button and a row without one plain text', async () => {
    const onClick = vi.fn();
    render(
      <SegmentedList aria-label="Account">
        <SegmentedListItem title="Profile" onClick={onClick} />
        <SegmentedListItem title="Version 1.0" />
      </SegmentedList>,
    );

    await userEvent.click(screen.getByRole('button', { name: /profile/i }));

    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: /version/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  // M3's separated list: the rows are separate tiles, so the list draws no hairlines between them
  it('draws no dividers between its rows', () => {
    render(
      <SegmentedList aria-label="Account">
        <SegmentedListItem title="Profile" />
        <SegmentedListItem title="Security" />
      </SegmentedList>,
    );
    expect(screen.getByRole('list', { name: 'Account' })).not.toHaveAttribute('data-dividers');
  });

  it('marks the chosen row of a single-choice list', () => {
    render(
      <SegmentedList>
        <SegmentedListItem title="Daily" onClick={vi.fn()} selected />
        <SegmentedListItem title="Weekly" onClick={vi.fn()} selected={false} />
      </SegmentedList>,
    );
    expect(screen.getByRole('button', { name: /daily/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /weekly/i })).toHaveAttribute('aria-pressed', 'false');
  });

  // A list to reorder: useRowDrag's listProps go on the list itself
  it('takes ListItem rows and gives its list a class, a style and a ref', () => {
    const ref = createRef<HTMLUListElement>();
    render(
      <SegmentedList aria-label="Members" className="reorder" style={{ '--inset': '8px' } as CSSProperties} ref={ref}>
        <ListItem headline="Aziz Karimov" trailingText="Admin" />
      </SegmentedList>,
    );
    const list = screen.getByRole('list', { name: 'Members' });
    expect(list).toBe(ref.current);
    expect(list).toHaveClass('reorder');
    expect(list.style.getPropertyValue('--inset')).toBe('8px');
    expect(screen.getByRole('listitem')).toHaveTextContent('Admin');
  });
});
