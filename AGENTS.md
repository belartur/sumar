# AGENTS.md — Sumar

Gra logiczna 5×5 z klockami domina (0–4 oczka). **Jedyne źródło prawdy zasad gry:
`opis.md`** — przed zmianą logiki przeczytaj je w całości (zwłaszcza sekcje 6–8:
kaskady, punktacja, koniec gry).

## Komendy weryfikacji (uruchamiać z katalogu projektu)

- `npm run typecheck` — TypeScript strict, bez błędów
- `npm test` — Vitest (30 testów logiki gry)
- `npm run build` — typecheck + produkcyjny build Vite

**Po każdej zmianie kodu uruchom wszystkie trzy.** Nie kończ pracy z czerwonym
wynikiem któregokolwiek. Dodatkowo: `git diff` przed commitem — brak
niezamierzonych zmian.

## Struktura

```
src/game/   # czysta logika, ZERO DOM — tutaj żyją reguły i testy
  types.ts    # Board, Tile, GameState, CascadeLevel
  board.ts    # sumy linii, geometria klocka, legalne ruchy
  game.ts     # rozdanie, postawienie, kaskada, punktacja, koniec gry
  rng.ts      # mulberry32 (deterministyczne testy)
  *.test.ts   # testy na przykładach z opis.md
src/ui/     # render DOM, input, animacje (bez logiki reguł!)
  game-ui.ts  # kontroler UI
  pips.ts     # rysowanie oczek
  records.ts  # rekord w localStorage
src/main.ts # punkt wejścia
```

Zasada: **logika nie importuje DOM, UI nie implementuje reguł.** Nowa reguła =
zmiana w `src/game/` + test w `src/game/*.test.ts`.

## Zasady kodu

- TypeScript strict, zero `any`; nie wyłączać `noUnusedLocals`/`noUnusedParameters`.
- Wersje w `package.json` są **pinowane** (bez `^`) + commit `package-lock.json`.
  Nie dodawać zależności bez wyraźnej potrzeby (zero frameworków UI).
- `npm install` używa `legacy-peer-deps` (zapisane w `.npmrc` — bug Debilowego
  npm 9.2 w arborist).
- UI: Pointer/click events działają na mysz i dotyk; strefy dotyku min. 44 px;
  respektować `prefers-reduced-motion`.
- Punktacja: wzór `(10 + 10×(L−1)) × 2^(K−1)` wg sekcji 7 opis.md
  (uwaga: dawniej w opisie były literówki 40 zamiast 20 — poprawione).

## Uruchomienie lokalne

- `npm run dev` — dev server Vite
- `npm run preview` — serwuje build z `dist/`
