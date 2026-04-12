import { getDesc, fmtDay, convertTemp } from '../utils/weather.js';
import WeatherIcon from './WeatherIcon.jsx';

export default function DailyForecast({ weather, unit, dark }) {
  const daily = weather.daily;

  const card    = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const divider = dark ? 'border-ink-700' : 'border-gray-100';
  const txt2    = dark ? 'text-ink-300' : 'text-gray-500';
  const txt3    = dark ? 'text-ink-400' : 'text-gray-400';

  const T = (v) => convertTemp(v, unit);

  return (
    <div className={`rounded-2xl p-4 sm:p-5 shadow-card animate-slide ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-4">
        📅 7-Day Forecast
      </div>
      <div>
        {daily.time.slice(0, 8).map((t, i) => (
          <div key={t}
            className={`flex items-center gap-2 sm:gap-3 py-2.5 border-b last:border-b-0 ${divider}`}>
            {/* Day */}
            <div className="w-20 sm:w-24 shrink-0 text-xs sm:text-sm font-medium">
              {fmtDay(t)}
            </div>
            {/* Animated icon */}
            <div className="shrink-0 flex items-center justify-center" style={{ width: 32, height: 32 }}>
              <WeatherIcon code={daily.weather_code[i]} size="sm" />
            </div>
            {/* Desc */}
            <div className={`flex-1 text-xs hidden sm:block truncate ${txt3}`}>
              {getDesc(daily.weather_code[i])}
            </div>
            {/* Rain % */}
            <div className="text-xs text-amber-400 w-9 text-right shrink-0">
              {daily.precipitation_probability_max[i] > 0
                ? `💧${daily.precipitation_probability_max[i]}%` : ''}
            </div>
            {/* Hi / Lo */}
            <div className="flex gap-1.5 sm:gap-2 shrink-0 font-semibold text-xs sm:text-sm">
              <span>{T(daily.temperature_2m_max[i])}</span>
              <span className={txt3}>{T(daily.temperature_2m_min[i])}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
