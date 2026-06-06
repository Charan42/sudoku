export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CellValue = Digit | null;
export type RawGrid = CellValue[][];
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface CellState {
  value: CellValue;
  given: boolean;            // pre-filled clue, cannot be edited
  notes: Set<Digit>;         // pencil marks
}

export type Board = CellState[][];
