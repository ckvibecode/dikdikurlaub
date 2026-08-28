---
target: Plan Screen
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-28T13-13-55Z
slug: app-app-plan-page-tsx
---
**Method: dual-agent (A: Design-Review · B: Detektor + Messung)**

# Design-Kritik: Tagesplan-Screen

## Design Health Score

| # | Heuristik | Score | Kernproblem |
|---|-----------|-------|-------------|
| 1 | Visibility of System Status | 2 | Beitritt zu "+10 Pkt" gibt kein Punkte-Feedback; Pending ist nur opacity 0.5; null aria-live-Regionen gemessen |
| 2 | Match System / Real World | 3 | Kopie sitzt, aber kein "Heute"/"Morgen" — obwohl der Drinks-Screen genau das hat |
| 3 | User Control and Freedom | 2 | Loeschen ohne Rueckfrage und ohne Undo; kein Bearbeiten (Tippfehler = loeschen + neu = 9 Teilnahmen weg) |
| 4 | Consistency and Standards | 2 | Scoreboard-Regel invertiert; gap-5 als einzige Seite; itemTitle wird auf Home uebergeben, hier nicht |
| 5 | Error Prevention | 1 | Kein Bestaetigungsmuster im ganzen Repo; endTime < startTime nie validiert; beide Pflichtfelder ohne Label |
| 6 | Recognition Rather Than Recall | 2 | Avatare tragen nur Initialen + title-Attribut; "+4" ist eine Sackgasse; kein Heute-Anker |
| 7 | Flexibility and Efficiency | 2 | Kein Sprung zu heute, kein Einklappen vergangener Tage, kein Reordering trotz sortOrder im Schema |
| 8 | Aesthetic and Minimalist Design | 3 | Karte ist sauber und laeuft nirgends ueber; gestoert durch sechs gleichzeitig gesaettigte Farben und den 3-Grad-Sticker neben dem geraden Papierkorb |
| 9 | Error Recovery | 1 | Kein error.tsx in app/; Formularfehler ohne role="alert"; toggleParticipation wirft roh |
| 10 | Help and Documentation | 2 | Nirgends steht, dass Beitritt Punkte gibt und Austritt sie zuruecknimmt — genau das passiert aber |
| **Total** | | **20/40** | **Acceptable (50 %) — unteres Ende des Bandes** |

Alle zehn Heuristiken sind anwendbar; dies ist eine Operate-Flaeche, also gelten auch 7 und 10.

## Design Specificity Verdict

**LLM-Bewertung:** Das ist der einzige Screen der App, der kein einziges Signature-Element des eigenen Systems benutzt. Ein Grep ueber StatNumber/bloom/rounded-blob/animate-rise-in trifft Home, Leaderboard, Drinks, Join und Login — und null Mal app/(app)/plan/page.tsx. Uebrig bleibt eine chronologische Liste dunkler 16px-Karten mit Titel, Zeit, Avatar-Stack und Outline-Button. Tauscht "Bin dabei?" gegen "RSVP" und "Programmpunkt hinzufuegen" gegen "Add event", und ihr habt Doodle, Meetup oder jedes Konferenz-Agenda-Template der letzten acht Jahre, unveraendert.

Beide Assessments sind unabhaengig voneinander auf dieselbe Pointe gestossen: **die Scoreboard-Regel ist hier exakt umgedreht.** Gemessen rendert der Punktestand "+5 Pkt" in Space Grotesk 12px, waehrend die beilaeufige Uhrzeit "09:30-11:00" — die laut DESIGN.md ausdruecklich in Space Grotesk bleiben soll — in IBM Plex Mono 11px steht. Die Avatar-Initialen laufen ebenfalls in Mono, also traegt die Scoreboard-Schrift auf dieser Seite Uhrzeiten und Buchstaben, waehrend die einzigen echten Scores wie Fliesstext aussehen. Dazu: **tabular-nums kommt auf der ganzen Seite null Mal vor**, obwohl DESIGN.md es fuer jede Zahl fordert und globals.css die Klasse bereitstellt.

**Deterministischer Scan:** detect.mjs meldet Exit-Code 2, **6 Findings, alle aus der Regel design-system-font-size** — 11px in plan/page.tsx:56 und dreimal in AddPlanItemForm.tsx, 10px und 9px in ParticipantAvatars.tsx. **Fuenf davon sind Falschmeldungen:** der Scanner liest nur den YAML-Frontmatter von DESIGN.md und kennt die Prosa-Rampe nicht, in der Label mit 9-11px ausdruecklich definiert ist. Das sechste ("+4", 9px) ist ein echtes Finding, aber aus einem anderen Grund als angegeben — "+4" ist ein Count und gehoert damit in den Stat-Schritt 13-28px.

Was der CLI-Scanner **uebersieht**, die Messung im Browser aber zeigt: **12px ist mit 23 Vorkommen die haeufigste Schriftgroesse der Seite** und faellt in die tote Luecke zwischen Label (9-11) und Body (13-14) — Tagesueberschriften, alle "N dabei"-Labels, alle "+N Pkt"-Pills, alle Beschreibungen. Der Scanner sieht es nicht, weil es ueber die Utility text-xs kommt statt ueber ein text-[...]-Literal. Ebenfalls nur in der Messung sichtbar: **sechs gesaettigte Farben gleichzeitig** (#4ea8ff x14, #7a6ff0 x3, #c8ff4d x3, #4dffa0 x2, #ff6fb0 x1, #ff9f4d x1), wo DESIGN.md genau zwei Neons vorsieht — vier davon stehen in keiner Palette.

**Visuelle Overlays:** Die Injektion hat funktioniert; das Overlay war im Browser sichtbar, mit Marker direkt am +4-Chip. Der In-Page-Detektor meldete drei Regeln: undersized-ui-text (9px "+4"), skipped-heading (h1 gefolgt von h3) und overused-font (Space Grotesk 69 % des Textes). Die dritte werte ich als Falschmeldung — dass Space Grotesk allen UI-Text traegt, ist genau die Systemvorgabe. Der Live-Server auf Port 8400 wurde gestoppt, Prozessende verifiziert.

## Overall Impression

Die Karte hat eine ruhige, richtige Lesereihenfolge und der Kontrast traegt Sonnenlicht — das Fundament stimmt. Was fehlt, ist jeder Anlass, wie dieses Produkt auszusehen und wie dieser Screen zu funktionieren. Die groesste Einzelchance: **der Screen weiss nicht, welcher Tag heute ist.** Der einzige Grund, ihn zwischen zwei Aktivitaeten in 15 Sekunden zu oeffnen, lautet "was ist als Naechstes?" — und an Tag 5 muss man dafuer an vier erledigten Tagen vorbeiscrollen. Der Home-Screen beantwortet die Kernfrage des Tagesplans mit "Als Naechstes" bereits besser als der Tagesplan selbst.

## What's Working

1. **Die Toggle-Oekonomie ist richtig gebaut.** ParticipationToggle misst 44px Hoehe, ist vollstaendig reversibel, setzt aria-pressed korrekt, und der Server nimmt bei Austritt die Punkte sauber zurueck. Die Hauptaktion des Screens ist angstfrei — genau richtig fuer "nach ein paar Drinks".
2. **Kontrastdisziplin, verifiziert.** 55 Textknoten gemessen, **null Verstoesse**. Schlechtester Wert 4,70:1 und damit ueber AA; Bestwerte 15,5-17,6. Der Kommentar in globals.css zeigt, dass muted-2/-3 bewusst hochgezogen wurden.
3. **Zwei Systemregeln werden ohne Ausnahme eingehalten.** Kein einziges box-shadow ausser none, auch nicht bei geoeffnetem Formular. Und kein horizontaler Ueberlauf: bei 375px wie bei 320px ist scrollWidth gleich clientWidth, der lange Titel bricht sauber um statt zu clippen.

## Priority Issues

**[P0] Der Screen weiss nicht, welcher Tag heute ist.**
Was: plan/page.tsx:28 formatiert jeden Tag identisch. Kein "Heute", kein Highlight, kein Auto-Scroll, kein Einklappen vergangener Tage.
Warum: Die einzige Frage, fuer die man diesen Screen oeffnet, ist "was kommt jetzt?" — und sie ist die einzige, die er nicht beantwortet.
Fix: Tages-Key gegen getTripDayKey() pruefen; Header zu "Heute — Samstag, 29.08." in Member-Farbe; vergangene Tage kollabieren; beim Mount zum Heute-Block scrollen.
Suggested command: /impeccable shape

**[P0] Zerstoerung ohne Rueckfrage, ohne Undo, auf 32 Pixeln.**
Was: DeletePlanItemButton.tsx:16 rendert h-8 w-8 — gemessen 32x32px, unter den 44px, die DESIGN.md selbst fordert. Die einzigen zwei Elemente der Seite unter 44px. Ein Tap loescht sofort, entfernt alle Teilnahmen und storniert jedem Teilnehmer die Punkte. Im Tab-Fokus kommt der Papierkorb vor dem Toggle.
Warum: Zielszene ist 1 Uhr nachts, laut, angetrunken, Daumen.
Fix: Tap-Target auf 44x44; Zwei-Stufen-Bestaetigung oder 5-Sekunden-Undo; Fokusreihenfolge umdrehen.
Suggested command: /impeccable harden

**[P1] Die Belohnungsschleife ist unsichtbar — und die Scoreboard-Regel steht auf dem Kopf.**
Was: Beitritt zu einem Punkte-Item aendert an der Punktedarstellung exakt nichts. Der Pill nutzt weder StatNumber noch Mono noch tabular-nums, waehrend Home, Leaderboard und Drinks das durchgaengig tun. Gleichzeitig traegt Mono hier Uhrzeiten und Avatar-Initialen.
Warum: PRODUCT.md macht Punkte zum gemeinsamen Spielfeld. Ist der Erwerbsmoment stumm, existiert die Mechanik gefuehlt nicht.
Fix: Punkte durch StatNumber rendern; Uhrzeit auf Space Grotesk zurueckstellen; Mono aus den Avatar-Initialen nehmen; nach dem Beitritt Pill-Zustand wechseln mit einmaligem .bloom.
Suggested command: /impeccable typeset

**[P1] Fuer Screenreader ist der Screen eine Wand identischer Knoepfe.**
Was: Fuenf Buttons heissen "Bin dabei?" (x3) bzw. "Dabei" (x2), aria-label bei allen null. ParticipationToggle akzeptiert eine Prop itemTitle und warnt im Kommentar woertlich davor — Home uebergibt sie, plan/page.tsx:73 vergisst sie. Heading-Outline springt h1 zu h3, die drei Tagestrenner sind p-Elemente, main und nav ohne aria-label, keine einzige Live-Region. Nach dem Toggle landet activeElement auf BODY.
Fix: itemTitle durchreichen; Tages-Header zu h2; Tagesgruppe als ul/li; role="status"; role="alert" auf den Formularfehler.
Suggested command: /impeccable audit

**[P2] Das Formular fragt in der falschen Reihenfolge, ohne Labels, und bestaetigt nie.**
Was: Feldfolge Datum, Start/Ende, Titel, Details, Punkte. Beide Pflichtfelder (day, title) haben gar kein Label, kein aria-label, keine Pflichtmarkierung. Alle sechs Felder bei 42,0-42,7px, knapp unter 44. Beim Oeffnen springt der Fokus auf BODY und vom 390px hohen Formular sind nur 40px sichtbar. Nach Erfolg bleibt es leer offen, ohne Meldung.
Fix: Titel zuerst; persistente Labels; Felder auf 44px; beim Oeffnen scrollen und fokussieren; nach Erfolg schliessen und zur neuen Karte scrollen.
Suggested command: /impeccable clarify

## Persona Red Flags

**Sam (Screenreader / Tastatur)**
- Tab-Reihenfolge gemessen: "Ankunft und Check-in loeschen", "Dabei", "Bin dabei?", "Dabei", "Bin dabei?", "Clubnacht loeschen", "Bin dabei?". Der zweite Stopp der Seite ist ein unwiderruflicher Loeschbutton.
- Keine h2-Ebene: die Tagesstruktur ist in der Heading-Navigation unsichtbar.
- ParticipantAvatars gibt nur Initialen aus; der Name lebt nur im title-Attribut.
- Immerhin: alle 13 fokussierbaren Elemente erreichbar, DOM-Reihenfolge gleich visuelle Reihenfolge, focus-visible definiert.

**Der angetrunkene Member um 1 Uhr im Club**
- Oeffnet "Plan" fuer den Treffpunkt und landet am Reisebeginn. Der lange Titel bricht bei 320px auf vier Zeilen in einer 139px-Spalte — die Titelspalte belegt nur 57 % der Kartenbreite.
- Der Daumen sucht "Bin dabei?" und findet 32px daneben den Papierkorb.
- Ist die Profilfarbe "Rot" (#ff6161), ist der bestaetigte "Dabei"-Button ein grosser roter Pill, praktisch identisch mit --color-danger #ff6f6f.

**Alex (Power-User)**
- Keine Bearbeitung: nur loeschen und neu anlegen, wodurch 9 Zusagen verschwinden und Punkte storniert werden.
- sortOrder existiert im Schema, aber keine UI.
- Ende 04:00 vor Start 22:30 wird nie validiert.

## Minor Observations

- gap-5 (20px) nur hier; Drinks, Strafen und Leaderboard nutzen gap-4 (16px), was auch DESIGN.mds spacing.stack ist.
- Tages-Header steht 10px ueber seiner ersten Karte, Abstand zur Vorgruppe 20px. 2:1 ist zu schwach; der Header ist schwaecher gesetzt als die Titel, die er regiert.
- Bei 320px bricht "9 dabei" auf zwei Zeilen um.
- Blob-Radius: 0 Elemente. Das aktive Nav-Icon-Well ist rounded-full, wo DESIGN.md den Blob vorsieht.
- Bottom-Nav ist position sticky, DESIGN.md formuliert "fixed". Nichts wird verdeckt (24px Abstand).
- Der "+N Pkt"-Sticker ist um 3 Grad gekippt; DESIGN.md sagt Rotation "never on informational-only chips".
- Der Titel hat keine Zeilenbegrenzung, waehrend Home truncate verwendet.
- Empty State stimmlos gegenueber Strafen ("bisher ein braves Trip"). Zudem zwei Elemente fuer einen Job: nicht klickbare Empty-Card plus gestrichelte Box.
- Kein loading.tsx und kein error.tsx in app/.
- Konsole sauber: 0 Errors, 0 Warnings.

## Questions to Consider

1. Wenn Home mit "Als Naechstes" die eigentliche Frage bereits besser beantwortet als der Tagesplan — wofuer existiert dieser Screen dann noch, ausser zum Anlegen und Loeschen?
2. Warum steht die Uhrzeit in Scoreboard-Mono und der Punktestand in Fliesstext-Sans? Welche anderen Systemregeln werden hier nur zufaellig eingehalten?
3. Der Screen behandelt Loeschen visuell schwaecher als "Ich komme mit". Warum ist die gefaehrlichere Aktion die kleinere und dunklere?
4. Zehn Profilfarben fahren das Farbschema, darunter ein Rot neben --color-danger. Entscheidung oder ungeprueftes Nebenprodukt der Themenumstellung?
5. Jemand schreibt "Irgendwann:" in den Titel und den Treffpunkt in Klammern dahinter. Wann liest ein Produkt solche Workarounds als Feature-Request statt als schlechte Nutzerdaten?
