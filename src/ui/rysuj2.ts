// Sumar — rysowanie trójki.
import type { Klocek } from '../engine/model.ts';
import { elOczek, etykietaWartosci } from './oczka.ts';
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
    p0.classList.toggle('ujemna', s.klocek.a < 0);
    p1.classList.toggle('ujemna', s.klocek.b < 0);
    const pod = p0.parentElement;
    if (pod) pod.className = 'polowki' + (s.klocek.ori === 'V' ? ' pion' : '');
    const kier = s.klocek.ori === 'H' ? 'poziomy' : 'pionowy';
    btn.setAttribute(
      'aria-label',
      `Klocek ${i + 1}: ${etykietaWartosci(s.klocek.a)} i ${etykietaWartosci(s.klocek.b)}, ${kier}${s.zuzyty ? ', postawiony' : ''}`,
    );
    btn.className =
      'klocek' + (s.zuzyty ? ' zuzyty' : '') + (wybrany === i ? ' wybrany' : '') + (!s.zuzyty && !ruchome[i] ? ' bez-ruchu' : '');
    btn.disabled = s.zuzyty;
    btn.setAttribute('aria-pressed', wybrany === i ? 'true' : 'false');
  });
}

/** Potrząśnięcie elementem (np. nielegalne pole lub klocek bez ruchu). */
export function potrzasnij(el: HTMLElement): void {
  el.classList.remove('trzask');
  void el.offsetWidth;
  el.classList.add('trzask');
}
