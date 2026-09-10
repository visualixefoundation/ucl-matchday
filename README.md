# Matchday — UEFA Champions League

A single-competition site: fixtures, live scores, results and highlights for
the Champions League only. Next.js (App Router), deployed to Vercel, data
from the Highlightly Football API.

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

## 4. Push to GitHub

```bash
git init
git add .
git commit -m "UCL matchday site"
gh repo create ucl-matchday --public --source=. --push
# no gh CLI? create a repo on github.com and:
# git remote add origin https://github.com/<you>/ucl-matchday.git
# git branch -M main
# git push -u origin main
```

## 5. Deploy to Vercel

1. Go to https://vercel.com/new and import the GitHub repo
2. Add the three environment variables from `.env.local` (Project Settings →
   Environment Variables): `HIGHLIGHTLY_API_KEY`, `HIGHLIGHTLY_SOURCE`,
   `UCL_LEAGUE_ID`
3. Deploy — no other config needed, Next.js is detected automatically

## Notes on the free tier

Both pages cache server-side (`revalidate: 90` on the fixtures page, `300` on
results) so repeat visitors don't burn through the 100 req/day cap. If you
outgrow it, Highlightly's paid tiers raise the limit — see
https://highlightly.net/football-api/.

## What's in v1

- Home page — today's fixtures with live scores, grouped by matchday, manual refresh
- Results page — recent finished matches with embedded YouTube highlights

Not in v1 (easy to add later): team pages, standings/bracket view, search,
push notifications, dark/light toggle (site is dark-only by design).
