import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BookItem, BookStatus, BookNote } from '../types';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  BookmarkCheck,
  FileText,
  Quote,
  Trash2,
  Edit3,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  BarChart3,
  BookMarked,
  Layers,
} from 'lucide-react';

const CATEGORY_TAGS = [
  '全部分类',
  '商业思考与认知',
  '技术工程',
  '思维模型',
  '人文历史',
  '心理哲学',
  '其他',
];

export const ReadingView: React.FC = () => {
  const {
    data,
    addBook,
    updateBook,
    deleteBook,
    updateBookProgress,
    addBookNote,
    deleteBookNote,
    clearAllBooks,
    showToast,
  } = useApp();

  const books = data.books || [];

  // 状态筛选与搜索
  const [selectedStatus, setSelectedStatus] = useState<BookStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部分类');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 展开笔记详情的书籍 ID 列表
  const [expandedNotesBookId, setExpandedNotesBookId] = useState<string | null>(null);

  // 添加/编辑书籍弹窗
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  // 表单状态
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formCategory, setFormCategory] = useState('商业思考与认知');
  const [formTotalPages, setFormTotalPages] = useState<number>(300);
  const [formCurrentPage, setFormCurrentPage] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<BookStatus>('reading');
  const [formRating, setFormRating] = useState<number>(5);
  const [formThoughts, setFormThoughts] = useState('');
  const [formInitialNote, setFormInitialNote] = useState('');

  // 新增笔记弹窗/抽屉
  const [noteBookId, setNoteBookId] = useState<string | null>(null);
  const [noteChapter, setNoteChapter] = useState('');
  const [notePageNumber, setNotePageNumber] = useState<number | ''>('');
  const [noteQuote, setNoteQuote] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // 核心统计计算
  const stats = useMemo(() => {
    const totalCount = books.length;
    const readingCount = books.filter((b) => b.status === 'reading').length;
    const completedCount = books.filter((b) => b.status === 'completed').length;
    const wishlistCount = books.filter((b) => b.status === 'wishlist').length;
    const totalPagesRead = books.reduce((acc, b) => acc + (b.currentPage || 0), 0);
    const totalBookPages = books.reduce((acc, b) => acc + (b.totalPages || 0), 0);
    const totalNotesCount = books.reduce((acc, b) => acc + (b.notes?.length || 0), 0);
    const overallProgress = totalBookPages > 0 ? Math.round((totalPagesRead / totalBookPages) * 100) : 0;

    return {
      totalCount,
      readingCount,
      completedCount,
      wishlistCount,
      totalPagesRead,
      totalBookPages,
      totalNotesCount,
      overallProgress,
    };
  }, [books]);

  // 过滤后的书籍列表
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      if (selectedStatus !== 'all' && book.status !== selectedStatus) {
        return false;
      }
      if (selectedCategory !== '全部分类' && book.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = book.title.toLowerCase().includes(q);
        const matchAuthor = book.author.toLowerCase().includes(q);
        const matchNotes = book.notes?.some(
          (n) => n.content.toLowerCase().includes(q) || (n.quote && n.quote.toLowerCase().includes(q))
        );
        if (!matchTitle && !matchAuthor && !matchNotes) {
          return false;
        }
      }
      return true;
    });
  }, [books, selectedStatus, selectedCategory, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingBookId(null);
    setFormTitle('');
    setFormAuthor('');
    setFormCategory('商业思考与认知');
    setFormTotalPages(300);
    setFormCurrentPage(0);
    setFormStatus('reading');
    setFormRating(5);
    setFormThoughts('');
    setFormInitialNote('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: BookItem) => {
    setEditingBookId(book.id);
    setFormTitle(book.title);
    setFormAuthor(book.author);
    setFormCategory(book.category);
    setFormTotalPages(book.totalPages);
    setFormCurrentPage(book.currentPage);
    setFormStatus(book.status);
    setFormRating(book.rating || 5);
    setFormThoughts(book.thoughts || '');
    setFormInitialNote('');
    setIsModalOpen(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('请输入书名', 'warn');
      return;
    }

    const totalPages = Math.max(1, Number(formTotalPages) || 1);
    const currentPage = Math.min(Math.max(0, Number(formCurrentPage) || 0), totalPages);

    if (editingBookId) {
      updateBook(editingBookId, {
        title: formTitle.trim(),
        author: formAuthor.trim() || '未知作者',
        category: formCategory,
        totalPages,
        currentPage,
        status: formStatus,
        rating: formRating,
        thoughts: formThoughts.trim(),
      });
    } else {
      addBook({
        title: formTitle.trim(),
        author: formAuthor.trim() || '未知作者',
        category: formCategory,
        totalPages,
        currentPage,
        status: formStatus,
        rating: formRating,
        thoughts: formThoughts.trim(),
        initialNote: formInitialNote.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBookId || !noteContent.trim()) {
      showToast('请输入笔记内容或感悟', 'warn');
      return;
    }

    addBookNote(noteBookId, {
      chapter: noteChapter.trim() || undefined,
      pageNumber: typeof notePageNumber === 'number' ? notePageNumber : undefined,
      quote: noteQuote.trim() || undefined,
      content: noteContent.trim(),
    });

    setNoteChapter('');
    setNotePageNumber('');
    setNoteQuote('');
    setNoteContent('');
    setNoteBookId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 顶部标题与操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
                深度阅读与知识沉淀
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-mono">
                  {books.length} 本藏书
                </span>
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                追踪在读书籍进度、积累高价值金句与章节笔记，构建个人第二大脑
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {books.length > 0 && (
            <button
              id="clear-all-books-btn"
              onClick={clearAllBooks}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-rose-950/40 text-neutral-200 hover:text-rose-200 border border-neutral-700 hover:border-rose-700/50 text-xs font-medium rounded-xl transition-all cursor-pointer shadow-xs"
              title="清空书架与全部笔记"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>清空书库</span>
            </button>
          )}

          <button
            id="add-book-btn"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>添加书籍</span>
          </button>
        </div>
      </div>

      {/* 进程统计核心指标大盘 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">正在研读</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span id="stat-reading-count" className="text-2xl font-bold font-mono text-neutral-100">
              {stats.readingCount}
            </span>
            <span className="text-xs text-neutral-500 font-normal">本</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-2">书架活跃阅读中</div>
        </div>

        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">已读完结</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span id="stat-completed-count" className="text-2xl font-bold font-mono text-neutral-100">
              {stats.completedCount}
            </span>
            <span className="text-xs text-neutral-500 font-normal">本</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-2">已完整通读吸收</div>
        </div>

        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">累计翻阅页数</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span id="stat-pages-read" className="text-2xl font-bold font-mono text-neutral-100">
              {stats.totalPagesRead}
            </span>
            <span className="text-xs text-neutral-500 font-normal">/ {stats.totalBookPages} 页</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-2">全库通读进度</div>
        </div>

        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">沉淀笔记/金句</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span id="stat-notes-count" className="text-2xl font-bold font-mono text-neutral-100">
              {stats.totalNotesCount}
            </span>
            <span className="text-xs text-neutral-500 font-normal">条</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-2">核心洞见与摘录</div>
        </div>

        <div className="col-span-2 sm:col-span-2 md:col-span-1 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">总完读率</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span id="stat-overall-progress" className="text-2xl font-bold font-mono text-emerald-400">
              {stats.overallProgress}%
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${stats.overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 搜索与分类状态过滤 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900/50 border border-neutral-800/80 p-3 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === 'all'
                ? 'bg-neutral-800 text-neutral-100 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            全部 ({books.length})
          </button>
          <button
            onClick={() => setSelectedStatus('reading')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === 'reading'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            在读 ({stats.readingCount})
          </button>
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === 'completed'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            已读完 ({stats.completedCount})
          </button>
          <button
            onClick={() => setSelectedStatus('wishlist')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === 'wishlist'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            想读 ({stats.wishlistCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500"
          >
            {CATEGORY_TAGS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="搜索书名、作者或笔记..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 书籍卡片展示区 */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/30 border border-neutral-800/60 rounded-3xl">
          <BookMarked className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <p className="text-sm text-neutral-300 font-medium">暂无符合条件的书籍</p>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {books.length === 0 ? '书架空空如也，点击右上角「添加书籍」开启你的知识沉淀之旅' : '没有匹配当前筛选条件的书目，尝试更换分类或清除搜索关键词'}
          </p>
          {books.length === 0 && (
            <button
              onClick={handleOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>收录第一本书</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBooks.map((book) => {
            const percentage = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
            const isNotesExpanded = expandedNotesBookId === book.id;

            return (
              <div
                key={book.id}
                id={`book-card-${book.id}`}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700/80 transition-all flex flex-col justify-between"
              >
                {/* 书籍头部 */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                          {book.category}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                            book.status === 'completed'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : book.status === 'reading'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {book.status === 'completed' ? '已读完' : book.status === 'reading' ? '在读' : '想读'}
                        </span>
                        {book.rating && (
                          <div className="flex items-center text-amber-400 text-[10px] gap-0.5">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{book.rating}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-neutral-100 truncate" title={book.title}>
                        {book.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5 truncate">{book.author}</p>
                    </div>

                    {/* 操作菜单 */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(book)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                        title="编辑书籍信息"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`delete-book-btn-${book.id}`}
                        onClick={() => deleteBook(book.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="删除书籍"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 一句话收获/书评 */}
                  {book.thoughts && (
                    <div className="mt-3 text-xs text-neutral-300 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-850 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="line-clamp-2 leading-relaxed">{book.thoughts}</p>
                    </div>
                  )}

                  {/* 进程统计与进度控制 */}
                  <div className="mt-4 pt-3.5 border-t border-neutral-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-neutral-400">阅读进度</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-neutral-200 font-bold">{percentage}%</span>
                        <span className="text-neutral-500">
                          ({book.currentPage} / {book.totalPages} 页)
                        </span>
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                      <div
                        className={`h-full transition-all duration-300 ${
                          percentage >= 100 ? 'bg-blue-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* 快速更新进度控制台 */}
                    <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateBookProgress(book.id, book.currentPage - 10)}
                          disabled={book.currentPage <= 0}
                          className="px-2 py-1 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-40 text-neutral-300 text-[11px] rounded-lg border border-neutral-800 font-mono transition-colors cursor-pointer"
                          title="后退 10 页"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => updateBookProgress(book.id, book.currentPage + 10)}
                          disabled={book.currentPage >= book.totalPages}
                          className="px-2 py-1 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-40 text-neutral-300 text-[11px] rounded-lg border border-neutral-800 font-mono transition-colors cursor-pointer"
                          title="前进 10 页"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => updateBookProgress(book.id, book.currentPage + 30)}
                          disabled={book.currentPage >= book.totalPages}
                          className="px-2 py-1 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-40 text-neutral-300 text-[11px] rounded-lg border border-neutral-800 font-mono transition-colors cursor-pointer"
                          title="前进 30 页"
                        >
                          +30
                        </button>
                        <button
                          onClick={() => updateBookProgress(book.id, book.totalPages)}
                          disabled={book.currentPage >= book.totalPages}
                          className="px-2 py-1 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-40 text-blue-400 text-[11px] rounded-lg border border-neutral-800 font-medium transition-colors cursor-pointer"
                          title="标记为读完"
                        >
                          完读打卡
                        </button>
                      </div>

                      {/* 精确页码快速调整 */}
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <span>跳转至:</span>
                        <input
                          type="number"
                          min="0"
                          max={book.totalPages}
                          value={book.currentPage}
                          onChange={(e) => updateBookProgress(book.id, Number(e.target.value) || 0)}
                          className="w-14 bg-neutral-950 border border-neutral-800 rounded px-1.5 py-0.5 text-xs text-neutral-200 font-mono text-center focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-[10px] text-neutral-500">页</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 笔记模块折叠/展开 */}
                <div className="mt-4 pt-3 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedNotesBookId(isNotesExpanded ? null : book.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                    >
                      <Quote className="w-3.5 h-3.5 text-amber-400/80" />
                      <span>读书笔记 ({book.notes?.length || 0})</span>
                      {isNotesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => {
                        setNoteBookId(book.id);
                        setNoteChapter('');
                        setNotePageNumber(book.currentPage || '');
                        setNoteQuote('');
                        setNoteContent('');
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>写笔记</span>
                    </button>
                  </div>

                  {/* 展开的笔记清单 */}
                  {isNotesExpanded && (
                    <div className="mt-3 space-y-2.5">
                      {(!book.notes || book.notes.length === 0) ? (
                        <p className="text-xs text-neutral-500 py-3 text-center bg-neutral-950/40 rounded-xl">
                          本书暂无专属笔记，点击上方「写笔记」记录精彩金句或顿悟
                        </p>
                      ) : (
                        book.notes.map((note) => (
                          <div
                            key={note.id}
                            className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 relative group"
                          >
                            <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1.5">
                              <div className="flex items-center gap-2">
                                {note.chapter && <span className="text-neutral-400 font-medium">[{note.chapter}]</span>}
                                {note.pageNumber && <span className="font-mono">P.{note.pageNumber}</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <span>{note.createdAt}</span>
                                <button
                                  onClick={() => deleteBookNote(book.id, note.id)}
                                  className="text-neutral-600 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                                  title="删除该条笔记"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* 原文金句 */}
                            {note.quote && (
                              <div className="mb-2 pl-2.5 border-l-2 border-amber-500/40 text-xs text-amber-300/90 italic bg-amber-500/5 py-1 pr-2 rounded-r">
                                “{note.quote}”
                              </div>
                            )}

                            {/* 思考感悟 */}
                            <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
                              {note.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 添加/编辑书籍弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>{editingBookId ? '编辑书籍信息' : '添加新书入库'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  书名 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：纳瓦尔宝典、原则、代码整洁之道..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">作者</label>
                  <input
                    type="text"
                    placeholder="作者姓名"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">分类领域</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORY_TAGS.filter((c) => c !== '全部分类').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">总页数</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formTotalPages}
                    onChange={(e) => setFormTotalPages(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">当前页码</label>
                  <input
                    type="number"
                    min="0"
                    value={formCurrentPage}
                    onChange={(e) => setFormCurrentPage(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">当前状态</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as BookStatus)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="reading">正在研读</option>
                    <option value="completed">已读完</option>
                    <option value="wishlist">待读清单</option>
                    <option value="abandoned">搁置</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">星级推荐 / 期待指数 (1-5星)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormRating(star)}
                      className="p-1 text-neutral-600 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          formRating >= star ? 'text-amber-400 fill-amber-400' : 'text-neutral-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-neutral-400 font-mono ml-2">{formRating} 星评价</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">核心收获 / 一句话书评</label>
                <input
                  type="text"
                  placeholder="用一句话总结本书给你的最大认知冲击或实践指引"
                  value={formThoughts}
                  onChange={(e) => setFormThoughts(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {!editingBookId && (
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">初次笔记 / 精彩金句 (选填)</label>
                  <textarea
                    rows={2}
                    placeholder="可直接在此附带一条金句摘录或核心思考..."
                    value={formInitialNote}
                    onChange={(e) => setFormInitialNote(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {editingBookId ? '保存修改' : '确认收录'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 撰写读书笔记弹窗 */}
      {noteBookId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <Quote className="w-4 h-4 text-amber-400" />
                <span>撰写读书笔记 / 金句摘录</span>
              </h3>
              <button
                onClick={() => setNoteBookId(null)}
                className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">所在章节 (选填)</label>
                  <input
                    type="text"
                    placeholder="如：第二章、序言..."
                    value={noteChapter}
                    onChange={(e) => setNoteChapter(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">页码 (选填)</label>
                  <input
                    type="number"
                    placeholder="例如：68"
                    value={notePageNumber}
                    onChange={(e) => setNotePageNumber(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 font-mono placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">原文高光金句 (选填)</label>
                <textarea
                  rows={2}
                  placeholder="作者原文精彩段落摘录..."
                  value={noteQuote}
                  onChange={(e) => setNoteQuote(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  个人心得与行动思考 <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="这段内容对你的启发是什么？在实际工作生活中如何落地实践？"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setNoteBookId(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  保存笔记
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
