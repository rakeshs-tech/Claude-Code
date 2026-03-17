import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  Sequence, Step, Prospect, Enrollment, EnrollmentStatus,
  SequenceStatus, StepType, SequenceStats
} from '../types';

// ─── Seed Data ──────────────────────────────────────────────────────────────

const SEED_PROSPECTS: Prospect[] = [
  { id: 'p1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@acme.com', title: 'VP of Engineering', company: 'Acme Corp', phone: '+1 415 555 0101', linkedinUrl: 'https://linkedin.com/in/sarahjohnson', tags: ['enterprise', 'tech'], createdAt: '2026-02-01T10:00:00Z', customVars: { pain_point: 'developer productivity' } },
  { id: 'p2', firstName: 'Michael', lastName: 'Chen', email: 'mchen@startuphq.io', title: 'CTO', company: 'StartupHQ', phone: '+1 650 555 0202', linkedinUrl: 'https://linkedin.com/in/michaelchen', tags: ['startup', 'tech'], createdAt: '2026-02-05T11:00:00Z', customVars: { pain_point: 'scaling infrastructure' } },
  { id: 'p3', firstName: 'Emily', lastName: 'Rodriguez', email: 'emily@cloudworks.net', title: 'Head of Product', company: 'CloudWorks', phone: '+1 512 555 0303', linkedinUrl: '', tags: ['mid-market'], createdAt: '2026-02-10T09:00:00Z', customVars: {} },
  { id: 'p4', firstName: 'David', lastName: 'Park', email: 'dpark@infinitytech.com', title: 'Director of Sales', company: 'InfinityTech', phone: '+1 206 555 0404', linkedinUrl: 'https://linkedin.com/in/davidpark', tags: ['enterprise'], createdAt: '2026-02-12T14:00:00Z', customVars: {} },
  { id: 'p5', firstName: 'Jessica', lastName: 'Martinez', email: 'jessica@growthco.io', title: 'CEO', company: 'GrowthCo', phone: '+1 303 555 0505', linkedinUrl: 'https://linkedin.com/in/jessicamartinez', tags: ['startup', 'decision-maker'], createdAt: '2026-02-15T08:00:00Z', customVars: { pain_point: 'revenue growth' } },
  { id: 'p6', firstName: 'Tom', lastName: 'Wilson', email: 'twils@enterprise360.com', title: 'SVP Engineering', company: 'Enterprise360', phone: '+1 212 555 0606', linkedinUrl: '', tags: ['enterprise', 'tech'], createdAt: '2026-02-18T13:00:00Z', customVars: {} },
  { id: 'p7', firstName: 'Lisa', lastName: 'Taylor', email: 'lisa.taylor@nexussoft.com', title: 'VP Product', company: 'NexusSoft', phone: '+1 617 555 0707', linkedinUrl: 'https://linkedin.com/in/lisataylor', tags: ['mid-market'], createdAt: '2026-02-20T10:00:00Z', customVars: {} },
  { id: 'p8', firstName: 'James', lastName: 'Anderson', email: 'james@pivotlabs.co', title: 'Founder', company: 'Pivot Labs', phone: '+1 415 555 0808', linkedinUrl: 'https://linkedin.com/in/jamesanderson', tags: ['startup', 'decision-maker'], createdAt: '2026-02-22T09:00:00Z', customVars: {} },
];

const SEED_SEQUENCES: Sequence[] = [
  {
    id: 's1',
    name: 'Cold Outreach - Enterprise Tech',
    description: 'Multi-touch cold outreach targeting enterprise tech executives',
    status: 'active',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    tags: ['enterprise', 'tech'],
    scheduleType: 'business_days',
    startTime: '08:00',
    endTime: '17:00',
    timezone: 'America/New_York',
    steps: [
      { id: 'st1', sequenceId: 's1', order: 1, type: 'email', name: 'Initial Outreach', daysDelay: 0, subject: 'Quick question about {{company}}', body: "Hi {{firstName}},\n\nI noticed {{company}} is growing fast and wanted to reach out about how we've helped similar companies tackle {{pain_point}}.\n\nWould you be open to a quick 15-minute call this week?\n\nBest,\n{{senderName}}", isReply: false },
      { id: 'st2', sequenceId: 's1', order: 2, type: 'linkedin', name: 'LinkedIn Connect', daysDelay: 2, linkedInAction: 'connect', linkedInMessage: "Hi {{firstName}}, I sent you an email about {{company}} — would love to connect here too." },
      { id: 'st3', sequenceId: 's1', order: 3, type: 'email', name: 'Follow Up #1', daysDelay: 3, subject: 'Re: Quick question about {{company}}', body: "Hi {{firstName}},\n\nJust following up on my previous note. I wanted to share a quick case study of how we helped a company similar to {{company}} achieve a 30% improvement in {{pain_point}}.\n\nHappy to send it over if relevant?\n\n{{senderName}}", isReply: true },
      { id: 'st4', sequenceId: 's1', order: 4, type: 'call', name: 'Discovery Call Attempt', daysDelay: 2, callNote: 'Mention the email thread and case study. Ask about their current process for {{pain_point}}.' },
      { id: 'st5', sequenceId: 's1', order: 5, type: 'email', name: 'Value Email', daysDelay: 4, subject: 'Thought this might be helpful for {{company}}', body: "Hi {{firstName}},\n\nI put together a short resource specifically for companies like {{company}} — it covers the top 3 strategies our customers use to solve {{pain_point}}.\n\nWould it be ok to send it over?\n\n{{senderName}}" },
      { id: 'st6', sequenceId: 's1', order: 6, type: 'task', name: 'Research Prospect', daysDelay: 1, taskType: 'action_item', taskDescription: "Review {{firstName}}'s LinkedIn activity and {{company}}'s recent news. Look for relevant talking points." },
      { id: 'st7', sequenceId: 's1', order: 7, type: 'email', name: 'Break Up Email', daysDelay: 5, subject: 'Should I close your file?', body: "Hi {{firstName}},\n\nI've reached out a few times about helping {{company}} with {{pain_point}} but haven't heard back.\n\nI don't want to keep bothering you — should I close your file, or would it make sense to reconnect in a few months?\n\nNo hard feelings either way!\n\n{{senderName}}" },
    ],
  },
  {
    id: 's2',
    name: 'Inbound Lead Follow-Up',
    description: 'Fast follow-up sequence for inbound demo requests',
    status: 'active',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-02-10T10:00:00Z',
    tags: ['inbound'],
    scheduleType: 'all_days',
    startTime: '07:00',
    endTime: '20:00',
    timezone: 'America/Los_Angeles',
    steps: [
      { id: 'st10', sequenceId: 's2', order: 1, type: 'email', name: 'Thank You & Confirmation', daysDelay: 0, subject: 'Thanks for requesting a demo, {{firstName}}!', body: "Hi {{firstName}},\n\nThanks for reaching out! I've reserved a 30-minute slot for your demo of our platform.\n\nIn the meantime, here are a few resources to help you prepare:\n- Product overview video\n- Customer success stories\n\nLooking forward to connecting!\n\n{{senderName}}" },
      { id: 'st11', sequenceId: 's2', order: 2, type: 'call', name: 'Call Within 5 Minutes', daysDelay: 0, callNote: 'Hot inbound lead — call immediately. Ask what brought them to request the demo today.' },
      { id: 'st12', sequenceId: 's2', order: 3, type: 'email', name: 'Demo Reminder', daysDelay: 1, subject: 'Your demo is coming up, {{firstName}}', body: "Hi {{firstName}},\n\nJust a reminder that your demo is scheduled for tomorrow. I'm excited to show you how {{company}} can get value from day one.\n\nSee you soon!\n\n{{senderName}}" },
      { id: 'st13', sequenceId: 's2', order: 4, type: 'task', name: 'Prep Demo', daysDelay: 0, taskType: 'action_item', taskDescription: 'Review {{company}} website, LinkedIn, and any prior interactions. Customize the demo flow.' },
    ],
  },
  {
    id: 's3',
    name: 'Champion Re-Engagement',
    description: 'Re-engage past champions and warm contacts',
    status: 'paused',
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-02-05T10:00:00Z',
    tags: ['re-engagement'],
    scheduleType: 'business_days',
    startTime: '09:00',
    endTime: '18:00',
    timezone: 'America/Chicago',
    steps: [
      { id: 'st20', sequenceId: 's3', order: 1, type: 'email', name: 'Reconnect Email', daysDelay: 0, subject: "It's been a while, {{firstName}}!", body: "Hi {{firstName}},\n\nHope things are going well at {{company}}! It's been a while since we last spoke.\n\nI wanted to reconnect and share some exciting updates we've made since we last talked.\n\nWould love to catch up — do you have 15 minutes this week?\n\n{{senderName}}" },
      { id: 'st21', sequenceId: 's3', order: 2, type: 'linkedin', name: 'LinkedIn Message', daysDelay: 3, linkedInAction: 'message', linkedInMessage: "Hi {{firstName}}! Just sent you an email — would love to reconnect. Hope all is well at {{company}}!" },
      { id: 'st22', sequenceId: 's3', order: 3, type: 'email', name: "What's Changed", daysDelay: 4, subject: "What's new since we last spoke", body: "Hi {{firstName}},\n\nI wanted to share a few things that have changed since we last connected:\n\n• New features your team would love\n• 3 new enterprise customer wins in your space\n• Pricing has become much more flexible\n\nHappy to give you a quick tour if interested!\n\n{{senderName}}" },
    ],
  },
  {
    id: 's4',
    name: 'Post-Demo Follow-Up',
    description: 'Nurture sequence after a completed demo',
    status: 'draft',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    tags: ['post-demo'],
    scheduleType: 'business_days',
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'America/New_York',
    steps: [
      { id: 'st30', sequenceId: 's4', order: 1, type: 'email', name: 'Thank You + Recap', daysDelay: 0, subject: 'Great meeting you today, {{firstName}}!', body: "Hi {{firstName}},\n\nThank you for taking the time today — it was great learning about {{company}}'s goals.\n\nAs discussed, I'm attaching the proposal and relevant case studies.\n\nNext steps:\n1. I'll send over a tailored proposal by EOD tomorrow\n2. You'll review with your team\n3. We'll schedule a technical deep-dive if needed\n\nLet me know if you have any questions!\n\n{{senderName}}" },
      { id: 'st31', sequenceId: 's4', order: 2, type: 'task', name: 'Send Proposal', daysDelay: 1, taskType: 'action_item', taskDescription: 'Create and send a tailored proposal for {{company}}. Include ROI calculator and relevant case studies.' },
      { id: 'st32', sequenceId: 's4', order: 3, type: 'email', name: 'Proposal Check-In', daysDelay: 3, subject: 'Did you get a chance to review the proposal?', body: "Hi {{firstName}},\n\nI wanted to check in on the proposal I sent over. Did you get a chance to look at it?\n\nHappy to jump on a quick call to walk through any questions.\n\n{{senderName}}" },
      { id: 'st33', sequenceId: 's4', order: 4, type: 'call', name: 'Proposal Call', daysDelay: 2, callNote: 'Review the proposal together. Address objections. Try to get verbal commitment on timeline.' },
    ],
  },
];

const SEED_ENROLLMENTS: Enrollment[] = [
  { id: 'e1', sequenceId: 's1', prospectId: 'p1', status: 'active', currentStepOrder: 3, startedAt: '2026-02-20T10:00:00Z', updatedAt: '2026-02-26T10:00:00Z', nextStepAt: '2026-03-15T10:00:00Z', finishedAt: null, emailsSent: 2, emailsOpened: 2, emailsClicked: 1, repliedAt: null, bouncedAt: null },
  { id: 'e2', sequenceId: 's1', prospectId: 'p2', status: 'replied', currentStepOrder: 2, startedAt: '2026-02-18T10:00:00Z', updatedAt: '2026-02-22T10:00:00Z', nextStepAt: null, finishedAt: null, emailsSent: 1, emailsOpened: 1, emailsClicked: 0, repliedAt: '2026-02-22T15:30:00Z', bouncedAt: null },
  { id: 'e3', sequenceId: 's1', prospectId: 'p6', status: 'active', currentStepOrder: 1, startedAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z', nextStepAt: '2026-03-14T09:00:00Z', finishedAt: null, emailsSent: 1, emailsOpened: 0, emailsClicked: 0, repliedAt: null, bouncedAt: null },
  { id: 'e4', sequenceId: 's1', prospectId: 'p7', status: 'finished', currentStepOrder: 7, startedAt: '2026-01-20T10:00:00Z', updatedAt: '2026-02-15T10:00:00Z', nextStepAt: null, finishedAt: '2026-02-15T10:00:00Z', emailsSent: 4, emailsOpened: 3, emailsClicked: 1, repliedAt: null, bouncedAt: null },
  { id: 'e5', sequenceId: 's1', prospectId: 'p8', status: 'bounced', currentStepOrder: 1, startedAt: '2026-02-25T10:00:00Z', updatedAt: '2026-02-25T11:00:00Z', nextStepAt: null, finishedAt: null, emailsSent: 1, emailsOpened: 0, emailsClicked: 0, repliedAt: null, bouncedAt: '2026-02-25T11:00:00Z' },
  { id: 'e6', sequenceId: 's2', prospectId: 'p3', status: 'replied', currentStepOrder: 3, startedAt: '2026-02-28T14:00:00Z', updatedAt: '2026-03-01T09:00:00Z', nextStepAt: null, finishedAt: null, emailsSent: 2, emailsOpened: 2, emailsClicked: 2, repliedAt: '2026-03-01T09:00:00Z', bouncedAt: null },
  { id: 'e7', sequenceId: 's2', prospectId: 'p4', status: 'active', currentStepOrder: 2, startedAt: '2026-03-10T10:00:00Z', updatedAt: '2026-03-10T10:00:00Z', nextStepAt: '2026-03-14T10:00:00Z', finishedAt: null, emailsSent: 1, emailsOpened: 1, emailsClicked: 0, repliedAt: null, bouncedAt: null },
  { id: 'e8', sequenceId: 's2', prospectId: 'p5', status: 'active', currentStepOrder: 1, startedAt: '2026-03-12T08:00:00Z', updatedAt: '2026-03-12T08:00:00Z', nextStepAt: '2026-03-13T08:00:00Z', finishedAt: null, emailsSent: 1, emailsOpened: 1, emailsClicked: 1, repliedAt: null, bouncedAt: null },
  { id: 'e9', sequenceId: 's3', prospectId: 'p1', status: 'paused', currentStepOrder: 2, startedAt: '2026-02-10T10:00:00Z', updatedAt: '2026-02-20T10:00:00Z', nextStepAt: null, finishedAt: null, emailsSent: 1, emailsOpened: 0, emailsClicked: 0, repliedAt: null, bouncedAt: null },
  { id: 'e10', sequenceId: 's3', prospectId: 'p2', status: 'opted_out', currentStepOrder: 1, startedAt: '2026-02-08T10:00:00Z', updatedAt: '2026-02-09T10:00:00Z', nextStepAt: null, finishedAt: null, emailsSent: 1, emailsOpened: 1, emailsClicked: 0, repliedAt: null, bouncedAt: null },
];

// ─── Store Interface ─────────────────────────────────────────────────────────

interface AppState {
  sequences: Sequence[];
  prospects: Prospect[];
  enrollments: Enrollment[];
  // Sequences CRUD
  addSequence: (seq: Omit<Sequence, 'id' | 'createdAt' | 'updatedAt' | 'steps'>) => Sequence;
  updateSequence: (id: string, updates: Partial<Sequence>) => void;
  deleteSequence: (id: string) => void;
  setSequenceStatus: (id: string, status: SequenceStatus) => void;
  // Steps CRUD
  addStep: (sequenceId: string, step: Omit<Step, 'id' | 'sequenceId'>) => void;
  updateStep: (sequenceId: string, stepId: string, updates: Partial<Step>) => void;
  deleteStep: (sequenceId: string, stepId: string) => void;
  reorderSteps: (sequenceId: string, stepIds: string[]) => void;
  // Prospects CRUD
  addProspect: (p: Omit<Prospect, 'id' | 'createdAt'>) => Prospect;
  updateProspect: (id: string, updates: Partial<Prospect>) => void;
  deleteProspect: (id: string) => void;
  // Enrollments
  enrollProspect: (sequenceId: string, prospectId: string) => void;
  unenrollProspect: (enrollmentId: string) => void;
  updateEnrollmentStatus: (enrollmentId: string, status: EnrollmentStatus) => void;
  pauseEnrollment: (enrollmentId: string) => void;
  resumeEnrollment: (enrollmentId: string) => void;
  // Computed
  getSequenceStats: (sequenceId: string) => SequenceStats;
  getEnrollmentsForSequence: (sequenceId: string) => Enrollment[];
  getEnrollmentsForProspect: (prospectId: string) => Enrollment[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      sequences: SEED_SEQUENCES,
      prospects: SEED_PROSPECTS,
      enrollments: SEED_ENROLLMENTS,

      // ── Sequence CRUD ──────────────────────────────────────────────────
      addSequence: (seq) => {
        const newSeq: Sequence = {
          ...seq,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          steps: [],
        };
        set((s) => ({ sequences: [...s.sequences, newSeq] }));
        return newSeq;
      },
      updateSequence: (id, updates) => {
        set((s) => ({
          sequences: s.sequences.map((seq) =>
            seq.id === id ? { ...seq, ...updates, updatedAt: new Date().toISOString() } : seq
          ),
        }));
      },
      deleteSequence: (id) => {
        set((s) => ({
          sequences: s.sequences.filter((seq) => seq.id !== id),
          enrollments: s.enrollments.filter((e) => e.sequenceId !== id),
        }));
      },
      setSequenceStatus: (id, status) => {
        set((s) => ({
          sequences: s.sequences.map((seq) =>
            seq.id === id ? { ...seq, status, updatedAt: new Date().toISOString() } : seq
          ),
        }));
      },

      // ── Steps CRUD ────────────────────────────────────────────────────
      addStep: (sequenceId, step) => {
        const newStep: Step = { ...step, id: uuidv4(), sequenceId };
        set((s) => ({
          sequences: s.sequences.map((seq) =>
            seq.id === sequenceId
              ? { ...seq, steps: [...seq.steps, newStep], updatedAt: new Date().toISOString() }
              : seq
          ),
        }));
      },
      updateStep: (sequenceId, stepId, updates) => {
        set((s) => ({
          sequences: s.sequences.map((seq) =>
            seq.id === sequenceId
              ? {
                  ...seq,
                  updatedAt: new Date().toISOString(),
                  steps: seq.steps.map((st) => (st.id === stepId ? { ...st, ...updates } : st)),
                }
              : seq
          ),
        }));
      },
      deleteStep: (sequenceId, stepId) => {
        set((s) => ({
          sequences: s.sequences.map((seq) => {
            if (seq.id !== sequenceId) return seq;
            const filtered = seq.steps.filter((st) => st.id !== stepId);
            const reordered = filtered.map((st, i) => ({ ...st, order: i + 1 }));
            return { ...seq, steps: reordered, updatedAt: new Date().toISOString() };
          }),
        }));
      },
      reorderSteps: (sequenceId, stepIds) => {
        set((s) => ({
          sequences: s.sequences.map((seq) => {
            if (seq.id !== sequenceId) return seq;
            const reordered = stepIds.map((id, i) => {
              const step = seq.steps.find((st) => st.id === id)!;
              return { ...step, order: i + 1 };
            });
            return { ...seq, steps: reordered, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      // ── Prospects CRUD ────────────────────────────────────────────────
      addProspect: (p) => {
        const newProspect: Prospect = {
          ...p,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ prospects: [...s.prospects, newProspect] }));
        return newProspect;
      },
      updateProspect: (id, updates) => {
        set((s) => ({
          prospects: s.prospects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },
      deleteProspect: (id) => {
        set((s) => ({
          prospects: s.prospects.filter((p) => p.id !== id),
          enrollments: s.enrollments.filter((e) => e.prospectId !== id),
        }));
      },

      // ── Enrollments ───────────────────────────────────────────────────
      enrollProspect: (sequenceId, prospectId) => {
        const existing = get().enrollments.find(
          (e) => e.sequenceId === sequenceId && e.prospectId === prospectId && e.status === 'active'
        );
        if (existing) return;
        const seq = get().sequences.find((s) => s.id === sequenceId);
        const newEnrollment: Enrollment = {
          id: uuidv4(),
          sequenceId,
          prospectId,
          status: 'active',
          currentStepOrder: 1,
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          nextStepAt: new Date(Date.now() + (seq?.steps[0]?.daysDelay ?? 0) * 86400000).toISOString(),
          finishedAt: null,
          emailsSent: 0,
          emailsOpened: 0,
          emailsClicked: 0,
          repliedAt: null,
          bouncedAt: null,
        };
        set((s) => ({ enrollments: [...s.enrollments, newEnrollment] }));
      },
      unenrollProspect: (enrollmentId) => {
        set((s) => ({
          enrollments: s.enrollments.filter((e) => e.id !== enrollmentId),
        }));
      },
      updateEnrollmentStatus: (enrollmentId, status) => {
        set((s) => ({
          enrollments: s.enrollments.map((e) =>
            e.id === enrollmentId
              ? {
                  ...e,
                  status,
                  updatedAt: new Date().toISOString(),
                  finishedAt: ['finished', 'replied', 'bounced', 'opted_out'].includes(status)
                    ? new Date().toISOString()
                    : e.finishedAt,
                  nextStepAt: ['finished', 'replied', 'bounced', 'opted_out', 'paused'].includes(status)
                    ? null
                    : e.nextStepAt,
                }
              : e
          ),
        }));
      },
      pauseEnrollment: (enrollmentId) => {
        set((s) => ({
          enrollments: s.enrollments.map((e) =>
            e.id === enrollmentId ? { ...e, status: 'paused', nextStepAt: null, updatedAt: new Date().toISOString() } : e
          ),
        }));
      },
      resumeEnrollment: (enrollmentId) => {
        set((s) => ({
          enrollments: s.enrollments.map((e) =>
            e.id === enrollmentId
              ? {
                  ...e,
                  status: 'active',
                  nextStepAt: new Date(Date.now() + 86400000).toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        }));
      },

      // ── Computed ──────────────────────────────────────────────────────
      getSequenceStats: (sequenceId) => {
        const enrollments = get().enrollments.filter((e) => e.sequenceId === sequenceId);
        const emailsSent = enrollments.reduce((a, e) => a + e.emailsSent, 0);
        const emailsOpened = enrollments.reduce((a, e) => a + e.emailsOpened, 0);
        const emailsClicked = enrollments.reduce((a, e) => a + e.emailsClicked, 0);
        const replied = enrollments.filter((e) => e.status === 'replied').length;
        return {
          sequenceId,
          totalEnrolled: enrollments.length,
          active: enrollments.filter((e) => e.status === 'active').length,
          finished: enrollments.filter((e) => e.status === 'finished').length,
          replied,
          bounced: enrollments.filter((e) => e.status === 'bounced').length,
          optedOut: enrollments.filter((e) => e.status === 'opted_out').length,
          emailsSent,
          emailsOpened,
          emailsClicked,
          openRate: emailsSent > 0 ? Math.round((emailsOpened / emailsSent) * 100) : 0,
          replyRate: emailsSent > 0 ? Math.round((replied / emailsSent) * 100) : 0,
          clickRate: emailsSent > 0 ? Math.round((emailsClicked / emailsSent) * 100) : 0,
        };
      },
      getEnrollmentsForSequence: (sequenceId) =>
        get().enrollments.filter((e) => e.sequenceId === sequenceId),
      getEnrollmentsForProspect: (prospectId) =>
        get().enrollments.filter((e) => e.prospectId === prospectId),
    }),
    { name: 'outreach-sequencer-storage' }
  )
);
