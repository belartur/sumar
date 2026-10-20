// Sumar — dokończenie Kontrolera: wykonanie ruchu z animacją kaskady.
import type { Plansza } from '../engine/model.ts';
import { czyLegalny, klonujPlansze, polaKlocka, sumyLinii } from '../engine/rules.ts';
import type { Kontroler } from './kontroler.ts';
import { rysujPlansze, powiedz, pokazBonus } from './rysuj.ts';
import { animujKaskade } from './anim.ts';
import { wyczyscPodglad, malujPodglad } from './podglad.ts';
import { zapiszWynik } from './rekord.ts';
import { dzwiekPostawienia, dzwiekCzyszczenia, dzwiekKonca, dzwiekRekordu } from './dzwiek.ts';

export async function wykonajRuch(k: Kontroler, r: number, c: number): Promise<void> {
  const g = k.graRef;
  const h = k.hRef;
  if (k.zajetyRef || g.koniec) return;
  if (k.wybranyRef === null) {
    powiedz(h, 'Najpierw wybierz klocek z trójki.');
    return;
  }
  const slot = k.wybranyRef;
  const klocek = g.trojka[slot]?.klocek;
  if (!klocek) return;
  if (!czyLegalny(g.plansza, klocek, r, c)) {
    malujPodglad(h, g, slot, r, c);
    powiedz(h, 'Tu nie pasuje — oba pola muszą być puste.');
    return;
  }
  k.zajetyRef = true;
  wyczyscPodglad(h);
  dzwiekPostawienia();

  // Stan tuż po postawieniu, przed zdjęciami (do animacji).
  const [p1, p2] = polaKlocka(klocek, r, c);
  const poPostawieniu: Plansza = klonujPlansze(g.plansza);
  poPostawieniu[p1.r][p1.c] = klocek.a;
  poPostawieniu[p2.r][p2.c] = klocek.b;

  const wynik = g.postaw(slot, r, c);
  k.wybranyRef = null;

  const rysujTlo = (p: Plansza): void => {
    const s = sumyLinii(p);
    rysujPlansze(h, p, s.wiersze, s.kolumny);
  };
  // 1) Pokaż postawiony klocek (punkty/tura już po ruchu).
  rysujTlo(poPostawieniu);
  h.pola[p1.r][p1.c].classList.add('wpada');
  h.pola[p2.r][p2.c].classList.add('wpada');
  k.odswiezRef();
  // Odświeżenie zresetowało klasy animacji — nałóż je ponownie na stan po postawieniu.
  rysujTlo(poPostawieniu);
  h.pola[p1.r][p1.c].classList.add('wpada');
  h.pola[p2.r][p2.c].classList.add('wpada');

  // 2) Kaskada poziom po poziomie.
  if (wynik.liczbaPoziomow > 0) {
    dzwiekCzyszczenia(wynik.liczbaPoziomow);
    await animujKaskade(h, poPostawieniu, wynik.poziomy, rysujTlo);
    const opis =
      wynik.liczbaPoziomow > 1
        ? `Kaskada ×${wynik.liczbaPoziomow}! +${wynik.punkty} pkt (L=${wynik.linieStart}).`
        : `Zniknęło linii: ${wynik.linieStart}. +${wynik.punkty} pkt!`;
    pokazBonus(h, opis);
    powiedz(h, opis);
  } else {
    powiedz(h, wynik.trojkaWyczerpana ? `Trójka wyczerpana — tura ${g.tura}.` : 'Postaw kolejny klocek z trójki.');
  }

  k.zajetyRef = false;
  if (wynik.koniecGry) zakoncz(k);
  else {
    k.odswiezRef();
    k.autoRef();
  }
}

function zakoncz(k: Kontroler): void {
  const g = k.graRef;
  const h = k.hRef;
  k.odswiezRef();
  const pobity = zapiszWynik(g.punkty);
  if (pobity) {
    k.rekordRef = g.punkty;
    dzwiekRekordu();
    h.koniecWynik.textContent = `${g.punkty} pkt 🏆`;
    h.koniecRekord.textContent = 'Nowy rekord! Gratulacje!';
  } else {
    dzwiekKonca();
    h.koniecWynik.textContent = `${g.punkty} pkt`;
    h.koniecRekord.textContent = k.rekordRef > 0 ? `Rekord: ${k.rekordRef} pkt` : 'Zagraj jeszcze raz!';
  }
  h.rekord.textContent = String(Math.max(k.rekordRef, g.punkty));
  h.koniecNakladka.classList.remove('ukryty');
  powiedz(h, 'Koniec gry — żaden klocek nie ma ruchu.');
}
