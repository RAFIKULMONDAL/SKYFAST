import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY    = 'skycast_weather_cache';
const CACHE_AQ_KEY = 'skycast_aq_cache';
const CACHE_META   = 'skycast_cache_meta';

// Save weather + AQ data to localStorage
export function saveCache(weather, airQuality, location) {
  try {
    localStorage.setItem(CACHE_KEY,    JSON.stringify(weather));
    localStorage.setItem(CACHE_AQ_KEY, JSON.stringify(airQuality));
    localStorage.setItem(CACHE_META,   JSON.stringify({
      timestamp: Date.now(),
      location,
    }));
  } catch (_) {
    // localStorage full — ignore
  }
}

// Load cached data from localStorage
export function loadCache() {
  try {
    const weather    = JSON.parse(localStorage.getItem(CACHE_KEY));
    const airQuality = JSON.parse(localStorage.getItem(CACHE_AQ_KEY));
    const meta       = JSON.parse(localStorage.getItem(CACHE_META));
    if (weather && meta) return { weather, airQuality, meta };
  } catch (_) {}
  return null;
}

// Clear cache
export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_AQ_KEY);
  localStorage.removeItem(CACHE_META);
}

// Format "X minutes ago" / "X hours ago"
export function formatAge(timestamp) {
  if (!timestamp) return null;
  const diffMs  = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)  return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

// Hook: tracks online/offline status
export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline  = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
}
