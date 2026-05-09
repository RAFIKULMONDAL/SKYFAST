import { fmtHour, convertTemp } from '../utils/weather.js';
import WeatherIcon from './WeatherIcon.jsx';

export default function HourlyForecast({ weather, unit, dark }) {
  const hourly = weather.hourly;
  const now    = new Date();

  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const card2 = dark ? 'bg-ink-700' : 'bg-gray-100';
  const txt3  = dark ? 'text-ink-400' : 'text-gray-400';

  const T = (v) => convertTemp(v, unit);

  const items = [];
  for (let i = 0; i < hourly.time.length && items.length < 24; i++) {
    if (new Date(hourly.time[i]) >= new Date(now.getTime() - 3600000)) items.push(i);
  }

  return (
    <div className={`rounded-2xl p-4 sm:p-5 shadow-card animate-slide ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-4">
        ⏱ Hourly Forecast
      </div>

      
      <div
        data-noswipe="true"
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent', WebkitOverflowScrolling: 'touch' }}
      >
        {items.slice(0, 24).map((idx, pos) => (
          <div
            key={idx}
            className={`flex-shrink-0 rounded-xl p-2.5 text-center w-[66px] sm:w-[72px] border transition-colors
              ${pos === 0
                ? 'border-amber-500 bg-amber-500/10'
                : `border-transparent ${card2}`}`}
          >
            <div className={`text-[10px] mb-1.5 ${txt3}`}>
              {pos === 0 ? 'Now' : fmtHour(hourly.time[idx])}
            </div>
            <div className="flex items-center justify-center mb-1.5" style={{ height: 36 }}>
              <WeatherIcon code={hourly.weather_code[idx]} size="sm" />
            </div>
            <div className="text-xs font-bold">{T(hourly.temperature_2m[idx])}</div>
            {hourly.precipitation_probability[idx] > 0 && (
              <div className="text-[10px] text-amber-400 mt-1">
                💧{hourly.precipitation_probability[idx]}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
