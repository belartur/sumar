// Sumar — rysowanie oczek (kostkowa siatka 3x3, wartości 0..4).
// Układ kropek inny niż w kostkach klasycznych — autorski, czytelny na komórce.

/** Pozycje kropek w siatce 3x3 dla wartości 0..4. */
const KROPKI: Record<number, Array<[number, number]>> = {
  0: [],
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
  ],
};

/** Tworzy element pola z oczkami (div.oczek > 9 komórek z kropkami). */
export function elOczek(wartosc: number): HTMLElement {
  const el = document.createElement('div');
  el.className = 'oczek' + (wartosc === 0 ? ' zero' : '');
  el.dataset.v = String(wartosc);
  const kropki = KROPKI[wartosc] ?? [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const k = document.createElement('i');
      if (kropki.some(([kr, kc]) => kr === r && kc === c)) k.className = 'on';
      el.appendChild(k);
    }
  }
  return el;
}
