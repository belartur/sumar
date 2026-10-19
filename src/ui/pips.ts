/** Pozycje kropkach na twarzy klocka (wzór jak na kości, 0–4). */
const PIP_POSITIONS: Record<number, string[]> = {
  0: [],
  1: ['c'],
  2: ['tl', 'br'],
  3: ['tl', 'c', 'br'],
  4: ['tl', 'tr', 'bl', 'br'],
};

/** Tworzy twarz klocka z kropkami dla wartości 0–4. */
export function createFace(value: number): HTMLElement {
  const face = document.createElement('div');
  face.className = 'face';
  for (const pos of PIP_POSITIONS[value] ?? []) {
    const pip = document.createElement('span');
    pip.className = `pip pip-${pos}`;
    face.appendChild(pip);
  }
  return face;
}
