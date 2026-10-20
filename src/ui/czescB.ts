// Sumar — szkielet DOM, cz. B: plansza 5x5 + sumy wierszy.
import { ROZMIAR } from '../engine/model.ts';
import type { SzkieletA } from './czescA.ts';

export interface SzkieletB extends SzkieletA {
  pola: HTMLButtonElement[][];
  sumyWierszy: HTMLElement[];
}

export function czescB(a: SzkieletA): SzkieletB {
  const srodek = document.createElement('div');
  srodek.style.cssText = 'display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:stretch;';
  const kol = document.createElement('div');
  kol.style.cssText = 'display:grid;grid-template-rows:repeat(5,1fr);gap:5px;';
  const sumyWierszy: HTMLElement[] = [];
  for (let r = 0; r < ROZMIAR; r++) {
    const s = document.createElement('div');
    s.className = 'suma';
    s.textContent = '0';
    kol.appendChild(s);
    sumyWierszy.push(s);
  }
  const obram = document.createElement('div');
  obram.className = 'plansza-obramowanie';
  const plansza = document.createElement('div');
  plansza.className = 'plansza';
  plansza.setAttribute('role', 'grid');
  plansza.setAttribute('aria-label', 'Plansza Sumar 5 na 5');
  obram.appendChild(plansza);
  srodek.append(kol, obram);
  a.w.appendChild(srodek);
  const pola: HTMLButtonElement[][] = [];
  for (let r = 0; r < ROZMIAR; r++) {
    const wiersz: HTMLButtonElement[] = [];
    for (let c = 0; c < ROZMIAR; c++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pole puste';
      b.setAttribute('role', 'gridcell');
      b.setAttribute('aria-label', `Pole ${r + 1}, ${c + 1}, puste`);
      plansza.appendChild(b);
      wiersz.push(b);
    }
    pola.push(wiersz);
  }
  return { ...a, pola, sumyWierszy };
}
