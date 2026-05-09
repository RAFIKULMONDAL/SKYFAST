import { useState, useEffect } from 'react';

export default function LiveClock({ weather, dark }) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  const txt3 = dark ? 'text-ink-400' : 'text-gray-400';

  useEffect(() => {
    if (!weather?.timezone) return;

    const tz = weather.timezone; 

    const tick = () => {
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en', {
          timeZone: tz,
          hour:   '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        const dateStr = now.toLocaleDateString('en', {
          timeZone:  tz,
          weekday:   'short',
          month:     'short',
          day:       'numeric',
        });
        setTime(timeStr);
        setDate(dateStr);
      } catch {
        // Invalid timezone — fallback to local
        setTime(new Date().toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true }));
        setDate(new Date().toLocaleDateString('en', { weekday:'short', month:'short', day:'numeric' }));
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [weather?.timezone]);

  if (!time) return null;

  
  const getOffset = () => {
    try {
      const tz = weather?.timezone;
      if (!tz) return '';
      const now = new Date();
      const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate  = new Date(now.toLocaleString('en-US', { timeZone: tz }));
      const diff    = (tzDate - utcDate) / 60000;
      const sign    = diff >= 0 ? '+' : '-';
      const h       = Math.floor(Math.abs(diff) / 60);
      const m       = Math.abs(diff) % 60;
      return `UTC${sign}${h}${m ? ':' + String(m).padStart(2,'0') : ''}`;
    } catch { return ''; }
  };

  return (
    <div className="flex flex-col items-end shrink-0">
      <div className="font-display text-lg sm:text-xl leading-none text-amber-400 tracking-wider tabular-nums">
        {time}
      </div>
      <div className={`text-[10px] mt-0.5 ${txt3}`}>
        {date} · {getOffset()}
      </div>
    </div>
  );
}
