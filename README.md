# Sumar

A single-player logic puzzle on a 5x5 board. Place domino tiles so rows or columns sum to exactly 5 — they clear and score.

## Rules

- The 5x5 board starts empty.
- Each turn you receive 3 domino tiles. Each half has 0–4 pips; rarely (~10% per half) a half is negative (-1..-4, drawn on a light-red background) and subtracts from the line sum instead of adding. There is no -0. Orientation (horizontal/vertical) is random and cannot be changed.
- You must place all 3 tiles, in any order, on two adjacent empty cells matching the tile orientation.
- A row or column clears when the sum of its non-empty cells is exactly 5. Empty cells count as 0; the line does not need to be full.
- A sum above 5 is "overheated", not dead: it can drop back to 5 when a crossing row/column clears and removes some of its cells.
- Clearing runs in cascade levels: after each placement all lines summing to 5 clear at once, sums are recalculated, and new lines at 5 clear on the next level.
- Scoring per placement is calculated separately for each cascade level: `p * l * 2^k`, where `p` is the number of unique cells removed at that level (an intersection of a cleared row and column counts once), `l` is the number of lines (rows + columns) cleared at that level, and `k` is the cascade level (0-based: first clear → k = 0, first cascade → k = 1, …). `p` and `l` are recomputed for every level; a placement with no clears scores 0. After each cascade a separate bubble shows that level's points (`p * l * 2^k`); the bubbles sum to the move total, and the running total only changes once the move is finished.
- Full board clear bonus: when a placement + full cascade leaves the 5x5 board 100% empty, add `10*N` where `N` is the number of that full board clear in this game (N = 1, 2, 3, …; reset on new game). 1st clear +10, 2nd +20, 3rd +30… The `CZYSTE` (N) counter is always visible from game start.
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
