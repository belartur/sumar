// Sumar — model danych (nowa implementacja).
// Rozmyślnie inne nazewnictwo niż w innych wersjach, żeby łatwo porównać.

/** Rozmiar planszy (kwadratowej). */
export const ROZMIAR = 5;
/** Docelowa suma linii powodująca zniknięcie. */
export const CEL = 5;

/** Orientacja klocka wylosowana przy rozdaniu: 'H' = poziomo, 'V' = pionowo. */
export type Orientacja = 'H' | 'V';

/** Klocek domino: dwa pola o wartościach 0..4 + wylosowana orientacja. */
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

/** Komórka planszy: null = pusta, liczba 0..4 = oczka. */
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
  /** L — sumaryczna liczba linii ze wszystkich poziomów. */
  sumaLinii: number;
  /** K — sumaryczna liczba kaskad (indeks ostatniego poziomu, 0-bazowy; 0 gdy tylko poziom 0). */
  kaskady: number;
  /** Liczba poziomów kaskady (= poziomy.length; 0 gdy nic nie zniknęło). */
  liczbaPoziomow: number;
  /** L — liczba linii na pierwszym poziomie (pomocniczo, do testów). */
  linieStart: number;
  /** Punkty końcowe za ruch. */
  punkty: number;
  /** Punkty narastająco po każdej kaskadzie (gdyby ruch zakończył się w tym momencie). */
  punktyPoPoziomach: number[];
  /** Punkty przyrostowo na każdy poziom: [A, B-A, C-B, …]; suma = punkty. */
  punktyPrzyrostowo: number[];
}

/** Funkcja losująca z przedziału [0, 1). Wstrzykiwana dla testowalności. */
export type Los = () => number;
