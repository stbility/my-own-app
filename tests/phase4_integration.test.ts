import test from 'node:test';
import assert from 'node:assert';
import { getInitialData, getTodayDateString } from '../src/data/initialData';
import {
  loadAppData,
  saveAppData,
  exportBackupJson,
  validateBackupJson,
  STORAGE_KEY,
} from '../src/services/storage';
import { AppData, QuickNote, ContentItem, WorkoutLog } from '../src/types';

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

test('Phase 4 - 端到端工作生活全流程联动与冷启动无损复原', () => {
  const storageA = createMockStorage();

  // 1. 冷启动加载数据
  const state = loadAppData(storageA);
  assert.strictEqual(state.schemaVersion, '1.0.0');

  // 2. 用户在首页记录闪念便签
  const noteId = `note-${Date.now()}`;
  const testNote: QuickNote = {
    id: noteId,
    content: '新企划：打造极致离线单机生活中枢',
    createdAt: `${getTodayDateString()} 12:00`,
  };
  state.quickNotes.unshift(testNote);

  // 3. 用户将便签流转至自媒体选题池
  const contentId = `cnt-${Date.now()}`;
  const newContent: ContentItem = {
    id: contentId,
    title: testNote.content,
    stage: 'idea',
    platforms: ['B站', '微信公众号'],
    outlineNotes: '详细剖析 LocalStorage 沙盒与导出导入设计',
    createdAt: getTodayDateString(),
  };
  state.contents.unshift(newContent);
  testNote.forwardedTo = 'content';

  // 4. 用户推进自媒体选题至已发布
  newContent.stage = 'published';
  newContent.views = 28000;
  newContent.likes = 3200;
  newContent.reviewNotes = '选题切中独立开发者痛点，反响热烈';

  // 5. 用户记录健身与饮食
  const workout: WorkoutLog = {
    id: 'wk-e2e',
    date: getTodayDateString(),
    splitType: '推力日 (胸/肩/肱三)',
    bodyWeightKg: 73.2,
    exercises: [
      {
        id: 'ex-e2e',
        name: '上斜哑铃卧推',
        sets: [
          { id: 'set-1', setNumber: 1, weightKg: 30, reps: 10, completed: true },
          { id: 'set-2', setNumber: 2, weightKg: 32, reps: 8, completed: true },
        ],
      },
    ],
  };
  state.workouts.unshift(workout);

  const todayStr = getTodayDateString();
  state.waterRecords[todayStr] = {
    date: todayStr,
    currentMl: 2250,
    targetMl: 2000,
  };

  // 6. 用户保存到本地存储
  const saved = saveAppData(state, storageA);
  assert.strictEqual(saved, true);

  // 7. 用户导出数据备份 JSON 文件
  const backupJsonString = exportBackupJson(state);
  assert.ok(backupJsonString.length > 500);

  // 8. 验证备份校验器成功解析并识别所有改动
  const validationResult = validateBackupJson(backupJsonString);
  assert.strictEqual(validationResult.valid, true);
  assert.ok(validationResult.data);

  // 9. 模拟全新电脑 / 空白浏览器环境 (Storage B)
  const storageB = createMockStorage();
  const restoreSuccess = saveAppData(validationResult.data!, storageB);
  assert.strictEqual(restoreSuccess, true);

  // 10. 从 Storage B 冷启动复原
  const restoredState = loadAppData(storageB);

  // 11. 全面核验数据无损
  assert.strictEqual(restoredState.quickNotes[0].id, noteId);
  assert.strictEqual(restoredState.quickNotes[0].forwardedTo, 'content');
  assert.strictEqual(restoredState.contents[0].id, contentId);
  assert.strictEqual(restoredState.contents[0].stage, 'published');
  assert.strictEqual(restoredState.contents[0].views, 28000);
  assert.strictEqual(restoredState.workouts[0].bodyWeightKg, 73.2);
  assert.strictEqual(restoredState.waterRecords[todayStr].currentMl, 2250);
});

test('Phase 4 - 异常容错能力：损坏的 JSON 备份不影响已有本地数据', () => {
  const mockStorage = createMockStorage();
  const initialState = loadAppData(mockStorage);
  initialState.quickNotes.push({
    id: 'keep-me-safe',
    content: '关键数据不能丢失',
    createdAt: getTodayDateString(),
  });
  saveAppData(initialState, mockStorage);

  // 传入被恶意篡改截断的 JSON 串
  const badJson = '{"version":"1.0.0","data":{"quickNotes":[{';
  const valResult = validateBackupJson(badJson);
  assert.strictEqual(valResult.valid, false);

  // 确认原有 storage 中的数据依然安好
  const safeReload = loadAppData(mockStorage);
  const found = safeReload.quickNotes.find((n) => n.id === 'keep-me-safe');
  assert.ok(found, '校验失败时不应改动已存数据');
});

test('Phase 4 - 大数据量批次存储与解析性能稳定性核验', () => {
  const mockStorage = createMockStorage();
  const data = getInitialData();

  // 批量追加 100 项待办和 50 篇内容选题
  for (let i = 0; i < 100; i++) {
    data.dailyTasks.push({
      id: `stress-task-${i}`,
      title: `压力测试日程第 ${i} 项`,
      timeSlot: '14:00 - 15:00',
      category: 'work',
      done: i % 2 === 0,
    });
  }
  for (let i = 0; i < 50; i++) {
    data.contents.push({
      id: `stress-content-${i}`,
      title: `压力测试自媒体选题第 ${i} 篇`,
      stage: 'idea',
      platforms: ['B站'],
      createdAt: getTodayDateString(),
    });
  }

  const startSave = Date.now();
  const saveOk = saveAppData(data, mockStorage);
  const saveDuration = Date.now() - startSave;
  assert.strictEqual(saveOk, true);
  assert.ok(saveDuration < 100, '批量保存耗时应在 100ms 以内');

  const startLoad = Date.now();
  const reloaded = loadAppData(mockStorage);
  const loadDuration = Date.now() - startLoad;
  assert.strictEqual(reloaded.dailyTasks.length, data.dailyTasks.length);
  assert.ok(loadDuration < 100, '批量加载耗时应在 100ms 以内');
});
