export function MatchRowSkeleton() {
  return (
    <div className="match-row match-row--skeleton" aria-hidden>
      <div className="match-row__team match-row__team--home">
        <div className="skeleton skeleton--md" />
        <div className="skeleton skeleton--sm" style={{ width: 28, height: 28, borderRadius: "50%" }} />
      </div>
      <div className="match-row__center">
        <div className="skeleton skeleton--score" />
      </div>
      <div className="match-row__team match-row__team--away">
        <div className="skeleton skeleton--sm" style={{ width: 28, height: 28, borderRadius: "50%" }} />
        <div className="skeleton skeleton--md" />
      </div>
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
