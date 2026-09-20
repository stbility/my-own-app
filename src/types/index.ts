/**
 * 个人工作生活专属 APP - 全局强类型定义
 */

export type ModuleId =
  | 'dashboard'
  | 'daily'
  | 'content'
  | 'dev'
  | 'consulting'
  | 'fitness'
  | 'diet'
  | 'reading'
  | 'gaming'
  | 'settings';

// 1. 闪念速记便签
export interface QuickNote {
  id: string;
  content: string;
  createdAt: string;
  forwardedTo?: 'content' | 'dev';
}

// 2. 今日计划模块
export interface BigThreeItem {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

export interface DailyTask {
  id: string;
  title: string;
  timeSlot: string;
  category: 'work' | 'life' | 'health' | 'learning';
  done: boolean;
  createdAt?: string;
}

export interface PomodoroState {
  mode: 'work' | 'break';
  workMinutes: number;
  breakMinutes: number;
  timeLeftSeconds: number;
  isRunning: boolean;
}

// 3. 自媒体模块
export type ContentStage = 'idea' | 'script' | 'production' | 'published';
export type SocialPlatform = 'B站' | '小红书' | '微信公众号' | '抖音' | '知乎' | 'Twitter/X' | '其他';

export interface ContentItem {
  id: string;
  title: string;
  stage: ContentStage;
  targetAudience?: string;
  outlineNotes?: string;
  platforms: SocialPlatform[];
  publishDate?: string;
  views?: number;
  likes?: number;
  reviewNotes?: string;
  createdAt: string;
}

// 4. 开发工作模块
export interface DevProject {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  localPath: string;
  gitRepo: string;
  createdAt: string;
}

export type IssueSeverity = 'P0' | 'P1' | 'P2';
export type IssueStatus = 'todo' | 'in_progress' | 'resolved';

export interface DevIssue {
  id: string;
  projectId: string;
  title: string;
  severity: IssueSeverity;
  status: IssueStatus;
  notes?: string;
  createdAt: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  tags: string[];
  description?: string;
  createdAt: string;
}

// 5. 咨询工作模块
export type ClientStage = 'lead' | 'contacted' | 'proposal' | 'signed' | 'active' | 'completed';

export interface DeliverableItem {
  id: string;
  title: string;
  dueDate?: string;
  completed: boolean;
}

export interface MeetingLog {
  id: string;
  date: string;
  title: string;
  summary: string;
  actionItems: string[];
}

export interface ConsultingClient {
  id: string;
  name: string;
  company: string;
  industry?: string;
  stage: ClientStage;
  contact?: string;
  notes?: string;
  hourlyRate?: number;
  hoursLogged?: number;
  deliverables?: DeliverableItem[];
  meetingLogs?: MeetingLog[];
  createdAt: string;
}

export interface ActionItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ConsultingRecord {
  id: string;
  clientId: string;
  date: string;
  summary: string;
  actionItems: ActionItem[];
  hours: number;
  fee?: number;
  createdAt: string;
}

// 6. 健身计划模块
export interface ExerciseSet {
  id?: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseItem {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  splitType: string;
  exercises: ExerciseItem[];
  bodyWeightKg?: number;
  note?: string;
  completed?: boolean;
  createdAt?: string;
}

// 7. 饮食计划模块
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface DietLog {
  id: string;
  date: string;
  mealType: MealType;
  foodDescription?: string;
  description?: string;
  tag?: string;
  tags?: string[];
  estimatedCalories?: number;
  feelRating?: 1 | 2 | 3 | 4 | 5;
  createdAt?: string;
}

export type DietLogItem = DietLog;

export interface WaterRecord {
  date: string;
  currentMl: number;
  targetMl: number;
}

// 8. 游戏娱乐模块
export type GameStatus = 'playing' | 'wishlist' | 'completed' | 'backlog' | 'abandoned';
export type GamingPlatform = 'Steam' | 'PS5' | 'Switch' | 'PC' | 'Xbox' | '其他' | string;

export interface GameItem {
  id: string;
  title: string;
  platform: GamingPlatform;
  status: GameStatus;
  hoursPlayed: number;
  rating?: number; // 1 - 10
  review?: string;
  updatedAt?: string;
  createdAt?: string;
}

// 9. 深度阅读模块
export type BookStatus = 'reading' | 'completed' | 'wishlist' | 'abandoned';

export interface BookNote {
  id: string;
  pageNumber?: number;
  chapter?: string;
  quote?: string;
  content: string;
  createdAt: string;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  category: string;
  totalPages: number;
  currentPage: number;
  status: BookStatus;
  rating?: number; // 1 - 5
  thoughts?: string;
  startDate?: string;
  completedDate?: string;
  notes: BookNote[];
  createdAt: string;
  updatedAt: string;
}

// 全局状态整包
export interface AppData {
  schemaVersion: string;
  quickNotes: QuickNote[];
  bigThree: BigThreeItem[];
  dailyTasks: DailyTask[];
  pomodoro: PomodoroState;
  contents: ContentItem[];
  devProjects: DevProject[];
  devIssues: DevIssue[];
  codeSnippets: CodeSnippet[];
  consultingClients: ConsultingClient[];
  consultingRecords: ConsultingRecord[];
  workouts: WorkoutLog[];
  dietLogs: DietLog[];
  waterRecords: Record<string, WaterRecord>; // Key is YYYY-MM-DD
  games: GameItem[];
  books: BookItem[];
}

// 灾备导出 JSON 格式
export interface BackupDataSchema {
  version: string;
  appName: string;
  exportedAt: string;
  data: AppData;
}

// 主题模式与解析状态类型
export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

