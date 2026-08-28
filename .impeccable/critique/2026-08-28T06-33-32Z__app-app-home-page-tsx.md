---
target: Home-Screen
total_score: 15
max_score: 36
na_heuristics: 9
p0_count: 2
p1_count: 2
timestamp: 2026-08-28T06-33-32Z
slug: app-app-home-page-tsx
---
**Method: dual-agent (A: Design-Review · B: Detector + Messung)**

# Design-Kritik: Home-Screen

## Design Health Score

| # | Heuristik | Score | Kernproblem |
|---|-----------|-------|-------------|
| 1 | Visibility of System Status | 3 | ParticipationToggle zeigt Pending nur als opacity-50, keine Bestaetigung nach dem Tap |
| 2 | Match System / Real World | 2 | "Getraenk +1" ist ein Link nach /drinks — verspricht Zaehlen, liefert Navigation |
| 3 | User Control and Freedom | 2 | Kein Undo bei "Stimmt, akzeptiere" oder "Als erfuellt abhaken" |
| 4 | Consistency and Standards | 1 | Vier Formulierungen fuer dieselbe Geste; du/ihr gemischt |
| 5 | Error Prevention | 1 | Punktgleichstand kroent willkuerlich einen Sieger mit Glow; kein Confirm beim Akzeptieren |
| 6 | Recognition Rather Than Recall | 3 | Alles sichtbar, aber "Level 3", "Beste: 4", "+5 Pkt" ohne Bezugspunkt |
| 7 | Flexibility and Efficiency | 2 | Quick-Actions duplizieren Nav und die danebenliegenden Karten |
| 8 | Aesthetic and Minimalist Design | 1 | 7 Bloecke, ~35 Zahlen, 20 Tap-Targets, 7 konkurrierende Blickfaenge |
| 9 | Error Recovery | n/a | Auf diesem Screen rendert kein Fehlerpfad |
| 10 | Help and Documentation | 0 | Nichts erklaert Level, Punkte, Streak oder die Folge des Akzeptierens |
| **Total** | | **15/36** | **Poor (42 %)** |

n/a: Heuristik 9.

## Design Specificity Verdict

Die Tokens sind autorenhaft, die Komposition nicht. Flammen-Path, absteigende Streak-Balken (height: 20-i, opacity: 1-i*0.08) und das aus dem Avatar-Ring ausgestanzte Blob-Level-Badge sind echte, nicht generierbare Entscheidungen. Der Stapel darueber ist das kanonische Dark-Gamification-Dashboard; fuenf Bloecke teilen dieselbe Kartenhuelle mit identischer Kopfzeile. Nichts auf dem Screen weiss, dass es eine Reise ist — kein Reisetag, kein "was laeuft jetzt", kein Dik-Dik. Urteil: autorenhafte Oberflaeche, generisches Skelett.

**Deterministischer Scan:** 21 Findings, alle design-system-font-size, alle begruendete Falschmeldungen — der Detector liest nur den Frontmatter-Block von DESIGN.md (3 Groessen), nicht die Prosa-Hierarchie (Label 9-11px, Stat 13-28px). Jeder Wert liegt in einer dokumentierten Stufe.

**Detector-Blindstelle:** null Schatten-Verstoesse gefunden, weil jeder Schatten hier ein Inline-style-Prop ist, kein Tailwind-Class. Der Browser fand vier.

**Overlay:** 17 Anti-Patterns — dark-glow x3, ai-color-palette (Cyan neon text on dark = die Tuerkis-Profilfarbe), undersized-ui-text x10, low-contrast x2, tiny-text x1. Overlay entfernt, Server gestoppt.

## Overall Impression

Der Screen hat keine Aufgabe. Sieben Bloecke konkurrieren gleichberechtigt, und die Rangfolge ist verkehrt: die groesste Zahl (28px, leuchtend) feiert den Getraenkekonsum, waehrend das Einzige mit Handlungsbedarf (zwei offene Strafen) unterhalb der Falz steht. Peak-End: der Screen wird als "ich schulde etwas" erinnert. Das Ueberladen-Gefuehl ist messbar: 0,5 von 8 Punkten in der Cognitive-Load-Checkliste.

## What's Working

1. Streak-Balken — Hoehenrampe plus Opazitaetsabfall laesst aeltere Tage physisch zuruecktreten.
2. "Aktuell nichts offen – sauber geblieben." — genau das trockene, freche Register.
3. Avatar mit Blob-Level-Badge, -rotate-[10deg] mit border-2 border-background. Bereits korrekt in der Profilfarbe.

## Priority Issues

**[P0] Der Screen hat keine Aufgabe.** Gemessen: 7 Bloecke, 1550px = 1,84 Bildschirme, 20 Tap-Targets, ~35 Zahlen, 7 konkurrierende Blickfaenge (5 lime). Cognitive Load 7/8 durchgefallen. Draussen, angetrunken, acht Sekunden — ein Home-Screen muss eine Frage beantworten.

**[P0] Barrierefreiheit widerspricht dem eigenen Produktprinzip.** 35 von 108 Textknoten fallen durch WCAG AA (32%), reproduzierbar. Schlimmster Fall 2,35:1 = saemtliche Bottom-Nav-Labels, auf jedem Screen, 10px. Dazu 3,26:1 fuer 31 Knoten (muted-2 auf Karte). 11 von 20 Bedienelementen unter 44px: alle "Alle ansehen"-Links 16px hoch, fuenf "Bin dabei?"-Toggles 34px. Suggested command: /impeccable audit

**[P1] One-Loud-Color-Regel bricht dreifach.** Quick-Action-Raster stellt Lime-Well und Violett-Well nebeneinander in dieselbe Zeile; Kopfzeile traegt drei gesaettigte Farben gleichzeitig; Strafen-Karte paart rotes "−2 Pkt" mit limefarbener "Bestaetigt"-Pille. Violett macht vier unzusammenhaengende Jobs.

**[P1] Scoreboard-Regel bricht in beide Richtungen.** Datum und Uhrzeit in font-mono in allen fuenf Planzeilen (der Fall, den DESIGN.md ausschliesst), ebenso Avatar-Buchstabe und das Wort "Beste:". Umgekehrt: PillBadge ohne font-mono, also ist "Punkte: 112" nicht tabellarisch; "{n} dabei" ebenso.

**[P2] Vier Glows verstossen gegen Flat-By-Default.** Spec ~50-55px bei 16-18%. Tatsaechlich 0 0 18px/35%, 0 0 12px/50%, drop-shadow 5px/60%, text-shadow 10px/40%. Eng und heiss = Neon-Sticker statt Bloom. Zwei davon echte box-shadow, die das System komplett verbietet.

**[P2] Neu-Mitglied-Zustand kaputt, nicht leer.** Der topMembers.length === 0 Zweig ist unerreichbar. Erstnutzer sieht: Null-Rangliste mit per Gleichstand gekroentem Fremden (Lime-Glow), tote graue Streak-Leiste, leuchtende "0", "Punkte: 0". Vier Nullen, kein Onboarding.

## Profilfarben-Umfaerbung — Empfehlung

Alle zehn Farben bestehen WCAG AA in beide Richtungen (Text auf Karte 4,53-15,1:1; dunkle Schrift auf Flaeche 5,0-16,7:1).

Wird Profilfarbe: Avatar-Ring + Initiale, Level-Blob (bereits), Punkte-Pille im Header, eigene Ranglisten-Zeile, Streak-Fuellung, Getraenke-heute-Zaehler.
Bleibt fest: aktiver Nav-Zustand, gefuellter "Dabei"-Zustand, Fokusring.
Wuerde brechen: Punkte-Valenz (+lime/−rot), Platz 1.

Kollisionen: Lime ist die Systemfarbe — ein Lime-Mitglied ist ununterscheidbar von Platz 1, aktivem Nav und positiven Punkten (Mitglied "ck" hat Lime). Rot #ff6161 ~ Danger #ff6f6f. Mint vs Tuerkis bei 30px in Sonne kaum trennbar.

## Persona Red Flags

**Casey:** tippt "Getraenk +1", erwartet Zaehler, bekommt Seitenwechsel. Einziger anderer Zugang in der Getraenkekarte ist ein 16px-Link.
**Sam:** Nav-Labels 2,35:1. Fuenf Buttons heissen identisch "Bin dabei?" ohne Verknuepfung zum Programmpunkt. ParticipationToggle ohne aria-pressed/role=switch, Zustand ist reine Farbe. Nav ohne aria-current. Acht SVGs ohne aria-hidden.
**Jordan:** vier Nullen, per Gleichstand gekroenter Fremder, fuenf unerklaerte Begriffe.

## Minor Observations

- "Level 3" zweimal innerhalb 40px. Zwei getrennte /plan-Links in derselben Karte.
- Desktop: 375px-Spalte hart links gegen schwarze Leere, max-width: none im App-Shell.
- Die zwei definierten Entrance-Animationen werden hier nirgends verwendet.
- "Programmpunkte" ist Vereinsdeutsch. "Bin dabei?" ist eine Frage als Button-Label.
- Nav-Labels rendern font-medium (500) statt spezifizierter 600-700; Planzeilen-Meta ohne Gewichtsklasse.

## Questions to Consider

1. Wenn Rangliste, Getraenke und Streak alle einen Nav-Tap entfernt liegen — wofuer ist Home dann da?
2. Sollte auf einem Screen, den man sich am Tisch hinhaelt, irgendjemandes Punktestand laut sein — oder nur der naechste Schritt der Gruppe?
3. Warum bewegt sich nie etwas, wenn Oeffnen die Kernschleife ist?
