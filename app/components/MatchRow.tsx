import Link from "next/link";
import { isLive, isFinished, parseScore, type Match } from "@/lib/highlightly";
import { formatKickoffTime } from "@/lib/time";

function centerLabel(match: Match): { main: string; sub?: string; live?: boolean } {
  const { description, clock } = match.state;
  const score = parseScore(match.state.score.current);

  if (isLive(description)) {
    const minute =
      description.toLowerCase() === "half time"
        ? "HT"
        : clock != null
          ? `${clock}'`
          : "LIVE";
    return {
      main: score ? `${score[0]} – ${score[1]}` : minute,
      sub: score ? minute : undefined,
      live: true
    };
  }

  if (isFinished(description)) {
    return {
      main: score ? `${score[0]} – ${score[1]}` : "FT",
      sub: score ? "FT" : undefined
    };
  }

  // Not started — kickoff time in the middle (Sevilla · 10:00 PM · Valencia)
  return { main: formatKickoffTime(match.date) };
}

export default function MatchRow({ match }: { match: Match }) {
  const center = centerLabel(match);

  return (
    <Link href={`/match/${match.id}`} className="match-row match-row--link">
      <div className="match-row__team match-row__team--home">
        <span className="match-row__name">{match.homeTeam.name}</span>
        {match.homeTeam.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="match-row__crest" src={match.homeTeam.logo} alt="" />
        )}
      </div>

      <div
        className={`match-row__center ${
          center.live ? "match-row__center--live" : ""
        }`}
      >
        <span className="match-row__center-main">{center.main}</span>
        {center.sub && <span className="match-row__center-sub">{center.sub}</span>}
      </div>

      <div className="match-row__team match-row__team--away">
        {match.awayTeam.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="match-row__crest" src={match.awayTeam.logo} alt="" />
        )}
        <span className="match-row__name">{match.awayTeam.name}</span>
      </div>
    </Link>
  );
}
