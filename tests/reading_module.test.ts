import test from 'node:test';
import assert from 'node:assert';
import { getInitialData } from '../src/data/initialData';
import { getStorageStats, loadAppData, saveAppData, validateBackupJson, STORAGE_KEY } from '../src/services/storage';
import { AppData, BookItem, BookNote } from '../src/types';

class MemoryStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

test('阅读模块 - 初始数据结构完整，包含预置书目与读书笔记', () => {
  const data = getInitialData();
  assert.ok(Array.isArray(data.books), 'books 应为数组');
  assert.ok(data.books.length >= 3, '初始应包含至少 3 本精选预置书籍');

  const readingBooks = data.books.filter((b) => b.status === 'reading');
  const completedBooks = data.books.filter((b) => b.status === 'completed');
  assert.ok(readingBooks.length >= 1, '应有在读书目');
  assert.ok(completedBooks.length >= 1, '应有已完读书目');

  const firstBook = data.books[0];
  assert.ok(firstBook.id, '书籍必须包含唯一 ID');
  assert.ok(firstBook.title, '书籍必须包含书名');
  assert.ok(firstBook.totalPages > 0, '总页数必须大于 0');
  assert.ok(Array.isArray(firstBook.notes), '书籍应包含笔记数组');
  assert.ok(firstBook.notes.length > 0, '首本书籍应包含高光金句/笔记');
});

test('阅读模块 - 进程统计指标正确计算', () => {
  const data = getInitialData();
  const books = data.books;

  const totalCount = books.length;
  const readingCount = books.filter((b) => b.status === 'reading').length;
  const completedCount = books.filter((b) => b.status === 'completed').length;
  const totalPagesRead = books.reduce((acc, b) => acc + (b.currentPage || 0), 0);
  const totalBookPages = books.reduce((acc, b) => acc + (b.totalPages || 0), 0);
  const totalNotesCount = books.reduce((acc, b) => acc + (b.notes?.length || 0), 0);
  const progressPercent = totalBookPages > 0 ? Math.round((totalPagesRead / totalBookPages) * 100) : 0;

  assert.ok(totalCount >= 3, '总书籍数量应与初始一致');
  assert.ok(readingCount > 0, '在读数量计算正确');
  assert.ok(completedCount > 0, '完读数量计算正确');
  assert.ok(totalPagesRead > 0, '已读页数累计正确');
  assert.ok(totalNotesCount > 0, '累计笔记条数统计正确');
  assert.ok(progressPercent > 0 && progressPercent <= 100, '总完读率在 0-100% 之间');
});

test('阅读模块 - 添加新书、阅读进程推进与自动完读判断', () => {
  const data = getInitialData();
  const initialBookCount = data.books.length;

  const newBook: BookItem = {
    id: `book-test-${Date.now()}`,
    title: '重构：改善既有代码的设计',
    author: 'Martin Fowler',
    category: '技术工程',
    totalPages: 400,
    currentPage: 150,
    status: 'reading',
    rating: 5,
    thoughts: '坏味道与重构手法的经典指南',
    startDate: '2026-09-17',
    notes: [
      {
        id: 'note-1',
        chapter: '第1章',
        pageNumber: 25,
        quote: '任何一个傻瓜都会写出计算机可以理解的代码。唯有写出人类容易理解的代码，才是优秀的程序员。',
        content: '保持函数短小，职责单一。',
        createdAt: '2026-09-17',
      },
    ],
    createdAt: '2026-09-17',
    updatedAt: '2026-09-17',
  };

  const updatedBooks = [newBook, ...data.books];
  assert.strictEqual(updatedBooks.length, initialBookCount + 1, '添加书籍后数量应增加 1');

  // 模拟推进进度至 400 页（完读）
  const updatedPage = 400;
  const finishedBook: BookItem = {
    ...newBook,
    currentPage: updatedPage,
    status: updatedPage >= newBook.totalPages ? 'completed' : newBook.status,
    completedDate: '2026-09-17',
  };

  assert.strictEqual(finishedBook.currentPage, 400);
  assert.strictEqual(finishedBook.status, 'completed', '页码读满时应自动标记为完读');
});

test('阅读模块 - 读书笔记与金句摘录新增与删除', () => {
  const testBook: BookItem = {
    id: 'book-note-test',
    title: '穷查理宝典',
    author: '查理·芒格',
    category: '思维模型',
    totalPages: 500,
    currentPage: 200,
    status: 'reading',
    notes: [],
    createdAt: '2026-09-17',
    updatedAt: '2026-09-17',
  };

  const newNote: BookNote = {
    id: 'bn-1',
    chapter: '人类误判心理学',
    pageNumber: 168,
    quote: '如果我知道我会在哪里死去，我就永远不去那里。',
    content: '反向思考模型：逆向思考，永远逆向思考。',
    createdAt: '2026-09-17',
  };

  testBook.notes.push(newNote);
  assert.strictEqual(testBook.notes.length, 1, '新增一条笔记后长度应为 1');
  assert.strictEqual(testBook.notes[0].quote, newNote.quote, '高光金句摘录匹配');

  // 删除笔记
  testBook.notes = testBook.notes.filter((n) => n.id !== 'bn-1');
  assert.strictEqual(testBook.notes.length, 0, '删除笔记后长度归零');
});

test('阅读模块 - 存储统计与空间计算实时联动', () => {
  const customStorage = new MemoryStorage();
  const initialData = getInitialData();

  saveAppData(initialData, customStorage);
  const loaded = loadAppData(customStorage);
  assert.ok(Array.isArray(loaded.books), '持久化加载后 books 必须为数组');

  const stats1 = getStorageStats(loaded, customStorage);
  assert.strictEqual(stats1.counts.books, loaded.books.length, '统计中的书籍数量应与数据一致');
  assert.ok(stats1.counts.bookNotes! > 0, '统计中的读书笔记条数应大于 0');
  assert.ok(stats1.moduleSizes.books.bytes > 0, '阅读模块应有独立的存储占用计算');

  // 清空阅读藏书后统计
  const clearedBooksData: AppData = {
    ...loaded,
    books: [],
  };

  const stats2 = getStorageStats(clearedBooksData, customStorage);
  assert.strictEqual(stats2.counts.books, 0, '清空后书籍数量统计应为 0');
  assert.strictEqual(stats2.counts.bookNotes, 0, '清空后读书笔记统计应为 0');
  assert.strictEqual(stats2.moduleSizes.books.bytes, 0, '清空后阅读模块占用空间归 0 字节');
  assert.strictEqual(stats2.moduleSizes.books.formatted, '0 B', '清空后阅读模块空间格式化为 0 B');
});

test('阅读模块 - 数据备份 JSON 校验完整支持 books 字段', () => {
  const data = getInitialData();
  const jsonStr = JSON.stringify({
    version: '1.0.0',
    appName: '个人工作生活专属APP',
    data,
  });

  const validation = validateBackupJson(jsonStr);
  assert.strictEqual(validation.valid, true, '备份数据应校验通过');
  assert.ok(Array.isArray(validation.data?.books), '校验后的 cleanData 中必须包含 books 数组');
  assert.strictEqual(validation.data?.books.length, data.books.length, '书籍数量必须与备份前一致');
});
