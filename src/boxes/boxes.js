import React from 'react';

const Grid = ({ grid, errorCells, onChange, onBlur }) => {
  return (
    <div className="grid">
      {grid.map((row, r) =>
        row.map((value, c) => (
          <input
            key={`${r},${c}`}
            type="text"
            inputMode="numeric"
            pattern="[1-9]"
            maxLength={1}
            value={value}
            onChange={e => onChange(r, c, e.target.value)}
            onBlur={() => onBlur(r, c)}
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
