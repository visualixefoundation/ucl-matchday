import Link from "next/link";
import { isLive, parseScore, type Match } from "@/lib/highlightly";

function formatKickoff(dateIso: string) {
  return new Date(dateIso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusLabel(match: Match) {
  const { description, clock } = match.state;
  if (isLive(description)) {
    if (description.toLowerCase() === "half time") return "HT";
    return clock != null ? `${clock}'` : description;
  }
  if (
    description.toLowerCase().includes("finished") ||
    description.toLowerCase() === "awarded"
  ) {
    return "FT";
  }
  return formatKickoff(match.date);
}

export default function MatchRow({ match }: { match: Match }) {
  const score = parseScore(match.state.score.current);
  const live = isLive(match.state.description);

  return (
    <Link href={`/match/${match.id}`} className="match-row match-row--link">
      <div className={`match-row__status ${live ? "match-row__status--live" : ""}`}>
        {statusLabel(match)}
      </div>
      <div className="match-row__team">
        {match.homeTeam.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="match-row__crest" src={match.homeTeam.logo} alt="" />
        )}
        <span>{match.homeTeam.name}</span>
      </div>
      <div className={`match-row__score ${score == null ? "match-row__score--pending" : ""}`}>
        {score ? `${score[0]} – ${score[1]}` : "vs"}
      </div>
      <div className="match-row__team match-row__team--away">
        {match.awayTeam.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="match-row__crest" src={match.awayTeam.logo} alt="" />
        )}
        <span>{match.awayTeam.name}</span>
      </div>
    </Link>
  );
}
