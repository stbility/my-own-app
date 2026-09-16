import { WorkoutLog, ExerciseItem } from '../types';

export interface DayWorkoutSummary {
  hasWorkout: boolean;
  workout?: WorkoutLog;
  splitType: string;
  targetMuscles: string[];
  exercisesCount: number;
  totalSets: number;
  completedSets: number;
  totalReps: number;
  completedReps: number;
  exerciseSummaries: {
    name: string;
    setsCount: number;
    repsText: string;
    totalReps: number;
    completedReps: number;
    details: {
      setNumber: number;
      weightKg: number;
      reps: number;
      completed: boolean;
    }[];
  }[];
}

export function extractTargetMuscles(splitType?: string): string[] {
  if (!splitType) return ['常规训练'];
  // Normalize splits like "推力日 (胸/肩/肱三)" or "胸部/三头"
  const cleaned = splitType.replace(/[()（）]/g, ' ');
  const parts = cleaned
    .split(/[/、\s+]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [splitType];
}

export function summarizeWorkoutDay(workout?: WorkoutLog): DayWorkoutSummary {
  if (!workout || !Array.isArray(workout.exercises) || workout.exercises.length === 0) {
    return {
      hasWorkout: false,
      workout,
      splitType: workout?.splitType || '未设定部位',
      targetMuscles: extractTargetMuscles(workout?.splitType),
      exercisesCount: 0,
      totalSets: 0,
      completedSets: 0,
      totalReps: 0,
      completedReps: 0,
      exerciseSummaries: [],
    };
  }

  let totalSets = 0;
  let completedSets = 0;
  let totalReps = 0;
  let completedReps = 0;

  const exerciseSummaries = workout.exercises.map((ex) => {
    const sets = Array.isArray(ex.sets) ? ex.sets : [];
    let exTotalReps = 0;
    let exCompletedReps = 0;

    const details = sets.map((s) => {
      const reps = typeof s.reps === 'number' && !isNaN(s.reps) ? s.reps : 0;
      const weightKg = typeof s.weightKg === 'number' && !isNaN(s.weightKg) ? s.weightKg : 0;
      const completed = Boolean(s.completed);

      totalSets += 1;
      totalReps += reps;
      exTotalReps += reps;

      if (completed) {
        completedSets += 1;
        completedReps += reps;
        exCompletedReps += reps;
      }

      return {
        setNumber: s.setNumber,
        weightKg,
        reps,
        completed,
      };
    });

    const repsList = details.map((d) => `${d.reps}次`).join(' / ');

    return {
      name: ex.name,
      setsCount: sets.length,
      repsText: repsList || '暂无组数',
      totalReps: exTotalReps,
      completedReps: exCompletedReps,
      details,
    };
  });

  return {
    hasWorkout: true,
    workout,
    splitType: workout.splitType || '全身综合',
    targetMuscles: extractTargetMuscles(workout.splitType),
    exercisesCount: workout.exercises.length,
    totalSets,
    completedSets,
    totalReps,
    completedReps,
    exerciseSummaries,
  };
}

export interface CalendarDayInfo {
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function generateCalendarDays(year: number, monthIndex: number, todayStr: string = ''): CalendarDayInfo[] {
  // monthIndex is 0-based: 0 for Jan, 8 for Sep
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Determine starting day of week: Monday as 0, Sunday as 6
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const days: CalendarDayInfo[] = [];

  // Previous month trailing days
  const prevMonthDays = new Date(year, monthIndex, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const prevMonth = monthIndex === 0 ? 12 : monthIndex;
    const prevYear = monthIndex === 0 ? year - 1 : year;
    const dateString = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    days.push({
      dateString,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push({
      dateString,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
    });
  }

  // Next month leading days to complete grid (multiples of 7)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let day = 1; day <= remaining; day++) {
    const nextMonth = monthIndex === 11 ? 1 : monthIndex + 2;
    const nextYear = monthIndex === 11 ? year + 1 : year;
    const dateString = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push({
      dateString,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
    });
  }

  return days;
}
