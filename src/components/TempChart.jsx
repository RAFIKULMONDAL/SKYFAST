import { convertTempNum } from '../utils/weather.js';

export default function TempChart({ weather, unit, dark }) {
  const hourly = weather.hourly;
  const now    = new Date();

  // Get next 24 hours
  const points = [];
  for (let i = 0; i < hourly.time.length && points.length < 24; i++) {
    if (new Date(hourly.time[i]) >= new Date(now.getTime() - 3600000)) {
      points.push({
        time: hourly.time[i],
        temp: convertTempNum(hourly.temperature_2m[i], unit),
        pop:  hourly.precipitation_probability[i] || 0,
      });
    }
  }

  if (points.length === 0) return null;

  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const txt3  = dark ? 'text-ink-400' : 'text-gray-400';

  const W = 700, H = 160, PAD = 32;
  const temps = points.map((p) => p.temp);
  const minT  = Math.min(...temps) - 2;
  const maxT  = Math.max(...temps) + 2;

  const x = (i) => PAD + (i / (points.length - 1)) * (W - PAD * 2);
  const y = (t) => H - PAD - ((t - minT) / (maxT - minT)) * (H - PAD * 2);

  // SVG path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.temp)}`).join(' ');

  // Area fill path
  const areaPath =
    linePath +
    ` L ${x(points.length - 1)} ${H - PAD} L ${x(0)} ${H - PAD} Z`;

  // Label every 4 hours
  const labels = points.filter((_, i) => i % 4 === 0);

  return (
    <div className={`rounded-2xl p-5 shadow-card animate-slide ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-3">
        📈 24-Hour Temperature Trend
      </div>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 300, height: 160 }}>
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fcd34d" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const yy = PAD + t * (H - PAD * 2);
            const tv = Math.round(maxT - t * (maxT - minT));
            return (
              <g key={t}>
                <line x1={PAD} y1={yy} x2={W - PAD} y2={yy}
                  stroke={dark ? '#2a2a2a' : '#f3f4f6'} strokeWidth="1" />
                <text x={PAD - 4} y={yy + 4} textAnchor="end"
                  fontSize="9" fill={dark ? '#555' : '#9ca3af'}>
                  {tv}°
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#tempGrad)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots + labels at every 4h */}
          {points.map((p, i) => {
            const isLabel = i % 4 === 0;
            return (
              <g key={i}>
                {isLabel && (
                  <>
                    <circle cx={x(i)} cy={y(p.temp)} r="4" fill="#f59e0b" />
                    <text x={x(i)} y={y(p.temp) - 9} textAnchor="middle"
                      fontSize="10" fontWeight="600" fill={dark ? '#fcd34d' : '#d97706'}>
                      {p.temp}°
                    </text>
                    <text x={x(i)} y={H - 6} textAnchor="middle"
                      fontSize="9" fill={dark ? '#555' : '#9ca3af'}>
                      {new Date(p.time).getHours() === 0
                        ? '12AM'
                        : new Date(p.time).getHours() < 12
                          ? `${new Date(p.time).getHours()}AM`
                          : new Date(p.time).getHours() === 12
                            ? '12PM'
                            : `${new Date(p.time).getHours() - 12}PM`}
                    </text>
                  </>
                )}
                {/* Rain probability bars */}
                {p.pop > 0 && (
                  <rect
                    x={x(i) - 3} y={H - PAD - (p.pop / 100) * 20}
                    width="6" height={(p.pop / 100) * 20}
                    fill="#38bdf8" opacity="0.4" rx="1"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className={`flex items-center gap-4 mt-1 text-[10px] ${txt3}`}>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-400 inline-block rounded"></span> Temperature</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 bg-sky-400/50 inline-block rounded"></span> Rain chance</span>
      </div>
    </div>
  );
}
