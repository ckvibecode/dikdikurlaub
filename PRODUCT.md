# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4, Prisma 7 (driver adapters) + PostgreSQL,
`iron-session` for auth. Deploy target: GitHub -> Render (persistent Node web service + Render
Postgres), not Vercel/serverless. Local dev DB via Docker Compose Postgres.

## Users

A small friend group (roughly 10-15 people, a "Jugendgruppe") on a shared vacation together,
using the app on their phones during the trip itself. No accounts/emails; each person joins with
a shared Trip-Code, picks a name/avatar, and sets a 4-digit PIN. Casual, playful context: this is
a fun companion for the trip, not a professional tool.

## Product Purpose

"DikDik auf Reisen" lets a group track the shared, often silly rituals of a trip together: who
did what dumb thing and what their consequence is, how much everyone is drinking, what the plan
for each day is, and a lightweight game layer (points, levels, streaks, leaderboard) that turns
group participation into something to compete over. Success is the group actually using it
throughout the trip instead of tracking these things in a group chat.

## Positioning

Not a generic habit-tracker or expense-splitter reskinned for a trip: the thing that makes it
specifically "this group's app" is the Strafenkatalog -- a pre-agreed, funny, per-action
consequence system the group defines for itself (and can keep extending via an admin), where
confirmed penalties also cost the target real minus points in the shared ranking.

## Operating Context

Used almost entirely on phones, often outdoors, in bright sunlight, after a few drinks, in short
bursts between activities. Multiple people use the same shared trip data concurrently and expect
to see each other's actions reasonably promptly (polling-based refresh, not true realtime).

## Capabilities and Constraints

- Trip-Code + name + 4-digit PIN auth per trip; no email, no OAuth.
- Strafenkatalog: a per-trip catalog of actions with a pre-assigned consequence and optional
  minus points, managed by the trip admin (add/remove entries), logged by anyone and
  self-confirmed by the target person; plus freeform spontaneous proposals (own optional minus
  points) that need at least 3 confirming votes from the group (fixed threshold, not proportional
  to group size) to be enforced. Any entry can be deleted by an admin (including already-approved
  ones, which reverses the points) or by its proposer while still unresolved. The target can check
  off a confirmed penalty as personally "fulfilled" once they've actually done it.
- Drinks tracker: per-category counters with admin-managed categories (four defaults: Bier/Shot/
  Cocktail/Wein) and per-category points, daily history, threshold-based comment copy.
- Tagesplan: shared day-by-day itinerary items with start/end time; members confirm participation
  (visible to everyone who's in), the creator can award points for attending, and only the
  creator can delete the item.
- Gamification: points/levels/streaks/leaderboard fed by challenges, itinerary participation,
  confirmed Strafenkatalog penalties (as minus points), a "just for fun" drinks-based ranking, and
  community-voted awards.
- One trip per deployment currently (single seeded Trip row); not built as a multi-tenant SaaS.
- Undecided: Challenges and community Awards features are planned but not yet implemented.

## Brand Commitments

App name: "DikDik auf Reisen" (the dik-dik is a small, quick antelope -- playful, a little
absurd, fits a lighthearted group-trip app). Individual trips inside the app carry their own
name (e.g. a placeholder trip is currently seeded as "Palma Squad '26").

## Evidence on Hand

None yet: no real trip photos, member names, or copy from an actual trip. Seeded/demo data
(member "Finn", trip "Palma Squad '26") is placeholder, not real content -- do not treat it as
brand evidence to preserve.

## Product Principles

- Playful and a little chaotic in tone, never corporate -- this is for a friend group's inside
  jokes, not a professional tool.
- Consequences have real stakes: a confirmed Strafenkatalog penalty deducts from the same
  leaderboard everyone competes on, not a side-channel that doesn't matter.
- Built for thumbs, sunlight, and short attention spans: large tap targets, fast paths to the
  five core actions, minimal typing.
- Should read as hand-built and specific to this group, never like a generic templated tracker
  app or an obviously AI-generated interface.
