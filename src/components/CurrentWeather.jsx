import { getDesc, fmtDate, fmtSun, windDir, convertTemp, convertWind } from '../utils/weather.js';
import WeatherIcon from './WeatherIcon.jsx';

export default function CurrentWeather({ weather, location, unit, dark }) {
  const cur   = weather.current;
  const daily = weather.daily;

  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const card2 = dark ? 'bg-ink-700' : 'bg-gray-100';
  const txt2  = dark ? 'text-ink-300' : 'text-gray-500';
  const txt3  = dark ? 'text-ink-400' : 'text-gray-400';
  const div   = dark ? 'bg-ink-500' : 'bg-gray-200';

  const T = (v) => convertTemp(v, unit);
  const W = (v) => convertWind(v, unit);

  const stats = [
    { icon: '💧', label: 'Humidity',      val: `${cur.relative_humidity_2m}%` },
    { icon: '💨', label: 'Wind',          val: `${W(cur.wind_speed_10m)} ${windDir(cur.wind_direction_10m)}` },
    { icon: '🌡️', label: 'Pressure',     val: `${Math.round(cur.surface_pressure)} hPa` },
    { icon: '👁️', label: 'Visibility',   val: `${Math.round((cur.visibility || 10000) / 1000)} km` },
    { icon: '🌧️', label: 'Precipitation', val: `${cur.precipitation} mm` },
    { icon: '📊', label: 'Hi / Lo',      val: `${T(daily.temperature_2m_max[0])} / ${T(daily.temperature_2m_min[0])}` },
  ];

  const tempNum = unit === 'C'
    ? Math.round(cur.temperature_2m)
    : Math.round(cur.temperature_2m * 9/5 + 32);

  return (
    <div className={`rounded-2xl p-5 sm:p-6 shadow-card relative overflow-hidden animate-slide ${card}`}>
      {/* Decorative glow */}
      <div className="absolute -top-8 -right-8 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-500 mb-1">
        Current Weather
      </div>
      <div className="text-lg sm:text-xl font-bold leading-tight truncate">{location.name}</div>
      <div className={`text-xs mt-1 ${txt3}`}>{fmtDate(cur.time)}</div>

      {/* Animated icon + temp */}
      <div className="flex items-center gap-3 sm:gap-4 my-5 sm:my-6">
        <div className="shrink-0" style={{ width: 64, height: 64, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <WeatherIcon code={cur.weather_code} size="lg" />
        </div>
        <div>
          <div className="font-display text-5xl sm:text-6xl leading-none text-amber-400 tracking-wider">
            {tempNum}<span className="text-xl sm:text-2xl">°{unit}</span>
          </div>
          <div className={`text-sm mt-1 ${txt2}`}>{getDesc(cur.weather_code)}</div>
          <div className={`text-xs ${txt3}`}>Feels like {T(cur.apparent_temperature)}</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-2.5 sm:p-3 ${card2}`}>
            <div className={`text-[10px] uppercase tracking-widest font-semibold ${txt3}`}>
              {s.icon} {s.label}
            </div>
            <div className="font-semibold text-xs sm:text-sm mt-1 truncate">{s.val}</div>
          </div>
        ))}
      </div>

      {/* Sunrise / Sunset */}
      <div className={`flex justify-between mt-3 rounded-xl p-2.5 sm:p-3 ${card2}`}>
        <div className="text-center">
          <div className={`text-[10px] uppercase tracking-widest ${txt3}`}>🌅 Sunrise</div>
          <div className="font-display text-base sm:text-lg text-amber-400 tracking-wider">{fmtSun(daily.sunrise[0])}</div>
        </div>
        <div className={`w-px ${div}`} />
        <div className="text-center">
          <div className={`text-[10px] uppercase tracking-widest ${txt3}`}>🌇 Sunset</div>
          <div className="font-display text-base sm:text-lg text-amber-400 tracking-wider">{fmtSun(daily.sunset[0])}</div>
        </div>
      </div>
    </div>
  );
}
