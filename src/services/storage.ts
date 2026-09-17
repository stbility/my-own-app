/**
 * 个人工作生活专属 APP - 本地存储与持久化服务 (纯单机无依赖)
 */
import { AppData, BackupDataSchema } from '../types';
import { getInitialData } from '../data/initialData';

export const STORAGE_KEY = 'MY_LIFE_HUB_V1_DATA';

// 兼容 Node.js 测试与浏览器环境的 Storage 获取
function getStorage(customStorage?: Storage): Storage | null {
  if (customStorage) return customStorage;
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * 从本地持久化存储加载全量数据，若不存在或异常则自动使用初始预置数据
 */
export function loadAppData(customStorage?: Storage): AppData {
  const storage = getStorage(customStorage);
  if (!storage) {
    return getInitialData();
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialData();
      saveAppData(initial, storage);
      return initial;
    }

    const parsed = JSON.parse(raw) as Partial<AppData>;
    const defaultData = getInitialData();

    // 结构合并保障，防止旧数据结构缺少新增字段导致页面崩溃
    return {
      schemaVersion: parsed.schemaVersion || defaultData.schemaVersion,
      quickNotes: Array.isArray(parsed.quickNotes) ? parsed.quickNotes : defaultData.quickNotes,
      bigThree: Array.isArray(parsed.bigThree) ? parsed.bigThree : defaultData.bigThree,
      dailyTasks: Array.isArray(parsed.dailyTasks) ? parsed.dailyTasks : defaultData.dailyTasks,
      pomodoro: parsed.pomodoro || defaultData.pomodoro,
      contents: Array.isArray(parsed.contents) ? parsed.contents : defaultData.contents,
      devProjects: Array.isArray(parsed.devProjects) ? parsed.devProjects : defaultData.devProjects,
      devIssues: Array.isArray(parsed.devIssues) ? parsed.devIssues : defaultData.devIssues,
      codeSnippets: Array.isArray(parsed.codeSnippets) ? parsed.codeSnippets : defaultData.codeSnippets,
      consultingClients: Array.isArray(parsed.consultingClients) ? parsed.consultingClients : defaultData.consultingClients,
      consultingRecords: Array.isArray(parsed.consultingRecords) ? parsed.consultingRecords : defaultData.consultingRecords,
      workouts: (Array.isArray(parsed.workouts) ? parsed.workouts : defaultData.workouts).filter(
        (w: any) => (w.exercises && w.exercises.length > 0) || (w.note && String(w.note).trim().length > 0)
      ),
      dietLogs: Array.isArray(parsed.dietLogs)
        ? parsed.dietLogs.map((d: any) => ({
            ...d,
            foodDescription: d.foodDescription || d.description || '',
            description: d.description || d.foodDescription || '',
            tag: d.tag || (Array.isArray(d.tags) && d.tags.length > 0 ? d.tags[0] : '日常简餐'),
            tags: Array.isArray(d.tags) ? d.tags : d.tag ? [d.tag] : ['日常简餐'],
            feelRating: typeof d.feelRating === 'number' ? d.feelRating : 4,
          }))
        : defaultData.dietLogs,
      waterRecords: parsed.waterRecords && typeof parsed.waterRecords === 'object' ? parsed.waterRecords : defaultData.waterRecords,
      games: Array.isArray(parsed.games) ? parsed.games : defaultData.games,
    };
  } catch (err) {
    console.warn('本地存储数据解析异常，降级加载初始预置数据:', err);
    return getInitialData();
  }
}

/**
 * 将全量数据持久化写入本地存储
 */
export function saveAppData(data: AppData, customStorage?: Storage): boolean {
  const storage = getStorage(customStorage);
  if (!storage) return false;

  try {
    const jsonStr = JSON.stringify(data);
    storage.setItem(STORAGE_KEY, jsonStr);
    return true;
  } catch (err) {
    console.error('保存数据到本地存储失败:', err);
    return false;
  }
}

/**
 * 导出全量数据为标准的备份 JSON 文本
 */
export function exportBackupJson(data: AppData): string {
  const backup: BackupDataSchema = {
    version: '1.0.0',
    appName: '个人工作生活专属APP',
    exportedAt: new Date().toISOString(),
    data,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * 校验并解析外部导入的 JSON 备份字符串
 */
export function validateBackupJson(jsonString: string): {
  valid: boolean;
  data?: AppData;
  error?: string;
} {
  if (!jsonString || typeof jsonString !== 'string') {
    return { valid: false, error: '导入的文件内容为空或不是有效文本。' };
  }

  try {
    const parsed = JSON.parse(jsonString) as Partial<BackupDataSchema & AppData>;
    let targetData: Partial<AppData> | undefined;

    // 支持包装格式 { version, appName, exportedAt, data } 或直接是 AppData 根对象
    if (parsed && typeof parsed === 'object') {
      if ('data' in parsed && parsed.data && typeof parsed.data === 'object') {
        targetData = parsed.data as Partial<AppData>;
      } else if ('schemaVersion' in parsed || 'bigThree' in parsed || 'dailyTasks' in parsed) {
        targetData = parsed as Partial<AppData>;
      }
    }

    if (!targetData) {
      return { valid: false, error: '备份文件格式不匹配，缺少核心数据节点。' };
    }

    const defaultData = getInitialData();
    const cleanData: AppData = {
      schemaVersion: targetData.schemaVersion || '1.0.0',
      quickNotes: Array.isArray(targetData.quickNotes) ? targetData.quickNotes : [],
      bigThree: Array.isArray(targetData.bigThree) ? targetData.bigThree : [],
      dailyTasks: Array.isArray(targetData.dailyTasks) ? targetData.dailyTasks : [],
      pomodoro: targetData.pomodoro || defaultData.pomodoro,
      contents: Array.isArray(targetData.contents) ? targetData.contents : [],
      devProjects: Array.isArray(targetData.devProjects) ? targetData.devProjects : [],
      devIssues: Array.isArray(targetData.devIssues) ? targetData.devIssues : [],
      codeSnippets: Array.isArray(targetData.codeSnippets) ? targetData.codeSnippets : [],
      consultingClients: Array.isArray(targetData.consultingClients) ? targetData.consultingClients : [],
      consultingRecords: Array.isArray(targetData.consultingRecords) ? targetData.consultingRecords : [],
      workouts: Array.isArray(targetData.workouts) ? targetData.workouts : [],
      dietLogs: Array.isArray(targetData.dietLogs)
        ? targetData.dietLogs.map((d: any) => ({
            ...d,
            foodDescription: d.foodDescription || d.description || '',
            description: d.description || d.foodDescription || '',
            tag: d.tag || (Array.isArray(d.tags) && d.tags.length > 0 ? d.tags[0] : '日常简餐'),
            tags: Array.isArray(d.tags) ? d.tags : d.tag ? [d.tag] : ['日常简餐'],
            feelRating: typeof d.feelRating === 'number' ? d.feelRating : 4,
          }))
        : [],
      waterRecords: targetData.waterRecords && typeof targetData.waterRecords === 'object' ? targetData.waterRecords : {},
      games: Array.isArray(targetData.games) ? targetData.games : [],
    };

    return { valid: true, data: cleanData };
  } catch (err) {
    return { valid: false, error: `JSON 语法解析错误: ${err instanceof Error ? err.message : '无效格式'}` };
  }
}

/**
 * 触发浏览器本地直接下载 JSON 文件 (纯前端内存，不请求网络)
 */
export function downloadBackupFile(jsonContent: string, filename?: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const now = new Date();
  const timeTag = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  const actualFilename = filename || `my-life-hub-backup-${timeTag}.json`;

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = actualFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function clearAppData(customStorage?: Storage): void {
  const storage = getStorage(customStorage);
  if (storage) {
    storage.removeItem(STORAGE_KEY);
  }
}

/**
 * 统计本地存储使用情况和各模块实体数量与空间占用
 */
export function getStorageStats(data: AppData, customStorage?: Storage): {
  usedBytes: number;
  usedFormatted: string;
  quotaPercentage: number;
  counts: Record<string, number>;
  moduleSizes: Record<string, { bytes: number; formatted: string }>;
} {
  const jsonString = JSON.stringify(data);
  const usedBytes = new Blob([jsonString]).size;
  const formatSize = (bytes: number) => (bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`);
  const usedFormatted = formatSize(usedBytes);
  // 浏览器 LocalStorage 典型配额约为 5MB (5 * 1024 * 1024 字节)
  const quotaBytes = 5 * 1024 * 1024;
  const quotaPercentage = Math.min(100, Number(((usedBytes / quotaBytes) * 100).toFixed(2)));

  // 仅统计有效训练记录（有动作明细或包含有效心得备注的记录，排除空壳数据）
  const validWorkouts = (data.workouts || []).filter(
    (w) => (w.exercises && w.exercises.length > 0) || (w.note && w.note.trim().length > 0)
  );

  const counts = {
    quickNotes: data.quickNotes.length,
    bigThree: data.bigThree.length,
    dailyTasks: data.dailyTasks.length,
    contents: data.contents.length,
    devProjects: data.devProjects.length,
    devIssues: data.devIssues.length,
    codeSnippets: data.codeSnippets.length,
    consultingClients: data.consultingClients.length,
    consultingRecords: data.consultingRecords.length,
    workouts: validWorkouts.length,
    dietLogs: data.dietLogs.length,
    games: data.games.length,
  };

  const getModuleBytes = (items: any) => {
    if (!items || (Array.isArray(items) && items.length === 0)) return 0;
    return new Blob([JSON.stringify(items)]).size;
  };

  const moduleSizes: Record<string, { bytes: number; formatted: string }> = {
    quickNotes: {
      bytes: getModuleBytes(data.quickNotes),
      formatted: formatSize(getModuleBytes(data.quickNotes)),
    },
    bigThree: {
      bytes: getModuleBytes(data.bigThree),
      formatted: formatSize(getModuleBytes(data.bigThree)),
    },
    dailyTasks: {
      bytes: getModuleBytes(data.dailyTasks),
      formatted: formatSize(getModuleBytes(data.dailyTasks)),
    },
    contents: {
      bytes: getModuleBytes(data.contents),
      formatted: formatSize(getModuleBytes(data.contents)),
    },
    devProjects: {
      bytes: getModuleBytes(data.devProjects),
      formatted: formatSize(getModuleBytes(data.devProjects)),
    },
    devIssues: {
      bytes: getModuleBytes(data.devIssues),
      formatted: formatSize(getModuleBytes(data.devIssues)),
    },
    codeSnippets: {
      bytes: getModuleBytes(data.codeSnippets),
      formatted: formatSize(getModuleBytes(data.codeSnippets)),
    },
    consultingClients: {
      bytes: getModuleBytes(data.consultingClients),
      formatted: formatSize(getModuleBytes(data.consultingClients)),
    },
    consultingRecords: {
      bytes: getModuleBytes(data.consultingRecords),
      formatted: formatSize(getModuleBytes(data.consultingRecords)),
    },
    workouts: {
      bytes: getModuleBytes(validWorkouts),
      formatted: formatSize(getModuleBytes(validWorkouts)),
    },
    dietLogs: {
      bytes: getModuleBytes(data.dietLogs),
      formatted: formatSize(getModuleBytes(data.dietLogs)),
    },
    games: {
      bytes: getModuleBytes(data.games),
      formatted: formatSize(getModuleBytes(data.games)),
    },
  };

  return {
    usedBytes,
    usedFormatted,
    quotaPercentage,
    counts,
    moduleSizes,
  };
}
