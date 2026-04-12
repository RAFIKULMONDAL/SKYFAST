import { useState, useEffect } from 'react';

const STORAGE_KEY = 'skycast_favourites';
const RECENT_KEY  = 'skycast_recent';

export function useFavourites() {
  const [favourites, setFavourites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });

  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
  }, [favourites]);

  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  }, [recent]);

  const addFavourite = (loc) => {
    setFavourites((prev) => {
      if (prev.find((f) => f.name === loc.name)) return prev;
      return [...prev, loc].slice(0, 8);
    });
  };

  const removeFavourite = (name) => {
    setFavourites((prev) => prev.filter((f) => f.name !== name));
  };

  const isFavourite = (name) => favourites.some((f) => f.name === name);

  const addRecent = (loc) => {
    setRecent((prev) => {
      const filtered = prev.filter((r) => r.name !== loc.name);
      return [loc, ...filtered].slice(0, 5);
    });
  };

  return { favourites, recent, addFavourite, removeFavourite, isFavourite, addRecent };
}

export default function FavouriteCities({ dark, favourites, recent, isFavourite, currentLocation, onSelect, onRemove }) {
  const [showRecent, setShowRecent] = useState(false);

  const card  = dark ? 'bg-ink-800 border-ink-600' : 'bg-white border-gray-200';
  const card2 = dark ? 'bg-ink-700 hover:bg-ink-600' : 'bg-gray-100 hover:bg-gray-200';
  const txt2  = dark ? 'text-ink-300' : 'text-gray-600';
  const txt3  = dark ? 'text-ink-400' : 'text-gray-400';

  if (favourites.length === 0 && recent.length === 0) return null;

  return (
    <div className={`rounded-2xl p-4 border shadow-card ${card}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setShowRecent(false)}
            className={`text-[10px] uppercase tracking-widest font-semibold transition-colors
              ${!showRecent ? 'text-amber-500' : txt3}`}
          >
            ⭐ Favourites
          </button>
          {recent.length > 0 && (
            <button
              onClick={() => setShowRecent(true)}
              className={`text-[10px] uppercase tracking-widest font-semibold transition-colors
                ${showRecent ? 'text-amber-500' : txt3}`}
            >
              · 🕐 Recent
            </button>
          )}
        </div>
        <span className={`text-[10px] ${txt3}`}>
          {showRecent ? recent.length : favourites.length} cities
        </span>
      </div>

      {/* Cities list */}
      <div className="flex gap-2 flex-wrap">
        {(showRecent ? recent : favourites).map((loc) => (
          <div key={loc.name} className="relative group">
            <button
              onClick={() => onSelect(loc.lat, loc.lon, loc.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${currentLocation === loc.name
                  ? 'bg-amber-500 text-black'
                  : `${card2} ${txt2}`
                }`}
            >
              <span>{loc.name.split(',')[0]}</span>
            </button>
            {/* Remove button (favourites only) */}
            {!showRecent && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(loc.name); }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] items-center justify-center hidden group-hover:flex"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {!showRecent && favourites.length === 0 && (
          <p className={`text-xs ${txt3}`}>
            Click ⭐ on any city to save it here.
          </p>
        )}
      </div>
    </div>
  );
}
