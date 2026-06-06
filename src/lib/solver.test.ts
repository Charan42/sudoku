import { describe, it, expect } from 'vitest';
import { solve, countSolutions } from './solver';
import type { RawGrid } from './types';

// A well-known valid Sudoku puzzle
const PUZZLE: RawGrid = [
  [5, 3, null, null, 7, null, null, null, null],
  [6, null, null, 1, 9, 5, null, null, null],
  [null, 9, 8, null, null, null, null, 6, null],
  [8, null, null, null, 6, null, null, null, 3],
  [4, null, null, 8, null, 3, null, null, 1],
  [7, null, null, null, 2, null, null, null, 6],
  [null, 6, null, null, null, null, 2, 8, null],
  [null, null, null, 4, 1, 9, null, null, 5],
  [null, null, null, null, 8, null, null, 7, 9],
];

const EXPECTED_SOLUTION: RawGrid = [
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

describe('solver', () => {
  it('solves a valid puzzle', () => {
    const solution = solve(PUZZLE);
    expect(solution).not.toBeNull();
    expect(solution!.every(row => row.every(v => v !== null))).toBe(true);
    expect(solution).toEqual(EXPECTED_SOLUTION);
  });

  it('returns null for unsolvable puzzle', () => {
    const grid: RawGrid = Array(9).fill(null).map(() => Array(9).fill(null));
    grid[0][0] = 1; grid[0][1] = 1;
    expect(solve(grid)).toBeNull();
  });

  it('counts solutions correctly', () => {
    const empty: RawGrid = Array(9).fill(null).map(() => Array(9).fill(null));
    expect(countSolutions(empty, 2)).toBeGreaterThanOrEqual(2);
  });

  it('counts exactly 1 solution for our test puzzle', () => {
    expect(countSolutions(PUZZLE, 2)).toBe(1);
  });
});
