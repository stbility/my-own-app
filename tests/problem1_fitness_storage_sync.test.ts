import test from 'node:test';
import assert from 'node:assert';
import { getInitialData } from '../src/data/initialData';
import { getStorageStats, loadAppData, saveAppData, STORAGE_KEY } from '../src/services/storage';
import { AppData, WorkoutLog } from '../src/types';

class MemoryStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

test('问题 1 验证 - 初始状态下健身训练日志统计正确', () => {
  const data = getInitialData();
  const initialStats = getStorageStats(data);
  assert.strictEqual(initialStats.counts.workouts, 4, '初始应有 4 条训练记录');
  assert.ok(initialStats.usedBytes > 0, '初始占用空间应大于 0');
  assert.ok(initialStats.moduleSizes.workouts.bytes > 0, '初始健身训练日志占用空间应大于 0');
  assert.match(initialStats.moduleSizes.workouts.formatted, /KB|B/, '初始健身训练空间需格式化呈现');
});

test('问题 1 验证 - 删除所有训练记录后统计归零且占用空间减少', () => {
  const data: AppData = getInitialData();
  const initialStats = getStorageStats(data);

  // 模拟复现步骤 1：进入健身计划，删除所有训练记录
  const clearedData: AppData = {
    ...data,
    workouts: [],
  };

  // 模拟复现步骤 2 & 3：返回数据与设置模块，检查统计
  const afterDeleteStats = getStorageStats(clearedData);

  assert.strictEqual(afterDeleteStats.counts.workouts, 0, '期望：健身训练日志显示 0 次');
  assert.strictEqual(afterDeleteStats.moduleSizes.workouts.bytes, 0, '期望：健身模块独立占用空间归 0 字节');
  assert.strictEqual(afterDeleteStats.moduleSizes.workouts.formatted, '0 B', '期望：健身模块空间格式化显示 0 B');
  assert.ok(
    afterDeleteStats.usedBytes < initialStats.usedBytes,
    `期望：总占用空间相应减少 (前: ${initialStats.usedBytes} B, 后: ${afterDeleteStats.usedBytes} B)`
  );
});

test('问题 1 验证 - 动作全部删除时空壳记录自动归零', () => {
  const data: AppData = getInitialData();

  // 模拟所有记录中的动作均被用户逐一删除，保留了空壳
  const emptyWorkouts: WorkoutLog[] = data.workouts.map((w) => ({
    ...w,
    exercises: [],
    note: '',
  }));

  const dataWithEmptyWorkouts: AppData = {
    ...data,
    workouts: emptyWorkouts,
  };

  const stats = getStorageStats(dataWithEmptyWorkouts);
  assert.strictEqual(
    stats.counts.workouts,
    0,
    '动作全部删除后，空壳记录不应计入有效训练次数，统计必须显示 0 次'
  );
});

test('问题 1 验证 - 本地持久化存储与加载后统计同样归零', () => {
  const mockStorage = new MemoryStorage();
  const initialData = getInitialData();
  saveAppData(initialData, mockStorage);

  // 验证保存成功
  let loaded = loadAppData(mockStorage);
  assert.strictEqual(getStorageStats(loaded).counts.workouts, 4);

  // 删除所有训练记录并持久化
  const updatedData: AppData = {
    ...loaded,
    workouts: [],
  };
  saveAppData(updatedData, mockStorage);

  // 再次加载并统计
  const reloaded = loadAppData(mockStorage);
  const reloadedStats = getStorageStats(reloaded);

  assert.strictEqual(reloadedStats.counts.workouts, 0, '重载后健身训练日志统计应仍为 0 次');
  assert.ok(
    reloadedStats.usedBytes < getStorageStats(initialData).usedBytes,
    '持久化存储的占用空间也应相应减少'
  );
});
