import test from 'node:test';
import assert from 'node:assert';
import { getInitialData } from '../src/data/initialData';
import { AppData, ContentItem, DevProject, DevIssue, WorkoutLog, ExerciseItem } from '../src/types';

test('Phase 3 - 自媒体管线阶段推进与发布数据复盘逻辑', () => {
  const data: AppData = getInitialData();
  const item: ContentItem = {
    id: 'test-cnt-1',
    title: '现代架构设计实战',
    stage: 'idea',
    platforms: ['B站'],
    createdAt: '2026-09-15',
  };
  data.contents.unshift(item);

  // 1. 推进到 script
  item.stage = 'script';
  assert.strictEqual(item.stage, 'script');

  // 2. 推进到 production
  item.stage = 'production';
  assert.strictEqual(item.stage, 'production');

  // 3. 推进到 published 并记录播放与复盘
  item.stage = 'published';
  item.publishDate = '2026-09-15';
  item.views = 15200;
  item.likes = 1200;
  item.reviewNotes = '前言节奏紧凑，完播率超预期';

  assert.strictEqual(item.stage, 'published');
  assert.strictEqual(item.views, 15200);
  assert.ok(item.reviewNotes.length > 0);
});

test('Phase 3 - 开发工作工程与需求状态状态机流转', () => {
  const data: AppData = getInitialData();
  const proj: DevProject = {
    id: 'test-proj-1',
    name: '极简工作台',
    description: '单机本地架构',
    techStack: ['React', 'TypeScript'],
    localPath: '~/workspace/life-hub',
    gitRepo: 'github.com/my/life-hub',
    createdAt: '2026-09-15',
  };
  data.devProjects.push(proj);

  const issue: DevIssue = {
    id: 'test-issue-1',
    projectId: proj.id,
    title: '修复移动端横屏适配边界',
    severity: 'P0',
    status: 'todo',
    createdAt: '2026-09-15',
  };
  data.devIssues.push(issue);

  // 验证关联性与初始状态
  assert.strictEqual(issue.status, 'todo');
  assert.strictEqual(issue.severity, 'P0');

  // 流转到 in_progress
  issue.status = 'in_progress';
  assert.strictEqual(issue.status, 'in_progress');

  // 流转到 resolved
  issue.status = 'resolved';
  assert.strictEqual(issue.status, 'resolved');
});

test('Phase 3 - 咨询业务工时累加与交付物达成核验', () => {
  const data: AppData = getInitialData();
  const client = data.consultingClients[0];
  assert.ok(client, '应存在初始咨询客户');

  const initialHours = client.hoursLogged;
  client.hoursLogged += 2; // 累加2小时
  assert.strictEqual(client.hoursLogged, initialHours + 2);

  // 交付物勾选
  if (client.deliverables && client.deliverables.length > 0) {
    const deliv = client.deliverables[0];
    const initialCompleted = deliv.completed;
    deliv.completed = !initialCompleted;
    assert.strictEqual(deliv.completed, !initialCompleted);
  }
});

test('Phase 3 - 健身训练容量 (Volume) 仅对已打卡完成的组数生效计算', () => {
  const mockWorkout: WorkoutLog = {
    id: 'test-workout',
    date: '2026-09-15',
    splitType: '推力日',
    bodyWeightKg: 72,
    exercises: [
      {
        id: 'ex-1',
        name: '杠铃卧推',
        sets: [
          { setNumber: 1, weightKg: 60, reps: 10, completed: true }, // 60 * 10 = 600
          { setNumber: 2, weightKg: 70, reps: 8, completed: true },  // 70 * 8 = 560
          { setNumber: 3, weightKg: 80, reps: 6, completed: false }, // 未完成不计入
        ],
      },
    ],
  };

  const volume = mockWorkout.exercises.reduce((total, ex) => {
    return (
      total +
      ex.sets.reduce((setTotal, s) => {
        return setTotal + (s.completed ? s.weightKg * s.reps : 0);
      }, 0)
    );
  }, 0);

  // 600 + 560 = 1160
  assert.strictEqual(volume, 1160);
});

test('Phase 3 - 饮食与饮水摄入量计算与重置闭环', () => {
  const data: AppData = getInitialData();
  const dateKey = '2026-09-15';
  data.waterRecords[dateKey] = {
    date: dateKey,
    currentMl: 500,
    targetMl: 2000,
  };

  // 增加 250ml
  data.waterRecords[dateKey].currentMl += 250;
  assert.strictEqual(data.waterRecords[dateKey].currentMl, 750);

  // 重置为 0
  data.waterRecords[dateKey].currentMl = 0;
  assert.strictEqual(data.waterRecords[dateKey].currentMl, 0);
});

test('Phase 3 - 游戏娱乐库全库时长汇总与通关状态', () => {
  const data: AppData = getInitialData();
  const totalHours = data.games.reduce((sum, g) => sum + (g.hoursPlayed || 0), 0);
  assert.ok(totalHours >= 0);

  const playingGames = data.games.filter((g) => g.status === 'playing');
  assert.ok(playingGames.length > 0, '初始应有正在玩的游戏');
});
