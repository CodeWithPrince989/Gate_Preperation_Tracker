import React from 'react';
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  CalendarDays,
  Target,
  ArrowRight,
  TrendingUp,
  RotateCw
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
  onOpenTopicDetail
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

  return (
    <div className="space-y-6">
      {/* 1. Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Topics Added', val: filteredTopics.length, icon: BookOpen, color: 'text-blue-600' },
          { label: 'Mastered', val: masteredCount, icon: Target, color: 'text-emerald-600' },
          { label: 'Revisions Done', val: completedSessions.length, icon: CheckCircle2, color: 'text-teal-600' },
          { label: 'Completion %', val: `${completionRate}%`, icon: TrendingUp, color: 'text-indigo-600' },
          { label: 'PYQs Solved', val: pyqsAttempted, icon: CheckCircle2, color: 'text-purple-600' },
          { label: 'PYQ Accuracy', val: `${accuracy}%`, icon: Target, color: 'text-pink-600' },
          { label: 'Current Streak', val: `${currentStreak}d`, icon: Flame, color: 'text-amber-500' },
          { label: 'Overdue Backlog', val: overdueSessions.length, icon: AlertCircle, color: overdueSessions.length > 0 ? 'text-red-500 font-bold' : 'text-slate-400' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-medium tracking-tight truncate">{card.label}</span>
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {card.val}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Overdue Alerts (If Any) */}
      {overdueSessions.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold">
                {overdueSessions.length} Overdue Revision{overdueSessions.length > 1 ? 's' : ''} Require Immediate Attention
              </h3>
            </div>
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">Never silently discarded</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdueSessions.map(session => {
              const topic = topicMap.get(session.topicId);
              if (!topic) return null;
              return (
                <div key={session.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-red-200 dark:border-red-900/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono text-red-600 dark:text-red-400 font-semibold">
                        Due: {session.scheduledDate}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                        Rev {session.sequenceNumber}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {topic.name}
                    </div>
                    <div className="text-[11px] text-slate-500">{topic.subjectName}</div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onStartSession(session, topic)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded text-xs font-semibold transition"
                    >
                      Revise Now
                    </button>
                    <button
                      onClick={() => onRescheduleSession(session)}
                      className="px-2 py-1 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Reschedule to Today"
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

      {/* 3. Today's Revisions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-600" /> Today's Scheduled Revisions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Target sessions scheduled for today ({todayStr})</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
            {dueTodaySessions.length} Due
          </span>
        </div>

        {dueTodaySessions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/80" />
            No more revisions due today! You are on top of your spaced repetition schedule.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {dueTodaySessions.map(session => {
              const topic = topicMap.get(session.topicId);
              if (!topic) return null;
              return (
                <div key={session.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                        {topic.exam}
                      </span>
                      <span className="text-xs text-slate-500">{topic.subjectName}</span>
                      <span className="text-xs text-slate-400">&bull; Rev {session.sequenceNumber} ({session.durationMinutes}m)</span>
                    </div>
                    <div
                      onClick={() => onOpenTopicDetail(topic)}
                      className="font-medium text-xs sm:text-sm text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer truncate mt-0.5"
                    >
                      {topic.name}
                    </div>
                  </div>

                  <button
                    onClick={() => onStartSession(session, topic)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    Start <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Activity Heatmap */}
      <ActivityHeatmap activities={activities} />

      {/* 5. Upcoming 7 Days Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" /> Upcoming Revisions (Next 7 Days)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Pre-scheduled spaced retention dates</p>

        {upcomingSessions.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">No upcoming sessions in the next 7 days.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingSessions.map(session => {
              const topic = topicMap.get(session.topicId);
              if (!topic) return null;
              return (
                <div key={session.id} className="p-3 border rounded-lg dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-1">
                    <span>{session.scheduledDate}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px]">
                      Rev {session.sequenceNumber}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-900 dark:text-white line-clamp-1">{topic.name}</div>
                  <div className="text-[10px] text-slate-500">{topic.subjectName}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
