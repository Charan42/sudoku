import { CellValue, Difficulty, RawGrid } from './types';
import { solve, countSolutions } from './solver';

const CLUES: Record<Difficulty, number> = {
  easy: 36, medium: 30, hard: 25, expert: 22,
};

function emptyGrid(): RawGrid {
  return Array(9).fill(null).map(() => Array<CellValue>(9).fill(null));
}

function generateSolution(): RawGrid {
  return solve(emptyGrid(), true)!;
}

function digPuzzle(solution: RawGrid, clues: number): RawGrid {
  const puzzle = solution.map(r => [...r]) as RawGrid;
  const positions = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5);
  let removed = 0;
  for (const pos of positions) {
    if (removed >= 81 - clues) break;
    const r = Math.floor(pos / 9), c = pos % 9;
    const backup = puzzle[r][c];
    puzzle[r][c] = null;
    if (countSolutions(puzzle, 2) !== 1) puzzle[r][c] = backup;
    else removed++;
  }
  return puzzle;
}

export function generate(difficulty: Difficulty): { puzzle: RawGrid; solution: RawGrid } {
  const solution = generateSolution();
  const puzzle = digPuzzle(solution, CLUES[difficulty]);
  return { puzzle, solution };
}

export function puzzleToString(grid: RawGrid): string {
  return grid.flat().map(v => v ?? '0').join('');
}

export function stringToPuzzle(s: string): RawGrid | null {
  if (!/^[0-9]{81}$/.test(s)) return null;
  const flat = s.split('').map(Number) as (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
  const grid: RawGrid = [];
  for (let r = 0; r < 9; r++)
    grid.push(flat.slice(r * 9, r * 9 + 9).map(v => v === 0 ? null : v as CellValue));
  return grid;
}
