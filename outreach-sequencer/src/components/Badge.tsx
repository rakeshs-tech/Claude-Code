import type { SequenceStatus, EnrollmentStatus } from '../types';

const STATUS_STYLES: Record<string, string> = {
  // Sequence
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-gray-100 text-gray-600',
  // Enrollment
  finished: 'bg-blue-100 text-blue-700',
  replied: 'bg-purple-100 text-purple-700',
  bounced: 'bg-red-100 text-red-700',
  opted_out: 'bg-orange-100 text-orange-700',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  draft: 'Draft',
  finished: 'Finished',
  replied: 'Replied',
  bounced: 'Bounced',
  opted_out: 'Opted Out',
};

interface BadgeProps {
  status: SequenceStatus | EnrollmentStatus;
}

export function StatusBadge({ status }: BadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600';
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

interface StepBadgeProps {
  type: string;
}

const STEP_STYLES: Record<string, string> = {
  email: 'bg-blue-100 text-blue-700',
  call: 'bg-green-100 text-green-700',
  task: 'bg-orange-100 text-orange-700',
  linkedin: 'bg-sky-100 text-sky-700',
};

export function StepTypeBadge({ type }: StepBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${STEP_STYLES[type] ?? 'bg-gray-100 text-gray-600'}`}>
      {type}
    </span>
  );
}
