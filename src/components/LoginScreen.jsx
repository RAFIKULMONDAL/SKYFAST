import { useState } from 'react';
import { signInWithGoogle } from '../firebase.js';

export default function LoginScreen({ dark, onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const card = dark
    ? 'bg-ink-800 border border-ink-600'
    : 'bg-white border border-gray-200';
  const txt2 = dark ? 'text-ink-300' : 'text-gray-600';
  const txt3 = dark ? 'text-ink-400' : 'text-gray-400';

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      onLogin(user);
    } catch (err) {
      // User closed popup — not a real error
      if (err.code === 'auth/popup-closed-by-user' ||
          err.code === 'auth/cancelled-popup-request') {
        setLoading(false);
        return;
      }
      // Firebase not configured yet
      if (err.code === 'auth/invalid-api-key' ||
          err.message?.includes('YOUR_API_KEY')) {
        setError('Firebase is not configured yet. Please add your Firebase credentials to src/firebase.js — see the instructions inside that file.');
      } else {
        setError(err.message || 'Sign-in failed. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 font-body
        ${dark ? 'bg-ink-950 text-ink-100' : 'bg-gray-100 text-gray-900'}`}
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="font-display text-6xl text-amber-400 tracking-widest mb-2">
            ⛅ SKYCAST
          </div>
          <p className={`text-sm ${txt3}`}>
            Your personal weather companion
          </p>
        </div>

        {/* Login card */}
        <div className={`rounded-2xl p-8 shadow-card ${card}`}>
          <h2 className="font-display text-2xl tracking-wide text-center mb-2">
            Welcome Back
          </h2>
          <p className={`text-sm text-center mb-8 ${txt2}`}>
            Sign in to sync your favourites, settings and alerts across all your devices.
          </p>

          {/* Google Sign-in button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl
              bg-white text-gray-800 font-semibold text-sm shadow-md
              hover:shadow-lg hover:bg-gray-50 active:scale-[0.98]
              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
              border border-gray-200"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            ) : (
              /* Google logo SVG */
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 33 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.7 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
                <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.7 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.6-3-11.3-7.4l-6.5 5C9.7 39.6 16.3 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.9 2.4-2.5 4.5-4.6 5.9l6.2 5.2C36.8 39 44 33.8 44 24c0-1.3-.1-2.7-.4-3.9z"/>
              </svg>
            )}
            <span>{loading ? 'Signing in…' : 'Continue with Google'}</span>
          </button>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-relaxed">
              ⚠️ {error}
            </div>
          )}

          {/* Features list */}
          <div className={`mt-8 pt-6 border-t ${dark ? 'border-ink-600' : 'border-gray-100'}`}>
            <p className={`text-[10px] uppercase tracking-widest font-semibold mb-3 ${txt3}`}>
              What you get
            </p>
            {[
              { icon: '⭐', text: 'Saved favourite cities synced across devices' },
              { icon: '🔔', text: 'Weather alerts — rain, UV, heat, AQI' },
              { icon: '🌐', text: 'Language & unit preferences saved' },
              { icon: '📴', text: 'Offline mode — view last cached weather' },
            ].map(f => (
              <div key={f.text} className={`flex items-start gap-2.5 py-1.5 text-xs ${txt2}`}>
                <span className="shrink-0">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Theme toggle on login screen */}
        <div className="text-center mt-6">
          <p className={`text-[10px] ${txt3}`}>
            100% free · No credit card · Powered by Open-Meteo
          </p>
        </div>
      </div>
    </div>
  );
}
