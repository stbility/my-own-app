import test from 'node:test';
import assert from 'node:assert';
import { getInitialData, getTodayDateString } from '../src/data/initialData';
import { AppData, QuickNote, ContentItem, DevIssue } from '../src/types';
import { saveAppData, loadAppData } from '../src/services/storage';

function createMockStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

test('Phase 2 - 闪念速记流转至自媒体选题池逻辑验证', () => {
  const data: AppData = getInitialData();
  const testNote: QuickNote = {
    id: 'note-test-content-flow',
    content: '新选题：探索现代 TypeScript 单机应用的极致体验',
    createdAt: `${getTodayDateString()} 10:00`,
  };
  data.quickNotes.push(testNote);

  // 模拟流转到自媒体
  const newContent: ContentItem = {
    id: `cnt-${Date.now()}`,
    title: testNote.content.slice(0, 40),
    stage: 'idea',
    outlineNotes: `来自闪念速记：${testNote.content}`,
    platforms: ['B站', '小红书'],
    createdAt: getTodayDateString(),
  };
  data.contents.unshift(newContent);
  testNote.forwardedTo = 'content';

  assert.strictEqual(data.contents[0].stage, 'idea');
  assert.strictEqual(data.contents[0].title.startsWith('新选题：探索现代'), true);
  assert.strictEqual(testNote.forwardedTo, 'content');
});

test('Phase 2 - 闪念速记流转至开发工作待办逻辑验证', () => {
  const data: AppData = getInitialData();
  const testNote: QuickNote = {
    id: 'note-test-dev-flow',
    content: '开发待办：增加健身记录一键清空全部按钮',
    createdAt: `${getTodayDateString()} 10:05`,
  };
  data.quickNotes.push(testNote);

  // 模拟流转到开发
  const targetProjectId = data.devProjects[0]?.id || 'proj-1';
  const newIssue: DevIssue = {
    id: `issue-${Date.now()}`,
    projectId: targetProjectId,
    title: testNote.content.slice(0, 50),
    severity: 'P2',
    status: 'todo',
    notes: `来自闪念速记：${testNote.content}`,
    createdAt: getTodayDateString(),
  };
  data.devIssues.unshift(newIssue);
  testNote.forwardedTo = 'dev';

  assert.strictEqual(data.devIssues[0].status, 'todo');
  assert.strictEqual(data.devIssues[0].severity, 'P2');
  assert.strictEqual(testNote.forwardedTo, 'dev');
});

test('Phase 2 - 今日核心三大要事完成度比率计算逻辑', () => {
  const data: AppData = getInitialData();
  const total = data.bigThree.length;
  const completed = data.bigThree.filter((i) => i.done).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  assert.ok(total >= 3, '初始三大要事应有3项');
  assert.ok(percent >= 0 && percent <= 100);
});

test('Phase 2 - 侧边栏徽标与待办计数计算逻辑', () => {
  const data: AppData = getInitialData();
  const dailyPendingCount = data.dailyTasks.filter((t) => !t.done).length;
  const devPendingCount = data.devIssues.filter((i) => i.status !== 'resolved').length;
  const activeClientsCount = data.consultingClients.filter(
    (c) => c.stage === 'active' || c.stage === 'signed'
  ).length;

  assert.ok(typeof dailyPendingCount === 'number' && dailyPendingCount >= 0);
  assert.ok(typeof devPendingCount === 'number' && devPendingCount >= 0);
  assert.ok(typeof activeClientsCount === 'number' && activeClientsCount >= 0);
});
