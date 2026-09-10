import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeam, getLastFive, parseScore, isFinished } from "@/lib/highlightly";
import MatchRow from "@/app/components/MatchRow";

export const revalidate = 300;

export default async function TeamPage({
  params
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const [team, form] = await Promise.all([getTeam(id), getLastFive(id)]);
  if (!team) notFound();

  const finished = form.filter((m) => isFinished(m.state.description));

  return (
    <div className="page wrap">
      <div className="page__heading">
        <h1 className="team-page__title">
          {team.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team.logo} alt="" className="team-page__crest" />
          )}
          {team.name}
        </h1>
        <Link href="/standings" className="back-link">
          ← Standings
        </Link>
      </div>

      <section className="matchday">
        <div className="matchday__label">Recent form</div>
        {finished.length === 0 && (
          <div className="empty-state">
            <strong>No recent results</strong>
            Form data appears once matches are finished.
          </div>
        )}
        {finished.map((m) => {
          const score = parseScore(m.state.score.current);
          const isHome = m.homeTeam.id === id;
          const gf = score ? (isHome ? score[0] : score[1]) : null;
          const ga = score ? (isHome ? score[1] : score[0]) : null;
          let result: "W" | "D" | "L" | null = null;
          if (gf != null && ga != null) {
            if (gf > ga) result = "W";
            else if (gf < ga) result = "L";
            else result = "D";
          }
          return (
            <div key={m.id} className="form-row">
              {result && (
                <span className={`form-badge form-badge--${result.toLowerCase()}`}>{result}</span>
              )}
              <div className="form-row__match">
                <MatchRow match={m} />
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
