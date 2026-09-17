import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Calendar, Clock, Database, Menu } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    lastSavedText,
    setIsScratchpadOpen,
    activeModule,
    setActiveModule,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [shortDateStr, setShortDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
      const shortStr = `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setCurrentDateStr(dateStr);
      setShortDateStr(shortStr);
      setCurrentTime(timeStr);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 快捷键监听：Alt + N 打开闪念速记
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setIsScratchpadOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsScratchpadOpen]);

  return (
    <header
      id="app-header"
      className="h-16 px-3 sm:px-6 bg-neutral-925/80 backdrop-blur-md border-b border-neutral-800/80 flex items-center justify-between sticky top-0 z-20"
    >
      {/* Left: Mobile Hamburger + Date & Clock */}
      <div className="flex items-center gap-2 sm:gap-5 min-w-0">
        <button
          id="mobile-menu-btn"
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850 rounded-xl md:hidden transition-colors shrink-0"
          title="打开导航菜单"
          aria-label="打开导航菜单"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-neutral-300 min-w-0">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium tracking-tight truncate hidden sm:inline">{currentDateStr}</span>
          <span className="font-medium tracking-tight truncate sm:hidden">{shortDateStr}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 font-mono bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800 shrink-0">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          <span>{currentTime}</span>
        </div>
      </div>

      {/* Right: Storage indicator & Quick Action */}
      <div className="flex items-center gap-1.5 sm:gap-3.5 shrink-0">
        {/* Realtime Save status indicator */}
        <div
          id="storage-sync-badge"
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-emerald-500/20 text-xs text-neutral-300"
          title="所有操作直接持久化于当前浏览器的 LocalStorage，刷新与重启电脑不丢失"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-300 font-medium">本地即时同步</span>
          <span className="text-neutral-400 text-[11px]">|</span>
          <span className="text-neutral-400 text-[11px] truncate max-w-32">{lastSavedText}</span>
        </div>

        {/* Quick scratchpad trigger */}
        <button
          id="open-scratchpad-btn"
          onClick={() => setIsScratchpadOpen(true)}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium text-xs shadow-xs hover:border-amber-500/50 transition-all cursor-pointer group shrink-0"
          title="随时记下突发点子，支持流转 (快捷键: Alt + N)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
          <span className="hidden sm:inline">闪念备忘</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.2 bg-neutral-900/90 text-neutral-400 text-[10px] rounded border border-neutral-700">
            Alt+N
          </kbd>
        </button>

        {/* Theme mode toggle */}
        <ThemeToggle variant="compact" />

        {/* Quick jump to Data/Settings */}
        <button
          id="header-jump-settings-btn"
          onClick={() => setActiveModule('settings')}
          className="p-1.5 sm:p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850 rounded-xl transition-colors shrink-0"
          title="备份与设置"
        >
          <Database className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
