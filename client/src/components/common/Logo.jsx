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
      <img
        src="/workzen-logo.png"
        alt={showWordmark ? '' : 'Workzen'}
        aria-hidden={showWordmark ? 'true' : undefined}
        className="shrink-0 object-contain"
        style={{ width: icon * 1.5, height: icon }}
      />

      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-extrabold tracking-tight font-display ${text} ${
              theme === 'light' ? 'text-white' : 'text-slate-900'
            }`}
          >
            Work<span className={theme === 'light' ? 'text-[#c8de69]' : 'text-indigo-600'}>zen</span>
          </span>
          <span
            className={`font-medium uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'} ${sub} mt-0.5`}
          >
            Workforce • Balance
          </span>
        </div>
      )}
    </div>
  );
};
