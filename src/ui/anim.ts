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
 */
export async function animujKaskade(
  h: Uchwyty,
  poPostawieniu: Plansza,
  poziomy: PoziomKaskady[],
  rysujTlo: (p: Plansza) => void,
): Promise<void> {
  let stan = klonujPlansze(poPostawieniu);
  for (const poz of poziomy) {
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
    await czekaj(PRZERWA_MS);
  }
}
