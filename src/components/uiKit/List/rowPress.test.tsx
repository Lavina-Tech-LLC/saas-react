import { Button, Checkbox, Modal, Table } from '@mantine/core';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import { fireEvent, render, screen, userEvent } from '@/test/index';

import { rowPressProps } from './rowPress';

function Row({ onPress }: { onPress: () => void }) {
  const [opened, setOpened] = useState(false);
  return (
    <Table>
      <Table.Tbody>
        <Table.Tr {...rowPressProps(onPress)}>
          <Table.Td data-row-controls>
            <Checkbox aria-label="Select Aziz" />
          </Table.Td>
          <Table.Td>
            Aziz Karimov <a href="#aziz">Open Aziz</a>
          </Table.Td>
          <Table.Td>
            <Button onClick={() => setOpened(true)}>Details</Button>
            <Modal opened={opened} onClose={() => setOpened(false)} title="Details">
              Text inside the dialog
            </Modal>
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
}

const setup = () => {
  const onPress = vi.fn();
  render(<Row onPress={onPress} />);
  return { onPress, cell: screen.getByText(/Aziz Karimov/) };
};

describe('rowPressProps', () => {
  it('runs the main action on a press of the row itself and marks the row pressable', async () => {
    const { onPress, cell } = setup();
    await userEvent.click(cell);

    expect(onPress).toHaveBeenCalledOnce();
    expect(cell.closest('tr')).toHaveAttribute('data-pressable');
    // Not a tab stop: the row's own link or button is the keyboard path
    expect(cell.closest('tr')).not.toHaveAttribute('tabindex');
  });

  it('leaves presses on the row controls and in their cells alone', async () => {
    const { onPress } = setup();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Aziz' }));
    await userEvent.click(screen.getByRole('checkbox').closest('td')!);
    await userEvent.click(screen.getByRole('link', { name: 'Open Aziz' }));
    await userEvent.click(screen.getByRole('button', { name: 'Details' }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('ignores clicks inside a dialog the row opened', async () => {
    const { onPress } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Details' }));
    await userEvent.click(await screen.findByText('Text inside the dialog'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('ignores clicks in a portal the row renders (its menu, a dialog), which React bubbles to the row', async () => {
    const onPress = vi.fn();
    render(
      <Table>
        <Table.Tbody>
          <Table.Tr {...rowPressProps(onPress)}>
            <Table.Td>{createPortal(<div>Portaled text</div>, document.body)}</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>,
    );
    await userEvent.click(screen.getByText('Portaled text'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('still runs on a row that is itself inside a dialog', async () => {
    const onPress = vi.fn();
    render(
      <Modal opened onClose={() => {}} title="Pick a customer">
        <Table>
          <Table.Tbody>
            <Table.Tr {...rowPressProps(onPress)}>
              <Table.Td>Malika Yusupova</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Modal>,
    );
    await userEvent.click(await screen.findByText('Malika Yusupova'));

    expect(onPress).toHaveBeenCalledOnce();
  });

  it('ignores modified clicks, other buttons and the end of a text selection', () => {
    const { onPress, cell } = setup();
    fireEvent.click(cell, { ctrlKey: true });
    fireEvent.click(cell, { metaKey: true });
    fireEvent.click(cell, { shiftKey: true });
    fireEvent.click(cell, { button: 1 });

    const selection = vi.spyOn(window, 'getSelection').mockReturnValue({ isCollapsed: false } as Selection);
    fireEvent.click(cell);
    selection.mockRestore();

    expect(onPress).not.toHaveBeenCalled();
  });
});
