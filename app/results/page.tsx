import { getHighlights, type Highlight } from "@/lib/highlightly";

export const revalidate = 300;

function formatDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

export default async function ResultsPage() {
  let highlights: Highlight[] = [];
  let errorMessage: string | null = null;

  try {
    highlights = await getHighlights();
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Failed to load highlights.";
  }

  return (
    <div className="page wrap">
      <div className="page__heading">
        <h1>Results &amp; highlights</h1>
      </div>

      {errorMessage && (
        <div className="empty-state">
          <strong>Couldn't load highlights</strong>
          {errorMessage}
        </div>
      )}

      {!errorMessage && highlights.length === 0 && (
        <div className="empty-state">
          <strong>No highlights yet</strong>
          Highlights appear here shortly after each match finishes.
        </div>
      )}

      {highlights.map((h) => (
        <article className="result-card" key={h.id}>
          <div className="result-card__meta">
            <div className="result-card__teams">{h.title}</div>
            <div className="result-card__date">{formatDate(h.date)}</div>
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
    </div>
  );
}
