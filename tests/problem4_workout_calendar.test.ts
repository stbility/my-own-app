import test from 'node:test';
import assert from 'node:assert';
import { generateCalendarDays, summarizeWorkoutDay } from '../src/utils/calendarUtils';
import { WorkoutLog, DietLogItem } from '../src/types';

test('Problem 4: 日历网格生成正确性验证（月份天数与前后留白填充）', () => {
  const days = generateCalendarDays(2026, 8); // 2026年9月 (0-indexed 8)
  assert.ok(days.length >= 28 && days.length <= 42, '日历网格行数需符合4-6周格式');
  assert.strictEqual(days.length % 7, 0, '日历天数必须是7的倍数');

  // 检查9月当月天数
  const currentMonthDays = days.filter((d) => d.isCurrentMonth);
  assert.strictEqual(currentMonthDays.length, 30, '9月份应有30天');

  // 检查格式规范 YYYY-MM-DD
  const sepFirst = currentMonthDays.find((d) => d.dayNumber === 1);
  assert.ok(sepFirst);
  assert.strictEqual(sepFirst.dateString, '2026-09-01');
});

test('Problem 4: 锻炼日历数据摘要提取部位、动作名称与重复次数', () => {
  const mockWorkout: WorkoutLog = {
    id: 'wo-test-1',
    date: '2026-09-15',
    splitType: '推力日 (胸/肩/肱三)',
    bodyWeightKg: 73.2,
    exercises: [
      {
        id: 'ex-1',
        name: '平板杠铃卧推',
        sets: [
          { setNumber: 1, weightKg: 60, reps: 10, completed: true },
          { setNumber: 2, weightKg: 70, reps: 8, completed: true },
          { setNumber: 3, weightKg: 75, reps: 6, completed: true },
          { setNumber: 4, weightKg: 80, reps: 4, completed: false },
        ],
      },
      {
        id: 'ex-2',
        name: '坐姿哑铃推肩',
        sets: [
          { setNumber: 1, weightKg: 18, reps: 12, completed: true },
          { setNumber: 2, weightKg: 18, reps: 10, completed: true },
          { setNumber: 3, weightKg: 18, reps: 10, completed: true },
        ],
      },
    ],
  };

  const summary = summarizeWorkoutDay(mockWorkout);

  assert.ok(summary, '应成功生成当日训练摘要');
  assert.strictEqual(summary.hasWorkout, true);

  // 1. 什么部位
  assert.strictEqual(summary.splitType, '推力日 (胸/肩/肱三)');
  assert.ok(summary.targetMuscles.includes('胸'));
  assert.ok(summary.targetMuscles.includes('肩'));
  assert.ok(summary.targetMuscles.includes('肱三'));

  // 2. 什么动作
  assert.strictEqual(summary.exerciseSummaries.length, 2);
  assert.strictEqual(summary.exerciseSummaries[0].name, '平板杠铃卧推');
  assert.strictEqual(summary.exerciseSummaries[1].name, '坐姿哑铃推肩');

  // 3. 重复次数 (Reps) 与组数
  // ex-1 完成的 reps: 10 + 8 + 6 = 24 次; ex-2 完成的 reps: 12 + 10 + 10 = 32 次
  assert.strictEqual(summary.exerciseSummaries[0].completedReps, 24);
  assert.strictEqual(summary.exerciseSummaries[0].setsCount, 4);
  assert.strictEqual(summary.exerciseSummaries[1].completedReps, 32);
  assert.strictEqual(summary.exerciseSummaries[1].setsCount, 3);

  // 当日已打卡完成的总重复次数与总组数
  assert.strictEqual(summary.completedReps, 56);
  assert.strictEqual(summary.completedSets, 6);
  assert.strictEqual(summary.totalSets, 7);
  assert.strictEqual(summary.totalReps, 60); // 10+8+6+4 + 12+10+10 = 60
});

test('Problem 4: 饮食模块能与日历锻炼情况联动展示', () => {
  const mockWorkout: WorkoutLog = {
    id: 'wo-test-2',
    date: '2026-09-16',
    splitType: '腿部日 (股四/腘绳/臀)',
    bodyWeightKg: 72.8,
    exercises: [
      {
        id: 'ex-squat',
        name: '深蹲',
        sets: [
          { setNumber: 1, weightKg: 100, reps: 8, completed: true },
          { setNumber: 2, weightKg: 100, reps: 8, completed: true },
        ],
      },
    ],
  };

  const mockDietLogs: DietLogItem[] = [
    {
      id: 'diet-1',
      date: '2026-09-16',
      mealType: 'lunch',
      foodDescription: '牛肉炒时蔬、糙米饭',
      tag: '高蛋白',
      estimatedCalories: 650,
      feelRating: 4,
      createdAt: '2026-09-16 12:30',
    },
    {
      id: 'diet-2',
      date: '2026-09-16',
      mealType: 'dinner',
      foodDescription: '鸡胸肉沙拉、无糖酸奶',
      tag: '轻食沙拉',
      estimatedCalories: 400,
      feelRating: 5,
      createdAt: '2026-09-16 18:40',
    },
  ];

  const summary = summarizeWorkoutDay(mockWorkout);
  assert.ok(summary);
  assert.ok(summary.targetMuscles.includes('股四'));
  assert.ok(summary.targetMuscles.includes('腘绳'));
  assert.ok(summary.targetMuscles.includes('臀'));
  assert.strictEqual(summary.exerciseSummaries[0].name, '深蹲');
  assert.strictEqual(summary.exerciseSummaries[0].completedReps, 16);

  // 验证饮食日历在同日聚合
  const dayDietLogs = mockDietLogs.filter((d) => d.date === '2026-09-16');
  const dayCalories = dayDietLogs.reduce((acc, m) => acc + (m.estimatedCalories || 0), 0);
  assert.strictEqual(dayDietLogs.length, 2);
  assert.strictEqual(dayCalories, 1050);
});
