/**
 * 个人工作生活专属 APP - 全局数据与调度上下文 (React Context)
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AppData,
  ModuleId,
  BigThreeItem,
  DailyTask,
  PomodoroState,
  ContentItem,
  ContentStage,
  DevProject,
  DevIssue,
  CodeSnippet,
  ConsultingClient,
  ConsultingRecord,
  WorkoutLog,
  DietLog,
  GameItem,
  BookItem,
  BookNote,
  QuickNote,
  MeetingLog,
  ThemeMode,
  ResolvedTheme,
} from '../types';
import {
  loadAppData,
  saveAppData,
  validateBackupJson,
  STORAGE_KEY,
} from '../services/storage';
import { getInitialData, getTodayDateString } from '../data/initialData';

export const THEME_STORAGE_KEY = 'my_life_hub_theme_mode';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warn';
}

interface AppContextType {
  data: AppData;
  activeModule: ModuleId;
  setActiveModule: (mod: ModuleId) => void;
  isScratchpadOpen: boolean;
  setIsScratchpadOpen: (open: boolean) => void;
  lastSavedText: string;
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warn') => void;

  // 主题三态与解析
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: ResolvedTheme;

  // 1. 闪念备忘
  addQuickNote: (content: string) => void;
  deleteQuickNote: (id: string) => void;
  forwardQuickNote: (id: string, target: 'content' | 'dev') => void;

  // 2. 今日计划 & 番茄钟
  addBigThree: (title: string) => void;
  toggleBigThree: (id: string) => void;
  deleteBigThree: (id: string) => void;
  addDailyTask: (task: Omit<DailyTask, 'id' | 'createdAt'>) => void;
  toggleDailyTask: (id: string) => void;
  deleteDailyTask: (id: string) => void;
  updatePomodoro: (updates: Partial<PomodoroState>) => void;

  // 3. 自媒体
  addContent: (item: Omit<ContentItem, 'id' | 'createdAt'>) => void;
  updateContentStage: (id: string, stage: ContentStage) => void;
  updateContent: (id: string, updates: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;

  // 4. 开发工作
  addDevProject: (proj: Omit<DevProject, 'id' | 'createdAt'>) => void;
  deleteDevProject: (id: string) => void;
  addDevIssue: (issue: Omit<DevIssue, 'id' | 'createdAt'>) => void;
  updateDevIssue: (id: string, updates: Partial<DevIssue>) => void;
  deleteDevIssue: (id: string) => void;
  addCodeSnippet: (snip: Omit<CodeSnippet, 'id' | 'createdAt'>) => void;
  deleteCodeSnippet: (id: string) => void;

  // 5. 咨询工作
  addConsultingClient: (client: Omit<ConsultingClient, 'id' | 'createdAt'>) => void;
  updateConsultingClient: (id: string, updates: Partial<ConsultingClient>) => void;
  deleteConsultingClient: (id: string) => void;
  addConsultingRecord: (rec: Omit<ConsultingRecord, 'id' | 'createdAt'>) => void;
  deleteConsultingRecord: (id: string) => void;
  toggleConsultingActionItem: (recId: string, actionId: string) => void;
  addMeetingLog: (clientId: string, log: Omit<MeetingLog, 'id'>) => void;
  toggleDeliverable: (clientId: string, deliverableId: string) => void;

  // 6. 健身计划
  addWorkout: (wo: Omit<WorkoutLog, 'id' | 'createdAt'>) => void;
  updateWorkout: (id: string, updates: Partial<WorkoutLog>) => void;
  deleteWorkout: (id: string) => void;
  clearAllWorkouts: () => void;
  addWorkoutLog: (wo: Omit<WorkoutLog, 'id' | 'createdAt'>) => void;
  updateWorkoutLog: (id: string, updates: Partial<WorkoutLog>) => void;
  deleteWorkoutLog: (id: string) => void;

  // 7. 饮食与饮水
  addDietLog: (diet: Omit<DietLog, 'id' | 'createdAt'>) => void;
  deleteDietLog: (id: string) => void;
  addWaterIntake: (amountMl: number, date?: string) => void;
  resetWaterIntake: (date?: string) => void;

  // 8. 游戏娱乐
  addGame: (game: Omit<GameItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGame: (id: string, updates: Partial<GameItem>) => void;
  deleteGame: (id: string) => void;

  // 9. 深度阅读
  addBook: (book: Omit<BookItem, 'id' | 'createdAt' | 'updatedAt' | 'notes'> & { initialNote?: string }) => void;
  updateBook: (id: string, updates: Partial<BookItem>) => void;
  deleteBook: (id: string) => void;
  updateBookProgress: (id: string, currentPage: number) => void;
  addBookNote: (bookId: string, note: Omit<BookNote, 'id' | 'createdAt'>) => void;
  deleteBookNote: (bookId: string, noteId: string) => void;
  clearAllBooks: () => void;

  // 10. 数据导入导出与重置
  importBackupData: (jsonString: string) => { success: boolean; message: string };
  restoreFromBackup: (jsonString: string) => boolean;
  resetDataToInitial: () => void;
  resetToDefaultData: () => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [lastSavedText, setLastSavedText] = useState('已就绪');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // 主题三态管理：'system' | 'light' | 'dark'，默认跟随系统
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          return saved;
        }
      } catch {
        // fallback
      }
    }
    return 'system';
  });

  // 系统原生明暗偏好检测
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // 监听操作系统深浅色偏好变更，实时响应
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    // 初始化同步一次
    updateSystemTheme(mediaQuery);

    const handler = (e: MediaQueryListEvent) => {
      updateSystemTheme(e);
    };

    mediaQuery.addEventListener('change', handler);
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  // 计算当前最终生效的主题 (resolvedTheme)
  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  // 将主题实时同步至 html documentElement (class 与 data-theme 属性)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [resolvedTheme]);

  // 手动切换主题并持久化至本地存储
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 2800);
  }, []);

  // 核心数据变更时自动写入 LocalStorage
  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev);
      saveAppData(next);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setLastSavedText(`已实时保存 (${timeStr})`);
      return next;
    });
  }, []);

  // 1. 闪念备忘操作
  const addQuickNote = useCallback((content: string) => {
    if (!content.trim()) return;
    const now = new Date();
    const timeStr = `${getTodayDateString()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newNote: QuickNote = {
      id: `note-${Date.now()}`,
      content: content.trim(),
      createdAt: timeStr,
    };
    updateData((prev) => ({
      ...prev,
      quickNotes: [newNote, ...prev.quickNotes],
    }));
    showToast('便签已保存至本地');
  }, [updateData, showToast]);

  const deleteQuickNote = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      quickNotes: prev.quickNotes.filter((n) => n.id !== id),
    }));
    showToast('便签已删除', 'info');
  }, [updateData, showToast]);

  const forwardQuickNote = useCallback((id: string, target: 'content' | 'dev') => {
    updateData((prev) => {
      const note = prev.quickNotes.find((n) => n.id === id);
      if (!note) return prev;

      const today = getTodayDateString();
      let updatedContents = prev.contents;
      let updatedIssues = prev.devIssues;

      if (target === 'content') {
        const newContent: ContentItem = {
          id: `cnt-${Date.now()}`,
          title: note.content.slice(0, 40),
          stage: 'idea',
          outlineNotes: `来自闪念速记：${note.content}`,
          platforms: ['B站', '小红书'],
          createdAt: today,
        };
        updatedContents = [newContent, ...updatedContents];
      } else if (target === 'dev') {
        const defaultProjectId = prev.devProjects[0]?.id || 'proj-1';
        const newIssue: DevIssue = {
          id: `issue-${Date.now()}`,
          projectId: defaultProjectId,
          title: note.content.slice(0, 50),
          severity: 'P2',
          status: 'todo',
          notes: `来自闪念速记：${note.content}`,
          createdAt: today,
        };
        updatedIssues = [newIssue, ...updatedIssues];
      }

      const updatedNotes = prev.quickNotes.map((n) =>
        n.id === id ? { ...n, forwardedTo: target } : n
      );

      return {
        ...prev,
        quickNotes: updatedNotes,
        contents: updatedContents,
        devIssues: updatedIssues,
      };
    });

    showToast(target === 'content' ? '已流转至自媒体选题池' : '已流转至开发工作待办');
  }, [updateData, showToast]);

  // 2. 今日计划
  const addBigThree = useCallback((title: string) => {
    if (!title.trim()) return;
    const newItem: BigThreeItem = {
      id: `b3-${Date.now()}`,
      title: title.trim(),
      done: false,
      createdAt: getTodayDateString(),
    };
    updateData((prev) => ({
      ...prev,
      bigThree: [...prev.bigThree, newItem],
    }));
    showToast('已添加今日核心大事');
  }, [updateData, showToast]);

  const toggleBigThree = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      bigThree: prev.bigThree.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    }));
  }, [updateData]);

  const deleteBigThree = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      bigThree: prev.bigThree.filter((item) => item.id !== id),
    }));
  }, [updateData]);

  const addDailyTask = useCallback((task: Omit<DailyTask, 'id' | 'createdAt'>) => {
    const newTask: DailyTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: getTodayDateString(),
    };
    updateData((prev) => ({
      ...prev,
      dailyTasks: [...prev.dailyTasks, newTask],
    }));
    showToast('日程已安排');
  }, [updateData, showToast]);

  const toggleDailyTask = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      dailyTasks: prev.dailyTasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    }));
  }, [updateData]);

  const deleteDailyTask = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      dailyTasks: prev.dailyTasks.filter((t) => t.id !== id),
    }));
  }, [updateData]);

  const updatePomodoro = useCallback((updates: Partial<PomodoroState>) => {
    updateData((prev) => ({
      ...prev,
      pomodoro: { ...prev.pomodoro, ...updates },
    }));
  }, [updateData]);

  // 3. 自媒体
  const addContent = useCallback((item: Omit<ContentItem, 'id' | 'createdAt'>) => {
    const newItem: ContentItem = {
      ...item,
      id: `cnt-${Date.now()}`,
      createdAt: getTodayDateString(),
    };
    updateData((prev) => ({
      ...prev,
      contents: [newItem, ...prev.contents],
    }));
    showToast('内容选题已创建');
  }, [updateData, showToast]);

  const updateContentStage = useCallback((id: string, stage: ContentStage) => {
    updateData((prev) => ({
      ...prev,
      contents: prev.contents.map((c) => (c.id === id ? { ...c, stage } : c)),
    }));
    showToast(`阶段已流转至: ${stage}`);
  }, [updateData, showToast]);

  const updateContent = useCallback((id: string, updates: Partial<ContentItem>) => {
    updateData((prev) => ({
      ...prev,
      contents: prev.contents.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    showToast('内容已更新');
  }, [updateData, showToast]);

  const deleteContent = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      contents: prev.contents.filter((c) => c.id !== id),
    }));
    showToast('内容条目已移除', 'info');
  }, [updateData, showToast]);

  // 4. 开发工作
  const addDevProject = useCallback((proj: Omit<DevProject, 'id' | 'createdAt'>) => {
    const newProj: DevProject = {
      ...proj,
      id: `proj-${Date.now()}`,
      createdAt: getTodayDateString(),
    };
    updateData((prev) => ({
      ...prev,
      devProjects: [...prev.devProjects, newProj],
    }));
    showToast('项目已建立');
  }, [updateData, showToast]);

  const deleteDevProject = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      devProjects: prev.devProjects.filter((p) => p.id !== id),
      devIssues: prev.devIssues.filter((i) => i.projectId !== id),
    }));
    showToast('项目及其问题已删除', 'info');
  }, [updateData, showToast]);

  const addDevIssue = useCallback((issue: Omit<DevIssue, 'id' | 'createdAt'>) => {
    const newIssue: DevIssue = {
      ...issue,
      id: `issue-${Date.now()}`,
      createdAt: getTodayDateString(),
    };
    updateData((prev) => ({
      ...prev,
      devIssues: [newIssue, ...prev.devIssues],
    }));
    showToast('已记录开发需求/Bug');
  }, [updateData, showToast]);

  const updateDevIssue = useCallback((id: string, updates: Partial<DevIssue>) => {
    updateData((prev) => ({
      ...prev,
      devIssues: prev.devIssues.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    }));
  }, [updateData]);

  const deleteDevIssue = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      devIssues: prev.devIssues.filter((i) => i.id !== id),
    }));
  }, [updateData]);

  const addCodeSnippet = useCallback((snip: Omit<CodeSnippet, 'id' | 'createdAt'>) => {
    const newSnip: CodeSnippet = {
      ...snip,
      id: `snip-${Date.now()}`,
      createdAt: getTodayDateString(),
    };
    updateData((prev) => ({
      ...prev,
      codeSnippets: [newSnip, ...prev.codeSnippets],
    }));
    showToast('代码片段已收录');
  }, [updateData, showToast]);

  const deleteCodeSnippet = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      codeSnippets: prev.codeSnippets.filter((s) => s.id !== id),
    }));
    showToast('代码片段已删除', 'info');
  }, [updateData, showToast]);

  // 5. 咨询工作
  const addConsultingClient = useCallback((client: Omit<ConsultingClient, 'id' | 'createdAt'>) => {
    const newClient: ConsultingClient = {
      ...client,
      id: `client-${Date.now()}`,
      createdAt: getTodayDateString(),
    };
    updateData((prev) => ({
      ...prev,
      consultingClients: [newClient, ...prev.consultingClients],
    }));
    showToast('客户档案已收录');
  }, [updateData, showToast]);

  const updateConsultingClient = useCallback((id: string, updates: Partial<ConsultingClient>) => {
    updateData((prev) => ({
      ...prev,
      consultingClients: prev.consultingClients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    showToast('客户信息已更新');
  }, [updateData, showToast]);

  const deleteConsultingClient = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      consultingClients: prev.consultingClients.filter((c) => c.id !== id),
      consultingRecords: prev.consultingRecords.filter((r) => r.clientId !== id),
    }));
    showToast('客户档案已删除', 'info');
  }, [updateData, showToast]);

  const addConsultingRecord = useCallback((rec: Omit<ConsultingRecord, 'id' | 'createdAt'>) => {
    const newRec: ConsultingRecord = {
      ...rec,
      id: `rec-${Date.now()}`,
      createdAt: getTodayDateString(),
    };
    updateData((prev) => ({
      ...prev,
      consultingRecords: [newRec, ...prev.consultingRecords],
    }));
    showToast('咨询纪要已保存');
  }, [updateData, showToast]);

  const deleteConsultingRecord = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      consultingRecords: prev.consultingRecords.filter((r) => r.id !== id),
    }));
    showToast('咨询记录已删除', 'info');
  }, [updateData, showToast]);

  const toggleConsultingActionItem = useCallback((recId: string, actionId: string) => {
    updateData((prev) => ({
      ...prev,
      consultingRecords: prev.consultingRecords.map((rec) => {
        if (rec.id !== recId) return rec;
        return {
          ...rec,
          actionItems: rec.actionItems.map((a) => (a.id === actionId ? { ...a, done: !a.done } : a)),
        };
      }),
    }));
  }, [updateData]);

  const addMeetingLog = useCallback((clientId: string, log: Omit<MeetingLog, 'id'>) => {
    const newLog: MeetingLog = {
      ...log,
      id: `mtg-${Date.now()}`,
    };
    updateData((prev) => ({
      ...prev,
      consultingClients: prev.consultingClients.map((c) =>
        c.id === clientId
          ? {
              ...c,
              meetingLogs: [newLog, ...(c.meetingLogs || [])],
            }
          : c
      ),
    }));
    showToast('会议纪要已添加');
  }, [updateData, showToast]);

  const toggleDeliverable = useCallback((clientId: string, deliverableId: string) => {
    updateData((prev) => ({
      ...prev,
      consultingClients: prev.consultingClients.map((c) => {
        if (c.id !== clientId || !c.deliverables) return c;
        return {
          ...c,
          deliverables: c.deliverables.map((d) =>
            d.id === deliverableId ? { ...d, completed: !d.completed } : d
          ),
        };
      }),
    }));
  }, [updateData]);

  // 6. 健身计划
  const addWorkout = useCallback((wo: Omit<WorkoutLog, 'id' | 'createdAt'>) => {
    const newWo: WorkoutLog = {
      ...wo,
      id: `wo-${Date.now()}`,
      createdAt: getTodayDateString(),
    };
    updateData((prev) => ({
      ...prev,
      workouts: [newWo, ...prev.workouts],
    }));
    showToast('今日训练计划已记录');
  }, [updateData, showToast]);

  const updateWorkout = useCallback((id: string, updates: Partial<WorkoutLog>) => {
    updateData((prev) => ({
      ...prev,
      workouts: prev.workouts.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }));
  }, [updateData]);

  const deleteWorkout = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      workouts: prev.workouts.filter((w) => w.id !== id),
    }));
    showToast('训练记录已移除', 'info');
  }, [updateData, showToast]);

  const clearAllWorkouts = useCallback(() => {
    updateData((prev) => ({
      ...prev,
      workouts: [],
    }));
    showToast('全部健身训练数据已清空', 'info');
  }, [updateData, showToast]);

  // 7. 饮食与饮水
  const addDietLog = useCallback((diet: Omit<DietLog, 'id' | 'createdAt'>) => {
    const newDiet: DietLog = {
      ...diet,
      id: `diet-${Date.now()}`,
      createdAt: `${getTodayDateString()} ${new Date().toTimeString().slice(0, 5)}`,
    };
    updateData((prev) => ({
      ...prev,
      dietLogs: [newDiet, ...prev.dietLogs],
    }));
    showToast('餐食记录已打卡');
  }, [updateData, showToast]);

  const deleteDietLog = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      dietLogs: prev.dietLogs.filter((d) => d.id !== id),
    }));
  }, [updateData]);

  const addWaterIntake = useCallback((amountMl: number, targetDate?: string) => {
    const date = targetDate || getTodayDateString();
    updateData((prev) => {
      const existing = prev.waterRecords[date] || { date, currentMl: 0, targetMl: 2000 };
      const nextMl = Math.max(0, existing.currentMl + amountMl);
      return {
        ...prev,
        waterRecords: {
          ...prev.waterRecords,
          [date]: {
            ...existing,
            currentMl: nextMl,
          },
        },
      };
    });
    if (amountMl > 0) {
      showToast(`饮水 +${amountMl}ml 💧`);
    }
  }, [updateData, showToast]);

  const resetWaterIntake = useCallback((targetDate?: string) => {
    const date = targetDate || getTodayDateString();
    updateData((prev) => ({
      ...prev,
      waterRecords: {
        ...prev.waterRecords,
        [date]: {
          date,
          currentMl: 0,
          targetMl: 2000,
        },
      },
    }));
    showToast('今日饮水量已重置', 'info');
  }, [updateData, showToast]);

  // 8. 游戏娱乐
  const addGame = useCallback((game: Omit<GameItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const today = getTodayDateString();
    const newGame: GameItem = {
      ...game,
      id: `game-${Date.now()}`,
      createdAt: today,
      updatedAt: today,
    };
    updateData((prev) => ({
      ...prev,
      games: [newGame, ...prev.games],
    }));
    showToast('游戏已收录入库');
  }, [updateData, showToast]);

  const updateGame = useCallback((id: string, updates: Partial<GameItem>) => {
    updateData((prev) => ({
      ...prev,
      games: prev.games.map((g) =>
        g.id === id ? { ...g, ...updates, updatedAt: getTodayDateString() } : g
      ),
    }));
    showToast('游玩进度已更新');
  }, [updateData, showToast]);

  const deleteGame = useCallback((id: string) => {
    updateData((prev) => ({
      ...prev,
      games: prev.games.filter((g) => g.id !== id),
    }));
    showToast('游戏已从库中移除', 'info');
  }, [updateData, showToast]);

  // 9. 深度阅读与笔记
  const addBook = useCallback(
    (book: Omit<BookItem, 'id' | 'createdAt' | 'updatedAt' | 'notes'> & { initialNote?: string }) => {
      const today = getTodayDateString();
      const initialNotes: BookNote[] = book.initialNote?.trim()
        ? [
            {
              id: `bn-${Date.now()}`,
              content: book.initialNote.trim(),
              createdAt: today,
            },
          ]
        : [];

      const newBook: BookItem = {
        id: `book-${Date.now()}`,
        title: book.title,
        author: book.author,
        category: book.category,
        totalPages: Math.max(1, book.totalPages),
        currentPage: Math.min(Math.max(0, book.currentPage), book.totalPages),
        status: book.status || (book.currentPage >= book.totalPages ? 'completed' : 'reading'),
        rating: book.rating,
        thoughts: book.thoughts,
        startDate: book.startDate || today,
        completedDate: book.status === 'completed' || book.currentPage >= book.totalPages ? today : book.completedDate,
        notes: initialNotes,
        createdAt: today,
        updatedAt: today,
      };

      updateData((prev) => ({
        ...prev,
        books: [newBook, ...(prev.books || [])],
      }));
      showToast(`《${newBook.title}》已收入书架 📖`);
    },
    [updateData, showToast]
  );

  const updateBook = useCallback(
    (id: string, updates: Partial<BookItem>) => {
      const today = getTodayDateString();
      updateData((prev) => ({
        ...prev,
        books: (prev.books || []).map((b) => {
          if (b.id !== id) return b;
          const merged = { ...b, ...updates, updatedAt: today };
          if (typeof updates.currentPage === 'number') {
            if (updates.currentPage >= merged.totalPages && merged.status !== 'completed') {
              merged.status = 'completed';
              merged.completedDate = today;
            }
          }
          return merged;
        }),
      }));
      showToast('书籍信息已更新');
    },
    [updateData, showToast]
  );

  const updateBookProgress = useCallback(
    (id: string, newCurrentPage: number) => {
      const today = getTodayDateString();
      updateData((prev) => ({
        ...prev,
        books: (prev.books || []).map((b) => {
          if (b.id !== id) return b;
          const validPage = Math.min(Math.max(0, newCurrentPage), b.totalPages);
          const isFinished = validPage >= b.totalPages;
          return {
            ...b,
            currentPage: validPage,
            status: isFinished ? 'completed' : b.status === 'completed' && validPage < b.totalPages ? 'reading' : b.status,
            completedDate: isFinished ? b.completedDate || today : validPage < b.totalPages ? undefined : b.completedDate,
            updatedAt: today,
          };
        }),
      }));
      showToast(`阅读进度更新至第 ${newCurrentPage} 页 🔖`);
    },
    [updateData, showToast]
  );

  const deleteBook = useCallback(
    (id: string) => {
      updateData((prev) => ({
        ...prev,
        books: (prev.books || []).filter((b) => b.id !== id),
      }));
      showToast('书籍已从书架移除', 'info');
    },
    [updateData, showToast]
  );

  const addBookNote = useCallback(
    (bookId: string, note: Omit<BookNote, 'id' | 'createdAt'>) => {
      const today = getTodayDateString();
      const newNote: BookNote = {
        ...note,
        id: `bn-${Date.now()}`,
        createdAt: today,
      };

      updateData((prev) => ({
        ...prev,
        books: (prev.books || []).map((b) =>
          b.id === bookId
            ? {
                ...b,
                notes: [newNote, ...(b.notes || [])],
                updatedAt: today,
              }
            : b
        ),
      }));
      showToast('读书笔记/摘录已保存 ✍️');
    },
    [updateData, showToast]
  );

  const deleteBookNote = useCallback(
    (bookId: string, noteId: string) => {
      updateData((prev) => ({
        ...prev,
        books: (prev.books || []).map((b) =>
          b.id === bookId
            ? {
                ...b,
                notes: (b.notes || []).filter((n) => n.id !== noteId),
                updatedAt: getTodayDateString(),
              }
            : b
        ),
      }));
      showToast('笔记已删除', 'info');
    },
    [updateData, showToast]
  );

  const clearAllBooks = useCallback(() => {
    updateData((prev) => ({
      ...prev,
      books: [],
    }));
    showToast('全部阅读藏书与笔记已清空', 'info');
  }, [updateData, showToast]);

  // 10. 备份导入与重置
  const importBackupData = useCallback((jsonString: string): { success: boolean; message: string } => {
    const validation = validateBackupJson(jsonString);
    if (!validation.valid || !validation.data) {
      return { success: false, message: validation.error || '数据校验失败' };
    }

    saveAppData(validation.data);
    setData(validation.data);
    showToast('全量数据恢复成功！', 'success');
    return { success: true, message: '数据已成功恢复！' };
  }, [showToast]);

  const resetDataToInitial = useCallback(() => {
    const initial = getInitialData();
    saveAppData(initial);
    setData(initial);
    showToast('已重置为官方体验示例数据', 'info');
  }, [showToast]);

  const resetToDefaultData = resetDataToInitial;

  const restoreFromBackup = useCallback((jsonString: string): boolean => {
    const res = importBackupData(jsonString);
    return res.success;
  }, [importBackupData]);

  const addWorkoutLog = addWorkout;
  const updateWorkoutLog = updateWorkout;
  const deleteWorkoutLog = deleteWorkout;

  const clearAllData = useCallback(() => {
    const empty: AppData = {
      schemaVersion: '1.0.0',
      quickNotes: [],
      bigThree: [],
      dailyTasks: [],
      pomodoro: {
        mode: 'work',
        workMinutes: 25,
        breakMinutes: 5,
        timeLeftSeconds: 25 * 60,
        isRunning: false,
      },
      contents: [],
      devProjects: [],
      devIssues: [],
      codeSnippets: [],
      consultingClients: [],
      consultingRecords: [],
      workouts: [],
      dietLogs: [],
      waterRecords: {},
      games: [],
      books: [],
    };
    saveAppData(empty);
    setData(empty);
    showToast('本地数据已全部清空', 'warn');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        data,
        activeModule,
        setActiveModule,
        isScratchpadOpen,
        setIsScratchpadOpen,
        lastSavedText,
        toast,
        showToast,

        addQuickNote,
        deleteQuickNote,
        forwardQuickNote,

        addBigThree,
        toggleBigThree,
        deleteBigThree,
        addDailyTask,
        toggleDailyTask,
        deleteDailyTask,
        updatePomodoro,

        addContent,
        updateContentStage,
        updateContent,
        deleteContent,

        addDevProject,
        deleteDevProject,
        addDevIssue,
        updateDevIssue,
        deleteDevIssue,
        addCodeSnippet,
        deleteCodeSnippet,

        addConsultingClient,
        updateConsultingClient,
        deleteConsultingClient,
        addConsultingRecord,
        deleteConsultingRecord,
        toggleConsultingActionItem,
        addMeetingLog,
        toggleDeliverable,

        addWorkout,
        updateWorkout,
        deleteWorkout,
        clearAllWorkouts,
        addWorkoutLog,
        updateWorkoutLog,
        deleteWorkoutLog,

        addDietLog,
        deleteDietLog,
        addWaterIntake,
        resetWaterIntake,

        addGame,
        updateGame,
        deleteGame,

        addBook,
        updateBook,
        deleteBook,
        updateBookProgress,
        addBookNote,
        deleteBookNote,
        clearAllBooks,

        importBackupData,
        restoreFromBackup,
        resetDataToInitial,
        resetToDefaultData,
        clearAllData,

        theme,
        setTheme,
        resolvedTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp 必须在 AppProvider 内部使用');
  }
  return context;
};
