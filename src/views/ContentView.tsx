import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ContentItem, ContentStage, SocialPlatform } from '../types';
import { ContentStatsChart } from '../components/content/ContentStatsChart';
import {
  Clapperboard,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  TrendingUp,
  Tag,
  Calendar,
  MessageSquare,
  Eye,
  Heart,
  Check,
  BarChart3,
  LayoutGrid,
} from 'lucide-react';

export const ContentView: React.FC = () => {
  const { data, addContent, updateContentStage, updateContent, deleteContent } = useApp();

  const [activeTab, setActiveTab] = useState<'board' | 'stats'>('board');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const [newOutline, setNewOutline] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['B站', '小红书']);

  // Editing review modal
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [reviewViews, setReviewViews] = useState<number>(0);
  const [reviewLikes, setReviewLikes] = useState<number>(0);
  const [reviewNotes, setReviewNotes] = useState<string>('');

  const platformsList: SocialPlatform[] = ['B站', '小红书', '微信公众号', '知乎', '抖音', 'Twitter/X', '其他'];

  const stages: { id: ContentStage; label: string; desc: string; color: string }[] = [
    { id: 'idea', label: '选题灵感池', desc: '点子记录与切入点构思', color: 'border-amber-500/40 text-amber-400' },
    { id: 'script', label: '大纲与撰稿', desc: '结构推演与逐字脚本', color: 'border-sky-500/40 text-sky-400' },
    { id: 'production', label: '录制与剪辑', desc: '素材拍摄与后期制作', color: 'border-purple-500/40 text-purple-400' },
    { id: 'published', label: '已发布与复盘', desc: '数据追踪与心得反思', color: 'border-emerald-500/40 text-emerald-400' },
  ];

  const handleTogglePlatform = (p: SocialPlatform) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleCreateContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addContent({
      title: newTitle.trim(),
      stage: 'idea',
      targetAudience: newAudience.trim() || undefined,
      outlineNotes: newOutline.trim() || undefined,
      platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['B站'],
    });

    setNewTitle('');
    setNewAudience('');
    setNewOutline('');
    setIsAddModalOpen(false);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateContent(editingItem.id, {
      views: reviewViews,
      likes: reviewLikes,
      reviewNotes: reviewNotes,
      publishDate: editingItem.publishDate || new Date().toISOString().split('T')[0],
    });

    setEditingItem(null);
  };

  const moveStage = (item: ContentItem, direction: 'prev' | 'next') => {
    const stageOrder: ContentStage[] = ['idea', 'script', 'production', 'published'];
    const currentIndex = stageOrder.indexOf(item.stage);
    if (direction === 'prev' && currentIndex > 0) {
      updateContentStage(item.id, stageOrder[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      updateContentStage(item.id, nextStage);
      if (nextStage === 'published' && !item.publishDate) {
        updateContent(item.id, { publishDate: new Date().toISOString().split('T')[0] });
      }
    }
  };

  return (
    <div id="content-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 tracking-tight flex items-center gap-2.5">
            <Clapperboard className="w-6 h-6 text-rose-400" />
            自媒体内容生产管线
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            从突发点子、脚本大纲、录制剪辑到发布复盘的全流程专属看板
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Segmented Tab Switcher */}
          <div className="inline-flex p-1 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
            <button
              id="content-tab-board-btn"
              onClick={() => setActiveTab('board')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'board'
                  ? 'bg-neutral-800 text-neutral-100 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-rose-400" />
              <span>管线看板</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-950 text-neutral-400 border border-neutral-800">
                {data.contents.length}
              </span>
            </button>

            <button
              id="content-tab-stats-btn"
              onClick={() => setActiveTab('stats')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'stats'
                  ? 'bg-rose-500 text-neutral-950 font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>视频数据可视化</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === 'stats'
                    ? 'bg-neutral-950/20 text-neutral-950 font-bold'
                    : 'bg-neutral-950 text-rose-400 border border-neutral-800'
                }`}
              >
                {data.contents.filter((c) => c.stage === 'published').length}
              </span>
            </button>
          </div>

          <button
            id="add-content-modal-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-500 hover:bg-rose-400 text-neutral-950 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            新建选题
          </button>
        </div>
      </div>

      {/* View Content: Stats Chart or Board */}
      {activeTab === 'stats' ? (
        <ContentStatsChart
          contents={data.contents}
          onSelectVideo={(id) => {
            const item = data.contents.find((c) => c.id === id);
            if (item) {
              setEditingItem(item);
              setReviewViews(item.views || 0);
              setReviewLikes(item.likes || 0);
              setReviewNotes(item.reviewNotes || '');
            }
          }}
        />
      ) : (
        /* 4-Stage Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {stages.map((stage) => {
          const itemsInStage = data.contents.filter((c) => c.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col min-h-[520px]"
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stage.id === 'idea' ? 'bg-amber-400' : stage.id === 'script' ? 'bg-sky-400' : stage.id === 'production' ? 'bg-purple-400' : 'bg-emerald-400'}`} />
                    <h3 className="text-sm font-semibold text-neutral-100">{stage.label}</h3>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{stage.desc}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-neutral-950 text-neutral-400 border border-neutral-800">
                  {itemsInStage.length}
                </span>
              </div>

              {/* Cards in stage */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                {itemsInStage.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                    暂无条目
                  </div>
                ) : (
                  itemsInStage.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-neutral-950/80 hover:bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 rounded-xl transition-all group flex flex-col justify-between space-y-3"
                    >
                      <div>
                        {/* Platforms */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.platforms.map((p) => (
                            <span
                              key={p}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-900 text-neutral-300 border border-neutral-800"
                            >
                              {p}
                            </span>
                          ))}
                        </div>

                        <h4 className="text-sm font-semibold text-neutral-100 leading-snug">
                          {item.title}
                        </h4>

                        {item.targetAudience && (
                          <p className="text-xs text-neutral-400 mt-1.5 line-clamp-1">
                            🎯 目标受众: {item.targetAudience}
                          </p>
                        )}

                        {item.outlineNotes && (
                          <p className="text-xs text-neutral-400 mt-1.5 line-clamp-3 leading-relaxed whitespace-pre-wrap bg-neutral-900/60 p-2 rounded-lg border border-neutral-800/60">
                            {item.outlineNotes}
                          </p>
                        )}

                        {/* Review metrics if published */}
                        {item.stage === 'published' && (
                          <div className="mt-2 pt-2 border-t border-neutral-850 space-y-1 text-xs">
                            <div className="flex items-center gap-3 text-neutral-400">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-neutral-500" />
                                {item.views !== undefined ? `${item.views} 播放` : '未记录'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5 text-rose-500" />
                                {item.likes !== undefined ? `${item.likes} 点赞` : '未记录'}
                              </span>
                            </div>
                            {item.reviewNotes && (
                              <p className="text-[11px] text-amber-300/80 italic line-clamp-2">
                                复盘: {item.reviewNotes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          {stage.id !== 'idea' && (
                            <button
                              onClick={() => moveStage(item, 'prev')}
                              className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850 rounded transition-colors"
                              title="移回上一阶段"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {stage.id !== 'published' && (
                            <button
                              onClick={() => moveStage(item, 'next')}
                              className="px-2 py-0.5 rounded bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
                              title="推进到下一阶段"
                            >
                              <span>推进</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          {stage.id === 'published' && (
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setReviewViews(item.views || 0);
                                setReviewLikes(item.likes || 0);
                                setReviewNotes(item.reviewNotes || '');
                              }}
                              className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] border border-emerald-500/30 transition-colors"
                            >
                              复盘打标
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => deleteContent(item.id)}
                          className="p-1 text-neutral-500 hover:text-rose-400 rounded transition-colors"
                          title="删除内容"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* New Content Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-neutral-100">新建自媒体选题</h3>
            <form onSubmit={handleCreateContent} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">选题标题 *</label>
                <input
                  type="text"
                  required
                  placeholder="如：如何打造一款纯本地不丢失数据的极简桌面工作台？"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">目标受众 / 预期痛点</label>
                <input
                  type="text"
                  placeholder="如：独立开发者、效率追求者、久坐上班族"
                  value={newAudience}
                  onChange={(e) => setNewAudience(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">分发平台 (多选)</label>
                <div className="flex flex-wrap gap-1.5">
                  {platformsList.map((p) => {
                    const active = selectedPlatforms.includes(p);
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => handleTogglePlatform(p)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          active
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-300'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">大纲草稿 / 关键提纲</label>
                <textarea
                  rows={3}
                  placeholder="记录几个核心要点、案例或分段设想..."
                  value={newOutline}
                  onChange={(e) => setNewOutline(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-neutral-950 text-xs font-semibold rounded-xl transition-colors"
                >
                  确认存入选题池
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Published Review Modal */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-neutral-100">发布数据与反思复盘</h3>
            <p className="text-xs text-neutral-400 truncate">{editingItem.title}</p>
            <form onSubmit={handleSaveReview} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">总播放量 / 阅读量</label>
                  <input
                    type="number"
                    value={reviewViews}
                    onChange={(e) => setReviewViews(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">点赞互动量</label>
                  <input
                    type="number"
                    value={reviewLikes}
                    onChange={(e) => setReviewLikes(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">复盘心得 / 优化改进</label>
                <textarea
                  rows={3}
                  placeholder="如：前30秒完播率高，但中段节奏稍慢；封面文案比上次更有吸引力..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-semibold rounded-xl transition-colors"
                >
                  保存复盘
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
