import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTodayDateString } from '../data/initialData';
import {
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  Sparkles,
  Clapperboard,
  Code2,
  Briefcase,
  Dumbbell,
  UtensilsCrossed,
  Gamepad2,
  Clock,
  Trash2,
  ChevronRight,
  TrendingUp,
  Droplets,
  CalendarCheck2,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    data,
    setActiveModule,
    toggleBigThree,
    addBigThree,
    deleteBigThree,
    toggleDailyTask,
    addDailyTask,
    addQuickNote,
    deleteQuickNote,
    forwardQuickNote,
    addWaterIntake,
  } = useApp();

  const [newBigThreeText, setNewBigThreeText] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('15:00 - 16:00');

  const todayStr = getTodayDateString();
  const todayWater = data.waterRecords[todayStr] || { date: todayStr, currentMl: 0, targetMl: 2000 };
  const waterPercent = Math.min(100, Math.round((todayWater.currentMl / todayWater.targetMl) * 100));

  // Big 3 stats
  const bigThreeTotal = data.bigThree.length;
  const bigThreeDone = data.bigThree.filter((i) => i.done).length;
  const bigThreePercent = bigThreeTotal > 0 ? Math.round((bigThreeDone / bigThreeTotal) * 100) : 0;

  // Active items in modules
  const inProgressContent = data.contents.find((c) => c.stage === 'script' || c.stage === 'production') || data.contents[0];
  const activeDevIssues = data.devIssues.filter((i) => i.status !== 'resolved');
  const criticalIssue = activeDevIssues.find((i) => i.severity === 'P0') || activeDevIssues[0];
  const activeClient = data.consultingClients.find((c) => c.stage === 'active') || data.consultingClients[0];
  const todayWorkout = data.workouts.find((w) => w.date === todayStr) || data.workouts[0];
  const playingGame = data.games.find((g) => g.status === 'playing') || data.games[0];

  const handleAddBigThree = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBigThreeText.trim()) return;
    addBigThree(newBigThreeText);
    setNewBigThreeText('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addQuickNote(newNoteText);
    setNewNoteText('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addDailyTask({
      title: newTaskTitle.trim(),
      timeSlot: newTaskTime,
      category: 'work',
      done: false,
    });
    setNewTaskTitle('');
  };

  return (
    <div id="dashboard-view" className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner & Big 3 Focus */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-850 border border-neutral-800/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>今日作战中枢 · 状态在线</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">
              专注当下，掌控你的专属工作与生活节奏
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              今日核心要事已完成 <span className="text-amber-400 font-semibold">{bigThreeDone}</span> / {bigThreeTotal} 项 ({bigThreePercent}%)
            </p>
          </div>

          {/* Big 3 Progress Ring */}
          <div className="flex items-center gap-4 bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/80">
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="stroke-neutral-800"
                  strokeWidth="3.5"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="stroke-amber-400 transition-all duration-500 ease-out"
                  strokeWidth="3.5"
                  strokeDasharray={`${bigThreePercent}, 100`}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="absolute text-xs font-bold text-amber-400 font-mono">
                {bigThreePercent}%
              </span>
            </div>
            <div className="text-xs">
              <div className="font-semibold text-neutral-200">三大核心要事</div>
              <div className="text-neutral-500 mt-0.5">每日最关键产出</div>
              <button
                onClick={() => setActiveModule('daily')}
                className="mt-1 text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 transition-colors"
              >
                进入今日计划 <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Big 3 Items List */}
        <div className="mt-6 pt-5 border-t border-neutral-800/80 grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.bigThree.map((item, idx) => (
            <div
              key={item.id}
              id={`b3-card-${item.id}`}
              onClick={() => toggleBigThree(item.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                item.done
                  ? 'bg-neutral-950/40 border-neutral-800/60 opacity-60'
                  : 'bg-neutral-900/90 border-neutral-700/70 hover:border-amber-500/50 hover:bg-neutral-850'
              }`}
            >
              <div className="mt-0.5 text-neutral-400">
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-neutral-500 hover:text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-mono text-amber-500 font-semibold">
                  0{idx + 1}
                </span>
                <p
                  className={`text-xs mt-0.5 leading-relaxed truncate ${
                    item.done ? 'line-through text-neutral-500' : 'text-neutral-200 font-medium'
                  }`}
                >
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Main Dual-Column: Today's Timeline & Quick Scratchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Today's Schedule */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-semibold text-neutral-100">今日日程时间轴</h2>
            </div>
            <button
              onClick={() => setActiveModule('daily')}
              className="text-xs text-neutral-400 hover:text-amber-400 inline-flex items-center gap-1 transition-colors"
            >
              完整规划 <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto my-3 divide-y divide-neutral-800/60 space-y-1">
            {data.dailyTasks.map((task) => (
              <div
                key={task.id}
                id={`dash-task-${task.id}`}
                className="py-2.5 flex items-center justify-between gap-3 group"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 select-none"
                  onClick={() => toggleDailyTask(task.id)}
                >
                  {task.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 shrink-0" />
                  )}
                  <span
                    className={`text-xs truncate ${
                      task.done ? 'line-through text-neutral-500' : 'text-neutral-200 font-medium'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded">
                    {task.timeSlot}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Add Task */}
          <form onSubmit={handleAddTask} className="pt-3 border-t border-neutral-800 flex gap-2">
            <input
              type="text"
              placeholder="快速安排一项今日日程..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-medium text-xs rounded-xl transition-colors shrink-0 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> 添加
            </button>
          </form>
        </div>

        {/* Right 5 cols: Quick Scratchpad */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-semibold text-neutral-100">闪念速记便签</h2>
            </div>
            <span className="text-[11px] text-neutral-500">随手记 · 可一键流转</span>
          </div>

          {/* Quick input */}
          <form onSubmit={handleAddNote} className="my-3 flex gap-2">
            <input
              type="text"
              placeholder="写下灵感碎片..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!newNoteText.trim()}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 text-xs rounded-xl font-medium transition-colors shrink-0"
            >
              记下
            </button>
          </form>

          {/* Notes list */}
          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-60 pr-1">
            {data.quickNotes.slice(0, 4).map((note) => (
              <div
                key={note.id}
                className="p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-xl text-xs space-y-2 hover:border-neutral-700 transition-colors"
              >
                <p className="text-neutral-300 leading-relaxed line-clamp-2">{note.content}</p>
                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <span className="text-neutral-500">{note.createdAt}</span>
                  <div className="flex items-center gap-1.5">
                    {note.forwardedTo ? (
                      <span className="text-neutral-500">已转至{note.forwardedTo === 'content' ? '自媒体' : '开发'}</span>
                    ) : (
                      <>
                        <button
                          onClick={() => forwardQuickNote(note.id, 'content')}
                          className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                          title="流转到自媒体"
                        >
                          转自媒体
                        </button>
                        <button
                          onClick={() => forwardQuickNote(note.id, 'dev')}
                          className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                          title="流转到开发"
                        >
                          转开发
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteQuickNote(note.id)}
                      className="text-neutral-500 hover:text-rose-400 p-0.5"
                      title="删除便签"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 6 Glance Cards Matrix (Module Digests with Direct Jump) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-200 tracking-tight">各模块工作生活动态摘要</h2>
          <span className="text-xs text-neutral-500">点击卡片直达专属工作台</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Content */}
          <div
            id="glance-card-content"
            onClick={() => setActiveModule('content')}
            className="p-4 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-rose-400">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <Clapperboard className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">自媒体创作</span>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {data.contents.filter((c) => c.stage !== 'published').length} 篇在制
                </span>
              </div>
              <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                {inProgressContent ? inProgressContent.title : '暂无进行中内容'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                {inProgressContent?.outlineNotes || '点击进入规划下一期选题与脚本制作'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 group-hover:text-neutral-300">
              <span>进入创作看板</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Dev Work */}
          <div
            id="glance-card-dev"
            onClick={() => setActiveModule('dev')}
            className="p-4 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">开发工作</span>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {activeDevIssues.length} 个未解问题
                </span>
              </div>
              <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                {criticalIssue ? criticalIssue.title : '所有需求与Bug已清空'}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                {criticalIssue && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      criticalIssue.severity === 'P0'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {criticalIssue.severity}
                  </span>
                )}
                <span className="text-xs text-neutral-400 truncate">
                  工程: {data.devProjects[0]?.name || '未命名'}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 group-hover:text-neutral-300">
              <span>查看代码库与Snippets</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Consulting */}
          <div
            id="glance-card-consulting"
            onClick={() => setActiveModule('consulting')}
            className="p-4 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">咨询业务</span>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {data.consultingClients.length} 位档案客户
                </span>
              </div>
              <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                {activeClient ? `${activeClient.name} (${activeClient.company})` : '暂无活跃客户'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                {activeClient?.notes || '点击进入管理咨询纪要与交付物清单'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 group-hover:text-neutral-300">
              <span>查看客户纪要与工时</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Fitness */}
          <div
            id="glance-card-fitness"
            onClick={() => setActiveModule('fitness')}
            className="p-4 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">健身计划</span>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {todayWorkout?.splitType || '暂无训练'}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                {todayWorkout ? `今日排期: ${todayWorkout.splitType}` : '今日暂无训练记录'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                {todayWorkout
                  ? `已规划 ${todayWorkout.exercises.length} 个动作，体重记录: ${todayWorkout.bodyWeightKg} kg`
                  : '点击进入开始规划今日动作与组数打卡'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 group-hover:text-neutral-300">
              <span>记录负重与组数</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Diet & Water */}
          <div
            id="glance-card-diet"
            onClick={() => setActiveModule('diet')}
            className="p-4 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sky-400">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">饮食与饮水</span>
                </div>
                <span className="text-[11px] text-sky-400 font-mono font-semibold">
                  {todayWater.currentMl} / {todayWater.targetMl} ml
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300 font-medium">今日饮水达成</span>
                  <span className="text-neutral-400 font-mono">{waterPercent}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 transition-all duration-300 rounded-full"
                    style={{ width: `${waterPercent}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 group-hover:text-neutral-300">
              <span>点此打卡三餐标签</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Gaming */}
          <div
            id="glance-card-gaming"
            onClick={() => setActiveModule('gaming')}
            className="p-4 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-purple-400">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">游戏娱乐</span>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {data.games.length} 款在库
                </span>
              </div>
              <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                {playingGame ? playingGame.title : '暂无正在玩的游戏'}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-medium text-neutral-300">
                  {playingGame?.platform || 'PC'}
                </span>
                <span>已沉浸 {playingGame?.hoursPlayed || 0} 小时</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 group-hover:text-neutral-300">
              <span>查看游戏心愿与通关评级</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
