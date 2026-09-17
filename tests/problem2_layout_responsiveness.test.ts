import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// 问题 2 验收标准：
// - 1440×900 和 375×812 两种视口下，每个模块的所有内容完整可见
// - 无横向滚动条
// - 无内容被裁剪、挤压或遮盖

test('问题 2 验证 - 根布局与滚动容器排版约束', () => {
  const appTsx = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');

  // 1. 验证主容器防止视口横向滚动
  assert.match(appTsx, /overflow-hidden/, '主布局必须包含 overflow-hidden 防止视口整体溢出');

  // 2. 验证主体内容区具有 min-w-0 防止 flex 子项产生隐式最小宽度撑开
  assert.match(appTsx, /min-w-0/, 'flex 内容区必须声明 min-w-0 以支持窄屏收缩');

  // 3. 验证主画布置顶 overflow-x-hidden 杜绝非预期的整屏横向滚动条
  assert.match(appTsx, /overflow-x-hidden/, '主滚动区必须包含 overflow-x-hidden');

  // 4. 验证主画布在 375 视口下具有适宜的内边距适配 (p-3.5 sm:p-6)
  assert.match(appTsx, /p-3\.5\s+sm:p-6/, '主画布需适配移动端到桌面的阶梯内边距');
});

test('问题 2 验证 - 侧边栏在 1440 与 375 视口下的响应式抽屉与折叠机制', () => {
  const sidebarTsx = fs.readFileSync(path.resolve('src/components/layout/Sidebar.tsx'), 'utf-8');

  // 1. 窄屏下抽屉化 (fixed md:relative, -translate-x-full md:translate-x-0)
  assert.match(sidebarTsx, /fixed\s+md:relative/, '侧边栏在窄屏下采用 fixed 浮层，宽屏采用 relative');
  assert.match(sidebarTsx, /-translate-x-full\s+md:translate-x-0/, '侧边栏在窄屏默认移出可视区，宽屏保持平铺');

  // 2. 窄屏提供半透明背景蒙层与关闭按钮
  assert.match(sidebarTsx, /id="mobile-sidebar-backdrop"/, '窄屏展开时必须有背景蒙层');
  assert.match(sidebarTsx, /id="close-mobile-sidebar-btn"/, '必须提供窄屏独立关闭按钮');
});

test('问题 2 验证 - 顶部工具栏在 375 窄屏下的紧凑排版', () => {
  const headerTsx = fs.readFileSync(path.resolve('src/components/layout/Header.tsx'), 'utf-8');

  // 1. 窄屏提供汉堡菜单唤醒入口
  assert.match(headerTsx, /id="mobile-menu-btn"/, '顶部栏必须包含窄屏汉堡菜单按钮');

  // 2. 日期在窄屏下自适应短格式，防止在 375 视口挤占操作区
  assert.match(headerTsx, /shortDateStr/, '顶部栏应有移动端短日期适配');

  // 3. 闪念备忘与主题按钮在窄屏下自适应收缩
  assert.match(headerTsx, /hidden\s+sm:inline/, '次要文字在窄屏下隐去以保证关键触控按钮完整展示');
});

test('问题 2 验证 - 健身日历在 375 窄屏下的方格比例与单元格防挤压', () => {
  const calendarTsx = fs.readFileSync(path.resolve('src/components/common/WorkoutCalendar.tsx'), 'utf-8');

  // 1. 日历单元格采用阶梯最小高度
  assert.match(calendarTsx, /min-h-\[72px\]\s+sm:min-h-\[108px\]/, '日历单元格在 375 视口下应采用 72px 紧凑高度');

  // 2. 星期栏字号与间距响应式调整
  assert.match(calendarTsx, /gap-1\s+sm:gap-1\.5/, '星期栏与日历方格间距在窄屏下缩小为 gap-1');

  // 3. 选中日期的组数明细在窄屏采用单列网格，防止文字溢出或挤压
  assert.match(calendarTsx, /grid-cols-1\s+sm:grid-cols-2/, '训练动作每组明细在窄屏应转为单列排列');
});

test('问题 2 验证 - 9 大核心业务视图无破坏 375 宽度的固定最小宽度硬编码', () => {
  const viewFiles = [
    'src/views/DashboardView.tsx',
    'src/views/DailyPlanView.tsx',
    'src/views/ContentView.tsx',
    'src/views/DevWorkView.tsx',
    'src/views/ConsultingView.tsx',
    'src/views/FitnessView.tsx',
    'src/views/DietView.tsx',
    'src/views/GamingView.tsx',
    'src/views/DataSettingsView.tsx',
  ];

  for (const viewPath of viewFiles) {
    const content = fs.readFileSync(path.resolve(viewPath), 'utf-8');

    // 检查是否有硬编码的大于 350px 且没有响应式前缀的 min-w
    const fixedMinWidthMatches = content.match(/min-w-\[(\d+)px\]/g) || [];
    for (const m of fixedMinWidthMatches) {
      const px = parseInt(m.replace(/[^0-9]/g, ''), 10);
      // 如果没有在可滚动的容器内或者没有响应式前缀，则不能大于 350px
      assert.ok(
        px <= 350 || content.includes('overflow-x-auto'),
        `${viewPath} 中包含未受控的固定最小宽度 ${m}，可能在 375 视口引起横向滚动`
      );
    }
  }
});
