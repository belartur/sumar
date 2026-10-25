// Sumar — główny kontroler: spina Grę z DOM.
import { Gra } from '../engine/game.ts';
import { maRuch, sumyLinii } from '../engine/rules.ts';
import { zbudujWidok } from './czescC.ts';
import type { Uchwyty } from './uchwyty.ts';
import { rysujPlansze, rysujTrojke } from './rysuj.ts';
import { wczytajRekord, zapiszWynik } from './rekord.ts';
import { przelaczWyciszenie, czyWyciszony } from './dzwiek.ts';
import { wykonajRuch } from './ruch2.ts';
import { podepnijDnd } from './dnd.ts';
import { usunPlus } from './plus.ts';

export class Kontroler {
  private gra = new Gra(Math.random);
  private h: Uchwyty;
  private zajety = false;
  private rekord = 0;
  private porzucDnd: (() => void) | null = null;

  /** Referencje dla modułu ruchu (bez naruszania enkapsulacji metod). */
  get graRef(): Gra {
    return this.gra;
  }
  get hRef(): Uchwyty {
    return this.h;
  }
  get zajetyRef(): boolean {
    return this.zajety;
  }
  set zajetyRef(v: boolean) {
    this.zajety = v;
  }
  get rekordRef(): number {
    return this.rekord;
  }
  set rekordRef(v: number) {
    this.rekord = v;
  }

  constructor(korzen: HTMLElement) {
    this.h = zbudujWidok(korzen);
    this.rekord = wczytajRekord();
    this.wiazZdarzenia();
    this.nowaGra();
  }

  private wiazZdarzenia(): void {
    const { h } = this;
    this.porzucDnd = podepnijDnd(h, () => this.gra, {
      upusc: (slot, r, c) => {
        void wykonajRuch(this, slot, r, c);
      },
      czyMozna: (slot) => {
        if (this.zajety || this.gra.koniec) return false;
        const s = this.gra.trojka[slot];
        return !!s && !s.zuzyty && maRuch(this.gra.plansza, s.klocek);
      },
    });
    h.btnNowa.addEventListener('click', () => this.nowaGra());
    h.btnJeszcze.addEventListener('click', () => this.nowaGra());
    h.btnZasady.addEventListener('click', () => h.zasadyNakladka.classList.remove('ukryty'));
    h.btnZamknij.addEventListener('click', () => h.zasadyNakladka.classList.add('ukryty'));
    h.btnDzwiek.addEventListener('click', () => {
      const w = przelaczWyciszenie();
      h.btnDzwiek.textContent = w ? '🔇 Cisza' : '🔊 Dźwięk';
    });
    if (czyWyciszony()) h.btnDzwiek.textContent = '🔇 Cisza';
    h.zasadyNakladka.addEventListener('click', (e) => {
      if (e.target === h.zasadyNakladka) h.zasadyNakladka.classList.add('ukryty');
    });
  }

  private nowaGra(): void {
    // Przerwana partia też może ustanowić rekord — zapisz go przed resetem.
    if (zapiszWynik(this.gra.punkty)) this.rekord = this.gra.punkty;
    usunPlus();
    this.porzucDnd?.();
    this.gra.odNowa();
    this.zajety = false;
    this.h.koniecNakladka.classList.add('ukryty');
    this.odswiez();
  }

  /** Publiczne dla modułu ruchu. */
  odswiezRef(): void {
    const { gra, h } = this;
    const { wiersze, kolumny } = sumyLinii(gra.plansza);
    rysujPlansze(h, gra.plansza, wiersze, kolumny);
    const ruchome = gra.trojka.map((s) => (s.zuzyty ? false : maRuch(gra.plansza, s.klocek)));
    rysujTrojke(h, gra.trojka, ruchome);
    h.punkty.textContent = String(gra.punkty);
    h.tura.textContent = String(gra.tura);
    h.czyste.textContent = String(gra.wyczyszczonePlansze);
    h.rekord.textContent = String(Math.max(this.rekord, gra.punkty));
  }

  private odswiez(): void {
    this.odswiezRef();
  }
}
