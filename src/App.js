import React, { useState } from 'react';
import Grid from './boxes/boxes';

function createEmptyGrid() {
  return Array(9).fill(null).map(() => Array(9).fill(''));
}

function getOrdinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

function findDuplicateCells(cells) {
  const seen = {};
  const dupKeys = new Set();
  cells.forEach(({ value, key }) => {
    if (value === '' || value === null) return;
    const v = String(value);
    if (seen[v]) {
      dupKeys.add(key);
      seen[v].forEach(k => dupKeys.add(k));
    } else {
      seen[v] = [];
    }
    seen[v].push(key);
  });
  return dupKeys;
}

function App() {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [errors, setErrors] = useState([]);
  const [errorCells, setErrorCells] = useState(new Set());
  const [isValid, setIsValid] = useState(null);

  const handleChange = (row, col, rawValue) => {
    let value = '';
    if (rawValue !== '') {
      const parsed = parseInt(rawValue, 10);
      if (!isNaN(parsed)) {
        value = Math.min(9, Math.max(1, parsed));
      }
    }
    setGrid(prev => prev.map((r, ri) =>
      r.map((c, ci) => (ri === row && ci === col ? value : c))
    ));
    setErrors([]);
    setErrorCells(new Set());
    setIsValid(null);
  };

  const validate = () => {
    const newErrors = [];
    const allErrorCells = new Set();

    const check = (cells, label) => {
      const dups = findDuplicateCells(cells);
      if (dups.size > 0) {
        newErrors.push(`Duplicate in ${label}`);
        dups.forEach(k => allErrorCells.add(k));
      }
    };

    for (let r = 0; r < 9; r++) {
      check(
        grid[r].map((value, c) => ({ value, key: `${r},${c}` })),
        `${getOrdinal(r + 1)} row`
      );
    }

    for (let c = 0; c < 9; c++) {
      check(
        grid.map((row, r) => ({ value: row[c], key: `${r},${c}` })),
        `${getOrdinal(c + 1)} column`
      );
    }

    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        const cells = [];
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const row = br * 3 + r;
            const col = bc * 3 + c;
            cells.push({ value: grid[row][col], key: `${row},${col}` });
          }
        }
        check(cells, `${getOrdinal(br * 3 + bc + 1)} box`);
      }
    }

    setErrors(newErrors);
    setErrorCells(allErrorCells);
    setIsValid(newErrors.length === 0);
  };

  const clearGrid = () => {
    setGrid(createEmptyGrid());
    setErrors([]);
    setErrorCells(new Set());
    setIsValid(null);
  };

  return (
    <div className="app">
      <h1 className="title">Sudoku Validator</h1>
      <p className="subtitle">Enter numbers 1–9 and click Validate</p>
      <Grid grid={grid} errorCells={errorCells} onChange={handleChange} />
      <div className="actions">
        <button onClick={validate} className="btn btn-validate">Validate</button>
        <button onClick={clearGrid} className="btn btn-clear">Clear</button>
      </div>
      {isValid === true && (
        <div className="result success">No duplicates found — looks valid!</div>
      )}
      {isValid === false && (
        <div className="result error-list">
          {errors.map((err, i) => (
            <div key={i} className="error-item">{err}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
