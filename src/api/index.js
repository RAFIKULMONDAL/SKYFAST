export async function fetchWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation,surface_pressure,visibility` +
    `&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m,relative_humidity_2m,surface_pressure,uv_index` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max,uv_index_max` +
    `&timezone=auto&wind_speed_unit=kmh&forecast_days=8`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather API failed');
  return res.json();
}

export async function fetchAirQuality(lat, lon) {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide` +
    `&hourly=european_aqi,pm10,pm2_5` +
    `&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Air Quality API failed');
  return res.json();
}

export async function geocodeSearch(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
    { headers: { 'Accept-Language': 'en' } }
  );
  return res.json();
}

export async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  const a = data.address || {};
  return a.city || a.town || a.village || a.county || data.display_name?.split(',')[0] || 'Selected Location';
}
