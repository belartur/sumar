import type { Board, Position, Tile } from './types';
import { BOARD_SIZE } from './types';

export function emptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  );
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}

export function rowSum(board: Board, r: number): number {
  let sum = 0;
  for (let c = 0; c < BOARD_SIZE; c++) sum += board[r][c] ?? 0;
  return sum;
}

export function colSum(board: Board, c: number): number {
  let sum = 0;
  for (let r = 0; r < BOARD_SIZE; r++) sum += board[r][c] ?? 0;
  return sum;
}

/** Wiersze i kolumny o sumie dokładnie 5 (kandydaci do usunięcia). */
export function fullLines(board: Board): { rows: number[]; cols: number[] } {
  const rows: number[] = [];
  const cols: number[] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (rowSum(board, i) === 5) rows.push(i);
    if (colSum(board, i) === 5) cols.push(i);
  }
  return { rows, cols };
}

/** Komórki zajmowane przez klocek postawiony o punkcie (r, c); null poza planszą. */
export function tileCells(tile: Tile, r: number, c: number): Position[] | null {
  if (r < 0 || c < 0 || r >= BOARD_SIZE || c >= BOARD_SIZE) return null;
  const second = tile.orientation === 'h' ? { r, c: c + 1 } : { r: r + 1, c };
  if (second.r >= BOARD_SIZE || second.c >= BOARD_SIZE) return null;
  return [{ r, c }, second];
}

export function canPlace(board: Board, tile: Tile, r: number, c: number): boolean {
  const cells = tileCells(tile, r, c);
  if (!cells) return false;
  return cells.every(({ r: rr, c: cc }) => board[rr][cc] === null);
}

/** Wszystkie legalne punkty postawienia klocka (lewy/górny róg). */
export function legalMoves(board: Board, tile: Tile): Position[] {
  const moves: Position[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (canPlace(board, tile, r, c)) moves.push({ r, c });
    }
  }
  return moves;
}

export function anyLegalMove(board: Board, tiles: readonly Tile[]): boolean {
  return tiles.some((tile) => legalMoves(board, tile).length > 0);
}
