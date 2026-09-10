# Matchday — UEFA Champions League

A single-competition site: fixtures, live scores, results, standings, team pages
and match detail for the Champions League only. Next.js (App Router), deployed
to Vercel, data from the Highlightly Football API.

## 1. Get an API key

Free tier: 100 requests/day, no card required.

1. Sign up at https://highlightly.net/login
2. Copy your API key

## 2. Find the Champions League league ID (one-time)

Highlightly identifies competitions by a numeric `leagueId`. Look it up once:

```bash
curl "https://soccer.highlightly.net/leagues?name=UEFA%20Champions%20League" \
  -H "x-rapidapi-key: YOUR_KEY_HERE"
```

Take the `id` field from the Champions League entry in the response — that's
your `UCL_LEAGUE_ID`.

(If you signed up via RapidAPI instead of highlightly.net directly, use
`https://football-highlights-api.p.rapidapi.com/leagues?...` with both the
`x-rapidapi-key` and `x-rapidapi-host: football-highlights-api.p.rapidapi.com`
headers, and set `HIGHLIGHTLY_SOURCE=rapidapi` in your env.)

## 3. Local setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local: HIGHLIGHTLY_API_KEY and UCL_LEAGUE_ID
npm run dev
```

Open http://localhost:3000.

## 4. Deploy to Vercel

1. Go to https://vercel.com/new and import the GitHub repo
2. Add environment variables (Project Settings → Environment Variables):
   - `HIGHLIGHTLY_API_KEY`
   - `HIGHLIGHTLY_SOURCE` (`direct` or `rapidapi`)
   - `UCL_LEAGUE_ID` (required — without it the site shows empty lists)
3. Deploy — Next.js is detected automatically

## Notes on the free tier

Pages cache server-side so repeat visitors don't burn the 100 req/day cap:

| Page | `revalidate` |
|------|----------------|
| Fixtures (7-day window) | 90s |
| Match detail | 60s |
| Results / highlights | 300s |
| Standings | 3600s |
| Team page | 300s |

The home page loads a **7-day fixture window** (parallel date queries) so
non-match days still show upcoming games. Cached responses keep API usage low.

## What's in v1

- **Home** — fixtures across the next week, live scores, grouped by day, kickoff countdown, manual refresh
- **Match detail** (`/match/[id]`) — scoreboard, venue/ref when available, event timeline
- **Standings** — league-phase table with secondary sort (position → points → GD → GF); teams link to team pages
- **Team pages** (`/team/[id]`) — crest + recent form (W/D/L)
- **Results & highlights** — finished matches with embedded YouTube highlights
- Loading skeletons on all routes
- Dark “night pitch” UI only (by design)

Not in v1 (easy to add later): search, push notifications, light theme.
