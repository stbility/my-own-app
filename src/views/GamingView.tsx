import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GameItem, GameStatus } from '../types';
import {
  Gamepad2,
  Plus,
  Trash2,
  Clock,
  Star,
  Monitor,
  Trophy,
  Heart,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const GamingView: React.FC = () => {
  const { data, addGame, updateGame, deleteGame, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<GameStatus | 'all'>('playing');
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('PC (Steam)');
  const [status, setStatus] = useState<GameStatus>('playing');
  const [hoursPlayed, setHoursPlayed] = useState(0);
  const [rating, setRating] = useState<number>(9);
  const [review, setReview] = useState('');

  const platforms = ['PC (Steam)', 'PlayStation 5', 'Nintendo Switch', 'Xbox', 'Mobile / 手游', '其他'];

  const filteredGames = data.games.filter((g) => {
    if (activeTab === 'all') return true;
    return g.status === activeTab;
  });

  const totalHours = data.games.reduce((sum, g) => sum + (g.hoursPlayed || 0), 0);
  const completedCount = data.games.filter((g) => g.status === 'completed').length;
  const playingCount = data.games.filter((g) => g.status === 'playing').length;

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGame({
      title: title.trim(),
      platform,
      status,
      hoursPlayed: Number(hoursPlayed) || 0,
      rating: rating ? Number(rating) : undefined,
      review: review.trim() || undefined,
    });

    setTitle('');
    setReview('');
    setHoursPlayed(0);
    setIsAddGameOpen(false);
  };

  const handleAddHour = (gameId: string, delta: number) => {
    const game = data.games.find((g) => g.id === gameId);
    if (!game) return;
    const nextHours = Math.max(0, (game.hoursPlayed || 0) + delta);
    updateGame(gameId, { hoursPlayed: nextHours });
    showToast(`《${game.title}》已更新至 ${nextHours} 小时`, 'info');
  };

  const getStatusBadge = (st: GameStatus) => {
    switch (st) {
      case 'playing':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">正在游玩</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">通关 / 白金</span>;
      case 'wishlist':
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">心愿清单</span>;
    }
  };

  return (
    <div id="gaming-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 tracking-tight flex items-center gap-2.5">
            <Gamepad2 className="w-6 h-6 text-purple-400" />
            游戏娱乐与心愿书架
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            工作之余的最佳调剂：在玩进度打卡、时长累计、白金通关与评测反思
          </p>
        </div>

        <button
          onClick={() => setIsAddGameOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-neutral-950 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          收录游戏
        </button>
      </div>

      {/* Stats Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-neutral-400">正在游玩</div>
            <div className="text-2xl font-bold font-mono text-neutral-100 mt-0.5">{playingCount} <span className="text-xs text-neutral-500 font-normal">款</span></div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-neutral-400">已通关 / 封盘</div>
            <div className="text-2xl font-bold font-mono text-neutral-100 mt-0.5">{completedCount} <span className="text-xs text-neutral-500 font-normal">款</span></div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-neutral-400">全库累计沉浸游玩</div>
            <div className="text-2xl font-bold font-mono text-neutral-100 mt-0.5">{totalHours} <span className="text-xs text-neutral-500 font-normal">小时</span></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
          {(['playing', 'wishlist', 'completed', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-purple-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab === 'playing' ? '正在玩' : tab === 'wishlist' ? '心愿单' : tab === 'completed' ? '已通关' : '全库'}
            </button>
          ))}
        </div>
        <span className="text-xs text-neutral-500 font-mono">共 {filteredGames.length} 款游戏</span>
      </div>

      {/* Games Shelf Grid */}
      {filteredGames.length === 0 ? (
        <div className="py-20 text-center text-xs text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-2xl">
          此分类下暂无游戏，点击右上角 “收录游戏”
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-950 text-neutral-400 border border-neutral-800">
                      {game.platform}
                    </span>
                    <h3 className="text-base font-bold text-neutral-100 mt-2 truncate">
                      {game.title}
                    </h3>
                  </div>
                  {getStatusBadge(game.status)}
                </div>

                {/* Rating & Hours */}
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{game.rating ? `${game.rating}/10` : '未评分'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{game.hoursPlayed} h</span>
                  </div>
                </div>

                {game.review && (
                  <p className="text-xs text-neutral-400 mt-3 p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-850 leading-relaxed italic line-clamp-3">
                    “{game.review}”
                  </p>
                )}
              </div>

              {/* Action bar */}
              <div className="pt-3 border-t border-neutral-850 flex items-center justify-between text-xs">
                {/* Hours increment */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-neutral-500">时长打卡:</span>
                  <button
                    onClick={() => handleAddHour(game.id, 1)}
                    className="px-2 py-0.5 rounded bg-neutral-950 hover:bg-neutral-800 text-purple-300 font-mono border border-neutral-800 transition-colors"
                  >
                    +1h
                  </button>
                  <button
                    onClick={() => handleAddHour(game.id, 2)}
                    className="px-2 py-0.5 rounded bg-neutral-950 hover:bg-neutral-800 text-purple-300 font-mono border border-neutral-800 transition-colors"
                  >
                    +2h
                  </button>
                </div>

                {/* Toggle status */}
                <div className="flex items-center gap-2">
                  {game.status !== 'completed' && (
                    <button
                      onClick={() => updateGame(game.id, { status: 'completed' })}
                      className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] transition-colors"
                    >
                      通关
                    </button>
                  )}
                  <button
                    onClick={() => deleteGame(game.id)}
                    className="p-1 text-neutral-500 hover:text-rose-400 rounded transition-colors"
                    title="删除游戏"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Game */}
      {isAddGameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setIsAddGameOpen(false)}>
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-neutral-100">收录游戏入库</h3>
            <form onSubmit={handleCreateGame} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">游戏名称 *</label>
                <input
                  type="text"
                  required
                  placeholder="如：黑神话：悟空 / 艾尔登法环"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">运行平台</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-purple-500"
                  >
                    {platforms.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">游玩状态</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as GameStatus)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="playing">正在游玩</option>
                    <option value="wishlist">心愿清单</option>
                    <option value="completed">已通关/白金</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">已玩时长 (小时)</label>
                  <input
                    type="number"
                    value={hoursPlayed}
                    onChange={(e) => setHoursPlayed(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">评分 (1-10分)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">游玩心得与简评</label>
                <textarea
                  rows={2}
                  placeholder="沉浸感、战斗手感或剧情感受..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGameOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-neutral-950 text-xs font-semibold rounded-xl"
                >
                  存入游戏架
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
