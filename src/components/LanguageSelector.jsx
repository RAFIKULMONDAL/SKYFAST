import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/index.js';

export default function LanguageSelector({ dark }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const card    = dark ? 'bg-ink-700 border-ink-600' : 'bg-white border-gray-200';
  const itemHov = dark ? 'hover:bg-ink-600 text-ink-200' : 'hover:bg-gray-50 text-gray-700';
  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('skycast_lang', code);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`px-2.5 sm:px-3 py-2 rounded-full text-xs font-semibold border transition-colors
          ${open
            ? 'bg-amber-500 text-black border-amber-500'
            : dark
              ? 'border-ink-600 text-ink-300 hover:border-amber-500 hover:text-amber-400'
              : 'border-gray-300 text-gray-500 hover:text-amber-600'}`}
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline ml-1">{current.label}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute top-full mt-2 rounded-xl border shadow-xl z-50 overflow-hidden
              right-0 w-40 ${card}`}
            dir="ltr"
          >
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors text-left
                  ${i18n.language === lang.code ? 'text-amber-400 font-semibold' : itemHov}`}
              >
                <span className="text-base shrink-0">{lang.flag}</span>
                <span className="flex-1">{lang.label}</span>
                {i18n.language === lang.code && (
                  <span className="ml-auto text-amber-400 shrink-0">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
