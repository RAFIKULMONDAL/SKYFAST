// Returns a CSS background style string based on weather code + time of day
export function getWeatherBackground(weatherCode, dark) {
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 20;
  const isDusk  = (hour >= 18 && hour < 20) || (hour >= 5 && hour < 7);

  if (dark) {
    // Dark mode: subtle dark gradients with colour hints
    if ([95, 96, 99].includes(weatherCode)) {
      // Thunderstorm
      return 'linear-gradient(135deg, #0a0a0f 0%, #0e0e1a 40%, #0f0a0e 100%)';
    }
    if ([61, 63, 65, 80, 81, 82, 51, 53, 55].includes(weatherCode)) {
      // Rain
      return 'linear-gradient(135deg, #080c10 0%, #0a0e16 50%, #080a0c 100%)';
    }
    if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
      // Snow
      return 'linear-gradient(135deg, #0c0c10 0%, #101018 50%, #0e0e12 100%)';
    }
    if ([45, 48].includes(weatherCode)) {
      // Fog
      return 'linear-gradient(135deg, #0c0c0c 0%, #111111 50%, #0e0e0e 100%)';
    }
    if (isNight) {
      // Clear night
      return 'linear-gradient(135deg, #080808 0%, #0a0a12 40%, #080808 100%)';
    }
    if (isDusk) {
      // Dusk/dawn dark
      return 'linear-gradient(135deg, #0e0808 0%, #100c0a 40%, #080808 100%)';
    }
    if ([0, 1].includes(weatherCode)) {
      // Clear day dark
      return 'linear-gradient(135deg, #0a0a08 0%, #0e0e0a 40%, #080808 100%)';
    }
    // Default dark
    return 'linear-gradient(135deg, #080808 0%, #0e0e0e 100%)';
  } else {
    // Light mode: richer colourful gradients
    if ([95, 96, 99].includes(weatherCode)) {
      return 'linear-gradient(135deg, #2d3748 0%, #4a5568 40%, #2d3748 100%)';
    }
    if ([61, 63, 65, 80, 81, 82, 51, 53, 55].includes(weatherCode)) {
      return 'linear-gradient(135deg, #bfdbfe 0%, #dbeafe 50%, #e0e7ff 100%)';
    }
    if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
      return 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 50%, #f8fafc 100%)';
    }
    if ([45, 48].includes(weatherCode)) {
      return 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 50%, #f3f4f6 100%)';
    }
    if (isNight) {
      return 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)';
    }
    if (isDusk) {
      return 'linear-gradient(135deg, #fed7aa 0%, #fde68a 40%, #fca5a5 100%)';
    }
    if ([0, 1].includes(weatherCode)) {
      return 'linear-gradient(135deg, #bfdbfe 0%, #dbeafe 30%, #fef9c3 100%)';
    }
    if ([2, 3].includes(weatherCode)) {
      return 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)';
    }
    return 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)';
  }
}

// Returns animated CSS classes for weather particles/effects
export function getWeatherAccentColor(weatherCode, dark) {
  if ([95, 96, 99].includes(weatherCode)) return dark ? '#818cf8' : '#6366f1'; // purple for storm
  if ([61, 63, 65, 80, 81, 82, 51, 53, 55].includes(weatherCode)) return dark ? '#38bdf8' : '#0284c7'; // blue for rain
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return dark ? '#e2e8f0' : '#94a3b8'; // white for snow
  if ([45, 48].includes(weatherCode)) return dark ? '#9ca3af' : '#6b7280'; // grey for fog
  if ([0, 1].includes(weatherCode)) return dark ? '#fbbf24' : '#f59e0b'; // amber for clear
  return dark ? '#f59e0b' : '#f59e0b'; // default amber
}
