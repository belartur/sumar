# Sumar — opis gry

## 1. Idea główna

„Sumar" to gra logiczna dla jednego gracza, rozgrywana na planszy **5×5**, która startuje pusta. Gracz otrzymuje po kolei **trójki losowych klocków domina** (każde pole klocka ma od **0 do 4 oczek**; pola bywają też **ujemne — od -1 do -4**, wtedy **obniżają** sumę rzędu/kolumny zamiast ją podwyższać; obrót każdego klocka jest **losowany** w chwili rozdania — gracz go nie wybiera). Wszystkie trzy klocki z trójki muszą zostać postawione na planszy, ale gracz **wybiera kolejność**, w jakiej je ustawia. Zadanie polega na takim układaniu klocków, aby **suma oczek w rzędzie lub kolumnie wynosiła dokładnie 5** — wtedy cały rząd/kolumna **znika**, a gracz zdobywa punkty.

Rząd/kolumna nie musi być wypełniony, by zniknąć — liczy się tylko suma niepustych pól. Sumy **powyżej 5 nie są wyrokiem śmierci** — można je obniżyć, usuwając klocki z przecinających rzędów/kolumn.

## 2. Komponenty

| Element | Opis |
|---|---|
| Plansza | Siatka 5×5 = 25 komórek; każda komórka jest pusta lub zajęta przez jedno pole klocka (wartość -4..4, bez -0) |
| Klocek (domino) | Dwa pola `(a, b)`, każde z wartością 0, 1, 2, 3, 4 albo ujemną -1, -2, -3, -4; układane na dwach **sąsiadujących** komórkach — poziomo lub pionowo |
| Pole ujemne | Wartości **-1..-4** (nie ma -0, bo istnieje już +0). Powstaje **znacznie rzadziej** niż pole dodatnie (~10% na każde pole). Wizualnie: **jasnoczerwone tło** + narysowane oczka (tyle, ile wynosi wartość bezwzględna); bez znaku „−" na kafelku |
| Obrót klocka | **Losowany** przy rozdaniu klocka; gracz nie ma wpływu na orientację danego klocka |
| Licznik punktów | Wynik całkowity w punktach |
| Trójka klocków | Gracz zawsze widzi komplet **trzech** klocków (każdy z wylosowanym obrotem); nie może żadnego wymienić ani odrzucić — musi postawić wszystkie trzy, sam wybierając **kolejność** ustawiania |
| Stan linii | Każdy rząd i kolumna ma sumę oczek; stany: *niepełna* (suma < 5, w tym sumy ujemne), *do usunięcia* (suma = 5), *przegrzana* (suma > 5) |

## 3. Przebieg tury

Jedna tura = rozdanie **trójki klocków** i obowiązkowe postawienie wszystkich trzech:

1. Gracz **otrzymuje losowo trzy klocki**; obrót (poziomy/pionowy) każdego z nich jest losowany przy rozdaniu i niezmienialny.
2. Gracz **wybiera kolejność** ustawiania spośród tych trzech klocki (dowolna permutacja).
3. Dla wybranego klocka gracz wskazuje komórkę początkową. Ruch jest legalny, gdy **obie komórki są puste** i odpowiadają wylosowanemu obrotowi. *(Suma rzędu/kolumny po dopełnieniu może przekroczyć 5 — to dozwolone.)*
4. Klocek zostaje postawiony.
5. Następuje **przeliczenie i kaskada** (sekcja 6) oraz przyznanie punktów (sekcja 7) — po **każdym** postawieniu, nie dopiero po całej trójce.
6. Gracz wybiera kolejny klocek z pozostałych dwóch i wraca do kroku 3, aż trójka zostanie wyczerpana.
7. Gra losuje **następną trójkę** i przechodzi do kolejnej tury.

## 4. Zasada znikania

- **Rząd lub kolumna znika, gdy suma oczek w jego niepustych polach wynosi dokładnie 5.**
- Linia **nie musi być wypełniona** — puste komórki nie wchodzą do sumy (tzn. liczą się jak 0).
- Klocek z zerem oczek jest zwyczajnym klockiem: zajmuje miejsce i „zjada" potencjał sumy.
- **Pola ujemne (-1..-4) odejmują się od sumy** — klocek ujemny to normalny klocek, który *obniża* sumę linii (np. żeby uratować przegrzany wiersz). Zasada znikania się nie zmienia: nadal liczy się dokładnie **5**.
- Linia o sumie < 5 po prostu czeka na dalsze dokładanie. Suma może nawet spaść **poniżej 0** — taka linia też jest po prostu *niepełna* i nic specjalnego się z nią nie dzieje.
- Linia o sumie = 5, wykryta w danym momencie, zostaje usunięta **natychmiast**.

### Przykład

```
Wiersz 3 (kolumny 1–5):  [ puste ] [2] [ puste ] [3] [ puste ]  → suma = 5 → ZNIKA
Kolumna 2 (wiersze 1–5): [1] [ puste ] [2] [4] [ puste ]        → suma = 7 → nie znika (patrz sekcja 5)
Wiersz 4 (kolumny 1–5):  [4] [ puste ] [-1] [ puste ] [2]       → suma = 4 + (-1) + 2 = 5 → ZNIKA
```

## 5. Suma powyżej 5 — linia „przegrzana", nie martwa

Jeśli po dołożeniu klocka suma w rzędzie lub kolumnie **przekroczy 5** (np. 6, 7, 8…):

- linia **natychmiast nie znika** (nie jest równa 5),
- **nie jest jednak skazana na niepowodzenie** — może zostać „odmrożona".

**Mechanizm odmrażania:** usunięcie rzędu/kolumny kasuje z planszy **wszystkie** jego pola, w tym pola leżące w przecinających kolumnach/rzędach. Sumy tych przecinających linii wtedy **maleją**. Przegrzana kolumna może więc wrócić do 5 i zniknąć przy kolejnej okazji.

### Przykład odmrażania

```
Stan początkowy:
  Kolumna B ma sumę 7 (przegrzana) — pola w wierszach 1–4 dają 2+1+3+1 = 7.

Ruch: gracz stawia klocek, po którym Wiersz 3 osiąga sumę 5 (przechodzi przez kolumnę B).
  → Znika Wiersz 3 → z kolumny B ubywa pole o 3 oczkach.
  → Suma kolumny B: 7 − 3 = 4 (już nieprzegrzona).

Kolejny ruch: gracz dokłada pole o 1 oczku do kolumny B.
  → Suma kolumny B = 5 → kolumna B znika i daje punkty.
```

## 6. Kaskady (zbieżność do stabilizacji)

Po **każdym** postawieniu klocka gra działa w pętli:

1. Znajdź **wszystkie** rzędy i kolumny o sumie = 5.
2. Jeśli jest ich zero → koniec przetwarzania.
3. Usuń ich pola z planszy **jednocześnie** w danym poziomie.
4. Przelicz sumy wszystkich linii od nowa — mogą pojawić się kolejne linie o sumie 5 (usunięcia zmieniają sumy przecinających linii, w tym „odmrażając" przegrzane).
5. Wróć do kroku 1, zwiększając **poziom kaskady** o 1.

Kaskada trwa, aż żadna linia nie ma sumy 5. Każdy kolejny poziom zwiększa mnożnik punktów (sekcja 7).

> Uwaga: samo usunięcie **nigdy nie zwiększa** sum — tylko je zmniejsza lub nie zmienia — więc przegrzane linie w trakcie kaskady mogą jedynie „zejść" do 5 i dołączyć do usuwania na kolejnym poziomie.

## 7. Punktacja

Za **każde pojedyncze postawienie klocka** (a nie dopiero za całą trójkę)
punkty liczone są **osobno dla każdego poziomu kaskady**:

```
punkty_ruchu = Σ_k (p_k × l_k × 2^k)
```

gdzie dla poziomu **k** (0-bazowo: k = 0 to pierwsze czyszczenie, k = 1 to
pierwsza kaskada, k = 2 to druga kaskada itd.):
- **p_k** — liczba **unikalnych** pól usuniętych na tym poziomie (pole na
  przecięciu usuwanego wiersza i kolumny liczy się raz),
- **l_k** — liczba usuniętych linii na tym poziomie (wiersze + kolumny),
- **2^k** — mnożnik kaskady: ×1, ×2, ×4, ×8…

`p_k` i `l_k` są liczone **od nowa na każdym poziomie**. Ruch bez żadnego
zniknięcia daje 0 punktów. Dzięki temu każdy poziom można policzyć niezależnie
i po prostu dodać wyniki.

Po każdej kaskadzie gra pokazuje **osobny dymek** z punktami za dany poziom
(`p_k × l_k × 2^k`). Dymki sumują się do punktów za cały ruch. Wynik sumaryczny
(z całej gry) zmienia się dopiero po zakończonym ruchu.

### Bonus za całkowite wyczyszczenie planszy

Gdy po postawieniu klocka i pełnej kaskadzie plansza jest w **100% pusta**
(wszystkie 25 pól puste), gracz dostaje dodatkowy bonus:

```
bonus = 10×N
```

gdzie **N** — numer całkowitego wyczyszczenia planszy w tej grze
(N = 1, 2, 3, …; reset przy nowej grze). Czyli 1. wyczyszczenie daje +10,
2. daje +20, 3. daje +30 itd. Bonus dolicza się do punktów za linie z tego
ruchu (łącznie: linie + bonus) i pokazywany jest osobnym dużym dymkiem
„+N CZYSTA!”. Licznik N (`CZYSTE`) jest zawsze widoczny na ekranie, od startu gry.

### Przykłady obliczeń

| Ruch | Poziom 0 | Poziom 1 | Poziom 2 | Razem |
|---|---|---|---|---|
| 1 linia, 3 pola, bez kaskady | 3×1×1 = **3** | — | — | **3** |
| Wiersz + kolumna, 5 unikalnych pól | 5×2×1 = **10** | — | — | **10** |
| Kaskada: 2 pola/1 linia, potem 3 pola/1 linia | 2×1×1 = **2** | 3×1×2 = **6** | — | **8** |
| Kaskada: 4 pola/2 linie, potem 3 pola/1 linia | 4×2×1 = **8** | 3×1×2 = **6** | — | **14** |
| Trzy poziomy: 2/1, 3/1, 2/2 | 2×1×1 = **2** | 3×1×2 = **6** | 2×2×4 = **16** | **24** |

## 8. Warunki końca gry

- Gra jest **jednożyciowa**: nie ma ratowania się ani cofania ruchów.
- Gracz **musi postawić wszystkie trzy klocki** z rozdanej trójki.
- **Gra kończy się, gdy gracz nie może wykonać żadnego ruchu** — czyli żaden z pozostałych klocków nie ma już żadnego legalnego pola postawienia (dwóch sąsiadujących pustych komórek zgodnych z jego wylosowanym obrotem) na aktualnym stanie planszy.
- Praktycznie oznacza to zapełnioną planszę albo puste pola rozmieszczone tak, że nie mieszczą żadnego klocka (np. tylko jedna samotna pusta komórka).
- Wynik końcowy = suma punktów ze wszystkich postawień; rekordem jest najwyższy osiągnięty wynik.
- Dopóki możliwy jest choć jeden ruch, tura trwa — gracz może zmienić sytuację, czyścąc rząd pozostałymi klockami z trójki.

## 9. Przykład rozgrywki (krok po kroku)

Stan po 3 turach (plansza 5×5, `·` = puste; żadna linia nie ma jeszcze sumy 5):

```
      1   2   3   4   5
  1 [ 1 ][ · ][ 2 ][ · ][ · ]
  2 [ · ][ 3 ][ · ][ · ][ · ]
  3 [ 1 ][ · ][ · ][ · ][ · ]
  4 [ · ][ · ][ 1 ][ · ][ 2 ]
  5 [ · ][ · ][ · ][ · ][ · ]
```

Kontrola sum przed ruchem: wiersze = 3, 3, 1, 3, 0; kolumny = 2, 3, 3, 0, 2 — żadna linia nie jest równa 5 ani przekroczona.

**Tura 4:** gracz dostaje trójkę klocków: `(2, 3)` (wylosowany obrót pionowy), `(1, 1)` (poziomy) i `(0, 2)` (pionowy). Wybiera kolejność: **najpierw `(2, 3)`** pionowo w kolumnie 4 (wiersze 2–3):

```
      1   2   3   4   5
  1 [ 1 ][ · ][ 2 ][ · ][ · ]
  2 [ · ][ 3 ][ · ][ 2 ][ · ]
  3 [ 1 ][ · ][ · ][ 3 ][ · ]
  4 [ · ][ · ][ 1 ][ · ][ 2 ]
  5 [ · ][ · ][ · ][ · ][ · ]
```

Sprawdzenie sum:
- **Wiersz 2:** 3 + 2 = **5** → znika!
- **Kolumna 4:** 2 + 3 = **5** → znika też! (l = 2)
- Pozostałe linie ≠ 5 (wiersz 3: 1 + 3 = 4).
- Punkty za to postawienie (brak dalszej kaskady, k = 0): usunięto **p = 3** unikalne pola, **l = 2** linie → 3 × 2 × 2⁰ = **6**.

Po usunięciu wiersza 2 i kolumny 4:

```
      1   2   3   4   5
  1 [ 1 ][ · ][ 2 ][ · ][ · ]   ← bez zmian ((1,4) było puste)
  2 [ · ][ · ][ · ][ · ][ · ]   ← wiersz 2 wyczyszczony
  3 [ 1 ][ · ][ · ][ · ][ · ]   ← (3,4)=3 usunięte razem z kolumną 4
  4 [ · ][ · ][ 1 ][ · ][ 2 ]
  5 [ · ][ · ][ · ][ · ][ · ]
```

Tura się **nie kończy** — gracz ma jeszcze do postawienia `(1, 1)` (poziomy) i `(0, 2)` (pionowy). Wyczyszczenie wiersza 2 i kolumny 4 zostawiło sporo wolnych miejsc, więc oba klocki mieszczą się bez problemu (np. `(1, 1)` w wierszu 5, kolumny 1–2; `(0, 2)` w kolumnie 3, wiersze 2–3). Dopiero po postawieniu wszystkich trzech klocków gra losuje kolejną trójkę.

### Przykład kaskady z odmrażaniem

Osobna sytuacja: kolumna 1 jest **przegrzona** (suma 7), a wiersz 2 ma sumę 2:

```
      1   2   3   4   5
  1 [ 3 ][ · ][ · ][ · ][ · ]
  2 [ 2 ][ · ][ · ][ · ][ · ]   ← suma wiersza = 2
  3 [ 1 ][ · ][ · ][ · ][ · ]
  4 [ 1 ][ · ][ · ][ · ][ · ]
  5 [ · ][ · ][ · ][ · ][ · ]   ← kolumna 1: 3+2+1+1 = 7 (przegrzana)
```

**Ruch w trójce:** gracz ma trójkę, w której jest klocek `(3, 1)` z wylosowanym obrotem pionowym — stawia go **jako pierwszego** (spośród trzech) w kolumnie 2 (wiersze 2–3) → w wierszu 2 powstaje suma 2 + 3 = **5** → wiersz 2 znika:

1. **Poziom 0 (k = 0):** znika wiersz 2 (p = 2 pola, l = 1 linia) → 2 × 1 × 2⁰ = **2 pkt** (dymek **+2**). Z kolumny 1 ubywa pole o 2 oczkach → jej suma: 7 − 2 = **5**.
   *(Po tym usunięciu: wiersz 3 = 1 + 1 = 2, kolumna 2 = 1, kolumna 4 = 0 — żadna inna linia nie równa się 5 poza kolumną 1.)*
2. **Poziom 1 (kaskada, k = 1):** kolumna 1 ma teraz sumę 5 → znika! p = 3 pola, l = 1 linia → 3 × 1 × 2¹ = **6 pkt** (dymek **+6**).

Punkty: 2 + 6 = **8** (dymki: +2, +6).

To pokazuje pełną pętlę: przegrzana linia (7) → odmrożenie przez zniknięcie przecinającego wiersza → natychmiastowa kaskada i podwojone punkty.


