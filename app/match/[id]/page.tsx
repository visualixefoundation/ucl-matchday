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

function eventTeamName(e: MatchEvent): string {
  if (typeof e.team === "string") return e.team;
  return e.team?.name ?? "";
}

function eventPlayerName(e: MatchEvent): string {
  if (typeof e.player === "string") return e.player;
  return e.player?.name ?? "";
}

function eventTime(e: MatchEvent): string {
  if (e.time == null) return "";
  return typeof e.time === "number" ? `${e.time}'` : String(e.time);
}

/** Strip accents/punctuation so "Bodø/Glimt" matches "Bodo/Glimt". */
function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function namesMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  // partial contains either way (handles "Bayern" vs "Bayern Munich")
  if (a.length >= 4 && b.length >= 4 && (a.includes(b) || b.includes(a))) return true;
  return false;
}

/** true = home (left), false = away (right), null = unknown */
function isHomeEvent(
  e: MatchEvent,
  homeName: string,
  awayName: string
): boolean | null {
  const team = eventTeamName(e);
  if (!team) return null;
  const t = normalizeName(team);
  const h = normalizeName(homeName);
  const a = normalizeName(awayName);
  if (namesMatch(t, h)) return true;
  if (namesMatch(t, a)) return false;
  return null;
}

function eventSummary(e: MatchEvent): string {
  const type = e.type?.trim() || e.description?.trim() || "Event";
  const player = eventPlayerName(e);
  return player ? `${type} · ${player}` : type;
}

function eventMinuteSortKey(e: MatchEvent): number {
  if (e.time == null) return 999;
  if (typeof e.time === "number") return e.time;
  const m = String(e.time).match(/(\d+)/);
  return m ? Number(m[1]) : 999;
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

  const events = [...(match.events ?? [])].sort(
    (a, b) => eventMinuteSortKey(a) - eventMinuteSortKey(b)
  );

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
            <div className="event-timeline__legend">
              <span className="event-timeline__legend-home">{match.homeTeam.name}</span>
              <span className="event-timeline__legend-mid">&apos;</span>
              <span className="event-timeline__legend-away">{match.awayTeam.name}</span>
            </div>
            <ul className="event-timeline">
              {events.map((e, i) => {
                const side = isHomeEvent(e, match.homeTeam.name, match.awayTeam.name);
                const sideClass =
                  side === true
                    ? "event-timeline__row--home"
                    : side === false
                      ? "event-timeline__row--away"
                      : "event-timeline__row--neutral";
                const summary = eventSummary(e);
                return (
                  <li key={i} className={`event-timeline__row ${sideClass}`}>
                    <div className="event-timeline__home">
                      {side === true && (
                        <span className="event-timeline__text">{summary}</span>
                      )}
                    </div>
                    <div className="event-timeline__minute">{eventTime(e)}</div>
                    <div className="event-timeline__away">
                      {side === false && (
                        <span className="event-timeline__text">{summary}</span>
                      )}
                      {side === null && (
                        <span className="event-timeline__text event-timeline__text--muted">
                          {summary}
                          {eventTeamName(e) ? ` · ${eventTeamName(e)}` : ""}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
