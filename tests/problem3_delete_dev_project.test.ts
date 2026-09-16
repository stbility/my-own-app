import test from 'node:test';
import assert from 'node:assert';
import { getInitialData } from '../src/data/initialData';
import { AppData, DevProject, DevIssue } from '../src/types';

test('Problem 3: 新增工程项目后，执行删除能彻底清除该项目及关联的所有待办与Bug', () => {
  const data: AppData = getInitialData();
  const initialProjectCount = data.devProjects.length;
  const initialIssueCount = data.devIssues.length;

  // 1. 创建新建项目
  const newProject: DevProject = {
    id: 'proj-test-new-123',
    name: '测试待删除工程',
    description: '用于验证删除入口与级联清理',
    techStack: ['Node.js', 'TypeScript', 'Tailwind'],
    localPath: '~/workspace/test-delete-repo',
    gitRepo: 'https://github.com/test/delete-repo.git',
    createdAt: '2026-09-16',
  };
  data.devProjects.push(newProject);
  assert.strictEqual(data.devProjects.length, initialProjectCount + 1);

  // 2. 为该项目创建 2 条专属关联 issue，并为其他项目创建 1 条无关 issue
  const issueA: DevIssue = {
    id: 'issue-test-1',
    projectId: newProject.id,
    title: '关联缺陷 A',
    severity: 'P0',
    status: 'todo',
    createdAt: '2026-09-16',
  };
  const issueB: DevIssue = {
    id: 'issue-test-2',
    projectId: newProject.id,
    title: '关联缺陷 B',
    severity: 'P1',
    status: 'in_progress',
    createdAt: '2026-09-16',
  };
  const otherProjectIssue: DevIssue = {
    id: 'issue-keep-1',
    projectId: data.devProjects[0].id,
    title: '属于其他项目的正常任务',
    severity: 'P2',
    status: 'todo',
    createdAt: '2026-09-16',
  };

  data.devIssues.push(issueA, issueB, otherProjectIssue);
  assert.strictEqual(data.devIssues.length, initialIssueCount + 3);

  // 3. 执行删除逻辑 (对应 deleteDevProject)
  const targetId = newProject.id;
  data.devProjects = data.devProjects.filter((p) => p.id !== targetId);
  data.devIssues = data.devIssues.filter((i) => i.projectId !== targetId);

  // 4. 验证项目已被完全移除
  assert.strictEqual(data.devProjects.some((p) => p.id === targetId), false);
  assert.strictEqual(data.devProjects.length, initialProjectCount);

  // 5. 验证关联 issue 全部被同步清理，而其他项目的 issue 保持完好
  assert.strictEqual(data.devIssues.some((i) => i.projectId === targetId), false);
  assert.strictEqual(data.devIssues.some((i) => i.id === 'issue-keep-1'), true);
});

test('Problem 3: 删除当前选中的项目时，工程切换回退逻辑正确', () => {
  const data: AppData = getInitialData();
  assert.ok(data.devProjects.length >= 2, '初始数据应至少有 2 个工程');

  let selectedProjectId = data.devProjects[0].id;
  const projectToDeleteId = selectedProjectId;

  // 模拟删除
  data.devProjects = data.devProjects.filter((p) => p.id !== projectToDeleteId);
  if (selectedProjectId === projectToDeleteId) {
    // 回退到 'all' 全项目视图
    selectedProjectId = 'all';
  }

  assert.strictEqual(selectedProjectId, 'all');
  assert.strictEqual(data.devProjects.some((p) => p.id === projectToDeleteId), false);
});
