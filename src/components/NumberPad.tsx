import { Digit } from '../lib/types';

interface NumberPadProps {
  notesMode: boolean;
  onInput: (d: Digit | null) => void;
  onToggleNotes: () => void;
}

export function NumberPad({ notesMode, onInput, onToggleNotes }: NumberPadProps) {
  const digits: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="number-pad">
      {digits.map(d => (
        <button
          key={d}
          className="number-pad__btn number-pad__digit"
          onClick={() => onInput(d)}
          aria-label={`Enter ${d}`}
        >
          {d}
        </button>
      ))}
      <button
        className="number-pad__btn number-pad__erase"
        onClick={() => onInput(null)}
        aria-label="Erase"
        title="Erase"
      >
        ✕
      </button>
      <button
        className={`number-pad__btn number-pad__notes${notesMode ? ' number-pad__notes--active' : ''}`}
        onClick={onToggleNotes}
        aria-label={notesMode ? 'Notes mode on' : 'Notes mode off'}
        aria-pressed={notesMode}
        title="Toggle notes mode"
      >
        ✏️
      </button>
    </div>
  );
}
