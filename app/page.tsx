import { getMatchesWindow, type Match } from "@/lib/highlightly";
import RefreshButton from "./components/RefreshButton";
import KickoffCountdown from "./components/KickoffCountdown";
import MatchRow from "./components/MatchRow";

export const revalidate = 90;

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function formatDayLabel(isoDate: string) {
  const d = new Date(isoDate + "T12:00:00.000Z");
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (isoDate === today) return "Today";
  if (isoDate === tomorrow) return "Tomorrow";
  return d.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
}

export default async function HomePage() {
  const today = new Date().toISOString().slice(0, 10);
  let matches: Match[] = [];
  let errorMessage: string | null = null;

  try {
    // 7-day window so non-match days still show the next fixtures
    matches = await getMatchesWindow(today, 7);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Failed to load fixtures.";
  }

  // Group by calendar day, then by round within the day
  const byDay = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const key = dayKey(m.date);
    acc[key] = acc[key] ?? [];
    acc[key].push(m);
    return acc;
  }, {});

  const dayKeys = Object.keys(byDay).sort();

  const nextMatch = matches
    .filter((m) => m.state.description.toLowerCase() === "not started")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="page wrap">
      <div className="page__heading">
        <h1>Fixtures &amp; live scores</h1>
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
          <strong>Couldn&apos;t load fixtures</strong>
          {errorMessage}
        </div>
      )}

      {!errorMessage && matches.length === 0 && (
        <div className="empty-state">
          <strong>No Champions League matches in the next week</strong>
          Check the standings or results, or come back closer to the next matchday.
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
            <div className="matchday__label">{formatDayLabel(day)}</div>
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
