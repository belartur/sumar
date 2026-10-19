import { describe, expect, it } from 'vitest';
import {
  anyLegalMove,
  canPlace,
  colSum,
  emptyBoard,
  fullLines,
  legalMoves,
  rowSum,
  tileCells,
} from './board';
import type { Board, Tile } from './types';
import { BOARD_SIZE } from './types';

/**
 * Buduje planszę z tekstowych wierszy: '0'–'4' = pole oczek, '.' = puste.
 * Uwaga: '0' to zajęte pole zerem oczek, a nie pusta komórka.
 */
function boardFrom(rows: string[]): Board {
  return rows.map((row) =>
    [...row].map((ch) => (ch === '.' ? null : Number(ch))),
  );
}

describe('sumy linii', () => {
  it('liczy sumy niepustych pól (puste = 0)', () => {
    // Wiersz 0 sumy 5 i kolumna 0 sumy 7 (przykłady z sekcji 4 opis.md)
    const board = boardFrom([
      '.2.3.',
      '1....',
      '2....',
      '4....',
      '.....',
    ]);
    expect(rowSum(board, 0)).toBe(5);
    expect(colSum(board, 0)).toBe(7);
    expect(rowSum(board, 1)).toBe(1);
  });

  it('wykrywa wiersz o sumie dokładnie 5 jako znikający', () => {
    const board = boardFrom([
      '.2.3.',
      '.....',
      '.....',
      '.....',
      '.....',
    ]);
    expect(fullLines(board)).toEqual({ rows: [0], cols: [] });
  });

  it('kolumna o sumie 7 jest przegrzana, nie znikająca', () => {
    const board = boardFrom([
      '1....',
      '.....',
      '2....',
      '4....',
      '.....',
    ]);
    expect(colSum(board, 0)).toBe(7);
    expect(fullLines(board)).toEqual({ rows: [], cols: [] });
  });

  it('pole o zerze oczek jest zajęte i nie dodaje do sumy', () => {
    const board = boardFrom(['0.....'.slice(0, 5), '.....', '.....', '.....', '.....']);
    expect(board[0][0]).toBe(0);
    expect(rowSum(board, 0)).toBe(0);
    expect(legalMoves(board, { a: 1, b: 1, orientation: 'h' }).some((m) => m.r === 0 && m.c === 0)).toBe(false);
  });
});

describe('geometria klocka', () => {
  const horizontal: Tile = { a: 2, b: 4, orientation: 'h' };
  const vertical: Tile = { a: 2, b: 4, orientation: 'v' };

  it('klocek poziomy zajmuje (r, c) i (r, c+1)', () => {
    expect(tileCells(horizontal, 1, 2)).toEqual([
      { r: 1, c: 2 },
      { r: 1, c: 3 },
    ]);
  });

  it('klocek pionowy zajmuje (r, c) i (r+1, c)', () => {
    expect(tileCells(vertical, 1, 2)).toEqual([
      { r: 1, c: 2 },
      { r: 2, c: 2 },
    ]);
  });

  it('odrzuca postawienie poza planszą', () => {
    expect(tileCells(horizontal, 0, BOARD_SIZE - 1)).toBeNull();
    expect(tileCells(vertical, BOARD_SIZE - 1, 0)).toBeNull();
    expect(canPlace(emptyBoard(), horizontal, 0, BOARD_SIZE - 1)).toBe(false);
    expect(canPlace(emptyBoard(), vertical, BOARD_SIZE - 1, 0)).toBe(false);
  });

  it('odrzuca postawienie na zajęte komórki', () => {
    const board = boardFrom([
      '.....',
      '..1..',
      '.....',
      '.....',
      '.....',
    ]);
    expect(canPlace(board, horizontal, 1, 1)).toBe(false); // koliduje z (1,2)
    expect(canPlace(board, horizontal, 1, 2)).toBe(false); // koliduje z (1,2)
    expect(canPlace(board, horizontal, 2, 1)).toBe(true);
  });

  it('na pełnej planszy nie ma żadnego ruchu', () => {
    const board = boardFrom([
      '11111',
      '11111',
      '11111',
      '11111',
      '11111',
    ]);
    expect(legalMoves(board, horizontal)).toEqual([]);
    expect(anyLegalMove(board, [horizontal, vertical])).toBe(false);
  });

  it('na pustej planszy każdy klocek ma dużo ruchów', () => {
    const board = emptyBoard();
    expect(legalMoves(board, horizontal).length).toBe(BOARD_SIZE * (BOARD_SIZE - 1));
    expect(legalMoves(board, vertical).length).toBe((BOARD_SIZE - 1) * BOARD_SIZE);
  });
});
