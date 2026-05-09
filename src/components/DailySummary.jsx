import { getDesc } from '../utils/weather.js';

function getBestOutdoorHour(hourly, unit) {
  const now  = new Date();
  let best   = null;
  let bestScore = -Infinity;

  for (let i = 0; i < Math.min(hourly.time.length, 14); i++) {
    const t = new Date(hourly.time[i]);
    if (t < now) continue;
    const temp  = hourly.temperature_2m[i] ?? 25;
    const pop   = hourly.precipitation_probability[i] ?? 0;
    const wind  = hourly.wind_speed_10m[i] ?? 0;
    const uv    = hourly.uv_index?.[i] ?? 0;

    // Score: comfortable temp, low rain, low wind, moderate UV
    const tempScore  = unit === 'C'
      ? (temp >= 18 && temp <= 28 ? 3 : temp >= 14 && temp <= 32 ? 1 : -1)
      : (temp >= 64 && temp <= 82 ? 3 : temp >= 57 && temp <= 90 ? 1 : -1);
    const rainScore  = pop < 20 ? 2 : pop < 40 ? 0 : -3;
    const windScore  = wind < 20 ? 1 : wind < 40 ? 0 : -1;
    const uvScore    = uv < 3 ? 1 : uv < 6 ? 0 : -1;
    const score      = tempScore + rainScore + windScore + uvScore;

    if (score > bestScore) { bestScore = score; best = { time: hourly.time[i], score }; }
  }
  return best;
}

function getWeatherMood(code, temp) {
  if ([95,96,99].includes(code)) return { emoji: '⛈️', mood: 'Stormy', advice: 'Stay indoors if possible today.' };
  if ([61,63,65,80,81,82].includes(code)) return { emoji: '🌧️', mood: 'Rainy', advice: 'Keep your umbrella handy today.' };
  if ([51,53,55].includes(code)) return { emoji: '🌦️', mood: 'Drizzly', advice: 'Light rain expected — a jacket will do.' };
  if ([71,73,75,77,85,86].includes(code)) return { emoji: '❄️', mood: 'Snowy', advice: 'Bundle up and drive carefully.' };
  if ([45,48].includes(code)) return { emoji: '🌫️', mood: 'Foggy', advice: 'Reduced visibility — take it slow on the roads.' };
  if ([2,3].includes(code)) return { emoji: '⛅', mood: 'Cloudy', advice: 'A pleasant, overcast day ahead.' };
  if ([0,1].includes(code) && temp > 35) return { emoji: '🥵', mood: 'Scorching', advice: 'Very hot — stay hydrated and limit outdoor time.' };
  if ([0,1].includes(code)) return { emoji: '☀️', mood: 'Sunny', advice: 'A beautiful day — get outside and enjoy it!' };
  return { emoji: '🌤️', mood: 'Fair', advice: 'Decent conditions expected today.' };
}

function fmtHour(dt) {
  const d = new Date(dt);
  const h = d.getHours();
  const a = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12} ${a}`;
}

export default function DailySummary({ weather, unit, dark }) {
  const cur    = weather.current;
  const daily  = weather.daily;
  const hourly = weather.hourly;

  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const card2 = dark ? 'bg-ink-700' : 'bg-gray-100';
  const txt2  = dark ? 'text-ink-200' : 'text-gray-700';
  const txt3  = dark ? 'text-ink-400' : 'text-gray-400';

  const temp  = cur.temperature_2m;
  const mood  = getWeatherMood(cur.weather_code, temp);
  const best  = getBestOutdoorHour(hourly, unit);
  const maxT  = daily.temperature_2m_max[0];
  const minT  = daily.temperature_2m_min[0];
  const maxRain = daily.precipitation_probability_max[0] ?? 0;
  const windMax = daily.wind_speed_10m_max[0] ?? 0;

  const toUnit = (v) => unit === 'C' ? `${Math.round(v)}°C` : `${Math.round(v * 9/5 + 32)}°F`;
  const toWind = (v) => unit === 'C' ? `${Math.round(v)} km/h` : `${Math.round(v * 0.621)} mph`;

 
  const summary = `${mood.advice} High of ${toUnit(maxT)}, low of ${toUnit(minT)}.`
    + (maxRain > 40 ? ` ${maxRain}% chance of rain.` : '')
    + (windMax > 30 ? ` Winds up to ${toWind(windMax)}.` : '');

  return (
    <div className={`rounded-2xl p-4 sm:p-5 shadow-card ${card} mt-4 sm:mt-6`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-3">
        📋 Today's Briefing
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl shrink-0">{mood.emoji}</div>
        <div className="min-w-0">
          <div className={`font-display text-xl tracking-wide text-amber-400`}>{mood.mood} Day</div>
          <p className={`text-sm mt-1 leading-relaxed ${txt2}`}>{summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        
        <div className={`rounded-xl p-3 col-span-2 sm:col-span-1 ${card2}`}>
          <div className={`text-[10px] uppercase tracking-widest font-semibold ${txt3} mb-1`}>
            🌿 Best Hour Outside
          </div>
          <div className={`font-semibold text-sm ${txt2}`}>
            {best ? fmtHour(best.time) : 'Check later'}
          </div>
          <div className={`text-[10px] mt-0.5 ${txt3}`}>
            {best && best.score >= 4 ? 'Excellent conditions'
             : best && best.score >= 2 ? 'Good conditions'
             : 'Marginal conditions'}
          </div>
        </div>

        {/* Rain risk */}
        <div className={`rounded-xl p-3 ${card2}`}>
          <div className={`text-[10px] uppercase tracking-widest font-semibold ${txt3} mb-1`}>
            🌧 Rain Risk
          </div>
          <div className={`font-semibold text-sm ${
            maxRain > 70 ? 'text-red-400' : maxRain > 40 ? 'text-orange-400' : 'text-green-400'
          }`}>
            {maxRain > 70 ? 'High' : maxRain > 40 ? 'Moderate' : 'Low'}
          </div>
          <div className={`text-[10px] mt-0.5 ${txt3}`}>{maxRain}% max</div>
        </div>

        {/* Wind */}
        <div className={`rounded-xl p-3 ${card2}`}>
          <div className={`text-[10px] uppercase tracking-widest font-semibold ${txt3} mb-1`}>
            💨 Wind
          </div>
          <div className={`font-semibold text-sm ${
            windMax > 50 ? 'text-red-400' : windMax > 30 ? 'text-orange-400' : txt2
          }`}>
            {toWind(windMax)}
          </div>
          <div className={`text-[10px] mt-0.5 ${txt3}`}>
            {windMax > 50 ? 'Strong gusts' : windMax > 30 ? 'Breezy' : 'Light'}
          </div>
        </div>

        {/* Sunrise/Sunset row */}
        <div className={`rounded-xl p-3 ${card2}`}>
          <div className={`text-[10px] uppercase tracking-widest font-semibold ${txt3} mb-1`}>
            🌅 Daylight
          </div>
          {(() => {
            try {
              const rise = new Date(daily.sunrise[0]);
              const set  = new Date(daily.sunset[0]);
              const hrs  = Math.round((set - rise) / 3600000 * 10) / 10;
              return (
                <>
                  <div className={`font-semibold text-sm text-amber-400`}>{hrs}h</div>
                  <div className={`text-[10px] mt-0.5 ${txt3}`}>of sunlight today</div>
                </>
              );
            } catch {
              return <div className={`text-sm ${txt2}`}>--</div>;
            }
          })()}
        </div>
      </div>
    </div>
  );
}
