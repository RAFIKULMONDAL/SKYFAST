export function SkeletonCard({ dark, rows = 4, cols = 2 }) {
  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const pulse = dark ? 'bg-ink-700' : 'bg-gray-200';

  return (
    <div className={`rounded-2xl p-5 shadow-card ${card} animate-pulse`}>
      {/* Title bar */}
      <div className={`h-2.5 w-28 rounded-full mb-5 ${pulse}`} />
      {/* Grid of boxes */}
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {[...Array(rows * cols)].map((_, i) => (
          <div key={i} className={`rounded-xl p-3 ${pulse}`}>
            <div className={`h-2 w-16 rounded-full mb-2 ${dark ? 'bg-ink-600' : 'bg-gray-300'}`} />
            <div className={`h-4 w-10 rounded-full ${dark ? 'bg-ink-600' : 'bg-gray-300'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCurrentWeather({ dark }) {
  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const pulse = dark ? 'bg-ink-700 animate-pulse' : 'bg-gray-200 animate-pulse';

  return (
    <div className={`rounded-2xl p-6 shadow-card ${card}`}>
      {/* Location */}
      <div className={`h-3 w-24 rounded-full mb-2 ${pulse}`} />
      <div className={`h-2.5 w-40 rounded-full mb-6 ${pulse}`} />
      {/* Big temp */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-16 h-16 rounded-full ${pulse}`} />
        <div>
          <div className={`h-12 w-28 rounded-xl mb-2 ${pulse}`} />
          <div className={`h-2.5 w-24 rounded-full mb-1 ${pulse}`} />
          <div className={`h-2 w-20 rounded-full ${pulse}`} />
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[...Array(6)].map((_,i) => (
          <div key={i} className={`rounded-xl p-3 ${dark?'bg-ink-700':'bg-gray-100'}`}>
            <div className={`h-2 w-14 rounded-full mb-2 ${pulse}`} />
            <div className={`h-3 w-12 rounded-full ${pulse}`} />
          </div>
        ))}
      </div>
      {/* Sun bar */}
      <div className={`h-14 rounded-xl ${dark?'bg-ink-700':'bg-gray-100'} ${dark?'animate-pulse':''}`} />
    </div>
  );
}

export function SkeletonHourly({ dark }) {
  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const pulse = dark ? 'bg-ink-700 animate-pulse' : 'bg-gray-200 animate-pulse';
  return (
    <div className={`rounded-2xl p-5 shadow-card ${card}`}>
      <div className={`h-2.5 w-28 rounded-full mb-4 ${pulse}`} />
      <div className="flex gap-2 overflow-hidden">
        {[...Array(8)].map((_,i) => (
          <div key={i} className={`flex-shrink-0 w-[70px] h-24 rounded-xl ${dark?'bg-ink-700':'bg-gray-100'} animate-pulse`} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart({ dark }) {
  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const pulse = dark ? 'bg-ink-700 animate-pulse' : 'bg-gray-200 animate-pulse';
  return (
    <div className={`rounded-2xl p-5 shadow-card ${card}`}>
      <div className={`h-2.5 w-36 rounded-full mb-4 ${pulse}`} />
      <div className={`h-40 w-full rounded-xl ${dark?'bg-ink-700':'bg-gray-100'} animate-pulse`} />
    </div>
  );
}
