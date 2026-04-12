import { useState } from 'react';
import { signOutUser } from '../firebase.js';

export default function UserMenu({ user, dark }) {
  const [open, setOpen] = useState(false);

  const card    = dark ? 'bg-ink-700 border-ink-600' : 'bg-white border-gray-200';
  const txt2    = dark ? 'text-ink-200' : 'text-gray-700';
  const txt3    = dark ? 'text-ink-400' : 'text-gray-400';
  const itemHov = dark ? 'hover:bg-ink-600' : 'hover:bg-gray-50';

  const handleSignOut = async () => {
    setOpen(false);
    await signOutUser();
  };

  return (
    <div className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-full border transition-colors
          border-amber-500/50 hover:border-amber-500 pl-1 pr-2.5 py-1"
        title={user.displayName || user.email}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-6 h-6 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-black text-xs font-bold">
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
        )}
        <span className={`text-xs font-semibold hidden sm:block max-w-[80px] truncate ${dark ? 'text-ink-200' : 'text-gray-700'}`}>
          {user.displayName?.split(' ')[0] || 'Me'}
        </span>
        <span className={`text-[10px] ${txt3}`}>▾</span>
      </button>

      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      {/* Dropdown */}
      {open && (
        <div className={`absolute right-0 top-full mt-2 w-56 rounded-2xl border shadow-xl z-50 overflow-hidden ${card}`}>
          {/* User info */}
          <div className={`px-4 py-3 border-b ${dark ? 'border-ink-600' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className={`text-xs font-semibold truncate ${txt2}`}>
                  {user.displayName || 'User'}
                </div>
                <div className={`text-[10px] truncate ${txt3}`}>
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <div className={`px-4 py-2 text-[10px] uppercase tracking-widest font-semibold ${txt3}`}>
              Account
            </div>
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left`}
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
