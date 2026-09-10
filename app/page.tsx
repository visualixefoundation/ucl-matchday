import { getMatches, isLive, isFinished, parseScore, type Match } from "@/lib/highlightly";
import RefreshButton from "./components/RefreshButton";
import KickoffCountdown from "./components/KickoffCountdown";

export const revalidate = 90;

function formatKickoff(dateIso: string) {
  return new Date(dateIso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusLabel(match: Match) {
  const { description, clock } = match.state;
  if (isLive(description)) {
    if (description.toLowerCase() === "half time") return "HT";
    return clock != null ? `${clock}'` : description;
  }
  if (isFinished(description)) return "FT";
  return formatKickoff(match.date);
}

export default async function HomePage() {
  const today = new Date().toISOString().slice(0, 10);
  let matches: Match[] = [];
  let errorMessage: string | null = null;

  try {
    matches = await getMatches(today);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Failed to load fixtures.";
  }

  const grouped = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const round = m.round ?? "Matchday";
    acc[round] = acc[round] ?? [];
    acc[round].push(m);
    return acc;
  }, {});

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
          <strong>Couldn't load today's fixtures</strong>
          {errorMessage}
        </div>
      )}

      {!errorMessage && matches.length === 0 && (
        <div className="empty-state">
          <strong>No Champions League matches today</strong>
          Check back on the next matchday, or see recent results and highlights.
        </div>
      )}

      {Object.entries(grouped).map(([round, roundMatches]) => (
        <section className="matchday" key={round}>
          <div className="matchday__label">{round}</div>
          {roundMatches.map((match) => {
            const score = parseScore(match.state.score.current);
            return (
              <div className="match-row" key={match.id}>
                <div
                  className={`match-row__status ${
                    isLive(match.state.description) ? "match-row__status--live" : ""
                  }`}
                >
                  {statusLabel(match)}
                </div>
                <div className="match-row__team">
                  {match.homeTeam.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="match-row__crest" src={match.homeTeam.logo} alt="" />
                  )}
                  {match.homeTeam.name}
                </div>
                <div className={`match-row__score ${score == null ? "match-row__score--pending" : ""}`}>
                  {score ? `${score[0]} – ${score[1]}` : "vs"}
                </div>
                <div className="match-row__team match-row__team--away">
                  {match.awayTeam.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="match-row__crest" src={match.awayTeam.logo} alt="" />
                  )}
                  {match.awayTeam.name}
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
