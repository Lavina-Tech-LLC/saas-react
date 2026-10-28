import { render, screen } from '@/test/index';

import { CellImage, CellName, CellSubtext, CellText } from './CellText';

describe('CellText', () => {
  it('keeps the full text as the title, so a cut-off value can still be read', () => {
    render(
      <>
        <CellText fw={600}>Refrigerated microcentrifuge Micro 220R</CellText>
        <CellSubtext>HT-M220R</CellSubtext>
      </>,
    );
    expect(screen.getByText('Refrigerated microcentrifuge Micro 220R')).toHaveAttribute(
      'title',
      'Refrigerated microcentrifuge Micro 220R',
    );
    expect(screen.getByText('HT-M220R')).toHaveAttribute('title', 'HT-M220R');
  });

  it('takes an explicit title for rich content', () => {
    render(
      <CellSubtext title="GRO-1 · Golden Valley">
        <span>GRO-1</span> · Golden Valley
      </CellSubtext>,
    );
    expect(screen.getByTitle('GRO-1 · Golden Valley')).toBeInTheDocument();
  });

  it('draws the row image with the name’s initials while there is no picture', () => {
    render(<CellImage name="Aziz Karimov" />);
    expect(screen.getByText('AK')).toBeInTheDocument();
  });

  it('leads a row with its picture and the name over its detail', () => {
    render(<CellName name="Aziz Karimov" detail="aziz@example.com" />);
    expect(screen.getByText('AK')).toBeInTheDocument();
    expect(screen.getByText('Aziz Karimov')).toHaveAttribute('title', 'Aziz Karimov');
    expect(screen.getByText('aziz@example.com')).toHaveAttribute('title', 'aziz@example.com');
  });
});
