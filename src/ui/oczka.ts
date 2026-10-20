// Sumar — rysowanie oczek (kostkowa siatka 3x3, wartości -4..4 bez -0).
// Układ kropek inny niż w kostkach klasycznych — autorski, czytelny na komórce.
// Ujemne rysują tyle kropek, ile wynosi |wartość|, na jasnoczerwonym tle (klasa `ujemne`).

/** Pozycje kropek w siatce 3x3 dla wartości 0..4 (|wartości| dla ujemnych). */
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
  el.className = 'oczek' + (wartosc < 0 ? ' ujemne' : '');
  el.dataset.v = String(wartosc);
  const kropki = KROPKI[Math.abs(Math.trunc(wartosc))] ?? [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const k = document.createElement('i');
      if (kropki.some(([kr, kc]) => kr === r && kc === c)) k.className = 'on';
      el.appendChild(k);
    }
  }
  return el;
}

/**
 * Etykieta słowna wartości do aria-label (bez znaku '-': ujemne to 'ujemne X').
 */
export function etykietaWartosci(wartosc: number): string {
  return wartosc < 0 ? `ujemne ${Math.abs(Math.trunc(wartosc))}` : String(wartosc);
}
