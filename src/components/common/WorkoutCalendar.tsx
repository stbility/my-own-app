import React, { useState } from 'react';
import { WorkoutLog, DietLogItem } from '../../types';
import { getTodayDateString } from '../../data/initialData';
import {
  generateCalendarDays,
  summarizeWorkoutDay,
  extractTargetMuscles,
  DayWorkoutSummary,
} from '../../utils/calendarUtils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  CheckCircle2,
  Circle,
  UtensilsCrossed,
  Flame,
  Activity,
  Award,
  Layers,
  Repeat,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface WorkoutCalendarProps {
  workouts: WorkoutLog[];
  dietLogs?: DietLogItem[];
  currentModule: 'fitness' | 'diet';
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  onNavigateToWorkout?: (date: string) => void;
  onDeleteWorkout?: (id: string) => void;
}

export const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({
  workouts,
  dietLogs = [],
  currentModule,
  selectedDate: initialSelectedDate,
  onSelectDate,
  onNavigateToWorkout,
  onDeleteWorkout,
}) => {
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(initialSelectedDate || todayStr);

  // Month navigation state
  const initialDateObj = new Date(selectedDate || todayStr);
  const [currentYear, setCurrentYear] = useState<number>(
    isNaN(initialDateObj.getFullYear()) ? new Date().getFullYear() : initialDateObj.getFullYear()
  );
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(
    isNaN(initialDateObj.getMonth()) ? new Date().getMonth() : initialDateObj.getMonth()
  );

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonthIndex(11);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonthIndex(0);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonthIndex(today.getMonth());
    setSelectedDate(todayStr);
    onSelectDate?.(todayStr);
  };

  const calendarDays = generateCalendarDays(currentYear, currentMonthIndex, todayStr);

  // Get selected day summary
  const selectedWorkout = workouts.find((w) => w.date === selectedDate);
  const selectedWorkoutSummary = summarizeWorkoutDay(selectedWorkout);

  // Get selected day diet logs
  const selectedDayMeals = dietLogs.filter((m) => m.date === selectedDate);
  const selectedDayTotalCalories = selectedDayMeals.reduce(
    (sum, m) => sum + (m.estimatedCalories || 0),
    0
  );

  // Monthly stats
  const currentMonthWorkouts = workouts.filter((w) => {
    const [y, m] = w.date.split('-');
    return Number(y) === currentYear && Number(m) === currentMonthIndex + 1;
  });

  const monthTrainedDays = currentMonthWorkouts.length;
  const monthTotalReps = currentMonthWorkouts.reduce((acc, w) => {
    return acc + summarizeWorkoutDay(w).completedReps;
  }, 0);

  const getSplitColor = (split?: string) => {
    if (!split) return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    if (split.includes('胸') || split.includes('推')) {
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    }
    if (split.includes('背') || split.includes('拉')) {
      return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    }
    if (split.includes('腿') || split.includes('臀')) {
      return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    }
    if (split.includes('肩') || split.includes('臂')) {
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
    if (split.includes('有氧') || split.includes('核心')) {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
    return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
  };

  return (
    <div id="workout-calendar-module" className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100 tracking-tight flex items-center gap-2">
              锻炼情况日历看板
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                {currentYear} 年 {currentMonthIndex + 1} 月
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {currentModule === 'diet'
                ? '日历化纵览每天的锻炼部位、动作与重复次数，协同调优能量与营养摄入'
                : '按日历形式追踪每日训练部位、打卡动作与各组重复次数'}
            </p>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1 text-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-lg transition-colors cursor-pointer"
              title="上个月"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-neutral-200 font-mono">
              {currentYear}.{String(currentMonthIndex + 1).padStart(2, '0')}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-lg transition-colors cursor-pointer"
              title="下个月"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleGoToToday}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-medium rounded-xl border border-neutral-700 transition-colors cursor-pointer"
          >
            今天
          </button>
        </div>
      </div>

      {/* Monthly Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
          <div className="text-neutral-400">本月锻炼打卡</div>
          <div className="font-mono font-bold text-emerald-400 text-sm">
            {monthTrainedDays} 天
          </div>
        </div>
        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
          <div className="text-neutral-400">本月完成总次数 (Reps)</div>
          <div className="font-mono font-bold text-sky-400 text-sm">
            {monthTotalReps} 次
          </div>
        </div>
        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
          <div className="text-neutral-400">当前选中日期</div>
          <div className="font-mono font-medium text-neutral-200 text-xs">
            {selectedDate}
          </div>
        </div>
        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
          <div className="text-neutral-400">当日部位</div>
          <div className="font-medium text-amber-300 text-xs truncate max-w-[110px]">
            {selectedWorkoutSummary.hasWorkout ? selectedWorkoutSummary.splitType : '休息/未记录'}
          </div>
        </div>
      </div>

      {/* Weekdays Bar */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[11px] sm:text-xs font-medium text-neutral-400 border-b border-neutral-800 pb-2">
        <span>周一</span>
        <span>周二</span>
        <span>周三</span>
        <span>周四</span>
        <span>周五</span>
        <span className="text-rose-400/80">周六</span>
        <span className="text-rose-400/80">周日</span>
      </div>

      {/* 7-Columns Calendar Matrix */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((day) => {
          const workout = workouts.find((w) => w.date === day.dateString);
          const summary = summarizeWorkoutDay(workout);
          const isSelected = selectedDate === day.dateString;
          const dayMeals = dietLogs.filter((m) => m.date === day.dateString);

          return (
            <div
              key={day.dateString}
              onClick={() => {
                setSelectedDate(day.dateString);
                onSelectDate?.(day.dateString);
              }}
              className={`min-h-[72px] sm:min-h-[108px] p-1 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-left overflow-hidden ${
                isSelected
                  ? 'bg-neutral-850 border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-lg'
                  : day.isCurrentMonth
                  ? 'bg-neutral-950/70 hover:bg-neutral-850/80 border-neutral-800/80'
                  : 'bg-neutral-950/30 border-neutral-900 text-neutral-600 opacity-60'
              }`}
            >
              {/* Day Number and Today indicator */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] sm:text-xs font-mono font-medium ${
                    day.isToday
                      ? 'w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold text-[10px] sm:text-[11px]'
                      : isSelected
                      ? 'text-emerald-300 font-bold'
                      : day.isCurrentMonth
                      ? 'text-neutral-200'
                      : 'text-neutral-600'
                  }`}
                >
                  {day.dayNumber}
                </span>

                {summary.hasWorkout && (
                  <span
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                      summary.workout?.completed ? 'bg-emerald-400 ring-2 ring-emerald-400/20' : 'bg-amber-400'
                    }`}
                    title={summary.workout?.completed ? '今日训练已全部完成' : '今日有训练计划'}
                  />
                )}
              </div>

              {/* Workout Content in Day Cell */}
              <div className="mt-0.5 sm:mt-1 flex-1 flex flex-col justify-center space-y-0.5 sm:space-y-1 min-w-0">
                {summary.hasWorkout ? (
                  <>
                    {/* 部位 */}
                    <div
                      className={`px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded text-[9px] sm:text-[10px] font-semibold truncate border ${getSplitColor(
                        summary.splitType
                      )}`}
                      title={`部位: ${summary.splitType}`}
                    >
                      {summary.splitType}
                    </div>

                    {/* 动作与重复次数简略 (大屏显示具体动作，小屏显示精简组数) */}
                    <div className="hidden sm:block text-[10px] text-neutral-300 leading-tight truncate">
                      {summary.exerciseSummaries[0]?.name || '锻炼动作'}
                      {summary.exercisesCount > 1 && ` +${summary.exercisesCount - 1}`}
                    </div>

                    <div className="text-[9px] sm:text-[10px] font-mono text-emerald-400/90 font-medium truncate">
                      <span className="sm:hidden">{summary.totalSets}组</span>
                      <span className="hidden sm:inline">
                        {summary.totalReps > 0
                          ? `${summary.completedReps > 0 ? summary.completedReps : summary.totalReps}次 • ${summary.totalSets}组`
                          : `${summary.totalSets}组`}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-[9px] sm:text-[10px] text-neutral-600 italic py-0.5 sm:py-1 truncate">
                    {day.isCurrentMonth ? '休息日' : ''}
                  </div>
                )}

                {/* Diet indicator if present */}
                {currentModule === 'diet' && dayMeals.length > 0 && (
                  <div className="pt-0.5 border-t border-neutral-850 flex items-center gap-1 text-[8px] sm:text-[9px] text-sky-400/90 truncate">
                    <UtensilsCrossed className="w-2.5 h-2.5 shrink-0" />
                    <span>{dayMeals.length} 餐</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Detailed Breakdown Inspector */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-100">
                  【{selectedDate}】锻炼情况明细
                </h3>
                {selectedDate === todayStr && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    今日
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                锻炼部位、具体动作及每组重复次数、负重详情
              </p>
            </div>
          </div>

          {/* Action buttons if in fitness view */}
          {onNavigateToWorkout && (
            <div className="flex items-center gap-2">
              {selectedWorkout && onDeleteWorkout && (
                <button
                  onClick={() => {
                    if (window.confirm(`确定要删除 ${selectedDate} 的全部训练记录吗？`)) {
                      onDeleteWorkout(selectedWorkout.id);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-900 hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-500/30 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                  title="删除该日训练打卡记录"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>删除</span>
                </button>
              )}
              <button
                onClick={() => onNavigateToWorkout(selectedDate)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <span>{selectedWorkoutSummary.hasWorkout ? '进入打卡工位' : '创建该日训练'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {selectedWorkoutSummary.hasWorkout ? (
          <div className="space-y-4">
            {/* Split & Stats Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">训练部位:</span>
                <span
                  className={`px-2.5 py-1 rounded-lg font-bold border ${getSplitColor(
                    selectedWorkoutSummary.splitType
                  )}`}
                >
                  {selectedWorkoutSummary.splitType}
                </span>
                <span className="text-neutral-500">
                  ({selectedWorkoutSummary.targetMuscles.join(' / ')})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-neutral-300 font-mono text-xs">
                <span>动作数: <strong className="text-white">{selectedWorkoutSummary.exercisesCount}</strong> 个</span>
                <span>总组数: <strong className="text-white">{selectedWorkoutSummary.totalSets}</strong> 组</span>
                <span>
                  累计重复: <strong className="text-emerald-400">{selectedWorkoutSummary.completedReps}</strong> / {selectedWorkoutSummary.totalReps} 次
                </span>
              </div>
            </div>

            {/* Exercise Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {selectedWorkoutSummary.exerciseSummaries.map((ex, exIndex) => (
                <div
                  key={`${ex.name}-${exIndex}`}
                  className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-800/80">
                    <div className="flex items-center gap-2 font-semibold text-neutral-200">
                      <span className="w-5 h-5 rounded-md bg-neutral-800 text-neutral-300 flex items-center justify-center text-[11px] font-mono">
                        {exIndex + 1}
                      </span>
                      <span>{ex.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 font-medium">
                      共 {ex.setsCount} 组 • 累计 {ex.totalReps} 次
                    </span>
                  </div>

                  {/* Sets & Repetitions Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                    {ex.details.map((set) => (
                      <div
                        key={set.setNumber}
                        className={`px-2.5 py-1.5 rounded-lg border flex items-center justify-between ${
                          set.completed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        <span className="font-mono text-[11px]">第 {set.setNumber} 组</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          {set.weightKg > 0 && <span>{set.weightKg}kg ×</span>}
                          <span className="font-bold text-neutral-100">{set.reps} 次</span>
                          {set.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Note if available */}
            {selectedWorkoutSummary.workout?.note && (
              <div className="text-xs text-neutral-400 bg-neutral-900/40 p-3 rounded-xl border border-neutral-850">
                <span className="text-neutral-500 mr-2">训练心得:</span>
                {selectedWorkoutSummary.workout.note}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-neutral-900/40 border border-dashed border-neutral-800 rounded-xl space-y-2">
            <Activity className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-sm font-medium text-neutral-300">
              {selectedDate} 未记录健身打卡
            </p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              此日可作为肌肉超量恢复的休息日，或点击右上角按钮为此日期录入训练动作与各组重复次数。
            </p>
          </div>
        )}

        {/* If in Diet Module: also display that day's meal logs together */}
        {currentModule === 'diet' && (
          <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-sky-400" />
                【{selectedDate}】当日协同饮食摄入 ({selectedDayMeals.length} 餐)
              </span>
              {selectedDayTotalCalories > 0 && (
                <span className="font-mono text-sky-400 font-medium">
                  共约 {selectedDayTotalCalories} kcal
                </span>
              )}
            </div>

            {selectedDayMeals.length === 0 ? (
              <div className="p-4 text-center bg-neutral-900/30 border border-dashed border-neutral-800 rounded-xl text-xs text-neutral-500">
                该日期未记录餐食打卡
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {selectedDayMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-xl text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-200">
                        {meal.mealType === 'breakfast'
                          ? '早餐'
                          : meal.mealType === 'lunch'
                          ? '午餐'
                          : meal.mealType === 'dinner'
                          ? '晚餐'
                          : '加餐/加练蛋白'}
                      </span>
                      {meal.tag && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          {meal.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-300 line-clamp-2">
                      {meal.foodDescription || meal.description}
                    </p>
                    {meal.estimatedCalories && (
                      <div className="text-[10px] text-neutral-500 font-mono">
                        约 {meal.estimatedCalories} kcal
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
