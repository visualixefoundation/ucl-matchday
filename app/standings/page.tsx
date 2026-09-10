import { getStandings, type StandingRow } from "@/lib/highlightly";

export const revalidate = 3600; // standings only change ~hourly after matches finish

export default async function StandingsPage() {
  let standings: Awaited<ReturnType<typeof getStandings>> = null;
  let errorMessage: string | null = null;

  try {
    standings = await getStandings();
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
          <strong>Couldn't load standings</strong>
          {errorMessage}
        </div>
      )}

      {!errorMessage && (!standings || standings.groups.length === 0) && (
        <div className="empty-state">
          <strong>No standings yet</strong>
          The table populates once matches in the league phase are finished.
        </div>
      )}

      {standings?.groups.map((group) => (
        <section className="matchday" key={group.name}>
          <div className="matchday__label">{group.name}</div>
          <table className="standings-table">
            <thead>
              <tr>
                <th className="standings-table__pos">#</th>
                <th className="standings-table__team">Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {group.standings
                .sort((a, b) => a.position - b.position)
                .map((row: StandingRow) => {
                  const gd = row.total.scoredGoals - row.total.receivedGoals;
                  return (
                    <tr key={row.team.id}>
                      <td className="standings-table__pos">{row.position}</td>
                      <td className="standings-table__team">
                        {row.team.logo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="match-row__crest" src={row.team.logo} alt="" />
                        )}
                        {row.team.name}
                      </td>
                      <td>{row.total.games}</td>
                      <td>{row.total.wins}</td>
                      <td>{row.total.draws}</td>
                      <td>{row.total.loses}</td>
                      <td>{row.total.scoredGoals}</td>
                      <td>{row.total.receivedGoals}</td>
                      <td>{gd > 0 ? `+${gd}` : gd}</td>
                      <td className="standings-table__pts">{row.points}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
