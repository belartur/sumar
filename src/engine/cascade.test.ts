// Testy kaskad Sumara (opis.md), cz. 2: scenariusz tury 4 i odmrażanie.
import { describe, expect, it } from 'vitest';
import type { Klocek } from './model.ts';
import { postawIPrzelicz } from './rules.ts';
import { planszaZ } from './probe.ts';

describe('stawianie i kaskady', () => {
  it('tura 4 z opisu: (2,3) V w kol. 4 → wiersz 2 i kolumna 4, 3 pkt', () => {
    const p = planszaZ([
      [1, null, 2, null, null],
      [null, 3, null, null, null],
      [1, null, null, null, null],
      [null, null, 1, null, 2],
      [null, null, null, null, null],
    ]);
    const w = postawIPrzelicz(p, { a: 2, b: 3, ori: 'V' }, 1, 3);
    expect(w.linieStart).toBe(2);
    expect(w.liczbaPoziomow).toBe(1);
    expect(w.sumaLinii).toBe(2);
    expect(w.kaskady).toBe(0);
    expect(w.punktyPoPoziomach).toEqual([3]);
    expect(w.punktyPrzyrostowo).toEqual([3]);
    expect(w.punkty).toBe(3);
    expect(p[1]).toEqual([null, null, null, null, null]);
    expect(p[2][3]).toBe(null);
    expect(p[0][0]).toBe(1);
    expect(p[0][2]).toBe(2);
  });

  it('odmrażanie: kolumna 7 → 5 po zniknięciu wiersza (K=1, 6 pkt)', () => {
    const p = planszaZ([
      [3, null, null, null, null],
      [2, null, null, null, null],
      [1, null, null, null, null],
      [1, null, null, null, null],
      [null, null, null, null, null],
    ]);
    const w = postawIPrzelicz(p, { a: 3, b: 1, ori: 'V' }, 1, 1);
    expect(w.linieStart).toBe(1);
    expect(w.liczbaPoziomow).toBe(2);
    expect(w.sumaLinii).toBe(2);
    expect(w.kaskady).toBe(1);
    // Po 0. kaskadzie gracz dostałby 1 pkt, gdyby ruch się tam zakończył.
    expect(w.punktyPoPoziomach).toEqual([1, 6]);
    // Dymki przyrostowe: +1, potem +5 — sumują się do 6.
    expect(w.punktyPrzyrostowo).toEqual([1, 5]);
    expect(w.punktyPrzyrostowo.reduce((a, b) => a + b, 0)).toBe(w.punkty);
    expect(w.punkty).toBe(6);
    expect(w.poziomy[0].wiersze).toEqual([1]);
    expect(w.poziomy[1].kolumny).toEqual([0]);
    expect(p.map((r) => r[0])).toEqual([null, null, null, null, null]);
  });

  it('przecięcia linii liczone raz przy zdejmowaniu', () => {
    // Wiersz 0 = 1+4 = 5 i kolumna 0 = 1+4 = 5 już na planszy.
    // Stawiamy (0,0) H na dole, żeby odpalić kaskadę bez zmiany tych linii.
    const p = planszaZ([
      [1, null, 4, null, null],
      [4, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null],
    ]);
    const zero: Klocek = { a: 0, b: 0, ori: 'H' };
    const w = postawIPrzelicz(p, zero, 4, 0);
    expect(w.linieStart).toBe(2);
    // Poziom 1: wiersz 0 → (0,0)=1, (0,2)=4; kolumna 0 → (0,0), (1,0)=4,
    // a zero (4,0) też należy do kolumny 0 → 4 unikalne komórki, suma 9.
    expect(w.poziomy[0].zdjete).toHaveLength(4);
    expect(w.poziomy[0].zdjete.reduce((a, z) => a + z.v, 0)).toBe(9);
    expect(w.sumaLinii).toBe(2);
    expect(w.kaskady).toBe(0);
    expect(w.punktyPrzyrostowo).toEqual([3]);
    expect(w.punkty).toBe(3);
  });

  it('kaskada z ujemną: przegrzany wiersz 7 → 5, potem kolumna do 5 (K=1, 6 pkt)', () => {
    // Wiersz 1 = 4 + 3 = 7 (przegrzany); kolumna 2 = 3 + 4 + 1 = 8.
    // Stawiamy (-2, 0) H w (1,3): wiersz 1 = 7 - 2 + 0 = 5 → znika.
    // Z kolumny 2 ubywa 3 → 4 + 1 = 5 → kaskada (poziom 1).
    const p = planszaZ([
      [null, null, null, null, null],
      [4, null, 3, null, null],
      [null, null, 4, null, null],
      [null, null, 1, null, null],
      [null, null, null, null, null],
    ]);
    const w = postawIPrzelicz(p, { a: -2, b: 0, ori: 'H' }, 1, 3);
    expect(w.linieStart).toBe(1);
    expect(w.liczbaPoziomow).toBe(2);
    expect(w.sumaLinii).toBe(2);
    expect(w.kaskady).toBe(1);
    expect(w.punktyPoPoziomach).toEqual([1, 6]);
    expect(w.punktyPrzyrostowo).toEqual([1, 5]);
    expect(w.punkty).toBe(6);
    expect(w.poziomy[0].wiersze).toEqual([1]);
    expect(w.poziomy[1].kolumny).toEqual([2]);
    expect(p.every((r) => r.every((v) => v === null))).toBe(true);
  });
});
