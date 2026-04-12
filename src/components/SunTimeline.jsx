export default function SunTimeline({ weather, dark }) {
  const daily = weather.daily;
  const tz    = weather.timezone;

  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const txt2  = dark ? 'text-ink-200' : 'text-gray-700';
  const txt3  = dark ? 'text-ink-400' : 'text-gray-400';

  // Parse times in city's timezone
  const parseLocal = (iso) => {
    try { return new Date(iso); } catch { return null; }
  };

  const sunriseISO = daily.sunrise?.[0];
  const sunsetISO  = daily.sunset?.[0];
  if (!sunriseISO || !sunsetISO) return null;

  const sunrise = parseLocal(sunriseISO);
  const sunset  = parseLocal(sunsetISO);
  const now     = new Date();

  // Civil twilight ≈ 30 min before sunrise / after sunset
  const TWILIGHT_MS = 30 * 60 * 1000;
  const dawnStart   = new Date(sunrise.getTime() - TWILIGHT_MS);
  const duskEnd     = new Date(sunset.getTime()  + TWILIGHT_MS);
  // Golden hour ≈ 60 min after sunrise / before sunset
  const goldenMornEnd  = new Date(sunrise.getTime() + 60 * 60 * 1000);
  const goldenEveStart = new Date(sunset.getTime()  - 60 * 60 * 1000);

  // Timeline spans midnight → midnight (24h)
  const dayStart = new Date(now); dayStart.setHours(0,0,0,0);
  const dayEnd   = new Date(dayStart.getTime() + 24 * 3600000);
  const toX      = (d) => ((d - dayStart) / (dayEnd - dayStart)) * 100;

  const nowX = Math.max(0, Math.min(100, toX(now)));

  // Clamp to [0,100]
  const c = (v) => Math.max(0, Math.min(100, v));

  const segments = [
    // Night (start of day → dawn)
    { x: c(toX(dayStart)), w: c(toX(dawnStart)) - c(toX(dayStart)), color: '#0f172a', label: '' },
    // Civil twilight (dawn)
    { x: c(toX(dawnStart)), w: c(toX(sunrise)) - c(toX(dawnStart)), color: '#1e3a5f', label: '' },
    // Golden hour morning
    { x: c(toX(sunrise)), w: c(toX(goldenMornEnd)) - c(toX(sunrise)), color: '#f59e0b', label: '' },
    // Daytime
    { x: c(toX(goldenMornEnd)), w: c(toX(goldenEveStart)) - c(toX(goldenMornEnd)), color: '#fde68a', label: '' },
    // Golden hour evening
    { x: c(toX(goldenEveStart)), w: c(toX(sunset)) - c(toX(goldenEveStart)), color: '#f97316', label: '' },
    // Civil twilight (dusk)
    { x: c(toX(sunset)), w: c(toX(duskEnd)) - c(toX(sunset)), color: '#1e3a5f', label: '' },
    // Night (dusk → end of day)
    { x: c(toX(duskEnd)), w: 100 - c(toX(duskEnd)), color: '#0f172a', label: '' },
  ].filter(s => s.w > 0);

  // Format time in local timezone
  const fmtTime = (d) => {
    if (!d) return '--';
    try {
      return d.toLocaleTimeString('en', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  };

  // Daylight hours
  const daylightMs  = sunset - sunrise;
  const daylightHrs = (daylightMs / 3600000).toFixed(1);

  // Current phase
  const getPhase = () => {
    if (now < dawnStart)    return { label: 'Night',          color: '#60a5fa', icon: '🌙' };
    if (now < sunrise)      return { label: 'Civil Twilight', color: '#93c5fd', icon: '🌌' };
    if (now < goldenMornEnd)return { label: 'Golden Hour ☀️', color: '#f59e0b', icon: '🌅' };
    if (now < goldenEveStart)return { label: 'Daytime',       color: '#fde68a', icon: '☀️'  };
    if (now < sunset)       return { label: 'Golden Hour 🌇', color: '#f97316', icon: '🌇' };
    if (now < duskEnd)      return { label: 'Civil Twilight', color: '#93c5fd', icon: '🌆' };
    return                         { label: 'Night',          color: '#60a5fa', icon: '🌙' };
  };

  const phase = getPhase();

  // Arc path — semi-circle above timeline
  // Sun position along the arc (0% = sunrise, 100% = sunset)
  const sunProgress = (() => {
    if (now <= sunrise) return 0;
    if (now >= sunset)  return 1;
    return (now - sunrise) / (sunset - sunrise);
  })();

  // SVG arc: semi-ellipse from sunrise to sunset
  const W = 400, H = 90, PAD = 20;
  const arcLeft  = c(toX(sunrise))  / 100 * (W - PAD*2) + PAD;
  const arcRight = c(toX(sunset))   / 100 * (W - PAD*2) + PAD;
  const arcMidX  = (arcLeft + arcRight) / 2;
  const arcRadX  = (arcRight - arcLeft) / 2;
  const arcRadY  = Math.min(H - 20, arcRadX * 0.6);

  // Sun position on arc
  const sunAngle = Math.PI - sunProgress * Math.PI; // π to 0 (left to right)
  const sunX     = arcMidX + arcRadX * Math.cos(sunAngle);
  const sunY     = (H - 10) - arcRadY * Math.sin(sunAngle);

  const isAboveHorizon = now >= sunrise && now <= sunset;

  return (
    <div className={`rounded-2xl p-4 sm:p-5 shadow-card animate-slide ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-4">
        🌅 Sunrise &amp; Sunset Timeline
      </div>

      {/* Current phase badge */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{phase.icon}</span>
          <div>
            <div className="font-semibold text-sm" style={{ color: phase.color }}>
              {phase.label}
            </div>
            <div className={`text-[11px] ${txt3}`}>
              {daylightHrs}h of daylight today
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className={`text-[10px] uppercase tracking-widest ${txt3}`}>🌅 Sunrise</div>
            <div className="font-display text-base text-amber-400 tracking-wider">
              {fmtTime(sunrise)}
            </div>
          </div>
          <div className="text-center">
            <div className={`text-[10px] uppercase tracking-widest ${txt3}`}>🌇 Sunset</div>
            <div className="font-display text-base text-amber-400 tracking-wider">
              {fmtTime(sunset)}
            </div>
          </div>
        </div>
      </div>

      {/* SVG arc */}
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
          {/* Arc path */}
          {arcRadX > 10 && (
            <path
              d={`M ${arcLeft} ${H-10} A ${arcRadX} ${arcRadY} 0 0 1 ${arcRight} ${H-10}`}
              fill="none"
              stroke={dark ? 'rgba(251,191,36,0.2)' : 'rgba(245,158,11,0.2)'}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}

          {/* Sun dot on arc */}
          {isAboveHorizon && arcRadX > 10 && (
            <>
              <circle cx={sunX} cy={sunY} r="10" fill="rgba(251,191,36,0.15)" />
              <circle cx={sunX} cy={sunY} r="6"  fill="#f59e0b" />
              <circle cx={sunX} cy={sunY} r="3"  fill="#fcd34d" />
            </>
          )}

          {/* Segments bar */}
          {segments.map((s, i) => (
            <rect
              key={i}
              x={s.x / 100 * (W - PAD*2) + PAD}
              y={H - 14}
              width={Math.max(0, s.w / 100 * (W - PAD*2))}
              height={10}
              fill={s.color}
              rx={i === 0 ? 5 : i === segments.length-1 ? 5 : 0}
            />
          ))}

          {/* Now indicator */}
          <line
            x1={nowX / 100 * (W - PAD*2) + PAD}
            y1={0}
            x2={nowX / 100 * (W - PAD*2) + PAD}
            y2={H - 4}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
          <text
            x={nowX / 100 * (W - PAD*2) + PAD}
            y={H - 1}
            textAnchor="middle"
            fontSize="8"
            fill="#f59e0b"
            fontWeight="600"
          >
            NOW
          </text>

          {/* Hour labels */}
          {[0, 6, 12, 18, 24].map(h => {
            const d = new Date(dayStart.getTime() + h * 3600000);
            const x = toX(d) / 100 * (W - PAD*2) + PAD;
            return (
              <text key={h} x={x} y={H - 18} textAnchor="middle"
                fontSize="8" fill={dark ? '#555' : '#9ca3af'}>
                {h === 0 ? '12a' : h === 6 ? '6a' : h === 12 ? '12p' : h === 18 ? '6p' : '12a'}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-3 flex-wrap">
        {[
          { color: '#0f172a', label: 'Night'         },
          { color: '#1e3a5f', label: 'Twilight'      },
          { color: '#f59e0b', label: 'Golden Hour'   },
          { color: '#fde68a', label: 'Day'           },
          { color: '#f97316', label: 'Golden Evening'},
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div style={{ width: 12, height: 12, borderRadius: 2, background: l.color,
              border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }} />
            <span className={`text-[10px] ${txt3}`}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
