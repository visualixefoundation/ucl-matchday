import { getStandings, sortStandings, type StandingRow } from "@/lib/highlightly";

export const revalidate = 3600;

function gd(row: StandingRow) {
  return row.total.scoredGoals - row.total.receivedGoals;
}

export default async function StandingsPage() {
  let errorMessage: string | null = null;
  let groups: { name: string; standings: StandingRow[] }[] = [];
  let leagueName = "Champions League";

  try {
    const data = await getStandings();
    if (data) {
      leagueName = data.league?.name ?? leagueName;
      groups = (data.groups ?? []).map((g) => ({
        name: g.name,
        standings: sortStandings(g.standings ?? [])
      }));
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Failed to load standings.";
  }

  return (
    <div className="page wrap">
      <div className="page__heading">
        <h1>Standings</h1>
      </div>

      {errorMessage && (
        <div className="empty-state">
          <strong>Couldn&apos;t load standings</strong>
          {errorMessage}
        </div>
      )}

      {!errorMessage && groups.length === 0 && (
        <div className="empty-state">
          <strong>No standings yet</strong>
          Table data appears once the league phase is underway.
        </div>
      )}

      {groups.map((group) => (
        <section className="matchday" key={group.name}>
          <div className="matchday__label">{group.name || leagueName}</div>
          <div className="standings-scroll">
            <table className="standings-table">
              <thead>
                <tr>
                  <th className="standings-table__pos">#</th>
                  <th style={{ textAlign: "left" }}>Team</th>
                  <th>P</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>GD</th>
                  <th className="standings-table__pts">Pts</th>
                </tr>
              </thead>
              <tbody>
                {group.standings.map((row) => (
                  <tr key={row.team.id}>
                    <td className="standings-table__pos">{row.position}</td>
                    <td>
                      <a
                        href={`/team/${row.team.id}`}
                        className="standings-table__team-link"
                      >
                        {row.team.logo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.team.logo}
                            alt=""
                            width={20}
                            height={20}
                            style={{ objectFit: "contain" }}
                          />
                        )}
                        <span className="standings-table__team">{row.team.name}</span>
                      </a>
                    </td>
                    <td>{row.total.games}</td>
                    <td>{row.total.wins}</td>
                    <td>{row.total.draws}</td>
                    <td>{row.total.loses}</td>
                    <td>{gd(row)}</td>
                    <td className="standings-table__pts">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
