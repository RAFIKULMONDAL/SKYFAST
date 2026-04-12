import { useState, useRef, useEffect } from 'react';
import { geocodeSearch } from '../api/index.js';

const RECENT_KEY = 'skycast_recent_searches';

function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; }
  catch { return []; }
}
function saveRecent(list) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch {}
}

export default function SearchBar({ dark, onSelect }) {
  const [query,       setQuery]       = useState('');
  const [suggs,       setSuggs]       = useState([]);
  const [recent,      setRecent]      = useState(loadRecent);
  const [focused,     setFocused]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const debRef  = useRef(null);
  const wrapRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setSuggs([]); setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const inputCls = dark
    ? 'bg-ink-800 border-ink-600 text-ink-100 placeholder-ink-400 focus:border-amber-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-amber-500';

  const dropBg   = dark ? 'bg-ink-700 border-ink-600' : 'bg-white border-gray-200';
  const itemHov  = dark ? 'hover:bg-ink-600 text-ink-300 border-ink-600' : 'hover:bg-gray-50 text-gray-600 border-gray-100';

  const addToRecent = (name, lat, lon) => {
    const entry = { name, lat, lon };
    const updated = [entry, ...recent.filter(r => r.name !== name)].slice(0, 5);
    setRecent(updated);
    saveRecent(updated);
  };

  const handleChange = (v) => {
    setQuery(v);
    clearTimeout(debRef.current);
    if (v.length < 2) { setSuggs([]); return; }
    setLoading(true);
    debRef.current = setTimeout(async () => {
      const res = await geocodeSearch(v);
      setSuggs(res.slice(0, 5));
      setLoading(false);
    }, 400);
  };

  const handlePick = (name, lat, lon) => {
    setQuery(name);
    setSuggs([]);
    setFocused(false);
    addToRecent(name, lat, lon);
    onSelect(lat, lon, name);
  };

  const handleSuggPick = (s) => {
    const name = s.display_name.split(',').slice(0, 2).join(', ');
    handlePick(name, parseFloat(s.lat), parseFloat(s.lon));
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;
    const res = await geocodeSearch(query);
    if (res[0]) handleSuggPick(res[0]);
  };

  const removeRecent = (e, name) => {
    e.stopPropagation();
    const updated = recent.filter(r => r.name !== name);
    setRecent(updated);
    saveRecent(updated);
  };

  // Show recent when focused + empty query
  const showRecent = focused && query.length < 2 && recent.length > 0;
  const showSuggs  = suggs.length > 0;
  const showDrop   = showRecent || showSuggs;

  return (
    <div ref={wrapRef} className="flex-1 min-w-[180px] relative">
      <input
        className={`w-full rounded-full px-4 py-2.5 pr-12 text-sm border outline-none transition-all duration-200 ${inputCls}`}
        placeholder="Search city or place..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />

      {/* Search / Loading button */}
      <button
        onClick={handleSubmit}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center text-sm transition-colors"
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin block" />
        ) : '🔍'}
      </button>

      {/* Dropdown */}
      {showDrop && (
        <div className={`absolute top-full mt-1 left-0 right-0 rounded-xl border z-50 overflow-hidden shadow-xl ${dropBg}`}>

          {/* Recent searches header */}
          {showRecent && (
            <>
              <div className={`px-4 py-2 text-[10px] uppercase tracking-widest font-semibold flex items-center justify-between
                ${dark ? 'text-ink-500 border-b border-ink-600' : 'text-gray-400 border-b border-gray-100'}`}>
                <span>🕐 Recent Searches</span>
                <button
                  onClick={() => { setRecent([]); saveRecent([]); }}
                  className={`text-[10px] hover:text-red-400 transition-colors`}
                >
                  Clear all
                </button>
              </div>
              {recent.map((r, i) => (
                <div key={i}
                  onClick={() => handlePick(r.name, r.lat, r.lon)}
                  className={`flex items-center justify-between px-4 py-2.5 text-xs cursor-pointer border-b last:border-b-0 transition-colors ${itemHov}`}
                >
                  <span>🕐 {r.name}</span>
                  <button
                    onClick={(e) => removeRecent(e, r.name)}
                    className={`ml-2 text-[11px] hover:text-red-400 transition-colors ${dark ? 'text-ink-500' : 'text-gray-300'}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </>
          )}

          {/* Live suggestions */}
          {showSuggs && (
            <>
              {recent.length > 0 && showRecent && (
                <div className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-semibold
                  ${dark ? 'text-ink-500 border-t border-ink-600' : 'text-gray-400 border-t border-gray-100'}`}>
                  Results
                </div>
              )}
              {suggs.map((s, i) => (
                <div key={i}
                  onClick={() => handleSuggPick(s)}
                  className={`px-4 py-2.5 text-xs cursor-pointer border-b last:border-b-0 transition-colors ${itemHov}`}
                >
                  📍 {s.display_name.split(',').slice(0, 3).join(', ')}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
