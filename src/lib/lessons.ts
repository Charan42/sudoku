import { Digit, RawGrid } from './types';

/**
 * Interactive tutorial lessons.
 *
 * Every lesson board is a subset of one known-valid solved grid (REFERENCE_SOLUTION,
 * the classic Wikipedia example), so givens can never contradict each other and every
 * answer is the true solution digit for its cell. The logical invariants of each
 * lesson (e.g. "this cell really has exactly one candidate") are verified by
 * lessons.test.ts.
 */

export const REFERENCE_SOLUTION: Digit[][] = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

export type GivenSpec = [row: number, col: number, digit: Digit];

export interface UnitRef {
  type: 'row' | 'col' | 'box';
  index: number; // 0-8; boxes numbered left-to-right, top-to-bottom
}

export interface Highlight {
  /** Strongly highlighted cells (the cells the explanation is about). */
  cells?: [number, number][];
  /** Softly washed units (the row/column/box being scanned). */
  units?: UnitRef[];
  /** Dim all cells not highlighted, to focus attention. */
  dimOthers?: boolean;
}

export interface NoteSpec {
  cell: [number, number];
  digits: Digit[];
  /** Digits drawn struck-through in red (just eliminated). */
  eliminated?: Digit[];
}

export type Step =
  | {
      kind: 'info';
      text: string;
      highlight?: Highlight;
      notes?: NoteSpec[];
      /** Extra givens that appear on the board when this step is reached. */
      reveal?: GivenSpec[];
    }
  | {
      kind: 'find-cell';
      text: string;
      target: [number, number];
      highlight?: Highlight;
      notes?: NoteSpec[];
      hint: string;
      success: string;
    }
  | {
      kind: 'pick-digit';
      text: string;
      cell: [number, number];
      answer: Digit;
      highlight?: Highlight;
      notes?: NoteSpec[];
      hint: string;
      success: string;
    }
  | {
      kind: 'pick-digits';
      text: string;
      cell: [number, number];
      answers: Digit[];
      highlight?: Highlight;
      notes?: NoteSpec[];
      hint: string;
      success: string;
    };

export type LessonLevel = 'Beginner' | 'Easy' | 'Intermediate' | 'Advanced';

export interface Lesson {
  id: string;
  title: string;
  tagline: string;
  level: LessonLevel;
  summary: string;
  givens: GivenSpec[];
  steps: Step[];
}

export function buildBoard(givens: GivenSpec[]): RawGrid {
  const grid: RawGrid = Array.from({ length: 9 }, () => Array<Digit | null>(9).fill(null));
  for (const [r, c, d] of givens) grid[r][c] = d;
  return grid;
}

export function boxIndex(r: number, c: number): number {
  return Math.floor(r / 3) * 3 + Math.floor(c / 3);
}

const box = (index: number): UnitRef => ({ type: 'box', index });
const row = (index: number): UnitRef => ({ type: 'row', index });
const col = (index: number): UnitRef => ({ type: 'col', index });

export const LESSONS: Lesson[] = [
  // ────────────────────────────────────────────────────────────────────
  // 1. LAST FREE CELL — BOX
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'last-cell-box',
    title: 'Last Free Cell — Box',
    tagline: '8 down, 1 to go',
    level: 'Beginner',
    summary:
      'When 8 of the 9 cells in a 3×3 box are filled, the missing digit must go in the last empty cell.',
    givens: [
      // Box 0 — everything except (1,1) = 7
      [0, 0, 5], [0, 1, 3], [0, 2, 4],
      [1, 0, 6], [1, 2, 2],
      [2, 0, 1], [2, 1, 9], [2, 2, 8],
      // Flavor cells elsewhere
      [3, 4, 6], [4, 4, 5], [5, 4, 2],
      [0, 6, 9], [6, 6, 2], [7, 7, 3],
    ],
    steps: [
      {
        kind: 'info',
        text:
          'Every 3×3 box must contain each digit 1–9 exactly once. Look at the highlighted box in the top-left corner: 8 of its 9 cells are already filled. That means only one digit is missing — and there is only one place it can go.',
        highlight: { units: [box(0)], dimOthers: true },
      },
      {
        kind: 'find-cell',
        text: 'Your turn! Tap the only empty cell in the top-left box.',
        target: [1, 1],
        highlight: { units: [box(0)], dimOthers: true },
        hint: 'Scan the top-left 3×3 box cell by cell — exactly one of them has no digit.',
        success: 'That’s the one! Now let’s work out which digit belongs there.',
      },
      {
        kind: 'pick-digit',
        text:
          'The box already contains 5, 3, 4, 6, 2, 1, 9 and 8. Which digit from 1–9 is missing? Pick it below.',
        cell: [1, 1],
        answer: 7,
        highlight: { units: [box(0)], cells: [[1, 1]], dimOthers: true },
        hint: 'Count up from 1: 1 ✓, 2 ✓, 3 ✓, 4 ✓, 5 ✓, 6 ✓ … which number do you never find in the box?',
        success:
          'Exactly — 7 was the only digit missing, so it must go in the last free cell. This “Last Free Cell” check is the very first thing experienced players scan for.',
      },
      {
        kind: 'info',
        text:
          'Done! Whenever a box (or a row, or a column — next lesson!) has just one empty cell, you can fill it instantly with the one missing digit. No guessing, ever.',
        highlight: { units: [box(0)], cells: [[1, 1]] },
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // 2. LAST FREE CELL — ROW & COLUMN
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'last-cell-line',
    title: 'Last Free Cell — Row & Column',
    tagline: 'The same trick, stretched out',
    level: 'Beginner',
    summary:
      'Rows and columns also need all digits 1–9. If only one cell in a line is empty, the missing digit goes there.',
    givens: [
      // Row 4 — everything except (4,4) = 5
      [4, 0, 4], [4, 1, 2], [4, 2, 6], [4, 3, 8], [4, 5, 3], [4, 6, 7], [4, 7, 9], [4, 8, 1],
      // Column 2 — everything except (6,2) = 1 (note (4,2)=6 is shared with the row)
      [0, 2, 4], [1, 2, 2], [2, 2, 8], [3, 2, 9], [5, 2, 3], [7, 2, 7], [8, 2, 5],
    ],
    steps: [
      {
        kind: 'info',
        text:
          'Rows and columns follow the same rule as boxes: each must contain 1–9 exactly once. So the Last Free Cell trick from the previous lesson works on lines too. The highlighted row has 8 digits placed and a single gap.',
        highlight: { units: [row(4)], dimOthers: true },
      },
      {
        kind: 'pick-digit',
        text:
          'The row reads 4, 2, 6, 8, _, 3, 7, 9, 1. Which digit completes it?',
        cell: [4, 4],
        answer: 5,
        highlight: { units: [row(4)], cells: [[4, 4]], dimOthers: true },
        hint: 'Tick off the digits one by one: 1 ✓, 2 ✓, 3 ✓, 4 ✓ … the first one you can’t find is the answer.',
        success: 'Nice — 5 completes the row. Now let’s do the same with a column.',
      },
      {
        kind: 'info',
        text:
          'Columns work identically. Look at the highlighted column: it runs 4, 2, 8, 9, 6, 3, _, 7, 5 from top to bottom — one gap, one missing digit.',
        highlight: { units: [col(2)], dimOthers: true },
      },
      {
        kind: 'find-cell',
        text: 'Tap the empty cell in the highlighted column.',
        target: [6, 2],
        highlight: { units: [col(2)], dimOthers: true },
        hint: 'Run your eye down the column from the top — the gap is in the lower third.',
        success: 'Found it. One digit left to identify…',
      },
      {
        kind: 'pick-digit',
        text: 'Which digit is missing from the column 4, 2, 8, 9, 6, 3, _, 7, 5?',
        cell: [6, 2],
        answer: 1,
        highlight: { units: [col(2)], cells: [[6, 2]], dimOthers: true },
        hint: 'Start counting at 1. Do you see a 1 anywhere in the column?',
        success:
          'Correct! Rows, columns and boxes are the three “units” of Sudoku — and the Last Free Cell trick works the same way in all of them.',
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // 3. NAKED SINGLE (CROSS-HATCHING A CELL)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'naked-single',
    title: 'Naked Single',
    tagline: 'One cell, one survivor',
    level: 'Beginner',
    summary:
      'Combine the row, column AND box of a cell. If they rule out 8 digits, the 9th digit is forced.',
    givens: [
      [4, 0, 4], [4, 1, 2], [4, 5, 3], [4, 8, 1], // row 4
      [0, 4, 7], [8, 4, 8],                       // column 4
      [3, 4, 6], [5, 3, 9],                       // box 4
      [0, 0, 5], [8, 8, 9],                       // flavor
    ],
    steps: [
      {
        kind: 'info',
        text:
          'A cell belongs to three units at once: its row, its column and its box. Each unit eliminates some digits. When only ONE digit survives all three eliminations, it’s called a Naked Single. Focus on the highlighted centre cell.',
        highlight: { cells: [[4, 4]], units: [row(4), col(4), box(4)] },
      },
      {
        kind: 'info',
        text:
          'Let’s eliminate. Its ROW already has 4, 2, 3 and 1. Its COLUMN has 7, 6 and 8. Its BOX adds a 9. Cross those off: 1 ✗, 2 ✗, 3 ✗, 4 ✗, 6 ✗, 7 ✗, 8 ✗, 9 ✗ — eight digits are impossible!',
        highlight: { cells: [[4, 4]], units: [row(4), col(4), box(4)] },
        notes: [
          {
            cell: [4, 4],
            digits: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            eliminated: [1, 2, 3, 4, 6, 7, 8, 9],
          },
        ],
      },
      {
        kind: 'pick-digit',
        text: 'Only one digit survived the eliminations. Place it!',
        cell: [4, 4],
        answer: 5,
        highlight: { cells: [[4, 4]], units: [row(4), col(4), box(4)] },
        notes: [
          {
            cell: [4, 4],
            digits: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            eliminated: [1, 2, 3, 4, 6, 7, 8, 9],
          },
        ],
        hint: 'Every digit except one is crossed out in the pencil marks. Which one is left standing?',
        success:
          '5 is the only digit not visible from this cell — a Naked Single. This “scan the row, column and box” move is the workhorse of Sudoku solving.',
      },
      {
        kind: 'info',
        text:
          'Tip: unlike Last Free Cell, you don’t need 8 placed digits in one unit for this to work — here the eliminations came from three different units that overlap on a single cell. Always check all three!',
        highlight: { cells: [[4, 4]] },
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // 4. HIDDEN SINGLE — BOX
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'hidden-single-box',
    title: 'Hidden Single — Box',
    tagline: 'Where can the 5 hide?',
    level: 'Easy',
    summary:
      'Instead of asking “what fits this cell?”, ask “where can this digit go in the box?”. Often only one cell is left.',
    givens: [
      // Box 0 partial
      [0, 1, 3], [1, 2, 2], [2, 2, 8],
      // The 5s that do the eliminating
      [1, 5, 5], [2, 6, 5], [8, 2, 5],
      // Flavor
      [1, 3, 1], [2, 4, 4], [8, 0, 3],
    ],
    steps: [
      {
        kind: 'info',
        text:
          'New question, new technique. The top-left box has six empty cells, so no Last Free Cell here. Instead of asking what fits a cell, ask: “the box needs a 5 — WHERE can it go?”',
        highlight: { units: [box(0)] },
      },
      {
        kind: 'info',
        text:
          'A 5 can’t appear twice in any row or column. The 5 in row 2 blocks both empty cells of the box in that row. The 5 in row 3 blocks that row of the box too.',
        highlight: {
          cells: [[1, 5], [2, 6]],
          units: [row(1), row(2), box(0)],
        },
      },
      {
        kind: 'info',
        text:
          'And the 5 near the bottom of column 3 shoots upward, blocking the box’s empty cell in that column. Watch the box: the eliminations are closing in…',
        highlight: {
          cells: [[8, 2]],
          units: [col(2), box(0)],
        },
      },
      {
        kind: 'find-cell',
        text:
          'Every empty cell of the box is now blocked for 5 — except one. Tap the only cell in the top-left box that can still hold a 5.',
        target: [0, 0],
        highlight: { units: [box(0)] },
        hint: 'Rows 2 and 3 of the box are blocked by the 5s on the right; column 3 of the box is blocked from below. What remains?',
        success: 'That’s the spot — the only cell in the box that all three 5s fail to reach.',
      },
      {
        kind: 'pick-digit',
        text: 'Place the digit we’ve been hunting.',
        cell: [0, 0],
        answer: 5,
        highlight: { cells: [[0, 0]], units: [box(0)] },
        hint: 'We asked where the 5 can go… so place the 5!',
        success:
          'This is a Hidden Single: unlike a Naked Single, the cell itself could still hold several digits — but it is the only home for the 5 in its box. Scanning each digit box-by-box like this is called cross-hatching.',
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // 5. HIDDEN SINGLE — ROW & COLUMN
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'hidden-single-line',
    title: 'Hidden Single — Row & Column',
    tagline: 'Only one seat left on this row',
    level: 'Easy',
    summary:
      'The same “where can it go?” question works in rows and columns: if a digit fits only one cell of a line, it lives there.',
    givens: [
      // Row 8 partial: 3 4 _ _ _ 6 _ 7 9
      [8, 0, 3], [8, 1, 4], [8, 5, 6], [8, 7, 7], [8, 8, 9],
      // The 8s that eliminate
      [2, 2, 8], [4, 3, 8], [5, 6, 8],
      // Flavor
      [0, 0, 5], [1, 1, 7],
    ],
    steps: [
      {
        kind: 'info',
        text:
          'The same “where can it go?” question from Hidden Single — Box works on lines. The bottom row needs an 8, and it has four empty cells. Where can the 8 go? Let’s check each empty cell against its column.',
        highlight: { units: [row(8)] },
      },
      {
        kind: 'info',
        text:
          'Three of the four empty cells look up their column and see an 8 already placed — so they’re blocked. The highlighted 8s each eliminate one cell of the bottom row.',
        highlight: {
          cells: [[2, 2], [4, 3], [5, 6]],
          units: [col(2), col(3), col(6), row(8)],
        },
      },
      {
        kind: 'find-cell',
        text: 'Tap the only cell in the bottom row that can still take an 8.',
        target: [8, 4],
        highlight: { units: [row(8)] },
        hint: 'The empty cells are in columns 3, 4, 5 and 7. Which of those columns has no 8 in it?',
        success: 'Yes — its column is the only one without an 8.',
      },
      {
        kind: 'pick-digit',
        text: 'Lock it in.',
        cell: [8, 4],
        answer: 8,
        highlight: { cells: [[8, 4]], units: [row(8)] },
        hint: 'We were hunting the 8 for this row.',
        success:
          'A Hidden Single in a row! The full routine: pick a digit, pick a unit (row, column or box), and check whether only one cell remains for it. Rinse and repeat for digits 1–9.',
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // 6. PENCIL MARKS (CANDIDATES)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'candidates',
    title: 'Pencil Marks',
    tagline: 'Write down what you know',
    level: 'Easy',
    summary:
      'List every digit a cell could legally hold. These “candidates” are the raw material for all advanced techniques.',
    givens: [
      [0, 0, 5], [0, 1, 3], [0, 8, 2], // row 0
      [1, 4, 9], [2, 4, 4], [7, 4, 1], // column 4
      [4, 0, 4], [5, 8, 6],            // flavor
    ],
    steps: [
      {
        kind: 'info',
        text:
          'When no single move is obvious, strong players write small pencil marks: every digit a cell could still be. Look at the highlighted cell in the top row — let’s work out its candidates together.',
        highlight: { cells: [[0, 4]], units: [row(0), col(4), box(1)] },
      },
      {
        kind: 'pick-digits',
        text:
          'Its row removes 5, 3 and 2. Its column removes 9, 4 and 1. Its box holds only the 9 and 4 you’ve already counted, so it adds nothing new. Select ALL the digits that can still go in this cell, then press Check.',
        cell: [0, 4],
        answers: [6, 7, 8],
        highlight: { cells: [[0, 4]], units: [row(0), col(4), box(1)] },
        hint: 'Cross off 5, 3, 2 (row) and 9, 4, 1 (column) from 1–9. Three digits survive.',
        success:
          'Exactly: 6, 7 and 8 are this cell’s candidates. In the game, use Notes mode (N) to record them.',
      },
      {
        kind: 'info',
        text:
          'Pencil marks pay off as the puzzle evolves. Suppose a 6 now lands in the same column…',
        reveal: [[3, 4, 6]],
        highlight: { cells: [[3, 4], [0, 4]], units: [col(4)] },
        notes: [{ cell: [0, 4], digits: [6, 7, 8], eliminated: [6] }],
      },
      {
        kind: 'info',
        text:
          'You simply erase the 6 from your notes, leaving 6̶ 7 8. One more elimination and this cell becomes a Naked Single — for free. Keep your notes tidy and the puzzle solves itself piece by piece.',
        highlight: { cells: [[0, 4]] },
        notes: [{ cell: [0, 4], digits: [7, 8] }],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // 7. NAKED PAIR
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'naked-pair',
    title: 'Naked Pair',
    tagline: 'Two cells claim two digits',
    level: 'Intermediate',
    summary:
      'If two cells in a unit share the exact same two candidates, those digits belong to them — erase them everywhere else in the unit.',
    givens: [
      [0, 0, 5], [0, 1, 3], [0, 2, 4], [0, 6, 9], [0, 7, 1], [0, 8, 2], // row 0
      [3, 4, 6], [8, 5, 6], // the 6s that trim the pair cells
      [4, 0, 4], [5, 8, 6], // flavor
    ],
    steps: [
      {
        kind: 'info',
        text:
          'The top row has three empty cells, missing 6, 7 and 8 — so each starts with the Pencil Marks 6·7·8. But look down the columns: the two highlighted 6s rule the 6 out of the middle and right empty cells, trimming them to just 7·8.',
        highlight: { cells: [[3, 4], [8, 5]], units: [row(0), col(4), col(5)] },
        notes: [
          { cell: [0, 3], digits: [6, 7, 8] },
          { cell: [0, 4], digits: [6, 7, 8], eliminated: [6] },
          { cell: [0, 5], digits: [6, 7, 8], eliminated: [6] },
        ],
      },
      {
        kind: 'info',
        text:
          'Two cells, and together they only allow the two digits 7 and 8. That’s a Naked Pair. One of them WILL be 7 and the other WILL be 8 — we don’t know which yet, but it doesn’t matter: between them, they use up both digits for the whole row.',
        highlight: { cells: [[0, 4], [0, 5]], units: [row(0)], dimOthers: true },
        notes: [
          { cell: [0, 4], digits: [7, 8] },
          { cell: [0, 5], digits: [7, 8] },
        ],
      },
      {
        kind: 'info',
        text:
          'So 7 and 8 can be erased from every OTHER cell of the row. The first empty cell loses its 7 and its 8…',
        highlight: { cells: [[0, 3]], units: [row(0)] },
        notes: [
          { cell: [0, 3], digits: [6, 7, 8], eliminated: [7, 8] },
          { cell: [0, 4], digits: [7, 8] },
          { cell: [0, 5], digits: [7, 8] },
        ],
      },
      {
        kind: 'pick-digit',
        text: '…which leaves it just one candidate — a Naked Single. Place it!',
        cell: [0, 3],
        answer: 6,
        highlight: { cells: [[0, 3]], units: [row(0)] },
        notes: [
          { cell: [0, 3], digits: [6], eliminated: [] },
          { cell: [0, 4], digits: [7, 8] },
          { cell: [0, 5], digits: [7, 8] },
        ],
        hint: 'Its candidates were 6, 7, 8 — and the pair just claimed 7 and 8.',
        success:
          'The Naked Pair never told us where the 7 or 8 goes — it eliminated them elsewhere, and the elimination solved a different cell. Most advanced techniques work exactly like this: eliminate first, solve second.',
      },
      {
        kind: 'info',
        text:
          'Naked Pairs work in rows, columns and boxes alike — and the idea extends to Naked Triples (three cells sharing three candidates) and beyond.',
        highlight: { cells: [[0, 4], [0, 5]] },
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // 8. POINTING PAIR (BOX–LINE REDUCTION)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'pointing-pair',
    title: 'Pointing Pair',
    tagline: 'The box points the way',
    level: 'Intermediate',
    summary:
      'If all of a digit’s possible spots in a box sit on one line, the digit must be on that line inside the box — erase it from the rest of the line.',
    givens: [
      // Box 6: rows 6 and 8 fully given, row 7 of the box empty
      [6, 0, 9], [6, 1, 6], [6, 2, 1],
      [8, 0, 3], [8, 1, 4], [8, 2, 5],
      // The 2 that blocks column 2 of the box
      [1, 2, 2],
      // Row 7 right side & supporting cells
      [7, 3, 4], [7, 5, 9], [7, 6, 6], [7, 7, 3],
      [0, 4, 7], [4, 4, 5], [8, 4, 8],
      [6, 3, 5], [6, 4, 3],
    ],
    steps: [
      {
        kind: 'info',
        text:
          'Look at the bottom-left box. It’s missing 2, 7 and 8, with three empty cells — all in its middle row. Start with the cross-hatching question from Hidden Single — Box: where can the 2 go inside this box?',
        highlight: { units: [box(6)] },
      },
      {
        kind: 'info',
        text:
          'The 2 high up in column 3 blocks the rightmost of the three empty cells. That leaves only TWO spots for the box’s 2 — and notice: both sit in the same row.',
        highlight: { cells: [[1, 2]], units: [col(2), box(6)] },
        notes: [
          { cell: [7, 0], digits: [2, 7, 8] },
          { cell: [7, 1], digits: [2, 7, 8] },
          { cell: [7, 2], digits: [2, 7, 8], eliminated: [2] },
        ],
      },
      {
        kind: 'info',
        text:
          'Before we use that, apply the Pencil Marks routine to the row’s two empty cells OUTSIDE the box. The middle one sees 4, 9, 6 and 3 in its row, plus 7, 5, 3 and 8 in its column — that rules out everything except 1 and 2. The cell at the end of the row sees fewer digits, so it keeps 1, 2, 5, 7 and 8.',
        highlight: { cells: [[7, 4], [7, 8]], units: [row(7), col(4)] },
        notes: [
          { cell: [7, 0], digits: [2, 7, 8] },
          { cell: [7, 1], digits: [2, 7, 8] },
          { cell: [7, 4], digits: [1, 2] },
          { cell: [7, 8], digits: [1, 2, 5, 7, 8] },
        ],
      },
      {
        kind: 'info',
        text:
          'Now the pointing pair strikes. We don’t know WHICH of the two box cells holds the 2 — but either way, the 2 of this row lands inside the box. So the 2 can be erased from every row cell outside the box: both pencil-marked cells lose their 2. The pair “points” along the row.',
        highlight: { cells: [[7, 0], [7, 1]], units: [row(7)] },
        notes: [
          { cell: [7, 0], digits: [2, 7, 8] },
          { cell: [7, 1], digits: [2, 7, 8] },
          { cell: [7, 4], digits: [1, 2], eliminated: [2] },
          { cell: [7, 8], digits: [1, 2, 5, 7, 8], eliminated: [2] },
        ],
      },
      {
        kind: 'find-cell',
        text:
          'One of those two cells had only 1 and 2 — and we just erased its 2. Tap the cell that is now solved.',
        target: [7, 4],
        highlight: { units: [row(7)] },
        notes: [
          { cell: [7, 0], digits: [2, 7, 8] },
          { cell: [7, 1], digits: [2, 7, 8] },
          { cell: [7, 4], digits: [1, 2], eliminated: [2] },
          { cell: [7, 8], digits: [1, 2, 5, 7, 8], eliminated: [2] },
        ],
        hint: 'Look along the row, outside the box, for the cell whose pencil marks just dropped to a single digit.',
        success: 'That’s it — its 2 was eliminated by the pointing pair, leaving a Naked Single: only the 1 remains.',
      },
      {
        kind: 'pick-digit',
        text: 'Place its last remaining candidate.',
        cell: [7, 4],
        answer: 1,
        highlight: { cells: [[7, 4]], units: [row(7)] },
        notes: [{ cell: [7, 4], digits: [1] }],
        hint: 'Its candidates were 1 and 2; the 2 is gone.',
        success:
          'Pointing pairs (and triples) flow from box to line. The mirror move — a digit confined to one box within a row/column eliminates it from the rest of the box — is called Box–Line Reduction. Same logic, opposite direction.',
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // 9. X-WING
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'x-wing',
    title: 'X-Wing',
    tagline: 'Four corners, one X',
    level: 'Advanced',
    summary:
      'When a digit fits only the same two columns in two different rows, it’s locked into that rectangle — erase it from those columns everywhere else.',
    givens: [
      // Row 1: only (1,4) and (1,8) empty (missing 9 and 8)
      [1, 0, 6], [1, 1, 7], [1, 2, 2], [1, 3, 1], [1, 5, 5], [1, 6, 3], [1, 7, 4],
      // Row 8: only (8,4) and (8,8) empty (missing 8 and 9)
      [8, 0, 3], [8, 1, 4], [8, 2, 5], [8, 3, 2], [8, 5, 6], [8, 6, 1], [8, 7, 7],
      // Row 4: only (4,7) and (4,8) empty (missing 9 and 1)
      [4, 0, 4], [4, 1, 2], [4, 2, 6], [4, 3, 8], [4, 4, 5], [4, 5, 3], [4, 6, 7],
      // Flavor
      [2, 0, 1], [3, 3, 7], [5, 2, 3],
    ],
    steps: [
      {
        kind: 'info',
        text:
          'The expert move. Watch the digit 9. Row 2 is filled except for two cells, so their Pencil Marks are the row’s two missing digits: 8 and 9 — meaning row 2’s 9 must be in one of those two cells. The same is true in row 9: its 9 fits only its own two empty cells.',
        highlight: {
          cells: [[1, 4], [1, 8], [8, 4], [8, 8]],
          units: [row(1), row(8)],
        },
        notes: [
          { cell: [1, 4], digits: [8, 9] },
          { cell: [1, 8], digits: [8, 9] },
          { cell: [8, 4], digits: [8, 9] },
          { cell: [8, 8], digits: [8, 9] },
        ],
      },
      {
        kind: 'info',
        text:
          'Here’s the magic: those four cells line up in the SAME two columns, forming a rectangle. Each of the two rows takes one 9 — one on the left column, one on the right (one diagonal of an “X”). Either way, BOTH columns receive their 9 inside the rectangle.',
        highlight: {
          cells: [[1, 4], [1, 8], [8, 4], [8, 8]],
          units: [col(4), col(8)],
          dimOthers: true,
        },
      },
      {
        kind: 'info',
        text:
          'So 9 can be erased from every other cell of those two columns. Follow the right-hand column into the middle row: that row is filled except for its last two cells, whose only missing digits are 1 and 9. So this cell’s pencil marks were 1 and 9 — and the 9 just vanished.',
        highlight: { cells: [[4, 8]], units: [col(8), row(4)] },
        notes: [
          { cell: [1, 8], digits: [8, 9] },
          { cell: [8, 8], digits: [8, 9] },
          { cell: [4, 7], digits: [1, 9] },
          { cell: [4, 8], digits: [1, 9], eliminated: [9] },
        ],
      },
      {
        kind: 'pick-digit',
        text: 'The X-Wing eliminated the 9, leaving a Naked Single. Solve the cell!',
        cell: [4, 8],
        answer: 1,
        highlight: { cells: [[4, 8]], units: [col(8)] },
        notes: [{ cell: [4, 8], digits: [1] }],
        hint: 'Its candidates were 1 and 9, and the X-Wing removed the 9.',
        success:
          'You just executed an X-Wing — a technique many players never learn! It also works with columns as the base (eliminating along rows), and bigger siblings exist: Swordfish (3 rows) and Jellyfish (4 rows).',
      },
      {
        kind: 'info',
        text:
          'You’ve completed the full course — from Last Free Cell to X-Wing. These nine techniques will carry you through almost any Hard puzzle. Now put them to work in a real game!',
        highlight: { cells: [[1, 4], [1, 8], [8, 4], [8, 8]] },
      },
    ],
  },
];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find(l => l.id === id);
}

const PROGRESS_KEY = 'sudoku-tutorial-done';

export function loadCompletedLessons(): Set<string> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

export function markLessonCompleted(id: string): void {
  try {
    const done = loadCompletedLessons();
    done.add(id);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(done)));
  } catch {
    // ignore storage errors
  }
}
