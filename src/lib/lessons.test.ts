import { describe, it, expect } from 'vitest';
import { Digit, RawGrid } from './types';
import {
  LESSONS,
  REFERENCE_SOLUTION,
  buildBoard,
  boxIndex,
  getLesson,
  GivenSpec,
  Step,
} from './lessons';

/** Candidates for a cell given the current grid (row/col/box eliminations). */
function candidates(grid: RawGrid, row: number, col: number): Digit[] {
  const used = new Set<number>();
  for (let i = 0; i < 9; i++) {
    if (grid[row][i]) used.add(grid[row][i]!);
    if (grid[i][col]) used.add(grid[i][col]!);
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (grid[r][c]) used.add(grid[r][c]!);
  return ([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]).filter(d => !used.has(d));
}

/** Empty cells of a unit where `digit` is still a candidate. */
function digitSpotsInCells(
  grid: RawGrid,
  cells: [number, number][],
  digit: Digit
): [number, number][] {
  return cells.filter(
    ([r, c]) => grid[r][c] === null && candidates(grid, r, c).includes(digit)
  );
}

function boxCells(box: number): [number, number][] {
  const br = Math.floor(box / 3) * 3;
  const bc = (box % 3) * 3;
  const cells: [number, number][] = [];
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++) cells.push([r, c]);
  return cells;
}

function rowCells(row: number): [number, number][] {
  return Array.from({ length: 9 }, (_, c) => [row, c] as [number, number]);
}

/** Board including reveals from info steps. */
function fullBoard(givens: GivenSpec[], steps: Step[]): RawGrid {
  const all: GivenSpec[] = [...givens];
  for (const s of steps) {
    if (s.kind === 'info' && s.reveal) all.push(...s.reveal);
  }
  return buildBoard(all);
}

describe('reference solution', () => {
  it('is a valid completed sudoku', () => {
    const all = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (let i = 0; i < 9; i++) {
      expect(new Set(REFERENCE_SOLUTION[i])).toEqual(all);
      expect(new Set(REFERENCE_SOLUTION.map(r => r[i]))).toEqual(all);
      expect(new Set(boxCells(i).map(([r, c]) => REFERENCE_SOLUTION[r][c]))).toEqual(all);
    }
  });
});

describe('all lessons: structural soundness', () => {
  for (const lesson of LESSONS) {
    describe(lesson.id, () => {
      it('has every given (and reveal) matching the reference solution', () => {
        const specs: GivenSpec[] = [...lesson.givens];
        for (const s of lesson.steps) {
          if (s.kind === 'info' && s.reveal) specs.push(...s.reveal);
        }
        for (const [r, c, d] of specs) {
          expect(REFERENCE_SOLUTION[r][c], `given at (${r},${c})`).toBe(d);
        }
      });

      it('has no duplicate cells among givens and reveals', () => {
        const specs: GivenSpec[] = [...lesson.givens];
        for (const s of lesson.steps) {
          if (s.kind === 'info' && s.reveal) specs.push(...s.reveal);
        }
        const keys = specs.map(([r, c]) => `${r},${c}`);
        expect(new Set(keys).size).toBe(keys.length);
      });

      it('asks about cells that are empty, with the true solution digit as answer', () => {
        const board = fullBoard(lesson.givens, lesson.steps);
        for (const s of lesson.steps) {
          if (s.kind === 'find-cell') {
            const [r, c] = s.target;
            expect(board[r][c], `find-cell target (${r},${c})`).toBeNull();
          }
          if (s.kind === 'pick-digit') {
            const [r, c] = s.cell;
            expect(board[r][c], `pick-digit cell (${r},${c})`).toBeNull();
            expect(s.answer).toBe(REFERENCE_SOLUTION[r][c]);
          }
          if (s.kind === 'pick-digits') {
            const [r, c] = s.cell;
            expect(board[r][c], `pick-digits cell (${r},${c})`).toBeNull();
            expect(s.answers).toContain(REFERENCE_SOLUTION[r][c]);
          }
        }
      });

      it('places every answer without conflicting with a visible digit', () => {
        const board = fullBoard(lesson.givens, lesson.steps);
        for (const s of lesson.steps) {
          if (s.kind === 'pick-digit') {
            const [r, c] = s.cell;
            expect(
              candidates(board, r, c),
              `answer ${s.answer} at (${r},${c})`
            ).toContain(s.answer);
          }
        }
      });
    });
  }
});

describe('lesson 1: last free cell in a box', () => {
  const lesson = getLesson('last-cell-box')!;
  const board = buildBoard(lesson.givens);

  it('box 0 has exactly one empty cell, at (1,1), and the missing digit is 7', () => {
    const empties = boxCells(0).filter(([r, c]) => board[r][c] === null);
    expect(empties).toEqual([[1, 1]]);
    expect(candidates(board, 1, 1)).toEqual([7]);
  });
});

describe('lesson 2: last free cell in a row and column', () => {
  const lesson = getLesson('last-cell-line')!;
  const board = buildBoard(lesson.givens);

  it('row 4 has exactly one empty cell, at (4,4), missing 5', () => {
    const empties = rowCells(4).filter(([r, c]) => board[r][c] === null);
    expect(empties).toEqual([[4, 4]]);
    const rowDigits = board[4].filter((v): v is Digit => v !== null);
    expect(new Set(rowDigits).size).toBe(8);
    expect(rowDigits.includes(5)).toBe(false);
  });

  it('column 2 has exactly one empty cell, at (6,2), missing 1', () => {
    const empties: [number, number][] = [];
    for (let r = 0; r < 9; r++) if (board[r][2] === null) empties.push([r, 2]);
    expect(empties).toEqual([[6, 2]]);
    const colDigits = board.map(r => r[2]).filter((v): v is Digit => v !== null);
    expect(new Set(colDigits).size).toBe(8);
    expect(colDigits.includes(1)).toBe(false);
  });
});

describe('lesson 3: naked single', () => {
  const lesson = getLesson('naked-single')!;
  const board = buildBoard(lesson.givens);

  it('cell (4,4) has exactly one candidate: 5', () => {
    expect(candidates(board, 4, 4)).toEqual([5]);
  });

  it('is not a trivial "last free cell" (no unit of the target has 8 givens)', () => {
    const filled = (cells: [number, number][]) =>
      cells.filter(([r, c]) => board[r][c] !== null).length;
    expect(filled(rowCells(4))).toBeLessThan(8);
    const colCellsList: [number, number][] = Array.from({ length: 9 }, (_, r) => [r, 4]);
    expect(filled(colCellsList)).toBeLessThan(8);
    expect(filled(boxCells(4))).toBeLessThan(8);
  });
});

describe('lesson 4: hidden single in a box', () => {
  const lesson = getLesson('hidden-single-box')!;
  const board = buildBoard(lesson.givens);

  it('digit 5 fits exactly one cell of box 0: (0,0)', () => {
    expect(digitSpotsInCells(board, boxCells(0), 5)).toEqual([[0, 0]]);
  });

  it('is hidden, not naked: (0,0) has more than one candidate', () => {
    expect(candidates(board, 0, 0).length).toBeGreaterThan(1);
  });
});

describe('lesson 5: hidden single in a row', () => {
  const lesson = getLesson('hidden-single-line')!;
  const board = buildBoard(lesson.givens);

  it('digit 8 fits exactly one cell of row 8: (8,4)', () => {
    expect(digitSpotsInCells(board, rowCells(8), 8)).toEqual([[8, 4]]);
  });

  it('is hidden, not naked: (8,4) has more than one candidate', () => {
    expect(candidates(board, 8, 4).length).toBeGreaterThan(1);
  });
});

describe('lesson 6: pencil marks', () => {
  const lesson = getLesson('candidates')!;

  it('cell (0,4) has candidates exactly {6,7,8} before the reveal', () => {
    const board = buildBoard(lesson.givens);
    expect(candidates(board, 0, 4)).toEqual([6, 7, 8]);
  });

  it('after the revealed 6 in the column, candidates shrink to {7,8}', () => {
    const board = fullBoard(lesson.givens, lesson.steps);
    expect(candidates(board, 0, 4)).toEqual([7, 8]);
  });
});

describe('lesson 7: naked pair', () => {
  const lesson = getLesson('naked-pair')!;
  const board = buildBoard(lesson.givens);

  it('pair cells (0,4) and (0,5) both have candidates exactly {7,8}', () => {
    expect(candidates(board, 0, 4)).toEqual([7, 8]);
    expect(candidates(board, 0, 5)).toEqual([7, 8]);
  });

  it('cell (0,3) has candidates {6,7,8}; removing the pair digits leaves 6', () => {
    expect(candidates(board, 0, 3)).toEqual([6, 7, 8]);
    const remaining = candidates(board, 0, 3).filter(d => d !== 7 && d !== 8);
    expect(remaining).toEqual([6]);
  });

  it('row 0 has exactly three empty cells', () => {
    expect(rowCells(0).filter(([r, c]) => board[r][c] === null)).toEqual([
      [0, 3],
      [0, 4],
      [0, 5],
    ]);
  });
});

describe('lesson 8: pointing pair', () => {
  const lesson = getLesson('pointing-pair')!;
  const board = buildBoard(lesson.givens);

  it('digit 2 fits exactly two cells of box 6, both in row 7', () => {
    const spots = digitSpotsInCells(board, boxCells(6), 2);
    expect(spots).toEqual([
      [7, 0],
      [7, 1],
    ]);
    expect(spots.every(([r]) => r === 7)).toBe(true);
  });

  it('payoff cell (7,4) has candidates {1,2}; the pointing pair leaves 1', () => {
    expect(candidates(board, 7, 4)).toEqual([1, 2]);
  });

  it('the derivation shown in the lesson matches the board', () => {
    // (7,4) sees 4,9,6,3 in its row and 7,5,3,8 in its column — only 1,2 left
    expect(board[7].filter(v => v !== null)).toEqual([4, 9, 6, 3]);
    expect(board.map(r => r[4]).filter(v => v !== null)).toEqual([7, 5, 3, 8]);
    // the other row cell outside the box keeps 1,2,5,7,8
    expect(candidates(board, 7, 8)).toEqual([1, 2, 5, 7, 8]);
    // and the box cell in column 2 has lost its 2 to the given 2 up the column
    expect(candidates(board, 7, 2)).toEqual([7, 8]);
  });

  it('needs the pointing pair: 1 is NOT a hidden single in row 7 or column 4 or box 7', () => {
    expect(digitSpotsInCells(board, rowCells(7), 1).length).toBeGreaterThan(1);
    const col4: [number, number][] = Array.from({ length: 9 }, (_, r) => [r, 4]);
    expect(digitSpotsInCells(board, col4, 1).length).toBeGreaterThan(1);
    expect(digitSpotsInCells(board, boxCells(7), 1).length).toBeGreaterThan(1);
  });
});

describe('lesson 9: x-wing', () => {
  const lesson = getLesson('x-wing')!;
  const board = buildBoard(lesson.givens);

  it('digit 9 fits only columns 4 and 8 in rows 1 and 8 (the rectangle)', () => {
    expect(digitSpotsInCells(board, rowCells(1), 9)).toEqual([
      [1, 4],
      [1, 8],
    ]);
    expect(digitSpotsInCells(board, rowCells(8), 9)).toEqual([
      [8, 4],
      [8, 8],
    ]);
  });

  it('all four rectangle cells show pencil marks {8,9}', () => {
    for (const [r, c] of [[1, 4], [1, 8], [8, 4], [8, 8]] as [number, number][]) {
      expect(candidates(board, r, c), `cell (${r},${c})`).toEqual([8, 9]);
    }
  });

  it('payoff cell (4,8) has candidates {1,9}; the x-wing elimination leaves 1', () => {
    expect(candidates(board, 4, 8)).toEqual([1, 9]);
    // as the lesson explains: row 4 is filled except its last two cells
    expect(board[4].filter(v => v !== null)).toEqual([4, 2, 6, 8, 5, 3, 7]);
    expect(candidates(board, 4, 7)).toEqual([1, 9]);
  });

  it('needs the x-wing: simple scans cannot remove 9 from (4,8)', () => {
    // 9 still fits multiple cells of row 4, column 8 and box 5,
    // so no naked/hidden single resolves (4,8) directly.
    expect(digitSpotsInCells(board, rowCells(4), 9).length).toBeGreaterThan(1);
    const col8: [number, number][] = Array.from({ length: 9 }, (_, r) => [r, 8]);
    expect(digitSpotsInCells(board, col8, 9).length).toBeGreaterThan(2);
    expect(digitSpotsInCells(board, boxCells(5), 9).length).toBeGreaterThan(1);
    // and 1 is not a hidden single in any unit of (4,8)
    expect(digitSpotsInCells(board, rowCells(4), 1).length).toBeGreaterThan(1);
    expect(digitSpotsInCells(board, col8, 1).length).toBeGreaterThan(1);
    expect(digitSpotsInCells(board, boxCells(5), 1).length).toBeGreaterThan(1);
  });
});

describe('lesson catalogue', () => {
  it('contains nine lessons with unique ids', () => {
    expect(LESSONS.length).toBe(9);
    expect(new Set(LESSONS.map(l => l.id)).size).toBe(9);
  });

  it('highlights and notes reference valid coordinates and digits', () => {
    for (const lesson of LESSONS) {
      for (const step of lesson.steps) {
        for (const [r, c] of step.highlight?.cells ?? []) {
          expect(r).toBeGreaterThanOrEqual(0);
          expect(r).toBeLessThan(9);
          expect(c).toBeGreaterThanOrEqual(0);
          expect(c).toBeLessThan(9);
        }
        for (const u of step.highlight?.units ?? []) {
          expect(u.index).toBeGreaterThanOrEqual(0);
          expect(u.index).toBeLessThan(9);
        }
        for (const note of step.notes ?? []) {
          const [r, c] = note.cell;
          expect(boxIndex(r, c)).toBeGreaterThanOrEqual(0);
          for (const d of note.eliminated ?? []) {
            expect(note.digits).toContain(d);
          }
        }
      }
    }
  });

  it('note pencil marks never contradict a visible digit (except just-eliminated ones)', () => {
    for (const lesson of LESSONS) {
      // Use the pre-reveal board for early steps: notes must at least be a
      // subset of candidates computed from the initial givens.
      const board = buildBoard(lesson.givens);
      for (const step of lesson.steps) {
        for (const note of step.notes ?? []) {
          const [r, c] = note.cell;
          if (board[r][c] !== null) continue; // cell gets filled mid-lesson
          const cand = candidates(board, r, c);
          const struck = new Set(note.eliminated ?? []);
          for (const d of note.digits) {
            // Struck digits are shown precisely because they were eliminated,
            // so only the surviving pencil marks must be real candidates.
            if (struck.has(d)) continue;
            expect(cand, `${lesson.id} note ${d} at (${r},${c})`).toContain(d);
          }
        }
      }
    }
  });
});
