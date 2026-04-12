import { getAqiLevel } from '../utils/weather.js';

export default function AQIChart({ airQuality, dark }) {
  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const card2 = dark ? 'bg-ink-700' : 'bg-gray-100';
  const txt3  = dark ? 'text-ink-400' : 'text-gray-400';

  if (!airQuality?.hourly) return null;

  const now  = new Date();
  const pts  = [];
  const hourly = airQuality.hourly;

  for (let i = 0; i < hourly.time.length && pts.length < 24; i++) {
    if (new Date(hourly.time[i]) >= new Date(now.getTime() - 3600000)) {
      pts.push({
        time: hourly.time[i],
        aqi:  hourly.european_aqi?.[i] ?? 0,
        pm10: hourly.pm10?.[i] ?? 0,
        pm25: hourly.pm2_5?.[i] ?? 0,
      });
    }
  }

  if (!pts.length) return null;

  const W = 600, H = 120, PAD_X = 36, PAD_Y = 16;
  const aqiVals = pts.map(p => p.aqi);
  const maxAQI  = Math.max(...aqiVals, 50);
  const minAQI  = 0;

  const x  = (i) => PAD_X + (i / (pts.length - 1)) * (W - PAD_X - 12);
  const y  = (v) => H - PAD_Y - ((v - minAQI) / (maxAQI - minAQI)) * (H - PAD_Y * 2);

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.aqi)}`).join(' ');
  const areaPath = linePath + ` L ${x(pts.length-1)} ${H-PAD_Y} L ${x(0)} ${H-PAD_Y} Z`;

  // Color zones
  const zones = [
    { max: 20,  color: '#34d399' },
    { max: 40,  color: '#86efac' },
    { max: 60,  color: '#fbbf24' },
    { max: 80,  color: '#f97316' },
    { max: 100, color: '#f87171' },
    { max: 999, color: '#c026d3' },
  ];
  const aqiColor = (v) => zones.find(z => v <= z.max)?.color || '#c026d3';

  const labelEvery = Math.ceil(pts.length / 6);
  const curAqi = pts[0]?.aqi ?? 0;
  const curLv  = getAqiLevel(curAqi);

  return (
    <div className={`rounded-2xl p-5 shadow-card animate-slide ${card}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500">
          🌬️ AQI Trend — 24 Hours
        </div>
        <div className={`flex items-center gap-2 text-xs ${curLv.color}`}>
          <span className={`w-2 h-2 rounded-full ${curLv.ring.replace('border-','bg-')}`} />
          Current: {curAqi} ({curLv.label})
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280, height: 120 }}>
          <defs>
            <linearGradient id="aqiAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* AQI zone bands */}
          {[20, 40, 60, 80, 100].map((lv) => (
            <line key={lv}
              x1={PAD_X} y1={y(lv)} x2={W-12} y2={y(lv)}
              stroke={dark ? '#1e1e1e' : '#f3f4f6'}
              strokeWidth="1" strokeDasharray="4 4"
            />
          ))}

          {/* Y axis labels */}
          {[0, 20, 40, 60, 80, 100].map((lv) => (
            <text key={lv} x={PAD_X - 4} y={y(lv) + 4}
              textAnchor="end" fontSize="8"
              fill={aqiColor(lv)}>
              {lv}
            </text>
          ))}

          {/* Area */}
          <path d={areaPath} fill="url(#aqiAreaGrad)" />

          {/* Coloured line segments */}
          {pts.slice(0,-1).map((p, i) => (
            <line key={i}
              x1={x(i)} y1={y(p.aqi)} x2={x(i+1)} y2={y(pts[i+1].aqi)}
              stroke={aqiColor((p.aqi + pts[i+1].aqi) / 2)}
              strokeWidth="2.5" strokeLinecap="round"
            />
          ))}

          {/* Dots at every label */}
          {pts.map((p, i) => i % labelEvery === 0 && (
            <circle key={i} cx={x(i)} cy={y(p.aqi)} r="3.5"
              fill={aqiColor(p.aqi)} stroke={dark ? '#161616' : '#fff'} strokeWidth="1.5"
            />
          ))}

          {/* X axis time labels */}
          {pts.map((p, i) => i % labelEvery === 0 && (
            <text key={i} x={x(i)} y={H - 1} textAnchor="middle" fontSize="8.5"
              fill={dark ? '#555' : '#9ca3af'}>
              {(() => { const h = new Date(p.time).getHours(); return h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h-12}p`; })()}
            </text>
          ))}
        </svg>
      </div>

      {/* PM breakdown */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {[
          { label: 'PM2.5 now', val: pts[0]?.pm25, unit: 'μg/m³', color: 'text-orange-400' },
          { label: 'PM10 now',  val: pts[0]?.pm10,  unit: 'μg/m³', color: 'text-yellow-400' },
        ].map(p => (
          <div key={p.label} className={`rounded-xl p-3 ${card2}`}>
            <div className={`text-[9px] uppercase tracking-widest ${txt3}`}>{p.label}</div>
            <div className={`font-semibold text-sm mt-0.5 ${p.color}`}>
              {p.val != null ? Math.round(p.val * 10) / 10 : '--'}
              <span className={`text-[9px] ml-1 ${txt3}`}>{p.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
