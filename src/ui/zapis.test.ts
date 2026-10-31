// Testy zapisu i odczytu stanu partii (bez localStorage).
import { describe, expect, it } from 'vitest';
import { Gra } from '../engine/game.ts';
import { odkodujStan, zakodujStan } from './zapis.ts';

function nowaGra(): Gra {
  const g = new Gra(() => 0);
  g.odNowa();
  return g;
}

describe('zapis stanu gry', () => {
  it('odtwarza kompletny stan zapisany w trakcie partii', () => {
    const g = nowaGra();
    g.postaw(0, 0, 0);
    g.punkty += 21;
    g.tura += 3;
    g.wyczyszczonePlansze = 2;

    const odczyt = odkodujStan(zakodujStan(g));
    expect(odczyt).not.toBeNull();
    expect(odczyt).toMatchObject({
      plansza: g.plansza,
      punkty: g.punkty,
      tura: g.tura,
      trojka: g.trojka,
      koniec: g.koniec,
      wykonanychRuchow: g.wykonanychRuchow,
      wyczyszczonePlansze: g.wyczyszczonePlansze,
    });
  });

  it('odrzuca niepoprawny JSON i niezgodną wersję zapisu', () => {
    expect(odkodujStan('to nie jest JSON')).toBeNull();

    const dane = JSON.parse(zakodujStan(nowaGra()));
    dane.wersja = 999;
    expect(odkodujStan(JSON.stringify(dane))).toBeNull();
  });

  it('odrzuca planszę o złym rozmiarze lub z niedozwoloną wartością', () => {
    const dane = JSON.parse(zakodujStan(nowaGra()));
    dane.plansza[0][0] = 5;
    expect(odkodujStan(JSON.stringify(dane))).toBeNull();

    dane.plansza[0][0] = null;
    dane.plansza[0].push(null);
    expect(odkodujStan(JSON.stringify(dane))).toBeNull();
  });

  it('odrzuca trójkę z niepoprawnym klockiem lub bez dostępnego slotu', () => {
    const zlyKlocek = JSON.parse(zakodujStan(nowaGra()));
    zlyKlocek.trojka[0].klocek.a = 7;
    expect(odkodujStan(JSON.stringify(zlyKlocek))).toBeNull();

    const brakSlotu = JSON.parse(zakodujStan(nowaGra()));
    for (const slot of brakSlotu.trojka) slot.zuzyty = true;
    expect(odkodujStan(JSON.stringify(brakSlotu))).toBeNull();
  });
});
