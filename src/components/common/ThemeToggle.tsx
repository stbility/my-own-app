import React from 'react';
import { useApp } from '../../context/AppContext';
import { ThemeMode } from '../../types';
import { Sun, Moon, Laptop } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'compact', className = '' }) => {
  const { theme, setTheme, resolvedTheme } = useApp();

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      mode: 'system',
      label: '跟随系统',
      icon: <Laptop className="w-3.5 h-3.5 shrink-0" />,
      desc: `根据系统自动切换 (当前: ${resolvedTheme === 'dark' ? '深色' : '浅色'})`,
    },
    {
      mode: 'light',
      label: '浅色',
      icon: <Sun className="w-3.5 h-3.5 shrink-0" />,
      desc: '清爽明亮界面，高对比度护眼',
    },
    {
      mode: 'dark',
      label: '深色',
      icon: <Moon className="w-3.5 h-3.5 shrink-0" />,
      desc: '沉浸暗黑质感，专注不眩目',
    },
  ];

  if (variant === 'full') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
        {options.map((opt) => {
          const isSelected = theme === opt.mode;
          return (
            <button
              key={opt.mode}
              id={`theme-select-${opt.mode}`}
              type="button"
              onClick={() => setTheme(opt.mode)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/40 text-neutral-100 shadow-xs ring-1 ring-amber-500/30'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-2 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                  }`}
                >
                  {opt.icon}
                </div>
                {isSelected && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    当前使用
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-200">{opt.label}</div>
                <div className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{opt.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact segmented control for Header / Toolbar
  return (
    <div
      id="header-theme-toggle"
      className={`inline-flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl text-xs select-none ${className}`}
      role="group"
      aria-label="主题切换"
    >
      {options.map((opt) => {
        const isSelected = theme === opt.mode;
        return (
          <button
            key={opt.mode}
            id={`theme-btn-${opt.mode}`}
            type="button"
            onClick={() => setTheme(opt.mode)}
            title={`${opt.label}模式 (${opt.desc})`}
            className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 rounded-lg font-medium text-xs transition-all cursor-pointer ${
              isSelected
                ? 'bg-neutral-800 text-amber-400 shadow-xs font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/60'
            }`}
          >
            {opt.icon}
            <span className="hidden md:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
