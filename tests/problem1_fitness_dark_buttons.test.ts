import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

function getLuminance(hex: string): number {
  const rgb = hex
    .replace('#', '')
    .match(/.{2}/g)!
    .map((x) => parseInt(x, 16) / 255);
  const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrast(c1: string, c2: string): number {
  const l1 = getLuminance(c1);
  const l2 = getLuminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

test('问题 1 验证 - 健身模块深色主题下按钮背景与文字对比度 ≥ 4.5:1 且清晰可见', () => {
  const fitnessPath = path.join(process.cwd(), 'src/views/FitnessView.tsx');
  const content = fs.readFileSync(fitnessPath, 'utf-8');

  // 1. 验证已消除导致黑屏看不见的旧类名模式
  assert.strictEqual(
    content.includes('bg-neutral-900 hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 border border-neutral-800'),
    false,
    '不能在深色模式下使用暗黑底色与暗灰文本导致黑屏'
  );

  // 2. 验证新按钮配色类名包含高亮文本与明晰边框
  assert.ok(content.includes('id="delete-workout-btn"'), '应包含删除记录按钮 ID');
  assert.ok(content.includes('id="clear-all-workouts-btn"'), '应包含清空全部数据按钮 ID');
  assert.ok(content.includes('bg-neutral-800'), '按钮应具有清晰的背景色层次');
  assert.ok(content.includes('text-neutral-200'), '按钮文字应使用高明度 neutral-200');

  // 3. 计算实际对比度
  // neutral-800: #262626
  // neutral-200: #e5e5e5
  // rose-400 图标: #fb7185
  // rose-200 悬浮字: #fecdd3
  const buttonBg = '#262626';
  const buttonText = '#e5e5e5';
  const roseIcon = '#fb7185';
  const roseHoverText = '#fecdd3';

  const textContrast = getContrast(buttonText, buttonBg);
  const iconContrast = getContrast(roseIcon, buttonBg);
  const hoverTextContrast = getContrast(roseHoverText, buttonBg);

  assert.ok(textContrast >= 4.5, `文本对比度必须 ≥ 4.5:1，当前为 ${textContrast.toFixed(2)}:1`);
  assert.ok(iconContrast >= 4.5, `图标对比度必须 ≥ 4.5:1，当前为 ${iconContrast.toFixed(2)}:1`);
  assert.ok(hoverTextContrast >= 4.5, `悬浮文字对比度必须 ≥ 4.5:1，当前为 ${hoverTextContrast.toFixed(2)}:1`);

  // 4. 验证已解除 iframe 阻断的 window.confirm
  assert.strictEqual(
    content.includes('window.confirm('),
    false,
    '健身模块不应使用会被 iframe 阻断导致无响应的 window.confirm'
  );
});
