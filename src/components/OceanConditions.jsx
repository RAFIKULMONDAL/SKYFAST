import { useEffect, useState } from 'react';

async function fetchMarine(lat, lon) {
  const url = `https://marine-api.open-meteo.com/v1/marine`
    + `?latitude=${lat}&longitude=${lon}`
    + `&current=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,swell_wave_direction,swell_wave_period,ocean_current_velocity,ocean_current_direction`
    + `&hourly=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,sea_surface_temperature`
    + `&daily=wave_height_max,wave_direction_dominant,wind_wave_height_max,swell_wave_height_max`
    + `&timezone=auto&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Marine data unavailable');
  return res.json();
}

const compassDir = (deg) => {
  if (deg == null) return '--';
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
};

const waveLevel = (h) => {
  if (h == null) return { label: '--',        color: 'text-gray-400'   };
  if (h < 0.3)   return { label: 'Calm',      color: 'text-green-400'  };
  if (h < 0.9)   return { label: 'Smooth',    color: 'text-emerald-400'};
  if (h < 1.5)   return { label: 'Moderate',  color: 'text-yellow-400' };
  if (h < 2.5)   return { label: 'Rough',     color: 'text-orange-400' };
  if (h < 4.0)   return { label: 'Very Rough',color: 'text-red-400'    };
  return               { label: 'High Seas',  color: 'text-purple-400' };
};

const seaTempColor = (t) => {
  if (t == null) return 'text-gray-400';
  if (t < 15)   return 'text-blue-400';
  if (t < 22)   return 'text-cyan-400';
  if (t < 27)   return 'text-green-400';
  if (t < 30)   return 'text-yellow-400';
  return 'text-orange-400';
};

const fmt1 = (v) => (v != null ? `${parseFloat(v).toFixed(1)}m` : '--');
const fmts = (v) => (v != null ? `${Math.round(v)}s` : '--');

export default function OceanConditions({ location, unit, dark }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const card2 = dark ? 'bg-ink-700' : 'bg-gray-100';
  const txt2  = dark ? 'text-ink-200' : 'text-gray-700';
  const txt3  = dark ? 'text-ink-400' : 'text-gray-400';

  useEffect(() => {
    if (!location) return;
    setLoading(true);
    setError(null);
    fetchMarine(location.lat, location.lon)
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [location?.lat, location?.lon]);

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className={`rounded-2xl p-5 shadow-card ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-4">
        🌊 Ocean &amp; Beach
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`h-16 rounded-xl animate-pulse ${card2}`} />
        ))}
      </div>
    </div>
  );

  /* ── Not available / inland location ── */
  if (error || !data?.current) return (
    <div className={`rounded-2xl p-5 shadow-card ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-3">
        🌊 Ocean &amp; Beach
      </div>
      <div className={`rounded-xl p-4 ${card2}`}>
        <p className={`text-sm font-medium mb-1 ${txt2}`}>No marine data for this location</p>
        <p className={`text-xs ${txt3}`}>
          Ocean &amp; beach conditions are only available for coastal and ocean areas.
          Try searching for a coastal city like Mumbai, Chennai, Goa, Miami, or Sydney.
        </p>
      </div>
    </div>
  );

  /* ── Data available ── */
  const cur = data.current;
  const wh  = cur.wave_height    != null ? cur.wave_height    : null;
  const swh = cur.swell_wave_height != null ? cur.swell_wave_height : null;
  const wp  = cur.wave_period    != null ? cur.wave_period    : null;
  const wl  = waveLevel(wh);

  // Sea surface temp — first hourly value
  const sst = data.hourly?.sea_surface_temperature?.[0] ?? null;
  const convertTemp = (v) => {
    if (v == null) return '--';
    return unit === 'C' ? `${Math.round(v)}°C` : `${Math.round(v * 9 / 5 + 32)}°F`;
  };

  // Surf score 0–10
  let surf = null;
  if (wh != null) {
    let score = 0;
    if (wh >= 0.5 && wh <= 2.5) score += 5;
    if (wp != null && wp >= 8)  score += 3;
    if (swh != null && swh > 0.3) score += 2;
    surf = Math.min(10, score);
  }

  // Build stats array — only include rows with real data
  const stats = [
    {
      icon: '🌊', label: 'Wave Height',
      val: fmt1(wh),
      extra: wl.label, extraColor: wl.color,
    },
    {
      icon: '🌀', label: 'Wave Period',
      val: fmts(wp),
    },
    {
      icon: '🧭', label: 'Wave Dir',
      val: compassDir(cur.wave_direction),
    },
    {
      icon: '🏄', label: 'Swell Height',
      val: fmt1(swh),
    },
    {
      icon: '🔄', label: 'Swell Dir',
      val: compassDir(cur.swell_wave_direction),
    },
    {
      icon: '🌡️', label: 'Sea Temp',
      val: convertTemp(sst),
      extraColor: seaTempColor(sst),
    },
    {
      icon: '💨', label: 'Wind Waves',
      val: fmt1(cur.wind_wave_height != null ? cur.wind_wave_height : null),
    },
    {
      icon: '🌀', label: 'Current',
      val: cur.ocean_current_velocity != null
        ? `${parseFloat(cur.ocean_current_velocity).toFixed(2)} m/s`
        : '--',
    },
  ].filter(s => s.val !== '--'); // hide unavailable stats

  const daily = data.daily;

  return (
    <div className={`rounded-2xl p-4 sm:p-5 shadow-card animate-slide ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-4">
        🌊 Ocean &amp; Beach Conditions
      </div>

      {/* Surf score gauge */}
      {surf !== null && (
        <div className={`rounded-xl p-3 sm:p-4 mb-4 flex items-center gap-3 sm:gap-4 ${card2}`}>
          {/* Circle */}
          <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
            <svg viewBox="0 0 60 60" style={{ width: 64, height: 64, transform: 'rotate(-90deg)' }}>
              <circle cx="30" cy="30" r="24"
                fill="none"
                stroke={dark ? '#2a2a2a' : '#e5e7eb'}
                strokeWidth="6" />
              <circle cx="30" cy="30" r="24"
                fill="none"
                stroke={surf >= 7 ? '#22c55e' : surf >= 4 ? '#f59e0b' : '#60a5fa'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={String(2 * Math.PI * 24)}
                strokeDashoffset={String(2 * Math.PI * 24 * (1 - surf / 10))} />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="font-display text-xl leading-none text-amber-400">{surf}</span>
              <span className={`text-[9px] ${txt3}`}>/10</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="font-display text-base sm:text-lg tracking-wide text-amber-400">
              {surf >= 7 ? '🏄 Great Surf'
               : surf >= 4 ? '🌊 Decent Surf'
               : surf >= 2 ? '🏊 Calm Beach'
               : '😴 Flat Sea'}
            </div>
            <div className={`text-xs mt-1 leading-relaxed ${txt3}`}>
              {surf >= 7 ? 'Excellent conditions for surfing and water sports.'
               : surf >= 4 ? 'Good for intermediate surfers. Pleasant beach day.'
               : surf >= 2 ? 'Calm and safe for swimming. Great for families.'
               : 'Very flat — ideal for paddleboarding and snorkelling.'}
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-xl p-3 ${card2}`}>
              <div className={`text-[10px] uppercase tracking-widest font-semibold mb-1 ${txt3}`}>
                {s.icon} {s.label}
              </div>
              <div className={`font-semibold text-sm truncate ${s.extraColor || txt2}`}>
                {s.val}
              </div>
              {s.extra && (
                <div className={`text-[10px] mt-0.5 ${s.extraColor}`}>{s.extra}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 7-day wave forecast */}
      {daily?.time && daily.wave_height_max && (
        <div>
          <div className={`text-[10px] uppercase tracking-widest font-semibold mb-2 ${txt3}`}>
            7-Day Wave Forecast
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {daily.time.slice(0, 7).map((d, i) => {
              const wmax = daily.wave_height_max[i] != null ? daily.wave_height_max[i] : null;
              const lv   = waveLevel(wmax);
              const dayDate = new Date(d + 'T12:00:00');
              const label   = i === 0
                ? 'Today'
                : dayDate.toLocaleDateString('en', { weekday: 'short' });
              return (
                <div key={d} className={`flex-shrink-0 rounded-xl p-2.5 text-center w-[64px] ${card2}`}>
                  <div className={`text-[10px] mb-1 ${txt3}`}>{label}</div>
                  <div className="text-xl mb-1">🌊</div>
                  <div className={`text-xs font-bold ${lv.color}`}>
                    {wmax != null ? `${parseFloat(wmax).toFixed(1)}m` : '--'}
                  </div>
                  <div className={`text-[9px] mt-0.5 ${lv.color}`}>{lv.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
