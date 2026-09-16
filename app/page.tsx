import { getMatchesWindow, type Match } from "@/lib/highlightly";
import { dayKeyEAT, formatDayLabelEAT } from "@/lib/time";
import RefreshButton from "./components/RefreshButton";
import KickoffCountdown from "./components/KickoffCountdown";
import MatchRow from "./components/MatchRow";

// Long ISR — bots/crawlers must not re-hit Highlightly every few minutes
export const revalidate = 21600; // 6 hours

export default async function HomePage() {
  const today = new Date().toISOString().slice(0, 10);
  let matches: Match[] = [];
  let errorMessage: string | null = null;

  try {
    // Past 10 days covers last league-phase matchday (MD1 was 8–10 Sep);
    // next 2 days for any imminent fixtures. ~12 API calls when cache is cold.
    matches = await getMatchesWindow(today, 2, 10);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Failed to load fixtures.";
  }

  const byDay = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const key = dayKeyEAT(m.date);
    acc[key] = acc[key] ?? [];
    acc[key].push(m);
    return acc;
  }, {});

  // Chronological: Tue → Wed → Thu
  const dayKeys = Object.keys(byDay).sort();

  const nextMatch = matches
    .filter((m) => m.state.description.toLowerCase() === "not started")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const quotaHit =
    errorMessage?.includes("429") ||
    errorMessage?.toLowerCase().includes("daily request");

  return (
    <div className="page wrap">
      <div className="page__heading">
        <h1>Fixtures & live scores</h1>
        <RefreshButton />
      </div>

      {nextMatch && (
        <KickoffCountdown
          targetIso={nextMatch.date}
          label={`${nextMatch.homeTeam.name} vs ${nextMatch.awayTeam.name}`}
        />
      )}

      {errorMessage && (
        <div className="empty-state">
          <strong>
            {quotaHit
              ? "API daily limit reached"
              : "Couldn't load fixtures"}
          </strong>
          {quotaHit
            ? "Highlightly free tier is exhausted for today. Data returns after the daily reset (around 03:00 EAT)."
            : errorMessage}
        </div>
      )}

      {!errorMessage && matches.length === 0 && (
        <div className="empty-state">
          <strong>No Champions League matches in this window</strong>
          Next league-phase matchday is mid-October. Check standings, or SuperSport for highlights.
        </div>
      )}

      {dayKeys.map((day) => {
        const dayMatches = byDay[day];
        const byRound = dayMatches.reduce<Record<string, Match[]>>((acc, m) => {
          const round = m.round ?? "Matchday";
          acc[round] = acc[round] ?? [];
          acc[round].push(m);
          return acc;
        }, {});

        return (
          <section className="matchday" key={day}>
            <div className="matchday__label">{formatDayLabelEAT(day)}</div>
            {Object.entries(byRound).map(([round, roundMatches]) => (
              <div key={round}>
                {Object.keys(byRound).length > 1 && (
                  <div className="matchday__sublabel">{round}</div>
                )}
                {roundMatches.map((match) => (
                  <MatchRow key={match.id} match={match} />
                ))}
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
