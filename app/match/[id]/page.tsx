import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getMatchById,
  isLive,
  isFinished,
  parseScore,
  type MatchEvent
} from "@/lib/highlightly";
import { formatKickoffDateTime } from "@/lib/time";

export const revalidate = 60;

function eventLabel(e: MatchEvent): string {
  const player =
    typeof e.player === "string" ? e.player : e.player?.name ?? "";
  const team = typeof e.team === "string" ? e.team : e.team?.name ?? "";
  const bits = [e.type, player, team, e.description].filter(Boolean);
  return bits.join(" · ") || "Event";
}

function eventTime(e: MatchEvent): string {
  if (e.time == null) return "";
  return typeof e.time === "number" ? `${e.time}'` : String(e.time);
}

export default async function MatchPage({
  params
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const match = await getMatchById(id);
  if (!match) notFound();

  const score = parseScore(match.state.score.current);
  const live = isLive(match.state.description);
  const finished = isFinished(match.state.description);
  const status = live
    ? match.state.clock != null
      ? `${match.state.clock}'`
      : match.state.description
    : finished
      ? "Full time"
      : formatKickoffDateTime(match.date);

  const events = match.events ?? [];

  return (
    <div className="page wrap">
      <div className="page__heading">
        <h1 className="match-detail__title">Match</h1>
        <Link href="/" className="back-link">
          ← Fixtures
        </Link>
      </div>

      <div className="match-detail">
        <div className={`match-detail__status ${live ? "match-detail__status--live" : ""}`}>
          {status}
          {match.round && <span className="match-detail__round">{match.round}</span>}
        </div>

        <div className="match-detail__scoreboard">
          <Link href={`/team/${match.homeTeam.id}`} className="match-detail__side">
            {match.homeTeam.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={match.homeTeam.logo} alt="" className="match-detail__crest" />
            )}
            <span className="match-detail__name">{match.homeTeam.name}</span>
          </Link>
          <div className="match-detail__score">
            {score ? (
              <>
                <span>{score[0]}</span>
                <span className="match-detail__sep">–</span>
                <span>{score[1]}</span>
              </>
            ) : (
              <span className="match-detail__vs">vs</span>
            )}
            {match.state.score.penalties && (
              <div className="match-detail__pens">Pens {match.state.score.penalties}</div>
            )}
          </div>
          <Link href={`/team/${match.awayTeam.id}`} className="match-detail__side match-detail__side--away">
            {match.awayTeam.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={match.awayTeam.logo} alt="" className="match-detail__crest" />
            )}
            <span className="match-detail__name">{match.awayTeam.name}</span>
          </Link>
        </div>

        {(match.venue?.name || match.referee?.name) && (
          <div className="match-detail__meta">
            {match.venue?.name && (
              <span>
                {match.venue.name}
                {match.venue.city ? `, ${match.venue.city}` : ""}
              </span>
            )}
            {match.referee?.name && <span>Ref: {match.referee.name}</span>}
          </div>
        )}

        {events.length > 0 && (
          <section className="match-detail__events">
            <h2 className="matchday__label">Events</h2>
            <ul className="event-list">
              {events.map((e, i) => (
                <li key={i} className="event-list__item">
                  <span className="event-list__time">{eventTime(e)}</span>
                  <span>{eventLabel(e)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
