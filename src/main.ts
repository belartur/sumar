import './style.css';
import { GameUI } from './ui/game-ui';

const root = document.getElementById('app');
if (!root) throw new Error('brak elementu #app');
new GameUI(root);
