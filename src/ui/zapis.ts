// Sumar — zapis i odtwarzanie stanu partii w localStorage.
// Zapis następuje po każdym postawieniu klocka oraz przy rozpoczęciu nowej gry.
import type { Gra } from '../engine/game.ts';
import { ROZMIAR, type Klocek, type Plansza, type SlotTrojki } from '../engine/model.ts';

const KLUCZ = 'sumar-nowa:stan:v1';
const WERSJA = 1;
const MIN_OCZEK = -4;
const MAX_OCZEK = 4;

/** Stan gry w formie przechowywanej w localStorage. */
export interface ZapisStanu {
  wersja: number;
  plansza: Plansza;
  punkty: number;
  tura: number;
  trojka: SlotTrojki[];
  koniec: boolean;
  wykonanychRuchow: number;
  wyczyszczonePlansze: number;
}

export function zakodujStan(g: Gra): string {
  const zapis: ZapisStanu = {
    wersja: WERSJA,
    plansza: g.plansza,
    punkty: g.punkty,
    tura: g.tura,
    trojka: g.trojka,
    koniec: g.koniec,
    wykonanychRuchow: g.wykonanychRuchow,
    wyczyszczonePlansze: g.wyczyszczonePlansze,
  };
  return JSON.stringify(zapis);
}

export function odkodujStan(surowy: string): ZapisStanu | null {
  try {
    const dane: unknown = JSON.parse(surowy);
    return jestStanem(dane) ? dane : null;
  } catch {
    return null;
  }
}

/** Zapisuje bieżący stan; brak dostępu do localStorage nie przerywa gry. */
export function zapiszStan(g: Gra): void {
  try {
    localStorage.setItem(KLUCZ, zakodujStan(g));
  } catch {
    /* brak dostępu — gra działa dalej */
  }
}

/** Wczytuje zapis do gry. Zwraca false, gdy zapisu brak lub jest nieprawidłowy. */
export function przywrocStan(g: Gra): boolean {
  let surowy: string | null;
  try {
    surowy = localStorage.getItem(KLUCZ);
  } catch {
    return false;
  }
  if (surowy === null) return false;

  const stan = odkodujStan(surowy);
  if (!stan) {
    try {
      localStorage.removeItem(KLUCZ);
    } catch {
      /* brak dostępu — gra działa dalej */
    }
    return false;
  }

  g.plansza = stan.plansza;
  g.punkty = stan.punkty;
  g.tura = stan.tura;
  g.trojka = stan.trojka;
  g.koniec = stan.koniec;
  g.wykonanychRuchow = stan.wykonanychRuchow;
  g.wyczyszczonePlansze = stan.wyczyszczonePlansze;
  return true;
}

function jestStanem(v: unknown): v is ZapisStanu {
  return (
    jestObiektem(v) &&
    v.wersja === WERSJA &&
    jestPlansza(v.plansza) &&
    jestLiczbaCalkowita(v.punkty, 0) &&
    jestLiczbaCalkowita(v.tura, 1) &&
    jestTrojka(v.trojka) &&
    typeof v.koniec === 'boolean' &&
    jestLiczbaCalkowita(v.wykonanychRuchow, 0) &&
    jestLiczbaCalkowita(v.wyczyszczonePlansze, 0)
  );
}

function jestPlansza(v: unknown): v is Plansza {
  return (
    Array.isArray(v) &&
    v.length === ROZMIAR &&
    v.every(
      (wiersz) =>
        Array.isArray(wiersz) &&
        wiersz.length === ROZMIAR &&
        wiersz.every((komorka) => komorka === null || jestOczkiem(komorka)),
    )
  );
}

function jestTrojka(v: unknown): v is SlotTrojki[] {
  return (
    Array.isArray(v) &&
    v.length === 3 &&
    v.every(jestSlotem) &&
    v.some((slot) => !slot.zuzyty)
  );
}

function jestSlotem(v: unknown): v is SlotTrojki {
  return jestObiektem(v) && jestKlockiem(v.klocek) && typeof v.zuzyty === 'boolean';
}

function jestKlockiem(v: unknown): v is Klocek {
  return (
    jestObiektem(v) &&
    jestOczkiem(v.a) &&
    jestOczkiem(v.b) &&
    (v.ori === 'H' || v.ori === 'V')
  );
}

function jestOczkiem(v: unknown): v is number {
  return jestLiczbaCalkowita(v, MIN_OCZEK) && v <= MAX_OCZEK;
}

function jestLiczbaCalkowita(v: unknown, min = Number.NEGATIVE_INFINITY): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= min;
}

function jestObiektem(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
