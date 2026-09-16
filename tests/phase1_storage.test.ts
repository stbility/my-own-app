import test from 'node:test';
import assert from 'node:assert';
import {
  loadAppData,
  saveAppData,
  exportBackupJson,
  validateBackupJson,
  getStorageStats,
  STORAGE_KEY,
} from '../src/services/storage';
import { getInitialData, getTodayDateString } from '../src/data/initialData';

// 创建内存 Storage 模拟器供 Node.js 测试环境使用
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

test('Phase 1 - getInitialData 返回完整 9 大模块结构与有效数据', () => {
  const data = getInitialData();
  assert.ok(data.schemaVersion === '1.0.0');
  assert.ok(Array.isArray(data.quickNotes) && data.quickNotes.length > 0, '闪念便签应有初始条目');
  assert.ok(Array.isArray(data.bigThree) && data.bigThree.length > 0, '今日三大要事应有初始条目');
  assert.ok(Array.isArray(data.dailyTasks) && data.dailyTasks.length > 0, '今日日程应有初始条目');
  assert.ok(data.pomodoro && typeof data.pomodoro.timeLeftSeconds === 'number', '番茄钟配置应完整');
  assert.ok(Array.isArray(data.contents) && data.contents.length > 0, '自媒体应有初始条目');
  assert.ok(Array.isArray(data.devProjects) && data.devProjects.length > 0, '开发项目应有初始条目');
  assert.ok(Array.isArray(data.devIssues) && data.devIssues.length > 0, '开发需求/Bug应有初始条目');
  assert.ok(Array.isArray(data.codeSnippets) && data.codeSnippets.length > 0, '代码片段应有初始条目');
  assert.ok(Array.isArray(data.consultingClients) && data.consultingClients.length > 0, '咨询客户应有初始条目');
  assert.ok(Array.isArray(data.workouts) && data.workouts.length > 0, '健身计划应有初始条目');
  assert.ok(Array.isArray(data.dietLogs) && data.dietLogs.length > 0, '饮食计划应有初始条目');
  assert.ok(data.waterRecords && typeof data.waterRecords === 'object', '饮水记录结构应完整');
  assert.ok(Array.isArray(data.games) && data.games.length > 0, '游戏娱乐应有初始条目');
});

test('Phase 1 - loadAppData 在空存储时自动降级并持久化初始预置数据', () => {
  const mockStorage = createMockStorage();
  const loaded = loadAppData(mockStorage);
  assert.strictEqual(loaded.schemaVersion, '1.0.0');
  assert.ok(loaded.bigThree.length > 0);
  // 确认已自动持久化写入 mockStorage
  const storedRaw = mockStorage.getItem(STORAGE_KEY);
  assert.ok(storedRaw !== null);
  const parsed = JSON.parse(storedRaw!);
  assert.strictEqual(parsed.schemaVersion, '1.0.0');
});

test('Phase 1 - saveAppData 与 loadAppData 数据持久化双向闭环无损', () => {
  const mockStorage = createMockStorage();
  const data = getInitialData();
  data.quickNotes.push({
    id: 'test-note-phase-1',
    content: '测试持久化写入',
    createdAt: getTodayDateString(),
  });

  const saveSuccess = saveAppData(data, mockStorage);
  assert.strictEqual(saveSuccess, true);

  const reloaded = loadAppData(mockStorage);
  const found = reloaded.quickNotes.find((n) => n.id === 'test-note-phase-1');
  assert.ok(found, '新添加的便签应能无损持久化并加载');
  assert.strictEqual(found?.content, '测试持久化写入');
});

test('Phase 1 - exportBackupJson 导出格式规范且包含合法元数据', () => {
  const data = getInitialData();
  const jsonString = exportBackupJson(data);
  assert.ok(typeof jsonString === 'string' && jsonString.length > 100);

  const parsed = JSON.parse(jsonString);
  assert.strictEqual(parsed.version, '1.0.0');
  assert.strictEqual(parsed.appName, '个人工作生活专属APP');
  assert.ok(parsed.exportedAt);
  assert.ok(parsed.data && parsed.data.bigThree);
});

test('Phase 1 - validateBackupJson 成功解析有效备份，拒绝损坏或伪造数据', () => {
  const data = getInitialData();
  const exported = exportBackupJson(data);

  // 1. 验证合法备份
  const resValid = validateBackupJson(exported);
  assert.strictEqual(resValid.valid, true);
  assert.ok(resValid.data?.bigThree.length! > 0);

  // 2. 验证非 JSON 文本被拦截
  const resInvalidText = validateBackupJson('this is definitely not json');
  assert.strictEqual(resInvalidText.valid, false);
  assert.ok(resInvalidText.error?.includes('JSON 语法解析错误'));

  // 3. 验证空字符串拦截
  const resEmpty = validateBackupJson('');
  assert.strictEqual(resEmpty.valid, false);
});

test('Phase 1 - getStorageStats 统计准确且不崩溃', () => {
  const data = getInitialData();
  const stats = getStorageStats(data);
  assert.ok(stats.usedBytes > 0);
  assert.ok(typeof stats.usedFormatted === 'string');
  assert.ok(stats.quotaPercentage >= 0 && stats.quotaPercentage <= 100);
  assert.ok(stats.counts.quickNotes > 0);
  assert.ok(stats.counts.games > 0);
});
