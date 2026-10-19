export const BOARD_SIZE = 5;

/** Liczba oczek na polu klocka (0–4). */
export type Pips = number;

export type Orientation = 'h' | 'v';

export interface Tile {
  a: Pips;
  b: Pips;
  orientation: Orientation;
}

/** Komórka planszy: null = pusta, 0–4 = liczba oczek. */
export type Cell = Pips | null;

/** Plansza 5×5: board[wiersz][kolumna]. */
export type Board = Cell[][];

export interface Position {
  r: number;
  c: number;
}

export interface GameState {
  board: Board;
  /** Pozostałe klocki z bieżącej trójki (1–3 szt.). */
  hand: Tile[];
  score: number;
  /** Numer bieżącej trójki (1-based). */
  turn: number;
  status: 'playing' | 'over';
}

/** Poziom kaskady: linie i komórki usunięte jednocześnie. */
export interface CascadeLevel {
  rows: number[];
  cols: number[];
  removedCells: Position[];
}
