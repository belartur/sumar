// Sumar — rysowanie planszy, sum i trójki.
import { CEL, ROZMIAR, type Plansza } from '../engine/model.ts';
import { elOczek } from './oczka.ts';
import type { Uchwyty } from './uchwyty.ts';

export function rysujPlansze(h: Uchwyty, p: Plansza, sw: number[], sk: number[]): void {
  for (let r = 0; r < ROZMIAR; r++) {
    for (let c = 0; c < ROZMIAR; c++) {
      const btn = h.pola[r][c];
      const v = p[r][c];
      btn.innerHTML = '';
      if (v === null) {
        btn.className = 'pole puste';
        btn.setAttribute('aria-label', `Pole ${r + 1}, ${c + 1}, puste`);
      } else {
        btn.className = 'pole zajete';
        btn.appendChild(elOczek(v));
        btn.setAttribute('aria-label', `Pole ${r + 1}, ${c + 1}, ${v}`);
      }
    }
  }
  sw.forEach((s, r) => {
    h.sumyWierszy[r].textContent = String(s);
    h.sumyWierszy[r].className = 'suma' + (s === CEL ? ' cel' : s > CEL ? ' przegrzana' : '');
  });
  sk.forEach((s, c) => {
    h.sumyKolumn[c].textContent = String(s);
    h.sumyKolumn[c].className = 'suma' + (s === CEL ? ' cel' : s > CEL ? ' przegrzana' : '');
  });
}
