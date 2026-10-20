// Sumar — pływające „+N" nad planszą (punkty za czyszczenie).
// Pozycjonowane względem środka znikających pól; animacja CSS robi resztę.
import type { Uchwyty } from './uchwyty.ts';

/** Pokazuje „+punkty" nad środkiem podanych komórek planszy. */
export function plusNaPlanszy(h: Uchwyty, punkty: number, komorki: Array<{ r: number; c: number }>): void {
  if (punkty <= 0) return;
  const pierwsze = komorki.length > 0 ? h.pola[komorki[0].r]?.[komorki[0].c] : null;
  const plansza = pierwsze?.closest('.plansza-obramowanie') as HTMLElement | null;
  if (!plansza) return;

  // Środek znikających pól względem obramowania planszy.
  const ob = plansza.getBoundingClientRect();
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (const z of komorki) {
    const b = h.pola[z.r]?.[z.c];
    if (!b) continue;
    const rb = b.getBoundingClientRect();
    sx += rb.left + rb.width / 2 - ob.left;
    sy += rb.top + rb.height / 2 - ob.top;
    n++;
  }
  if (n === 0) return;

  const el = document.createElement('div');
  el.className = 'plus-punkty';
  el.textContent = `+${punkty}`;
  el.style.left = `${sx / n}px`;
  el.style.top = `${sy / n}px`;
  plansza.appendChild(el);
  window.setTimeout(() => el.remove(), 1400);
}
