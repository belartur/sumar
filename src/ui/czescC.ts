// Sumar — szkielet DOM, cz. C: trójka + przyciski + nakładki.
import type { Uchwyty } from './uchwyty.ts';
import { czescA } from './czescA.ts';
import { czescB } from './czescB.ts';

export function zbudujWidok(korzen: HTMLElement): Uchwyty {
  const b = czescB(czescA(korzen));

  const trojka = document.createElement('div');
  trojka.className = 'trojka';
  const klocki: HTMLButtonElement[] = [];
  const polowki: HTMLElement[][] = [];
  for (let i = 0; i < 3; i++) {
    const k = document.createElement('button');
    k.type = 'button';
    k.className = 'klocek';
    const pod = document.createElement('div');
    pod.className = 'polowki';
    const p0 = document.createElement('div');
    p0.className = 'polowka';
    const p1 = document.createElement('div');
    p1.className = 'polowka';
    pod.append(p0, p1);
    k.append(pod);
    trojka.appendChild(k);
    klocki.push(k);
    polowki.push([p0, p1]);
  }
  b.w.appendChild(trojka);
  const dol = document.createElement('div');
  dol.className = 'dol';
  const mkBtn = (tekst: string, ghost: boolean): HTMLButtonElement => {
    const x = document.createElement('button');
    x.type = 'button';
    x.className = 'przycisk' + (ghost ? ' ghost' : '');
    x.textContent = tekst;
    dol.appendChild(x);
    return x;
  };
  const btnNowa = mkBtn('↺ Nowa gra', false);
  const btnZasady = mkBtn('? Zasady', true);
  const btnDzwiek = mkBtn('🔊 Dźwięk', true);
  b.w.appendChild(dol);
  const nak = czescNakladek();
  return { korzen: b.w, ...b, klocki, polowki, btnNowa, btnZasady, btnDzwiek, ...nak };
}

function punktyZasada(): DocumentFragment {
  const f = document.createDocumentFragment();
  f.append('Punkty: (L×(L+1)/2) × 2');
  const sup = document.createElement('sup');
  sup.textContent = 'K';
  f.append(sup, '; L to sumaryczna liczba linii, K to sumaryczna liczba kaskad.');
  return f;
}

function czescNakladek(): Pick<
  Uchwyty,
  'koniecNakladka' | 'koniecWynik' | 'koniecRekord' | 'zasadyNakladka' | 'btnJeszcze' | 'btnZamknij'
> {
  const koniecNakladka = document.createElement('div');
  koniecNakladka.className = 'nakladka ukryty';
  const karta = document.createElement('div');
  karta.className = 'karta';
  const tyt = document.createElement('h2');
  tyt.textContent = 'Koniec gry';
  const koniecWynik = document.createElement('div');
  koniecWynik.className = 'wynik-duzy';
  const koniecRekord = document.createElement('div');
  koniecRekord.className = 'rekord-linia';
  const btnJeszcze = document.createElement('button');
  btnJeszcze.type = 'button';
  btnJeszcze.className = 'przycisk';
  btnJeszcze.textContent = 'Zagraj jeszcze raz';
  karta.append(tyt, koniecWynik, koniecRekord, btnJeszcze);
  koniecNakladka.appendChild(karta);

  const zasadyNakladka = document.createElement('div');
  zasadyNakladka.className = 'nakladka ukryty';
  const kz = document.createElement('div');
  kz.className = 'karta';
  const zh = document.createElement('h2');
  zh.textContent = 'Jak grać?';
  const ul = document.createElement('ul');
  const zasady: Array<string | Node> = [
    'Plansza 5×5 startuje pusta. Dostajesz trójki klocków domino (0–4 oczka).',
    'Orientacja klocka jest losowana — wybierasz kolejność i miejsce.',
    'Linia znika, gdy suma = 5. Puste pola liczą się jak 0.',
    'Suma powyżej 5 to linia przegrzana — wróci do gry po zniknięciu przecinającej linii.',
    punktyZasada(),
    'Koniec, gdy żaden pozostały klocek nie ma ruchu.',
  ];
  for (const z of zasady) {
    const li = document.createElement('li');
    if (typeof z === 'string') li.textContent = z;
    else li.appendChild(z);
    ul.appendChild(li);
  }
  const btnZamknij = document.createElement('button');
  btnZamknij.type = 'button';
  btnZamknij.className = 'przycisk';
  btnZamknij.textContent = 'Rozumiem!';
  kz.append(zh, ul, btnZamknij);
  zasadyNakladka.appendChild(kz);
  document.body.append(koniecNakladka, zasadyNakladka);
  return { koniecNakladka, koniecWynik, koniecRekord, zasadyNakladka, btnJeszcze, btnZamknij };
}
