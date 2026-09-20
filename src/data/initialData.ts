/**
 * 个人工作生活专属 APP - 真实场景初始预置数据
 */
import { AppData } from '../types';

export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getInitialData = (): AppData => {
  const today = getTodayDateString();

  return {
    schemaVersion: '1.0.0',

    // 闪念速记便签
    quickNotes: [
      {
        id: 'note-1',
        content: '思考：利用 LocalStorage + JSON 备份做无依赖单机架构的优劣，写一篇技术复盘。',
        createdAt: `${today} 08:30`,
        forwardedTo: 'content',
      },
      {
        id: 'note-2',
        content: '优化开发工作流里的自动化打包脚本，加一个本地耗时分析。',
        createdAt: `${today} 09:15`,
      },
      {
        id: 'note-3',
        content: '下午咨询准备：带上之前做好的架构性能压测对比图表。',
        createdAt: `${today} 09:45`,
      },
    ],

    // 今日三件核心大事
    bigThree: [
      {
        id: 'b3-1',
        title: '完成自媒体新一期《无后端个人工具设计》文案初稿',
        done: false,
        createdAt: today,
      },
      {
        id: 'b3-2',
        title: '解决企业客户支付接入回调的 P0 级边界异常问题',
        done: true,
        createdAt: today,
      },
      {
        id: 'b3-3',
        title: '晚间力量训练：胸部推力日打卡与 2000ml 饮水达标',
        done: false,
        createdAt: today,
      },
    ],

    // 今日时段日程
    dailyTasks: [
      {
        id: 'task-1',
        title: '晨间复盘与邮件、咨询日程确认',
        timeSlot: '09:00 - 09:30',
        category: 'work',
        done: true,
        createdAt: today,
      },
      {
        id: 'task-2',
        title: '专注开发：调试异步任务队列本地持久化与测试用例',
        timeSlot: '10:00 - 12:00',
        category: 'work',
        done: true,
        createdAt: today,
      },
      {
        id: 'task-3',
        title: '科技企业数字化架构线上技术咨询会',
        timeSlot: '14:30 - 16:00',
        category: 'work',
        done: false,
        createdAt: today,
      },
      {
        id: 'task-4',
        title: '撰写自媒体长图文与脚本',
        timeSlot: '16:30 - 18:00',
        category: 'learning',
        done: false,
        createdAt: today,
      },
      {
        id: 'task-5',
        title: '健身房胸肩力量训练 + 泡沫轴拉伸放松',
        timeSlot: '19:30 - 20:45',
        category: 'health',
        done: false,
        createdAt: today,
      },
      {
        id: 'task-6',
        title: '《黑神话：悟空》或Steam独立游戏放松1小时',
        timeSlot: '21:30 - 22:30',
        category: 'life',
        done: false,
        createdAt: today,
      },
    ],

    // 番茄钟状态
    pomodoro: {
      mode: 'work',
      workMinutes: 25,
      breakMinutes: 5,
      timeLeftSeconds: 25 * 60,
      isRunning: false,
    },

    // 自媒体内容管线
    contents: [
      {
        id: 'cnt-1',
        title: '如何打造一款真正不丢失数据的极简桌面工作台？',
        stage: 'script',
        targetAudience: '独立开发者、数字游民、效率追求者',
        outlineNotes: '1. 痛点：为什么云笔记经常被墙或打不开；2. 架构：前端纯单机持久化实践；3. 实操：JSON备份与结构设计。',
        platforms: ['B站', '微信公众号', '知乎'],
        createdAt: `${today}`,
      },
      {
        id: 'cnt-2',
        title: '程序员如何通过分化训练与科学饮食兼顾高强度工作与体能',
        stage: 'idea',
        targetAudience: '久坐程序员、健身新手',
        outlineNotes: '重点讲解推拉腿分化逻辑和饮水习惯，以及不需繁琐称重的定性饮食法。',
        platforms: ['小红书', 'B站'],
        createdAt: `${today}`,
      },
      {
        id: 'cnt-3',
        title: '前端架构演进：从状态地狱到清晰分层的实战案例',
        stage: 'published',
        targetAudience: '中高级前端工程师',
        outlineNotes: '已发布视频，反思：封面配色还可以更扁平，评论区对状态管理对比反响强烈。',
        platforms: ['B站', '微信公众号'],
        publishDate: '2026-09-10',
        views: 12800,
        likes: 940,
        reviewNotes: '完播率 48%，下一次可以在前 30 秒更直接抛出反面典型代码痛点。',
        createdAt: '2026-09-08',
      },
      {
        id: 'cnt-4',
        title: 'Steam Deck / PS5 双修玩家的年度神作盘点与时间管理',
        stage: 'production',
        targetAudience: '主机单机游戏玩家',
        outlineNotes: '录制素材已剪辑60%，还差结尾总结和打分画板。',
        platforms: ['B站', '小红书'],
        createdAt: `${today}`,
      },
      {
        id: 'cnt-5',
        title: '为什么我不推荐普通人学微服务？单体优先与模块化演进',
        stage: 'published',
        targetAudience: '后端架构师、全栈工程师',
        outlineNotes: '用真实业务演进案例论述单体在中小团队的巨大效率优势。',
        platforms: ['B站', '知乎', '抖音'],
        publishDate: '2026-09-02',
        views: 24500,
        likes: 1860,
        reviewNotes: '播放量破2万，知乎转发量高，评论区讨论热烈。',
        createdAt: '2026-08-30',
      },
      {
        id: 'cnt-6',
        title: '程序员极简升降桌与双屏护眼工作台搭建心得',
        stage: 'published',
        targetAudience: '久坐办公族、数字游民',
        outlineNotes: '线缆收纳技巧、显示器支架与灯光配置。',
        platforms: ['小红书', 'B站'],
        publishDate: '2026-08-25',
        views: 8900,
        likes: 620,
        reviewNotes: '小红书收藏率超高，适合多产出类似设备类图文视频。',
        createdAt: '2026-08-20',
      },
    ],

    // 开发工作台
    devProjects: [
      {
        id: 'proj-1',
        name: 'Personal Life Hub (当前专属系统)',
        description: '完全单机的桌面端工作生活控制中枢，无登录、无外部后端、纯本地持久化。',
        techStack: ['React 19', 'TypeScript', 'Tailwind CSS', 'Vite'],
        localPath: '~/workspace/personal-life-hub',
        gitRepo: 'https://github.com/myaccount/personal-life-hub.git',
        createdAt: '2026-09-01',
      },
      {
        id: 'proj-2',
        name: 'OmniParser Engine',
        description: '多格式文档与日志本地结构化提取工具引擎。',
        techStack: ['Node.js', 'Rust', 'WebAssembly'],
        localPath: '~/workspace/omni-parser',
        gitRepo: 'https://github.com/myaccount/omni-parser.git',
        createdAt: '2026-08-15',
      },
    ],

    devIssues: [
      {
        id: 'issue-1',
        projectId: 'proj-1',
        title: '解决企业客户支付接入回调的边界异常处理（已打补丁）',
        severity: 'P0',
        status: 'resolved',
        notes: '超时重试幂等性校验已通过模拟测试。',
        createdAt: today,
      },
      {
        id: 'issue-2',
        projectId: 'proj-1',
        title: '新增健身记录“一键复制上一组重量与次数”快捷操作',
        severity: 'P1',
        status: 'in_progress',
        notes: '方便大重量推胸递增时快速录入。',
        createdAt: today,
      },
      {
        id: 'issue-3',
        projectId: 'proj-1',
        title: '支持 JSON 导入前的数据结构完整性校验与友好中文拦截',
        severity: 'P1',
        status: 'todo',
        notes: '确保用户导入非本系统文件时不破坏现有数据。',
        createdAt: today,
      },
      {
        id: 'issue-4',
        projectId: 'proj-2',
        title: '优化大文件流式解析内存占用，避免 GC 抖动',
        severity: 'P2',
        status: 'todo',
        notes: '考虑换用 TypedArray 缓冲池。',
        createdAt: today,
      },
    ],

    codeSnippets: [
      {
        id: 'snip-1',
        title: 'Docker 常用容器与卷快速清理命令',
        language: 'bash',
        tags: ['Docker', 'DevOps', '清理'],
        code: 'docker system prune -a --volumes -f',
        description: '深度清理无用镜像、停止的容器和孤立卷。',
        createdAt: '2026-08-20',
      },
      {
        id: 'snip-2',
        title: 'Git 优雅查看分支图谱历史别名配置',
        language: 'bash',
        tags: ['Git', 'CLI'],
        code: 'git config --global alias.lg "log --color --graph --pretty=format:\'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset\' --abbrev-commit"',
        description: '配置之后运行 git lg 即可查看漂亮的彩色提交树。',
        createdAt: '2026-08-22',
      },
      {
        id: 'snip-3',
        title: '前端纯本地文件安全下载 Blob 工具函数',
        language: 'typescript',
        tags: ['TypeScript', 'Frontend', 'Download'],
        code: `export function downloadJsonFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}`,
        description: '免服务端支持，纯浏览器内存生成文件并下载。',
        createdAt: '2026-09-02',
      },
    ],

    // 咨询业务
    consultingClients: [
      {
        id: 'client-1',
        name: '星瀚科技',
        company: '北京星瀚云智信息技术有限公司',
        industry: '云计算 / SaaS',
        stage: 'active',
        contact: 'CTO 张工 (微信: zhang_cto / zhang@xinghan.com)',
        notes: '当前进行微服务架构重构与单体解耦咨询，每周四下午固定技术复盘。',
        createdAt: '2026-08-10',
      },
      {
        id: 'client-2',
        name: '灵犀互娱',
        company: '广州灵犀数字娱乐网络',
        industry: '游戏研发',
        stage: 'signed',
        contact: '技术总监 李总 (13800000001)',
        notes: '咨询方向为跨端性能分析与资产管线优化，预计下周一开启第一阶段交付。',
        createdAt: '2026-09-05',
      },
      {
        id: 'client-3',
        name: '源生资本',
        company: '源生风险投资顾问',
        industry: '创投机构',
        stage: 'completed',
        contact: '合伙人 王总',
        notes: '已完成 3 家 AI 应用初创团队的技术尽职调查报告交付，已结项并结清费用。',
        createdAt: '2026-07-20',
      },
    ],

    consultingRecords: [
      {
        id: 'rec-1',
        clientId: 'client-1',
        date: today,
        summary: '梳理用户鉴权中心与分布式 Session 拆解方案，讨论渐进式迁移策略。',
        actionItems: [
          { id: 'act-1', text: '出具《渐进式网关路由灰度方案说明书》', done: false },
          { id: 'act-2', text: '提供 JWT 吊销列表 Redis 缓存设计原型', done: true },
        ],
        hours: 2,
        fee: 3000,
        createdAt: today,
      },
      {
        id: 'rec-2',
        clientId: 'client-2',
        date: '2026-09-12',
        summary: '初版需求对齐会议：确定性能调优的基线机型（中端安卓与主流PC）。',
        actionItems: [
          { id: 'act-3', text: '拟定诊断工具清单与测试用例脚本', done: true },
        ],
        hours: 1.5,
        fee: 2250,
        createdAt: '2026-09-12',
      },
    ],

    // 健身计划与记录
    workouts: [
      {
        id: 'wo-1',
        date: today,
        splitType: '胸部/三头',
        bodyWeightKg: 72.5,
        note: '状态不错，卧推第二组冲了 80kg，发力顺畅，无肩袖不适。',
        completed: false,
        exercises: [
          {
            id: 'ex-1',
            name: '杠铃平板卧推',
            sets: [
              { id: 's1', setNumber: 1, weightKg: 60, reps: 12, completed: true },
              { id: 's2', setNumber: 2, weightKg: 75, reps: 8, completed: true },
              { id: 's3', setNumber: 3, weightKg: 80, reps: 6, completed: true },
              { id: 's4', setNumber: 4, weightKg: 70, reps: 10, completed: false },
            ],
          },
          {
            id: 'ex-2',
            name: '上斜哑铃推胸',
            sets: [
              { id: 's5', setNumber: 1, weightKg: 24, reps: 10, completed: false },
              { id: 's6', setNumber: 2, weightKg: 24, reps: 10, completed: false },
              { id: 's7', setNumber: 3, weightKg: 22, reps: 12, completed: false },
            ],
          },
          {
            id: 'ex-3',
            name: '绳索下压（肱三头肌）',
            sets: [
              { id: 's8', setNumber: 1, weightKg: 25, reps: 15, completed: false },
              { id: 's9', setNumber: 2, weightKg: 30, reps: 12, completed: false },
              { id: 's10', setNumber: 3, weightKg: 30, reps: 12, completed: false },
            ],
          },
        ],
        createdAt: today,
      },
      {
        id: 'wo-2',
        date: '2026-09-13',
        splitType: '背部/二头',
        bodyWeightKg: 72.8,
        note: '引体向上自重力竭4组，反握高位下拉泵感明显。',
        completed: true,
        exercises: [
          {
            id: 'ex-4',
            name: '正握引体向上',
            sets: [
              { id: 's11', setNumber: 1, weightKg: 0, reps: 12, completed: true },
              { id: 's12', setNumber: 2, weightKg: 0, reps: 10, completed: true },
              { id: 's13', setNumber: 3, weightKg: 0, reps: 8, completed: true },
            ],
          },
          {
            id: 'ex-5',
            name: '坐姿划船',
            sets: [
              { id: 's14', setNumber: 1, weightKg: 55, reps: 12, completed: true },
              { id: 's15', setNumber: 2, weightKg: 60, reps: 10, completed: true },
            ],
          },
        ],
        createdAt: '2026-09-13',
      },
      {
        id: 'wo-3',
        date: '2026-09-14',
        splitType: '腿部/臀部',
        bodyWeightKg: 72.6,
        note: '深蹲加量冲刺，股四头肌泵感极强。',
        completed: true,
        exercises: [
          {
            id: 'ex-6',
            name: '杠铃深蹲',
            sets: [
              { id: 's16', setNumber: 1, weightKg: 70, reps: 12, completed: true },
              { id: 's17', setNumber: 2, weightKg: 85, reps: 10, completed: true },
              { id: 's18', setNumber: 3, weightKg: 95, reps: 8, completed: true },
              { id: 's19', setNumber: 4, weightKg: 100, reps: 6, completed: true },
            ],
          },
          {
            id: 'ex-7',
            name: '哑铃罗马尼亚硬拉',
            sets: [
              { id: 's20', setNumber: 1, weightKg: 28, reps: 12, completed: true },
              { id: 's21', setNumber: 2, weightKg: 32, reps: 10, completed: true },
              { id: 's22', setNumber: 3, weightKg: 32, reps: 10, completed: true },
            ],
          },
        ],
        createdAt: '2026-09-14',
      },
      {
        id: 'wo-4',
        date: '2026-09-15',
        splitType: '肩部/手臂',
        bodyWeightKg: 72.4,
        note: '哑铃推肩力量平稳，侧平举超级组力竭。',
        completed: true,
        exercises: [
          {
            id: 'ex-8',
            name: '坐姿哑铃推肩',
            sets: [
              { id: 's23', setNumber: 1, weightKg: 18, reps: 12, completed: true },
              { id: 's24', setNumber: 2, weightKg: 20, reps: 10, completed: true },
              { id: 's25', setNumber: 3, weightKg: 22, reps: 8, completed: true },
            ],
          },
          {
            id: 'ex-9',
            name: '站姿哑铃侧平举',
            sets: [
              { id: 's26', setNumber: 1, weightKg: 10, reps: 15, completed: true },
              { id: 's27', setNumber: 2, weightKg: 10, reps: 15, completed: true },
              { id: 's28', setNumber: 3, weightKg: 10, reps: 12, completed: true },
            ],
          },
        ],
        createdAt: '2026-09-15',
      },
    ],

    // 饮食计划
    dietLogs: [
      {
        id: 'diet-1',
        date: today,
        mealType: 'breakfast',
        foodDescription: '两颗水煮蛋 + 黑咖啡 + 全麦贝果半个',
        description: '两颗水煮蛋 + 黑咖啡 + 全麦贝果半个',
        tag: '高蛋白',
        tags: ['高蛋白', '低碳水', '轻食低卡'],
        estimatedCalories: 380,
        feelRating: 5,
        createdAt: `${today} 08:15`,
      },
      {
        id: 'diet-2',
        date: today,
        mealType: 'lunch',
        foodDescription: '香煎鸡胸肉便当 + 西兰花小番茄 + 杂粮米饭',
        description: '香煎鸡胸肉便当 + 西兰花小番茄 + 杂粮米饭',
        tag: '高蛋白',
        tags: ['高蛋白', '蔬菜充足', '轻食低卡'],
        estimatedCalories: 560,
        feelRating: 4,
        createdAt: `${today} 12:30`,
      },
      {
        id: 'diet-3',
        date: '2026-09-14',
        mealType: 'dinner',
        foodDescription: '清蒸鲈鱼半条 + 蒜蓉菜心 + 紫菜蛋花汤',
        description: '清蒸鲈鱼半条 + 蒜蓉菜心 + 紫菜蛋花汤',
        tag: '清淡减脂',
        tags: ['高蛋白', '蔬菜充足', '轻食低卡'],
        estimatedCalories: 420,
        feelRating: 5,
        createdAt: '2026-09-14 19:10',
      },
    ],

    // 今日饮水记录
    waterRecords: {
      [today]: {
        date: today,
        currentMl: 1250,
        targetMl: 2000,
      },
      '2026-09-14': {
        date: '2026-09-14',
        currentMl: 2250,
        targetMl: 2000,
      },
    },

    // 游戏娱乐
    games: [
      {
        id: 'game-1',
        title: '黑神话：悟空 (Black Myth: Wukong)',
        platform: 'PC',
        status: 'playing',
        hoursPlayed: 36,
        rating: 5,
        review: '美术和动作设计顶尖，第三章雪景与黄眉大战让人印象极为深刻。',
        updatedAt: today,
        createdAt: '2026-08-20',
      },
      {
        id: 'game-2',
        title: '塞尔达传说：王国之泪',
        platform: 'Switch',
        status: 'completed',
        hoursPlayed: 110,
        rating: 5,
        review: '究极手与余料建造的物理引擎与开放世界交互设计的极致教科书，已经全神庙通关。',
        updatedAt: '2026-07-15',
        createdAt: '2026-05-15',
      },
      {
        id: 'game-3',
        title: '博德之门 3 (Baldur\'s Gate 3)',
        platform: 'Steam',
        status: 'backlog',
        hoursPlayed: 14,
        rating: 5,
        review: '待二周目邪念线沉浸体验，准备等一个完整的长假期好好探索。',
        updatedAt: '2026-09-01',
        createdAt: '2026-08-01',
      },
      {
        id: 'game-4',
        title: '星刃 (Stellar Blade)',
        platform: 'PS5',
        status: 'completed',
        hoursPlayed: 28,
        rating: 4,
        review: '打击感和格挡反馈非常扎实，战斗节奏明快，音乐好听。',
        updatedAt: '2026-08-18',
        createdAt: '2026-08-05',
      },
    ],

    // 深度阅读与笔记
    books: [
      {
        id: 'book-1',
        title: '纳瓦尔宝典：财富与幸福指南',
        author: '埃里克·乔根森 (Eric Jorgenson)',
        category: '商业思考与认知',
        totalPages: 240,
        currentPage: 168,
        status: 'reading',
        rating: 5,
        startDate: '2026-09-01',
        thoughts: '重读依然深有感触，特别是关于专长、杠杆与无休止责任的阐述。',
        notes: [
          {
            id: 'bn-1',
            chapter: '第一部分：财富',
            pageNumber: 38,
            quote: '依靠出租自己的时间是无法致富的，你必须拥有产权（股权、业务或知识产权）才能获得财务自由。',
            content: '核心在于复利与资产化。不要把自己的时间线性换取金钱，要创造可以反复被调用的代码与媒体。',
            createdAt: '2026-09-05',
          },
          {
            id: 'bn-2',
            chapter: '杠杆的力量',
            pageNumber: 72,
            quote: '代码和媒体是不需要许可的杠杆。它们是新富阶层背后的杠杆。',
            content: '作为开发者和创作者，每一行代码和每一篇深度文章，都是在为自己打造无需许可就能够 7x24 小时运行的数字资产。',
            createdAt: '2026-09-10',
          },
        ],
        createdAt: '2026-09-01',
        updatedAt: today,
      },
      {
        id: 'book-2',
        title: '代码整洁之道 (Clean Code)',
        author: 'Robert C. Martin (Bob大叔)',
        category: '技术工程',
        totalPages: 360,
        currentPage: 360,
        status: 'completed',
        rating: 5,
        startDate: '2026-08-10',
        completedDate: '2026-08-28',
        thoughts: '写出机器能看懂的代码是学徒，写出人类能愉快阅读的代码才是大师。童子军军规受益终身。',
        notes: [
          {
            id: 'bn-3',
            chapter: '有意义的命名',
            pageNumber: 22,
            quote: '名副其实：选个好名字需要时间，但省下来的时间更多。',
            content: '命名不仅要说明它做什么，更要说明它为什么存在以及如何被使用。随时应用童子军军规（离开时让代码比发现时更整洁）。',
            createdAt: '2026-08-15',
          },
        ],
        createdAt: '2026-08-10',
        updatedAt: '2026-08-28',
      },
      {
        id: 'book-3',
        title: '原则 (Principles)',
        author: '瑞·达利欧 (Ray Dalio)',
        category: '思维模型',
        totalPages: 560,
        currentPage: 120,
        status: 'reading',
        rating: 5,
        startDate: '2026-09-12',
        thoughts: '极度求真与极度透明，用机器化与算法化思维拆解生活与决策系统。',
        notes: [
          {
            id: 'bn-4',
            chapter: '生活原则：五步流程',
            pageNumber: 115,
            quote: '痛苦 + 反思 = 进步。不要逃避痛苦，直面真实的自己与现实世界的法则。',
            content: '设定明确目标 -> 发现问题 -> 诊断根本原因 -> 规划方案 -> 坚定执行。',
            createdAt: '2026-09-14',
          },
        ],
        createdAt: '2026-09-12',
        updatedAt: today,
      },
    ],
  };
};
