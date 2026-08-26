---
name: DikDik auf Reisen
description: Neon-night, playful gamification companion for a friend group's shared trip
colors:
  night-ink:
    value: "#0a0c10"
  charcoal-panel:
    value: "#15181f"
  charcoal-panel-hover:
    value: "#1c2029"
  glow-lime:
    value: "#c8ff4d"
  dusk-violet:
    value: "#7a6ff0"
  fog-1:
    value: "#9aa2b1"
  fog-2:
    value: "#626a78"
  fog-3:
    value: "#4a505c"
  soft-white:
    value: "#f2f3f5"
typography:
  display:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  stat:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  card: "16px"
  pill: "9999px"
  blob: "40% 60% 55% 45% / 55% 45% 60% 40%"
spacing:
  page-x: "18px"
  stack: "16px"
  tight: "8px"
components:
  button-primary:
    backgroundColor: "{colors.glow-lime}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.dusk-violet}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  card:
    backgroundColor: "{colors.charcoal-panel}"
    textColor: "{colors.soft-white}"
    rounded: "{rounded.card}"
    padding: "16px"
---

# Design System: DikDik auf Reisen

## Overview

**Creative North Star: "The Dik-Dik Night Arcade"**

A friend group's trip companion that feels like a handheld arcade cabinet built for one specific
inside joke, not a fitness-tracker reskin. The system lives almost entirely in the dark: a near-
black ink surface hosts a single loud accent (glow-stick lime) doing the talking, with a second,
quieter neon (dusk violet) reserved for "this is you" / secondary-emphasis moments. Numbers get a
monospace, HUD-style treatment so points, streaks, and drink counts read like a scoreboard, not
a form field. Structure stays clean and rectilinear (pill buttons, 16px-radius cards), but
accents break the grid on purpose: level badges, rank-1 chips, and icon wells use an organic,
slightly lopsided "blob" radius and a small counter-rotation, so the interface feels hand-placed
rather than machine-generated. No drop shadows anywhere; depth comes from tonal layering (ink →
panel → panel-hover) and soft, blurred glow blooms behind key moments.

Confirmed anti-references: no gradient-hero sections, no left-border-accent cards, no stock icon
sets, no emoji as UI iconography, no default web-safe fonts (Arial/Inter/Roboto).

**Key Characteristics:**
- Near-black base with exactly one dominant accent (lime) and one supporting accent (violet)
- Monospace numerals for every stat, score, and count
- Flat surfaces + tonal layering + soft glow blooms instead of shadows
- Clean rectilinear structure, organic "blob" radius reserved for accent/celebration moments
- Small, deliberate counter-rotations (-10deg to 4deg) on badges and chips for handmade energy

## Colors

Near-monochrome dark palette with exactly two neons carrying all color meaning; everything else
is graphite-toned gray-blue.

### Primary
- **Glow Lime** (`#c8ff4d`): the one accent that means "this matters" — primary buttons, active
  nav state, rank-1 highlight, positive stat emphasis, streak fill. Used sparingly and always at
  full saturation; never tinted down for a "secondary lime."

### Secondary
- **Dusk Violet** (`#7a6ff0`): reserved for "you" / the current user's identity — the logged-in
  member's row on a leaderboard, their rank chip, secondary buttons. Never used for the same
  meaning as lime in the same view; the two never compete for "most important" in one glance.

### Neutral
- **Night Ink** (`#0a0c10`): the base page background, everywhere.
- **Charcoal Panel** (`#15181f`): every card/surface sits one step lighter than the page.
- **Charcoal Panel Hover** (`#1c2029`): pressed/active surface state, used sparingly.
- **Soft White** (`#f2f3f5`): primary text on dark surfaces.
- **Fog 1** (`#9aa2b1`): secondary text, metadata, timestamps.
- **Fog 2** (`#626a78`): tertiary text, inactive nav labels.
- **Fog 3** (`#4a505c`): the dimmest visible mark — inactive nav icons, disabled states.

### Named Rules
**The One-Loud-Color Rule.** Only one saturated accent is ever "the point" of a given element.
Lime and violet never both call for attention in the same component; when a view needs both
(e.g., a leaderboard with a rank-1 lime chip and a violet "you" row), they must be on different
rows so the eye resolves them as two separate facts, not one confused signal.

## Typography

**Display/Body Font:** Space Grotesk (with `system-ui, sans-serif` fallback)
**Stat/Mono Font:** IBM Plex Mono (with `ui-monospace, monospace` fallback)

**Character:** Space Grotesk carries all UI text — geometric, slightly quirky, confident without
being a display face pretending to be body text. IBM Plex Mono is reserved exclusively for
numbers that are *scores*: points, streak counts, drink tallies, ranks. The pairing's job is to
make numbers feel like they come from a different, more "official" system than the surrounding
chatty UI copy — the scoreboard voice versus the app's own voice.

### Hierarchy
- **Headline** (700, 15-16px, 1.2): page titles, dashboard greeting ("Hey, Finn!").
- **Title** (700-800, 13-14px, 1.3): card section headers ("Rangliste", "Getraenke heute").
- **Body** (500-600, 13-14px, 1.4): copy, labels, member names, form inputs.
- **Label** (600-700, 9-11px, 1.2): bottom-nav labels, chip text, metadata captions.
- **Stat** (600, 13-28px, 1, mono): any number that represents a score, count, or rank.

### Named Rules
**The Scoreboard Rule.** If a number is something the group is competing over or tracking
(points, streak days, drink counts, rank), it renders in IBM Plex Mono with `tabular-nums`. If a
number is incidental (a date, a PIN field, a percentage in body copy), it stays in Space Grotesk.

## Layout

Mobile-first, single-column, max content width implicitly bounded by the phone viewport (no
desktop layout defined yet — this is a phone-in-hand app, not a responsive marketing site).
Vertical rhythm: 16px gap between stacked cards, 18px horizontal page padding, 14-16px internal
card padding. Every screen follows the same skeleton: header/greeting block, then a vertical
stack of cards (streak, leaderboard preview, feature widget), then a persistent bottom
navigation bar fixed to the viewport bottom with `env(safe-area-inset-bottom)` padding for iOS
home-indicator clearance.

## Elevation & Depth

**The Flat-By-Default Rule.** No `box-shadow` anywhere in the system. Depth is conveyed by (1)
tonal layering — ink background, one-step-lighter panel surface, two-step-lighter hover state —
and (2) soft, heavily blurred (~50-55px) circular glow blooms in lime or violet at ~16-18%
opacity, placed behind hero moments (auth screens, dashboard header) to suggest ambient light
rather than a light source casting a shadow. A card never "lifts" on interaction; it changes
tone or gains a glow, never a shadow.

## Shapes

Two deliberate radius languages that must never blend on the same element:
1. **Structural radius** — `rounded-2xl` (16px) for cards, `rounded-full` for buttons, pills, and
   nav icon wells. Predictable, calm, does the load-bearing structural work.
2. **Blob radius** — an organic, asymmetric radius (`40% 60% 55% 45% / 55% 45% 60% 40%`) reserved
   for accent/celebration moments only: level badges, the rank-1 leaderboard chip, quick-action
   icon wells. Always paired with a small counter-rotation (-10deg to 4deg). This is the
   system's signature "handmade" tell — never apply it to a full card or a large surface.

## Components

### Buttons
- **Shape:** fully rounded (`rounded-full`, 9999px), never the card radius.
- **Primary:** glow-lime background, night-ink text, semibold, `12px 20px` padding, min 44px tap
  height.
- **Secondary:** transparent fill, 1px dusk-violet/50% border, dusk-violet text.
- **Ghost:** translucent white fill (`white/6%`), soft-white text — used for "cancel"/dismiss
  actions that must never compete with the primary action.
- **Hover/Active:** primary darkens ~10% on hover; no scale or shadow change on any variant.

### Cards
- **Corner Style:** 16px (`rounded-2xl`).
- **Background:** charcoal-panel on night-ink page background; a hairline `white/6%` border
  substitutes for a shadow to separate the card from the page.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Internal Padding:** 14-16px.

### Chips / Pills (PillBadge)
- **Style:** fully rounded, tinted background at ~10-16% opacity of the chosen accent, 1px border
  at ~40-45% opacity of the same accent, text in the accent's near-full-strength value.
- **Tones:** lime (positive/primary emphasis), violet ("this is you"), neutral (fog-toned,
  informational).
- **Rotation:** an optional small fixed tilt (`-6deg` / `3deg`) for playful, sticker-like chips
  (streak counters, level badges) — never on informational-only chips.

### Inputs / Fields
- **Style:** `white/4%` fill, 1px `white/10%` border, 12px radius, generous 12-14px vertical
  padding for thumb-friendly tapping.
- **Focus:** border shifts to glow-lime at ~60% opacity. No glow/shadow ring.

### Navigation (BottomNav)
- **Style:** fixed to viewport bottom, `charcoal-panel`-darker (`#0e1015`) background, hairline
  top border, five icon+label items.
- **Active state:** icon well gets a lime-tinted blob-radius background and lime icon/label color.
- **Inactive:** fog-3 icon and label, no background.
- **Mobile treatment:** `env(safe-area-inset-bottom)` bottom padding; 44px+ minimum tap targets.

### StatNumber (signature component)
Every score, count, or rank in the app renders through this one component: IBM Plex Mono,
`tabular-nums`, semibold, sized 13-28px depending on prominence. It is the one place mono type
appears, which is precisely what makes it read as "the scoreboard" against Space Grotesk
everywhere else.

## Do's and Don'ts

### Do:
- **Do** keep exactly one saturated accent doing the "this is the point" job per component (The
  One-Loud-Color Rule).
- **Do** render every score/count/rank in IBM Plex Mono with `tabular-nums` (The Scoreboard Rule).
- **Do** reserve the blob radius + counter-rotation combo for small accent moments, never full
  cards or page sections.
- **Do** convey depth with tonal steps and glow blooms, never `box-shadow`.
- **Do** keep tap targets at 44px+ given the sunlight/one-handed/post-a-few-drinks usage context.

### Don't:
- **Don't** use emoji as iconography; every icon is a hand-authored inline SVG on a 20px
  stroke-based grid.
- **Don't** introduce a gradient background/hero, a left-border-accent card, or any other
  templated-AI-tool visual tell.
- **Don't** let lime and violet both carry "primary emphasis" in the same view.
- **Don't** add a `box-shadow` to lift anything on hover/press; change tone or add a glow instead.
- **Don't** fall back to Arial/Inter/Roboto/system-ui as a *visible* font; those exist only as the
  fallback stack behind Space Grotesk / IBM Plex Mono.
