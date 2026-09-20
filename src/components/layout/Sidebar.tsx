import React from 'react';
import { useApp } from '../../context/AppContext';
import { ModuleId } from '../../types';
import {
  LayoutDashboard,
  CalendarCheck2,
  Clapperboard,
  Code2,
  Briefcase,
  Dumbbell,
  UtensilsCrossed,
  BookOpen,
  Gamepad2,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { activeModule, setActiveModule, data } = useApp();

  // 动态徽标数量计算
  const dailyPendingCount = data.dailyTasks.filter((t) => !t.done).length;
  const contentPipelineCount = data.contents.filter((c) => c.stage !== 'published').length;
  const devPendingCount = data.devIssues.filter((i) => i.status !== 'resolved').length;
  const devP0Count = data.devIssues.filter((i) => i.status !== 'resolved' && i.severity === 'P0').length;
  const activeClientsCount = data.consultingClients.filter((c) => c.stage === 'active' || c.stage === 'signed').length;
  const gamesPlayingCount = data.games.filter((g) => g.status === 'playing').length;
  const readingBooksCount = (data.books || []).filter((b) => b.status === 'reading').length;

  interface NavItem {
    id: ModuleId;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeHighlight?: boolean;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: '首页总览',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'daily',
      label: '今日计划',
      icon: <CalendarCheck2 className="w-4 h-4 shrink-0" />,
      badge: dailyPendingCount,
    },
    {
      id: 'content',
      label: '自媒体',
      icon: <Clapperboard className="w-4 h-4 shrink-0" />,
      badge: contentPipelineCount,
    },
    {
      id: 'dev',
      label: '开发工作',
      icon: <Code2 className="w-4 h-4 shrink-0" />,
      badge: devPendingCount,
      badgeHighlight: devP0Count > 0,
    },
    {
      id: 'consulting',
      label: '咨询工作',
      icon: <Briefcase className="w-4 h-4 shrink-0" />,
      badge: activeClientsCount,
    },
    {
      id: 'fitness',
      label: '健身计划',
      icon: <Dumbbell className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'diet',
      label: '饮食计划',
      icon: <UtensilsCrossed className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'reading',
      label: '阅读',
      icon: <BookOpen className="w-4 h-4 shrink-0" />,
      badge: readingBooksCount,
    },
    {
      id: 'gaming',
      label: '游戏娱乐',
      icon: <Gamepad2 className="w-4 h-4 shrink-0" />,
      badge: gamesPlayingCount,
    },
    {
      id: 'settings',
      label: '数据与设置',
      icon: <Settings2 className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed md:relative inset-y-0 left-0 z-50 md:z-auto h-screen bg-neutral-925 border-r border-neutral-800/90 flex flex-col transition-all duration-300 select-none ${
          isMobileOpen ? 'translate-x-0 shadow-2xl w-64' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-18' : 'md:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-800/80">
          {!isCollapsed || isMobileOpen ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src="/brand-icon.jpg"
                alt="智一工作台"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-xl object-cover shrink-0 shadow-xs border border-white/10"
              />
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold tracking-wide text-neutral-100 truncate">
                  智一工作台
                </span>
                <span className="text-[10px] text-neutral-400 truncate">
                  本地运行 · 数据自持
                </span>
              </div>
            </div>
          ) : (
            <img
              src="/brand-icon.jpg"
              alt="智一工作台"
              referrerPolicy="no-referrer"
              className="mx-auto w-8 h-8 rounded-xl object-cover shrink-0 shadow-xs border border-white/10"
            />
          )}

          {/* Desktop Toggle Button */}
          <button
            id="toggle-sidebar-btn"
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            title={isCollapsed ? '展开导航 (点击)' : '收起导航 (点击)'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            id="close-mobile-sidebar-btn"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 md:hidden transition-colors"
            title="关闭菜单"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  setActiveModule(item.id);
                  onCloseMobile?.();
                }}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/60 border border-transparent'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-colors ${
                    isActive
                      ? 'text-amber-400'
                      : 'text-neutral-400 group-hover:text-neutral-200'
                  }`}
                >
                  {item.icon}
                </div>

                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {(!isCollapsed || isMobileOpen) && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      item.badgeHighlight
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                        : isActive
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {isCollapsed && !isMobileOpen && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute right-2 top-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-neutral-900" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info & Local status */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/30">
          {!isCollapsed || isMobileOpen ? (
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>本地沙盒储存</span>
              </div>
              <span className="font-mono text-[10px] text-neutral-400">V1.0</span>
            </div>
          ) : (
            <div className="flex justify-center" title="纯本地持久化">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
