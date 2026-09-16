import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ConsultingClient, ClientStage, MeetingLog, DeliverableItem } from '../types';
import {
  Briefcase,
  Plus,
  Trash2,
  Building,
  User,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle2,
  Circle,
  FileText,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const ConsultingView: React.FC = () => {
  const {
    data,
    addConsultingClient,
    updateConsultingClient,
    deleteConsultingClient,
    addMeetingLog,
    toggleDeliverable,
  } = useApp();

  const [selectedClientId, setSelectedClientId] = useState<string>(data.consultingClients[0]?.id || '');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [isAddDeliverableOpen, setIsAddDeliverableOpen] = useState(false);

  // New Client Form
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientStage, setClientStage] = useState<ClientStage>('proposal');
  const [clientRate, setClientRate] = useState<number>(800);
  const [clientNotes, setClientNotes] = useState('');

  // Meeting Form
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingSummary, setMeetingSummary] = useState('');
  const [meetingActions, setMeetingActions] = useState('');

  // Deliverable Form
  const [delivTitle, setDelivTitle] = useState('');
  const [delivDue, setDelivDue] = useState('');

  const selectedClient = data.consultingClients.find((c) => c.id === selectedClientId) || data.consultingClients[0];

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    addConsultingClient({
      name: clientName.trim(),
      company: clientCompany.trim() || '个人客户',
      stage: clientStage,
      hourlyRate: clientRate,
      hoursLogged: 0,
      notes: clientNotes.trim() || undefined,
      deliverables: [],
      meetingLogs: [],
    });

    setClientName('');
    setClientCompany('');
    setIsAddClientOpen(false);
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !meetingTitle.trim()) return;

    addMeetingLog(selectedClient.id, {
      date: meetingDate,
      title: meetingTitle.trim(),
      summary: meetingSummary.trim(),
      actionItems: meetingActions.split('\n').map((s) => s.trim()).filter(Boolean),
    });

    setMeetingTitle('');
    setMeetingSummary('');
    setMeetingActions('');
    setIsAddMeetingOpen(false);
  };

  const handleCreateDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !delivTitle.trim()) return;

    const newItem: DeliverableItem = {
      id: `deliv-${Date.now()}`,
      title: delivTitle.trim(),
      completed: false,
      dueDate: delivDue.trim() || undefined,
    };

    updateConsultingClient(selectedClient.id, {
      deliverables: [...(selectedClient.deliverables || []), newItem],
    });

    setDelivTitle('');
    setDelivDue('');
    setIsAddDeliverableOpen(false);
  };

  const handleAddHours = (hours: number) => {
    if (!selectedClient) return;
    updateConsultingClient(selectedClient.id, {
      hoursLogged: (selectedClient.hoursLogged || 0) + hours,
    });
  };

  const getStageBadge = (stage: ClientStage) => {
    switch (stage) {
      case 'active':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">服务中</span>;
      case 'signed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">已签约</span>;
      case 'proposal':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">方案对接</span>;
      case 'contacted':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">初步接洽</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">已结项</span>;
      case 'lead':
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">潜在意向</span>;
    }
  };

  return (
    <div id="consulting-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            独立咨询与商业交付
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            客户档案管线、双周纪要沉淀、交付物跟进与工时统计
          </p>
        </div>

        <button
          onClick={() => setIsAddClientOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-neutral-950 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          新建客户档案
        </button>
      </div>

      {/* Main Grid: Left Clients List (4 cols), Right Detail Pane (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 cols: Client Cards */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              所有客户 ({data.consultingClients.length})
            </span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {data.consultingClients.map((client) => {
              const isSelected = selectedClient?.id === client.id;
              const pendingDelivs = (client.deliverables || []).filter((d) => !d.completed).length;

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                    isSelected
                      ? 'bg-neutral-900 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-neutral-900/70 hover:bg-neutral-850 border-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-100">{client.name}</h4>
                      <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-neutral-500" />
                        {client.company}
                      </p>
                    </div>
                    {getStageBadge(client.stage)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-850">
                    <span className="font-mono">¥{client.hourlyRate}/h</span>
                    <span>已计 {client.hoursLogged} 小时</span>
                    {pendingDelivs > 0 && (
                      <span className="text-amber-400 font-medium">
                        {pendingDelivs} 项未交
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 cols: Client Detailed Workspace */}
        {selectedClient ? (
          <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
            {/* Top Info Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-neutral-100">{selectedClient.name}</h2>
                  {getStageBadge(selectedClient.stage)}
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  企业/机构: <span className="text-neutral-200">{selectedClient.company}</span>
                  {selectedClient.notes && ` · 备注: ${selectedClient.notes}`}
                </p>
              </div>

              {/* Hours counter & Billing */}
              <div className="flex items-center gap-4 bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800">
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider">累计咨询工时</div>
                  <div className="text-base font-bold font-mono text-indigo-400">
                    {selectedClient.hoursLogged} <span className="text-xs text-neutral-400 font-normal">小时</span>
                  </div>
                </div>
                <div className="h-7 w-px bg-neutral-800" />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAddHours(1)}
                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors"
                    title="计入 1 小时"
                  >
                    +1h
                  </button>
                  <button
                    onClick={() => handleAddHours(2)}
                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors"
                    title="计入 2 小时"
                  >
                    +2h
                  </button>
                </div>
              </div>
            </div>

            {/* Stage Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-400">推进合作阶段:</span>
              {(['lead', 'contacted', 'proposal', 'signed', 'active', 'completed'] as ClientStage[]).map((st) => (
                <button
                  key={st}
                  onClick={() => updateConsultingClient(selectedClient.id, { stage: st })}
                  className={`px-2.5 py-1 rounded-lg transition-colors capitalize ${
                    selectedClient.stage === st
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                      : 'bg-neutral-950 text-neutral-500 hover:text-neutral-300 border border-neutral-800'
                  }`}
                >
                  {st === 'lead' ? '潜在' : st === 'contacted' ? '接洽' : st === 'proposal' ? '方案' : st === 'signed' ? '签约' : st === 'active' ? '服务' : '结项'}
                </button>
              ))}
            </div>

            {/* Section 1: Deliverables Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  交付物与里程碑 ({(selectedClient.deliverables || []).filter((d) => d.completed).length} / {(selectedClient.deliverables || []).length})
                </h3>
                <button
                  onClick={() => setIsAddDeliverableOpen(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> 新建交付物
                </button>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 divide-y divide-neutral-850">
                {(selectedClient.deliverables || []).length === 0 ? (
                  <div className="py-4 text-center text-xs text-neutral-500">暂无约定交付物</div>
                ) : (
                  (selectedClient.deliverables || []).map((d) => (
                    <div
                      key={d.id}
                      className="py-2.5 flex items-center justify-between gap-3 group cursor-pointer select-none"
                      onClick={() => toggleDeliverable(selectedClient.id, d.id)}
                    >
                      <div className="flex items-center gap-3">
                        {d.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-neutral-500 group-hover:text-indigo-400 shrink-0" />
                        )}
                        <span className={`text-xs ${d.completed ? 'line-through text-neutral-500' : 'text-neutral-200 font-medium'}`}>
                          {d.title}
                        </span>
                      </div>
                      {d.dueDate && (
                        <span className="text-[11px] font-mono text-neutral-500">
                          截止: {d.dueDate}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Section 2: Meeting Minutes & Communication History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  沟通纪要与动作项 ({(selectedClient.meetingLogs || []).length} 次)
                </h3>
                <button
                  onClick={() => setIsAddMeetingOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium rounded-xl border border-indigo-500/30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> 记录会议
                </button>
              </div>

              <div className="space-y-3">
                {(selectedClient.meetingLogs || []).length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-500 bg-neutral-950 border border-neutral-800 rounded-xl">
                    暂无会议沟通记录，点击右上角沉淀纪要
                  </div>
                ) : (
                  selectedClient.meetingLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 bg-neutral-950 border border-neutral-800/90 rounded-xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-neutral-100">{log.title}</h4>
                        <span className="text-xs font-mono text-neutral-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {log.date}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
                        {log.summary}
                      </p>

                      {log.actionItems && log.actionItems.length > 0 && (
                        <div className="pt-2 border-t border-neutral-850 space-y-1">
                          <span className="text-[10px] uppercase font-semibold text-amber-400">待办后续 Actions:</span>
                          <ul className="list-disc list-inside text-xs text-neutral-400 space-y-0.5">
                            {log.actionItems.map((act, i) => (
                              <li key={i}>{act}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Danger zone */}
            <div className="pt-4 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => deleteConsultingClient(selectedClient.id)}
                className="text-xs text-neutral-500 hover:text-rose-400 inline-flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> 删除此客户全部档案
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-500 text-sm">
            请从左侧选择客户，或新建客户档案
          </div>
        )}
      </div>

      {/* Modal: Add Client */}
      {isAddClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setIsAddClientOpen(false)}>
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-neutral-100">新建咨询客户档案</h3>
            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">客户联系人 / 姓名 *</label>
                <input
                  type="text"
                  required
                  placeholder="如：张总"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">企业 / 机构全称</label>
                <input
                  type="text"
                  placeholder="如：未来数字科技有限公司"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">初始合作阶段</label>
                <select
                  value={clientStage}
                  onChange={(e) => setClientStage(e.target.value as ClientStage)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="lead">潜在意向 (Lead)</option>
                  <option value="contacted">已初步接洽</option>
                  <option value="proposal">方案与商务对齐</option>
                  <option value="signed">已签约</option>
                  <option value="active">正式服务中</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">咨询单价 (元/小时)</label>
                <input
                  type="number"
                  value={clientRate}
                  onChange={(e) => setClientRate(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">合作背景备忘</label>
                <textarea
                  rows={2}
                  placeholder="如：主要做架构评审与技术团队效能优化"
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-neutral-950 text-xs font-semibold rounded-xl"
                >
                  建立客户档案
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Meeting */}
      {isAddMeetingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setIsAddMeetingOpen(false)}>
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-neutral-100">记录咨询会议与纪要</h3>
            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">会议日期</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">会议主题 *</label>
                  <input
                    type="text"
                    required
                    placeholder="如：第三期架构方案评审会"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">关键讨论纪要 / 决议 *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="记录客户核心诉求、讨论重点与定论..."
                  value={meetingSummary}
                  onChange={(e) => setMeetingSummary(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">后续动作项 Actions (换行分隔)</label>
                <textarea
                  rows={2}
                  placeholder="输出离线架构白皮书草案&#10;周四前邮件确认接口规范"
                  value={meetingActions}
                  onChange={(e) => setMeetingActions(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMeetingOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-neutral-950 text-xs font-semibold rounded-xl"
                >
                  存入纪要
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Deliverable */}
      {isAddDeliverableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setIsAddDeliverableOpen(false)}>
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-neutral-100">新增交付物里程碑</h3>
            <form onSubmit={handleCreateDeliverable} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">交付物名称 *</label>
                <input
                  type="text"
                  required
                  placeholder="如：《核心架构评审与落地指导方案》"
                  value={delivTitle}
                  onChange={(e) => setDelivTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">约定交付日期</label>
                <input
                  type="date"
                  value={delivDue}
                  onChange={(e) => setDelivDue(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDeliverableOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-neutral-950 text-xs font-semibold rounded-xl"
                >
                  添加交付物
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
