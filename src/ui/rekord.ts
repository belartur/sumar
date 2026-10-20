// Sumar — rekord w localStorage (klucz odrębny od innych wersji).
// v2: nowy wzór punktacji (L*(L+1)/2 * 2^K) — stare rekordy nieporównywalne, startujemy od zera.
const KLUCZ = 'sumar-nowa:rekord:v2';
const STARY_KLUCZ = 'sumar-nowa:rekord:v1';

export function wczytajRekord(): number {
  try {
    const surowe = localStorage.getItem(KLUCZ);
    // Ze względu na zmianę wzoru: przy pierwszym odczycie wyczyść stare rekordy.
    try {
      localStorage.removeItem(STARY_KLUCZ);
    } catch {
      /* brak dostępu — gra działa dalej */
    }
    const n = surowe === null ? 0 : Number.parseInt(surowe, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Zapisuje wynik; zwraca true, gdy pobito rekord. */
export function zapiszWynik(punkty: number): boolean {
  const rekord = wczytajRekord();
  if (punkty > rekord) {
    try {
      localStorage.setItem(KLUCZ, String(punkty));
    } catch {
      /* brak dostępu — gra działa dalej */
    }
    return true;
  }
  return false;
}
