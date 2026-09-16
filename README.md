# 智一工作台 (my-own-app)

<div align="center">
  <img src="public/brand-icon.jpg" alt="智一工作台 图标" width="128" height="128" style="border-radius: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
  <p><strong>本地运行、数据自持的个人工作与生活管理应用</strong></p>
  <p>
    <a href="https://github.com/stbility/my-own-app">
      <img src="https://img.shields.io/badge/GitHub-stbility%2Fmy--own--app-181717?style=flat-square&logo=github" alt="GitHub Repository" />
    </a>
    <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript" alt="TypeScript 5.8" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Tests-27%20Passed-emerald?style=flat-square" alt="Tests" />
  </p>
</div>

> **品牌名**：智一工作台  
> **定位简介**：本地运行、数据自持的个人工作与生活管理应用，专注个人数据主权与离线可用性。  
> 🔗 开源仓库：[https://github.com/stbility/my-own-app](https://github.com/stbility/my-own-app)

---

## 目录

- [项目简介](#项目简介)
- [核心模块](#核心模块)
- [技术栈](#技术栈)
- [环境要求](#环境要求)
- [安装启动步骤](#安装启动步骤)
- [常用命令](#常用命令)
- [数据存储说明](#数据存储说明)
- [测试说明](#测试说明)

---

## 项目简介

`my-own-app` 是一个专为独立开发者、自媒体创作者及自由职业者打造的个人一体化工作生活看板。系统覆盖日常生产力、项目研发、业务咨询、身心健康及休闲娱乐等核心场景。

所有数据**完全保存在本地浏览器沙盒**中，无需配置外部数据库，无隐私外泄风险，且支持完整无损的 JSON 备份导出与导入恢复。

---

## 核心模块

应用内建 9 大核心功能模块，通过左侧导航栏无缝切换：

1. **首页总览 (Dashboard)**
   - 全局数据概览：今日三大要事完成度、待办事项、活跃开发工程与客户状态。
   - 闪念速记即时便签：支持随时记录并一键流转至「自媒体选题池」或「开发工程待办」。
   - 快速入口跳板与各模块状态卡片。

2. **今日计划 (Daily Plan)**
   - **核心三大要事 (The Big Three)**：聚焦当天最重要的三项高价值成果。
   - **全天日程清单**：按时间段划分的待办列表（支持工作、生活、健康、学习分类）。
   - **极简番茄钟**：工作模式（默认 25 分钟）与休息模式（默认 5 分钟）倒计时，支持暂停与快速重置。

3. **自媒体运营 (Content)**
   - **四阶段内容管线**：灵感选题池（Idea）、脚本撰写（Script）、视频制作（Production）、已发布与复盘（Published）。
   - **多平台分发标识**：支持 B站、小红书、微信公众号、抖音、知乎、Twitter/X 等平台。
   - **视频数据可视化看板**：统计累计播放量、点赞互动数、平均互动率、最高单片播放，提供各视频指标对比横向图表及分发平台占比分布。

4. **开发工程 (Dev Work)**
   - **活跃工程管理**：记录项目名称、技术栈标签、本地目录路径（支持一键复制 cd 命令）、Git 仓库地址。
   - **项目安全删除**：提供项目删除确认弹窗，并自动级联清理关联的需求与缺陷。
   - **需求与缺陷看板**：按 P0 / P1 / P2 严重级过滤，支持待处理（Todo）、进行中（In Progress）、已解决（Resolved）状态流转。
   - **常用代码片段库**：代码语法高亮展示、语言与标签筛选、一键复制代码。

5. **咨询管理 (Consulting)**
   - **客户漏斗管理**：追踪潜在客户（Lead）、已初步沟通、方案报价中、已签约、服务履约中、已归档等阶段。
   - **交付物 (Deliverables) 追踪**：记录客户关联的里程碑交付项与完成状态。
   - **工时统计与咨询记录**：记录咨询日期、服务时长、会议纪要与后续行动项（Action Items）。

6. **健身训练 (Fitness)**
   - **训练日志打卡**：记录分化部位（胸背腿肩手臂等）、训练动作、组数、重量（Kg）与重复次数（Reps）。
   - **训练容量 (Volume) 自动累计**：仅对实际完成打卡的动作组计算有效负荷容量。
   - **月度日历总览**：日历矩阵可视化展示当月训练热力点及动作明细。

7. **饮食与饮水 (Diet)**
   - **饮水追踪打卡**：支持 `+250ml`（一杯）、`+500ml`（一壶）、`+100ml` 快速补充，实时液态进度条与达标提醒，支持每日重置。
   - **三餐日记**：记录早、午、晚餐与加餐，支持饮食明细、预估热量、舒适度评分（1-5 星）与饮食标签。
   - **饮食与训练联动**：与训练日历协同展示当日饮食与身体负荷。

8. **游戏娱乐 (Gaming)**
   - **跨平台游戏书架**：覆盖 Steam、PS5、Switch、PC、Xbox 等平台。
   - **游玩状态流转**：正在游玩（Playing）、心愿清单（Wishlist）、已通关/白金（Completed）。
   - **时长打卡与评测**：支持 `+1h`、`+2h` 快捷记录累计游玩时长，记录评分（1-10 分）与通关回顾。

9. **数据与设置 (Data & Settings)**
   - **本地存储用量仪表盘**：实时展示当前 LocalStorage 已占用字节与容量配额百分比。
   - **完整备份导出**：一键导出包含全部 9 大模块数据的标准 JSON 备份文件。
   - **备份恢复导入**：支持读取外部备份 JSON，校验结构合法性并覆盖恢复本地数据。
   - **出厂预置数据重置**：一键重置回系统初始预置的高质量示例数据。

---

## 技术栈

| 领域 | 技术方案 | 说明 |
| :--- | :--- | :--- |
| **前端框架** | React 19 (`^19.0.1`) | 基于 React 函数式组件与 Hooks 构建 |
| **构建工具** | Vite 6 (`^6.2.3`) | 现代前端极速构建与开发工具 |
| **开发语言** | TypeScript (`~5.8.2`) | 全模块严格类型定义 (`src/types/index.ts`) |
| **样式方案** | Tailwind CSS v4 (`^4.1.14`) | `@tailwindcss/vite` 插件原生接入，暗黑主题沉浸界面 |
| **图标组件** | Lucide React (`^0.546.0`) | 统一的图标风格 |
| **动画效果** | Motion (`^12.23.24`) | 流畅的微交互与界面过渡 |
| **状态管理** | React Context + 自定义 Hooks | `AppContext.tsx` 集中管理全局状态并与存储服务双向同步 |
| **测试框架** | Node.js Test Runner + tsx | 原生 `node:test` 与 `node:assert`，无需额外重量级测试框架 |

---

## 环境要求

在本地运行或构建本项目前，请确保环境中已安装：

- **Node.js**: `v20.0.0` 及以上版本（推荐 `v22.x`，因测试使用了 Node 原生 `--test` 功能）
- **包管理器**: `npm`（v10.x 及以上）或兼容的 `pnpm` / `yarn`

---

## 安装启动步骤

1. **克隆代码仓库**
   ```bash
   git clone https://github.com/stbility/my-own-app
   cd my-own-app
   ```

2. **安装项目依赖**
   ```bash
   npm install
   ```

3. **启动本地开发服务器**
   ```bash
   npm run dev
   ```
   启动后，浏览器访问终端提示的地址（默认为 `http://localhost:3000`）。

4. **构建生产版本产物**
   ```bash
   npm run build
   ```
   构建产物将输出至根目录的 `dist/` 文件夹。

5. **预览构建产物**
   ```bash
   npm run preview
   ```

---

## 常用命令

| 命令 | 功能说明 |
| :--- | :--- |
| `npm run dev` | 启动本地开发服务器（绑定 `0.0.0.0:3000`） |
| `npm run build` | 执行 Vite 生产环境打包构建 |
| `npm run preview` | 本地启动服务器预览生产构建产物 |
| `npm test` | 运行项目中的全套自动化单元测试与集成测试 |
| `npm run lint` | 运行 TypeScript 编译器进行无侵入类型检查 (`tsc --noEmit`) |
| `npm run clean` | 清理构建产物与中间文件 (`rm -rf dist server.js`) |

---

## 数据存储说明

### 1. 存储介质与隐私设计
- **单机存储**：所有业务数据均保存在浏览器的 `window.localStorage` 中，存储键名为：
  ```
  MY_LIFE_HUB_V1_DATA
  ```
- **零云端依赖**：应用不需要任何外部后端服务器、数据库或身份验证系统，数据不会上传到任何第三方服务器，享有完全的单机数据主权。

### 2. 初始化与容错机制
- 首次进入系统或本地存储为空时，系统自动注入完整且规范的初始示例数据（定义于 `src/data/initialData.ts`）。
- 每次读取数据时均执行深层字段容错合并，确保即使未来扩展字段，旧版本本地数据也不会引发应用异常。

### 3. 数据备份与迁移
- **导出备份**：在「数据与设置」模块中点击「导出数据备份」，将全量数据打包生成格式如下的标准 JSON 文件：
  ```json
  {
    "version": "1.0.0",
    "appName": "个人工作生活专属APP",
    "exportedAt": "2026-09-16T12:00:00.000Z",
    "data": { ... }
  }
  ```
- **恢复备份**：支持选择以前导出的 JSON 文件进行格式合法性校验，校验通过后完整恢复并覆盖当前数据。
- **重置数据**：支持随时一键恢复至出厂预置数据状态。

---

## 测试说明

本项目基于 Node.js 原生测试模块（`node:test` 与 `node:assert`）编写了 27 项完整的自动化测试，覆盖数据持久化、组件逻辑、业务模型与端到端集成：

```bash
npm test
```

### 测试集列表
- `tests/phase1_storage.test.ts`：本地存储读写、持久化降级、备份导出格式与导入校验、存储容量统计。
- `tests/phase2_components.test.ts`：闪念速记流转机制、三大要事完成度计算、侧边栏徽标与待办计数。
- `tests/phase3_modules.test.ts`：自媒体管线流转、工程需求状态机、咨询工时与交付物、健身容量有效计算、饮水记录重置、游戏库时长统计。
- `tests/phase4_integration.test.ts`：跨模块端到端联动、冷启动无损复原、损坏 JSON 容错及大数据量性能稳定性。
- `tests/problem2_content_stats.test.ts`：自媒体视频播放量、点赞数、互动率统计算法与多平台分布计算。
- `tests/problem3_delete_dev_project.test.ts`：开发工程项目删除功能及级联清除关联任务/缺陷。
- `tests/problem4_workout_calendar.test.ts`：健身训练月度日历网格计算、动作明细提取及饮食协同展示。
