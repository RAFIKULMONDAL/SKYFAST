// Pure SVG sparklines — humidity & pressure trends over 24h
export default function Sparklines({ weather, dark }) {
  const hourly = weather.hourly;
  const now    = new Date();

  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const card2 = dark ? 'bg-ink-700' : 'bg-gray-100';
  const txt2  = dark ? 'text-ink-200' : 'text-gray-700';
  const txt3  = dark ? 'text-ink-400' : 'text-gray-400';

  // Collect 24h from now
  const pts = [];
  for (let i = 0; i < hourly.time.length && pts.length < 24; i++) {
    if (new Date(hourly.time[i]) >= new Date(now.getTime() - 3600000)) {
      pts.push({
        time: hourly.time[i],
        hum:  hourly.relative_humidity_2m?.[i] ?? 0,
        pres: hourly.surface_pressure?.[i] ?? 1013,
      });
    }
  }

  const Sparkline = ({ values, color, gradId, min: forceMin, max: forceMax }) => {
    if (!values.length) return null;
    const W = 300, H = 50, PAD = 4;
    const minV = forceMin ?? Math.min(...values) - 1;
    const maxV = forceMax ?? Math.max(...values) + 1;
    const x = (i) => PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = (v) => H - PAD - ((v - minV) / (maxV - minV)) * (H - PAD * 2);
    const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
    const area = line + ` L ${x(values.length-1)} ${H-PAD} L ${x(0)} ${H-PAD} Z`;

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 50 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradId})`} />
        <path d={line}  fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Current value dot */}
        <circle cx={x(0)} cy={y(values[0])} r="3" fill={color} />
      </svg>
    );
  };

  const humValues  = pts.map(p => p.hum);
  const presValues = pts.map(p => p.pres);
  const curHum     = humValues[0] ?? '--';
  const curPres    = presValues[0] ?? '--';

  // Trend arrows
  const humTrend  = humValues.length > 4  ? (humValues[0]  > humValues[4]  ? '↑' : humValues[0]  < humValues[4]  ? '↓' : '→') : '→';
  const presTrend = presValues.length > 4 ? (presValues[0] > presValues[4] ? '↑' : presValues[0] < presValues[4] ? '↓' : '→') : '→';

  return (
    <div className={`rounded-2xl p-5 shadow-card animate-slide ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-4">
        📊 Humidity &amp; Pressure Trends
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Humidity */}
        <div className={`rounded-xl p-3 ${card2}`}>
          <div className="flex items-center justify-between mb-1">
            <div className={`text-[10px] uppercase tracking-widest ${txt3}`}>💧 Humidity</div>
            <span className={`text-xs font-bold ${humTrend === '↑' ? 'text-blue-400' : humTrend === '↓' ? 'text-amber-400' : txt3}`}>
              {humTrend}
            </span>
          </div>
          <div className={`font-display text-2xl tracking-wide text-blue-400 mb-2`}>{curHum}%</div>
          <Sparkline values={humValues} color="#60a5fa" gradId="humGrad" min={0} max={100} />
          <div className="flex justify-between mt-1">
            <span className={`text-[9px] ${txt3}`}>Now</span>
            <span className={`text-[9px] ${txt3}`}>+24h</span>
          </div>
          {/* Comfort bar */}
          <div className="mt-2">
            <div className={`text-[9px] ${txt3} mb-1`}>
              {curHum < 30 ? '🌵 Dry — use a humidifier'
               : curHum < 60 ? '✅ Comfortable range'
               : curHum < 80 ? '💦 Humid — may feel muggy'
               : '🌊 Very humid — uncomfortable'}
            </div>
          </div>
        </div>

        {/* Pressure */}
        <div className={`rounded-xl p-3 ${card2}`}>
          <div className="flex items-center justify-between mb-1">
            <div className={`text-[10px] uppercase tracking-widest ${txt3}`}>🌡️ Pressure</div>
            <span className={`text-xs font-bold ${presTrend === '↑' ? 'text-green-400' : presTrend === '↓' ? 'text-red-400' : txt3}`}>
              {presTrend}
            </span>
          </div>
          <div className={`font-display text-2xl tracking-wide text-emerald-400 mb-2`}>
            {Math.round(curPres)} <span className="text-sm font-body">hPa</span>
          </div>
          <Sparkline values={presValues} color="#34d399" gradId="presGrad" />
          <div className="flex justify-between mt-1">
            <span className={`text-[9px] ${txt3}`}>Now</span>
            <span className={`text-[9px] ${txt3}`}>+24h</span>
          </div>
          <div className="mt-2">
            <div className={`text-[9px] ${txt3} mb-1`}>
              {curPres > 1020 ? '☀️ High pressure — fair weather likely'
               : curPres > 1000 ? '🌤️ Normal pressure — stable conditions'
               : curPres > 980  ? '🌧️ Low pressure — unsettled weather'
               : '⛈️ Very low pressure — storm possible'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
