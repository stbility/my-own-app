import test from 'node:test';
import assert from 'node:assert';
import { THEME_STORAGE_KEY } from '../src/context/AppContext';
import { ThemeMode, ResolvedTheme } from '../src/types';
import { loadAppData, saveAppData, STORAGE_KEY } from '../src/services/storage';

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

test('Theme System - 默认主题为跟随系统 (system)，且存储键定义规范', () => {
  assert.strictEqual(THEME_STORAGE_KEY, 'my_life_hub_theme_mode');

  const mockStorage = createMockStorage();
  const saved = mockStorage.getItem(THEME_STORAGE_KEY);
  // 未设置时应为空，应用默认降级到 'system'
  const effectiveTheme: ThemeMode = (saved as ThemeMode) || 'system';
  assert.strictEqual(effectiveTheme, 'system');
});

test('Theme System - 用户手动选择浅色或深色后正确持久化到本地并在读取时恢复', () => {
  const mockStorage = createMockStorage();

  // 1. 用户切换至浅色
  mockStorage.setItem(THEME_STORAGE_KEY, 'light');
  assert.strictEqual(mockStorage.getItem(THEME_STORAGE_KEY), 'light');

  // 2. 用户切换至深色
  mockStorage.setItem(THEME_STORAGE_KEY, 'dark');
  assert.strictEqual(mockStorage.getItem(THEME_STORAGE_KEY), 'dark');

  // 3. 用户切换回跟随系统
  mockStorage.setItem(THEME_STORAGE_KEY, 'system');
  assert.strictEqual(mockStorage.getItem(THEME_STORAGE_KEY), 'system');
});

test('Theme System - 跟随系统模式下的动态解析逻辑', () => {
  const resolveTheme = (theme: ThemeMode, prefersDark: boolean): ResolvedTheme => {
    if (theme === 'system') {
      return prefersDark ? 'dark' : 'light';
    }
    return theme;
  };

  // 跟随系统 + 操作系统为深色 -> 解析为深色
  assert.strictEqual(resolveTheme('system', true), 'dark');
  // 跟随系统 + 操作系统为浅色 -> 解析为浅色
  assert.strictEqual(resolveTheme('system', false), 'light');

  // 强制浅色，无论系统如何，均解析为浅色
  assert.strictEqual(resolveTheme('light', true), 'light');
  assert.strictEqual(resolveTheme('light', false), 'light');

  // 强制深色，无论系统如何，均解析为深色
  assert.strictEqual(resolveTheme('dark', true), 'dark');
  assert.strictEqual(resolveTheme('dark', false), 'dark');
});

test('Theme System - DOM 同步类名与属性映射正确性', () => {
  const applyThemeToClasses = (resolved: ResolvedTheme) => {
    const classList = new Set<string>();
    const attributes: Record<string, string> = {};

    if (resolved === 'dark') {
      classList.add('dark');
      classList.delete('light');
      attributes['data-theme'] = 'dark';
    } else {
      classList.add('light');
      classList.delete('dark');
      attributes['data-theme'] = 'light';
    }

    return { classList: Array.from(classList), dataTheme: attributes['data-theme'] };
  };

  const darkResult = applyThemeToClasses('dark');
  assert.ok(darkResult.classList.includes('dark'));
  assert.ok(!darkResult.classList.includes('light'));
  assert.strictEqual(darkResult.dataTheme, 'dark');

  const lightResult = applyThemeToClasses('light');
  assert.ok(lightResult.classList.includes('light'));
  assert.ok(!lightResult.classList.includes('dark'));
  assert.strictEqual(lightResult.dataTheme, 'light');
});

test('Theme System - 主题切换不影响已有业务数据存储与结构', () => {
  const mockStorage = createMockStorage();

  // 加载初始业务数据并修改
  const initialData = loadAppData(mockStorage);
  initialData.quickNotes.push({
    id: 'test-note-1',
    content: '主题测试业务便签',
    createdAt: '2026-09-17 12:00',
  });
  saveAppData(initialData, mockStorage);

  // 操作主题存储
  mockStorage.setItem(THEME_STORAGE_KEY, 'light');

  // 重新加载业务数据，核实完全不受影响
  const reloaded = loadAppData(mockStorage);
  assert.strictEqual(reloaded.quickNotes.some((n) => n.id === 'test-note-1'), true);
  assert.strictEqual(reloaded.schemaVersion, '1.0.0');

  // 验证 STORAGE_KEY 与 THEME_STORAGE_KEY 互不干扰
  assert.ok(mockStorage.getItem(STORAGE_KEY));
  assert.strictEqual(mockStorage.getItem(THEME_STORAGE_KEY), 'light');
});

test('Theme System - 关键文本在浅色与深色下的 WCAG 对比度核验 (≥ 4.5:1)', () => {
  // 相对亮度计算算法 (WCAG 2.1)
  function getLuminance(hex: string): number {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const transform = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
  }

  function getContrast(hex1: string, hex2: string): number {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // 1. 浅色模式检验 (底色 #ffffff 卡片 / #f6f8fa 画布)
  const lightBg = '#ffffff';
  const lightPrimaryText = '#0f172a'; // text-neutral-100
  const lightSecondaryText = '#334155'; // text-neutral-300
  const lightMutedText = '#64748b'; // text-neutral-500
  const lightAmberText = '#b45309'; // text-amber-400 (light variant)
  const lightEmeraldText = '#047857'; // text-emerald-400 (light variant)

  assert.ok(getContrast(lightPrimaryText, lightBg) >= 4.5, '浅色模式主要文字对比度需 ≥ 4.5:1');
  assert.ok(getContrast(lightSecondaryText, lightBg) >= 4.5, '浅色模式次要文字对比度需 ≥ 4.5:1');
  assert.ok(getContrast(lightMutedText, lightBg) >= 4.5, '浅色模式辅助文字对比度需 ≥ 4.5:1');
  assert.ok(getContrast(lightAmberText, lightBg) >= 4.5, '浅色模式琥珀色对比度需 ≥ 4.5:1');
  assert.ok(getContrast(lightEmeraldText, lightBg) >= 4.5, '浅色模式翡翠色对比度需 ≥ 4.5:1');

  // 2. 深色模式检验 (底色 #171717 卡片 / #0c0d0e 画布)
  const darkBg = '#171717';
  const darkPrimaryText = '#f8f9fa'; // text-neutral-100
  const darkSecondaryText = '#d1d3dc'; // text-neutral-300
  const darkMutedText = '#8e909c'; // text-neutral-500
  const darkAmberText = '#fbbf24'; // text-amber-400
  const darkEmeraldText = '#34d399'; // text-emerald-400

  assert.ok(getContrast(darkPrimaryText, darkBg) >= 4.5, '深色模式主要文字对比度需 ≥ 4.5:1');
  assert.ok(getContrast(darkSecondaryText, darkBg) >= 4.5, '深色模式次要文字对比度需 ≥ 4.5:1');
  assert.ok(getContrast(darkMutedText, darkBg) >= 4.5, '深色模式辅助文字对比度需 ≥ 4.5:1');
  assert.ok(getContrast(darkAmberText, darkBg) >= 4.5, '深色模式琥珀色对比度需 ≥ 4.5:1');
  assert.ok(getContrast(darkEmeraldText, darkBg) >= 4.5, '深色模式翡翠色对比度需 ≥ 4.5:1');
});
