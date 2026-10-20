// Sumar — animacja kaskady przez odtwarzanie migawek poziomów.
import type { Plansza, PoziomKaskady } from '../engine/model.ts';
import { klonujPlansze } from '../engine/rules.ts';
import type { Uchwyty } from './uchwyty.ts';

const KROK_MS = 480;
const PRZERWA_MS = 150;
const czekaj = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Pokazuje kaskadę krok po kroku: od stanu tuż po postawieniu (przed zdjęciami).
 * rysujTlo rysuje podaną planszę wraz z sumami.
 * poPoziomie(i) wywoływane jest po zdjęciu i-tego poziomu (0-bazowo),
 * żeby UI mogło pokazać punkty „gdyby ruch zakończył się w tym momencie".
 */
export async function animujKaskade(
  h: Uchwyty,
  poPostawieniu: Plansza,
  poziomy: PoziomKaskady[],
  rysujTlo: (p: Plansza) => void,
  poPoziomie?: (indeks: number) => void,
): Promise<void> {
  let stan = klonujPlansze(poPostawieniu);
  for (let i = 0; i < poziomy.length; i++) {
    const poz = poziomy[i];
    rysujTlo(stan);
    for (const z of poz.zdjete) h.pola[z.r]?.[z.c]?.classList.add('znika');
    for (const w of poz.wiersze) h.sumyWierszy[w]?.classList.add('cel');
    for (const k of poz.kolumny) h.sumyKolumn[k]?.classList.add('cel');
    await czekaj(KROK_MS);
    for (const z of poz.zdjete) {
      stan[z.r][z.c] = null;
      h.pola[z.r]?.[z.c]?.classList.remove('znika');
    }
    rysujTlo(stan);
    poPoziomie?.(i);
    await czekaj(PRZERWA_MS);
  }
}
