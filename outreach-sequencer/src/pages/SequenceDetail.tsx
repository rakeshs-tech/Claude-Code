import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Plus, Mail, Phone, Linkedin, ClipboardList,
  Trash2, Edit2, GripVertical, Play, Pause, Settings2,
  Users, BarChart2, Check, X, ArrowDown,
} from 'lucide-react';
import { useStore } from '../store';
import { StatusBadge, StepTypeBadge } from '../components/Badge';
import type { Step, StepType, TaskType, LinkedInActionType, Prospect } from '../types';

// ─── Step Icon helper ─────────────────────────────────────────────────────────
function StepIcon({ type, size = 'md' }: { type: StepType; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  switch (type) {
    case 'email': return <Mail className={sz} />;
    case 'call': return <Phone className={sz} />;
    case 'linkedin': return <Linkedin className={sz} />;
    case 'task': return <ClipboardList className={sz} />;
  }
}

const STEP_COLORS: Record<StepType, string> = {
  email: 'bg-blue-100 text-blue-600 border-blue-200',
  call: 'bg-green-100 text-green-600 border-green-200',
  linkedin: 'bg-sky-100 text-sky-600 border-sky-200',
  task: 'bg-orange-100 text-orange-600 border-orange-200',
};

// ─── Step Editor Modal ────────────────────────────────────────────────────────
function StepEditor({
  sequenceId,
  step,
  onClose,
}: {
  sequenceId: string;
  step: Partial<Step> & { type: StepType };
  onClose: () => void;
}) {
  const { addStep, updateStep } = useStore();
  const isNew = !step.id;
  const [form, setForm] = useState<Partial<Step>>({
    type: step.type,
    name: step.name ?? '',
    daysDelay: step.daysDelay ?? 0,
    subject: step.subject ?? '',
    body: step.body ?? '',
    isReply: step.isReply ?? false,
    callNote: step.callNote ?? '',
    taskType: step.taskType ?? 'general',
    taskDescription: step.taskDescription ?? '',
    linkedInAction: step.linkedInAction ?? 'connect',
    linkedInMessage: step.linkedInMessage ?? '',
  });

  const set = (k: keyof Step, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name?.trim()) return;
    if (isNew) {
      const seq = useStore.getState().sequences.find((s) => s.id === sequenceId);
      const nextOrder = (seq?.steps.length ?? 0) + 1;
      addStep(sequenceId, { ...form, order: nextOrder } as Omit<Step, 'id' | 'sequenceId'>);
    } else {
      updateStep(sequenceId, step.id!, form);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${STEP_COLORS[form.type as StepType]}`}>
              <StepIcon type={form.type as StepType} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{isNew ? 'Add Step' : 'Edit Step'}</h2>
              <p className="text-xs text-gray-500 capitalize">{form.type} step</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Common fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Step Name *</label>
              <input
                value={form.name ?? ''}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Initial Outreach"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Days Delay
                <span className="text-gray-400 font-normal ml-1">(from previous step)</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.daysDelay ?? 0}
                onChange={(e) => set('daysDelay', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email fields */}
          {form.type === 'email' && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isReply"
                  checked={form.isReply ?? false}
                  onChange={(e) => set('isReply', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isReply" className="text-sm text-gray-700">Reply to previous thread</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject Line</label>
                <input
                  value={form.subject ?? ''}
                  onChange={(e) => set('subject', e.target.value)}
                  placeholder="e.g. Quick question about {{company}}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Body</label>
                <textarea
                  value={form.body ?? ''}
                  onChange={(e) => set('body', e.target.value)}
                  rows={8}
                  placeholder="Write your email... Use {{firstName}}, {{company}}, {{pain_point}}, {{senderName}} as variables."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-xs"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Variables: <code className="bg-gray-100 px-1 rounded">{'{{firstName}}'}</code>{' '}
                  <code className="bg-gray-100 px-1 rounded">{'{{company}}'}</code>{' '}
                  <code className="bg-gray-100 px-1 rounded">{'{{senderName}}'}</code>{' '}
                  <code className="bg-gray-100 px-1 rounded">{'{{pain_point}}'}</code>
                </p>
              </div>
            </>
          )}

          {/* Call fields */}
          {form.type === 'call' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Call Notes / Script</label>
              <textarea
                value={form.callNote ?? ''}
                onChange={(e) => set('callNote', e.target.value)}
                rows={6}
                placeholder="Notes or script for the call..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}

          {/* Task fields */}
          {form.type === 'task' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Type</label>
                <select
                  value={form.taskType ?? 'general'}
                  onChange={(e) => set('taskType', e.target.value as TaskType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General Task</option>
                  <option value="call">Call</option>
                  <option value="inmail">InMail</option>
                  <option value="action_item">Action Item</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Description</label>
                <textarea
                  value={form.taskDescription ?? ''}
                  onChange={(e) => set('taskDescription', e.target.value)}
                  rows={4}
                  placeholder="Describe what needs to be done..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </>
          )}

          {/* LinkedIn fields */}
          {form.type === 'linkedin' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn Action</label>
                <select
                  value={form.linkedInAction ?? 'connect'}
                  onChange={(e) => set('linkedInAction', e.target.value as LinkedInActionType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="connect">Send Connection Request</option>
                  <option value="message">Send Message</option>
                  <option value="view_profile">View Profile</option>
                </select>
              </div>
              {(form.linkedInAction === 'connect' || form.linkedInAction === 'message') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea
                    value={form.linkedInMessage ?? ''}
                    onChange={(e) => set('linkedInMessage', e.target.value)}
                    rows={4}
                    placeholder="Your LinkedIn message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name?.trim()}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5" />
            {isNew ? 'Add Step' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Enroll Modal ─────────────────────────────────────────────────────────────
function EnrollModal({ sequenceId, onClose }: { sequenceId: string; onClose: () => void }) {
  const { prospects, enrollments, enrollProspect } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const activeEnrollmentProspectIds = new Set(
    enrollments.filter((e) => e.sequenceId === sequenceId && e.status === 'active').map((e) => e.prospectId)
  );

  const filtered = prospects.filter((p) => {
    const name = `${p.firstName} ${p.lastName} ${p.email} ${p.company}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleEnroll = () => {
    selected.forEach((id) => enrollProspect(sequenceId, id));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Enroll Prospects</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prospects..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filtered.map((p: Prospect) => {
            const alreadyEnrolled = activeEnrollmentProspectIds.has(p.id);
            const isSelected = selected.has(p.id);
            return (
              <label
                key={p.id}
                className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors ${alreadyEnrolled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={alreadyEnrolled}
                  onChange={() => toggle(p.id)}
                  className="rounded"
                />
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {p.firstName[0]}{p.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{p.title} · {p.company}</p>
                </div>
                {alreadyEnrolled && (
                  <span className="ml-auto text-xs text-green-600 font-medium flex-shrink-0">Enrolled</span>
                )}
              </label>
            );
          })}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">{selected.size} selected</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={handleEnroll}
              disabled={selected.size === 0}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Enroll {selected.size > 0 ? `(${selected.size})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main SequenceDetail ──────────────────────────────────────────────────────
type Tab = 'steps' | 'settings' | 'enrollments' | 'analytics';

export function SequenceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sequences, deleteStep, reorderSteps, setSequenceStatus, updateSequence, getSequenceStats, enrollments, prospects } = useStore();

  const sequence = sequences.find((s) => s.id === id);
  const [activeTab, setActiveTab] = useState<Tab>('steps');
  const [editingStep, setEditingStep] = useState<(Partial<Step> & { type: StepType }) | null>(null);
  const [showEnroll, setShowEnroll] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  if (!sequence) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Sequence not found.</p>
        <Link to="/sequences" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Back to Sequences</Link>
      </div>
    );
  }

  const stats = getSequenceStats(sequence.id);
  const seqEnrollments = enrollments.filter((e) => e.sequenceId === id);
  const sortedSteps = [...sequence.steps].sort((a, b) => a.order - b.order);

  const handleDragStart = (order: number) => setDragFrom(order);
  const handleDrop = (toOrder: number) => {
    if (dragFrom === null || dragFrom === toOrder) return;
    const stepped = [...sortedSteps];
    const from = stepped.findIndex((s) => s.order === dragFrom);
    const to = stepped.findIndex((s) => s.order === toOrder);
    const [moved] = stepped.splice(from, 1);
    stepped.splice(to, 0, moved);
    reorderSteps(sequence.id, stepped.map((s) => s.id));
    setDragFrom(null);
  };

  const STEP_TYPES: { type: StepType; label: string; icon: typeof Mail }[] = [
    { type: 'email', label: 'Email', icon: Mail },
    { type: 'call', label: 'Call', icon: Phone },
    { type: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { type: 'task', label: 'Task', icon: ClipboardList },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/sequences')} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-gray-900">{sequence.name}</h1>
                <StatusBadge status={sequence.status} />
              </div>
              {sequence.description && (
                <p className="text-sm text-gray-400 mt-0.5">{sequence.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowEnroll(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              Enroll
            </button>
            {sequence.status === 'active' ? (
              <button
                onClick={() => setSequenceStatus(sequence.id, 'paused')}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                Pause
              </button>
            ) : (
              <button
                onClick={() => setSequenceStatus(sequence.id, 'active')}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Activate
              </button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
          {[
            { label: 'Enrolled', value: stats.totalEnrolled },
            { label: 'Active', value: stats.active, color: 'text-green-600' },
            { label: 'Replied', value: stats.replied, color: 'text-purple-600' },
            { label: 'Finished', value: stats.finished, color: 'text-blue-600' },
            { label: 'Open Rate', value: `${stats.openRate}%`, color: 'text-gray-900 font-semibold' },
            { label: 'Reply Rate', value: `${stats.replyRate}%`, color: 'text-green-600 font-semibold' },
            { label: 'Click Rate', value: `${stats.clickRate}%`, color: 'text-gray-900 font-semibold' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className={`text-base font-bold ${color ?? 'text-gray-900'}`}>{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mt-4 -mb-4 border-b-0">
          {(['steps', 'enrollments', 'analytics', 'settings'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* ── Steps Tab ──────────────────────────────────────────────── */}
        {activeTab === 'steps' && (
          <div className="max-w-2xl mx-auto">
            {sortedSteps.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No steps yet</p>
                <p className="text-sm mt-1">Add your first step to get started</p>
              </div>
            )}

            {sortedSteps.map((step, idx) => (
              <div key={step.id}>
                {/* Delay indicator (not for first step) */}
                {idx > 0 && (
                  <div className="flex items-center gap-2 py-2 px-4">
                    <div className="flex-1 border-l-2 border-dashed border-gray-200 ml-5 h-6" />
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                      <ArrowDown className="w-3 h-3" />
                      {step.daysDelay === 0 ? 'Same day' : `${step.daysDelay} day${step.daysDelay > 1 ? 's' : ''} later`}
                    </div>
                    <div className="flex-1 border-l-2 border-dashed border-gray-200 ml-0 h-6" />
                  </div>
                )}

                {/* Step Card */}
                <div
                  draggable
                  onDragStart={() => handleDragStart(step.order)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(step.order)}
                  className="group flex items-start gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all cursor-default"
                >
                  <div className="flex items-center gap-2 pt-0.5">
                    <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400 cursor-grab" />
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </div>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border flex-shrink-0 ${STEP_COLORS[step.type]}`}>
                    <StepIcon type={step.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{step.name}</p>
                      <StepTypeBadge type={step.type} />
                    </div>
                    {step.type === 'email' && step.subject && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">Subject: {step.subject}</p>
                    )}
                    {step.type === 'call' && step.callNote && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{step.callNote}</p>
                    )}
                    {step.type === 'task' && step.taskDescription && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{step.taskDescription}</p>
                    )}
                    {step.type === 'linkedin' && (
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">{step.linkedInAction?.replace('_', ' ')}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingStep(step)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteStep(sequence.id, step.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Step */}
            <div className="mt-4 flex items-center gap-3 justify-center pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium">Add step:</p>
              {STEP_TYPES.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setEditingStep({ type, daysDelay: sortedSteps.length === 0 ? 0 : 1 })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${STEP_COLORS[type]} hover:opacity-80`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Enrollments Tab ─────────────────────────────────────────── */}
        {activeTab === 'enrollments' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{seqEnrollments.length} total enrollments</p>
              <button
                onClick={() => setShowEnroll(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Enroll Prospects
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prospect</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Step</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sent</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opened</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Clicked</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrolled</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {seqEnrollments.map((enr) => {
                    const p = prospects.find((x) => x.id === enr.prospectId);
                    if (!p) return null;
                    return (
                      <tr key={enr.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center">
                              {p.firstName[0]}{p.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                              <p className="text-xs text-gray-400">{p.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={enr.status} /></td>
                        <td className="px-5 py-3.5 text-right text-sm text-gray-600">{enr.currentStepOrder} / {sequence.steps.length}</td>
                        <td className="px-5 py-3.5 text-right text-sm text-gray-600">{enr.emailsSent}</td>
                        <td className="px-5 py-3.5 text-right text-sm text-gray-600">{enr.emailsOpened}</td>
                        <td className="px-5 py-3.5 text-right text-sm text-gray-600">{enr.emailsClicked}</td>
                        <td className="px-5 py-3.5 text-right text-xs text-gray-400">
                          {format(new Date(enr.startedAt), 'MMM d')}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <EnrollmentActions enrollmentId={enr.id} status={enr.status} />
                        </td>
                      </tr>
                    );
                  })}
                  {seqEnrollments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">
                        No prospects enrolled yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Analytics Tab ───────────────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <div className="max-w-3xl">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Open Rate', value: `${stats.openRate}%`, sub: `${stats.emailsOpened} / ${stats.emailsSent} emails` },
                { label: 'Reply Rate', value: `${stats.replyRate}%`, sub: `${stats.replied} replies`, color: 'text-green-600' },
                { label: 'Click Rate', value: `${stats.clickRate}%`, sub: `${stats.emailsClicked} clicks` },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-sm text-gray-500 mb-1">{label}</p>
                  <p className={`text-3xl font-bold ${color ?? 'text-gray-900'}`}>{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{sub}</p>
                </div>
              ))}
            </div>

            {/* Per-step table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Step Performance</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Step</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reached</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sent</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opened</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Replied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedSteps.map((step, idx) => {
                    // Simulate per-step metrics based on order decay
                    const decay = Math.pow(0.7, idx);
                    const reached = Math.round(stats.totalEnrolled * decay);
                    const sent = step.type === 'email' ? reached : 0;
                    const opened = Math.round(sent * 0.55);
                    const replied = Math.round(sent * 0.12);
                    return (
                      <tr key={step.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center">{idx + 1}</span>
                            <div className={`w-6 h-6 rounded flex items-center justify-center ${STEP_COLORS[step.type]}`}>
                              <StepIcon type={step.type} size="sm" />
                            </div>
                            <p className="text-sm text-gray-900">{step.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right text-sm text-gray-600">{reached}</td>
                        <td className="px-5 py-3.5 text-right text-sm text-gray-600">{sent || '—'}</td>
                        <td className="px-5 py-3.5 text-right text-sm text-gray-600">{sent ? `${opened} (${Math.round((opened / sent) * 100)}%)` : '—'}</td>
                        <td className="px-5 py-3.5 text-right text-sm text-green-600">{sent ? `${replied} (${Math.round((replied / sent) * 100)}%)` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Settings Tab ────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <SequenceSettings sequence={sequence} onUpdate={(u) => updateSequence(sequence.id, u)} />
        )}
      </div>

      {/* Modals */}
      {editingStep && (
        <StepEditor
          sequenceId={sequence.id}
          step={editingStep}
          onClose={() => setEditingStep(null)}
        />
      )}
      {showEnroll && (
        <EnrollModal sequenceId={sequence.id} onClose={() => setShowEnroll(false)} />
      )}
    </div>
  );
}

function EnrollmentActions({ enrollmentId, status }: { enrollmentId: string; status: string }) {
  const { pauseEnrollment, resumeEnrollment, unenrollProspect } = useStore();
  return (
    <div className="flex items-center gap-1 justify-end">
      {status === 'active' && (
        <button onClick={() => pauseEnrollment(enrollmentId)} title="Pause"
          className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors">
          <Pause className="w-3.5 h-3.5" />
        </button>
      )}
      {status === 'paused' && (
        <button onClick={() => resumeEnrollment(enrollmentId)} title="Resume"
          className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
          <Play className="w-3.5 h-3.5" />
        </button>
      )}
      <button onClick={() => unenrollProspect(enrollmentId)} title="Remove"
        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function SequenceSettings({ sequence, onUpdate }: {
  sequence: Sequence;
  onUpdate: (u: Partial<typeof sequence>) => void;
}) {
  const [form, setForm] = useState({
    name: sequence.name,
    description: sequence.description,
    scheduleType: sequence.scheduleType,
    startTime: sequence.startTime,
    endTime: sequence.endTime,
    timezone: sequence.timezone,
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    onUpdate(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-xl space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-gray-400" />
          General Settings
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Sequence Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Scheduling</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Schedule Type</label>
          <select
            value={form.scheduleType}
            onChange={(e) => setForm((f) => ({ ...f, scheduleType: e.target.value as typeof form.scheduleType }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="business_days">Business Days Only (Mon–Fri)</option>
            <option value="all_days">All Days</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
          <select
            value={form.timezone}
            onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {['America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo'].map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={save}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : 'Save Settings'}
      </button>
    </div>
  );
}

// Import format
import { format } from 'date-fns';
import type { Sequence as SequenceType } from '../types';
