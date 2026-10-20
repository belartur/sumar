// Sumar — rekord w localStorage (klucz odrębny od innych wersji).
const KLUCZ = 'sumar-nowa:rekord:v1';

export function wczytajRekord(): number {
  try {
    const surowe = localStorage.getItem(KLUCZ);
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
