# Sumar

A single-player logic puzzle on a 5x5 board. Place domino tiles so rows or columns sum to exactly 5 — they clear and score.

## Rules

- The 5x5 board starts empty.
- Each turn you receive 3 domino tiles. Each half has 0–4 pips. Orientation (horizontal/vertical) is random and cannot be changed.
- You must place all 3 tiles, in any order, on two adjacent empty cells matching the tile orientation.
- A row or column clears when the sum of its non-empty cells is exactly 5. Empty cells count as 0; the line does not need to be full.
- A sum above 5 is "overheated", not dead: it can drop back to 5 when a crossing row/column clears and removes some of its cells.
- Clearing runs in cascade levels: after each placement all lines summing to 5 clear at once, sums are recalculated, and new lines at 5 clear on the next level.
- Scoring per placement: `(10 + 10 * (L - 1)) * 2^(K - 1)`, where `L` is the number of lines cleared on the first level and `K` is the number of cascade levels. A placement with no clears scores 0.
- Game over when none of the remaining tiles has a legal placement. Final score is the sum of all placements.

## Run / Build

Requires Node.js 18+ and npm. Stack: TypeScript + Vite + vanilla DOM.

```sh
npm install
npm run dev       # start dev server with hot reload
npm run build     # typecheck + production build into dist/
npm run preview   # preview the production build
npm run test      # run unit tests (vitest)
npm run typecheck # typecheck only
```

Full rules (in Polish) are in `opis.md`.
