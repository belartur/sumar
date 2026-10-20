// Testy reguł Sumara (opis.md), cz. 1: plansza, ruchy, sumy, punktacja.
import { describe, expect, it } from 'vitest';
import { CEL } from './model.ts';
import {
  czyLegalny,
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
  it('tabela z opisu (sekcja 7)', () => {
    expect(punktyZaRuch(1, 1)).toBe(10);
    expect(punktyZaRuch(2, 1)).toBe(20);
    expect(punktyZaRuch(1, 2)).toBe(20);
    expect(punktyZaRuch(2, 2)).toBe(40);
    expect(punktyZaRuch(3, 3)).toBe(120);
  });

  it('brak czyszczenia to 0 pkt', () => {
    expect(punktyZaRuch(0, 0)).toBe(0);
    expect(punktyZaRuch(1, 0)).toBe(0);
  });
});
