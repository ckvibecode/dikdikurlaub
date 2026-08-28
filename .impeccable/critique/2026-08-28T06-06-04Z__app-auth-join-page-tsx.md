---
target: Trip beitreten-Screen
total_score: 24
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 2
timestamp: 2026-08-28T06-06-04Z
slug: app-auth-join-page-tsx
---
**Method: dual-agent (A: Design-Review · B: Detector + Browser-Evidence)**

# Design-Kritik: „Trip beitreten"-Screen

## Design Health Score

| # | Heuristik | Score | Kernproblem |
|---|-----------|-------|-------------|
| 1 | Visibility of System Status | 3 | Pending-Label + Disabled-Button gut; keine Live-Validierung, Fehler erst nach Submit |
| 2 | Match System / Real World | 3 | Lockerer Ton passt; Trip-Code-Feld gibt keinen Format-Hinweis (Zod erlaubt 3–20 Zeichen) |
| 3 | User Control and Freedom | 3 | Guter Cross-Link zu `/login`, aber keine Trip-Vorschau vor dem Commit auf Name+PIN |
| 4 | Consistency and Standards | 4 | Join/Login strukturell identisch, Tokens sitzen exakt auf der Spec |
| 5 | Error Prevention | 2 | Keine PIN-Bestätigung, obwohl es null Recovery-Pfad gibt |
| 6 | Recognition Rather Than Recall | 4 | Persistente Labels statt Placeholder-als-Label; Avatar-Picker ist visuelle Wiedererkennung |
| 7 | Flexibility and Efficiency | n/a | Einmaliges Mikro-Formular, Accelerators wären sinnlos |
| 8 | Aesthetic and Minimalist Design | 3 | Sauber, aber unter-expressiv für ein „Arcade"-Markenversprechen |
| 9 | Error Recovery | 2 | `state.error` ist ein generischer String ohne Feldzuordnung |
| 10 | Help and Documentation | n/a | Screen erklärt sich selbst |
| **Total** | | **24/32** | **Good (75 %)** |

n/a: Heuristiken 7 und 10.

## Design Specificity Verdict

**LLM-Bewertung:** Mechanisch systemtreu, emotional austauschbar. Der `GlowBlob` (lime oben rechts, violett unten links, exakt `opacity-[0.16]` / `blur-[55px]`) ist echte, spezifische Autorenschaft — er setzt die „Glow statt Schatten"-Regel des Systems präzise um. Alles andere ist ein kompetentes, aber beliebiges Dark-Mode-Formular: H1, gedämpfter Untertitel, vier gestapelte Felder, ein Lime-Pill-Button. Nichts signalisiert „Freundesgruppen-Arcade", bevor das Auge die Felder erreicht.

**Deterministischer Scan:** CLI-Detector über `app/(auth)/join`, `components/auth`, `Card.tsx`, `Button.tsx` → Exit 0, null Findings. Echtes Ergebnis (Pfade und Engine-Auflösung verifiziert), bedeutet aber nur „keine statischen Anti-Pattern", nicht „gutes Design". Das injizierte Live-Overlay fand zusätzlich 2 Findings, die der statische Scanner nicht prüft.

**Visuelle Overlays:** Injektion erfolgreich (Live-Server Port 8400, danach sauber gestoppt). Console-Ausgabe:
1. `low-contrast`: 3,3:1 (nötig 4,5:1) — Text #626a78 auf #15181f
2. `flat-type-hierarchy`: Größen 14px, 16px, 20px (Ratio 1,4:1)

Overlay ist nicht mehr sichtbar — Server wurde nach dem Auslesen beendet.

## Overall Impression

Handwerklich sauber und systemtreu — die Design-Spec wurde wirklich befolgt. Das Problem liegt woanders: der Screen behandelt eine unwiderrufliche Entscheidung wie eine beiläufige. Die PIN ist das einzige, was ein Mitglied sich über den ganzen Trip merken muss, es gibt keine E-Mail, kein Reset, keinen Support — und sie wird in exakt derselben visuellen Gewichtung abgefragt wie „Dein Name". Größte Chance: die Einstiegsseite von einem Formular zu einem Empfang machen und gleichzeitig die PIN-Stakes ernst nehmen.

## What's Working

1. **`GlowBlob` als Elevation-Beweis** — `opacity-[0.16]`, `blur-[55px]`, kein einziger `box-shadow` im ganzen Screen. Das System sagt „Tiefe durch Licht, nicht durch Schatten", und der Code tut genau das.
2. **Avatar-Selection-State ohne Schatten** (JoinForm.tsx:55) — nur `border-color` + `scale(1.08)`. Regeltreu und trotzdem lesbar.
3. **Copy-Register** — „Trip-Code von der Gruppe holen, Namen und PIN wählen – los geht's" plus das symmetrische „Schon dabei?" / „Noch nicht dabei?". Echter Freundesgruppen-Ton, kein Formular-Behördendeutsch.

## Priority Issues

**[P0] Die PIN ist unwiderruflich, aber nicht als solche behandelt**
- Warum es zählt: Kein Account, keine E-Mail, kein Reset. Ein Tippfehler beim Setzen der PIN sperrt jemanden für den gesamten Trip aus — und zwar genau in dem Moment, in dem die Person am wenigsten aufmerksam ist (Gruppensituation, alle tippen gleichzeitig). Der Hinweis „merk sie dir gut" steht als gleich große Klammer im Label und sagt nie warum.
- Fix: Zweites Feld „PIN bestätigen", oder mindestens ein visuell abgesetzter Hinweis, der die Konsequenz benennt („Es gibt kein Zurücksetzen — ohne PIN kommst du nicht mehr rein").
- Suggested command: `/impeccable harden`

**[P1] Fehler sind nicht am Feld lokalisiert**
- Warum es zählt: JoinForm.tsx:87 rendert einen einzigen generischen Satz. Falscher Trip-Code und ungültige PIN sehen für den Nutzer identisch aus — er muss raten, welches der vier Felder gemeint ist.
- Fix: Zod-Feldfehler auf die jeweiligen Inputs mappen, roter Rahmen + `aria-describedby`.
- Suggested command: `/impeccable harden`

**[P1] Generischer erster Eindruck**
- Warum es zählt: Das ist das Allererste, was ~10–15 Freunde von der App sehen. Ohne Wortmarke, Logo oder irgendein Zeichen ist der Screen in jedes beliebige Dark-SaaS-Login austauschbar. Danach landen sie auf einem verspielten, gamifizierten Home — der Tonbruch ist spürbar.
- Fix: Eine kleine, unverwechselbare Marke oder ein Motion-Moment über der H1.
- Suggested command: `/impeccable delight`

**[P2] Avatar-Tap-Targets unter dem eigenen Standard** (beide Assessments einig)
- Warum es zählt: Gemessen 36×36 px (ausgewählt 38,9 px), während die eigene `Button`-Komponente `min-h-11` (44 px) vorschreibt und das Produkt selbst „44px+ wegen Sonnenlicht/einhändig/nach ein paar Drinks" als Regel formuliert. Der Submit-Button hält die 44 px exakt ein — die Swatches nicht.
- Fix: Swatches auf 44 px anheben.
- Suggested command: `/impeccable adapt`

**[P2] Kontrast-Fehler bei `muted-2`** (Detector und Review unabhängig bestätigt)
- Warum es zählt: `#626a78` auf der Card `#15181f` ergibt 3,26:1 — WCAG AA verlangt 4,5:1. Betrifft „Schon dabei?" und „Alle Avatar-Farben sind schon vergeben". Im angegebenen Nutzungskontext (pralle Sonne, Handy) deutlich schlimmer als der Zahlenwert suggeriert. `muted-1` (#9aa2b1) liegt dagegen bei 6,92:1 und ist unbedenklich.
- Fix: Diese Strings auf `muted-1` hochstufen.
- Suggested command: `/impeccable audit`

Anmerkung zur Abweichung: Die Design-Review rechnete ~3,6:1 gegen den Seitenhintergrund `#0a0c10`, die Messung ergab 3,26:1 gegen den tatsächlichen Card-Hintergrund `#15181f`. Der gemessene Wert ist der richtige — das Urteil („fällt durch AA") ist in beiden Fällen dasselbe.

## Persona Red Flags

**Jordan (Erstnutzer):** Kommt ohne jeden Markenkontext auf einem bürokratisch wirkenden Formular an. Die PIN-Konsequenz steckt in einer kleinen Klammer, ohne das „Warum". Trip-Code-Feld gibt keinen Format-Hinweis — er muss raten, wie so ein Code aussieht.

**Sam (Screenreader/Tastatur):** Die Avatar-Buttons tragen englische `aria-label={color}` („lime", „teal") in einer durchgehend deutschen App. Kein `aria-pressed`, also ist für einen Screenreader nicht wahrnehmbar, welche Farbe gerade ausgewählt ist (JoinForm.tsx:50). Dazu der `muted-2`-Kontrastfehler.

**Casey (Handy, unterwegs):** 36-px-Swatches mit ~10 px Abstand, einhändig, draußen, angetrunken — exakt der beschriebene Nutzungskontext, exakt die Bedingungen für Fehl-Taps. Immerhin: kein Overflow bei 390 px Breite (`scrollWidth === clientWidth === 390`), das Layout hält.

## Minor Observations

- Default-Avatar ist immer Lime — dieselbe Farbe, die im System „primäre Aktion" bedeutet, und semantisch in Konflikt mit Violett, das laut Spec „das bist du" reserviert hat.
- Flache Typo-Hierarchie (nur vom Detector gefunden, in der Review übersehen): gerenderte Größen 14/16/20 px, Ratio 1,4:1. Für einen Screen, dessen Job „Empfang" ist, wenig Spannung.
- Trip-Code ohne Formatangabe — Zod erlaubt 3–20 Zeichen, der Nutzer sieht davon nichts.
- Keine Console-Fehler oder -Warnungen beim Laden, nur Dev-Rauschen (React DevTools, HMR). Alle drei sichtbaren Inputs haben korrekt verknüpfte `<label>`-Elemente.

## Questions to Consider

1. Wenn eine vergessene PIN dich für den ganzen Trip aussperrt — warum kostet ihre Eingabe genauso wenig Aufmerksamkeit wie die Eingabe deines Namens?
2. Lime bedeutet überall sonst „primäre Aktion", ist hier aber gleichzeitig die Standard-Avatarfarbe. Dürfen Identitätsfarben je mit UI-Semantikfarben kollidieren?
3. Nimm die zwei Glow-Blobs und den Lime-Button weg — bleibt irgendetwas übrig, das „DikDik auf Reisen" sagt statt „generisches Dark-Sign-in"?

## Bereits umgesetzt (unabhängig von der Kritik)

- Platzhalter „z.B. Finn" aus dem Namensfeld entfernt (JoinForm und LoginForm).
- Avatar-Farben von `flex flex-wrap` auf `grid grid-cols-5` umgestellt — zwei gleichmäßige Reihen à fünf.
