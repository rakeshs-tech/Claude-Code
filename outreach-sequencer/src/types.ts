export type StepType = 'email' | 'call' | 'task' | 'linkedin';
export type SequenceStatus = 'draft' | 'active' | 'paused';
export type EnrollmentStatus = 'active' | 'paused' | 'finished' | 'replied' | 'bounced' | 'opted_out';
export type TaskType = 'general' | 'call' | 'inmail' | 'action_item';
export type LinkedInActionType = 'connect' | 'message' | 'view_profile';

export interface Step {
  id: string;
  sequenceId: string;
  order: number;
  type: StepType;
  name: string;
  daysDelay: number;
  // Email fields
  subject?: string;
  body?: string;
  isReply?: boolean; // reply to thread
  // Call fields
  callNote?: string;
  // Task fields
  taskType?: TaskType;
  taskDescription?: string;
  // LinkedIn fields
  linkedInAction?: LinkedInActionType;
  linkedInMessage?: string;
}

export interface Sequence {
  id: string;
  name: string;
  description: string;
  status: SequenceStatus;
  createdAt: string;
  updatedAt: string;
  steps: Step[];
  tags: string[];
  // Settings
  scheduleType: 'business_days' | 'all_days';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  timezone: string;
}

export interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  company: string;
  phone: string;
  linkedinUrl: string;
  tags: string[];
  createdAt: string;
  // Custom variables
  customVars: Record<string, string>;
}

export interface Enrollment {
  id: string;
  sequenceId: string;
  prospectId: string;
  status: EnrollmentStatus;
  currentStepOrder: number;
  startedAt: string;
  updatedAt: string;
  nextStepAt: string | null;
  finishedAt: string | null;
  // Activity tracking
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  repliedAt: string | null;
  bouncedAt: string | null;
}

export interface EmailActivity {
  id: string;
  enrollmentId: string;
  stepId: string;
  prospectId: string;
  sequenceId: string;
  type: 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced';
  timestamp: string;
  subject: string;
}

// Derived/computed types for views
export interface SequenceStats {
  sequenceId: string;
  totalEnrolled: number;
  active: number;
  finished: number;
  replied: number;
  bounced: number;
  optedOut: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  openRate: number;
  replyRate: number;
  clickRate: number;
}

export interface EnrollmentView extends Enrollment {
  prospect: Prospect;
  sequence: Sequence;
}
