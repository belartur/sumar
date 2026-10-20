// Sumar — przeciąganie klocków, cz. 1: typy + duch (pływający podgląd).
import type { Klocek } from '../engine/model.ts';
import { elOczek } from './oczka.ts';

export interface ZaczepyDnD {
  /** Wykonuje ruch w silniku (z animacją kaskady). */
  upusc: (slot: number, r: number, c: number) => void;
  /** Czy można teraz ruszać (brak animacji, gra trwa, klocek ruchomy). */
  czyMozna: (slot: number) => boolean;
  /** Po zakończeniu sesji; dostaje true, gdy było to przeciągnięcie (nie tap). */
  poSesji: (przeciagnieto: boolean) => void;
}

/** Pływający podgląd klocka za kursorem/palcem. */
export function zrobDucha(klocek: Klocek): HTMLElement {
  const d = document.createElement('div');
  d.className = 'duch';
  const pud = document.createElement('div');
  pud.className = 'duch-polowki' + (klocek.ori === 'V' ? ' pion' : '');
  for (const v of [klocek.a, klocek.b]) {
    const p = document.createElement('div');
    p.className = 'duch-polowka';
    p.appendChild(elOczek(v));
    pud.appendChild(p);
  }
  d.appendChild(pud);
  document.body.appendChild(d);
  return d;
}

/** Kotwica ducha = pierwsza połówka; duch wisi tak, by palec nie zasłaniał celu. */
export function ustawDucha(duch: HTMLElement, x: number, y: number, pion: boolean): void {
  const dx = pion ? 10 : -duch.offsetWidth / 2;
  const dy = -duch.offsetHeight - 18;
  duch.style.transform = `translate(${Math.round(x + dx)}px, ${Math.round(y + dy)}px)`;
}
