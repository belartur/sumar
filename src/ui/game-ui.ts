import { canPlace, cloneBoard, legalMoves } from '../game/board';
import { newGame, placeTile } from '../game/game';
import type { Board, GameState } from '../game/types';
import { BOARD_SIZE } from '../game/types';
import { createFace } from './pips';
import { loadRecord, saveRecord } from './records';

const ANIM_MS = 350;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Kontroler UI: render planszy/ręki, wybór klocka, podgląd, animacje kaskady.
 * Input: tap/klik na klocek → wybór; tap/klik na planszę → postawienie.
 * Podgląd (hover) działa też na desktopie.
 */
export class GameUI {
  private state: GameState = newGame();
  private selectedIndex: number | null = null;
  private busy = false;

  private readonly boardEl: HTMLElement;
  private readonly handEl: HTMLElement;
  private readonly scoreEl: HTMLElement;
  private readonly recordEl: HTMLElement;
  private readonly turnEl: HTMLElement;
  private readonly hintEl: HTMLElement;
  private readonly overlayEl: HTMLElement;
  private readonly cells: HTMLButtonElement[] = [];

  constructor(root: HTMLElement) {
    root.innerHTML = `
      <header class="topbar">
        <h1>SUMAR</h1>
        <div class="stats">
          <span class="stat">Wynik: <strong id="score">0</strong></span>
          <span class="stat">Rekord: <strong id="record">0</strong></span>
          <span class="stat">Tura: <strong id="turn">1</strong></span>
        </div>
      </header>
      <p class="hint" id="hint"></p>
      <div class="board" id="board" role="grid" aria-label="Plansza 5×5"></div>
      <div class="hand" id="hand" aria-label="Twoje klocki"></div>
      <div class="overlay hidden" id="overlay">
        <div class="panel">
          <h2>Koniec gry</h2>
          <p>Twój wynik: <strong id="final-score">0</strong></p>
          <p id="record-info"></p>
          <button type="button" id="new-game">Nowa gra</button>
        </div>
      </div>`;

    this.boardEl = root.querySelector('#board')!;
    this.handEl = root.querySelector('#hand')!;
    this.scoreEl = root.querySelector('#score')!;
    this.recordEl = root.querySelector('#record')!;
    this.turnEl = root.querySelector('#turn')!;
    this.hintEl = root.querySelector('#hint')!;
    this.overlayEl = root.querySelector('#overlay')!;
    root.querySelector<HTMLButtonElement>('#new-game')!.addEventListener('click', () => this.restart());

    this.buildBoard();
    this.renderAll();
    this.updateHint();
  }

  private buildBoard(): void {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cell';
        cell.setAttribute('role', 'gridcell');
        cell.dataset.r = String(r);
        cell.dataset.c = String(c);
        cell.addEventListener('click', () => this.onCell(r, c));
        cell.addEventListener('pointerenter', () => this.onHover(r, c));
        cell.addEventListener('pointerleave', () => this.onHover(null, null));
        this.cells.push(cell);
        this.boardEl.appendChild(cell);
      }
    }
  }

  private renderAll(): void {
    this.renderBoard(this.state.board);
    this.renderHand();
    this.scoreEl.textContent = String(this.state.score);
    this.recordEl.textContent = String(loadRecord());
    this.turnEl.textContent = String(this.state.turn);
    this.updateHighlights();
  }

  private renderBoard(board: Board): void {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = this.cells[r * BOARD_SIZE + c];
        const value = board[r][c];
        cell.classList.toggle('filled', value !== null);
        cell.replaceChildren();
        if (value !== null) cell.appendChild(createFace(value));
        cell.setAttribute('aria-label', value === null ? 'puste' : `${value} oczek`);
      }
    }
  }

  private renderHand(): void {
    this.handEl.replaceChildren();
    this.state.hand.forEach((tile, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tile ${tile.orientation === 'v' ? 'vertical' : 'horizontal'}`;
      if (index === this.selectedIndex) btn.classList.add('selected');
      btn.append(createFace(tile.a), createFace(tile.b));
      btn.setAttribute('aria-label', `Klocek ${tile.a}-${tile.b}`);
      btn.addEventListener('click', () => this.onTile(index));
      this.handEl.appendChild(btn);
    });
  }

  // ---------- interakcje ----------

  private onTile(index: number): void {
    if (this.busy) return;
    this.selectedIndex = this.selectedIndex === index ? null : index;
    this.renderHand();
    this.updateHighlights();
    this.updateHint();
  }

  private onCell(r: number, c: number): void {
    if (this.busy || this.selectedIndex === null) return;
    const tile = this.state.hand[this.selectedIndex];
    if (!tile || !canPlace(this.state.board, tile, r, c)) return;
    void this.placeSelected(r, c);
  }

  private onHover(r: number | null, c: number | null): void {
    if (this.busy || this.selectedIndex === null) {
      this.clearGhost();
      return;
    }
    const tile = this.state.hand[this.selectedIndex];
    if (!tile || r === null || c === null || !canPlace(this.state.board, tile, r, c)) {
      this.clearGhost();
      return;
    }
    this.clearGhost();
    const cells = tile.orientation === 'h' ? [[r, c], [r, c + 1]] : [[r, c], [r + 1, c]];
    const values = [tile.a, tile.b];
    cells.forEach(([rr, cc], i) => {
      const cell = this.cells[rr * BOARD_SIZE + cc];
      cell.classList.add('ghost');
      cell.append(createFace(values[i]));
    });
  }

  private clearGhost(): void {
    for (const cell of this.cells) {
      if (!cell.classList.contains('ghost')) continue;
      cell.classList.remove('ghost');
      const r = Number(cell.dataset.r);
      const c = Number(cell.dataset.c);
      const value = this.state.board[r][c];
      cell.replaceChildren();
      if (value !== null) cell.appendChild(createFace(value));
    }
  }

  /** Podświetla legalne pola startowe dla wybranego klocka. */
  private updateHighlights(): void {
    for (const cell of this.cells) cell.classList.remove('legal');
    if (this.selectedIndex === null) return;
    const tile = this.state.hand[this.selectedIndex];
    if (!tile) return;
    for (const { r, c } of legalMoves(this.state.board, tile)) {
      this.cells[r * BOARD_SIZE + c].classList.add('legal');
    }
  }

  private updateHint(): void {
    if (this.state.status === 'over') {
      this.hintEl.textContent = 'Koniec gry — brak możliwych ruchów.';
      return;
    }
    this.hintEl.textContent = this.selectedIndex === null
      ? 'Wybierz klocek z trójki poniżej.'
      : 'Dotknij podświetlonego pola, aby postawić klocek.';
  }

  // ---------- ruch i animacje ----------

  private async placeSelected(r: number, c: number): Promise<void> {
    const index = this.selectedIndex;
    if (index === null) return;
    const tile = this.state.hand[index];
    const result = placeTile(this.state, index, r, c);
    if (!result) return;

    this.busy = true;
    this.selectedIndex = null;
    this.clearGhost();
    for (const cell of this.cells) cell.classList.remove('legal');

    // Plansza tuż po postawieniu, przed kaskadą
    const preCascade = cloneBoard(this.state.board);
    preCascade[r][c] = tile.a;
    const second = tile.orientation === 'h' ? { r, c: c + 1 } : { r: r + 1, c };
    preCascade[second.r][second.c] = tile.b;
    this.renderBoard(preCascade);
    // Ręka bez właśnie postawionego klocka
    this.handEl.replaceChildren();
    this.state.hand.forEach((t, i) => {
      if (i === index) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tile ${t.orientation === 'v' ? 'vertical' : 'horizontal'}`;
      btn.append(createFace(t.a), createFace(t.b));
      btn.setAttribute('aria-label', `Klocek ${t.a}-${t.b}`);
      btn.disabled = true;
      this.handEl.appendChild(btn);
    });
    await sleep(ANIM_MS);

    // Kaskada poziom po poziomie
    for (const level of result.levels) {
      for (const { r: rr, c: cc } of level.removedCells) {
        this.cells[rr * BOARD_SIZE + cc].classList.add('clearing');
      }
      await sleep(ANIM_MS);
      for (const { r: rr, c: cc } of level.removedCells) {
        this.cells[rr * BOARD_SIZE + cc].classList.remove('clearing');
        preCascade[rr][cc] = null;
      }
      this.renderBoard(preCascade);
    }

    this.state = result.state;
    this.renderAll();
    this.updateHint();
    if (result.points > 0) this.popScore(result.points);
    this.busy = false;

    if (this.state.status === 'over') this.showGameOver();
  }

  private popScore(points: number): void {
    const pop = document.createElement('div');
    pop.className = 'pop';
    pop.textContent = `+${points}`;
    this.boardEl.appendChild(pop);
    setTimeout(() => pop.remove(), 900);
  }

  private showGameOver(): void {
    const best = saveRecord(this.state.score);
    this.overlayEl.querySelector<HTMLElement>('#final-score')!.textContent = String(this.state.score);
    this.overlayEl.querySelector<HTMLElement>('#record-info')!.textContent =
      this.state.score >= best && this.state.score > 0
        ? '🎉 Nowy rekord!'
        : `Rekord: ${best}`;
    this.overlayEl.classList.remove('hidden');
    this.updateHint();
  }

  private restart(): void {
    this.state = newGame();
    this.selectedIndex = null;
    this.busy = false;
    this.overlayEl.classList.add('hidden');
    this.renderAll();
    this.updateHint();
  }
}
