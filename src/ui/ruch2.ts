// Sumar — dokończenie Kontrolera: wykonanie ruchu z animacją kaskady.
import type { Plansza } from '../engine/model.ts';
import { czyLegalny, klonujPlansze, polaKlocka, sumyLinii } from '../engine/rules.ts';
import type { Kontroler } from './kontroler.ts';
import { rysujPlansze } from './rysuj.ts';
import { animujKaskade } from './anim.ts';
import { plusCzystaPlansza, plusPrzyrostowy, plusKoniecRuchu } from './plus.ts';
import { wyczyscPodglad } from './podglad.ts';
import { zapiszWynik } from './rekord.ts';
import { zapiszStan } from './zapis.ts';
import { dzwiekPostawienia, dzwiekCzyszczenia, dzwiekKonca, dzwiekRekordu } from './dzwiek.ts';

export async function wykonajRuch(k: Kontroler, slot: number, r: number, c: number): Promise<void> {
  const g = k.graRef;
  const h = k.hRef;
  if (k.zajetyRef || g.koniec) return;
  const klocek = g.trojka[slot]?.klocek;
  if (!klocek) return;
  if (!czyLegalny(g.plansza, klocek, r, c)) return;
  k.zajetyRef = true;
  wyczyscPodglad(h);
  dzwiekPostawienia();

  // Stan tuż po postawieniu, przed zdjęciami (do animacji).
  const [p1, p2] = polaKlocka(klocek, r, c);
  const poPostawieniu: Plansza = klonujPlansze(g.plansza);
  poPostawieniu[p1.r][p1.c] = klocek.a;
  poPostawieniu[p2.r][p2.c] = klocek.b;

  // Wynik sumaryczny (z całej gry) zmienia się dopiero po zakończonym ruchu,
  // więc zamrażamy wyświetloną sumę na czas kaskady.
  const punktyPrzedRuchem = g.punkty;
  const zamrozPunkty = (): void => {
    h.punkty.textContent = String(punktyPrzedRuchem);
    h.rekord.textContent = String(Math.max(k.rekordRef, punktyPrzedRuchem));
  };

  const wynik = g.postaw(slot, r, c);
  // Zapisujemy stan od razu po ruchu, jeszcze przed animacją kaskady.
  zapiszStan(g);

  const rysujTlo = (p: Plansza): void => {
    const s = sumyLinii(p);
    rysujPlansze(h, p, s.wiersze, s.kolumny);
  };
  // 1) Pokaż postawiony klocek (punkty wciąż sprzed ruchu — aż do jego końca).
  rysujTlo(poPostawieniu);
  h.pola[p1.r][p1.c].classList.add('wpada');
  h.pola[p2.r][p2.c].classList.add('wpada');
  k.odswiezRef();
  zamrozPunkty();
  // Odświeżenie zresetowało klasy animacji — nałóż je ponownie na stan po postawieniu.
  rysujTlo(poPostawieniu);
  h.pola[p1.r][p1.c].classList.add('wpada');
  h.pola[p2.r][p2.c].classList.add('wpada');

  // 2) Kaskada poziom po poziomie. Po każdej kaskadzie pojawia się NOWY dymek
  // z punktami za dany poziom (p×l×2^k) — dymki sumują się do punktów za cały ruch.
  // Każdy dymek nad środkiem pól zdjętych na SWOIM poziomie.
  if (wynik.liczbaPoziomow > 0) {
    dzwiekCzyszczenia(wynik.liczbaPoziomow);
    await animujKaskade(h, poPostawieniu, wynik.poziomy, rysujTlo, (i) => {
      plusPrzyrostowy(h, wynik.punktyPrzyrostowo[i], wynik.poziomy[i].zdjete, i);
      zamrozPunkty();
    });
    if (wynik.bonusCzysta > 0) plusCzystaPlansza(h, wynik.bonusCzysta);
    // Dymki znikają niezależnie ~1400ms po swoim pojawieniu.
    plusKoniecRuchu();
  }

  k.zajetyRef = false;
  if (wynik.koniecGry) pokazKoniec(k);
  else k.odswiezRef();
}

/** Pokazuje ekran końca gry. `zDzwiekiem = false` przy wznawianiu zapisanej partii. */
export function pokazKoniec(k: Kontroler, zDzwiekiem = true): void {
  const g = k.graRef;
  const h = k.hRef;
  k.odswiezRef();
  const pobity = zapiszWynik(g.punkty);
  if (pobity) k.rekordRef = g.punkty;
  if (zDzwiekiem) {
    if (pobity) dzwiekRekordu();
    else dzwiekKonca();
  }
  if (pobity) {
    h.koniecWynik.textContent = `${g.punkty} pkt 🏆`;
    h.koniecRekord.textContent = 'Nowy rekord! Gratulacje!';
  } else {
    h.koniecWynik.textContent = `${g.punkty} pkt`;
    h.koniecRekord.textContent = k.rekordRef > 0 ? `Rekord: ${k.rekordRef} pkt` : 'Zagraj jeszcze raz!';
  }
  h.rekord.textContent = String(Math.max(k.rekordRef, g.punkty));
  h.koniecNakladka.classList.remove('ukryty');
}
