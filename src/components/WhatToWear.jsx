export default function WhatToWear({ weather, unit, dark }) {
  const cur  = weather.current;
  const temp = unit === 'C' ? cur.temperature_2m : cur.temperature_2m * 9/5 + 32;
  const code = cur.weather_code;
  const wind = cur.wind_speed_10m; // km/h
  const hum  = cur.relative_humidity_2m;

  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const card2 = dark ? 'bg-ink-700' : 'bg-gray-100';
  const txt2  = dark ? 'text-ink-200' : 'text-gray-700';
  const txt3  = dark ? 'text-ink-400' : 'text-gray-400';

  // ── Build suggestions ──
  const items = [];

  // Temperature-based clothing
  if (unit === 'C') {
    if (temp <= 0)        items.push({ icon: '🧥', text: 'Heavy winter coat essential', tag: 'Freezing' });
    else if (temp <= 8)   items.push({ icon: '🧥', text: 'Warm coat recommended', tag: 'Very Cold' });
    else if (temp <= 14)  items.push({ icon: '🧣', text: 'Jacket & scarf advised', tag: 'Cold' });
    else if (temp <= 20)  items.push({ icon: '👕', text: 'Light jacket or sweater', tag: 'Cool' });
    else if (temp <= 26)  items.push({ icon: '👕', text: 'T-shirt weather — comfortable', tag: 'Warm' });
    else if (temp <= 32)  items.push({ icon: '🩳', text: 'Shorts & light clothing', tag: 'Hot' });
    else                  items.push({ icon: '🌡️', text: 'Very hot — stay hydrated, light clothes only', tag: 'Extreme Heat' });
  } else {
    if (temp <= 32)       items.push({ icon: '🧥', text: 'Heavy winter coat essential', tag: 'Freezing' });
    else if (temp <= 46)  items.push({ icon: '🧥', text: 'Warm coat recommended', tag: 'Very Cold' });
    else if (temp <= 57)  items.push({ icon: '🧣', text: 'Jacket & scarf advised', tag: 'Cold' });
    else if (temp <= 68)  items.push({ icon: '👕', text: 'Light jacket or sweater', tag: 'Cool' });
    else if (temp <= 79)  items.push({ icon: '👕', text: 'T-shirt weather — comfortable', tag: 'Warm' });
    else if (temp <= 90)  items.push({ icon: '🩳', text: 'Shorts & light clothing', tag: 'Hot' });
    else                  items.push({ icon: '🌡️', text: 'Very hot — stay hydrated, light clothes only', tag: 'Extreme Heat' });
  }

  // Rain/snow
  const rainy = [51,53,55,61,63,65,80,81,82].includes(code);
  const snowy = [71,73,75,77,85,86].includes(code);
  const stormy = [95,96,99].includes(code);
  const foggy  = [45,48].includes(code);

  if (stormy)     items.push({ icon: '⛈️', text: 'Stay indoors if possible — thunderstorm active', tag: 'Dangerous' });
  else if (snowy) items.push({ icon: '🥾', text: 'Waterproof boots & snow gear', tag: 'Snow' });
  else if (rainy) items.push({ icon: '☂️', text: 'Carry an umbrella or raincoat', tag: 'Rain' });
  if (foggy)      items.push({ icon: '🌫️', text: 'Drive carefully — reduced visibility', tag: 'Fog' });

  // Wind
  if (wind > 60)       items.push({ icon: '💨', text: 'Very strong winds — avoid loose clothing', tag: 'Strong Wind' });
  else if (wind > 30)  items.push({ icon: '🌬️', text: 'Windy — secure hats and scarves', tag: 'Windy' });

  // Humidity comfort
  if (hum > 80 && temp > 25) items.push({ icon: '💦', text: 'High humidity — feels muggy, stay cool', tag: 'Humid' });

  // Sun
  if ([0,1].includes(code) && temp > 20)
    items.push({ icon: '🕶️', text: 'Sunny — sunglasses & sunscreen advised', tag: 'UV' });

  // Best time summary
  const summary = stormy
    ? "⚠️ Not ideal to go outside right now."
    : rainy || snowy
    ? "🌂 Be prepared for precipitation."
    : (unit === 'C' ? temp : (temp - 32) * 5/9) > 30
    ? "🥵 It's hot out — stay hydrated!"
    : (unit === 'C' ? temp : (temp - 32) * 5/9) < 5
    ? "🥶 Bundle up well before heading out."
    : "✅ Good conditions to be outside today.";

  return (
    <div className={`rounded-2xl p-5 shadow-card animate-slide ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-1">
        👗 What to Wear
      </div>
      <p className={`text-xs mb-4 ${txt3}`}>{summary}</p>

      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${card2}`}>
            <span className="text-2xl shrink-0">{item.icon}</span>
            <div className="flex-1">
              <span className={`text-sm ${txt2}`}>{item.text}</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0
              ${dark ? 'border-ink-500 text-ink-400' : 'border-gray-300 text-gray-400'}`}>
              {item.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
