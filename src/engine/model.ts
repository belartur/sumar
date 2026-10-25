// Sumar — model danych (nowa implementacja).
// Rozmyślnie inne nazewnictwo niż w innych wersjach, żeby łatwo porównać.

/** Rozmiar planszy (kwadratowej). */
export const ROZMIAR = 5;
/** Docelowa suma linii powodująca zniknięcie. */
export const CEL = 5;

/** Orientacja klocka wylosowana przy rozdaniu: 'H' = poziomo, 'V' = pionowo. */
export type Orientacja = 'H' | 'V';

/** Klocek domino: dwa pola o wartościach -4..4 bez -0 (ujemne -4..-1, dodatnie 0..4) + wylosowana orientacja. */
export interface Klocek {
  a: number;
  b: number;
  ori: Orientacja;
}

/** Pozycja komórki na planszy. */
export interface Poz {
  r: number;
  c: number;
}

/** Komórka planszy: null = pusta, liczba -4..4 bez -0 = oczka (ujemne obniżają sumę linii). */
export type Komorka = number | null;

/** Plansza: ROZMIAR x ROZMIAR komórek. */
export type Plansza = Komorka[][];

/** Miejsce w trójce: klocek + flaga zużycia. */
export interface SlotTrojki {
  klocek: Klocek;
  zuzyty: boolean;
}

/** Jedna usunięta komórka w kaskadzie (z zapamiętaną wartością do animacji). */
export interface UsunietaKomorka extends Poz {
  v: number;
}

/** Jeden poziom kaskady: które linie zniknęły i jakie komórki zdjęto. */
export interface PoziomKaskady {
  wiersze: number[];
  kolumny: number[];
  zdjete: UsunietaKomorka[];
}

/** Wynik jednego postawienia klocka. */
export interface WynikRuchu {
  poziomy: PoziomKaskady[];
  /** Suma l_k — liczba linii usuniętych na wszystkich poziomach. */
  sumaLinii: number;
  /** K — indeks ostatniego poziomu (0-bazowy; 0 gdy tylko poziom 0). */
  kaskady: number;
  /** Liczba poziomów kaskady (= poziomy.length; 0 gdy nic nie zniknęło). */
  liczbaPoziomow: number;
  /** l_0 — liczba linii usuniętych na pierwszym poziomie (pomocniczo, do testów). */
  linieStart: number;
  /** Punkty końcowe za ruch: suma p_k*l_k*2^k (bez bonusu za całą planszę). */
  punkty: number;
  /** Punkty narastająco po każdym poziomie (suma poziomów 0..i). */
  punktyPoPoziomach: number[];
  /** Punkty za poszczególne poziomy: p_k*l_k*2^k; suma = punkty. */
  punktyPrzyrostowo: number[];
  /** Czy po pełnej kaskadzie plansza jest w 100% pusta (bonus za czyszczenie). */
  czyCzystaPlansza: boolean;
}

/** Funkcja losująca z przedziału [0, 1). Wstrzykiwana dla testowalności. */
export type Los = () => number;
