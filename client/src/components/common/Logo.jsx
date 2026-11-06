import React from 'react';

export const Logo = ({ size = 'md', showWordmark = true, className = '', theme = 'dark' }) => {
  const sizeMap = {
    sm: { icon: 24, text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 32, text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 42, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 54, text: 'text-3xl', sub: 'text-sm' },
  };

  const { icon, text, sub } = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Zen Clock Symbol */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 shadow-md ring-1 ring-white/10"
        style={{ width: icon + 8, height: icon + 8 }}
      >
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:rotate-12"
        >
          <defs>
            <linearGradient id="zenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <radialGradient id="ambient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient inner aura */}
          <circle cx="50" cy="50" r="42" fill="url(#ambient)" />

          {/* Zen Enso-inspired open circular stroke */}
          <path
            d="M 50,14 A 36,36 0 1,1 22,28"
            stroke="url(#zenGlow)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />

          {/* Calming Mindfulness Accent node */}
          <circle cx="22" cy="28" r="4.5" fill="#38bdf8" />

          {/* Clock Hands: Hour hand pointing upwards (zen focus) & Minute hand pointing to balance */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="30"
            stroke="#f8fafc"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line
            x1="50"
            y1="50"
            x2="68"
            y2="50"
            stroke="#2dd4bf"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Balanced center core */}
          <circle cx="50" cy="50" r="4.5" fill="#ffffff" />
        </svg>
      </div>

      {/* Typography Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-extrabold tracking-tight ${text} ${
              theme === 'light' ? 'text-slate-900' : 'text-slate-900'
            }`}
          >
            Work<span className="text-teal-600">zen</span>
          </span>
          <span
            className={`font-medium uppercase tracking-widest text-slate-400 ${sub} mt-0.5`}
          >
            Workforce • Balance
          </span>
        </div>
      )}
    </div>
  );
};
