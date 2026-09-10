export function MatchRowSkeleton() {
  return (
    <div className="match-row match-row--skeleton" aria-hidden>
      <div className="skeleton skeleton--sm" />
      <div className="skeleton skeleton--md" />
      <div className="skeleton skeleton--score" />
      <div className="skeleton skeleton--md" />
    </div>
  );
}

export function PageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="page wrap" aria-busy="true" aria-label="Loading">
      <div className="page__heading">
        <div className="skeleton skeleton--title" />
      </div>
      <div className="matchday">
        <div className="skeleton skeleton--label" />
        {Array.from({ length: rows }, (_, i) => (
          <MatchRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function StandingsSkeleton() {
  return (
    <div className="page wrap" aria-busy="true" aria-label="Loading standings">
      <div className="page__heading">
        <div className="skeleton skeleton--title" />
      </div>
      <div className="matchday">
        <div className="skeleton skeleton--label" />
        <div className="skeleton-table">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton skeleton--row" />
          ))}
        </div>
      </div>
    </div>
  );
}
