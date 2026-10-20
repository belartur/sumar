// Sumar — czyste reguły gry (bez stanu, bez DOM). Wszystkie funkcje testowalne.
import {
  CEL,
  ROZMIAR,
  type Klocek,
  type Los,
  type Orientacja,
  type Plansza,
  type Poz,
  type PoziomKaskady,
  type WynikRuchu,
} from './model.ts';

/** Pusta plansza ROZMIAR x ROZMIAR. */
export function pustaPlansza(): Plansza {
  return Array.from({ length: ROZMIAR }, () => Array<null>(ROZMIAR).fill(null));
}

/** Głęboka kopia planszy. */
export function klonujPlansze(p: Plansza): Plansza {
  return p.map((w) => [...w]);
}

/** Losowa liczba całkowita 0..max-1. */
function losInt(los: Los, max: number): number {
  return Math.floor(los() * max);
}

/** Losuje orientację klocka. */
export function losujOrientacje(los: Los): Orientacja {
  return los() < 0.5 ? 'H' : 'V';
}

/** Losuje jeden klocek: pola 0..4 + orientacja. */
export function losujKlocek(los: Los): Klocek {
  return { a: losInt(los, 5), b: losInt(los, 5), ori: losujOrientacje(los) };
}

/** Losuje trójkę klocków. */
export function losujTrojke(los: Los): [Klocek, Klocek, Klocek] {
  return [losujKlocek(los), losujKlocek(los), losujKlocek(los)];
}

/**
 * Komórki zajmowane przez klocek przy kotwicy (r, c).
 * Kotwica = lewe pole dla 'H', górne pole dla 'V'.
 */
export function polaKlocka(k: Klocek, r: number, c: number): [Poz, Poz] {
  if (k.ori === 'H') return [{ r, c }, { r, c: c + 1 }];
  return [{ r, c }, { r: r + 1, c }];
}

/** Czy pozycja mieści się na planszy. */
export function wPlanszy(r: number, c: number): boolean {
  return r >= 0 && r < ROZMIAR && c >= 0 && c < ROZMIAR;
}

/** Czy ruch jest legalny: obie komórki w planszy i puste. */
export function czyLegalny(p: Plansza, k: Klocek, r: number, c: number): boolean {
  const [p1, p2] = polaKlocka(k, r, c);
  if (!wPlanszy(p1.r, p1.c) || !wPlanszy(p2.r, p2.c)) return false;
  return p[p1.r][p1.c] === null && p[p2.r][p2.c] === null;
}

/** Wszystkie legalne kotwice dla klocka na danej planszy. */
export function legalneRuchy(p: Plansza, k: Klocek): Poz[] {
  const wynik: Poz[] = [];
  for (let r = 0; r < ROZMIAR; r++)
    for (let c = 0; c < ROZMIAR; c++) if (czyLegalny(p, k, r, c)) wynik.push({ r, c });
  return wynik;
}

/** Czy klocek ma choć jeden legalny ruch. */
export function maRuch(p: Plansza, k: Klocek): boolean {
  for (let r = 0; r < ROZMIAR; r++)
    for (let c = 0; c < ROZMIAR; c++) if (czyLegalny(p, k, r, c)) return true;
  return false;
}

/** Sumy wierszy i kolumn (puste = 0). */
export function sumyLinii(p: Plansza): { wiersze: number[]; kolumny: number[] } {
  const wiersze = p.map((w) => w.reduce<number>((s, v) => s + (v ?? 0), 0));
  const kolumny = Array.from({ length: ROZMIAR }, (_, c) => {
    let s = 0;
    for (let r = 0; r < ROZMIAR; r++) s += p[r][c] ?? 0;
    return s;
  });
  return { wiersze, kolumny };
}

/** Linie o sumie dokładnie CEL. */
export function linieDoZdjecia(p: Plansza): { wiersze: number[]; kolumny: number[] } {
  const { wiersze, kolumny } = sumyLinii(p);
  return {
    wiersze: wiersze.flatMap((s, i) => (s === CEL ? [i] : [])),
    kolumny: kolumny.flatMap((s, i) => (s === CEL ? [i] : [])),
  };
}

/** Punktacja ruchu: L = sumaryczna liczba linii, K = sumaryczna liczba kaskad (0-bazowo). */
export function punktyZaRuch(sumaLinii: number, kaskady: number): number {
  if (sumaLinii <= 0) return 0;
  const k = kaskady < 0 ? 0 : kaskady;
  return ((sumaLinii * (sumaLinii + 1)) / 2) * 2 ** k;
}

/**
 * Stawia klocek na planszy (mutuje ją) i wykonuje pełną kaskadę.
 * Rzuca RangeError przy nielegalnym ruchu.
 */
export function postawIPrzelicz(p: Plansza, k: Klocek, r: number, c: number): WynikRuchu {
  if (!czyLegalny(p, k, r, c)) throw new RangeError(`Nielegalny ruch przy (${r}, ${c})`);
  const [p1, p2] = polaKlocka(k, r, c);
  p[p1.r][p1.c] = k.a;
  p[p2.r][p2.c] = k.b;

  const poziomy: PoziomKaskady[] = [];
  for (;;) {
    const { wiersze, kolumny } = linieDoZdjecia(p);
    if (wiersze.length === 0 && kolumny.length === 0) break;
    // Zbierz unikalne komórki do zdjęcia (przecięcia liczone raz).
    const doZdjecia = new Map<string, UsunietaKomorkaExt>();
    const bierz = (rr: number, cc: number): void => {
      const v = p[rr][cc];
      if (v !== null) doZdjecia.set(`${rr}:${cc}`, { r: rr, c: cc, v });
    };
    for (const w of wiersze) for (let cc = 0; cc < ROZMIAR; cc++) bierz(w, cc);
    for (const kol of kolumny) for (let rr = 0; rr < ROZMIAR; rr++) bierz(rr, kol);
    const zdjete = [...doZdjecia.values()];
    for (const z of zdjete) p[z.r][z.c] = null;
    poziomy.push({ wiersze, kolumny, zdjete });
  }

  const linieStart = poziomy.length > 0 ? poziomy[0].wiersze.length + poziomy[0].kolumny.length : 0;
  const liczbaPoziomow = poziomy.length;
  const sumaLinii = poziomy.reduce((s, p) => s + p.wiersze.length + p.kolumny.length, 0);
  // K = sumaryczna liczba kaskad (0-bazowo): sam poziom 0 → K = 0, każda kolejna kaskada +1.
  const kaskady = liczbaPoziomow > 0 ? liczbaPoziomow - 1 : 0;
  const punktyPoPoziomach: number[] = [];
  const punktyPrzyrostowo: number[] = [];
  let narastajaceL = 0;
  let poprzednie = 0;
  for (let i = 0; i < poziomy.length; i++) {
    narastajaceL += poziomy[i].wiersze.length + poziomy[i].kolumny.length;
    const kumulant = punktyZaRuch(narastajaceL, i);
    punktyPoPoziomach.push(kumulant);
    punktyPrzyrostowo.push(kumulant - poprzednie);
    poprzednie = kumulant;
  }
  const punkty = punktyPoPoziomach.length > 0 ? punktyPoPoziomach[punktyPoPoziomach.length - 1] : 0;
  return { poziomy, sumaLinii, kaskady, liczbaPoziomow, linieStart, punkty, punktyPoPoziomach, punktyPrzyrostowo };
}

interface UsunietaKomorkaExt {
  r: number;
  c: number;
  v: number;
}
