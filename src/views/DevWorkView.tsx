import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DevProject, DevIssue, CodeSnippet, IssueSeverity, IssueStatus } from '../types';
import {
  Code2,
  FolderGit2,
  Plus,
  Trash2,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  AlertCircle,
  Clock,
  CheckCircle2,
  Folder,
  Layers,
} from 'lucide-react';

export const DevWorkView: React.FC = () => {
  const {
    data,
    addDevProject,
    deleteDevProject,
    addDevIssue,
    updateDevIssue,
    deleteDevIssue,
    addCodeSnippet,
    deleteCodeSnippet,
    showToast,
  } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(data.devProjects[0]?.id || 'all');
  const [activeTab, setActiveTab] = useState<'issues' | 'snippets'>('issues');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  // Modals
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddIssueOpen, setIsAddIssueOpen] = useState(false);
  const [isAddSnippetOpen, setIsAddSnippetOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<DevProject | null>(null);

  // Form states
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projStack, setProjStack] = useState('React, TypeScript, Tailwind');
  const [projPath, setProjPath] = useState('~/workspace/');
  const [projGit, setProjGit] = useState('');

  const [issueTitle, setIssueTitle] = useState('');
  const [issueSeverity, setIssueSeverity] = useState<IssueSeverity>('P1');
  const [issueNotes, setIssueNotes] = useState('');

  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetLang, setSnippetLang] = useState('bash');
  const [snippetCode, setSnippetCode] = useState('');
  const [snippetTags, setSnippetTags] = useState('CLI, Git');
  const [snippetDesc, setSnippetDesc] = useState('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    showToast('已复制到剪贴板！', 'success');
    setTimeout(() => {
      setCopiedSnippetId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    addDevProject({
      name: projName.trim(),
      description: projDesc.trim(),
      techStack: projStack.split(',').map((s) => s.trim()).filter(Boolean),
      localPath: projPath.trim(),
      gitRepo: projGit.trim(),
    });

    setProjName('');
    setProjDesc('');
    setIsAddProjectOpen(false);
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle.trim()) return;

    const targetProj = selectedProjectId === 'all' ? (data.devProjects[0]?.id || 'proj-1') : selectedProjectId;

    addDevIssue({
      projectId: targetProj,
      title: issueTitle.trim(),
      severity: issueSeverity,
      status: 'todo',
      notes: issueNotes.trim() || undefined,
    });

    setIssueTitle('');
    setIssueNotes('');
    setIsAddIssueOpen(false);
  };

  const handleCreateSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snippetTitle.trim() || !snippetCode.trim()) return;

    addCodeSnippet({
      title: snippetTitle.trim(),
      language: snippetLang.trim(),
      code: snippetCode.trim(),
      tags: snippetTags.split(',').map((s) => s.trim()).filter(Boolean),
      description: snippetDesc.trim() || undefined,
    });

    setSnippetTitle('');
    setSnippetCode('');
    setSnippetDesc('');
    setIsAddSnippetOpen(false);
  };

  // Filter issues
  const filteredIssues = data.devIssues.filter((i) => {
    if (selectedProjectId === 'all') return true;
    return i.projectId === selectedProjectId;
  });

  const getSeverityBadge = (sev: IssueSeverity) => {
    switch (sev) {
      case 'P0':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">P0 紧急</span>;
      case 'P1':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">P1 重要</span>;
      case 'P2':
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">P2 普通</span>;
    }
  };

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'resolved':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">已解决</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">处理中</span>;
      case 'todo':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">待办</span>;
    }
  };

  const nextStatus = (curr: IssueStatus): IssueStatus => {
    if (curr === 'todo') return 'in_progress';
    if (curr === 'in_progress') return 'resolved';
    return 'todo';
  };

  return (
    <div id="dev-work-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 tracking-tight flex items-center gap-2.5">
            <Code2 className="w-6 h-6 text-cyan-400" />
            开发工作台
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            管理本地工程、排查需求与 Bug、备忘常用高频命令与代码片段
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="add-project-modal-btn"
            onClick={() => setIsAddProjectOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-850 hover:bg-neutral-800 text-neutral-200 font-medium text-xs rounded-xl border border-neutral-750 transition-colors"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            新建项目
          </button>
          <button
            id="add-issue-modal-btn"
            onClick={() => setIsAddIssueOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-xs rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            新建需求/Bug
          </button>
        </div>
      </div>

      {/* Projects Cards Horizontal Carousel */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            本地工程仓库 ({data.devProjects.length})
          </h3>
        </div>

        {data.devProjects.length === 0 ? (
          <div className="p-8 bg-neutral-900/60 border border-dashed border-neutral-800 rounded-2xl text-center space-y-2">
            <FolderGit2 className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-sm font-medium text-neutral-300">暂无本地工程仓库</p>
            <p className="text-xs text-neutral-500">点击右上角「新建项目」开始录入与跟踪您的代码工程</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.devProjects.map((proj) => {
              const isSelected = selectedProjectId === proj.id;
              const projectIssues = data.devIssues.filter((i) => i.projectId === proj.id);
              const unresolvedCount = projectIssues.filter((i) => i.status !== 'resolved').length;

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-neutral-900 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-neutral-900/80 hover:bg-neutral-850 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Folder className="w-4 h-4 text-cyan-400 shrink-0" />
                        <h4 className="text-sm font-semibold text-neutral-100 truncate">{proj.name}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {unresolvedCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            {unresolvedCount} 待办
                          </span>
                        )}
                        <button
                          type="button"
                          id={`delete-project-${proj.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(proj);
                          }}
                          className="p-1 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                          title="删除此项目"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-400 mt-2 line-clamp-2">{proj.description}</p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {proj.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-950 text-neutral-400 border border-neutral-800"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-850 space-y-2 text-xs">
                    {/* Local Path with Copy */}
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="font-mono text-[11px] truncate flex-1 mr-2">{proj.localPath}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(`cd ${proj.localPath}`, `path-${proj.id}`);
                        }}
                        className="p-1 hover:text-white rounded transition-colors"
                        title="复制 cd 路径"
                      >
                        {copiedSnippetId === `path-${proj.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Dual Tab: Issues / Code Snippets */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          {/* Tab buttons */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'issues'
                  ? 'bg-cyan-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              需求与 Bug 看板 ({filteredIssues.length})
            </button>
            <button
              onClick={() => setActiveTab('snippets')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'snippets'
                  ? 'bg-cyan-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              代码片段与命令库 ({data.codeSnippets.length})
            </button>
          </div>

          {/* Project selector if in issues tab */}
          {activeTab === 'issues' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">当前筛选:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">全项目展示</option>
                {data.devProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'snippets' && (
            <button
              onClick={() => setIsAddSnippetOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> 收录片段
            </button>
          )}
        </div>

        {/* Tab 1: Issues */}
        {activeTab === 'issues' && (
          <div className="divide-y divide-neutral-800/80 my-2">
            {filteredIssues.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500">
                暂无关联需求或 Bug，点击右上角新建
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5">{getSeverityBadge(issue.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <h5 className={`text-sm ${issue.status === 'resolved' ? 'line-through text-neutral-500' : 'text-neutral-200 font-medium'}`}>
                        {issue.title}
                      </h5>
                      {issue.notes && (
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{issue.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => updateDevIssue(issue.id, { status: nextStatus(issue.status) })}
                      className="cursor-pointer"
                      title="点击流转状态"
                    >
                      {getStatusBadge(issue.status)}
                    </button>
                    <button
                      onClick={() => deleteDevIssue(issue.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 rounded transition-all"
                      title="删除此项"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Code Snippets */}
        {activeTab === 'snippets' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-3">
            {data.codeSnippets.map((snip) => (
              <div
                key={snip.id}
                className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-sm font-semibold text-neutral-100">{snip.title}</h4>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-900 text-neutral-400 border border-neutral-800">
                      {snip.language}
                    </span>
                  </div>

                  {snip.description && (
                    <p className="text-xs text-neutral-400 mt-1">{snip.description}</p>
                  )}

                  <div className="mt-3 relative">
                    <pre className="bg-neutral-900 border border-neutral-800/80 rounded-lg p-3 text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {snip.code}
                    </pre>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-xs">
                  <div className="flex flex-wrap gap-1">
                    {snip.tags.map((t) => (
                      <span key={t} className="text-[10px] text-neutral-500">#{t}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(snip.code, snip.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] transition-colors"
                    >
                      {copiedSnippetId === snip.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          复制代码
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => deleteCodeSnippet(snip.id)}
                      className="p-1 text-neutral-500 hover:text-rose-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add Project */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setIsAddProjectOpen(false)}>
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-neutral-100">新建本地开发工程</h3>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">项目名称 *</label>
                <input
                  type="text"
                  required
                  placeholder="如：Personal Life Hub"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">简要描述</label>
                <input
                  type="text"
                  placeholder="项目目标与职责"
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">技术栈 (逗号分隔)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Tailwind"
                  value={projStack}
                  onChange={(e) => setProjStack(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">本地工程目录路径</label>
                <input
                  type="text"
                  placeholder="~/workspace/my-app"
                  value={projPath}
                  onChange={(e) => setProjPath(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProjectOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold rounded-xl"
                >
                  保存工程
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Issue */}
      {isAddIssueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setIsAddIssueOpen(false)}>
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-neutral-100">新建开发需求 / 缺陷 Bug</h3>
            <form onSubmit={handleCreateIssue} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">优先级 *</label>
                <div className="flex gap-2">
                  {(['P0', 'P1', 'P2'] as IssueSeverity[]).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setIssueSeverity(s)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        issueSeverity === s
                          ? s === 'P0' ? 'bg-rose-500/20 text-rose-300 border-rose-500' : s === 'P1' ? 'bg-amber-500/20 text-amber-300 border-amber-500' : 'bg-sky-500/20 text-sky-300 border-sky-500'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">问题或功能简述 *</label>
                <input
                  type="text"
                  required
                  placeholder="如：修复支付接入回调的边界异常处理"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">详情排查备忘</label>
                <textarea
                  rows={3}
                  placeholder="复现路径、报错堆栈或解决方案思路..."
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddIssueOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold rounded-xl"
                >
                  记录待办
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Snippet */}
      {isAddSnippetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setIsAddSnippetOpen(false)}>
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-neutral-100">收录高频代码片段 / 命令</h3>
            <form onSubmit={handleCreateSnippet} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">片段标题 *</label>
                <input
                  type="text"
                  required
                  placeholder="如：Docker 容器与镜像一键清理"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">语法语言</label>
                  <input
                    type="text"
                    placeholder="bash / typescript / sql"
                    value={snippetLang}
                    onChange={(e) => setSnippetLang(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">分类标签</label>
                  <input
                    type="text"
                    placeholder="Docker, DevOps"
                    value={snippetTags}
                    onChange={(e) => setSnippetTags(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">代码正文 *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="在此贴入代码或命令行指令..."
                  value={snippetCode}
                  onChange={(e) => setSnippetCode(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">用途说明</label>
                <input
                  type="text"
                  placeholder="简要说明此片段适用场景..."
                  value={snippetDesc}
                  onChange={(e) => setSnippetDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSnippetOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold rounded-xl"
                >
                  收录片段
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Project Confirmation */}
      {projectToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setProjectToDelete(null)}
        >
          <div
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-100">确认删除该工程项目？</h3>
                <p className="text-xs text-neutral-400">此操作无法撤销</p>
              </div>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800/80 space-y-1.5 text-xs">
              <div className="text-neutral-200 font-medium">{projectToDelete.name}</div>
              <div className="text-neutral-500 font-mono text-[11px] truncate">{projectToDelete.localPath}</div>
              <p className="text-rose-400/90 text-[11px] pt-1.5 border-t border-neutral-850">
                ⚠️ 注意：删除此项目将同步清除关联的 {data.devIssues.filter((i) => i.projectId === projectToDelete.id).length} 条需求与 Bug 记录。
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                id="confirm-delete-project-btn"
                onClick={() => {
                  const idToDelete = projectToDelete.id;
                  deleteDevProject(idToDelete);
                  if (selectedProjectId === idToDelete) {
                    setSelectedProjectId('all');
                  }
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-neutral-950 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
