import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';

export default function WeatherRadar({ location, dark }) {
  const { t } = useTranslation();
  const instanceRef  = useRef(null);
  const containerRef = useRef(null);
  const layersRef    = useRef([]);
  const timerRef     = useRef(null);

  const [frames,   setFrames]   = useState([]);
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing,  setPlaying]  = useState(true);
  const [loading,  setLoading]  = useState(true);

  const card = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const txt3 = dark ? 'text-ink-400' : 'text-gray-400';

  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(r => r.json())
      .then(d => {
        const past    = (d.radar?.past    || []).slice(-6);
        const nowcast = (d.radar?.nowcast || []).slice(0, 3);
        setFrames([...past, ...nowcast]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (instanceRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current, { center: [location.lat, location.lon], zoom: 6, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    instanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 200);
    return () => { if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; } };
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!instanceRef.current) return;
    instanceRef.current.setView([location.lat, location.lon], 6);
  }, [location.lat, location.lon]);

  const showFrame = (map, allFrames, idx) => {
    layersRef.current.forEach(l => { try { map.removeLayer(l); } catch {} });
    layersRef.current = [];
    if (!allFrames[idx]) return;
    const layer = L.tileLayer(
      `https://tilecache.rainviewer.com${allFrames[idx].path}/256/{z}/{x}/{y}/2/1_1.png`,
      { opacity: 0.6, attribution: '© RainViewer' }
    ).addTo(map);
    layersRef.current.push(layer);
  };

  useEffect(() => {
    if (!frames.length || !instanceRef.current) return;
    showFrame(instanceRef.current, frames, frameIdx);
  }, [frames, frameIdx]); // eslint-disable-line

  useEffect(() => {
    clearInterval(timerRef.current);
    if (!playing || !frames.length) return;
    timerRef.current = setInterval(() => setFrameIdx(i => (i + 1) % frames.length), 700);
    return () => clearInterval(timerRef.current);
  }, [playing, frames.length]);

  const fmtTime = (unix) => {
    if (!unix) return '';
    const d = new Date(unix * 1000);
    const h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0');
    return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className={`rounded-2xl overflow-hidden shadow-card animate-slide ${card}`}>
      <div className="px-4 sm:px-5 pt-4 pb-2 flex items-center justify-between flex-wrap gap-2">
        <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500">
          🌧 {t('radarTitle')}
        </div>
        <div className="flex items-center gap-2">
          {frames[frameIdx] && (
            <span className={`text-[10px] ${txt3}`}>
              {frameIdx < frames.length - 3 ? '🔵 Past' : '🟢 Forecast'} · {fmtTime(frames[frameIdx].time)}
            </span>
          )}
          <button onClick={() => setPlaying(p => !p)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors
              ${playing ? 'bg-amber-500 text-black border-amber-500'
                        : dark ? 'border-ink-600 text-ink-300' : 'border-gray-300 text-gray-500'}`}>
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      </div>

      {frames.length > 0 && (
        <div className="px-4 sm:px-5 pb-2 flex items-center gap-2">
          <input type="range" min={0} max={frames.length - 1} value={frameIdx}
            onChange={e => { setPlaying(false); setFrameIdx(Number(e.target.value)); }}
            className="flex-1 accent-amber-500 h-1.5 cursor-pointer" />
          <span className={`text-[10px] shrink-0 ${txt3}`}>{frameIdx + 1}/{frames.length}</span>
        </div>
      )}

      <div className="px-4 sm:px-5 pb-2 flex items-center gap-3 flex-wrap">
        {[{ c: '#00d4ff', l: 'Light' }, { c: '#00b300', l: 'Moderate' }, { c: '#ffff00', l: 'Heavy' }, { c: '#ff6600', l: 'Intense' }, { c: '#cc0000', l: 'Extreme' }]
          .map(({ c, l }) => (
            <div key={l} className="flex items-center gap-1">
              <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
              <span className={`text-[9px] ${txt3}`}>{l}</span>
            </div>
          ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6 gap-2 text-sm text-amber-400">
          <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          Loading radar data…
        </div>
      )}

      {/* data-noswipe prevents tab swipe on map touch */}
      <div
        ref={containerRef}
        data-noswipe="true"
        className={dark ? 'map-dark' : 'map-light'}
        style={{ width: '100%', height: 320 }}
      />
    </div>
  );
}
