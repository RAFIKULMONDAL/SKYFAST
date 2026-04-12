import { getAqiLevel } from '../utils/weather.js';

export default function AirQuality({ airQuality, dark }) {
  const cur = airQuality.current;
  const aqi = cur.european_aqi;
  const lv  = getAqiLevel(aqi);

  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const card2 = dark ? 'bg-ink-700' : 'bg-gray-100';
  const txt2  = dark ? 'text-ink-300' : 'text-gray-500';
  const txt3  = dark ? 'text-ink-400' : 'text-gray-400';

  const pollutants = [
    { name: 'PM10',  val: cur.pm10,             unit: 'μg/m³' },
    { name: 'PM2.5', val: cur.pm2_5,            unit: 'μg/m³' },
    { name: 'NO₂',   val: cur.nitrogen_dioxide, unit: 'μg/m³' },
    { name: 'O₃',    val: cur.ozone,            unit: 'μg/m³' },
    { name: 'CO',    val: cur.carbon_monoxide,  unit: 'μg/m³' },
    { name: 'SO₂',   val: cur.sulphur_dioxide,  unit: 'μg/m³' },
  ];

  return (
    <div className={`rounded-2xl p-5 shadow-card animate-slide ${card}`}>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-4">
        Air Quality Index
      </div>

      {/* AQI circle + label */}
      <div className="flex items-center gap-5 mb-5">
        <div className={`w-20 h-20 rounded-full border-4 ${lv.ring} flex flex-col items-center justify-center shrink-0`}>
          <span className={`font-display text-3xl leading-none ${lv.color}`}>{aqi}</span>
          <span className={`text-[9px] uppercase tracking-wider ${txt3}`}>AQI</span>
        </div>
        <div>
          <div className={`font-display text-xl tracking-wider ${lv.color}`}>{lv.label}</div>
          <div className={`text-xs mt-1 leading-relaxed ${txt2}`}>{lv.info}</div>
        </div>
      </div>

      {/* Pollutants grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {pollutants.map((p) => (
          <div key={p.name} className={`rounded-xl p-3 ${card2}`}>
            <div className={`text-[10px] uppercase tracking-widest ${txt3}`}>{p.name}</div>
            <div className="font-semibold text-sm mt-1">
              {p.val !== undefined ? (Math.round(p.val * 10) / 10) : '--'}
              <span className={`text-[10px] ml-1 ${txt3}`}>{p.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
