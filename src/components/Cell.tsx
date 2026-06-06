import { CellState, Digit } from '../lib/types';

interface CellProps {
  cell: CellState;
  row: number;
  col: number;
  selected: boolean;
  peer: boolean;
  sameValue: boolean;
  error: boolean;
  onSelect: () => void;
}

export function Cell({ cell, row, col, selected, peer, sameValue, error, onSelect }: CellProps) {
  const thickRight = col === 2 || col === 5;
  const thickBottom = row === 2 || row === 5;

  const classes = [
    'cell',
    cell.given ? 'cell--given' : '',
    selected ? 'cell--selected' : '',
    !selected && peer ? 'cell--peer' : '',
    !selected && sameValue ? 'cell--same-value' : '',
    error ? 'cell--error' : '',
    cell.value === null && cell.notes.size > 0 ? 'cell--notes' : '',
    thickRight ? 'thick-right' : '',
    thickBottom ? 'thick-bottom' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const hasNotes = cell.value === null && cell.notes.size > 0;

  return (
    <div
      className={classes}
      role="button"
      aria-label={
        cell.value
          ? `Row ${row + 1}, Column ${col + 1}, value ${cell.value}${cell.given ? ', given' : ''}`
          : `Row ${row + 1}, Column ${col + 1}, empty`
      }
      aria-pressed={selected}
      onClick={onSelect}
      tabIndex={-1}
    >
      {hasNotes ? (
        <div className="cell__notes">
          {([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]).map(d => (
            <div key={d} className="cell__note">
              {cell.notes.has(d) ? d : ''}
            </div>
          ))}
        </div>
      ) : (
        cell.value
      )}
    </div>
  );
}
