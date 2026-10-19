import { anyLegalMove, canPlace, cloneBoard, emptyBoard, fullLines, tileCells } from './board';
import { defaultRng, randomInt, type Rng } from './rng';
import { BOARD_SIZE, type CascadeLevel, type GameState, type Position, type Tile } from './types';

export const MAX_PIPS = 4;
export const TRIPLE_SIZE = 3;

/** Bazowa liczba punktów za linię (sekcja 7 opis.md). */
const BASE_POINTS = 10;

/** Rozdaje trójkę klocków: oczka 0–4, obrót losowany przy rozdaniu. */
export function dealTriple(rng: Rng = defaultRng): Tile[] {
  return Array.from({ length: TRIPLE_SIZE }, () => ({
    a: randomInt(rng, MAX_PIPS + 1),
    b: randomInt(rng, MAX_PIPS + 1),
    orientation: rng() < 0.5 ? 'h' : 'v',
  }));
}

export function newGame(rng: Rng = defaultRng): GameState {
  return {
    board: emptyBoard(),
    hand: dealTriple(rng),
    score: 0,
    turn: 1,
    status: 'playing',
  };
}

/** Punkty za ruch: (10 + 10×(L−1)) × 2^(K−1); 0, gdy nic nie zniknęło. */
export function pointsFor(levels: readonly CascadeLevel[]): number {
  if (levels.length === 0) return 0;
  const l = levels[0].rows.length + levels[0].cols.length;
  return (BASE_POINTS + BASE_POINTS * (l - 1)) * 2 ** (levels.length - 1);
}

export interface PlacementResult {
  /** Stan gry po ruchu (po kaskadzie i ewentualnym rozdaniu nowej trójki). */
  state: GameState;
  levels: CascadeLevel[];
  points: number;
  placedCells: Position[];
  dealtNewTriple: boolean;
}

/**
 * Stawia klocek z ręki o indeksie handIndex w punkcie (r, c)
 * (lewy/górny róg klocka). Zwraca null, gdy ruch jest nielegalny:
 * poza planszą, zajęte komórki, brak klocka lub koniec gry.
 */
export function placeTile(
  state: GameState,
  handIndex: number,
  r: number,
  c: number,
  rng: Rng = defaultRng,
): PlacementResult | null {
  if (state.status !== 'playing') return null;
  const tile = state.hand[handIndex];
  if (!tile || !canPlace(state.board, tile, r, c)) return null;

  const board = cloneBoard(state.board);
  const cells = tileCells(tile, r, c);
  /* c8 ignore next -- nieosiągalne: canPlace już zweryfikowało geometrię */
  if (!cells) return null;
  const placedCells = cells.map((pos, i) => {
    board[pos.r][pos.c] = i === 0 ? tile.a : tile.b;
    return pos;
  });

  // Kaskada (sekcja 6 opis.md): poziomy aż do stabilizacji.
  const levels: CascadeLevel[] = [];
  for (;;) {
    const { rows, cols } = fullLines(board);
    if (rows.length === 0 && cols.length === 0) break;
    const removedCells: Position[] = [];
    for (const rr of rows) {
      for (let cc = 0; cc < BOARD_SIZE; cc++) {
        if (board[rr][cc] !== null) {
          board[rr][cc] = null;
          removedCells.push({ r: rr, c: cc });
        }
      }
    }
    for (const cc of cols) {
      for (let rr = 0; rr < BOARD_SIZE; rr++) {
        if (board[rr][cc] !== null) {
          board[rr][cc] = null;
          removedCells.push({ r: rr, c: cc });
        }
      }
    }
    levels.push({ rows, cols, removedCells });
  }

  const points = pointsFor(levels);

  const hand = state.hand.filter((_, i) => i !== handIndex);
  let dealtNewTriple = false;
  let turn = state.turn;
  if (hand.length === 0) {
    hand.push(...dealTriple(rng));
    turn += 1;
    dealtNewTriple = true;
  }

  // Koniec gry (sekcja 8 opis.md): żaden z pozostałych klocków nie ma pola.
  const status = anyLegalMove(board, hand) ? 'playing' : 'over';

  return {
    state: { board, hand, score: state.score + points, turn, status },
    levels,
    points,
    placedCells,
    dealtNewTriple,
  };
}
