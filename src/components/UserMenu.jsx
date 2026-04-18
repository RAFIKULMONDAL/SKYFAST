import { useState } from 'react';
import { signOutUser } from '../firebase.js';

export default function UserMenu({ user, dark }) {
  const [open, setOpen] = useState(false);

  const card    = dark ? 'bg-ink-700 border-ink-600' : 'bg-white border-gray-200';
  const txt2    = dark ? 'text-ink-200' : 'text-gray-700';
  const txt3    = dark ? 'text-ink-400' : 'text-gray-400';

  const handleSignOut = async () => {
    setOpen(false);
    await signOutUser();
  };

  return (
    <div className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-full border transition-colors border-amber-500/50 hover:border-amber-500 pl-1 pr-2 py-1"
        title={user.displayName || user.email}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-black text-xs font-bold">
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
        )}
        <span className={`text-xs font-semibold hidden sm:block max-w-[70px] truncate ${dark ? 'text-ink-200' : 'text-gray-700'}`}>
          {user.displayName?.split(' ')[0] || 'Me'}
        </span>
        <span className={`text-[10px] ${txt3}`}>▾</span>
      </button>

      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      {/* Dropdown — mobile safe, never overflows screen */}
      {open && (
        <div
          className={`z-50 rounded-2xl border shadow-xl overflow-hidden ${card}`}
          style={{
            position: typeof window !== 'undefined' && window.innerWidth < 640 ? 'fixed' : 'absolute',
            width: 'min(220px, calc(100vw - 24px))',
            ...(typeof window !== 'undefined' && window.innerWidth < 640
              ? {
                  top: '70px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  right: 'auto',
                }
              : {
                  top: 'calc(100% + 8px)',
                  right: 0,
                  left: 'auto',
                }
            ),
          }}
        >
          {/* User info */}
          <div className={`px-4 py-3 border-b ${dark ? 'border-ink-600' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold shrink-0">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className={`text-xs font-semibold truncate ${txt2}`}>{user.displayName || 'User'}</div>
                <div className={`text-[10px] truncate ${txt3}`}>{user.email}</div>
              </div>
            </div>
          </div>

          {/* Sign out */}
          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
