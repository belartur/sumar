// Sumar — dźwięki WebAudio (celowo inna synteza niż w innych wersjach).
// Proste „blipy": postawienie, czyszczenie (wysokość rośnie z kaskadą), game over.

let ctx: AudioContext | null = null;
let wyciszony = false;

export function czyWyciszony(): boolean {
  return wyciszony;
}

export function przelaczWyciszenie(): boolean {
  wyciszony = !wyciszony;
  return wyciszony;
}

function audio(): AudioContext | null {
  if (wyciszony) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function blip(czestotliwosc: number, czasTrwania: number, opoznienie: number, glosnosc = 0.08): void {
  const ac = audio();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + opoznienie;
    const osc = ac.createOscillator();
    const wzm = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(czestotliwosc, t0);
    wzm.gain.setValueAtTime(0.0001, t0);
    wzm.gain.exponentialRampToValueAtTime(glosnosc, t0 + 0.015);
    wzm.gain.exponentialRampToValueAtTime(0.0001, t0 + czasTrwania);
    osc.connect(wzm).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + czasTrwania + 0.02);
  } catch {
    /* cisza awaryjna */
  }
}

/** Krótkie kliknięcie przy postawieniu klocka. */
export function dzwiekPostawienia(): void {
  blip(340, 0.09, 0);
}

/** Arpeggio czyszczenia; poziom kaskady podnosi dźwięki. */
export function dzwiekCzyszczenia(poziomow: number): void {
  const n = Math.min(Math.max(poziomow, 1), 5);
  for (let i = 0; i < n; i++) blip(520 * 2 ** (i / 3), 0.16, i * 0.09);
}

/** Smutna zniżka na koniec gry. */
export function dzwiekKonca(): void {
  blip(300, 0.18, 0);
  blip(210, 0.28, 0.16);
}

/** Wesoła fanfara rekordu. */
export function dzwiekRekordu(): void {
  for (const [f, d] of [[523, 0], [659, 0.1], [784, 0.2], [1046, 0.3]] as const) blip(f, 0.22, d);
}
