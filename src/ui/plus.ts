// Sumar — pływające „+N" nad planszą (punkty za czyszczenie).
// Dymki przyrostowe: po każdej kaskadzie pojawia się NOWY dymek z punktami
// za dany poziom (p×l×2^k). Dymki sumują się do punktów za cały ruch.
// Każdy dymek znika niezależnie ~1400ms po swoim pojawieniu,
// nad środkiem pól zdjętych na SWOIM poziomie (z przesunięciem w pionie,
// żeby kolejne dymki się nie nakładały).
import type { Uchwyty } from './uchwyty.ts';

const CZAS_DYMKA_MS = 1400;
/** Pionowe przesunięcie kolejnych dymków tego samego ruchu (px). */
const ODSTEP_PION_PX = 44;

let dymki: HTMLElement[] = [];
let timery: number[] = [];

function srodekKomorek(
  h: Uchwyty,
  komorki: Array<{ r: number; c: number }>,
): { plansza: HTMLElement; x: number; y: number } | null {
  const pierwsze = komorki.length > 0 ? h.pola[komorki[0].r]?.[komorki[0].c] : null;
  const plansza = pierwsze?.closest('.plansza-obramowanie') as HTMLElement | null;
  if (!plansza) return null;
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
  if (n === 0) return null;
  return { plansza, x: sx / n, y: sy / n };
}

/** Pokazuje „+punkty" nad środkiem podanych komórek planszy (jednorazowo). */
export function plusNaPlanszy(h: Uchwyty, punkty: number, komorki: Array<{ r: number; c: number }>): void {
  plusPrzyrostowy(h, punkty, komorki, 0);
}
/** Duży dymek bonusu za całkowite wyczyszczenie planszy (osobna klasa, środek planszy). */
export function plusCzystaPlansza(h: Uchwyty, bonus: number): void {
  if (bonus <= 0) return;
  const plansza = h.pola[2]?.[2]?.closest('.plansza-obramowanie') as HTMLElement | null;
  if (!plansza) return;
  const el = document.createElement('div');
  el.className = 'plus-punkty plus-czysta';
  el.textContent = `+${bonus} CZYSTA!`;
  el.style.left = '50%';
  el.style.top = '40%';
  plansza.appendChild(el);
  dymki.push(el);
  const t = window.setTimeout(() => {
    el.remove();
    dymki = dymki.filter((d) => d !== el);
  }, CZAS_DYMKA_MS + 600);
  timery.push(t);
}


/**
 * Nowy dymek przyrostowy po kolejnej kaskadzie: zawsze nowy element,
 * nigdy nie nadpisuje poprzednich — dymki sumują się do punktów za ruch.
 * `delta` = punkty za dany poziom (p×l×2^k).
 * `ktory` = indeks poziomu w ruchu (0-bazowo), służy do przesunięcia w pionie.
 */
export function plusPrzyrostowy(
  h: Uchwyty,
  delta: number,
  komorki: Array<{ r: number; c: number }>,
  ktory = 0,
): void {
  if (delta <= 0) return;
  const s = srodekKomorek(h, komorki);
  if (!s) return;
  const el = document.createElement('div');
  el.className = 'plus-punkty';
  el.textContent = `+${delta}`;
  el.style.left = `${s.x}px`;
  el.style.top = `${Math.max(s.y - ktory * ODSTEP_PION_PX, 8)}px`;
  s.plansza.appendChild(el);
  dymki.push(el);
  const t = window.setTimeout(() => {
    el.remove();
    dymki = dymki.filter((d) => d !== el);
  }, CZAS_DYMKA_MS);
  timery.push(t);
}

/**
 * Aktualizuje liczbę punktów w okienku po kolejnej kaskadzie.
 * @deprecated Od dymków przyrostowych: użyj `plusPrzyrostowy`. Zachowane dla
 * wstecznej zgodności — deleguje do osobnego dymka z pełnym kumulantem.
 */
export function plusPoKaskadzie(h: Uchwyty, punkty: number, komorki: Array<{ r: number; c: number }>): void {
  plusNaPlanszy(h, punkty, komorki);
}

/** Na końcu ruchu: dymki znikają niezależnie własnymi timerami — nic do roboty. */
export function plusKoniecRuchu(): void {
  // Celowo puste: każdy dymek ma własny timer ~1400ms od swojego pojawienia.
  // Funkcja zachowana jako semantyczny znacznik końca ruchu / bezpiecznik API.
}

/** Natychmiast usuwa wszystkie dymki (np. nowa gra). */
export function usunPlus(): void {
  for (const t of timery) window.clearTimeout(t);
  timery = [];
  for (const el of dymki) el.remove();
  dymki = [];
}
