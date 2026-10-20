// Sumar — stanowa fasada gry: tury, trójki, punkty, koniec gry.
import {
  type Klocek,
  type Los,
  type Plansza,
  type Poz,
  type SlotTrojki,
  type WynikRuchu,
} from './model.ts';
import { bonusZaCalaPlansze, klonujPlansze, losujTrojke, maRuch, postawIPrzelicz, pustaPlansza, sumyLinii } from './rules.ts';

export interface PodsumowanieRuchu extends WynikRuchu {
  /** Indeks slotu w trójce, który postawiono. */
  slot: number;
  /** Kotwica postawienia. */
  kotwica: Poz;
  /** Czy po ruchu trójka się wyczerpała (i rozdano nową, o ile gra trwa). */
  trojkaWyczerpana: boolean;
  /** Czy gra się zakończyła tym ruchem. */
  koniecGry: boolean;
  /** N przed ruchem (liczba dotychczas wyczyszczonych plansz). */
  nCzystychPrzed: number;
  /** Bonus za całkowite wyczyszczenie planszy (0 gdy brak). */
  bonusCzysta: number;
  /** Łączne punkty za ruch: linie + bonus za całą planszę. */
  punktyRazem: number;
}

export class Gra {
  plansza: Plansza = pustaPlansza();
  punkty = 0;
  tura = 1;
  trojka: SlotTrojki[] = [];
  koniec = false;
  wykonanychRuchow = 0;
  /** N — liczba dotychczas całkowicie wyczyszczonych plansz (od 0, reset na nową grę). */
  wyczyszczonePlansze = 0;

  constructor(private los: Los = Math.random) {}

  /** Start / restart gry. */
  odNowa(): void {
    this.plansza = pustaPlansza();
    this.punkty = 0;
    this.tura = 1;
    this.koniec = false;
    this.wykonanychRuchow = 0;
    this.wyczyszczonePlansze = 0;
    this.rozdajTrojke();
    // Świeża pusta plansza zawsze ma ruchy, ale sprawdzamy dla spójności.
    if (!this.jestJakisRuch()) this.koniec = true;
  }

  private rozdajTrojke(): void {
    const [a, b, c] = losujTrojke(this.los);
    this.trojka = [
      { klocek: a, zuzyty: false },
      { klocek: b, zuzyty: false },
      { klocek: c, zuzyty: false },
    ];
  }

  /** Klocki pozostałe do postawienia w bieżącej trójce. */
  pozostale(): { slot: number; klocek: Klocek }[] {
    return this.trojka.flatMap((s, slot) => (s.zuzyty ? [] : [{ slot, klocek: s.klocek }]));
  }

  /** Czy którykolwiek z pozostałych klocków ma legalne pole. */
  jestJakisRuch(): boolean {
    return this.pozostale().some(({ klocek }) => maRuch(this.plansza, klocek));
  }

  sumy(): { wiersze: number[]; kolumny: number[] } {
    return sumyLinii(this.plansza);
  }

  migawkaPlanszy(): Plansza {
    return klonujPlansze(this.plansza);
  }

  /**
   * Stawia klocek ze slotu na kotwicy (r, c).
   * Po każdym postawieniu: kaskada + punkty; po wyczerpaniu trójki: nowa trójka.
   * Koniec gry, gdy żaden pozostały klocek nie ma ruchu.
   */
  postaw(slot: number, r: number, c: number): PodsumowanieRuchu {
    if (this.koniec) throw new Error('Gra już się zakończyła.');
    const s = this.trojka[slot];
    if (!s) throw new RangeError(`Brak slotu ${slot}.`);
    if (s.zuzyty) throw new Error(`Klocek ze slotu ${slot} już postawiony.`);

    const wynik = postawIPrzelicz(this.plansza, s.klocek, r, c);
    s.zuzyty = true;
    const nCzystychPrzed = this.wyczyszczonePlansze;
    const bonusCzysta = wynik.czyCzystaPlansza ? bonusZaCalaPlansze(nCzystychPrzed) : 0;
    if (wynik.czyCzystaPlansza) this.wyczyszczonePlansze++;
    const punktyRazem = wynik.punkty + bonusCzysta;
    this.punkty += punktyRazem;
    this.wykonanychRuchow++;

    const wyczerpana = this.trojka.every((x) => x.zuzyty);
    let koniecGry = false;

    if (wyczerpana) {
      // Trójka wyczerpana → nowa tura z nową trójką.
      // Koniec tylko wtedy, gdy świeża trójka nie ma ruchu na tej planszy.
      this.tura++;
      this.rozdajTrojke();
      if (!this.jestJakisRuch()) koniecGry = true;
    } else if (!this.jestJakisRuch()) {
      // Środek trójki, ale żaden z pozostałych klocków nie ma ruchu.
      koniecGry = true;
    }

    if (koniecGry) this.koniec = true;
    return { ...wynik, slot, kotwica: { r, c }, trojkaWyczerpana: wyczerpana, koniecGry, nCzystychPrzed, bonusCzysta, punktyRazem };
  }
}
