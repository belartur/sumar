// Sumar — główny kontroler: spina Grę z DOM.
import { ROZMIAR } from '../engine/model.ts';
import { Gra } from '../engine/game.ts';
import { maRuch, sumyLinii } from '../engine/rules.ts';
import { zbudujWidok } from './czescC.ts';
import type { Uchwyty } from './uchwyty.ts';
import { rysujPlansze, rysujTrojke, potrzasnij } from './rysuj.ts';
import { wyczyscPodglad, malujPodglad } from './podglad.ts';
import { wczytajRekord } from './rekord.ts';
import { przelaczWyciszenie, czyWyciszony } from './dzwiek.ts';
import { wykonajRuch } from './ruch2.ts';
import { podepnijDnd } from './dnd.ts';
import { usunPlus } from './plus.ts';

export class Kontroler {
  private gra = new Gra(Math.random);
  private h: Uchwyty;
  private wybrany: number | null = null;
  private zajety = false;
  private rekord = 0;
  /** Po upuszczeniu ducha przeglądarka wyśle jeszcze click — tłumimy go raz. */
  private tlumKlik = false;
  private porzucDnd: (() => void) | null = null;

  /** Referencje dla modułu ruchu (bez naruszania enkapsulacji metod). */
  get graRef(): Gra {
    return this.gra;
  }
  get hRef(): Uchwyty {
    return this.h;
  }
  get wybranyRef(): number | null {
    return this.wybrany;
  }
  set wybranyRef(v: number | null) {
    this.wybrany = v;
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
    h.klocki.forEach((btn, i) => {
      // Click po sesji DnD (pointerup generuje click) — ignorujemy raz.
      btn.addEventListener('click', () => {
        if (this.tlumKlik) {
          this.tlumKlik = false;
          return;
        }
        this.wybierz(i);
      });
    });
    this.porzucDnd = podepnijDnd(h, () => this.gra, {
      upusc: (slot, r, c) => {
        this.tlumKlik = true;
        this.wybrany = slot;
        this.odswiezRef();
        void wykonajRuch(this, r, c);
      },
      czyMozna: (slot) => {
        if (this.zajety || this.gra.koniec) return false;
        const s = this.gra.trojka[slot];
        return !!s && !s.zuzyty && maRuch(this.gra.plansza, s.klocek);
      },
      poSesji: (przeciagnieto) => {
        if (przeciagnieto) this.tlumKlik = true; // pointerup mógł wygenerować click
        this.odswiezRef();
        this.autoRef();
      },
    });
    for (let r = 0; r < ROZMIAR; r++) {
      for (let c = 0; c < ROZMIAR; c++) {
        const b = h.pola[r][c];
        b.addEventListener('click', () => void wykonajRuch(this, r, c));
        b.addEventListener('pointerenter', () => {
          if (this.wybrany !== null && !this.zajety) malujPodglad(h, this.gra, this.wybrany, r, c);
        });
      }
    }
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
    usunPlus();
    this.porzucDnd?.();
    this.gra.odNowa();
    this.wybrany = null;
    this.zajety = false;
    this.tlumKlik = false;
    this.h.koniecNakladka.classList.add('ukryty');
    this.odswiez();
    this.autoWybierz();
  }

  /** Publiczne dla modułu ruchu. */
  odswiezRef(): void {
    const { gra, h } = this;
    const { wiersze, kolumny } = sumyLinii(gra.plansza);
    rysujPlansze(h, gra.plansza, wiersze, kolumny);
    const ruchome = gra.trojka.map((s) => (s.zuzyty ? false : maRuch(gra.plansza, s.klocek)));
    rysujTrojke(h, gra.trojka, this.wybrany, ruchome);
    h.punkty.textContent = String(gra.punkty);
    h.tura.textContent = String(gra.tura);
    h.czyste.textContent = String(gra.wyczyszczonePlansze);
    h.rekord.textContent = String(Math.max(this.rekord, gra.punkty));
  }

  /** Publiczne dla modułu ruchu. */
  autoRef(): void {
    if (this.wybrany !== null) return;
    const i = this.gra.trojka.findIndex((s) => !s.zuzyty && maRuch(this.gra.plansza, s.klocek));
    if (i >= 0) {
      this.wybrany = i;
      this.odswiezRef();
    }
  }

  private odswiez(): void {
    this.odswiezRef();
  }

  private autoWybierz(): void {
    this.autoRef();
  }

  private wybierz(i: number): void {
    if (this.zajety || this.gra.koniec) return;
    const s = this.gra.trojka[i];
    if (!s || s.zuzyty) return;
    if (!maRuch(this.gra.plansza, s.klocek)) {
      potrzasnij(this.h.klocki[i]);
      return;
    }
    this.wybrany = this.wybrany === i ? null : i;
    wyczyscPodglad(this.h);
    this.odswiez();
  }
}
