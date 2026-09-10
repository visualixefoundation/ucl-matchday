// Thin wrapper around the Highlightly Football API, scoped to one competition:
// the UEFA Champions League.
//
// Docs: https://highlightly.net/football-api/documentation/
// Verified against the live docs on 2026-09-08 — the /matches response nests
// state under `state.description` / `state.score.current`, not flat fields.

const SOURCE = process.env.HIGHLIGHTLY_SOURCE === "rapidapi" ? "rapidapi" : "direct";
const API_KEY = process.env.HIGHLIGHTLY_API_KEY;
const LEAGUE_ID = process.env.UCL_LEAGUE_ID;

const BASE_URL =
  SOURCE === "rapidapi"
    ? "https://football-highlights-api.p.rapidapi.com"
    : "https://soccer.highlightly.net";

function headers(): HeadersInit {
  if (!API_KEY) {
    throw new Error(
      "Missing HIGHLIGHTLY_API_KEY. Add it to .env.local (see .env.local.example)."
    );
  }
  const h: HeadersInit = {
    "x-rapidapi-key": API_KEY
  };
  if (SOURCE === "rapidapi") {
    h["x-rapidapi-host"] = "football-highlights-api.p.rapidapi.com";
  }
  return h;
}

async function get<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(BASE_URL + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString(), {
    headers: headers(),
    // Cache for 90s so a live-scores page doesn't burn through the
    // 100 req/day free tier on every visitor.
    next: { revalidate: 90 }
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Highlightly ${path} failed: ${res.status} ${body}`);
  }
  return res.json();
}

// Highlightly labels a season by the year it starts in (European football
// seasons run July -> May/June). "2026" covers Sept 2026 through mid-2027.
function currentSeason(): number {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1; // 1-12
  return month >= 7 ? year : year - 1;
}

type Team = {
  id: number;
  logo?: string;
  name: string;
  type?: string;
};

type MatchState = {
  description: string; // e.g. "Not started", "First half", "Half time", "Finished"
  clock?: number | null;
  score: {
    current: string | null; // e.g. "3 - 1", null before kickoff
    penalties?: string | null;
  };
};

export type Match = {
  id: number;
  round?: string;
  date: string; // ISO date/time
  homeTeam: Team;
  awayTeam: Team;
  state: MatchState;
};

export type Highlight = {
  id: number | string;
  title: string;
  date: string;
  embedUrl?: string;
  url: string;
  homeTeam?: string;
  awayTeam?: string;
};

// Fixtures + live scores for a given date (defaults to today, UTC).
export async function getMatches(date?: string): Promise<Match[]> {
  if (!LEAGUE_ID) return [];
  const day = date ?? new Date().toISOString().slice(0, 10);
  const data = await get<{ data?: Match[] } | Match[]>("/matches", {
    leagueId: LEAGUE_ID,
    date: day,
    season: currentSeason(),
    timezone: "Etc/UTC"
  });
  return Array.isArray(data) ? data : data.data ?? [];
}

// Recent highlight videos for the competition.
export async function getHighlights(date?: string): Promise<Highlight[]> {
  if (!LEAGUE_ID) return [];
  const params: Record<string, string | number> = {
    leagueId: LEAGUE_ID,
    season: currentSeason()
  };
  if (date) params.date = date;
  const data = await get<{ data?: Highlight[] } | Highlight[]>("/highlights", params);
  return Array.isArray(data) ? data : data.data ?? [];
}

// state.description values that mean the match is currently being played.
const LIVE_DESCRIPTIONS = [
  "first half",
  "second half",
  "half time",
  "extra time",
  "break time",
  "penalties",
  "in progress"
];

// state.description values that mean the match has concluded.
const FINISHED_DESCRIPTIONS = [
  "finished",
  "finished after penalties",
  "finished after extra time",
  "awarded"
];

export function isLive(description: string): boolean {
  return LIVE_DESCRIPTIONS.includes(description.toLowerCase());
}

export function isFinished(description: string): boolean {
  return FINISHED_DESCRIPTIONS.includes(description.toLowerCase());
}

// Parses a "3 - 1" style score string into [home, away], or null if the
// match hasn't started (score.current is null before kickoff).
export function parseScore(current: string | null): [number, number] | null {
  if (!current) return null;
  const m = current.match(/(\d+)\s*-\s*(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2])];
}

// --- Standings ---

type StandingsSplit = {
  wins: number;
  draws: number;
  games: number;
  loses: number;
  scoredGoals: number;
  receivedGoals: number;
};

export type StandingRow = {
  team: { id: number; logo?: string; name: string };
  total: StandingsSplit;
  home: StandingsSplit;
  away: StandingsSplit;
  points: number;
  position: number;
};

export type StandingsGroup = {
  name: string;
  standings: StandingRow[];
};

export type Standings = {
  groups: StandingsGroup[];
  league: { id: number; logo?: string; name: string; season: number };
};

// Standings for the competition's current season. Both leagueId and season
// are required by the API.
export async function getStandings(): Promise<Standings | null> {
  if (!LEAGUE_ID) return null;
  const data = await get<Standings>("/standings", {
    leagueId: LEAGUE_ID,
    season: currentSeason()
  });
  return data;
}
