import React, { useState } from 'react';
import { ContentItem } from '../../types';
import { calculateContentVideoStats } from '../../utils/contentStats';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  Percent,
  Video,
  Award,
  Calendar,
  Share2,
  SlidersHorizontal,
} from 'lucide-react';

interface ContentStatsChartProps {
  contents: ContentItem[];
  onSelectVideo?: (id: string) => void;
}

export const ContentStatsChart: React.FC<ContentStatsChartProps> = ({ contents, onSelectVideo }) => {
  const [metricType, setMetricType] = useState<'views' | 'likes' | 'engagement'>('views');
  const [sortBy, setSortBy] = useState<'metric' | 'date'>('metric');

  const stats = calculateContentVideoStats(contents);

  if (stats.totalPublished === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-neutral-800/80 text-rose-400 flex items-center justify-center mx-auto mb-3">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-200">暂无已发布视频数据</h3>
        <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto leading-relaxed">
          将管线中的选题推进至「已发布与复盘」阶段并填报播放量与点赞数，系统将自动生成多维度的视频发布数据可视化图表。
        </p>
      </div>
    );
  }

  // Determine display list and sort
  const displayVideos = [...stats.videos].sort((a, b) => {
    if (sortBy === 'date') {
      return b.publishDate.localeCompare(a.publishDate);
    }
    if (metricType === 'likes') {
      return b.likes - a.likes;
    }
    if (metricType === 'engagement') {
      return b.engagementRate - a.engagementRate;
    }
    return b.views - a.views;
  });

  // Calculate maximum for bar scale
  const maxVal = Math.max(
    ...displayVideos.map((v) => {
      if (metricType === 'likes') return v.likes;
      if (metricType === 'engagement') return v.engagementRate;
      return v.views;
    }),
    1
  );

  return (
    <div id="content-stats-chart" className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-6">
      {/* Top summary KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100 tracking-tight flex items-center gap-2">
              发送视频数据统计与可视化
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {stats.totalPublished} 支视频
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">已发布全网视频的播放、点赞互动及平台分发表现分析</p>
          </div>
        </div>

        {/* View mode and sort toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-neutral-950 border border-neutral-800 rounded-xl text-xs">
            <button
              onClick={() => setMetricType('views')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                metricType === 'views'
                  ? 'bg-rose-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              播放量
            </button>
            <button
              onClick={() => setMetricType('likes')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                metricType === 'likes'
                  ? 'bg-rose-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              点赞数
            </button>
            <button
              onClick={() => setMetricType('engagement')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                metricType === 'engagement'
                  ? 'bg-rose-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              互动率
            </button>
          </div>

          <div className="inline-flex p-1 bg-neutral-950 border border-neutral-800 rounded-xl text-xs">
            <button
              onClick={() => setSortBy('metric')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                sortBy === 'metric' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="按当前指标由高到低排序"
            >
              降序
            </button>
            <button
              onClick={() => setSortBy('date')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                sortBy === 'date' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="按发布时间排序"
            >
              时间
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>累计播放总量</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-neutral-100">
              {stats.totalViews.toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              均片 {stats.avgViewsPerVideo.toLocaleString()} 播放
            </div>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>累计点赞互动</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-neutral-100">
              {stats.totalLikes.toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              全网真实互动反馈
            </div>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>全网平均互动率</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-neutral-100">
              {stats.avgEngagementRate}%
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              点赞 / 播放转化效能
            </div>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>最高单片播放</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-neutral-100">
              {stats.topVideoByViews ? stats.topVideoByViews.views.toLocaleString() : 0}
            </div>
            <div className="text-[11px] text-neutral-400 truncate mt-0.5" title={stats.topVideoByViews?.title}>
              {stats.topVideoByViews ? stats.topVideoByViews.title : '无记录'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Visual Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Interactive Bar Chart */}
        <div className="lg:col-span-2 bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
            <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
              {metricType === 'views' && '各视频播放量对比分析 (Views)'}
              {metricType === 'likes' && '各视频点赞互动对比 (Likes)'}
              {metricType === 'engagement' && '各视频点赞率对比 (Engagement %)'}
            </span>
            <span className="text-[11px] text-neutral-500">
              {sortBy === 'metric' ? '按数值降序' : '按发布日期排序'}
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {displayVideos.map((video) => {
              const currentVal =
                metricType === 'views'
                  ? video.views
                  : metricType === 'likes'
                  ? video.likes
                  : video.engagementRate;
              const barPercent = Math.max(4, Math.min(100, Math.round((currentVal / maxVal) * 100)));

              return (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo && onSelectVideo(video.id)}
                  className="group p-2.5 rounded-xl hover:bg-neutral-900/90 transition-colors border border-transparent hover:border-neutral-800 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 text-xs mb-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-200 group-hover:text-white truncate">
                          {video.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-500" />
                          {video.publishDate}
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          {video.platforms.map((p) => (
                            <span
                              key={p}
                              className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-900 text-neutral-400 border border-neutral-800"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-neutral-100 text-sm">
                        {metricType === 'views' && `${video.views.toLocaleString()} 次`}
                        {metricType === 'likes' && `${video.likes.toLocaleString()} 赞`}
                        {metricType === 'engagement' && `${video.engagementRate}%`}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {metricType === 'views'
                          ? `点赞 ${video.likes.toLocaleString()} (${video.engagementRate}%)`
                          : `播放 ${video.views.toLocaleString()}`}
                      </div>
                    </div>
                  </div>

                  {/* Relative bar track */}
                  <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden flex items-center p-0.5 border border-neutral-800/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        metricType === 'views'
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                          : metricType === 'likes'
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Platform Breakdown */}
        <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
            <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-rose-400" />
              分发平台占比与播放分布
            </span>
            <span className="text-[11px] text-neutral-500">{stats.platformStats.length} 个渠道</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {stats.platformStats.map((p) => (
              <div key={p.platform} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-200">{p.platform}</span>
                    <span className="text-[10px] text-neutral-500">({p.videoCount} 支)</span>
                  </div>
                  <div className="font-mono text-neutral-300 font-semibold">
                    {p.totalViews.toLocaleString()}{' '}
                    <span className="text-[10px] text-neutral-500 font-normal font-sans">
                      ({p.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/60">
                  <div
                    className="h-full bg-rose-500/80 rounded-full"
                    style={{ width: `${Math.max(3, Math.min(100, p.percentage))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-500">
                  <span>累计点赞: {p.totalLikes.toLocaleString()}</span>
                  <span>
                    平均单片: {Math.round(p.totalViews / Math.max(1, p.videoCount)).toLocaleString()} 播放
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
