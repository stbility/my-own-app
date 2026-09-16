import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  CalendarCheck2,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Timer,
  Tag,
  Clock,
} from 'lucide-react';

export const DailyPlanView: React.FC = () => {
  const {
    data,
    addBigThree,
    toggleBigThree,
    deleteBigThree,
    addDailyTask,
    toggleDailyTask,
    deleteDailyTask,
    updatePomodoro,
    showToast,
  } = useApp();

  const [newB3Input, setNewB3Input] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('09:30 - 10:30');
  const [newTaskCategory, setNewTaskCategory] = useState<'work' | 'life' | 'health' | 'learning'>('work');
  const [activeSlotFilter, setActiveSlotFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  // Pomodoro state handling
  const pomodoro = data.pomodoro;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (pomodoro.isRunning && pomodoro.timeLeftSeconds > 0) {
      interval = setInterval(() => {
        updatePomodoro({ timeLeftSeconds: pomodoro.timeLeftSeconds - 1 });
      }, 1000);
    } else if (pomodoro.isRunning && pomodoro.timeLeftSeconds <= 0) {
      // Switch mode
      const nextMode = pomodoro.mode === 'work' ? 'break' : 'work';
      const nextSeconds = (nextMode === 'work' ? pomodoro.workMinutes : pomodoro.breakMinutes) * 60;
      updatePomodoro({
        mode: nextMode,
        timeLeftSeconds: nextSeconds,
        isRunning: false,
      });
      showToast(nextMode === 'break' ? '专注完成！休息一下吧 ☕' : '休息结束，开始下一个专注时段 🎯');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoro.isRunning, pomodoro.timeLeftSeconds, pomodoro.mode, pomodoro.workMinutes, pomodoro.breakMinutes, updatePomodoro, showToast]);

  const togglePomodoroRunning = () => {
    updatePomodoro({ isRunning: !pomodoro.isRunning });
  };

  const resetPomodoro = () => {
    const totalSec = (pomodoro.mode === 'work' ? pomodoro.workMinutes : pomodoro.breakMinutes) * 60;
    updatePomodoro({ isRunning: false, timeLeftSeconds: totalSec });
  };

  const switchPomodoroMode = (mode: 'work' | 'break') => {
    const totalSec = (mode === 'work' ? pomodoro.workMinutes : pomodoro.breakMinutes) * 60;
    updatePomodoro({ mode, timeLeftSeconds: totalSec, isRunning: false });
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleAddBigThree = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newB3Input.trim()) return;
    addBigThree(newB3Input.trim());
    setNewB3Input('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addDailyTask({
      title: newTaskTitle.trim(),
      timeSlot: newTaskTime,
      category: newTaskCategory,
      done: false,
    });
    setNewTaskTitle('');
  };

  // Filter tasks
  const filteredTasks = data.dailyTasks.filter((t) => {
    const slot = t.timeSlot || '';
    if (activeSlotFilter === 'all') return true;
    if (activeSlotFilter === 'morning') return slot.includes('09:') || slot.includes('10:') || slot.includes('11:') || slot.includes('早');
    if (activeSlotFilter === 'afternoon') return slot.includes('12:') || slot.includes('13:') || slot.includes('14:') || slot.includes('15:') || slot.includes('16:') || slot.includes('17:') || slot.includes('中') || slot.includes('午');
    if (activeSlotFilter === 'evening') return slot.includes('18:') || slot.includes('19:') || slot.includes('20:') || slot.includes('21:') || slot.includes('22:') || slot.includes('晚');
    return true;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'work':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">工作</span>;
      case 'health':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">健康</span>;
      case 'learning':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">学习</span>;
      case 'life':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">生活</span>;
    }
  };

  const currentModeTotalSeconds = (pomodoro.mode === 'work' ? pomodoro.workMinutes : pomodoro.breakMinutes) * 60;
  const timerPercent = Math.min(100, Math.round(((currentModeTotalSeconds - pomodoro.timeLeftSeconds) / currentModeTotalSeconds) * 100));

  return (
    <div id="daily-plan-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 tracking-tight flex items-center gap-2.5">
            <CalendarCheck2 className="w-6 h-6 text-amber-400" />
            今日计划与专注执行
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            先抓最重要的三件事，再做分时推进；结合专注时钟防止精力耗散
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Big Three & Schedule */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Big 3 Core Focus */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h2 className="text-base font-semibold text-neutral-100">今日核心要事 (Big 3)</h2>
              </div>
              <span className="text-xs text-neutral-500">
                已完成 {data.bigThree.filter((b) => b.done).length} / {data.bigThree.length}
              </span>
            </div>

            {/* List */}
            <div className="divide-y divide-neutral-800/80 my-3">
              {data.bigThree.map((item, idx) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3 group"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    onClick={() => toggleBigThree(item.id)}
                  >
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 shrink-0" />
                    )}
                    <span className="text-xs font-mono font-bold text-amber-500/80 shrink-0">
                      0{idx + 1}
                    </span>
                    <span
                      className={`text-sm leading-relaxed truncate ${
                        item.done ? 'line-through text-neutral-500' : 'text-neutral-200 font-medium'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteBigThree(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 rounded-lg transition-all"
                    title="删除此项"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add B3 */}
            <form onSubmit={handleAddBigThree} className="pt-3 border-t border-neutral-800 flex gap-2">
              <input
                type="text"
                placeholder="添加今日第 1~3 件核心战略要事..."
                value={newB3Input}
                onChange={(e) => setNewB3Input(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!newB3Input.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-semibold text-xs rounded-xl transition-all"
              >
                加入要事
              </button>
            </form>
          </div>

          {/* Section 2: Time Blocks Schedule */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-semibold text-neutral-100">今日时间块日程排期</h2>
              </div>

              {/* Slot Filter */}
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
                {(['all', 'morning', 'afternoon', 'evening'] as const).map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setActiveSlotFilter(slot)}
                    className={`px-2.5 py-1 rounded-lg transition-colors capitalize ${
                      activeSlotFilter === slot
                        ? 'bg-amber-500 text-neutral-950 font-semibold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {slot === 'all' ? '全部时段' : slot === 'morning' ? '早间' : slot === 'afternoon' ? '午后' : '晚间'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks list */}
            <div className="divide-y divide-neutral-800/60 my-3">
              {filteredTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500">
                  当前时段暂无排期，可在下方添加
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="py-3 flex items-center justify-between gap-3 group"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      onClick={() => toggleDailyTask(task.id)}
                    >
                      {task.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 shrink-0" />
                      )}
                      <span className="text-xs font-mono text-amber-400/90 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 shrink-0">
                        {task.timeSlot}
                      </span>
                      <span
                        className={`text-sm truncate ${
                          task.done ? 'line-through text-neutral-500' : 'text-neutral-200 font-medium'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {getCategoryBadge(task.category)}
                      <button
                        onClick={() => deleteDailyTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 rounded-lg transition-all"
                        title="删除日程"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Schedule Task */}
            <form onSubmit={handleAddTask} className="pt-3 border-t border-neutral-800 flex flex-wrap gap-2 items-center">
              <input
                type="text"
                placeholder="时间段 (如 14:00 - 15:30)"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
                className="w-36 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono"
              />
              <input
                type="text"
                placeholder="日程事项描述..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 min-w-48 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
              >
                <option value="work">工作</option>
                <option value="learning">学习</option>
                <option value="health">健康</option>
                <option value="life">生活</option>
              </select>
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-semibold text-xs rounded-xl transition-all inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> 加入日程
              </button>
            </form>
          </div>
        </div>

        {/* Right 4 cols: Pomodoro Focus Timer */}
        <div className="lg:col-span-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center sticky top-22">
            <div className="flex items-center gap-2 mb-4">
              <Timer className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-semibold text-neutral-100">内置专注时钟</h3>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 mb-6 text-xs w-full max-w-xs">
              <button
                onClick={() => switchPomodoroMode('work')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  pomodoro.mode === 'work'
                    ? 'bg-amber-500 text-neutral-950 font-semibold shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                深度专注 (25m)
              </button>
              <button
                onClick={() => switchPomodoroMode('break')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  pomodoro.mode === 'break'
                    ? 'bg-emerald-500 text-neutral-950 font-semibold shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                小憩放松 (5m)
              </button>
            </div>

            {/* Circular Timer Visual */}
            <div className="relative w-48 h-48 flex items-center justify-center my-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-neutral-800"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`transition-all duration-300 ${
                    pomodoro.mode === 'work' ? 'stroke-amber-400' : 'stroke-emerald-400'
                  }`}
                  strokeWidth="5"
                  strokeDasharray={`${(timerPercent / 100) * 264}, 264`}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-mono font-bold tracking-tight text-neutral-100">
                  {formatSeconds(pomodoro.timeLeftSeconds)}
                </span>
                <span className="text-[11px] text-neutral-400 mt-1 uppercase tracking-wider font-semibold">
                  {pomodoro.isRunning ? (pomodoro.mode === 'work' ? '专注进行中' : '休息中') : '已暂停'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-6">
              <button
                id="pomodoro-toggle-btn"
                onClick={togglePomodoroRunning}
                className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-md ${
                  pomodoro.isRunning
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700'
                    : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                }`}
              >
                {pomodoro.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                {pomodoro.isRunning ? '暂停计时' : '开始专注'}
              </button>
              <button
                id="pomodoro-reset-btn"
                onClick={resetPomodoro}
                className="p-2.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-xl border border-neutral-800 transition-colors"
                title="重置当前时段"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-neutral-500 mt-5 leading-relaxed max-w-xs">
              纯本地轻量计时，无外部弹窗干扰；伴随任务打卡，随时保持心流。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
