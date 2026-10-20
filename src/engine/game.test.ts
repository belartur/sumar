// Testy fasady Gry (opis.md), cz. 3: tury, trójki, koniec gry.
import { describe, expect, it } from 'vitest';
import { Gra } from './game.ts';
import { ROZMIAR } from './model.ts';
import { maRuch } from './rules.ts';

function stalyLos(...wartosci: number[]): () => number {
  let i = 0;
  return () => wartosci[i++ % wartosci.length];
}

describe('Gra (tury i koniec)', () => {
  it('odNowa rozdaje trójkę i zeruje punkty', () => {
    const g = new Gra(stalyLos(0.1, 0.2, 0.6, 0.3, 0.4, 0.7, 0.5, 0.8, 0.9));
    g.odNowa();
    expect(g.trojka).toHaveLength(3);
    expect(g.punkty).toBe(0);
    expect(g.tura).toBe(1);
    expect(g.koniec).toBe(false);
  });

  it('wyczerpanie trójki daje nową turę ze świeżymi slotami', () => {
    const g = new Gra(stalyLos(0.0, 0.0, 0.0, 0.1, 0.2, 0.3));
    g.odNowa();
    const s0 = g.postaw(0, 0, 0);
    expect(g.trojka[0].zuzyty).toBe(true);
    expect(s0.punkty).toBe(0);
    expect(s0.trojkaWyczerpana).toBe(false);
    g.postaw(1, 0, 2);
    const s2 = g.postaw(2, 1, 0);
    expect(s2.trojkaWyczerpana).toBe(true);
    expect(g.tura).toBe(2);
    expect(g.trojka.every((s) => !s.zuzyty)).toBe(true);
  });

  it('szachownica bez sąsiadujących pól = brak ruchów', () => {
    const g = new Gra(stalyLos(0.0));
    g.odNowa();
    for (let r = 0; r < ROZMIAR; r++)
      for (let c = 0; c < ROZMIAR; c++) if ((r + c) % 2 === 0) g.plansza[r][c] = 1;
    g.trojka = [
      { klocek: { a: 1, b: 1, ori: 'H' }, zuzyty: false },
      { klocek: { a: 1, b: 1, ori: 'V' }, zuzyty: false },
      { klocek: { a: 2, b: 2, ori: 'H' }, zuzyty: true },
    ];
    expect(maRuch(g.plansza, g.trojka[0].klocek)).toBe(false);
    expect(maRuch(g.plansza, g.trojka[1].klocek)).toBe(false);
    expect(g.jestJakisRuch()).toBe(false);
  });

  it('podwójne użycie slotu i gra po końcu rzucają błędem', () => {
    const g = new Gra(stalyLos(0.0));
    g.odNowa();
    g.postaw(0, 0, 0);
    expect(() => g.postaw(0, 2, 0)).toThrow();
    g.koniec = true;
    expect(() => g.postaw(1, 2, 0)).toThrow();
  });

  it('odNowa zeruje licznik wyczyszczonych plansz', () => {
    const g = new Gra(stalyLos(0.0));
    g.odNowa();
    g.wyczyszczonePlansze = 2;
    g.odNowa();
    expect(g.wyczyszczonePlansze).toBe(0);
  });

  it('pełne wyczyszczenie: bonus 5 przy N=0, N rośnie, punkty sumują linie+bonus', () => {
    const g = new Gra(stalyLos(0.0));
    g.odNowa();
    // Plansza: tylko [2] w (0,0); trójkę podmieniamy na sterowalną.
    g.plansza[0][0] = 2;
    g.trojka = [
      { klocek: { a: 0, b: 3, ori: 'H' }, zuzyty: false },
      { klocek: { a: 0, b: 0, ori: 'H' }, zuzyty: true },
      { klocek: { a: 0, b: 0, ori: 'H' }, zuzyty: true },
    ];
    const s = g.postaw(0, 0, 1);
    expect(s.czyCzystaPlansza).toBe(true);
    expect(s.nCzystychPrzed).toBe(0);
    expect(s.bonusCzysta).toBe(5);
    // Linie: 1 → 1 pkt + bonus 5 = 6 razem.
    expect(s.punkty).toBe(1);
    expect(s.punktyRazem).toBe(6);
    expect(g.punkty).toBe(6);
    expect(g.wyczyszczonePlansze).toBe(1);
  });

  it('drugie wyczyszczenie daje bonus 10', () => {
    const g = new Gra(stalyLos(0.0));
    g.odNowa();
    g.wyczyszczonePlansze = 1;
    g.plansza[0][0] = 2;
    g.trojka = [
      { klocek: { a: 0, b: 3, ori: 'H' }, zuzyty: false },
      { klocek: { a: 0, b: 0, ori: 'H' }, zuzyty: true },
      { klocek: { a: 0, b: 0, ori: 'H' }, zuzyty: true },
    ];
    const s = g.postaw(0, 0, 1);
    expect(s.nCzystychPrzed).toBe(1);
    expect(s.bonusCzysta).toBe(10);
    expect(s.punktyRazem).toBe(11);
    expect(g.wyczyszczonePlansze).toBe(2);
  });

  it('zwykły ruch bez czyszczenia całości: bonus 0, N bez zmian', () => {
    const g = new Gra(stalyLos(0.0));
    g.odNowa();
    const s = g.postaw(0, 0, 0);
    expect(s.czyCzystaPlansza).toBe(false);
    expect(s.bonusCzysta).toBe(0);
    expect(s.punktyRazem).toBe(s.punkty);
    expect(g.wyczyszczonePlansze).toBe(0);
  });
});
