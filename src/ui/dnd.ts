// Sumar — przeciąganie, cz. 2: sesja Pointer Events na przyciskach trójki.
// Tap (= brak ruchu) przepuszczamy do clicka; pociągnięcie (>8px) to sesja DnD.
import { ROZMIAR } from '../engine/model.ts';
import { czyLegalny } from '../engine/rules.ts';
import type { Gra } from '../engine/game.ts';
import type { Uchwyty } from './uchwyty.ts';
import { malujPodglad, wyczyscPodglad } from './podglad.ts';
import { zrobDucha, ustawDucha, type ZaczepyDnD } from './dnd-duch.ts';

const PROG_PX = 8;

function komorkaSpod(h: Uchwyty, x: number, y: number): { r: number; c: number } | null {
  const el = document.elementFromPoint(x, y);
  const pole = el?.closest?.('.pole') as HTMLElement | null | undefined;
  if (!pole) return null;
  for (let r = 0; r < ROZMIAR; r++)
    for (let c = 0; c < ROZMIAR; c++) if (h.pola[r][c] === pole) return { r, c };
  return null;
}

function ostylujDucha(duch: HTMLElement, ok: boolean, nad: boolean): void {
  duch.classList.toggle('zly', nad && !ok);
  duch.classList.toggle('dobry', nad && ok);
}

/** Podpina DnD pod trójkę. Zwraca funkcję sprzątającą sesję (do wywołania przy nowej grze). */
export function podepnijDnd(h: Uchwyty, gra: () => Gra, z: ZaczepyDnD): () => void {
  let sesja: {
    slot: number;
    id: number;
    sx: number;
    sy: number;
    ruszone: boolean;
    duch: HTMLElement | null;
    celR: number;
    celC: number;
    nad: boolean;
  } | null = null;

  const zakoncz = (upusciony: boolean): void => {
    if (!sesja) return;
    const s = sesja;
    sesja = null;
    s.duch?.remove();
    wyczyscPodglad(h);
    for (const b of h.klocki) b.classList.remove('ciagniety');
    document.body.classList.remove('dnd-aktywne');
    if (!s.ruszone) return; // tap: click obsłuży wybór
    if (upusciony && s.nad) {
      const g = gra();
      const klocek = g.trojka[s.slot]?.klocek;
      if (klocek && czyLegalny(g.plansza, klocek, s.celR, s.celC)) {
        z.upusc(s.slot, s.celR, s.celC);
      } else {
        z.poSesji(true);
      }
    } else {
      z.poSesji(true);
    }
  };

  const naRuch = (e: PointerEvent): void => {
    if (!sesja || e.pointerId !== sesja.id) return;
    const dx = e.clientX - sesja.sx;
    const dy = e.clientY - sesja.sy;
    if (!sesja.ruszone && Math.hypot(dx, dy) < PROG_PX) return;
    const g = gra();
    if (!sesja.ruszone) {
      // Start sesji dopiero po przekroczeniu progu.
      if (!z.czyMozna(sesja.slot)) {
        sesja = null;
        return;
      }
      const klocek = g.trojka[sesja.slot]?.klocek;
      if (!klocek) {
        sesja = null;
        return;
      }
      sesja.ruszone = true;
      sesja.duch = zrobDucha(klocek);
      h.klocki[sesja.slot].classList.add('ciagniety');
      document.body.classList.add('dnd-aktywne');
    }
    if (sesja.duch) {
      ustawDucha(sesja.duch, e.clientX, e.clientY);
    }
    const kom = komorkaSpod(h, e.clientX, e.clientY);
    sesja.nad = kom !== null;
    if (kom) {
      sesja.celR = kom.r;
      sesja.celC = kom.c;
      const klocek = g.trojka[sesja.slot]?.klocek;
      const ok = klocek ? czyLegalny(g.plansza, klocek, kom.r, kom.c) : false;
      malujPodglad(h, g, sesja.slot, kom.r, kom.c);
      if (sesja.duch) ostylujDucha(sesja.duch, ok, true);
    } else {
      wyczyscPodglad(h);
      if (sesja.duch) ostylujDucha(sesja.duch, false, false);
    }
  };

  const naGore = (e: PointerEvent): void => {
    if (!sesja || e.pointerId !== sesja.id) return;
    zakoncz(true);
  };

  const naAnuluj = (e: PointerEvent): void => {
    if (!sesja || e.pointerId !== sesja.id) return;
    zakoncz(false);
  };

  h.klocki.forEach((btn, slot) => {
    btn.addEventListener('pointerdown', (e) => {
      if (sesja) return;
      if (e.pointerType === 'mouse' && e.button > 0) return; // tylko lewy przycisk
      sesja = { slot, id: e.pointerId, sx: e.clientX, sy: e.clientY, ruszone: false, duch: null, celR: -1, celC: -1, nad: false };
    });
  });
  window.addEventListener('pointermove', naRuch, { passive: true });
  window.addEventListener('pointerup', naGore);
  window.addEventListener('pointercancel', naAnuluj);

  // Do wywołania przy nowej grze / końcu: porzuca sesję bez upuszczenia.
  return () => zakoncz(false);
}
