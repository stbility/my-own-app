import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MealType, DietLogItem } from '../types';
import { getTodayDateString } from '../data/initialData';
import {
  UtensilsCrossed,
  Droplets,
  Plus,
  Trash2,
  Smile,
  Frown,
  Meh,
  Tag,
  Flame,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { WorkoutCalendar } from '../components/common/WorkoutCalendar';

export const DietView: React.FC = () => {
  const { data, addWaterIntake, resetWaterIntake, addDietLog, deleteDietLog } = useApp();

  const todayStr = getTodayDateString();
  const [activeTab, setActiveTab] = useState<'calendar' | 'meals'>('calendar');
  const water = data.waterRecords[todayStr] || { date: todayStr, currentMl: 0, targetMl: 2000 };
  const waterPercent = Math.min(100, Math.round((water.currentMl / water.targetMl) * 100));

  // Form states
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [foodDesc, setFoodDesc] = useState('');
  const [selectedTag, setSelectedTag] = useState('高蛋白');
  const [calories, setCalories] = useState<number>(550);
  const [feelRating, setFeelRating] = useState<1 | 2 | 3 | 4 | 5>(4);

  const availableTags = ['清淡减脂', '高蛋白', '外卖聚餐', '控糖低碳', '家常简餐', '轻食沙拉'];

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodDesc.trim()) return;

    addDietLog({
      date: todayStr,
      mealType,
      foodDescription: foodDesc.trim(),
      tag: selectedTag,
      estimatedCalories: calories ? Number(calories) : undefined,
      feelRating,
    });

    setFoodDesc('');
    setIsAddMealOpen(false);
  };

  const getMealTypeLabel = (type: MealType) => {
    switch (type) {
      case 'breakfast':
        return '早餐';
      case 'lunch':
        return '午餐';
      case 'dinner':
        return '晚餐';
      case 'snack':
      default:
        return '加餐 / 零食';
    }
  };

  const getTagColor = (tag?: string) => {
    if (!tag || typeof tag !== 'string') {
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    }
    if (tag.includes('高蛋白') || tag.includes('减脂')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (tag.includes('外卖')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
  };

  return (
    <div id="diet-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 tracking-tight flex items-center gap-2.5">
            <UtensilsCrossed className="w-6 h-6 text-sky-400" />
            饮食记录与饮水追踪
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            日历化协同追踪每日训练部位、动作负荷与每日三餐热量、饱腹舒适度
          </p>
        </div>

        <button
          onClick={() => setIsAddMealOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-neutral-950 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          记录三餐打卡
        </button>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs w-fit">
        <button
          id="diet-calendar-tab-btn"
          onClick={() => setActiveTab('calendar')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-sky-500 text-neutral-950 font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          锻炼与饮食日历（部位/动作/重复次数/三餐）
        </button>
        <button
          id="diet-meals-tab-btn"
          onClick={() => setActiveTab('meals')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'meals'
              ? 'bg-sky-500 text-neutral-950 font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          今日三餐打卡与饮水
        </button>
      </div>

      {/* Tab 1: Combined Calendar View */}
      {activeTab === 'calendar' && (
        <WorkoutCalendar
          workouts={data.workouts}
          dietLogs={data.dietLogs}
          currentModule="diet"
        />
      )}

      {/* Tab 2: Meals & Water Tracker */}
      {activeTab === 'meals' && (
      <div className="space-y-6">

      {/* Top Banner: Water Tracker Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0">
              <Droplets className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">今日饮水进度</span>
                <span className="text-xs font-bold text-sky-400 font-mono">
                  {water.currentMl} / {water.targetMl} ml ({waterPercent}%)
                </span>
              </div>
              <h3 className="text-lg font-bold text-neutral-100 mt-1">
                {waterPercent >= 100 ? '今日饮水达标！身体水分充足 🎉' : `还需补充 ${Math.max(0, water.targetMl - water.currentMl)} ml 达到健康基准`}
              </h3>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => addWaterIntake(250)}
              className="px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              +250 ml (一杯)
            </button>
            <button
              onClick={() => addWaterIntake(500)}
              className="px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              +500 ml (一壶)
            </button>
            <button
              onClick={() => addWaterIntake(100)}
              className="px-3 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-400 text-xs font-mono transition-colors"
            >
              +100 ml
            </button>
            <button
              onClick={() => resetWaterIntake()}
              className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 transition-colors"
              title="重置今日饮水"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Liquid Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden p-0.5 border border-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full transition-all duration-500 ease-out shadow-xs"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Meals Diary List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-200">
            今日三餐日志 ({data.dietLogs.length} 餐)
          </h2>
          <span className="text-xs text-neutral-500">不求极端节食，建立对自己饮食状态的觉察</span>
        </div>

        {data.dietLogs.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-2xl">
            今日暂无三餐打卡，点击右上角 “记录三餐打卡” 开启健康一天
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.dietLogs.map((meal) => (
              <div
                key={meal.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-md border border-sky-500/20 shrink-0">
                      {getMealTypeLabel(meal.mealType)}
                    </span>
                    {(() => {
                      const tagsList: string[] = Array.isArray(meal.tags) && meal.tags.length > 0
                        ? meal.tags
                        : meal.tag
                        ? [meal.tag]
                        : [];
                      if (tagsList.length === 0) return null;
                      return (
                        <div className="flex flex-wrap justify-end gap-1">
                          {tagsList.map((t, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getTagColor(t)}`}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  <p className="text-sm font-medium text-neutral-100 mt-3 leading-relaxed">
                    {meal.foodDescription || meal.description || '未填写餐食明细'}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-neutral-400">
                    {meal.estimatedCalories && (
                      <span className="flex items-center gap-1 font-mono">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        约 {meal.estimatedCalories} kcal
                      </span>
                    )}
                    {typeof meal.feelRating === 'number' && meal.feelRating >= 1 && meal.feelRating <= 5 && (
                      <span className="text-neutral-500">
                        舒适度: {'★'.repeat(meal.feelRating)}{'☆'.repeat(5 - meal.feelRating)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-850 flex items-center justify-between text-xs text-neutral-500">
                  <span>{meal.date}</span>
                  <button
                    onClick={() => deleteDietLog(meal.id)}
                    className="p-1 hover:text-rose-400 rounded transition-colors"
                    title="删除记录"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      )}

      {/* Modal: Add Meal */}
      {isAddMealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setIsAddMealOpen(false)}>
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-neutral-100">记录一餐饮食</h3>
            <form onSubmit={handleAddMeal} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">餐别 *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setMealType(t)}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        mealType === t
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                      }`}
                    >
                      {getMealTypeLabel(t)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">吃了什么 *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="如：香煎鸡胸肉、牛油果糙米饭、紫菜蛋花汤"
                  value={foodDesc}
                  onChange={(e) => setFoodDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">饮食标签</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setSelectedTag(t)}
                      className={`px-2 py-1 rounded-lg text-xs border transition-colors ${
                        selectedTag === t
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">估算热量 (kcal)</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">饱腹/身体舒适感 (1-5)</label>
                  <select
                    value={feelRating}
                    onChange={(e) => setFeelRating(Number(e.target.value) as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value={5}>5 星 - 极其清爽满足</option>
                    <option value={4}>4 星 - 七八分饱舒适</option>
                    <option value={3}>3 星 - 正常无负担</option>
                    <option value={2}>2 星 - 略感油腻撑胀</option>
                    <option value={1}>1 星 - 过度暴饮暴食</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMealOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-neutral-950 text-xs font-semibold rounded-xl"
                >
                  存入日志
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
