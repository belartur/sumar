// Sumar — rysowanie trójki i komunikatów.
import type { Klocek } from '../engine/model.ts';
import { elOczek } from './oczka.ts';
import type { Uchwyty } from './uchwyty.ts';

export function rysujTrojke(
  h: Uchwyty,
  t: Array<{ klocek: Klocek; zuzyty: boolean }>,
  wybrany: number | null,
  ruchome: boolean[],
): void {
  t.forEach((s, i) => {
    const btn = h.klocki[i];
    const [p0, p1] = h.polowki[i];
    p0.innerHTML = '';
    p1.innerHTML = '';
    p0.appendChild(elOczek(s.klocek.a));
    p1.appendChild(elOczek(s.klocek.b));
    const pod = p0.parentElement;
    if (pod) pod.className = 'polowki' + (s.klocek.ori === 'V' ? ' pion' : '');
    const kier = s.klocek.ori === 'H' ? '↔ poziomy' : '↕ pionowy';
    h.metaKlockow[i].textContent = `${s.klocek.a}–${s.klocek.b} ${kier}`;
    btn.className =
      'klocek' + (s.zuzyty ? ' zuzyty' : '') + (wybrany === i ? ' wybrany' : '') + (!s.zuzyty && !ruchome[i] ? ' bez-ruchu' : '');
    btn.disabled = s.zuzyty;
    btn.setAttribute('aria-pressed', wybrany === i ? 'true' : 'false');
  });
}

export function powiedz(h: Uchwyty, tekst: string): void {
  h.komunikat.textContent = tekst;
  h.komunikat.classList.remove('wyskakuj');
  void h.komunikat.offsetWidth;
  h.komunikat.classList.add('wyskakuj');
}

export function pokazBonus(h: Uchwyty, tekst: string): void {
  h.bonus.textContent = tekst;
  h.bonus.classList.remove('ukryty');
  window.clearTimeout((h as unknown as { _bt?: number })._bt);
  (h as unknown as { _bt?: number })._bt = window.setTimeout(() => h.bonus.classList.add('ukryty'), 2200);
}
