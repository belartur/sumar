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
  polaKlocka,
  postawIPrzelicz,
  punktyZaRuch,
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
  it('nowy wzór: (L*(L+1)/2) * 2^K, L sumaryczne, K 0-bazowo', () => {
    expect(punktyZaRuch(1, 0)).toBe(1);
    expect(punktyZaRuch(2, 0)).toBe(3);
    expect(punktyZaRuch(1, 1)).toBe(2);
    expect(punktyZaRuch(2, 1)).toBe(6);
    expect(punktyZaRuch(3, 2)).toBe(24);
  });

  it('brak czyszczenia to 0 pkt', () => {
    expect(punktyZaRuch(0, 0)).toBe(0);
    expect(punktyZaRuch(0, 2)).toBe(0);
  });
});

describe('całkowite czyszczenie planszy', () => {
  it('czyPustaPlansza: pusta vs zajęta', () => {
    expect(czyPustaPlansza(pustaPlansza())).toBe(true);
    const p = pustaPlansza();
    p[2][2] = 1;
    expect(czyPustaPlansza(p)).toBe(false);
  });

  it('bonus 5N+5: N=0 → 5, N=1 → 10, N=2 → 15', () => {
    expect(bonusZaCalaPlansze(0)).toBe(5);
    expect(bonusZaCalaPlansze(1)).toBe(10);
    expect(bonusZaCalaPlansze(2)).toBe(15);
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
    expect(w.punkty).toBe(1);
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
    expect(w.punkty).toBe(3);
    expect(w.czyCzystaPlansza).toBe(false);
  });
});
