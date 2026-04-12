import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchWeather, fetchAirQuality } from './api/index.js';
import { getWeatherBackground } from './utils/background.js';
import usePullToRefresh from './hooks/usePullToRefresh.js';
import useSwipeGesture  from './hooks/useSwipeGesture.js';
import { saveCache, loadCache, useOnlineStatus } from './hooks/useOfflineCache.js';
import { onAuthChange } from './firebase.js';

import LoginScreen    from './components/LoginScreen.jsx';
import UserMenu       from './components/UserMenu.jsx';
import OfflineBanner  from './components/OfflineBanner.jsx';
import SunTimeline    from './components/SunTimeline.jsx';
import SearchBar      from './components/SearchBar.jsx';
import CurrentWeather from './components/CurrentWeather.jsx';
import HourlyForecast from './components/HourlyForecast.jsx';
import DailyForecast  from './components/DailyForecast.jsx';
import AirQuality     from './components/AirQuality.jsx';
import AQIChart       from './components/AQIChart.jsx';
import WeatherMap     from './components/WeatherMap.jsx';
import TempChart      from './components/TempChart.jsx';
import WhatToWear     from './components/WhatToWear.jsx';
import UVIndex        from './components/UVIndex.jsx';
import Sparklines     from './components/Sparklines.jsx';
import FavouriteCities, { useFavourites } from './components/FavouriteCities.jsx';
import WeatherCanvas  from './components/WeatherCanvas.jsx';
import WeatherRadar   from './components/WeatherRadar.jsx';
import WeatherHeatmap from './components/WeatherHeatmap.jsx';
import PollenIndex    from './components/PollenIndex.jsx';
import NotificationPanel from './components/NotificationPanel.jsx';
import LanguageSelector  from './components/LanguageSelector.jsx';
import OceanConditions   from './components/OceanConditions.jsx';
import LiveClock         from './components/LiveClock.jsx';
import DailySummary      from './components/DailySummary.jsx';
import { SkeletonCurrentWeather, SkeletonHourly, SkeletonChart, SkeletonCard } from './components/Skeleton.jsx';

const DEFAULT = { lat: 19.076, lon: 72.877, name: 'Mumbai' };
const TAB_IDS = ['hourly','daily','chart','uv','sun','trends','wear','air','aqi','pollen','ocean','heatmap','radar'];

export default function App() {
  const { t } = useTranslation();
  const online = useOnlineStatus();

  // ── Auth ──
  const [user,        setUser]        = useState(undefined); // undefined = loading
  const [authChecked, setAuthChecked] = useState(false);

  // ── UI state ──
  const [dark,    setDark]    = useState(true);
  const [unit,    setUnit]    = useState('C');
  const [tabIdx,  setTabIdx]  = useState(0);
  const [showMap, setShowMap] = useState(false);

  // ── Weather state ──
  const [weather,    setWeather]    = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [location,   setLocation]   = useState(DEFAULT);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [cacheTime,  setCacheTime]  = useState(null);

  // ── GPS state ──
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError,   setGpsError]   = useState(null);

  const lastLocRef = useRef(DEFAULT);
  const { favourites, recent, addFavourite, removeFavourite, isFavourite, addRecent } = useFavourites();
  const tab = TAB_IDS[tabIdx];

  // ── Listen to Firebase auth state ──
  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  // ── Sync dark mode ──
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // ── Load weather data ──
  const loadData = useCallback(async (lat, lon, name, silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    // If offline, try cache first
    if (!navigator.onLine) {
      const cached = loadCache();
      if (cached) {
        setWeather(cached.weather);
        setAirQuality(cached.airQuality);
        setLocation(cached.meta.location || { lat, lon, name });
        setCacheTime(cached.meta.timestamp);
        if (!silent) setLoading(false);
        return;
      }
      setError('No internet connection and no cached data available.');
      if (!silent) setLoading(false);
      return;
    }

    try {
      const [wx, aq] = await Promise.all([
        fetchWeather(lat, lon),
        fetchAirQuality(lat, lon),
      ]);
      const loc = { lat, lon, name };
      setWeather(wx);
      setAirQuality(aq);
      setLocation(loc);
      lastLocRef.current = loc;
      addRecent(loc);

      // Save to cache
      const now = Date.now();
      saveCache(wx, aq, loc);
      setCacheTime(now);
    } catch (_) {
      // Try cache on network failure
      const cached = loadCache();
      if (cached) {
        setWeather(cached.weather);
        setAirQuality(cached.airQuality);
        setLocation(cached.meta.location || { lat, lon, name });
        setCacheTime(cached.meta.timestamp);
        setError('Could not refresh — showing cached data.');
      } else {
        setError('Failed to load weather. Check your connection.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [addRecent]);

  // Load on mount (try cache instantly, then fetch)
  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setWeather(cached.weather);
      setAirQuality(cached.airQuality);
      if (cached.meta?.location) {
        setLocation(cached.meta.location);
        lastLocRef.current = cached.meta.location;
      }
      setCacheTime(cached.meta.timestamp);
    }
    loadData(DEFAULT.lat, DEFAULT.lon, DEFAULT.name);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pull to refresh ──
  const handleRefresh = useCallback(async () => {
    const { lat, lon, name } = lastLocRef.current;
    await loadData(lat, lon, name, true);
  }, [loadData]);

  const { pulling, refreshing } = usePullToRefresh(handleRefresh, true);

  // ── Swipe between tabs ──
  const swipe = useSwipeGesture(
    () => setTabIdx(i => Math.min(i + 1, TAB_IDS.length - 1)),
    () => setTabIdx(i => Math.max(i - 1, 0)),
  );

  // ── GPS ──
  const handleGPS = () => {
    if (!navigator.geolocation) { setGpsError('Geolocation not supported.'); return; }
    setGpsLoading(true); setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const d    = await res.json();
          const a    = d.address || {};
          const name = a.city || a.town || a.village || a.county || 'My Location';
          loadData(lat, lon, name);
        } catch (_) {
          loadData(lat, lon, 'My Location');
        }
        setGpsLoading(false);
      },
      () => { setGpsError('Location access denied.'); setGpsLoading(false); },
      { timeout: 10000 }
    );
  };

  const handleFavToggle = () => {
    if (isFavourite(location.name)) removeFavourite(location.name);
    else addFavourite(location);
  };

  // ── Theme ──
  const txt3 = dark ? 'text-ink-400' : 'text-gray-400';
  const card = dark ? 'bg-ink-800 border border-ink-600' : 'bg-white border border-gray-200';
  const btn  = 'px-2.5 sm:px-3 py-2 rounded-full text-xs font-semibold border transition-colors';
  const btnN = dark
    ? 'border-ink-600 text-ink-300 hover:border-amber-500 hover:text-amber-400'
    : 'border-gray-300 text-gray-500 hover:text-amber-600';

  const bgStyle = weather
    ? { background: getWeatherBackground(weather.current.weather_code, dark) }
    : {};

  const tabs = [
    { id: 'hourly',  label: t('hourly')      },
    { id: 'daily',   label: t('daily')       },
    { id: 'chart',   label: t('temp')        },
    { id: 'uv',      label: t('uvIndex')     },
    { id: 'sun',     label: '🌅 Sun'         },
    { id: 'trends',  label: t('trends')      },
    { id: 'wear',    label: t('wear')        },
    { id: 'air',     label: t('airQuality')  },
    { id: 'aqi',     label: t('aqiChart')    },
    { id: 'pollen',  label: t('pollen')      },
    { id: 'ocean',   label: '🌊 Ocean'       },
    { id: 'heatmap', label: t('heatmap')     },
    { id: 'radar',   label: t('radar')       },
  ];

  const showSkeleton = loading && !weather;

  // ── Auth loading splash ──
  if (!authChecked) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-ink-950' : 'bg-gray-100'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="font-display text-4xl text-amber-400 tracking-widest">⛅ SKYCAST</div>
          <div className="w-8 h-8 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // ── Login screen ──
  if (!user) {
    return <LoginScreen dark={dark} onLogin={(u) => setUser(u)} />;
  }

  // ── Main app ──
  return (
    <div
      className={`min-h-screen font-body transition-all duration-700 relative ${dark ? 'text-ink-100' : 'text-gray-900'}`}
      style={bgStyle}
    >
      {/* Animated weather particles */}
      {weather && <WeatherCanvas weatherCode={weather.current.weather_code} dark={dark} />}

      <div className="relative z-10">
        {/* Pull-to-refresh indicator */}
        <div className={`ptr-indicator ${(pulling || refreshing) ? 'visible' : ''}`}>
          {refreshing
            ? <><span className="ptr-spinner" /> {t('updating')}</>
            : <><span>↓</span> {t('releaseRefresh')}</>}
        </div>

        <div className="max-w-screen-xl mx-auto px-3 sm:px-4 pb-12">

          {/* ── HEADER ── */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-4 sm:py-5">
            <span className="font-display text-xl sm:text-2xl tracking-widest text-amber-400 shrink-0">
              ⛅ {t('appName')}
            </span>

            <SearchBar dark={dark} onSelect={(lat, lon, name) => loadData(lat, lon, name)} />

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
              {/* GPS */}
              <button onClick={handleGPS} disabled={gpsLoading} className={`${btn} ${btnN} disabled:opacity-50`}>
                {gpsLoading ? '⏳' : '📍'}
                <span className="hidden sm:inline"> {gpsLoading ? t('locating') : t('myLocation')}</span>
              </button>

              {/* °C / °F */}
              <div className={`flex rounded-full overflow-hidden border text-xs font-semibold ${dark ? 'border-ink-600' : 'border-gray-300'}`}>
                {['C','F'].map(u => (
                  <button key={u} onClick={() => setUnit(u)}
                    className={`px-2.5 sm:px-3 py-2 transition-colors
                      ${unit === u ? 'bg-amber-500 text-black'
                        : dark ? 'text-ink-300 hover:text-amber-400' : 'text-gray-500 hover:text-amber-600'}`}>
                    °{u}
                  </button>
                ))}
              </div>

              {/* Map */}
              <button onClick={() => setShowMap(v => !v)}
                className={`${btn} ${showMap ? 'bg-amber-500 text-black border-amber-500' : btnN}`}>
                🗺️<span className="hidden sm:inline"> {t('map')}</span>
              </button>

              {/* Language */}
              <LanguageSelector dark={dark} />

              {/* Alerts */}
              {weather && (
                <NotificationPanel weather={weather} airQuality={airQuality} location={location} dark={dark} />
              )}

              {/* Dark / Light */}
              <button onClick={() => setDark(d => !d)} className={`${btn} ${btnN}`}>
                {dark ? '☀️' : '🌙'}
                <span className="hidden sm:inline"> {dark ? t('light') : t('dark')}</span>
              </button>

              {/* User avatar + menu (replaces install button) */}
              <UserMenu user={user} dark={dark} />
            </div>
          </div>

          {/* ── OFFLINE BANNER ── */}
          <OfflineBanner
            online={online}
            cacheTimestamp={cacheTime}
            onRetry={() => { const { lat, lon, name } = lastLocRef.current; loadData(lat, lon, name); }}
            loading={loading}
            dark={dark}
          />

          {/* ── GPS ERROR ── */}
          {gpsError && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-900/30 border border-orange-700 text-orange-400 text-xs mb-3">
              📍 {gpsError}
              <button onClick={() => setGpsError(null)} className="ml-auto">✕</button>
            </div>
          )}

          {/* ── WEATHER ERROR ── */}
          {error && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-900/30 border border-red-700 text-red-400 text-sm mb-4">
              ⚠️ {error}
              <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
            </div>
          )}

          {/* ── SKELETON ── */}
          {showSkeleton && (
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-3 sm:gap-4">
              <SkeletonCurrentWeather dark={dark} />
              <div className="flex flex-col gap-3">
                <SkeletonHourly dark={dark} />
                <SkeletonChart  dark={dark} />
                <SkeletonCard   dark={dark} rows={2} cols={3} />
              </div>
            </div>
          )}

          {/* ── INLINE UPDATING ── */}
          {loading && weather && (
            <div className="flex items-center gap-2 text-xs text-amber-400 mb-3">
              <div className="w-3 h-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
              {t('updating')}
            </div>
          )}

          {/* ── FAVOURITES STRIP ── */}
          {!showSkeleton && (favourites.length > 0 || recent.length > 0) && (
            <div className="mb-3 sm:mb-4">
              <FavouriteCities
                dark={dark} favourites={favourites} recent={recent}
                isFavourite={isFavourite} currentLocation={location.name}
                onSelect={(lat, lon, name) => loadData(lat, lon, name)}
                onRemove={removeFavourite}
              />
            </div>
          )}

          {/* ── MAIN GRID ── */}
          {!showSkeleton && weather && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[340px_1fr] gap-3 sm:gap-4">

                {/* LEFT */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <LiveClock weather={weather} dark={dark} />
                    <button onClick={handleFavToggle}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                        ${isFavourite(location.name)
                          ? 'bg-amber-500 text-black border-amber-500'
                          : dark ? 'border-ink-600 text-ink-400 hover:border-amber-500 hover:text-amber-400'
                                 : 'border-gray-300 text-gray-400 hover:text-amber-500'}`}>
                      {isFavourite(location.name) ? `⭐ ${t('saved')}` : `☆ ${t('saveCity')}`}
                    </button>
                  </div>
                  <CurrentWeather weather={weather} location={location} unit={unit} dark={dark} />
                </div>

                {/* RIGHT */}
                <div className="flex flex-col gap-3 sm:gap-4 min-w-0" {...swipe}>
                  {/* Tab bar */}
                  <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 tab-scroll">
                    {tabs.map((t2, i) => (
                      <button key={t2.id} onClick={() => setTabIdx(i)}
                        className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap
                          ${tabIdx === i
                            ? 'bg-amber-500 text-black shadow-glow'
                            : dark ? 'bg-ink-800 border border-ink-600 text-ink-300 hover:text-amber-400'
                                   : 'bg-white border border-gray-200 text-gray-500 hover:text-amber-600'}`}>
                        {t2.label}
                      </button>
                    ))}
                  </div>

                  <p className={`text-[10px] text-center sm:hidden ${txt3}`}>← Swipe to switch tabs →</p>

                  {/* Tab panels */}
                  {tab === 'hourly'  && <HourlyForecast weather={weather} unit={unit} dark={dark} />}
                  {tab === 'daily'   && <DailyForecast  weather={weather} unit={unit} dark={dark} />}
                  {tab === 'chart'   && <TempChart       weather={weather} unit={unit} dark={dark} />}
                  {tab === 'uv'      && <UVIndex         weather={weather} dark={dark} />}
                  {tab === 'sun'     && <SunTimeline     weather={weather} dark={dark} />}
                  {tab === 'trends'  && <Sparklines      weather={weather} dark={dark} />}
                  {tab === 'wear'    && <WhatToWear      weather={weather} unit={unit} dark={dark} />}
                  {tab === 'air'     && airQuality && <AirQuality airQuality={airQuality} dark={dark} />}
                  {tab === 'aqi'     && airQuality && <AQIChart   airQuality={airQuality} dark={dark} />}
                  {tab === 'pollen'  && <PollenIndex     location={location} dark={dark} />}
                  {tab === 'ocean'   && <OceanConditions location={location} unit={unit} dark={dark} />}
                  {tab === 'heatmap' && <WeatherHeatmap  location={location} unit={unit} dark={dark} />}
                  {tab === 'radar'   && <WeatherRadar    location={location} dark={dark} />}

                  {/* Map */}
                  {showMap && (
                    <div className={`rounded-2xl overflow-hidden shadow-card ${card}`}>
                      <div className="px-4 sm:px-5 pt-3 pb-2 text-[10px] uppercase tracking-widest font-semibold text-amber-500">
                        🗺️ {t('clickMap')}
                      </div>
                      <WeatherMap lat={location.lat} lon={location.lon} dark={dark}
                        onLocationSelect={(lat, lon, name) => loadData(lat, lon, name)} />
                    </div>
                  )}
                </div>
              </div>

              {/* Daily briefing */}
              <DailySummary weather={weather} unit={unit} dark={dark} />
            </>
          )}

        </div>
      </div>
    </div>
  );
}
