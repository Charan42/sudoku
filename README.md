# Sudoku — Play & Learn

A Sudoku web app built with React + TypeScript + Vite, featuring a full game
**and** an interactive tutorial that teaches every major solving technique.

## Routes

The app uses hash-based routing so deep links work on GitHub Pages:

| Route | Page |
| --- | --- |
| `#/` (home) | Interactive tutorial — nine lessons covering all the ways to deduce a cell |
| `#/learn/:id` | A single technique lesson (e.g. `#/learn/naked-single`) |
| `#/game` | The Sudoku game (difficulties, notes, hints, undo/redo, share links, themes) |

## Tutorial techniques

Each lesson walks through the reasoning on a live board, then asks you to find
the cell and place the digit yourself, with hints and instant feedback:

1. **Last Free Cell — Box** — 8 of 9 cells filled, the leftover digit goes in the leftover cell
2. **Last Free Cell — Row & Column** — the same rule applied to lines
3. **Naked Single** — the row, column and box together eliminate 8 digits
4. **Hidden Single — Box** — cross-hatching: the digit fits only one cell of the box
5. **Hidden Single — Row & Column** — the digit fits only one cell of the line
6. **Pencil Marks** — recording candidates, the foundation for advanced play
7. **Naked Pair** — two cells claim two digits, eliminating them elsewhere
8. **Pointing Pair** — box–line interaction eliminations
9. **X-Wing** — rectangle-based eliminations across two rows and columns

Lesson progress is stored locally and shown on the home page.

Every lesson board is derived from a single verified solved grid, and
`src/lib/lessons.test.ts` programmatically proves each lesson's logic
(e.g. that a naked single really has exactly one candidate, or that the
X-Wing elimination is genuinely required).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm test` | Run the vitest suite (solver + lesson verification) |
| `npm run deploy` | Build and publish to GitHub Pages |
