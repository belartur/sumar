import { describe, expect, it } from 'vitest';
import type { Board, GameState, Tile } from './types';
import { legalMoves } from './board';
import { dealTriple, newGame, placeTile, pointsFor } from './game';
import { mulberry32 } from './rng';

/** Patrz board.test.ts — '0'–'4' = pole oczek, '.' = puste. */
function boardFrom(rows: string[]): Board {
  return rows.map((row) =>
    [...row].map((ch) => (ch === '.' ? null : Number(ch))),
  );
}

function stateFrom(rows: string[], hand: Tile[], score = 0): GameState {
  return {
    board: boardFrom(rows),
    hand,
    score,
    turn: 1,
    status: 'playing',
  };
}

describe('pointsFor — tabela punktacji z sekcji 7 opis.md', () => {
  const level = (rows: number[], cols: number[]) => ({ rows, cols, removedCells: [] });

  it('1 linia bez kaskady = 10', () => {
    expect(pointsFor([level([0], [])])).toBe(10);
  });

  it('wiersz i kolumna jednocześnie = 20', () => {
    expect(pointsFor([level([1], [3])])).toBe(20);
  });

  it('kaskada 2 poziomy, po 1 linii = 20', () => {
    expect(pointsFor([level([0], []), level([], [2])])).toBe(20);
  });

  it('2 linie na starcie, potem 1 = 40', () => {
    expect(pointsFor([level([0, 4], []), level([], [1])])).toBe(40);
  });

  it('3 linie naraz + podwójna kaskada = 120', () => {
    expect(pointsFor([level([0, 1], [4]), level([2], []), level([], [3])])).toBe(120);
  });

  it('brak zniknięć = 0', () => {
    expect(pointsFor([])).toBe(0);
  });
});

describe('przykład rozgrywki ze sekcji 9 opis.md', () => {
  const hand: Tile[] = [
    { a: 2, b: 3, orientation: 'v' },
    { a: 1, b: 1, orientation: 'h' },
    { a: 0, b: 2, orientation: 'v' },
  ];

  it('stawia (2,3) pionowo w kolumnie 4 → znika wiersz 2 i kolumna 4, +20 pkt', () => {
    const state = stateFrom(['1.2..', '.3...', '1....', '..1.2', '.....'], hand);
    const result = placeTile(state, 0, 1, 3, mulberry32(1));
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.levels).toHaveLength(1);
    expect(result.levels[0].rows).toEqual([1]);
    expect(result.levels[0].cols).toEqual([3]);
    expect(result.points).toBe(20);
    expect(result.state.score).toBe(20);

    // Plansza po usunięciu wiersza 2 i kolumny 4
    expect(result.state.board).toEqual(boardFrom([
      '1.2..',
      '.....',
      '1....',
      '..1.2',
      '.....',
    ]));
    // Pozostały dwa klocki z trójki, bez nowej trójki
    expect(result.state.hand).toHaveLength(2);
    expect(result.dealtNewTriple).toBe(false);
    expect(result.state.status).toBe('playing');
  });
});

describe('kaskada z odmrażaniem — przykład z sekcji 9 opis.md', () => {
  it('przegrzana kolumna 7 schodzi do 5 po zniknięciu wiersza → K=2, +20 pkt', () => {
    const state = stateFrom(
      ['3....', '2....', '1....', '1....', '.....'],
      [{ a: 3, b: 1, orientation: 'v' }],
    );
    const result = placeTile(state, 0, 1, 1, mulberry32(1));
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.levels).toHaveLength(2);
    expect(result.levels[0].rows).toEqual([1]); // poziom 1: wiersz 2
    expect(result.levels[1].cols).toEqual([0]); // poziom 2: kolumna 1 (odmrożona)
    expect(result.points).toBe(20);
    expect(result.state.score).toBe(20);
    expect(result.state.board).toEqual(boardFrom([
      '.....',
      '.....',
      '.1...',
      '.....',
      '.....',
    ]));
  });
});

describe('placeTile', () => {
  const tile: Tile = { a: 2, b: 3, orientation: 'v' };

  it('odrzuca indeks spoza ręki', () => {
    const state = stateFrom(['.....', '.....', '.....', '.....', '.....'], [tile]);
    expect(placeTile(state, 1, 0, 0)).toBeNull();
    expect(placeTile(state, -1, 0, 0)).toBeNull();
  });

  it('odrzuca nielegalne pole i nie zmienia stanu', () => {
    const state = stateFrom(['1....', '1....', '.....', '.....', '.....'], [tile]);
    expect(placeTile(state, 0, 0, 0)).toBeNull(); // (0,0) zajęte
    expect(state.board[0][0]).toBe(1);
    expect(state.score).toBe(0);
  });

  it('odrzuca ruch po zakończeniu gry', () => {
    const state = {
      ...stateFrom(['.....', '.....', '.....', '.....', '.....'], [tile]),
      status: 'over' as const,
    };
    expect(placeTile(state, 0, 0, 0)).toBeNull();
  });

  it('klocek z zerem oczek zajmuje pole, nie zmieniając sum', () => {
    const zero: Tile = { a: 0, b: 2, orientation: 'h' };
    const state = stateFrom(['.....', '.....', '.....', '.....', '.....'], [zero]);
    const result = placeTile(state, 0, 0, 0, mulberry32(1));
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.points).toBe(0);
    expect(result.state.board[0][0]).toBe(0);
    expect(result.state.board[0][1]).toBe(2);
  });

  it('suma powyżej 5 nie znika (linia przegrzana przetrwa ruch)', () => {
    const state = stateFrom(['2....', '.....', '.....', '.....', '.....'], [{ a: 4, b: 0, orientation: 'h' }]);
    const result = placeTile(state, 0, 0, 1, mulberry32(1));
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.points).toBe(0);
    expect(result.levels).toHaveLength(0);
    expect(result.state.board[0]).toEqual([2, 4, 0, null, null]);
  });
});

describe('przebieg tury (sekcja 3 opis.md)', () => {
  it('gracz zużywa trójkę, dopiero potem dostaje nową', () => {
    const rng = mulberry32(42);
    let state = newGame(rng);
    expect(state.hand).toHaveLength(3);
    expect(state.turn).toBe(1);

    const hand0 = state.hand.map((t) => ({ ...t }));
    // Stawiamy zawsze pierwszy klocek z ręki na pierwszym legalnym polu
    // (kierunek zależy od wylosowanego obrotu — stąd dynamiczny wybór).
    const playFirst = (s: GameState): GameState | null => {
      const moves = legalMoves(s.board, s.hand[0]);
      if (moves.length === 0) return null;
      const result = placeTile(s, 0, moves[0].r, moves[0].c, rng);
      return result ? result.state : null;
    };

    const afterFirst = playFirst(state);
    expect(afterFirst).not.toBeNull();
    if (!afterFirst) return;
    state = afterFirst;
    expect(state.hand).toHaveLength(2);
    expect(state.turn).toBe(1);

    const afterSecond = playFirst(state);
    expect(afterSecond).not.toBeNull();
    if (!afterSecond) return;
    state = afterSecond;
    expect(state.hand).toHaveLength(1);
    expect(state.turn).toBe(1);

    const afterThird = playFirst(state);
    expect(afterThird).not.toBeNull();
    if (!afterThird) return;
    state = afterThird;
    // Trójka wyczerpana → nowa trójka i nowa tura
    expect(state.hand).toHaveLength(3);
    expect(state.turn).toBe(2);
    // Dobrana trójka różni się od zagranej
    expect(state.hand).not.toEqual(hand0);
  });
});

describe('koniec gry (sekcja 8 opis.md)', () => {
  it('poziomy klocek nie wejdzie w pionową dziurę → null', () => {
    const state = stateFrom(
      ['11111', '111.1', '11111', '11111', '111.1'],
      [{ a: 1, b: 2, orientation: 'h' }],
    );
    expect(placeTile(state, 0, 1, 3, mulberry32(1))).toBeNull();
  });

  it('pionowy klocek nie wejdzie w pojedynczą dziurę → null', () => {
    const state = stateFrom(
      ['11111', '11111', '11111', '1111.', '11111'],
      [{ a: 1, b: 1, orientation: 'v' }],
      100,
    );
    // (4,3) zajęte → brak drugiej komórki
    expect(placeTile(state, 0, 3, 3, mulberry32(7))).toBeNull();
  });

  it('pełna plansza bez ruchu kończy grę', () => {
    const state = stateFrom(
      ['22222', '22222', '22222', '22222', '22222'],
      [{ a: 1, b: 1, orientation: 'h' }],
    );
    expect(placeTile(state, 0, 0, 0)).toBeNull();
  });

  it('zapełnienie ostatniej pary komórek kończy grę (brak ruchów dla nowej trójki)', () => {
    // Wartości 2 dają sumy 10 — żadna linia nie zniknie; puste są tylko (3,3),(3,4).
    const state = stateFrom(
      ['22222', '22222', '22222', '222..', '22222'],
      [{ a: 2, b: 2, orientation: 'h' }],
      50,
    );
    const result = placeTile(state, 0, 3, 3, mulberry32(99));
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.dealtNewTriple).toBe(true);
    // Plansza zapełniona → rozdana trójka nie ma gdzie stanąć
    expect(result.state.board.every((row) => row.every((cell) => cell !== null))).toBe(true);
    expect(result.state.status).toBe('over');
  });
});

describe('dealTriple', () => {
  it('daje trzy klocki o oczkach 0–4 i losowym obrocie', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 50; i++) {
      const triple = dealTriple(rng);
      expect(triple).toHaveLength(3);
      for (const t of triple) {
        expect(t.a).toBeGreaterThanOrEqual(0);
        expect(t.a).toBeLessThanOrEqual(4);
        expect(t.b).toBeGreaterThanOrEqual(0);
        expect(t.b).toBeLessThanOrEqual(4);
        expect(['h', 'v']).toContain(t.orientation);
      }
    }
  });

  it('jest deterministyczny dla tego samego ziarna', () => {
    expect(dealTriple(mulberry32(123))).toEqual(dealTriple(mulberry32(123)));
  });
});
