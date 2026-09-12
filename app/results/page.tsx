import {
  getMatchesWindow,
  getHighlights,
  isFinished,
  type Match,
  type Highlight
} from "@/lib/highlightly";
import { dayKeyEAT, formatDayLabelEAT } from "@/lib/time";
import MatchRow from "@/app/components/MatchRow";

export const revalidate = 300;

function formatHighlightDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "Africa/Nairobi"
  });
}

export default async function ResultsPage() {
  const today = new Date().toISOString().slice(0, 10);
  let finished: Match[] = [];
  let highlights: Highlight[] = [];
  let errorMessage: string | null = null;

  try {
    // Overlaps home window so Next.js data cache can reuse those day fetches
    const [window, hl] = await Promise.all([
      getMatchesWindow(today, 1, 3), // past 3 days + today = 4 calls max
      getHighlights().catch(() => [] as Highlight[])
    ]);
    finished = window
      .filter((m) => isFinished(m.state.description))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    highlights = hl;
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Failed to load results.";
  }

  const byDay = finished.reduce<Record<string, Match[]>>((acc, m) => {
    const key = dayKeyEAT(m.date);
    acc[key] = acc[key] ?? [];
    acc[key].push(m);
    return acc;
  }, {});
  const dayKeys = Object.keys(byDay).sort().reverse();

  return (
    <div className="page wrap">
      <div className="page__heading">
        <h1>Results &amp; highlights</h1>
      </div>

      {errorMessage && (
        <div className="empty-state">
          <strong>Couldn&apos;t load results</strong>
          {errorMessage}
        </div>
      )}

      {!errorMessage && finished.length === 0 && highlights.length === 0 && (
        <div className="empty-state">
          <strong>No recent results yet</strong>
          Full-time scores and highlights appear here after matchdays finish.
        </div>
      )}

      {dayKeys.length > 0 && (
        <section className="matchday" style={{ marginBottom: 48 }}>
          <div className="matchday__label">Full-time results</div>
          {dayKeys.map((day) => (
            <div key={day} style={{ marginBottom: 20 }}>
              <div className="matchday__sublabel">{formatDayLabelEAT(day)}</div>
              {byDay[day].map((match) => (
                <MatchRow key={match.id} match={match} />
              ))}
            </div>
          ))}
        </section>
      )}

      {highlights.length > 0 && (
        <section className="matchday">
          <div className="matchday__label">Highlights</div>
          {highlights.map((h) => (
            <article className="result-card" key={h.id}>
              <div className="result-card__meta">
                <div className="result-card__teams">{h.title}</div>
                <div className="result-card__date">{formatHighlightDate(h.date)}</div>
              </div>
              {h.embedUrl ? (
                <div className="result-card__video">
                  <iframe
                    src={h.embedUrl}
                    title={h.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a href={h.url} target="_blank" rel="noopener noreferrer">
                  Watch highlight →
                </a>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
