import { useStore } from '../store';
import { Link } from 'react-router-dom';
import {
  ListOrdered, Users, Mail, TrendingUp, ArrowRight,
  CheckCircle2, Reply, XCircle, Play,
} from 'lucide-react';
import { StatusBadge } from '../components/Badge';
import { format } from 'date-fns';

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { sequences, prospects, enrollments, getSequenceStats } = useStore();

  const activeSequences = sequences.filter((s) => s.status === 'active');
  const activeEnrollments = enrollments.filter((e) => e.status === 'active');
  const totalEmailsSent = enrollments.reduce((a, e) => a + e.emailsSent, 0);
  const totalReplied = enrollments.filter((e) => e.status === 'replied').length;
  const replyRate = activeEnrollments.length > 0
    ? Math.round((totalReplied / enrollments.length) * 100)
    : 0;

  const recentEnrollments = [...enrollments]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 6);

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ListOrdered}
          label="Active Sequences"
          value={activeSequences.length}
          sub={`${sequences.length} total`}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Users}
          label="Prospects Enrolled"
          value={activeEnrollments.length}
          sub={`${prospects.length} total prospects`}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          icon={Mail}
          label="Emails Sent"
          value={totalEmailsSent.toLocaleString()}
          sub="all time"
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Reply Rate"
          value={`${replyRate}%`}
          sub={`${totalReplied} replies`}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sequences Summary */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Active Sequences</h2>
            <Link to="/sequences" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {activeSequences.slice(0, 5).map((seq) => {
              const stats = getSequenceStats(seq.id);
              return (
                <Link key={seq.id} to={`/sequences/${seq.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{seq.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{seq.steps.length} steps · {stats.totalEnrolled} enrolled</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3 text-green-500" /> {stats.active}
                    </span>
                    <span className="flex items-center gap-1">
                      <Reply className="w-3 h-3 text-purple-500" /> {stats.replied}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-500" /> {stats.finished}
                    </span>
                    <span className="font-semibold text-green-600">{stats.replyRate}%</span>
                  </div>
                </Link>
              );
            })}
            {activeSequences.length === 0 && (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                No active sequences yet.{' '}
                <Link to="/sequences" className="text-blue-600 hover:underline">Create one</Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Enrollments</h2>
            <Link to="/enrollments" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentEnrollments.map((enr) => {
              const prospect = useStore.getState().prospects.find((p) => p.id === enr.prospectId);
              const sequence = sequences.find((s) => s.id === enr.sequenceId);
              if (!prospect || !sequence) return null;
              return (
                <div key={enr.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {prospect.firstName} {prospect.lastName}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{sequence.name}</p>
                    </div>
                    <StatusBadge status={enr.status} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {format(new Date(enr.startedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active', value: enrollments.filter(e => e.status === 'active').length, icon: Play, color: 'text-green-600' },
          { label: 'Replied', value: enrollments.filter(e => e.status === 'replied').length, icon: Reply, color: 'text-purple-600' },
          { label: 'Finished', value: enrollments.filter(e => e.status === 'finished').length, icon: CheckCircle2, color: 'text-blue-600' },
          { label: 'Bounced / Opted Out', value: enrollments.filter(e => e.status === 'bounced' || e.status === 'opted_out').length, icon: XCircle, color: 'text-red-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <Icon className={`w-7 h-7 ${color}`} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
