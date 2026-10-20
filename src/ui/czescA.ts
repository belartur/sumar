// Sumar — szkielet DOM, cz. A: nagłówek + sumy kolumn.
import { ROZMIAR } from '../engine/model.ts';

export interface SzkieletA {
  w: HTMLElement;
  punkty: HTMLElement;
  tura: HTMLElement;
  rekord: HTMLElement;
  komunikat: HTMLElement;
  bonus: HTMLElement;
  sumyKolumn: HTMLElement[];
}

export function czescA(korzen: HTMLElement): SzkieletA {
  korzen.innerHTML = '';
  const w = document.createElement('div');
  w.className = 'sumar';
  const gora = document.createElement('div');
  gora.className = 'gora';
  const logo = document.createElement('div');
  logo.className = 'logo';
  logo.textContent = 'SUMAR';
  const liczniki = document.createElement('div');
  liczniki.className = 'liczniki';
  gora.append(logo, liczniki);
  const mk = (etykieta: string, wyr: boolean): HTMLElement => {
    const d = document.createElement('div');
    d.className = 'licznik' + (wyr ? ' wyrozniony' : '');
    const e = document.createElement('span');
    e.className = 'etykieta';
    e.textContent = etykieta;
    const s = document.createElement('strong');
    s.textContent = '0';
    d.append(e, s);
    liczniki.appendChild(d);
    return s;
  };
  const punkty = mk('PUNKTY', true);
  const tura = mk('TURA', false);
  const rekord = mk('REKORD', false);
  const komunikat = document.createElement('div');
  komunikat.className = 'komunikat';
  komunikat.setAttribute('role', 'status');
  komunikat.textContent = 'Wybierz klocek, potem pole na planszy.';
  const bonus = document.createElement('div');
  bonus.className = 'komunikat ukryty';
  const pasek = document.createElement('div');
  pasek.style.cssText = 'display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center;';
  const rog = document.createElement('div');
  rog.textContent = 'Σ';
  rog.style.cssText = 'opacity:.7;font-weight:900;text-align:center;min-width:2em;';
  const rzad = document.createElement('div');
  rzad.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:5px;';
  const sumyKolumn: HTMLElement[] = [];
  for (let c = 0; c < ROZMIAR; c++) {
    const s = document.createElement('div');
    s.className = 'suma';
    s.textContent = '0';
    rzad.appendChild(s);
    sumyKolumn.push(s);
  }
  pasek.append(rog, rzad);
  w.append(gora, komunikat, bonus, pasek);
  korzen.appendChild(w);
  return { w, punkty, tura, rekord, komunikat, bonus, sumyKolumn };
}
