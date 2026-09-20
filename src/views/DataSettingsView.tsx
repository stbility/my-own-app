import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getStorageStats, exportBackupJson, validateBackupJson, clearAppData } from '../services/storage';
import {
  Settings2,
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  FileJson,
  Layers,
  Sparkles,
  Palette,
} from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const DataSettingsView: React.FC = () => {
  const { data, restoreFromBackup, resetToDefaultData, showToast, resolvedTheme } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const [pendingImportJson, setPendingImportJson] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<string>('');

  const stats = getStorageStats(data);

  // Handle Export
  const handleExport = () => {
    try {
      const jsonContent = exportBackupJson(data);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.href = url;
      link.download = `my-life-hub-backup-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('备份文件导出成功！可妥善保管此 JSON 文件', 'success');
    } catch (e: any) {
      showToast(`导出失败: ${e.message}`, 'warn');
    }
  };

  // Trigger file select
  const handleFileSelectClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processImportContent(content, file.name);
    };
    reader.readAsText(file);
  };

  // Process and validate imported JSON content
  const processImportContent = (jsonString: string, fileName?: string) => {
    const result = validateBackupJson(jsonString);
    if (!result.valid || !result.data) {
      showToast(`备份文件校验失败: ${result.error}`, 'warn');
      return;
    }

    setPendingImportJson(jsonString);
    setImportSummary(
      `已识别有效备份版本: ${result.data.schemaVersion} · 包含便签 ${result.data.quickNotes.length} 条、核心要事 ${result.data.bigThree.length} 条、自媒体 ${result.data.contents.length} 条、开发项目 ${result.data.devProjects.length} 个、客户档案 ${result.data.consultingClients.length} 位。`
    );
    setIsImportConfirmOpen(true);
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (!pendingImportJson) return;
    const success = restoreFromBackup(pendingImportJson);
    if (success) {
      setIsImportConfirmOpen(false);
      setPendingImportJson(null);
    }
  };

  // Confirm Reset
  const handleConfirmReset = () => {
    resetToDefaultData();
    setIsResetConfirmOpen(false);
  };

  return (
    <div id="data-settings-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-100 tracking-tight flex items-center gap-2.5">
          <Settings2 className="w-6 h-6 text-amber-400" />
          数据与设置 · 本地资产主权
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          当前应用所有数据仅保存在您电脑的浏览器 LocalStorage 中；支持全量无损导出与恢复
        </p>
      </div>

      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />

      {/* 0. Theme & Appearance Settings */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-100">界面外观与主题偏好</h3>
              <p className="text-xs text-neutral-400 mt-0.5">三态实时切换 · 本地持久化保存 · 系统深浅色自适应</p>
            </div>
          </div>
          <span className="text-xs font-mono text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 self-start sm:self-auto">
            当前生效: <strong className="text-amber-400">{resolvedTheme === 'dark' ? '深色模式' : '浅色模式'}</strong>
          </span>
        </div>

        <ThemeToggle variant="full" />
      </div>

      {/* 1. Storage Status & Volume Breakdown */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-100">本地存储空间状态</h3>
              <p className="text-xs text-neutral-400 mt-0.5">浏览器沙盒原生存储 · 零云端泄露风险</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-neutral-950 px-4 py-2 rounded-xl border border-neutral-800">
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">已占用空间</div>
              <div className="text-lg font-bold font-mono text-amber-400">
                {stats.usedFormatted}
              </div>
            </div>
            <div className="h-6 w-px bg-neutral-800" />
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">配额占用比</div>
              <div className="text-lg font-bold font-mono text-emerald-400">
                {stats.quotaPercentage}%
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden p-0.5 border border-neutral-800">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, stats.quotaPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
            <span>0 KB</span>
            <span>当前安全富余 (浏览器通常提供 5MB~10MB 独立单机存储容量)</span>
            <span>5,120 KB</span>
          </div>
        </div>

        {/* Breakdown Tags */}
        <div className="pt-4 border-t border-neutral-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 block">
            各模块数据存量清单
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 block">闪念便签</span>
                <span className="text-[10px] font-mono text-neutral-500">{stats.moduleSizes?.quickNotes?.formatted}</span>
              </div>
              <span className="text-sm font-bold font-mono text-neutral-200 mt-1 block">
                {stats.counts.quickNotes} <span className="text-[10px] font-normal text-neutral-500">条</span>
              </span>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 block">今日要事/日程</span>
                <span className="text-[10px] font-mono text-neutral-500">
                  {((stats.moduleSizes?.bigThree?.bytes || 0) + (stats.moduleSizes?.dailyTasks?.bytes || 0)) < 1024
                    ? `${(stats.moduleSizes?.bigThree?.bytes || 0) + (stats.moduleSizes?.dailyTasks?.bytes || 0)} B`
                    : `${(((stats.moduleSizes?.bigThree?.bytes || 0) + (stats.moduleSizes?.dailyTasks?.bytes || 0)) / 1024).toFixed(1)} KB`}
                </span>
              </div>
              <span className="text-sm font-bold font-mono text-neutral-200 mt-1 block">
                {stats.counts.bigThree + stats.counts.dailyTasks} <span className="text-[10px] font-normal text-neutral-500">项</span>
              </span>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 block">自媒体选题</span>
                <span className="text-[10px] font-mono text-neutral-500">{stats.moduleSizes?.contents?.formatted}</span>
              </div>
              <span className="text-sm font-bold font-mono text-neutral-200 mt-1 block">
                {stats.counts.contents} <span className="text-[10px] font-normal text-neutral-500">篇</span>
              </span>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 block">开发工程/待办</span>
                <span className="text-[10px] font-mono text-neutral-500">{stats.moduleSizes?.devIssues?.formatted}</span>
              </div>
              <span className="text-sm font-bold font-mono text-neutral-200 mt-1 block">
                {stats.counts.devIssues} <span className="text-[10px] font-normal text-neutral-500">个</span>
              </span>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 block">代码片段/命令</span>
                <span className="text-[10px] font-mono text-neutral-500">{stats.moduleSizes?.codeSnippets?.formatted}</span>
              </div>
              <span className="text-sm font-bold font-mono text-neutral-200 mt-1 block">
                {stats.counts.codeSnippets} <span className="text-[10px] font-normal text-neutral-500">条</span>
              </span>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 block">咨询客户</span>
                <span className="text-[10px] font-mono text-neutral-500">{stats.moduleSizes?.consultingClients?.formatted}</span>
              </div>
              <span className="text-sm font-bold font-mono text-neutral-200 mt-1 block">
                {stats.counts.consultingClients} <span className="text-[10px] font-normal text-neutral-500">位</span>
              </span>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 block">健身训练日志</span>
                <span id="workout-storage-size" className="text-[10px] font-mono text-neutral-500">
                  {stats.moduleSizes?.workouts?.formatted || '0 B'}
                </span>
              </div>
              <span id="workout-storage-count" className="text-sm font-bold font-mono text-neutral-200 mt-1 block">
                {stats.counts.workouts} <span className="text-[10px] font-normal text-neutral-500">次</span>
              </span>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 block">饮食记录</span>
                <span className="text-[10px] font-mono text-neutral-500">{stats.moduleSizes?.dietLogs?.formatted}</span>
              </div>
              <span className="text-sm font-bold font-mono text-neutral-200 mt-1 block">
                {stats.counts.dietLogs} <span className="text-[10px] font-normal text-neutral-500">餐</span>
              </span>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 block">游戏娱乐库</span>
                <span className="text-[10px] font-mono text-neutral-500">{stats.moduleSizes?.games?.formatted}</span>
              </div>
              <span className="text-sm font-bold font-mono text-neutral-200 mt-1 block">
                {stats.counts.games} <span className="text-[10px] font-normal text-neutral-500">款</span>
              </span>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 block">阅读与笔记</span>
                <span id="reading-storage-size" className="text-[10px] font-mono text-neutral-500">{stats.moduleSizes?.books?.formatted || '0 B'}</span>
              </div>
              <span id="reading-storage-count" className="text-sm font-bold font-mono text-neutral-200 mt-1 block">
                {stats.counts.books || 0} <span className="text-[10px] font-normal text-neutral-500">本 ({stats.counts.bookNotes || 0}条笔记)</span>
              </span>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <span className="text-neutral-500 block">数据结构版本</span>
              <span className="text-sm font-bold font-mono text-amber-400 mt-1 block">
                v{data.schemaVersion}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Backup & Restore Operation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-100">导出数据备份 (.json)</h3>
                <p className="text-xs text-neutral-400 mt-0.5">将全部 9 大模块完整打包至单机文件</p>
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-4 leading-relaxed">
              建议定期导出备份。即使你更换电脑、清理浏览器缓存或重装系统，只需通过右侧恢复功能导入此 JSON 文件，即可 100% 完美复原所有工作生活数据。
            </p>
          </div>

          <button
            id="export-backup-btn"
            onClick={handleExport}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            立即下载完整备份文件
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-100">恢复备份文件</h3>
                <p className="text-xs text-neutral-400 mt-0.5">从以前导出的 JSON 备份中覆盖恢复</p>
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-4 leading-relaxed">
              系统会在恢复前严格校验 JSON 数据完整性与版本签名。确认后将立即写入当前电脑并实时刷新生效。
            </p>
          </div>

          <button
            id="import-backup-btn"
            onClick={handleFileSelectClick}
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-neutral-950 font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            选择备份 JSON 文件恢复
          </button>
        </div>
      </div>

      {/* 3. Reset to Initial Sample Data & Security Guarantee */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-100">恢复出厂预置数据</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed max-w-xl">
              如果不慎测试填入了杂乱内容，可以一键重置回系统初始的高质量预置示例方案（建议先导出备份当前数据）。
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-4 py-2.5 bg-neutral-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-500/30 text-neutral-300 text-xs font-medium rounded-xl border border-neutral-700 transition-all shrink-0 cursor-pointer"
        >
          重置为初始预置数据
        </button>
      </div>

      {/* Security Statement Card */}
      <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex items-center gap-3 text-xs text-neutral-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-neutral-200">纯单机本地保障：</strong>
          本应用完全离线本地运行，不含任何远程分析统计、无数据库上云、无第三方追踪。数据主权 100% 归属于您。
        </span>
      </div>

      {/* Confirm Modal: Import */}
      {isImportConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setIsImportConfirmOpen(false)}>
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-semibold text-neutral-100">确认导入并覆盖当前数据？</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {importSummary}
            </p>
            <p className="text-xs text-amber-300/80 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              ⚠️ 注意：恢复后将使用备份文件中的内容完全覆盖当前浏览器中的数据。
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportConfirmOpen(false)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-neutral-950 text-xs font-semibold rounded-xl"
              >
                确认恢复并覆盖
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal: Reset */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setIsResetConfirmOpen(false)}>
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-semibold text-neutral-100">确认重置为出厂预置数据？</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              此操作将清空你当前在各模块中添加修改的所有个性化数据，恢复到首次打开时的规范示例数据。
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-neutral-950 text-xs font-semibold rounded-xl"
              >
                确定重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
