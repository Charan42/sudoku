import { Board } from './types';

type Unit = { value: number | null; key: string }[];

function dupsInUnit(unit: Unit): Set<string> {
  const seen: Record<string, string[]> = {};
  const errors = new Set<string>();
  for (const { value, key } of unit) {
    if (!value) continue;
    const v = String(value);
    if (seen[v]) { errors.add(key); seen[v].forEach(k => errors.add(k)); }
    else seen[v] = [];
    seen[v].push(key);
  }
  return errors;
}

function rowUnit(cells: Board, r: number): Unit {
  return cells[r].map((c, ci) => ({ value: c.value, key: `${r},${ci}` }));
}
function colUnit(cells: Board, c: number): Unit {
  return cells.map((row, ri) => ({ value: row[c].value, key: `${ri},${c}` }));
}
function boxUnit(cells: Board, br: number, bc: number): Unit {
  const unit: Unit = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const ri = br * 3 + r, ci = bc * 3 + c;
      unit.push({ value: cells[ri][ci].value, key: `${ri},${ci}` });
    }
  return unit;
}

export function computeErrorCells(cells: Board): Set<string> {
  const errors = new Set<string>();
  const add = (unit: Unit) => dupsInUnit(unit).forEach(k => errors.add(k));
  for (let i = 0; i < 9; i++) { add(rowUnit(cells, i)); add(colUnit(cells, i)); }
  for (let br = 0; br < 3; br++) for (let bc = 0; bc < 3; bc++) add(boxUnit(cells, br, bc));
  return errors;
}

export function getUnitsForCell(cells: Board, row: number, col: number): Unit[] {
  const br = Math.floor(row / 3), bc = Math.floor(col / 3);
  return [rowUnit(cells, row), colUnit(cells, col), boxUnit(cells, br, bc)];
}

export function getPeerKeys(row: number, col: number): Set<string> {
  const keys = new Set<string>();
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let i = 0; i < 9; i++) { keys.add(`${row},${i}`); keys.add(`${i},${col}`); }
  for (let r = br; r < br + 3; r++) for (let c = bc; c < bc + 3; c++) keys.add(`${r},${c}`);
  keys.delete(`${row},${col}`);
  return keys;
}
