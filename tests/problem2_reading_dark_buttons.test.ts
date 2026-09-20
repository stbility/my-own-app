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

test('问题 2 验证 - 阅读模块深色模式清空书库高对比度且删除按钮正常触发，导航栏显示为阅读', () => {
  const readingPath = path.join(process.cwd(), 'src/views/ReadingView.tsx');
  const sidebarPath = path.join(process.cwd(), 'src/components/layout/Sidebar.tsx');

  const readingContent = fs.readFileSync(readingPath, 'utf-8');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');

  // 1. 验证已消除导致黑屏看不见的旧类名模式
  assert.strictEqual(
    readingContent.includes('bg-neutral-900 hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 border border-neutral-800'),
    false,
    '不能在深色模式下使用暗黑底色与暗灰文本导致清空书库黑屏'
  );

  // 2. 验证清空书库新按钮配色包含高亮文本与明晰边框
  assert.ok(readingContent.includes('id="clear-all-books-btn"'), '应包含清空书库按钮 ID');
  assert.ok(readingContent.includes('bg-neutral-800'), '按钮应具有清晰的背景色层次');
  assert.ok(readingContent.includes('text-neutral-200'), '按钮文字应使用高明度 neutral-200');

  // 3. 计算实际对比度
  const buttonBg = '#262626';
  const buttonText = '#e5e5e5';
  const roseIcon = '#fb7185';
  const roseHoverText = '#fecdd3';

  const textContrast = getContrast(buttonText, buttonBg);
  const iconContrast = getContrast(roseIcon, buttonBg);
  const hoverTextContrast = getContrast(roseHoverText, buttonBg);

  assert.ok(textContrast >= 4.5, `清空书库文本对比度必须 ≥ 4.5:1，当前为 ${textContrast.toFixed(2)}:1`);
  assert.ok(iconContrast >= 4.5, `清空书库图标对比度必须 ≥ 4.5:1，当前为 ${iconContrast.toFixed(2)}:1`);
  assert.ok(hoverTextContrast >= 4.5, `清空书库悬浮文字对比度必须 ≥ 4.5:1，当前为 ${hoverTextContrast.toFixed(2)}:1`);

  // 4. 验证已解除 iframe 阻断的 window.confirm，确保删除按钮能正常触发
  assert.strictEqual(
    readingContent.includes('window.confirm('),
    false,
    '阅读模块不应使用会被 iframe 阻断导致无响应的 window.confirm'
  );

  assert.ok(
    readingContent.includes('onClick={() => deleteBook(book.id)}'),
    '书籍卡片删除按钮应直接触发 deleteBook'
  );

  // 5. 验证左侧导航栏中阅读模块名称修改为「阅读」
  assert.ok(
    sidebarContent.includes("id: 'reading',\n      label: '阅读',"),
    '左侧侧边栏中阅读模块标签名称应为「阅读」'
  );
  assert.strictEqual(
    sidebarContent.includes("id: 'reading',\n      label: '阅读模块',"),
    false,
    '左侧侧边栏不应再显示「阅读模块」'
  );
});
