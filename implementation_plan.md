# Implementation Plan

## Overview

Celem jest sporządzenie kompletnego, spójnego opisu nowej gry planszowej „Sumar" w pliku `opis.md` — dokumentu designu (bez implementacji kodu) opisującego zasady, punktację, warunki końca gry i przykłady rozgrywki na planszy 5×5 z klockami domina (0–4 oczka).

## Scope

Zakres ogranicza się wyłącznie do dokumentacji tekstowej gry. Katalog projektu zawiera dotychczas tylko pusty plik `opis.md`. Zgodnie z decyzją użytkownika nie powstaje kod Python/pygame. Dokument `implementation_plan.md` (ten plik) jest wymagany procesem planowania i służy jako specyfikacja treści `opis.md`.

Ustalone z użytkownikiem zasady gry:
- Plansza 5×5, startuje pusta; gracz dostaje **trójki** losowych klocków domina (dwa pola, każde 0–4 oczka; obrót klocka losowany przy rozdaniu — gracz go nie wybiera).
- Gracz musi postawić wszystkie trzy klocki z trójki, ale **wybiera kolejność** ich ustawiania.
- Rząd/kolumna znika, gdy suma oczek w nim wynosi dokładnie 5 (nie musi być wypełniona; pola puste nie liczą się).
- Suma > 5 **nie czyni** rzędu/kolumny martwym — może zostać obniżona przez usunięcie klocków w wyniku zniknięcia przecinającego rzędu/kolumny (odmrażanie).
- Kaskady: po zniknięciu sumy przeliczają się natychmiast; kolejne zniknięcia w tym samym ruchu, punkty mnożone za serię.
- Punktacja: stała liczba punktów za linię + bonus za kumulację (wiele linii w jednym ruchu) + mnożnik kaskady; naliczana po każdym pojedynczym postawieniu klocka.
- Koniec gry: gracz nie może wykonać żadnego ruchu — żaden z pozostałych klocków nie ma legalnego pola postawienia (jeden żywot, wynik końcowy).

## Types

Dokument nie wprowadza typów programistycznych. Struktury danych opisane konceptualnie w `opis.md`:
- **Plansza**: siatka 5×5 komórek; komórka = pusta albo zajęta przez jedno pole klocka z wartością 0–4.
- **Klocek (domino)**: dwie wartości (a, b), każda ∈ {0,1,2,3,4}, orientacja pozioma lub pionowa.
- **Stan linii**: suma oczek niepustych pól rzędu/kolumny (0..20 teoretycznie); status: „żywa" (=5 → do usunięcia), „niepełna", „przegrzana" (>5, czeka na obniżenie).
- **Wynik**: liczba punktów całkowitych + mnożnik kaskady bieżącego ruchu.

## Files

- **Utworzyć/uzupełnić**: `opis.md` — pełny dokument opisu gry (główny deliverable).
- **Utworzyć**: `implementation_plan.md` — ten plan.
- **Usunąć/pliki do usunięcia**: brak.
- **Konfiguracja**: brak (brak manifestów zależności w projekcie).

## Functions

Brak funkcji w kodzie. `opis.md` opisuje proceduralnie przebieg tury (jako pseudocode/kroki):
1. `otrzymaj_trojke()` — losowanie trzech klocków (a, b) z zakresu 0–4; każdy klocek otrzymuje losowy obrót (poziomy/pionowy).
2. `wybierz_kolejnosc()` — gracz wybiera permutację trzech klocków.
3. `postaw_klocek(klocek, komorka)` — umieszczenie pól na planszy (dwie sąsiadujące puste komórki zgodne z obrotem).
4. `wykryj_linie()` — wyznaczenie wszystkich rzędów i kolumn o sumie = 5.
5. `usun_linie()` — usunięcie pól z wykrytych linii; przeliczenie sum.
6. `petla_kaskady()` — powtarzanie kroków 4–5 do stabilizacji, z mnożnikiem +1 za każdy poziom; punkty po każdym postawieniu.
7. `sprawdz_koniec()` — czy gracz może wykonać jakikolwiek ruch (którykolwiek z pozostałych klocków trójki ma legalne postawienie); jeśli nie → koniec gry.

## Classes

Brak klas w kodzie (dokument designu). Konceptualne „byty" gry opisane w sekcji Components dokumentu: Plansza, Klocek, Linia, Wynik.

## Dependencies

Brak nowych pakietów. `opis.md` to Markdown — nie wymaga zależności.

## Testing

- Weryfikacja wewnętrznej spójności dokumentu: każda reguła (znikanie przy sumie = 5, odmrażanie sum > 5, kaskady, punktacja, koniec gry) ma własną sekcję i przykład.
- Przykład rozgrywki krok-po-kroku (tabela Markdown) musi być arytmetycznie poprawny: sumy, punkty i mnożniki przeliczone ręcznie.
- Sprawdzenie, że opis nie zawiera sprzeczności (np. że „>5" nigdzie nie jest nazywany stanem permanentnym).
- Opcjonalnie: krótki skrypt/symulacja poza zakresem — nie tworzony.

## Implementation Order

1. Utworzyć `implementation_plan.md` (ten plik).
2. Napisać `opis.md`: sekcje 1–4 (idea, komponenty, przebieg ruchu, zasada znikania).
3. Dodać sekcję 5 (suma > 5 — odmrażanie przez przecinające zniknięcia) z ilustrującym przykładem.
4. Dodać sekcje 6–7 (kaskady i punktacja z wzorem i przykładem obliczenia).
5. Dodać sekcje 8–10 (koniec gry, wskazówki strategiczne, przykład pełnej rozgrywki).
6. Weryfikacja spójności i arytmetyki przykładów; poprawki.
