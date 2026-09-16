import { ContentItem } from '../types';

export interface PlatformStat {
  platform: string;
  videoCount: number;
  totalViews: number;
  totalLikes: number;
  percentage: number;
}

export interface VideoPerformance {
  id: string;
  title: string;
  publishDate: string;
  views: number;
  likes: number;
  engagementRate: number; // percentage e.g. 7.5%
  platforms: string[];
}

export interface ContentVideoStats {
  totalPublished: number;
  totalViews: number;
  totalLikes: number;
  avgEngagementRate: number; // in percent, e.g. 6.8
  avgViewsPerVideo: number;
  topVideoByViews: VideoPerformance | null;
  topVideoByLikes: VideoPerformance | null;
  platformStats: PlatformStat[];
  videos: VideoPerformance[];
}

export function calculateContentVideoStats(contents: ContentItem[]): ContentVideoStats {
  const publishedItems = contents.filter(
    (c) => c.stage === 'published'
  );

  const videos: VideoPerformance[] = publishedItems.map((item) => {
    const views = typeof item.views === 'number' && !isNaN(item.views) ? Math.max(0, item.views) : 0;
    const likes = typeof item.likes === 'number' && !isNaN(item.likes) ? Math.max(0, item.likes) : 0;
    const engagementRate = views > 0 ? Number(((likes / views) * 100).toFixed(2)) : 0;
    return {
      id: item.id,
      title: item.title,
      publishDate: item.publishDate || item.createdAt.split(' ')[0] || '未知日期',
      views,
      likes,
      engagementRate,
      platforms: item.platforms || [],
    };
  });

  // Sort by views descending by default
  videos.sort((a, b) => b.views - a.views);

  const totalPublished = videos.length;
  const totalViews = videos.reduce((acc, v) => acc + v.views, 0);
  const totalLikes = videos.reduce((acc, v) => acc + v.likes, 0);
  const avgEngagementRate =
    totalViews > 0 ? Number(((totalLikes / totalViews) * 100).toFixed(2)) : 0;
  const avgViewsPerVideo =
    totalPublished > 0 ? Math.round(totalViews / totalPublished) : 0;

  let topVideoByViews: VideoPerformance | null = null;
  let topVideoByLikes: VideoPerformance | null = null;

  if (videos.length > 0) {
    topVideoByViews = [...videos].sort((a, b) => b.views - a.views)[0];
    topVideoByLikes = [...videos].sort((a, b) => b.likes - a.likes)[0];
  }

  // Platform distribution aggregation
  const platformMap = new Map<string, { videoCount: number; totalViews: number; totalLikes: number }>();

  videos.forEach((v) => {
    v.platforms.forEach((p) => {
      const existing = platformMap.get(p) || { videoCount: 0, totalViews: 0, totalLikes: 0 };
      existing.videoCount += 1;
      existing.totalViews += v.views;
      existing.totalLikes += v.likes;
      platformMap.set(p, existing);
    });
  });

  const platformStats: PlatformStat[] = Array.from(platformMap.entries()).map(([platform, data]) => {
    const percentage =
      totalViews > 0 ? Number(((data.totalViews / totalViews) * 100).toFixed(1)) : 0;
    return {
      platform,
      videoCount: data.videoCount,
      totalViews: data.totalViews,
      totalLikes: data.totalLikes,
      percentage,
    };
  });

  // Sort platform stats by total views descending
  platformStats.sort((a, b) => b.totalViews - a.totalViews);

  return {
    totalPublished,
    totalViews,
    totalLikes,
    avgEngagementRate,
    avgViewsPerVideo,
    topVideoByViews,
    topVideoByLikes,
    platformStats,
    videos,
  };
}
