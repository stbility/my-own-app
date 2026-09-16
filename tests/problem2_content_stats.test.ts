import test from 'node:test';
import assert from 'node:assert';
import { calculateContentVideoStats } from '../src/utils/contentStats';
import { ContentItem } from '../src/types';
import { getInitialData } from '../src/data/initialData';

test('Problem 2: calculateContentVideoStats 处理空数据与无已发布视频', () => {
  const emptyStats = calculateContentVideoStats([]);
  assert.strictEqual(emptyStats.totalPublished, 0);
  assert.strictEqual(emptyStats.totalViews, 0);
  assert.strictEqual(emptyStats.totalLikes, 0);
  assert.strictEqual(emptyStats.avgEngagementRate, 0);
  assert.strictEqual(emptyStats.topVideoByViews, null);
  assert.deepStrictEqual(emptyStats.platformStats, []);
  assert.deepStrictEqual(emptyStats.videos, []);

  // 只有未发布视频 (idea, script, production)
  const draftsOnly: ContentItem[] = [
    {
      id: 'c1',
      title: '灵感草稿',
      stage: 'idea',
      platforms: ['B站'],
      createdAt: '2026-09-10',
    },
    {
      id: 'c2',
      title: '正在剪辑',
      stage: 'production',
      platforms: ['小红书'],
      createdAt: '2026-09-11',
    },
  ];
  const draftStats = calculateContentVideoStats(draftsOnly);
  assert.strictEqual(draftStats.totalPublished, 0);
  assert.strictEqual(draftStats.totalViews, 0);
  assert.strictEqual(draftStats.videos.length, 0);
});

test('Problem 2: calculateContentVideoStats 正确计算已发布视频统计指标与平台分布', () => {
  const testContents: ContentItem[] = [
    {
      id: 'v1',
      title: '视频 A - 高播放',
      stage: 'published',
      platforms: ['B站', '抖音'],
      publishDate: '2026-09-01',
      views: 20000,
      likes: 1000,
      createdAt: '2026-08-30',
    },
    {
      id: 'v2',
      title: '视频 B - 高互动',
      stage: 'published',
      platforms: ['B站', '小红书'],
      publishDate: '2026-09-05',
      views: 10000,
      likes: 1200,
      createdAt: '2026-09-03',
    },
    {
      id: 'v3',
      title: '草稿 C - 未发布',
      stage: 'script',
      platforms: ['知乎'],
      views: 99999, // 未发布时不应纳入统计
      likes: 9999,
      createdAt: '2026-09-04',
    },
  ];

  const stats = calculateContentVideoStats(testContents);

  // 1. 已发布视频数核验
  assert.strictEqual(stats.totalPublished, 2);

  // 2. 播放量与点赞数汇总
  assert.strictEqual(stats.totalViews, 30000);
  assert.strictEqual(stats.totalLikes, 2200);

  // 3. 互动率核验: 2200 / 30000 * 100 = 7.33%
  assert.strictEqual(stats.avgEngagementRate, 7.33);

  // 4. 均片播放: 30000 / 2 = 15000
  assert.strictEqual(stats.avgViewsPerVideo, 15000);

  // 5. 最佳视频定位
  assert.strictEqual(stats.topVideoByViews?.id, 'v1');
  assert.strictEqual(stats.topVideoByViews?.views, 20000);
  assert.strictEqual(stats.topVideoByLikes?.id, 'v2');
  assert.strictEqual(stats.topVideoByLikes?.likes, 1200);

  // 6. 平台分布汇总核验
  const b站Stat = stats.platformStats.find((p) => p.platform === 'B站');
  assert.ok(b站Stat, '应包含 B站 统计');
  assert.strictEqual(b站Stat.videoCount, 2);
  assert.strictEqual(b站Stat.totalViews, 30000);
  assert.strictEqual(b站Stat.totalLikes, 2200);

  const 抖音Stat = stats.platformStats.find((p) => p.platform === '抖音');
  assert.ok(抖音Stat, '应包含 抖音 统计');
  assert.strictEqual(抖音Stat.videoCount, 1);
  assert.strictEqual(抖音Stat.totalViews, 20000);
});

test('Problem 2: 验证系统默认预置数据包含已发布视频并能生成完整统计', () => {
  const initialData = getInitialData();
  const stats = calculateContentVideoStats(initialData.contents);

  assert.ok(stats.totalPublished >= 3, '初始预置数据应包含至少 3 支已发布视频');
  assert.ok(stats.totalViews > 0, '总播放量应大于 0');
  assert.ok(stats.totalLikes > 0, '总点赞量应大于 0');
  assert.ok(stats.avgEngagementRate > 0, '平均互动率应大于 0');
  assert.ok(stats.platformStats.length >= 2, '平台分布应涵盖多平台');
  assert.ok(stats.topVideoByViews !== null, '应评出最高播放视频');
});
