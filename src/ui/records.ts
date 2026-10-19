const KEY = 'sumar.record';

export function loadRecord(): number {
  const raw = localStorage.getItem(KEY);
  const n = raw === null ? 0 : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Zapisuje rekord (jeśli score jest wyższy) i zwraca aktualny rekord. */
export function saveRecord(score: number): number {
  const best = Math.max(loadRecord(), score);
  localStorage.setItem(KEY, String(best));
  return best;
}
