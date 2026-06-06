import { useReducer, useEffect, useMemo, useRef } from 'react';
import { Board, CellState, Difficulty, Digit, RawGrid } from '../lib/types';
import { generate, puzzleToString, stringToPuzzle } from '../lib/generator';
import { solve } from '../lib/solver';
import { computeErrorCells, getPeerKeys } from '../lib/validator';
import { useTimer } from './useTimer';

interface GameState {
  cells: Board;
  solution: RawGrid;
  difficulty: Difficulty;
  selected: [number, number] | null;
  notesMode: boolean;
  mistakes: number;
  maxMistakes: number;
  isPaused: boolean;
  isComplete: boolean;
  isGameOver: boolean;
  past: Board[];
  future: Board[];
  theme: 'light' | 'dark';
  generating: boolean;
  timerKey: number;
}

type Action =
  | { type: 'NEW_GAME'; difficulty: Difficulty }
  | { type: 'LOAD_GAME'; state: Partial<GameState> }
  | { type: 'SET_GENERATING'; cells: Board; solution: RawGrid; difficulty: Difficulty }
  | { type: 'SELECT'; row: number; col: number }
  | { type: 'DESELECT' }
  | { type: 'INPUT'; digit: Digit | null }
  | { type: 'TOGGLE_NOTES' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'HINT' }
  | { type: 'TOGGLE_THEME' };

function emptyBoard(): Board {
  return Array(9)
    .fill(null)
    .map(() =>
      Array(9)
        .fill(null)
        .map(() => ({ value: null, given: false, notes: new Set<Digit>() }))
    );
}

function puzzleToBoard(puzzle: RawGrid): Board {
  return puzzle.map(row =>
    row.map(v => ({
      value: v,
      given: v !== null,
      notes: new Set<Digit>(),
    }))
  );
}

function cloneBoard(board: Board): Board {
  return board.map(row =>
    row.map(cell => ({
      ...cell,
      notes: new Set(cell.notes),
    }))
  );
}

function checkComplete(cells: Board, solution: RawGrid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (cells[r][c].value !== solution[r][c]) return false;
    }
  }
  return true;
}

const initialState: GameState = {
  cells: emptyBoard(),
  solution: Array(9).fill(Array(9).fill(null)),
  difficulty: 'medium',
  selected: null,
  notesMode: false,
  mistakes: 0,
  maxMistakes: 3,
  isPaused: false,
  isComplete: false,
  isGameOver: false,
  past: [],
  future: [],
  theme: 'light',
  generating: false,
  timerKey: 0,
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'NEW_GAME': {
      const { puzzle, solution } = generate(action.difficulty);
      const cells = puzzleToBoard(puzzle);
      return {
        ...state,
        cells,
        solution,
        difficulty: action.difficulty,
        selected: null,
        notesMode: false,
        mistakes: 0,
        isPaused: false,
        isComplete: false,
        isGameOver: false,
        past: [],
        future: [],
        generating: false,
        timerKey: state.timerKey + 1,
      };
    }

    case 'LOAD_GAME': {
      return { ...state, ...action.state };
    }

    case 'SET_GENERATING': {
      return {
        ...state,
        cells: action.cells,
        solution: action.solution,
        difficulty: action.difficulty,
        selected: null,
        notesMode: false,
        mistakes: 0,
        isPaused: false,
        isComplete: false,
        isGameOver: false,
        past: [],
        future: [],
        generating: false,
        timerKey: state.timerKey + 1,
      };
    }

    case 'SELECT': {
      return { ...state, selected: [action.row, action.col] };
    }

    case 'DESELECT': {
      return { ...state, selected: null };
    }

    case 'INPUT': {
      if (!state.selected || state.isPaused || state.isComplete || state.isGameOver)
        return state;
      const [r, c] = state.selected;
      const cell = state.cells[r][c];
      if (cell.given) return state;

      const newPast = [...state.past.slice(-49), state.cells];
      const newCells = cloneBoard(state.cells);

      if (state.notesMode) {
        if (action.digit === null) {
          newCells[r][c].notes = new Set<Digit>();
        } else {
          const notes = new Set(newCells[r][c].notes);
          if (notes.has(action.digit)) {
            notes.delete(action.digit);
          } else {
            notes.add(action.digit);
          }
          newCells[r][c].notes = notes;
        }
        return {
          ...state,
          cells: newCells,
          past: newPast,
          future: [],
        };
      } else {
        if (action.digit === null) {
          newCells[r][c].value = null;
          newCells[r][c].notes = new Set<Digit>();
        } else {
          newCells[r][c].value = action.digit;
          newCells[r][c].notes = new Set<Digit>();
        }

        let newMistakes = state.mistakes;
        if (action.digit !== null && action.digit !== state.solution[r][c]) {
          newMistakes = state.mistakes + 1;
        }

        const isGameOver = newMistakes >= state.maxMistakes;
        const isComplete = !isGameOver && checkComplete(newCells, state.solution);

        return {
          ...state,
          cells: newCells,
          past: newPast,
          future: [],
          mistakes: newMistakes,
          isGameOver,
          isComplete,
        };
      }
    }

    case 'TOGGLE_NOTES': {
      return { ...state, notesMode: !state.notesMode };
    }

    case 'UNDO': {
      if (state.past.length === 0) return state;
      const newPast = [...state.past];
      const prev = newPast.pop()!;
      return {
        ...state,
        cells: prev,
        past: newPast,
        future: [state.cells, ...state.future],
        isComplete: false,
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;
      const [next, ...restFuture] = state.future;
      const isComplete = checkComplete(next, state.solution);
      return {
        ...state,
        cells: next,
        past: [...state.past.slice(-49), state.cells],
        future: restFuture,
        isComplete,
      };
    }

    case 'TOGGLE_PAUSE': {
      return { ...state, isPaused: !state.isPaused };
    }

    case 'HINT': {
      if (state.isComplete || state.isGameOver || state.isPaused) return state;
      const emptyCells: [number, number][] = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!state.cells[r][c].given && state.cells[r][c].value === null) {
            emptyCells.push([r, c]);
          }
        }
      }
      if (emptyCells.length === 0) return state;

      const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const newPast = [...state.past.slice(-49), state.cells];
      const newCells = cloneBoard(state.cells);
      newCells[r][c].value = state.solution[r][c] as Digit;
      newCells[r][c].notes = new Set<Digit>();

      const isComplete = checkComplete(newCells, state.solution);

      return {
        ...state,
        cells: newCells,
        past: newPast,
        future: [],
        isComplete,
      };
    }

    case 'TOGGLE_THEME': {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = newTheme;
      return { ...state, theme: newTheme };
    }

    default:
      return state;
  }
}

// Serialize board for localStorage (Set -> Array)
function serializeBoard(board: Board): unknown {
  return board.map(row =>
    row.map(cell => ({
      value: cell.value,
      given: cell.given,
      notes: Array.from(cell.notes),
    }))
  );
}

// Deserialize board from localStorage (Array -> Set)
function deserializeBoard(data: unknown): Board | null {
  if (!Array.isArray(data) || data.length !== 9) return null;
  try {
    return (data as unknown[][]).map(row =>
      (row as unknown[]).map(cellData => {
        const c = cellData as { value: number | null; given: boolean; notes: number[] };
        return {
          value: c.value as Digit | null,
          given: c.given,
          notes: new Set<Digit>(c.notes as Digit[]),
        } as CellState;
      })
    );
  } catch {
    return null;
  }
}

function loadFromStorage(): Partial<GameState> | null {
  try {
    const raw = localStorage.getItem('sudoku-state');
    if (!raw) return null;
    const data = JSON.parse(raw) as {
      cells: unknown;
      solution: RawGrid;
      difficulty: Difficulty;
      mistakes: number;
      theme: 'light' | 'dark';
    };
    const cells = deserializeBoard(data.cells);
    if (!cells) return null;
    return {
      cells,
      solution: data.solution,
      difficulty: data.difficulty,
      mistakes: data.mistakes,
      theme: data.theme,
    };
  } catch {
    return null;
  }
}

export function shareUrl(puzzle: RawGrid): string {
  const p = puzzleToString(puzzle);
  const url = new URL(window.location.href);
  url.searchParams.set('p', p);
  return url.toString();
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);

  // On mount: restore from localStorage or URL param
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Check URL param first
    const params = new URLSearchParams(window.location.search);
    const pParam = params.get('p');
    if (pParam) {
      const puzzle = stringToPuzzle(pParam);
      if (puzzle) {
        const solution = solve(puzzle);
        if (solution) {
          const cells = puzzleToBoard(puzzle);
          dispatch({
            type: 'SET_GENERATING',
            cells,
            solution,
            difficulty: 'medium',
          });
          return;
        }
      }
    }

    // Try localStorage
    const saved = loadFromStorage();
    if (saved) {
      dispatch({ type: 'LOAD_GAME', state: saved });
      if (saved.theme) {
        document.documentElement.dataset.theme = saved.theme;
      }
    } else {
      // Start a new game
      dispatch({ type: 'NEW_GAME', difficulty: 'medium' });
    }
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    if (!initialized.current) return;
    try {
      const toSave = {
        cells: serializeBoard(state.cells),
        solution: state.solution,
        difficulty: state.difficulty,
        mistakes: state.mistakes,
        theme: state.theme,
      };
      localStorage.setItem('sudoku-state', JSON.stringify(toSave));
    } catch {
      // ignore storage errors
    }
  }, [state.cells, state.solution, state.difficulty, state.mistakes, state.theme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  const timer = useTimer(!state.isPaused && !state.isComplete && !state.isGameOver);

  // Reset timer when timerKey changes
  const prevTimerKey = useRef(state.timerKey);
  useEffect(() => {
    if (prevTimerKey.current !== state.timerKey) {
      prevTimerKey.current = state.timerKey;
      timer.reset();
    }
  }, [state.timerKey, timer]);

  const errorCells = useMemo(() => computeErrorCells(state.cells), [state.cells]);

  const peerKeys = useMemo(() => {
    if (!state.selected) return new Set<string>();
    return getPeerKeys(state.selected[0], state.selected[1]);
  }, [state.selected]);

  const sameValueKeys = useMemo(() => {
    if (!state.selected) return new Set<string>();
    const [r, c] = state.selected;
    const val = state.cells[r]?.[c]?.value;
    if (!val) return new Set<string>();
    const keys = new Set<string>();
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (row === r && col === c) continue;
        if (state.cells[row][col].value === val) keys.add(`${row},${col}`);
      }
    }
    return keys;
  }, [state.selected, state.cells]);

  const newGame = (d: Difficulty) => {
    dispatch({ type: 'NEW_GAME', difficulty: d });
  };

  const input = (digit: Digit | null) => {
    dispatch({ type: 'INPUT', digit });
  };

  const select = (r: number, c: number) => {
    dispatch({ type: 'SELECT', row: r, col: c });
  };

  const undo = () => dispatch({ type: 'UNDO' });
  const redo = () => dispatch({ type: 'REDO' });
  const hint = () => dispatch({ type: 'HINT' });
  const toggleNotes = () => dispatch({ type: 'TOGGLE_NOTES' });
  const togglePause = () => dispatch({ type: 'TOGGLE_PAUSE' });
  const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' });

  const getShareUrl = () => shareUrl(state.cells.map(row => row.map(c => c.value)));

  return {
    state,
    dispatch,
    errorCells,
    peerKeys,
    sameValueKeys,
    newGame,
    input,
    select,
    undo,
    redo,
    hint,
    toggleNotes,
    togglePause,
    toggleTheme,
    shareUrl: getShareUrl,
    timerFormatted: timer.formatted,
    timerRunning: !state.isPaused && !state.isComplete && !state.isGameOver,
  };
}
