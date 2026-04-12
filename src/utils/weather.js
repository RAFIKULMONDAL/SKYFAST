export const WMO_DESC = {
  0:'Clear Sky',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',
  45:'Foggy',48:'Icy Fog',
  51:'Light Drizzle',53:'Moderate Drizzle',55:'Dense Drizzle',
  61:'Slight Rain',63:'Moderate Rain',65:'Heavy Rain',
  71:'Slight Snow',73:'Moderate Snow',75:'Heavy Snow',77:'Snow Grains',
  80:'Slight Showers',81:'Moderate Showers',82:'Violent Showers',
  85:'Slight Snow Showers',86:'Heavy Snow Showers',
  95:'Thunderstorm',96:'Thunderstorm + Hail',99:'Thunderstorm + Heavy Hail',
};

export const WMO_ICON = {
  0:'☀️',1:'🌤️',2:'⛅',3:'☁️',
  45:'🌫️',48:'🌫️',
  51:'🌦️',53:'🌦️',55:'🌧️',
  61:'🌧️',63:'🌧️',65:'🌧️',
  71:'🌨️',73:'❄️',75:'❄️',77:'🌨️',
  80:'🌦️',81:'🌧️',82:'⛈️',
  85:'🌨️',86:'❄️',
  95:'⛈️',96:'⛈️',99:'⛈️',
};

export const getIcon = (code) => WMO_ICON[code] || '🌡️';
export const getDesc = (code) => WMO_DESC[code] || 'Unknown';

export const AQI_LEVELS = [
  { max: 20,   label: 'Good',      color: 'text-emerald-400', ring: 'border-emerald-400', info: 'Air quality is excellent. Enjoy outdoor activities freely.' },
  { max: 40,   label: 'Fair',      color: 'text-green-400',   ring: 'border-green-400',   info: 'Acceptable air quality. Sensitive people may notice effects.' },
  { max: 60,   label: 'Moderate',  color: 'text-yellow-400',  ring: 'border-yellow-400',  info: 'Some pollutants may affect sensitive groups.' },
  { max: 80,   label: 'Poor',      color: 'text-orange-400',  ring: 'border-orange-400',  info: 'Health effects possible for everyone. Sensitive groups at risk.' },
  { max: 100,  label: 'Very Poor', color: 'text-red-400',     ring: 'border-red-400',     info: 'Health alert: everyone may experience serious effects.' },
  { max: 9999, label: 'Hazardous', color: 'text-purple-400',  ring: 'border-purple-400',  info: 'Emergency conditions. Avoid all outdoor activity.' },
];

export const getAqiLevel = (aqi) => AQI_LEVELS.find((l) => aqi <= l.max) || AQI_LEVELS.at(-1);

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const fmtDate = (dt) => {
  const d = new Date(dt);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const fmtDay = (dt) => {
  const d   = new Date(dt);
  const now = new Date(); now.setHours(0,0,0,0);
  const dd  = new Date(dt); dd.setHours(0,0,0,0);
  if (dd.getTime() === now.getTime()) return 'Today';
  if (dd.getTime() === now.getTime() + 86400000) return 'Tomorrow';
  return DAYS[d.getDay()];
};

export const fmtHour = (dt) => {
  const d = new Date(dt);
  let h = d.getHours(), a = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h} ${a}`;
};

export const fmtSun = (iso) => {
  if (!iso) return '--';
  const d = new Date(iso);
  let h = d.getHours(), m = d.getMinutes(), a = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2,'0')} ${a}`;
};

export const windDir = (deg) =>
  ['N','NE','E','SE','S','SW','W','NW'][Math.round(deg / 45) % 8];

export const convertTemp = (val, unit) =>
  unit === 'C' ? `${Math.round(val)}°C` : `${Math.round(val * 9/5 + 32)}°F`;

export const convertTempNum = (val, unit) =>
  unit === 'C' ? Math.round(val) : Math.round(val * 9/5 + 32);

export const convertWind = (val, unit) =>
  unit === 'C' ? `${Math.round(val)} km/h` : `${Math.round(val * 0.621)} mph`;
