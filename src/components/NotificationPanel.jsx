import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem('skycast_notifs') === 'true'
  );

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      setEnabled(true);
      localStorage.setItem('skycast_notifs', 'true');
      return true;
    }
    return false;
  };

  const disable = () => {
    setEnabled(false);
    localStorage.setItem('skycast_notifs', 'false');
  };

  const sendNotification = useCallback((title, body, icon = '⛅') => {
    if (!enabled || permission !== 'granted') return;
    try {
      new Notification(title, {
        body,
        icon: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${icon}</text></svg>`,
        tag: 'skycast-weather',
        renotify: true,
      });
    } catch (_) {}
  }, [enabled, permission]);

  return { permission, enabled, requestPermission, disable, sendNotification };
}

export function checkAndSendAlerts(weather, airQuality, sendNotification, locationName) {
  if (!weather) return [];
  const cur    = weather.current;
  const hourly = weather.hourly;
  const now    = new Date();
  const alerts = [];

  let rainSoon = false;
  for (let i = 0; i < hourly.time.length && !rainSoon; i++) {
    const diffH = (new Date(hourly.time[i]) - now) / 3600000;
    if (diffH >= 0 && diffH <= 2 && (hourly.precipitation_probability?.[i] ?? 0) > 60) {
      rainSoon = true;
      alerts.push({ title: `🌧 Rain Alert — ${locationName}`, body: `Rain expected within 2 hours (${hourly.precipitation_probability[i]}% chance).`, icon: '🌧' });
    }
  }
  const uv = hourly.uv_index?.[0] ?? 0;
  if (uv >= 6) alerts.push({ title: `☀️ High UV — ${locationName}`, body: `UV Index is ${Math.round(uv * 10) / 10}. Apply SPF 30+.`, icon: '☀️' });
  if (cur.temperature_2m >= 38) alerts.push({ title: `🌡️ Heat Alert — ${locationName}`, body: `${Math.round(cur.temperature_2m)}°C — stay hydrated.`, icon: '🌡️' });
  else if (cur.temperature_2m <= 2) alerts.push({ title: `🥶 Cold Alert — ${locationName}`, body: `${Math.round(cur.temperature_2m)}°C — bundle up.`, icon: '🥶' });
  if ([95, 96, 99].includes(cur.weather_code)) alerts.push({ title: `⛈️ Thunderstorm — ${locationName}`, body: 'Active thunderstorm. Stay indoors.', icon: '⛈️' });
  const aqi = airQuality?.current?.european_aqi ?? 0;
  if (aqi > 80) alerts.push({ title: `🌬️ Poor Air — ${locationName}`, body: `AQI is ${aqi}. Limit outdoor activity.`, icon: '🌬️' });

  if (alerts.length > 0) sendNotification(alerts[0].title, alerts[0].body, alerts[0].icon);
  return alerts;
}

export default function NotificationPanel({ weather, airQuality, location, dark }) {
  const { permission, enabled, requestPermission, disable, sendNotification } = useNotifications();
  const [alerts, setAlerts] = useState([]);
  const [open,   setOpen]   = useState(false);

  const card  = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const card2 = dark ? 'bg-ink-700' : 'bg-gray-100';
  const txt2  = dark ? 'text-ink-200' : 'text-gray-700';
  const txt3  = dark ? 'text-ink-400' : 'text-gray-400';

  useEffect(() => {
    if (!weather || !enabled) return;
    const found = checkAndSendAlerts(weather, airQuality, sendNotification, location?.name || '');
    setAlerts(found);
  }, [weather?.current?.weather_code, enabled]); // eslint-disable-line

  const handleToggle = async () => {
    if (enabled) { disable(); setAlerts([]); return; }
    const granted = await requestPermission();
    if (granted && weather) {
      const found = checkAndSendAlerts(weather, airQuality, sendNotification, location?.name || '');
      setAlerts(found);
    }
  };

  const handleTest = () => {
    sendNotification(`⛅ SkyCast — ${location?.name || ''}`, 'Weather alerts are working!', '⛅');
  };

  const bellCls = enabled
    ? 'border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black'
    : dark ? 'border-ink-600 text-ink-300 hover:border-amber-500 hover:text-amber-400'
           : 'border-gray-300 text-gray-500 hover:text-amber-600';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative px-2.5 sm:px-3 py-2 rounded-full text-xs font-semibold border transition-colors ${bellCls}`}
      >
        🔔
        {enabled && alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
            {alerts.length}
          </span>
        )}
        <span className="hidden sm:inline ml-1">{enabled ? 'Alerts On' : 'Alerts'}</span>
      </button>

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      {open && (
        <div
          className={`fixed sm:absolute z-50 rounded-2xl border shadow-xl overflow-hidden ${card}`}
          style={{
            /* Mobile: centered fixed panel */
            top: 'var(--notif-top, auto)',
            /* Position calculation handled by inline style below */
            width: 'min(320px, calc(100vw - 24px))',
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto',
            /* On mobile fix to center, on desktop anchor to button */
            right: 0,
            ...(typeof window !== 'undefined' && window.innerWidth < 640
              ? {
                  position: 'fixed',
                  top: '70px',
                  left: '50%',
                  right: 'auto',
                  transform: 'translateX(-50%)',
                }
              : {
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  left: 'auto',
                  transform: 'none',
                }
            ),
          }}
        >
          <div className="p-4">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-500 mb-3">
              Weather Alerts
            </div>

            {permission === 'denied' ? (
              <div className={`text-xs rounded-xl p-3 mb-3 ${card2} text-red-400`}>
                ⚠️ Blocked by browser. Go to Site Settings → Notifications to allow.
              </div>
            ) : (
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs ${txt2}`}>{enabled ? '✅ Alerts active' : 'Get weather alerts'}</span>
                <button onClick={handleToggle}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                    ${enabled ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                              : 'bg-amber-500 text-black hover:bg-amber-400'}`}>
                  {enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            )}

            <div className={`rounded-xl p-3 mb-3 ${card2}`}>
              <div className={`text-[10px] uppercase tracking-widest ${txt3} mb-2`}>Alerts for:</div>
              {['🌧 Rain in 2 hours (>60%)', '☀️ High UV index (≥6)', '🌡️ Extreme temperatures', '⛈️ Thunderstorm active', '🌬️ Poor AQI (>80)']
                .map(a => <div key={a} className={`text-xs py-0.5 ${txt2}`}>{a}</div>)}
            </div>

            {alerts.length > 0 && (
              <div className="mb-3">
                <div className={`text-[10px] uppercase tracking-widest ${txt3} mb-2`}>Active ({alerts.length})</div>
                {alerts.map((a, i) => (
                  <div key={i} className="rounded-xl p-2.5 mb-1.5 border border-orange-500/30 bg-orange-500/10">
                    <div className="text-xs font-semibold text-orange-400">{a.title}</div>
                    <div className={`text-[11px] mt-0.5 ${txt3}`}>{a.body}</div>
                  </div>
                ))}
              </div>
            )}

            {enabled && permission === 'granted' && (
              <button onClick={handleTest}
                className={`w-full py-2 rounded-xl text-xs border transition-colors
                  ${dark ? 'border-ink-600 text-ink-300 hover:border-amber-500' : 'border-gray-200 text-gray-500 hover:border-amber-400'}`}>
                📬 Send Test Notification
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
