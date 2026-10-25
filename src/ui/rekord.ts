// Sumar — rekord w localStorage (klucz odrębny od innych wersji).
// v4: nowa punktacja p×l×2^k i bonus 10×N — stare rekordy nieporównywalne.
const KLUCZ = 'sumar-nowa:rekord:v4';
const STARE_KLUCZE = ['sumar-nowa:rekord:v3', 'sumar-nowa:rekord:v2', 'sumar-nowa:rekord:v1'];

export function wczytajRekord(): number {
  try {
    const surowe = localStorage.getItem(KLUCZ);
    // Ze względu na zmianę wzoru: przy pierwszym odczycie wyczyść stare rekordy.
    try {
      for (const stary of STARE_KLUCZE) localStorage.removeItem(stary);
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
