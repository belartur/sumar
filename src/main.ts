// Sumar — punkt wejścia (nowa implementacja).
import './style.css';
import { Kontroler } from './ui/kontroler.ts';

const korzen = document.getElementById('app');
if (!korzen) throw new Error('Brak elementu #app');

new Kontroler(korzen);
