// Sumar — przeciąganie klocków, cz. 1: typy + duch (pływający podgląd).
import type { Klocek } from '../engine/model.ts';
import { elOczek } from './oczka.ts';

export interface ZaczepyDnD {
  /** Wykonuje ruch w silniku (z animacją kaskady). */
  upusc: (slot: number, r: number, c: number) => void;
  /** Czy można teraz ruszać (brak animacji, gra trwa, klocek ruchomy). */
  czyMozna: (slot: number) => boolean;
}

/** Pływający podgląd klocka za kursorem/palcem. */
export function zrobDucha(klocek: Klocek): HTMLElement {
  const d = document.createElement('div');
  d.className = 'duch';
  const pud = document.createElement('div');
  pud.className = 'duch-polowki' + (klocek.ori === 'V' ? ' pion' : '');
  for (const v of [klocek.a, klocek.b]) {
    const p = document.createElement('div');
    p.className = 'duch-polowka' + (v < 0 ? ' ujemna' : '');
    p.appendChild(elOczek(v));
    pud.appendChild(p);
  }
  d.appendChild(pud);
  document.body.appendChild(d);
  return d;
}

/** Duch wyśrodkowany na kursorze/palcu — tak samo dla klocków H i V. */
export function ustawDucha(duch: HTMLElement, x: number, y: number): void {
  duch.style.transform = `translate(${Math.round(x - duch.offsetWidth / 2)}px, ${Math.round(y - duch.offsetHeight / 2)}px)`;
}
