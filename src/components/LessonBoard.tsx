import { Digit, RawGrid } from '../lib/types';
import { Highlight, NoteSpec, boxIndex } from '../lib/lessons';

interface LessonBoardProps {
  givens: RawGrid;
  /** Digits placed/revealed during the lesson, keyed "r,c". */
  placed: Map<string, Digit>;
  highlight?: Highlight;
  notes?: NoteSpec[];
  /** Cell currently being asked about (gets a pulsing ring). */
  targetCell?: [number, number] | null;
  /** Key "r,c" of a wrong click, to flash. */
  wrongCell?: string | null;
  /** Key "r,c" of a correctly found cell. */
  correctCell?: string | null;
  clickable?: boolean;
  onCellClick?: (r: number, c: number) => void;
}

function inUnit(r: number, c: number, highlight?: Highlight): boolean {
  if (!highlight?.units) return false;
  return highlight.units.some(u => {
    if (u.type === 'row') return r === u.index;
    if (u.type === 'col') return c === u.index;
    return boxIndex(r, c) === u.index;
  });
}

export function LessonBoard({
  givens,
  placed,
  highlight,
  notes,
  targetCell,
  wrongCell,
  correctCell,
  clickable = false,
  onCellClick,
}: LessonBoardProps) {
  const noteMap = new Map<string, NoteSpec>();
  for (const n of notes ?? []) noteMap.set(`${n.cell[0]},${n.cell[1]}`, n);

  const strongKeys = new Set((highlight?.cells ?? []).map(([r, c]) => `${r},${c}`));

  return (
    <div className="lesson-board" role="grid" aria-label="Tutorial board">
      {givens.map((rowCells, r) =>
        rowCells.map((given, c) => {
          const key = `${r},${c}`;
          const placedDigit = placed.get(key);
          const value = given ?? placedDigit ?? null;
          const note = value === null ? noteMap.get(key) : undefined;
          const soft = inUnit(r, c, highlight);
          const strong = strongKeys.has(key);
          const isTarget = !!targetCell && targetCell[0] === r && targetCell[1] === c;
          const dimmed = !!highlight?.dimOthers && !soft && !strong && !isTarget;

          const classes = [
            'lesson-cell',
            given !== null ? 'lesson-cell--given' : '',
            placedDigit !== undefined && given === null ? 'lesson-cell--placed' : '',
            soft ? 'lesson-cell--unit' : '',
            strong ? 'lesson-cell--strong' : '',
            isTarget ? 'lesson-cell--question' : '',
            dimmed ? 'lesson-cell--dim' : '',
            wrongCell === key ? 'lesson-cell--wrong' : '',
            correctCell === key ? 'lesson-cell--correct' : '',
            c === 2 || c === 5 ? 'thick-right' : '',
            r === 2 || r === 5 ? 'thick-bottom' : '',
            clickable ? 'lesson-cell--clickable' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={key}
              className={classes}
              role="gridcell"
              aria-label={
                value !== null
                  ? `Row ${r + 1}, Column ${c + 1}, value ${value}`
                  : `Row ${r + 1}, Column ${c + 1}, empty`
              }
              onClick={clickable && onCellClick ? () => onCellClick(r, c) : undefined}
            >
              {value !== null ? (
                value
              ) : note ? (
                <div className="lesson-cell__notes">
                  {([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]).map(d => {
                    const has = note.digits.includes(d);
                    const struck = has && (note.eliminated ?? []).includes(d);
                    return (
                      <span
                        key={d}
                        className={`lesson-cell__note${struck ? ' lesson-cell__note--struck' : ''}`}
                      >
                        {has ? d : ''}
                      </span>
                    );
                  })}
                </div>
              ) : isTarget ? (
                <span className="lesson-cell__qmark">?</span>
              ) : (
                ''
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
