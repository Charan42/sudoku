import { Digit, RawGrid } from './types';

function cloneGrid(g: RawGrid): RawGrid { return g.map(r => [...r]); }

function candidates(grid: RawGrid, row: number, col: number): Digit[] {
  const used = new Set<number>();
  for (let i = 0; i < 9; i++) {
    if (grid[row][i]) used.add(grid[row][i]!);
    if (grid[i][col]) used.add(grid[i][col]!);
  }
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (grid[r][c]) used.add(grid[r][c]!);
  return ([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]).filter(d => !used.has(d));
}

function nextEmpty(grid: RawGrid): [number, number] | null {
  let br = -1, bc = -1, best = 10;
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (grid[r][c] === null) {
        const n = candidates(grid, r, c).length;
        if (n < best) { best = n; br = r; bc = c; }
      }
  return br === -1 ? null : [br, bc];
}

// a grid with a duplicate in any row/column/box can never be completed
function hasConflict(grid: RawGrid): boolean {
  for (let i = 0; i < 9; i++) {
    const row = new Set<number>(), col = new Set<number>(), box = new Set<number>();
    for (let j = 0; j < 9; j++) {
      const rv = grid[i][j];
      if (rv) { if (row.has(rv)) return true; row.add(rv); }
      const cv = grid[j][i];
      if (cv) { if (col.has(cv)) return true; col.add(cv); }
      const br = Math.floor(i / 3) * 3 + Math.floor(j / 3);
      const bc = (i % 3) * 3 + (j % 3);
      const bv = grid[br][bc];
      if (bv) { if (box.has(bv)) return true; box.add(bv); }
    }
  }
  return false;
}

function search(grid: RawGrid, shuffle: boolean): RawGrid | null {
  const cell = nextEmpty(grid);
  if (!cell) return grid;
  const [r, c] = cell;
  let digits = candidates(grid, r, c);
  if (shuffle) digits = digits.sort(() => Math.random() - 0.5);
  for (const d of digits) {
    const next = cloneGrid(grid); next[r][c] = d;
    const result = search(next, shuffle);
    if (result) return result;
  }
  return null;
}

export function solve(grid: RawGrid, shuffle = false): RawGrid | null {
  if (hasConflict(grid)) return null;
  return search(grid, shuffle);
}

function countSearch(grid: RawGrid, limit: number): number {
  const cell = nextEmpty(grid);
  if (!cell) return 1;
  const [r, c] = cell;
  let count = 0;
  for (const d of candidates(grid, r, c)) {
    const next = cloneGrid(grid); next[r][c] = d;
    count += countSearch(next, limit);
    if (count >= limit) return count;
  }
  return count;
}

// count solutions up to `limit` (use 2 for uniqueness check)
export function countSolutions(grid: RawGrid, limit = 2): number {
  if (hasConflict(grid)) return 0;
  return countSearch(grid, limit);
}
