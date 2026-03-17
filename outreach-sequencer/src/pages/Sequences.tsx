import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Play, Pause, Trash2, Copy, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { StatusBadge } from '../components/Badge';
import { format } from 'date-fns';
import type { Sequence, SequenceStatus } from '../types';

function NewSequenceModal({ onClose, onCreate }: { onClose: () => void; onCreate: (seq: Sequence) => void }) {
  const { addSequence } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    const seq = addSequence({
      name: name.trim(),
      description: description.trim(),
      status: 'draft',
      tags: [],
      scheduleType: 'business_days',
      startTime: '08:00',
      endTime: '17:00',
      timezone: 'America/New_York',
    });
    onCreate(seq);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">New Sequence</h2>
          <p className="text-sm text-gray-500 mt-1">Create a new outreach sequence</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Cold Outreach - SaaS Founders"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Create Sequence
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sequences() {
  const { sequences, deleteSequence, setSequenceStatus, getSequenceStats, addSequence } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | SequenceStatus>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = sequences.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleDuplicate = (seq: Sequence) => {
    const newSeq = addSequence({
      name: `${seq.name} (Copy)`,
      description: seq.description,
      status: 'draft',
      tags: [...seq.tags],
      scheduleType: seq.scheduleType,
      startTime: seq.startTime,
      endTime: seq.endTime,
      timezone: seq.timezone,
    });
    // Copy steps
    seq.steps.forEach((step) => {
      useStore.getState().addStep(newSeq.id, {
        order: step.order,
        type: step.type,
        name: step.name,
        daysDelay: step.daysDelay,
        subject: step.subject,
        body: step.body,
        isReply: step.isReply,
        callNote: step.callNote,
        taskType: step.taskType,
        taskDescription: step.taskDescription,
        linkedInAction: step.linkedInAction,
        linkedInMessage: step.linkedInMessage,
      });
    });
    navigate(`/sequences/${newSeq.id}`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sequences</h1>
          <p className="text-sm text-gray-500 mt-0.5">{sequences.length} sequences total</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Sequence
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sequences..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(['all', 'active', 'paused', 'draft'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                filterStatus === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Steps</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrolled</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Open %</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reply %</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((seq) => {
              const stats = getSequenceStats(seq.id);
              return (
                <tr key={seq.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <Link to={`/sequences/${seq.id}`} className="flex items-center gap-2 group/link">
                      <div>
                        <p className="text-sm font-medium text-gray-900 group-hover/link:text-blue-600 transition-colors">
                          {seq.name}
                        </p>
                        {seq.description && (
                          <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{seq.description}</p>
                        )}
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover/link:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={seq.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm text-gray-600">{seq.steps.length}</td>
                  <td className="px-5 py-3.5 text-right text-sm text-gray-600">{stats.totalEnrolled}</td>
                  <td className="px-5 py-3.5 text-right text-sm font-medium text-gray-900">{stats.openRate}%</td>
                  <td className="px-5 py-3.5 text-right text-sm font-medium text-green-600">{stats.replyRate}%</td>
                  <td className="px-5 py-3.5 text-right text-xs text-gray-400">
                    {format(new Date(seq.updatedAt), 'MMM d')}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="relative">
                      <button
                        onClick={(e) => { e.preventDefault(); setOpenMenu(openMenu === seq.id ? null : seq.id); }}
                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenu === seq.id && (
                        <div
                          className="absolute right-0 top-8 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                          onMouseLeave={() => setOpenMenu(null)}
                        >
                          {seq.status === 'active' ? (
                            <button onClick={() => { setSequenceStatus(seq.id, 'paused'); setOpenMenu(null); }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Pause className="w-3.5 h-3.5" /> Pause
                            </button>
                          ) : (
                            <button onClick={() => { setSequenceStatus(seq.id, 'active'); setOpenMenu(null); }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Play className="w-3.5 h-3.5" /> Activate
                            </button>
                          )}
                          <button onClick={() => { handleDuplicate(seq); setOpenMenu(null); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Copy className="w-3.5 h-3.5" /> Duplicate
                          </button>
                          <div className="my-1 border-t border-gray-100" />
                          <button onClick={() => { deleteSequence(seq.id); setOpenMenu(null); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                  <ListOrdered className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No sequences found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showNew && (
        <NewSequenceModal
          onClose={() => setShowNew(false)}
          onCreate={(seq) => { setShowNew(false); navigate(`/sequences/${seq.id}`); }}
        />
      )}
    </div>
  );
}

// Re-export for lazy loading
export { ListOrdered };
