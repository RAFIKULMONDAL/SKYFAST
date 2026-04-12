// Animated CSS weather icons — no external library
export default function WeatherIcon({ code, size = 'md' }) {
  const scale = size === 'lg' ? 1.4 : size === 'sm' ? 0.65 : 1;
  const style = { transform: `scale(${scale})`, transformOrigin: 'center', display: 'inline-flex' };

  // Night check
  const h = new Date().getHours();
  const isNight = h < 6 || h >= 20;

  // Clear
  if (code === 0 || code === 1) {
    if (isNight) return (
      <span style={style} className="wx-icon">
        <span className="wx-moon"><span className="moon-body" /></span>
      </span>
    );
    return (
      <span style={style} className="wx-icon">
        <span className="wx-sun">
          <span className="sun-rays">
            {[...Array(8)].map((_, i) => <span key={i} className="ray" />)}
          </span>
          <span className="sun-core" />
        </span>
      </span>
    );
  }

  // Partly cloudy
  if (code === 2) return (
    <span style={style} className="wx-icon">
      <span className="wx-partly">
        <span className="mini-sun" />
        <span className="front-cloud" />
      </span>
    </span>
  );

  // Overcast
  if (code === 3) return (
    <span style={style} className="wx-icon">
      <span className="wx-cloud"><span className="cloud-body" /></span>
    </span>
  );

  // Fog
  if (code === 45 || code === 48) return (
    <span style={style} className="wx-icon">
      <span className="wx-fog">
        <span className="fog-line" /><span className="fog-line" />
        <span className="fog-line" /><span className="fog-line" />
      </span>
    </span>
  );

  // Drizzle / Rain
  if ([51,53,55,61,63,65,80,81,82].includes(code)) return (
    <span style={style} className="wx-icon">
      <span className="wx-rain">
        <span className="rain-cloud" />
        <span className="drop" /><span className="drop" />
        <span className="drop" /><span className="drop" />
      </span>
    </span>
  );

  // Snow
  if ([71,73,75,77,85,86].includes(code)) return (
    <span style={style} className="wx-icon">
      <span className="wx-snow">
        <span className="snow-cloud" />
        <span className="flake">❄</span>
        <span className="flake">❄</span>
        <span className="flake">❄</span>
      </span>
    </span>
  );

  // Thunderstorm
  if ([95,96,99].includes(code)) return (
    <span style={style} className="wx-icon">
      <span className="wx-thunder">
        <span className="t-cloud" />
        <span className="bolt">⚡</span>
      </span>
    </span>
  );

  // Fallback emoji
  const fallbacks = { 0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',51:'🌦️',61:'🌧️',71:'❄️',95:'⛈️' };
  return <span style={{ fontSize: size === 'lg' ? '3rem' : size === 'sm' ? '1.2rem' : '2rem' }}>
    {fallbacks[code] || '🌡️'}
  </span>;
}
