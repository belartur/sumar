// Testy reguł Sumara (opis.md), cz. 1: plansza, ruchy, sumy, punktacja.
import { describe, expect, it } from 'vitest';
import { CEL } from './model.ts';
import {
  bonusZaCalaPlansze,
  czyLegalny,
  czyPustaPlansza,
  klonujPlansze,
  legalneRuchy,
  linieDoZdjecia,
  losujKlocek,
  losujWartoscPolowki,
  polaKlocka,
  postawIPrzelicz,
  punktyZaPoziom,
  pustaPlansza,
  sumyLinii,
} from './rules.ts';
import { PION, POZIOM, planszaZ } from './probe.ts';

describe('plansza i ruchy', () => {
  it('startuje pusta 5x5', () => {
    const p = pustaPlansza();
    expect(p).toHaveLength(5);
    expect(p.every((w) => w.length === 5 && w.every((v) => v === null))).toBe(true);
  });

  it('kotwica H to lewe pole, V to górne', () => {
    expect(polaKlocka(POZIOM, 1, 2)).toEqual([
      { r: 1, c: 2 },
      { r: 1, c: 3 },
    ]);
    expect(polaKlocka(PION, 1, 2)).toEqual([
      { r: 1, c: 2 },
      { r: 2, c: 2 },
    ]);
  });

  it('ruch wymaga dwóch pustych pól w planszy', () => {
    const p = pustaPlansza();
    expect(czyLegalny(p, POZIOM, 0, 0)).toBe(true);
    expect(czyLegalny(p, POZIOM, 0, 4)).toBe(false);
    expect(czyLegalny(p, PION, 4, 0)).toBe(false);
    p[0][1] = 1;
    expect(czyLegalny(p, POZIOM, 0, 0)).toBe(false);
  });

  it('pusta plansza: 20 kotwic H i 20 kotwic V', () => {
    const p = pustaPlansza();
    expect(legalneRuchy(p, POZIOM)).toHaveLength(20);
    expect(legalneRuchy(p, PION)).toHaveLength(20);
  });

  it('nielegalne postawienie rzuca RangeError', () => {
    expect(() => postawIPrzelicz(pustaPlansza(), POZIOM, 0, 4)).toThrow(RangeError);
  });

  it('klon jest niezależny', () => {
    const p = pustaPlansza();
    const k = klonujPlansze(p);
    k[0][0] = 4;
    expect(p[0][0]).toBe(null);
  });
});

describe('sumy linii', () => {
  it('puste komórki liczą się jak 0', () => {
    expect(sumyLinii(planszaZ([[null, 2, null, 3, null]])).wiersze[0]).toBe(5);
  });

  it('przykład z opisu: wiersz = 5 znika, kolumna = 7 nie', () => {
    const p = planszaZ([
      [null, 1, null, null, null],
      [null, null, null, null, null],
      [null, 2, null, 3, null],
      [null, 4, null, null, null],
      [null, null, null, null, null],
    ]);
    const { wiersze, kolumny } = linieDoZdjecia(p);
    expect(wiersze).toEqual([2]);
    expect(kolumny).toEqual([]);
    expect(CEL).toBe(5);
  });
});

describe('punktacja', () => {
  it('wzór na poziom: p*l*2^k, k 0-bazowo', () => {
    expect(punktyZaPoziom(3, 1, 0)).toBe(3);
    expect(punktyZaPoziom(4, 2, 0)).toBe(8);
    expect(punktyZaPoziom(3, 1, 1)).toBe(6);
    expect(punktyZaPoziom(2, 1, 2)).toBe(8);
    expect(punktyZaPoziom(2, 2, 2)).toBe(16);
  });

  it('brak pól lub linii to 0 pkt', () => {
    expect(punktyZaPoziom(0, 0, 0)).toBe(0);
    expect(punktyZaPoziom(0, 2, 1)).toBe(0);
    expect(punktyZaPoziom(3, 0, 2)).toBe(0);
  });
});

describe('klocki ujemne', () => {
  const losZ = (r: number) => () => r;

  it('pole ujemne: r>=0.9 daje -1..-4, nigdy -0', () => {
    expect(losujWartoscPolowki(losZ(0.9))).toBe(-1);
    // Uwaga: granice przedziałów zaburzone przez FP (np. r=0.95 wpada do -2),
    // istotny jest rozkład ~2.5% na każdą wartość ujemną.
    expect(losujWartoscPolowki(losZ(0.94))).toBe(-2);
    expect(losujWartoscPolowki(losZ(0.96))).toBe(-3);
    expect(losujWartoscPolowki(losZ(0.9999))).toBe(-4);
    const v = losujWartoscPolowki(losZ(0.9));
    expect(Object.is(v, -0)).toBe(false);
  });

  it('pole dodatnie: r<0.9 daje 0..4 (stare losy bez zmian)', () => {
    expect(losujWartoscPolowki(losZ(0.0))).toBe(0);
    expect(losujWartoscPolowki(losZ(0.18))).toBe(1);
    expect(losujWartoscPolowki(losZ(0.89))).toBe(4);
  });

  it('wartości zawsze z zakresu -4..4 i bez -0 (próbkowanie)', () => {
    for (let i = 0; i < 1000; i++) {
      const v = losujWartoscPolowki(Math.random);
      expect(v).toBeGreaterThanOrEqual(-4);
      expect(v).toBeLessThanOrEqual(4);
      expect(v === 0 || Math.abs(v) >= 1).toBe(true);
      expect(Object.is(v, -0)).toBe(false);
    }
  });

  it('występują wszystkie konfiguracje: (-,+), (-,-), (+,-)', () => {
    // Mapowanie: los r → wartość. Dobieramy r tak, by wymusić ujemne/dodatnie.
    const uj = (v: number): number => 0.9 + ((-v - 1) * 0.1) / 4 + 0.001; // r → -v
    const dod = (v: number): number => (v * 0.9) / 5 + 0.001; // r → v
    const k1 = losujKlocek(() => 0); // dodatnie + dodatnie + H (r<0.5)
    expect(k1.a).toBe(0);
    expect(k1.b).toBe(0);
    expect(k1.ori).toBe('H');
    // sekwencja: a=-2, b=3, ori(V): 3 wywołania na klocek
    const sekw = [uj(-2), dod(3), 0.6];
    let i = 0;
    const k2 = losujKlocek(() => sekw[i++ % sekw.length]);
    expect(k2.a).toBe(-2);
    expect(k2.b).toBe(3);
    expect(k2.ori).toBe('V');
    // oba ujemne
    const sekw2 = [uj(-1), uj(-4), 0.1];
    let j = 0;
    const k3 = losujKlocek(() => sekw2[j++ % sekw2.length]);
    expect(k3.a).toBe(-1);
    expect(k3.b).toBe(-4);
  });

  it('stary deterministyczny los 0.0 dalej daje klocek (0,0) H', () => {
    const k = losujKlocek(() => 0);
    expect(k).toEqual({ a: 0, b: 0, ori: 'H' });
  });

  it('suma linii: ujemne odejmują', () => {
    expect(sumyLinii(planszaZ([[4, -1, null, 2, null]])).wiersze[0]).toBe(5);
    expect(sumyLinii(planszaZ([[-2, -3, null, null, null]])).wiersze[0]).toBe(-5);
  });

  it('linia o sumie ujemnej jest niepełna (nie znika)', () => {
    const p = planszaZ([[-2, -3, null, null, null]]);
    expect(linieDoZdjecia(p).wiersze).toEqual([]);
  });

  it('postawienie z ujemną połówką domyka sumę do 5', () => {
    // Wiersz 0 = [4, null, 3] → 7; stawiamy (-1,0) H w (0,1): 7 + (-1) + 0 = 6... lepiej:
    // Wiersz 0 = [3, 3] → 6 (przegrzana); klocek (-1, 0) H na (0,2),(0,3): 6-1+0=5.
    const p = planszaZ([[3, 3, null, null, null]]);
    const w = postawIPrzelicz(p, { a: -1, b: 0, ori: 'H' }, 0, 2);
    expect(w.sumaLinii).toBe(1);
    expect(w.punkty).toBe(4); // p=4 pola, l=1 linia, k=0
    expect(p[0].every((v) => v === null)).toBe(true);
  });

  it('klocek ujemny ustawia ujemną wartość na planszy', () => {
    const p = pustaPlansza();
    postawIPrzelicz(p, { a: -2, b: 4, ori: 'V' }, 1, 1);
    expect(p[1][1]).toBe(-2);
    expect(p[2][1]).toBe(4);
  });
});

describe('całkowite czyszczenie planszy', () => {
  it('czyPustaPlansza: pusta vs zajęta', () => {
    expect(czyPustaPlansza(pustaPlansza())).toBe(true);
    const p = pustaPlansza();
    p[2][2] = 1;
    expect(czyPustaPlansza(p)).toBe(false);
  });

  it('bonus 10×N: numer czyszczenia 1 → 10, 2 → 20, 3 → 30', () => {
    expect(bonusZaCalaPlansze(1)).toBe(10);
    expect(bonusZaCalaPlansze(2)).toBe(20);
    expect(bonusZaCalaPlansze(3)).toBe(30);
  });

  it('ruch bez kaskady nie daje flagi czystej planszy', () => {
    const w = postawIPrzelicz(pustaPlansza(), { a: 1, b: 1, ori: 'H' }, 0, 0);
    expect(w.liczbaPoziomow).toBe(0);
    expect(w.czyCzystaPlansza).toBe(false);
    expect(w.punkty).toBe(0);
  });

  it('jedyny klocek (2,3) zdjęty linią czyści planszę', () => {
    // Plansza: wiersz 0 = [2, null x4], stawiamy (0,3) H w (0,1) → wiersz 0 = 5 → znika wszystko.
    const p = planszaZ([[2, null, null, null, null]]);
    const w = postawIPrzelicz(p, { a: 0, b: 3, ori: 'H' }, 0, 1);
    expect(w.sumaLinii).toBe(1);
    expect(w.punkty).toBe(3); // p=3 pola, l=1 linia, k=0
    expect(w.czyCzystaPlansza).toBe(true);
    expect(czyPustaPlansza(p)).toBe(true);
  });

  it('kaskada bez pełnego wyczyszczenia nie daje flagi', () => {
    const p = planszaZ([
      [1, null, 2, null, null],
      [null, 3, null, null, null],
      [1, null, null, null, null],
      [null, null, 1, null, 2],
      [null, null, null, null, null],
    ]);
    const w = postawIPrzelicz(p, { a: 2, b: 3, ori: 'V' }, 1, 3);
    expect(w.punkty).toBe(6); // p=3 pola, l=2 linie, k=0
    expect(w.czyCzystaPlansza).toBe(false);
  });
});
