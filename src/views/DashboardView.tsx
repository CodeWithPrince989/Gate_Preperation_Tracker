import React from 'react';
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  CalendarDays,
  Target,
  ArrowRight,
  TrendingUp,
  RotateCw,
  Play,
  Plus,
  Sparkles,
  Timer,
  CheckSquare,
  Compass
} from 'lucide-react';
import { Topic, RevisionSession, PracticeLog, StudyActivity, ExamType } from '../types';
import { getSessionStatus, formatDateKey } from '../lib/scheduler';
import { ActivityHeatmap } from '../components/ActivityHeatmap';

interface DashboardViewProps {
  topics: Topic[];
  sessions: RevisionSession[];
  practiceLogs: PracticeLog[];
  activities: StudyActivity[];
  examFilter: ExamType;
  currentStreak: number;
  longestStreak: number;
  onStartSession: (session: RevisionSession, topic: Topic) => void;
  onRescheduleSession: (session: RevisionSession) => void;
  onOpenTopicDetail: (topic: Topic) => void;
  onOpenAddTopic: () => void;
  onLoadSampleData?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  topics,
  sessions,
  practiceLogs,
  activities,
  examFilter,
  currentStreak,
  longestStreak: _longestStreak,
  onStartSession,
  onRescheduleSession,
  onOpenTopicDetail,
  onOpenAddTopic,
  onLoadSampleData,
  onNavigateToTab
}) => {
  const todayStr = formatDateKey(new Date());

  // Filter topics by exam
  const filteredTopics = topics.filter(t => examFilter === 'BOTH' || t.exam === 'BOTH' || t.exam === examFilter);
  const topicMap = new Map<string, Topic>(topics.map(t => [t.id, t]));

  // Categorize sessions
  const validSessions = sessions.filter(s => {
    const t = topicMap.get(s.topicId);
    if (!t) return false;
    return examFilter === 'BOTH' || t.exam === 'BOTH' || t.exam === examFilter;
  });

  const dueTodaySessions = validSessions.filter(s => getSessionStatus(s, todayStr) === 'DUE_TODAY');
  const overdueSessions = validSessions.filter(s => getSessionStatus(s, todayStr) === 'OVERDUE');
  const completedSessions = validSessions.filter(s => s.status === 'COMPLETED');

  // Next 7 days upcoming
  const upcomingSessions = validSessions.filter(s => {
    return s.status === 'PENDING' && s.scheduledDate > todayStr && s.scheduledDate <= formatDateKey(new Date(Date.now() + 7 * 86400000));
  }).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  // Mastery & Accuracy stats
  const masteredCount = filteredTopics.filter(t => t.masteryStatus === 'Mastered').length;
  const pyqsAttempted = practiceLogs.filter(p => examFilter === 'BOTH' || p.exam === examFilter).length;
  const pyqsCorrect = practiceLogs.filter(p => (examFilter === 'BOTH' || p.exam === examFilter) && p.result === 'CORRECT').length;
  const accuracy = pyqsAttempted > 0 ? Math.round((pyqsCorrect / pyqsAttempted) * 100) : 0;
  const completionRate = (completedSessions.length + overdueSessions.length) > 0
    ? Math.round((completedSessions.length / (completedSessions.length + overdueSessions.length)) * 100)
    : 100;

  // First session to start
  const firstDueSession = dueTodaySessions[0];
  const firstDueTopic = firstDueSession ? topicMap.get(firstDueSession.topicId) : null;

  // ==========================================
  // BRAND-NEW USER ZERO DATA EMPTY STATE
  // ==========================================
  if (topics.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Welcome Empty State Hero */}
        <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#8B9CFF]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161922] border border-[#272C38] text-xs font-mono text-[#8B9CFF]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GATE Spaced Repetition OS</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FA]">
              Welcome to Your GATE Revision OS
            </h1>

            <p className="text-sm text-[#A1A8B7] leading-relaxed">
              Your revision queue is currently empty. Add your first GATE Computer Science (CSE) or Data Science &amp; AI (DA) syllabus topic. The spaced repetition engine will automatically compute optimal review milestones (Day 1, 3, 7, 15, and 30) to prevent memory decay.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onOpenAddTopic}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] font-bold text-xs shadow-xs transition active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Your First Topic</span>
              </button>

              {onLoadSampleData && (
                <button
                  onClick={onLoadSampleData}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161922] hover:bg-[#1C202B] text-[#A1A8B7] hover:text-[#F5F7FA] border border-[#272C38] text-xs font-semibold transition active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#8B9CFF]" />
                  <span>Load Sample GATE Syllabus</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3 Core Workflow Guidance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#101218] border border-[#272C38] p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#161922] border border-[#272C38] flex items-center justify-center text-[#8B9CFF]">
                <CalendarDays className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F5F7FA]">Spaced Decay Intervals</h3>
              <p className="text-xs text-[#737B8C] leading-relaxed">
                Automatic 1, 3, 7, 15, and 30-day review cycles ensure formulas, proofs, and edge cases become deeply embedded in long-term memory.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#272C38] text-[11px] font-mono text-[#8B9CFF]">
              1-3-7-15-30 Spacing Algorithm
            </div>
          </div>

          <div className="bg-[#101218] border border-[#272C38] p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#161922] border border-[#272C38] flex items-center justify-center text-[#42D6A4]">
                <Timer className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F5F7FA]">Closed-Book Active Recall</h3>
              <p className="text-xs text-[#737B8C] leading-relaxed">
                Timed 5-minute blank-sheet test prompts you to retrieve algorithms and theorems from memory before checking notes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#272C38] text-[11px] font-mono text-[#42D6A4]">
              Active Retrieval Testing
            </div>
          </div>

          <div className="bg-[#101218] border border-[#272C38] p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#161922] border border-[#272C38] flex items-center justify-center text-[#F5BE65]">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F5F7FA]">PYQ Error Notebook</h3>
              <p className="text-xs text-[#737B8C] leading-relaxed">
                Log question attempts and classify mistake causes (conceptual, calculation, formula forgotten, silly mistake, or time pressure).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#272C38] text-[11px] font-mono text-[#F5BE65]">
              Systematic Weakness Elimination
            </div>
          </div>
        </div>

        {/* Quick Quickstart Helper */}
        <div className="bg-[#161922] border border-[#272C38] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1C202B] text-[#8B9CFF] shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#F5F7FA]">Ready to begin your study plan?</div>
              <div className="text-xs text-[#737B8C]">
                Pick your exam track (CSE, DA, or BOTH) in the sidebar and add topics as you study them in class or textbooks.
              </div>
            </div>
          </div>
          <button
            onClick={onOpenAddTopic}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] font-bold text-xs rounded-xl shadow-xs transition shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Topic Now</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD FOR USERS WITH TOPICS
  // ==========================================
  return (
    <div className="space-y-6">
      {/* 0. Executive Retention Overview Card */}
      <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#737B8C]">
              <span className="font-medium text-[#8B9CFF]">GATE Spaced Repetition</span>
              <span aria-hidden="true">&bull;</span>
              <span>CSE &amp; DA Memory Retention</span>
              <span aria-hidden="true">&bull;</span>
              <span className="tabular-nums font-mono text-[#A1A8B7]">{todayStr}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F7FA]">
              {dueTodaySessions.length > 0
                ? `${dueTodaySessions.length} Revision Sessions Due Today`
                : 'All Spaced Retention Sessions Completed'}
            </h2>

            <p className="text-xs sm:text-sm text-[#A1A8B7] max-w-2xl leading-relaxed">
              Calculated retention decay curves for active retrieval. Recall key proofs, formulas, and edge cases from memory before reviewing notes.
            </p>

            {/* Unboxed Metadata Stats */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#737B8C]">
              <span className="flex items-center gap-1.5 font-semibold text-[#F5BE65]">
                <Flame className="w-4 h-4 fill-[#F5BE65]" />
                <span className="tabular-nums">{currentStreak} Day Streak</span>
              </span>
              <span aria-hidden="true">&bull;</span>
              <span>
                <strong className="text-[#F5F7FA] tabular-nums font-mono">{dueTodaySessions.length}</strong> Due Today
              </span>
              <span aria-hidden="true">&bull;</span>
              <span>
                <strong className={`tabular-nums font-mono ${overdueSessions.length > 0 ? 'text-[#FF727C]' : 'text-[#F5F7FA]'}`}>
                  {overdueSessions.length}
                </strong> Overdue
              </span>
              <span aria-hidden="true">&bull;</span>
              <span>
                <strong className="text-[#F5F7FA] tabular-nums font-mono">{pyqsAttempted}</strong> PYQs Solved
              </span>
              <span aria-hidden="true">&bull;</span>
              <span>
                <strong className="text-[#42D6A4] tabular-nums font-mono">{accuracy}%</strong> Accuracy
              </span>
            </div>
          </div>

          {/* Primary Quick Start Action */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            {firstDueSession && firstDueTopic && (
              <button
                onClick={() => onStartSession(firstDueSession, firstDueTopic)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] font-bold text-xs shadow-xs transition active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Due Revision: {firstDueTopic.name.slice(0, 24)}...</span>
              </button>
            )}

            {overdueSessions.length > 0 && overdueSessions[0] && (
              <button
                onClick={() => {
                  const s = overdueSessions[0];
                  const t = topicMap.get(s.topicId);
                  if (t) onStartSession(s, t);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161922] hover:bg-[#1C202B] text-[#FF727C] border border-[#FF727C]/30 font-semibold text-xs transition active:scale-[0.98]"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Clear Overdue ({overdueSessions.length})</span>
              </button>
            )}

            <button
              onClick={onOpenAddTopic}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161922] hover:bg-[#1C202B] text-[#F5F7FA] border border-[#272C38] text-xs font-semibold transition active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 text-[#8B9CFF]" />
              <span>Add Topic</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Metric Cards Grid (8 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Topics Added', val: filteredTopics.length, icon: BookOpen, color: 'text-[#8B9CFF]' },
          { label: 'Mastered', val: masteredCount, icon: Target, color: 'text-[#42D6A4]' },
          { label: 'Revisions Done', val: completedSessions.length, icon: CheckCircle2, color: 'text-[#42D6A4]' },
          { label: 'Completion %', val: `${completionRate}%`, icon: TrendingUp, color: 'text-[#8B9CFF]' },
          { label: 'PYQs Solved', val: pyqsAttempted, icon: CheckCircle2, color: 'text-[#8B9CFF]' },
          { label: 'PYQ Accuracy', val: `${accuracy}%`, icon: Target, color: 'text-[#42D6A4]' },
          { label: 'Current Streak', val: `${currentStreak}d`, icon: Flame, color: 'text-[#F5BE65]' },
          { label: 'Overdue Backlog', val: overdueSessions.length, icon: AlertCircle, color: overdueSessions.length > 0 ? 'text-[#FF727C]' : 'text-[#737B8C]' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-[#101218] border border-[#272C38] p-3 rounded-xl transition hover:border-[#3B4254]"
            >
              <div className="flex items-center justify-between text-[#737B8C] mb-1">
                <span className="text-[11px] font-medium tracking-tight truncate">{card.label}</span>
                <Icon className={`w-3.5 h-3.5 ${card.color} shrink-0`} />
              </div>
              <div className="text-lg font-bold text-[#F5F7FA] tabular-nums font-mono">
                {card.val}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Overdue Alerts (If Any) */}
      {overdueSessions.length > 0 && (
        <div className="bg-[#161922] border border-[#FF727C]/30 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[#FF727C]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <h3 className="text-sm font-semibold">
                {overdueSessions.length} Overdue Revision{overdueSessions.length > 1 ? 's' : ''} Require Attention
              </h3>
            </div>
            <span className="text-xs text-[#737B8C]">Never silently discarded</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdueSessions.map(session => {
              const topic = topicMap.get(session.topicId);
              if (!topic) return null;
              return (
                <div
                  key={session.id}
                  className="bg-[#101218] p-3.5 rounded-xl border border-[#272C38] hover:border-[#FF727C]/40 flex flex-col justify-between transition"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#737B8C] mb-1.5">
                      <span className="font-mono text-[#FF727C] font-semibold tabular-nums">
                        Due {session.scheduledDate}
                      </span>
                      <span className="font-mono text-[11px] text-[#A1A8B7]">
                        Rev {session.sequenceNumber}
                      </span>
                    </div>
                    <div
                      onClick={() => onOpenTopicDetail(topic)}
                      className="font-semibold text-xs sm:text-sm text-[#F5F7FA] hover:text-[#8B9CFF] cursor-pointer line-clamp-1"
                    >
                      {topic.name}
                    </div>
                    <div className="text-xs text-[#737B8C] mt-0.5">{topic.subjectName}</div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#272C38]">
                    <button
                      onClick={() => onStartSession(session, topic)}
                      className="flex-1 bg-[#FF727C] hover:bg-[#FF858E] text-[#08090D] py-1.5 px-3 rounded-lg text-xs font-bold transition active:scale-95"
                    >
                      Revise Now
                    </button>
                    <button
                      onClick={() => onRescheduleSession(session)}
                      className="p-1.5 border border-[#272C38] rounded-lg text-[#737B8C] hover:text-[#F5F7FA] hover:bg-[#1C202B] transition"
                      title="Reschedule to Today"
                      aria-label="Reschedule to Today"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Today's Scheduled Revisions */}
      <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#8B9CFF]" /> Today's Scheduled Revisions
            </h3>
            <p className="text-xs text-[#737B8C] mt-0.5">
              Active recall queue for {todayStr}
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-[#8B9CFF] tabular-nums">
            {dueTodaySessions.length} Due
          </span>
        </div>

        {dueTodaySessions.length === 0 ? (
          <div className="text-center py-8 text-[#737B8C] text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#42D6A4]" />
            <p className="text-sm font-medium text-[#F5F7FA]">All scheduled revisions for today are completed!</p>
            <p className="text-xs text-[#737B8C] mt-1">Review upcoming intervals below or log new PYQs from past papers.</p>
            <div className="flex justify-center gap-2 mt-4">
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('pyqs')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161922] text-[#8B9CFF] border border-[#272C38] hover:bg-[#1C202B] transition"
                >
                  <CheckSquare className="w-3.5 h-3.5" /> Practice PYQs
                </button>
              )}
              <button
                onClick={onOpenAddTopic}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161922] text-[#F5F7FA] border border-[#272C38] hover:bg-[#1C202B] transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#8B9CFF]" /> Add New Topic
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#272C38]">
            {dueTodaySessions.map(session => {
              const topic = topicMap.get(session.topicId);
              if (!topic) return null;
              return (
                <div key={session.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[#737B8C]">
                      <span className="font-mono text-[#8B9CFF] font-semibold">{topic.exam}</span>
                      <span aria-hidden="true">&bull;</span>
                      <span>{topic.subjectName}</span>
                      <span aria-hidden="true">&bull;</span>
                      <span className="tabular-nums font-mono text-[#A1A8B7]">
                        Rev {session.sequenceNumber} ({session.durationMinutes}m)
                      </span>
                    </div>
                    <div
                      onClick={() => onOpenTopicDetail(topic)}
                      className="font-medium text-xs sm:text-sm text-[#F5F7FA] hover:text-[#8B9CFF] cursor-pointer truncate mt-1"
                    >
                      {topic.name}
                    </div>
                  </div>

                  <button
                    onClick={() => onStartSession(session, topic)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] rounded-lg text-xs font-bold shadow-xs transition active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start Revision</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Upcoming 7-Day Timeline */}
      <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#F5F7FA]">
            Upcoming Revisions (Next 7 Days)
          </h3>
          <span className="text-xs text-[#737B8C] font-mono tabular-nums">
            {upcomingSessions.length} Scheduled
          </span>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#737B8C]">
            No upcoming revisions in the next 7 days. Add new syllabus topics to automatically populate future retention intervals.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingSessions.map(session => {
              const topic = topicMap.get(session.topicId);
              if (!topic) return null;
              return (
                <div
                  key={session.id}
                  onClick={() => onOpenTopicDetail(topic)}
                  className="bg-[#161922] p-3 rounded-xl border border-[#272C38] hover:border-[#3B4254] transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#737B8C] mb-1">
                    <span className="font-mono text-[#8B9CFF] font-semibold tabular-nums">
                      {session.scheduledDate}
                    </span>
                    <span className="font-mono text-[#A1A8B7]">Rev {session.sequenceNumber}</span>
                  </div>
                  <div className="font-medium text-xs text-[#F5F7FA] truncate">
                    {topic.name}
                  </div>
                  <div className="text-[11px] text-[#737B8C] mt-0.5">{topic.subjectName}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Spaced Retention Activity Heatmap */}
      <ActivityHeatmap activities={activities} />
    </div>
  );
};
