import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkoutLog, ExerciseItem, ExerciseSet } from '../types';
import { getTodayDateString } from '../data/initialData';
import {
  Dumbbell,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  TrendingUp,
  Calendar,
  Flame,
  Scale,
  Award,
  ChevronRight,
} from 'lucide-react';

export const FitnessView: React.FC = () => {
  const { data, addWorkoutLog, updateWorkoutLog, deleteWorkoutLog, showToast } = useApp();

  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Active workout for selected date
  const currentWorkout = data.workouts.find((w) => w.date === selectedDate) || data.workouts[0];

  // Forms
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [targetSets, setTargetSets] = useState(4);
  const [defaultWeight, setDefaultWeight] = useState(60);
  const [defaultReps, setDefaultReps] = useState(10);

  const [weightInput, setWeightInput] = useState<number>(currentWorkout?.bodyWeightKg || 72.5);

  const splitTypes = [
    { id: '推力日 (胸/肩/肱三)', label: '推力日', desc: '胸肌、三角肌前中束、三头' },
    { id: '拉力日 (背/二头)', label: '拉力日', desc: '背阔肌、斜方肌、二头' },
    { id: '腿部日 (股四/腘绳/臀)', label: '腿部日', desc: '深蹲、硬拉、臀桥' },
    { id: '有氧耐力与核心', label: '有氧日', desc: '跑步、跳绳、腹肌' },
    { id: '主动休息恢复', label: '休息日', desc: '拉伸、筋膜放松' },
  ];

  // Compute total volume for the workout
  const computeVolume = (w?: WorkoutLog) => {
    if (!w) return 0;
    return w.exercises.reduce((total, ex) => {
      return (
        total +
        ex.sets.reduce((setTotal, s) => {
          return setTotal + (s.completed ? s.weightKg * s.reps : 0);
        }, 0)
      );
    }, 0);
  };

  const totalVolume = computeVolume(currentWorkout);

  const handleUpdateSplit = (split: string) => {
    if (!currentWorkout) return;
    updateWorkoutLog(currentWorkout.id, { splitType: split });
  };

  const handleUpdateWeight = () => {
    if (!currentWorkout) return;
    updateWorkoutLog(currentWorkout.id, { bodyWeightKg: Number(weightInput) });
    showToast(`已更新今日体重: ${weightInput} kg`, 'success');
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkout || !exerciseName.trim()) return;

    const sets: ExerciseSet[] = [];
    for (let i = 1; i <= targetSets; i++) {
      sets.push({
        id: `s-${Date.now()}-${i}`,
        setNumber: i,
        weightKg: Number(defaultWeight),
        reps: Number(defaultReps),
        completed: false,
      });
    }

    const newEx: ExerciseItem = {
      id: `ex-${Date.now()}`,
      name: exerciseName.trim(),
      sets,
    };

    updateWorkoutLog(currentWorkout.id, {
      exercises: [...currentWorkout.exercises, newEx],
    });

    setExerciseName('');
    setIsAddExerciseOpen(false);
  };

  const handleToggleSet = (exId: string, setIndex: number) => {
    if (!currentWorkout) return;
    const updatedExercises = currentWorkout.exercises.map((ex) => {
      if (ex.id !== exId) return ex;
      const updatedSets = ex.sets.map((s, idx) => {
        if (idx !== setIndex) return s;
        return { ...s, completed: !s.completed };
      });
      return { ...ex, sets: updatedSets };
    });
    updateWorkoutLog(currentWorkout.id, { exercises: updatedExercises });
  };

  const handleUpdateSetWeight = (exId: string, setIndex: number, newWeight: number) => {
    if (!currentWorkout) return;
    const updatedExercises = currentWorkout.exercises.map((ex) => {
      if (ex.id !== exId) return ex;
      const updatedSets = ex.sets.map((s, idx) => {
        if (idx !== setIndex) return s;
        return { ...s, weightKg: newWeight };
      });
      return { ...ex, sets: updatedSets };
    });
    updateWorkoutLog(currentWorkout.id, { exercises: updatedExercises });
  };

  const handleUpdateSetReps = (exId: string, setIndex: number, newReps: number) => {
    if (!currentWorkout) return;
    const updatedExercises = currentWorkout.exercises.map((ex) => {
      if (ex.id !== exId) return ex;
      const updatedSets = ex.sets.map((s, idx) => {
        if (idx !== setIndex) return s;
        return { ...s, reps: newReps };
      });
      return { ...ex, sets: updatedSets };
    });
    updateWorkoutLog(currentWorkout.id, { exercises: updatedExercises });
  };

  const handleDeleteExercise = (exId: string) => {
    if (!currentWorkout) return;
    updateWorkoutLog(currentWorkout.id, {
      exercises: currentWorkout.exercises.filter((ex) => ex.id !== exId),
    });
  };

  return (
    <div id="fitness-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 tracking-tight flex items-center gap-2.5">
            <Dumbbell className="w-6 h-6 text-emerald-400" />
            健身训练与体型管理
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            分化周期排期、动作组数负重精确打卡与体重追踪
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Weight quick log */}
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs">
            <Scale className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-400">今日体重:</span>
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(Number(e.target.value))}
              onBlur={handleUpdateWeight}
              className="w-14 bg-neutral-950 border border-neutral-800 rounded px-1.5 py-0.5 text-xs text-neutral-200 font-mono text-center focus:outline-none focus:border-emerald-500"
            />
            <span className="text-neutral-500">kg</span>
          </div>

          <button
            onClick={() => setIsAddExerciseOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            添加训练动作
          </button>
        </div>
      </div>

      {/* Top Banner: Split Selection & Stats */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              今日训练分化方案
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {splitTypes.map((split) => (
                <button
                  key={split.id}
                  onClick={() => handleUpdateSplit(split.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    currentWorkout?.splitType === split.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-semibold'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-300'
                  }`}
                >
                  {split.label}
                </button>
              ))}
            </div>
          </div>

          {/* Volume badge */}
          <div className="flex items-center gap-4 bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 shrink-0">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500">
                今日累计有效训练容量
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {totalVolume.toLocaleString()} <span className="text-xs text-neutral-400 font-normal">kg·次</span>
              </div>
            </div>
            <Award className="w-8 h-8 text-amber-400/70" />
          </div>
        </div>
      </div>

      {/* Main Exercises List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-200">
            动作明细与组数打卡 ({currentWorkout?.exercises.length || 0} 个动作)
          </h2>
          <span className="text-xs text-neutral-500">点击组号圈圈完成打卡，支持修改重量与次数</span>
        </div>

        {(!currentWorkout || currentWorkout.exercises.length === 0) ? (
          <div className="py-16 text-center text-xs text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-2xl">
            今日暂无安排动作，点击右上角 “添加训练动作” 开始
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {currentWorkout.exercises.map((ex) => {
              const completedSets = ex.sets.filter((s) => s.completed).length;
              return (
                <div
                  key={ex.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <h3 className="text-sm font-semibold text-neutral-100">{ex.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neutral-400">
                        进度: {completedSets} / {ex.sets.length} 组
                      </span>
                      <button
                        onClick={() => handleDeleteExercise(ex.id)}
                        className="text-neutral-500 hover:text-rose-400 p-1 rounded transition-colors"
                        title="删除动作"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sets Table */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 text-[11px] font-medium text-neutral-500 px-2">
                      <span className="col-span-2">组号</span>
                      <span className="col-span-4">负重 (kg)</span>
                      <span className="col-span-4">次数 (Reps)</span>
                      <span className="col-span-2 text-right">完成</span>
                    </div>

                    {ex.sets.map((set, idx) => (
                      <div
                        key={idx}
                        className={`grid grid-cols-12 items-center p-2 rounded-xl transition-all ${
                          set.completed
                            ? 'bg-emerald-950/20 border border-emerald-900/30'
                            : 'bg-neutral-950 border border-neutral-850'
                        }`}
                      >
                        <span className="col-span-2 text-xs font-mono font-bold text-neutral-400">
                          #{set.setNumber}
                        </span>

                        <div className="col-span-4 flex items-center gap-1">
                          <input
                            type="number"
                            value={set.weightKg}
                            onChange={(e) => handleUpdateSetWeight(ex.id, idx, Number(e.target.value))}
                            className="w-16 bg-neutral-900 border border-neutral-800 rounded px-2 py-0.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-[10px] text-neutral-500">kg</span>
                        </div>

                        <div className="col-span-4 flex items-center gap-1">
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => handleUpdateSetReps(ex.id, idx, Number(e.target.value))}
                            className="w-14 bg-neutral-900 border border-neutral-800 rounded px-2 py-0.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-[10px] text-neutral-500">次</span>
                        </div>

                        <div className="col-span-2 flex justify-end">
                          <button
                            onClick={() => handleToggleSet(ex.id, idx)}
                            className="p-1 rounded-lg transition-colors cursor-pointer"
                            title="切换完成状态"
                          >
                            {set.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-neutral-600 hover:text-emerald-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add Exercise */}
      {isAddExerciseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setIsAddExerciseOpen(false)}>
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-neutral-100">新增训练动作</h3>
            <form onSubmit={handleAddExercise} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">动作名称 *</label>
                <input
                  type="text"
                  required
                  placeholder="如：杠铃卧推 / 引体向上 / 罗马尼亚硬拉"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">规划组数</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={targetSets}
                    onChange={(e) => setTargetSets(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">初始重量 (kg)</label>
                  <input
                    type="number"
                    value={defaultWeight}
                    onChange={(e) => setDefaultWeight(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">每组次数</label>
                  <input
                    type="number"
                    value={defaultReps}
                    onChange={(e) => setDefaultReps(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExerciseOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-semibold rounded-xl"
                >
                  生成动作组
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
