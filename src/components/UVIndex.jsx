export default function UVIndex({ weather, dark }) {
  const daily  = weather.daily;
  const hourly = weather.hourly;
  const now    = new Date();

  // Current UV from hourly
  let currentUV = 0;
  for (let i = 0; i < hourly.time.length; i++) {
    if (new Date(hourly.time[i]) <= now) currentUV = hourly.uv_index?.[i] ?? 0;
  }
  currentUV = Math.round(currentUV * 10) / 10;

  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const card2 = dark ? 'bg-ink-700' : 'bg-gray-100';
  const txt2  = dark ? 'text-ink-200' : 'text-gray-700';
  const txt3  = dark ? 'text-ink-400' : 'text-gray-400';

  // UV level info
  const getUVInfo = (uv) => {
    if (uv <= 2)  return { label: 'Low',       color: 'text-green-400',   bar: 'bg-green-400',   pct: (uv/11)*100, skinType: 'All', mins: '60+' };
    if (uv <= 5)  return { label: 'Moderate',  color: 'text-yellow-400',  bar: 'bg-yellow-400',  pct: (uv/11)*100, skinType: 'Fair', mins: '30–60' };
    if (uv <= 7)  return { label: 'High',      color: 'text-orange-400',  bar: 'bg-orange-400',  pct: (uv/11)*100, skinType: 'Fair', mins: '15–30' };
    if (uv <= 10) return { label: 'Very High', color: 'text-red-400',     bar: 'bg-red-400',     pct: (uv/11)*100, skinType: 'All',  mins: '10–15' };
    return             { label: 'Extreme',    color: 'text-purple-400',  bar: 'bg-purple-400',  pct: 100,         skinType: 'All',  mins: '<10' };
  };

  const info = getUVInfo(currentUV);

  // Safe exposure time based on UV (Fitzpatrick skin type II approximation)
  const getSafeTime = (uv) => {
    if (uv === 0) return 'No UV risk';
    const mins = Math.round(200 / (uv * 3));
    if (mins >= 60) return `~${Math.round(mins / 60)}h without sunscreen`;
    return `~${mins} min without SPF 30`;
  };

  // Next 12 hours UV forecast
  const uvForecast = [];
  for (let i = 0; i < hourly.time.length && uvForecast.length < 12; i++) {
    const t = new Date(hourly.time[i]);
    if (t >= now) {
      uvForecast.push({ time: hourly.time[i], uv: hourly.uv_index?.[i] ?? 0 });
    }
  }
  const maxUV = Math.max(...uvForecast.map(u => u.uv), 1);

  return (
    <div className={`rounded-2xl p-5 shadow-card animate-slide ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-4">
        ☀️ UV Index
      </div>

      {/* Current UV big display */}
      <div className="flex items-center gap-5 mb-5">
        <div className="relative w-20 h-20 shrink-0">
          {/* Circle progress */}
          <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke={dark ? '#2a2a2a' : '#f3f4f6'} strokeWidth="8" />
            <circle cx="40" cy="40" r="34" fill="none"
              strokeWidth="8" strokeLinecap="round"
              stroke="url(#uvGrad)"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - Math.min(currentUV, 11) / 11)}`}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <defs>
              <linearGradient id="uvGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#4ade80" />
                <stop offset="40%"  stopColor="#fbbf24" />
                <stop offset="70%"  stopColor="#f97316" />
                <stop offset="100%" stopColor="#c026d3" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-display text-2xl leading-none ${info.color}`}>{currentUV}</span>
            <span className={`text-[9px] uppercase tracking-wide ${txt3}`}>UV</span>
          </div>
        </div>

        <div className="flex-1">
          <div className={`font-display text-xl tracking-wide ${info.color}`}>{info.label}</div>
          <div className={`text-xs mt-1 ${txt2}`}>{getSafeTime(currentUV)}</div>
          <div className={`text-xs mt-2 ${txt3}`}>Wear SPF 30+ if UV ≥ 3</div>
        </div>
      </div>

      {/* Tips */}
      <div className={`rounded-xl p-3 mb-4 ${card2}`}>
        <div className={`text-[10px] uppercase tracking-widest ${txt3} mb-2`}>Protection Tips</div>
        <div className="grid grid-cols-2 gap-1.5">
          {currentUV <= 2 && <><span className={`text-xs ${txt2}`}>✅ No protection needed</span><span className={`text-xs ${txt2}`}>✅ Safe to be outside</span></>}
          {currentUV > 2  && <><span className={`text-xs ${txt2}`}>🕶️ Wear sunglasses</span><span className={`text-xs ${txt2}`}>🧴 Apply SPF 30+</span></>}
          {currentUV > 5  && <><span className={`text-xs ${txt2}`}>👒 Wear a hat</span><span className={`text-xs ${txt2}`}>🌑 Seek shade 10AM–4PM</span></>}
          {currentUV > 7  && <><span className={`text-xs ${txt2}`}>👕 Cover exposed skin</span><span className={`text-xs ${txt2}`}>🏠 Limit time outside</span></>}
          {currentUV > 10 && <><span className={`text-xs ${txt2}`}>⚠️ Avoid going outside</span><span className={`text-xs ${txt2}`}>🧴 Re-apply SPF every 2h</span></>}
        </div>
      </div>

      {/* UV hourly bar chart */}
      {uvForecast.length > 0 && (
        <div>
          <div className={`text-[10px] uppercase tracking-widest ${txt3} mb-2`}>Next 12 Hours</div>
          <div className="flex items-end gap-1.5 h-16">
            {uvForecast.map((u, i) => {
              const h = new Date(u.time).getHours();
              const pct = maxUV > 0 ? (u.uv / maxUV) * 100 : 0;
              const lv = getUVInfo(u.uv);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center" style={{ height: 48 }}>
                    <div
                      className={`w-full rounded-sm transition-all ${lv.bar} opacity-80`}
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                  <span className={`text-[9px] ${txt3}`}>
                    {h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h-12}p`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
