import { useCallback } from 'react';
import { Board, Digit } from '../lib/types';
import { Cell } from './Cell';

interface GridProps {
  cells: Board;
  selected: [number, number] | null;
  errorCells: Set<string>;
  peerKeys: Set<string>;
  sameValueKeys: Set<string>;
  isPaused: boolean;
  onSelect: (r: number, c: number) => void;
  onInput: (digit: Digit | null) => void;
  onToggleNotes: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function Grid({
  cells,
  selected,
  errorCells,
  peerKeys,
  sameValueKeys,
  isPaused,
  onSelect,
  onInput,
  onToggleNotes,
  onUndo,
  onRedo,
}: GridProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (!selected) {
          onSelect(0, 0);
          return;
        }
        const [r, c] = selected;
        if (e.key === 'ArrowUp') onSelect(Math.max(0, r - 1), c);
        else if (e.key === 'ArrowDown') onSelect(Math.min(8, r + 1), c);
        else if (e.key === 'ArrowLeft') onSelect(r, Math.max(0, c - 1));
        else if (e.key === 'ArrowRight') onSelect(r, Math.min(8, c + 1));
        return;
      }

      if (e.key >= '1' && e.key <= '9') {
        onInput(parseInt(e.key) as Digit);
        return;
      }

      if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') {
        onInput(null);
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        onToggleNotes();
        return;
      }

      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        onRedo();
        return;
      }

      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        onRedo();
        return;
      }

      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        onUndo();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        // Move to next unfilled cell
        if (!selected) {
          onSelect(0, 0);
          return;
        }
        const [r, c] = selected;
        let nextIdx = r * 9 + c + 1;
        if (e.shiftKey) nextIdx = r * 9 + c - 1;
        for (let i = 0; i < 81; i++) {
          const idx = ((nextIdx + i) % 81 + 81) % 81;
          const nr = Math.floor(idx / 9);
          const nc = idx % 9;
          if (!cells[nr][nc].given && cells[nr][nc].value === null) {
            onSelect(nr, nc);
            return;
          }
        }
      }
    },
    [selected, cells, onSelect, onInput, onToggleNotes, onUndo, onRedo]
  );

  return (
    <div
      className="grid"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Sudoku grid"
      role="grid"
    >
      {isPaused ? (
        <div className="grid__paused">
          <span>Paused</span>
        </div>
      ) : (
        cells.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`;
            return (
              <Cell
                key={key}
                cell={cell}
                row={r}
                col={c}
                selected={!!selected && selected[0] === r && selected[1] === c}
                peer={peerKeys.has(key)}
                sameValue={sameValueKeys.has(key)}
                error={errorCells.has(key)}
                onSelect={() => onSelect(r, c)}
              />
            );
          })
        )
      )}
    </div>
  );
}
