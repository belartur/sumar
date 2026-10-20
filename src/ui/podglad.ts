// Sumar — interakcje: wybór klocka + podgląd legalności na planszy.
import { ROZMIAR } from '../engine/model.ts';
import { czyLegalny, polaKlocka } from '../engine/rules.ts';
import type { Gra } from '../engine/game.ts';
import type { Uchwyty } from './uchwyty.ts';

export function docelowePola(g: Gra, slot: number, r: number, c: number): { ok: boolean; pola: Array<[number, number]> } {
  const s = g.trojka[slot];
  if (!s) return { ok: false, pola: [] };
  const [p1, p2] = polaKlocka(s.klocek, r, c);
  const wPl = p1.r >= 0 && p1.r < ROZMIAR && p1.c >= 0 && p1.c < ROZMIAR && p2.r >= 0 && p2.r < ROZMIAR && p2.c >= 0 && p2.c < ROZMIAR;
  return { ok: czyLegalny(g.plansza, s.klocek, r, c), pola: [[p1.r, p1.c], [p2.r, p2.c]], };
  void wPl;
}

/** Czyści podglądy z planszy. */
export function wyczyscPodglad(h: Uchwyty): void {
  for (let r = 0; r < ROZMIAR; r++)
    for (let c = 0; c < ROZMIAR; c++) h.pola[r][c].classList.remove('podglad-ok', 'podglad-zle');
}

/** Maluje podgląd dla wybranego klocka nad komórką (r, c). */
export function malujPodglad(h: Uchwyty, g: Gra, slot: number | null, r: number, c: number): void {
  wyczyscPodglad(h);
  if (slot === null) return;
  const { ok, pola } = docelowePola(g, slot, r, c);
  for (const [pr, pc] of pola) {
    const b = h.pola[pr]?.[pc];
    if (b) b.classList.add(ok ? 'podglad-ok' : 'podglad-zle');
  }
}
