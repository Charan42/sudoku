import React from 'react';

const Grid = ({ grid, errorCells, onChange }) => {
  return (
    <div className="grid">
      {grid.map((row, r) =>
        row.map((value, c) => (
          <input
            key={`${r},${c}`}
            type="number"
            min="1"
            max="9"
            value={value}
            onChange={e => onChange(r, c, e.target.value)}
            className={[
              'cell',
              c === 2 || c === 5 ? 'thick-right' : '',
              r === 2 || r === 5 ? 'thick-bottom' : '',
              errorCells.has(`${r},${c}`) ? 'error-cell' : '',
            ].filter(Boolean).join(' ')}
          />
        ))
      )}
    </div>
  );
};

export default Grid;
