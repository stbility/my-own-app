import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sparkles, Send, Trash2, ArrowRight, Video, Code2 } from 'lucide-react';

export const QuickScratchpadModal: React.FC = () => {
  const {
    isScratchpadOpen,
    setIsScratchpadOpen,
    data,
    addQuickNote,
    deleteQuickNote,
    forwardQuickNote,
  } = useApp();

  const [inputContent, setInputContent] = useState('');

  if (!isScratchpadOpen) return null;

  const handleAdd = () => {
    if (!inputContent.trim()) return;
    addQuickNote(inputContent);
    setInputContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div
      id="scratchpad-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4"
      onClick={() => setIsScratchpadOpen(false)}
    >
      <div
        id="scratchpad-modal-card"
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-100">闪念速记便签</h3>
              <p className="text-xs text-neutral-400">随手记下灵感，支持一键流转到自媒体或开发待办</p>
            </div>
          </div>
          <button
            id="close-scratchpad-btn"
            onClick={() => setIsScratchpadOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
            title="关闭 (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input area */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 bg-neutral-950/40">
          <textarea
            id="scratchpad-textarea-input"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="记下任何突发灵感、待办备忘、思考碎片... (按 Ctrl/Cmd + Enter 快速存入)"
            className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl p-3.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
            autoFocus
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-neutral-500">
              已输入 {inputContent.length} 字 · 自动保存至本地
            </span>
            <button
              id="scratchpad-submit-btn"
              onClick={handleAdd}
              disabled={!inputContent.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-medium text-xs rounded-xl shadow-xs transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              存入便签
            </button>
          </div>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              现有便签 ({data.quickNotes.length})
            </span>
          </div>

          {data.quickNotes.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-sm">
              暂无便签，随时在上框记录灵感
            </div>
          ) : (
            data.quickNotes.map((note) => (
              <div
                key={note.id}
                id={`scratchpad-item-${note.id}`}
                className="group p-4 bg-neutral-900/70 hover:bg-neutral-850 border border-neutral-800 rounded-xl transition-all"
              >
                <p className="text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>

                <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-neutral-500">{note.createdAt}</span>

                  <div className="flex items-center gap-1.5">
                    {note.forwardedTo ? (
                      <span className="px-2 py-0.5 rounded text-[11px] bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                        已转至: {note.forwardedTo === 'content' ? '自媒体' : '开发待办'}
                      </span>
                    ) : (
                      <>
                        <button
                          id={`forward-content-${note.id}`}
                          onClick={() => forwardQuickNote(note.id, 'content')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-[11px]"
                          title="流转到自媒体选题池"
                        >
                          <Video className="w-3 h-3 text-rose-400" />
                          转自媒体
                        </button>
                        <button
                          id={`forward-dev-${note.id}`}
                          onClick={() => forwardQuickNote(note.id, 'dev')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-[11px]"
                          title="流转到开发工作待办"
                        >
                          <Code2 className="w-3 h-3 text-cyan-400" />
                          转开发
                        </button>
                      </>
                    )}

                    <button
                      id={`delete-note-${note.id}`}
                      onClick={() => deleteQuickNote(note.id)}
                      className="p-1 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors ml-1"
                      title="删除便签"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
