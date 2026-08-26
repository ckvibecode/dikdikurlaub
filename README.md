# dikdik-urlaubsapp

Mobile-first Web-App für eine Jugendgruppe im gemeinsamen Urlaub: Strafenkatalog, Getränke-Tracker,
Tagesplanung und ein Gamification-Layer (Punkte, Level, Streaks, Leaderboard).

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Prisma 7 (Driver Adapters) + PostgreSQL
- `iron-session` für Trip-Code + PIN Auth (kein OAuth)
- Deployment: GitHub -> Render (Web Service + Postgres)

## Lokale Entwicklung

Voraussetzung: Docker Desktop mit laufendem WSL2-Backend.

```bash
cp .env.example .env.local   # Werte anpassen, SESSION_SECRET generieren (openssl rand -base64 32)
npm install
npm run db:up                # startet lokale Postgres via docker-compose
npm run db:migrate           # wendet das Schema an
npm run db:seed              # legt den Trip + Strafenkatalog aus .env.local an
npm run dev                  # http://localhost:3000
```

`npm run db:studio` öffnet Prisma Studio zum Anschauen/Bearbeiten der Daten.

## Deployment (Render)

1. Repo auf GitHub pushen.
2. In Render: "New +" -> "PostgreSQL" -> Name (z. B. `dikdik-urlaubsapp-db`), Plan **Free** ->
   erstellen. Nach dem Anlegen die **Internal Database URL** kopieren.
3. In Render: "New +" -> "Web Service" -> Repo auswählen -> Runtime **Node**, Plan **Free**.
4. Build Command:
   ```
   npm install --include=dev && npx prisma generate && npx prisma migrate deploy && npx prisma db seed && npm run build
   ```
5. Start Command:
   ```
   npm run start
   ```
6. Env-Vars im Web-Service setzen:
   - `DATABASE_URL` -> die in Schritt 2 kopierte Internal Database URL
   - `SESSION_SECRET` -> zufälliger Wert (z. B. `openssl rand -base64 32`)
   - `NODE_ENV` -> `production`
   - `TRIP_CODE`, `TRIP_NAME`, `TRIP_START_DATE`, `TRIP_END_DATE` -> eigene Werte für den Trip
7. Deploy auslösen. Der Build führt bei jedem Deploy automatisch `prisma migrate deploy` +
   `prisma db seed` aus (Seed-Skript ist idempotent, kann gefahrlos mehrfach laufen).

`--include=dev` ist nötig, da `NODE_ENV=production` sonst devDependencies (u. a. `tsx` fürs
Seed-Skript, `typescript`/`tailwindcss` fürs Build) überspringt.

Hinweis: Render Free-Postgres läuft nach einer festen Frist ab, der Web-Service schläft bei
Inaktivität kurz ein (Cold-Start) &ndash; für die Dauer eines Urlaubs unkritisch.

## Feature-Status

- [x] Trip beitreten / einloggen (Trip-Code + Name + PIN)
- [x] Dashboard (Streak, Mini-Leaderboard, Getränke-Widget, Quick Actions)
- [x] Getränke-Tracker (nach Typ, Tagesverlauf, witzige Kommentare)
- [x] Leaderboard (Punkte, Level, Streak)
- [x] Tagesplanung (Einträge anlegen, abhaken, Streak-Kopplung)
- [x] Strafenkatalog (Katalog-Strafen mit Selbst-Bestätigung, Spontan-Strafen mit Gruppen-Voting)
- [ ] Challenges (Mini-Aufgaben mit Punkten)
- [ ] Community-Awards / Superlative

## Design

Design-Richtung "Neon Night ‑ Playful": dunkler Hintergrund (`#0a0c10`), Lime-Akzent (`#c8ff4d`),
Violett als Zweitfarbe (`#7a6ff0`), Space Grotesk + IBM Plex Mono, organische "Blob"-Rundungen.
Tokens liegen in `app/globals.css`.
