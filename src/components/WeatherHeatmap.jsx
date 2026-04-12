import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

async function fetchHistory(lat, lon) {
  const end   = new Date(); end.setDate(end.getDate() - 1);
  const start = new Date(); start.setDate(start.getDate() - 30);
  const fmt   = d => d.toISOString().split('T')[0];
  const url   = `https://archive-api.open-meteo.com/v1/archive`
    + `?latitude=${lat}&longitude=${lon}`
    + `&start_date=${fmt(start)}&end_date=${fmt(end)}`
    + `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code`
    + `&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('history failed');
  return res.json();
}

const DAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function tempColor(norm, dark) {
  // norm: 0 (coldest) → 1 (hottest)
  if (norm < 0.2) return dark ? '#1e3a5f' : '#bfdbfe';
  if (norm < 0.4) return dark ? '#1e4d8c' : '#60a5fa';
  if (norm < 0.6) return dark ? '#92400e' : '#fde68a';
  if (norm < 0.8) return dark ? '#b45309' : '#fbbf24';
  return dark ? '#d97706' : '#f97316';
}

export default function WeatherHeatmap({ location, unit, dark }) {
  const { t } = useTranslation();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [selected, setSelected] = useState(null); // click-to-show tooltip

  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const card2 = dark ? 'bg-ink-700' : 'bg-gray-100';
  const txt2  = dark ? 'text-ink-200' : 'text-gray-700';
  const txt3  = dark ? 'text-ink-400' : 'text-gray-400';

  useEffect(() => {
    if (!location) return;
    setLoading(true); setError(null); setSelected(null);
    fetchHistory(location.lat, location.lon)
      .then(setData)
      .catch(() => setError('Failed to load history'))
      .finally(() => setLoading(false));
  }, [location?.lat, location?.lon]);

  if (loading) return (
    <div className={`rounded-2xl p-5 shadow-card ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-4">
        🗓 {t('heatmapTitle')}
      </div>
      <div className="flex gap-2 flex-col">
        {[...Array(5)].map((_,i) => (
          <div key={i} className="flex gap-1.5">
            {[...Array(7)].map((_,j) => (
              <div key={j} className={`h-9 flex-1 rounded-lg animate-pulse ${card2}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  if (error || !data?.daily) return (
    <div className={`rounded-2xl p-5 shadow-card ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-2">
        🗓 {t('heatmapTitle')}
      </div>
      <p className={`text-xs ${txt3}`}>Historical data unavailable for this location.</p>
    </div>
  );

  const days  = data.daily.time;
  const maxTs = data.daily.temperature_2m_max;
  const minTs = data.daily.temperature_2m_min;
  const precs = data.daily.precipitation_sum;

  const convert = v => unit === 'C' ? Math.round(v) : Math.round(v * 9/5 + 32);
  const allMax  = maxTs.map(convert);
  const gMin    = Math.min(...allMax);
  const gMax    = Math.max(...allMax);
  const norm    = v => gMax === gMin ? 0.5 : (v - gMin) / (gMax - gMin);

  // Build rows: one row per week, 7 cols (Sun–Sat)
  // Pad start to correct weekday
  const firstDow = new Date(days[0] + 'T12:00:00').getDay(); // use noon to avoid DST issues
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  days.forEach((d, i) => cells.push({
    date: d,
    max:  maxTs[i],
    min:  minTs[i],
    prec: precs[i] || 0,
    dow:  new Date(d + 'T12:00:00').getDay(),
  }));
  // Pad end to full week
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const handleCellClick = (cell) => {
    if (!cell) return;
    setSelected(prev => prev?.date === cell.date ? null : cell);
  };

  return (
    <div className={`rounded-2xl p-4 sm:p-5 shadow-card animate-slide ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-4">
        🗓 {t('heatmapTitle')}
      </div>

      {/* Selected cell info panel */}
      {selected ? (
        <div className={`mb-4 rounded-xl p-3 flex flex-wrap items-center gap-x-5 gap-y-1 ${card2}`}>
          <span className={`font-semibold text-sm text-amber-400`}>
            {new Date(selected.date + 'T12:00:00').toLocaleDateString('en', { weekday:'long', month:'short', day:'numeric' })}
          </span>
          <span className={`text-xs ${txt2}`}>
            🌡️ {convert(selected.max)}° / {convert(selected.min)}°{unit}
          </span>
          <span className={`text-xs ${txt2}`}>
            🌧 {Math.round((selected.prec || 0) * 10) / 10} mm
          </span>
          <button onClick={() => setSelected(null)}
            className={`ml-auto text-xs ${txt3} hover:text-amber-400`}>✕</button>
        </div>
      ) : (
        <p className={`text-[11px] mb-3 ${txt3}`}>Tap any cell to see details</p>
      )}

      {/* Day-of-week header */}
      <div className="grid mb-1" style={{ gridTemplateColumns: '32px repeat(7, 1fr)', gap: 4 }}>
        <div />
        {DAYS.map(d => (
          <div key={d} className={`text-center text-[10px] font-semibold ${txt3}`}>{d}</div>
        ))}
      </div>

      {/* Heatmap rows (one per week) */}
      <div className="flex flex-col gap-1">
        {weeks.map((week, wi) => {
          // Find a real cell for month label
          const firstReal = week.find(c => c);
          const showMonth = firstReal && new Date(firstReal.date + 'T12:00:00').getDate() <= 7;
          const monthLabel = showMonth
            ? MONTHS[new Date(firstReal.date + 'T12:00:00').getMonth()]
            : '';

          return (
            <div key={wi} className="grid items-center"
              style={{ gridTemplateColumns: '32px repeat(7, 1fr)', gap: 4 }}>
              {/* Month label */}
              <div className={`text-[9px] text-right pr-1 font-medium ${txt3}`}>{monthLabel}</div>

              {week.map((cell, di) => {
                const isSelected = selected?.date === cell?.date;
                const bg = cell ? tempColor(norm(convert(cell.max)), dark) : 'transparent';
                return (
                  <button
                    key={di}
                    onClick={() => handleCellClick(cell)}
                    disabled={!cell}
                    style={{
                      background: bg,
                      border: isSelected
                        ? '2px solid #f59e0b'
                        : cell ? `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` : 'none',
                      borderRadius: 6,
                      height: 34,
                      cursor: cell ? 'pointer' : 'default',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.1s, box-shadow 0.1s',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: isSelected ? '0 0 0 2px rgba(245,158,11,0.4)' : 'none',
                    }}
                    title={cell
                      ? `${new Date(cell.date+'T12:00:00').toDateString()}: ${convert(cell.max)}°/${convert(cell.min)}°`
                      : ''}
                  >
                    {/* Temperature label on larger screens */}
                    {cell && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)',
                        lineHeight: 1,
                        pointerEvents: 'none',
                      }}>
                        {convert(cell.max)}°
                      </span>
                    )}
                    {/* Rain dot */}
                    {cell && cell.prec > 3 && (
                      <span style={{
                        position: 'absolute', bottom: 3, right: 3,
                        width: 4, height: 4, borderRadius: '50%',
                        background: '#60a5fa',
                        pointerEvents: 'none',
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <span className={`text-[10px] ${txt3}`}>Cool</span>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map(n => (
          <div key={n} style={{ width: 18, height: 18, borderRadius: 4, background: tempColor(n, dark) }} />
        ))}
        <span className={`text-[10px] ${txt3}`}>Hot</span>
        <span className={`text-[10px] ml-2 ${txt3}`}>🔵 rain &gt;3mm</span>
      </div>
    </div>
  );
}
