import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

async function fetchPollen(lat, lon) {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality`
    + `?latitude=${lat}&longitude=${lon}`
    + `&current=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen`
    + `&hourly=grass_pollen,birch_pollen,alder_pollen,ragweed_pollen`
    + `&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Pollen fetch failed');
  return res.json();
}

const LEVEL = [
  { max: 0,    label: 'None',     color: 'text-gray-400',    bg: 'bg-gray-600',    bar: '#6b7280' },
  { max: 10,   label: 'Low',      color: 'text-green-400',   bg: 'bg-green-500',   bar: '#22c55e' },
  { max: 30,   label: 'Moderate', color: 'text-yellow-400',  bg: 'bg-yellow-400',  bar: '#facc15' },
  { max: 80,   label: 'High',     color: 'text-orange-400',  bg: 'bg-orange-400',  bar: '#fb923c' },
  { max: 9999, label: 'Very High',color: 'text-red-400',     bg: 'bg-red-500',     bar: '#ef4444' },
];
const level = v => LEVEL.find(l => v <= l.max) || LEVEL.at(-1);

const POLLENS = [
  { key: 'grass_pollen',   icon: '🌾', name: 'Grass',    allergen: 'Hay fever trigger' },
  { key: 'birch_pollen',   icon: '🌳', name: 'Birch',    allergen: 'Spring allergy' },
  { key: 'alder_pollen',   icon: '🌿', name: 'Alder',    allergen: 'Early spring' },
  { key: 'olive_pollen',   icon: '🫒', name: 'Olive',    allergen: 'Mediterranean' },
  { key: 'mugwort_pollen', icon: '🌱', name: 'Mugwort',  allergen: 'Late summer' },
  { key: 'ragweed_pollen', icon: '🌻', name: 'Ragweed',  allergen: 'Autumn trigger' },
];

export default function PollenIndex({ location, dark }) {
  const { t } = useTranslation();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const card2 = dark ? 'bg-ink-700' : 'bg-gray-100';
  const txt2  = dark ? 'text-ink-200' : 'text-gray-700';
  const txt3  = dark ? 'text-ink-400' : 'text-gray-400';

  useEffect(() => {
    if (!location) return;
    setLoading(true); setError(null);
    fetchPollen(location.lat, location.lon)
      .then(setData)
      .catch(() => setError('Pollen data unavailable for this location.'))
      .finally(() => setLoading(false));
  }, [location?.lat, location?.lon]);

  if (loading) return (
    <div className={`rounded-2xl p-5 shadow-card ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-4">{t('pollenTitle')}</div>
      <div className="flex items-center gap-2 text-sm text-amber-400">
        <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        Loading pollen data…
      </div>
    </div>
  );

  if (error || !data?.current) return (
    <div className={`rounded-2xl p-5 shadow-card ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-2">{t('pollenTitle')}</div>
      <p className={`text-xs ${txt3}`}>{error || 'Pollen data unavailable for this location.'}</p>
      <p className={`text-xs mt-1 ${txt3}`}>Pollen monitoring is available in Europe and North America.</p>
    </div>
  );

  const cur = data.current;

  // Overall risk = max of all values
  const values = POLLENS.map(p => cur[p.key] ?? 0);
  const maxVal = Math.max(...values);
  const overall = level(maxVal);

  // 24h trend for grass (most common)
  const now = new Date();
  const grassTrend = [];
  if (data.hourly?.grass_pollen) {
    for (let i = 0; i < data.hourly.time.length && grassTrend.length < 12; i++) {
      if (new Date(data.hourly.time[i]) >= new Date(now.getTime() - 3600000)) {
        grassTrend.push({ time: data.hourly.time[i], val: data.hourly.grass_pollen[i] ?? 0 });
      }
    }
  }
  const maxTrend = Math.max(...grassTrend.map(g => g.val), 1);

  return (
    <div className={`rounded-2xl p-4 sm:p-5 shadow-card animate-slide ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-4">
        🌿 {t('pollenTitle')}
      </div>

      {/* Overall risk */}
      <div className={`rounded-xl p-4 mb-4 flex items-center gap-4 ${card2}`}>
        <div className={`w-14 h-14 rounded-full border-4 flex flex-col items-center justify-center shrink-0
          ${overall.color.replace('text-','border-')}`}>
          <span className="text-xl">🌿</span>
        </div>
        <div>
          <div className={`font-display text-xl tracking-wide ${overall.color}`}>
            {overall.label} Overall Risk
          </div>
          <div className={`text-xs mt-1 ${txt3}`}>
            {maxVal === 0
              ? 'No significant pollen detected today.'
              : `Peak: ${Math.round(maxVal)} grains/m³ — ${overall.label} allergy risk`}
          </div>
        </div>
      </div>

      {/* Individual pollens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {POLLENS.map(p => {
          const val = cur[p.key] ?? 0;
          const lv  = level(val);
          const pct = Math.min((val / 80) * 100, 100);
          return (
            <div key={p.key} className={`rounded-xl p-3 ${card2}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{p.icon}</span>
                  <div>
                    <div className={`text-xs font-semibold ${txt2}`}>{p.name}</div>
                    <div className={`text-[9px] ${txt3}`}>{p.allergen}</div>
                  </div>
                </div>
                <span className={`text-xs font-bold ${lv.color}`}>{lv.label}</span>
              </div>
              {/* Bar */}
              <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-ink-600' : 'bg-gray-200'}`}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: lv.bar }}
                />
              </div>
              <div className={`text-[9px] mt-1 ${txt3}`}>
                {val > 0 ? `${Math.round(val)} grains/m³` : 'Not detected'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grass pollen 12h trend */}
      {grassTrend.length > 0 && (
        <div>
          <div className={`text-[10px] uppercase tracking-widest font-semibold ${txt3} mb-2`}>
            🌾 Grass Pollen — Next 12h
          </div>
          <div className="flex items-end gap-1 h-12">
            {grassTrend.map((g, i) => {
              const pct = maxTrend > 0 ? (g.val / maxTrend) * 100 : 0;
              const lv  = level(g.val);
              const h   = new Date(g.time).getHours();
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full flex items-end justify-center" style={{ height: 36 }}>
                    <div
                      className="w-full rounded-sm"
                      style={{ height: `${Math.max(pct, 4)}%`, background: lv.bar, opacity: 0.85 }}
                    />
                  </div>
                  <span className={`text-[8px] ${txt3}`}>
                    {h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h-12}p`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      {maxVal > 30 && (
        <div className={`mt-3 rounded-xl p-3 ${card2} text-xs ${txt2}`}>
          <span className="font-semibold text-amber-400">💊 Allergy Tips: </span>
          {maxVal > 80
            ? 'Very high pollen — stay indoors, keep windows closed, take antihistamines.'
            : 'Moderate-high pollen — wear sunglasses outdoors, shower after being outside.'}
        </div>
      )}
    </div>
  );
}
