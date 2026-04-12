import { useState, useEffect } from 'react';
import { formatAge } from '../hooks/useOfflineCache.js';

export default function OfflineBanner({ online, cacheTimestamp, onRetry, loading, dark }) {
  const [age, setAge] = useState(() => formatAge(cacheTimestamp));

  // Update age label every 30 seconds
  useEffect(() => {
    if (!cacheTimestamp) return;
    const id = setInterval(() => setAge(formatAge(cacheTimestamp)), 30000);
    return () => clearInterval(id);
  }, [cacheTimestamp]);

  // Update immediately when timestamp changes
  useEffect(() => {
    setAge(formatAge(cacheTimestamp));
  }, [cacheTimestamp]);

  if (!cacheTimestamp && online) return null;

  // Online + fresh data — show subtle "last updated" pill
  if (online && cacheTimestamp) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] mb-3 w-fit
        ${dark ? 'bg-ink-700 text-ink-400' : 'bg-gray-100 text-gray-400'}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
        Last updated {age}
      </div>
    );
  }

  // Offline — prominent warning banner
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-4 text-sm
      border border-orange-500/40 bg-orange-500/10 text-orange-400`}>
      <span className="text-lg shrink-0">📴</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-xs">You're offline</div>
        <div className="text-[11px] mt-0.5 opacity-80">
          Showing cached data from {age || 'earlier'}.
          Connect to internet for live weather.
        </div>
      </div>
      {!loading && (
        <button
          onClick={onRetry}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold
            bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 transition-colors"
        >
          Retry
        </button>
      )}
      {loading && (
        <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin shrink-0" />
      )}
    </div>
  );
}
