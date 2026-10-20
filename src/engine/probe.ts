// Wspólne pomocniki testowe (poza plikami *.test.ts, żeby nie dublować testów).
import type { Klocek, Plansza } from './model.ts';
import { pustaPlansza } from './rules.ts';

/** Plansza z list wierszy (5x5, brakujące = puste). */
export function planszaZ(listy: Array<Array<number | null>>): Plansza {
  const p = pustaPlansza();
  for (let r = 0; r < Math.min(listy.length, 5); r++)
    for (let c = 0; c < Math.min(listy[r].length, 5); c++) p[r][c] = listy[r][c];
  return p;
}

export const POZIOM: Klocek = { a: 2, b: 3, ori: 'H' };
export const PION: Klocek = { a: 2, b: 3, ori: 'V' };
