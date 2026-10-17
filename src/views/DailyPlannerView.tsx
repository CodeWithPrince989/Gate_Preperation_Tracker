import React, { useState } from 'react';
import { Clock, ListTodo, AlertTriangle, ArrowRight, BookOpen, Plus } from 'lucide-react';
import { RevisionSession, Topic, ExamType } from '../types';
import { getSessionStatus, formatDateKey } from '../lib/scheduler';

interface DailyPlannerViewProps {
  sessions: RevisionSession[];
  topics: Topic[];
  examFilter: ExamType;
  onStartSession: (session: RevisionSession, topic: Topic) => void;
  onOpenAddTopic?: () => void;
}

export const DailyPlannerView: React.FC<DailyPlannerViewProps> = ({
  sessions,
  topics,
  examFilter,
  onStartSession,
  onOpenAddTopic
}) => {
  const [dailyBudgetHours, setDailyBudgetHours] = useState<number>(4);
  const todayStr = formatDateKey(new Date());

  const topicMap = new Map<string, Topic>(topics.map(t => [t.id, t]));

  // Filter valid sessions
  const validSessions = sessions.filter(s => {
    const t = topicMap.get(s.topicId);
    if (!t) return false;
    return examFilter === 'BOTH' || t.exam === 'BOTH' || t.exam === examFilter;
  });

  const dueToday = validSessions.filter(s => getSessionStatus(s, todayStr) === 'DUE_TODAY');
  const overdue = validSessions.filter(s => getSessionStatus(s, todayStr) === 'OVERDUE');

  // Priority queue: Overdue first, then today's due
  const prioritizedTasks = [...overdue, ...dueToday];

  // Budget calculations
  const budgetMinutes = dailyBudgetHours * 60;
  let accumulatedMinutes = 0;
  const recommendedToday: RevisionSession[] = [];
  const deferredTasks: RevisionSession[] = [];

  prioritizedTasks.forEach(s => {
    const dur = s.durationMinutes || 30;
    if (accumulatedMinutes + dur <= budgetMinutes) {
      accumulatedMinutes += dur;
      recommendedToday.push(s);
    } else {
      deferredTasks.push(s);
    }
  });

  const totalDueMinutes = prioritizedTasks.reduce((acc, s) => acc + (s.durationMinutes || 30), 0);

  if (topics.length === 0) {
    return (
      <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#161922] border border-[#272C38] flex items-center justify-center mx-auto mb-4 text-[#8B9CFF]">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#F5F7FA]">Daily Study Planner</h2>
        <p className="text-xs sm:text-sm text-[#A1A8B7] max-w-md mx-auto mt-2 leading-relaxed">
          No syllabus topics added yet. Add your study subjects to calculate daily workload, prevent cognitive fatigue, and prioritize retention sessions within your daily study hours.
        </p>
        {onOpenAddTopic && (
          <button
            onClick={onOpenAddTopic}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Your First Topic</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Capacity Configuration */}
      <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8B9CFF]" />
              Cognitive Workload &amp; Capacity Budget
            </h2>
            <p className="text-xs text-[#737B8C] mt-1">
              Prevent burnout by allocating realistic study hours and deferring low-decay revisions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#737B8C]">Daily Study Budget:</span>
            <div className="flex items-center bg-[#161922] p-1 border border-[#272C38] rounded-xl">
              {[2, 4, 6, 8].map(hrs => (
                <button
                  key={hrs}
                  onClick={() => setDailyBudgetHours(hrs)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition font-mono ${
                    dailyBudgetHours === hrs
                      ? 'bg-[#1C202B] text-[#8B9CFF] shadow-xs'
                      : 'text-[#737B8C] hover:text-[#F5F7FA]'
                  }`}
                >
                  {hrs}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 pt-5 border-t border-[#272C38]">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-[#A1A8B7]">
              Scheduled Revisions Load: <strong className="text-[#F5F7FA] font-mono tabular-nums">{Math.round(totalDueMinutes / 60 * 10) / 10}h</strong> ({totalDueMinutes} mins)
            </span>
            <span className="font-semibold text-[#A1A8B7] font-mono tabular-nums">Budget: {dailyBudgetHours}h</span>
          </div>
          <div className="w-full bg-[#161922] h-2.5 rounded-full overflow-hidden border border-[#272C38]">
            <div
              className={`h-full transition-all duration-300 ${totalDueMinutes > budgetMinutes ? 'bg-[#FF727C]' : 'bg-[#8B9CFF]'}`}
              style={{ width: `${Math.min(100, (totalDueMinutes / budgetMinutes) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Suggested Backlog Recovery Plan */}
      {totalDueMinutes > budgetMinutes && (
        <div className="bg-[#161922] border border-[#F5BE65]/30 p-4 rounded-2xl text-xs text-[#F5BE65] shadow-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#F5BE65]" />
          <div>
            <strong className="block text-[#F5F7FA] mb-1 font-semibold">Backlog Recovery Recommendation:</strong>
            You have {overdue.length} overdue revision sessions. Instead of rushing through all tasks today, complete the {recommendedToday.length} prioritized sessions below to fit your {dailyBudgetHours}-hour budget without cognitive fatigue.
          </div>
        </div>
      )}

      {/* Task Queue */}
      <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-[#8B9CFF]" /> Prioritized Recall Queue
          </h3>
          <span className="text-xs text-[#737B8C] font-mono tabular-nums">
            {prioritizedTasks.length} total tasks
          </span>
        </div>

        {prioritizedTasks.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#737B8C]">
            No pending revisions in your backlog! You are completely up to date.
          </div>
        ) : (
          <div className="divide-y divide-[#272C38]">
            {prioritizedTasks.map((session, idx) => {
              const topic = topicMap.get(session.topicId);
              if (!topic) return null;
              const isOverdue = session.scheduledDate < todayStr;
              const isWithinBudget = idx < recommendedToday.length;

              return (
                <div key={session.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-center text-xs font-mono font-bold text-[#737B8C] shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-[#737B8C]">
                        <span className="font-mono font-semibold text-[#8B9CFF]">{topic.exam}</span>
                        <span aria-hidden="true">&bull;</span>
                        <span className="truncate">{topic.subjectName}</span>
                        <span aria-hidden="true">&bull;</span>
                        <span className="tabular-nums font-mono text-[#A1A8B7]">
                          {session.durationMinutes} mins
                        </span>
                        {isOverdue && (
                          <>
                            <span aria-hidden="true">&bull;</span>
                            <span className="text-[#FF727C] font-mono font-semibold">Overdue</span>
                          </>
                        )}
                        {!isWithinBudget && (
                          <>
                            <span aria-hidden="true">&bull;</span>
                            <span className="text-[#F5BE65] font-mono">Deferred to tomorrow</span>
                          </>
                        )}
                      </div>
                      <div className="font-medium text-xs sm:text-sm text-[#F5F7FA] truncate mt-1">
                        {topic.name}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartSession(session, topic)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${
                      isWithinBudget
                        ? 'bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] shadow-xs'
                        : 'bg-[#161922] hover:bg-[#1C202B] text-[#A1A8B7] border border-[#272C38]'
                    }`}
                  >
                    <span>Start</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
