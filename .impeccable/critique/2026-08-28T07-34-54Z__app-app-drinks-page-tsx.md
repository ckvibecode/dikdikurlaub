---
target: Drinks-Screen
total_score: 17
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-28T07-34-54Z
slug: app-app-drinks-page-tsx
---
**Method: dual-agent (A: Design-Review · B: Detector + Messung)**

# Design-Kritik: Drinks-Screen

## Design Health Score

| # | Heuristik | Score | Kernproblem |
|---|-----------|-------|-------------|
| 1 | Visibility of System Status | 2 | Kein optimistisches Update; ein Tap deaktiviert alle vier Kacheln (geteiltes pending) |
| 2 | Match System / Real World | 2 | T1..T8 abstrakt; heute rendert als T8 nach sieben Nullen, liegt aber vor T1 |
| 3 | User Control and Freedom | 2 | Loeschen sofort, unbestaetigt, nicht rueckgaengig; keine Mengenkorrektur |
| 4 | Consistency and Standards | 2 | Scoreboard-Regel beidseitig gebrochen; box-shadow x4; rounded-[20px] ausserhalb der Skala |
| 5 | Error Prevention | 1 | Kein Confirm beim Loeschen; Doppeltipp loggt doppelt |
| 6 | Recognition Rather Than Recall | 2 | Vier identische orange Plus-Kacheln, unterschieden nur durch ein 11px-Wort |
| 7 | Flexibility and Efficiency | 2 | Runde a 3 Bier = drei sequenzielle Taps, jeder blockiert das Raster |
| 8 | Aesthetic and Minimalist Design | 2 | 12 gleichzeitig orange Elemente ohne Anker; Chart druckt siebenmal "0" |
| 9 | Error Recovery | 1 | logDrink wirft ohne lokales Catch -> Error-Boundary statt Inline-Retry |
| 10 | Help and Documentation | 1 | Nirgends steht, wofuer Punkte gut sind oder warum ein Cocktail mehr zaehlt |
| **Total** | | **17/40** | **Poor (43 %)** |

## Design Specificity Verdict

Ein generischer dunkler Habit-Tracker in DikDik-Lackierung. Tausch Orange gegen Tuerkis und die Labels gegen "Wasser/Kaffee/Schritte" — nichts wuerde den Tausch verraten. Der Screen nutzt keine Signatur des Systems: kein .bloom, kein Blob-Radius, kein Feiermoment. Das einzig Autorenhafte ist die Kommentar-Pille.

**Deterministischer Scan:** 6 Findings, alle design-system-font-size, alle Falschmeldungen (9-11px Label-Text in der Prosa-Rampe). Der Detector uebersieht aber zwei echte Abweichungen, weil sie benannte Tailwind-Klassen nutzen: h1 mit 18px (Prosa-Headline 15-16px) und acht Knoten mit 12px (tote Luecke zwischen Label 9-11 und Body 13-14).

**Overlay:** 13 Anti-Patterns, davon 12 undersized-ui-text. Das dreizehnte: "Space Grotesk nur 40 % des Textes" — weil ~60 % IBM Plex Mono sind. Bestaetigt den Scoreboard-Bruch unabhaengig.

## Overall Impression

Ankommen -> Zahl sehen -> hoeren, dass man im "Easy Modus" ist -> vier leuchtende Buttons bieten +1/+2/+3 -> die Zahl steigt. Ein Spielautomat mit Anzeigetafel. Drei Details verstaerken das: (1) die Punkte stehen als Chips auf dem Bedienelement selbst, und Cocktail bringt +3 gegen Shot +1 — das Design lehrt, dass sich das staerkste Getraenk lohnt; (2) der Kommentar eskaliert als Lob ("Lauwarm wird's" rahmt drei Getraenke als noch nicht genug); (3) die Farbe bleibt bei 1 und bei 10 dieselbe orange Zustimmung.

## What's Working

1. Das 172x87-Kachelraster — ein Tap, kein Tippen, grosse Ziele. Fuer den Brief genau richtig.
2. Die Stimme von getDrinkComment — "Very-Thirsty-Modus aktiviert." klingt nach diesem Produkt.
3. Soft-Delete fuer Kategorien — Punktehistorie bleibt, nur die Auswahl verschwindet.
4. Kontrast: 50 Textknoten, null Fehler (Token-Korrektur aus der Home-Runde traegt app-weit).

## Priority Issues

**[P0] Punkte als Preisschild auf den Getraenke-Buttons.** +3 fuer Cocktail gegen +1 fuer Shot belohnt ausdruecklich das staerkere Getraenk. Fix: Badge von der Kachel nehmen, Punktwerte vereinheitlichen, "Wasser" als Standardkategorie.

**[P0] Verlaufs-Chart unlesbar, Balken buchstaeblich unsichtbar.** Null-Balken bekommen gleichzeitig opacity: 0.12 UND rgba(255,255,255,0.1) -> effektive Deckkraft 0,012 -> 1,03:1. Bug, nicht Designfehler. Dazu falsche Reihenfolge (heute als T8) und T1..T8 als Achse.

**[P1] Loeschen: 32x32px, unbestaetigt, nicht rueckgaengig.** Zwei Buttons heissen identisch "Bier entfernen".

**[P1] Jeder Log-Vorgang verliert den Fokus.** t=6ms alle vier Kacheln disabled -> Fokus faellt auf body -> t=181ms wieder aktiv, Fokus nicht zurueckgesetzt. Kein aria-live.

**[P2] Chart existiert fuer Screenreader nicht.** Kein role, kein aria-label, keine Tabellensemantik. Dazu: die Seite hatte genau eine Ueberschrift (h1), alle Abschnittstitel waren span/p.

**[P2] Flat-By-Default gebrochen.** Vier box-shadow auf den Punkte-Badges.

## Persona Red Flags

**Casey:** Primaeraktion bei y~190-350, das untere Drittel haelt die schreibgeschuetzte Liste. Bei acht Kategorien 376px Raster.
**Sam:** 45 von 62 Textknoten (73 %) sind <=11px. Zaehlerstaende werden niemandem angesagt. Kacheln heissen "+2 Bier" — Punkte klingen wie Menge, Verb fehlt.
**Riley:** Doppeltipp nur clientseitig verhindert. Kommentar-Pille bei Maximallaenge 310px in ~330px-Karte.

## Minor Observations

- Nav "Drinks"/"Rang" gegen h1 "Getraenke-Tracker" — Deutsch/Englisch gemischt.
- "Noch nichts geloggt." erschien zweimal.
- Pille war ein p mit inline-flex gap-1.5 bei nur einem Kind — toter Gap.
- Alle Eintraege zeigen 09:03 ohne Sekunden; "neueste zuerst" nicht ueberpruefbar.
- Admin darf Kategorien mit bis zu 20 Punkten anlegen.
- --member faellt am :root auf Glow-Lime zurueck, die fuer Wettkampf reservierte Farbe.

## Umgesetzt in dieser Runde

- 18-Uhr-Sperre (server-autoritativ + ruhiger UI-Zustand mit Countdown)
- Streak-Feature vollstaendig entfernt (Schema, Migration, Code, UI)
- Abschnittstitel zu h2, "Getraenk eintragen" statt "hinzufuegen", box-shadow durch border-2 ersetzt,
  Kacheln mit aria-label, Zahlen durch StatNumber

## Offen

- Chart: unsichtbare Null-Balken, Reihenfolge, fehlende Screenreader-Repraesentation
- Loeschen: 32px-Ziele, kein Undo, doppelte Namen
- Fokusverlust und fehlendes aria-live beim Loggen
- Punkte-Preisschilder (bewusst so belassen)
