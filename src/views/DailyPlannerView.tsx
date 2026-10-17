import React, { useState } from 'react';
import { Clock, ListTodo } from 'lucide-react';
import { RevisionSession, Topic, ExamType } from '../types';
import { getSessionStatus, formatDateKey } from '../lib/scheduler';

interface DailyPlannerViewProps {
  sessions: RevisionSession[];
  topics: Topic[];
  examFilter: ExamType;
  onStartSession: (session: RevisionSession, topic: Topic) => void;
}

export const DailyPlannerView: React.FC<DailyPlannerViewProps> = ({
  sessions,
  topics,
  examFilter,
  onStartSession
}) => {
  const [dailyBudgetHours, setDailyBudgetHours] = useState<number>(4.0);
  const todayStr = formatDateKey(new Date());
  const topicMap = new Map<string, Topic>(topics.map(t => [t.id, t]));

  const validSessions = sessions.filter(s => {
    const t = topicMap.get(s.topicId);
    if (!t) return false;
    return examFilter === 'BOTH' || t.exam === 'BOTH' || t.exam === examFilter;
  });

  const overdue = validSessions.filter(s => getSessionStatus(s, todayStr) === 'OVERDUE');
  const dueToday = validSessions.filter(s => getSessionStatus(s, todayStr) === 'DUE_TODAY');

  // Budget calculations
  const totalDueMinutes = [...overdue, ...dueToday].reduce((acc, s) => acc + s.durationMinutes, 0);
  const budgetMinutes = dailyBudgetHours * 60;

  // Recovery plan logic: when backlog exceeds daily budget, prioritize oldest overdue up to budget
  const prioritizedTasks = [...overdue, ...dueToday];
  let accumulatedMinutes = 0;
  const recommendedToday = prioritizedTasks.filter(s => {
    accumulatedMinutes += s.durationMinutes;
    return accumulatedMinutes <= budgetMinutes;
  });

  return (
    <div className="space-y-6">
      {/* Budget Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" /> Daily Study Budget Planner
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configured study hours prevent burnout. Revisions take strict priority over new topics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Daily Budget:</span>
            {[2, 4, 6, 8].map(hrs => (
              <button
                key={hrs}
                onClick={() => setDailyBudgetHours(hrs)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  dailyBudgetHours === hrs
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {hrs}h
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400">
              Scheduled Revisions Load: <strong className="text-slate-900 dark:text-white">{Math.round(totalDueMinutes / 60 * 10) / 10}h</strong> ({totalDueMinutes} mins)
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Budget: {dailyBudgetHours}h</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${totalDueMinutes > budgetMinutes ? 'bg-red-500' : 'bg-blue-600'}`}
              style={{ width: `${Math.min(100, (totalDueMinutes / budgetMinutes) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Suggested Backlog Recovery Plan */}
      {totalDueMinutes > budgetMinutes && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-4 rounded-xl text-xs text-amber-900 dark:text-amber-200 shadow-xs">
          <strong>Backlog Recovery Recommendation:</strong> You have {overdue.length} overdue sessions.
          Instead of attempting all tasks today, complete the {recommendedToday.length} prioritized sessions below to fit your {dailyBudgetHours}-hour budget without cognitive fatigue.
        </div>
      )}

      {/* Task Queue */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-blue-600" /> Actionable Task Queue (Ranked by Urgency)
          </h3>
          <span className="text-xs text-slate-400">{prioritizedTasks.length} Pending</span>
        </div>

        {prioritizedTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No pending revisions due for today. Perfect time to study a new topic or attempt a mock test!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {prioritizedTasks.map((s, idx) => {
              const topic = topicMap.get(s.topicId);
              if (!topic) return null;
              const isOverdue = s.scheduledDate < todayStr;
              return (
                <div key={s.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400 w-5">{idx + 1}.</span>
                    <div>
                      <div className="flex items-center gap-2">
                        {isOverdue ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold">
                            OVERDUE ({s.scheduledDate})
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold">
                            DUE TODAY
                          </span>
                        )}
                        <span className="text-xs text-slate-500">{topic.subjectName}</span>
                        <span className="text-xs text-slate-400">&bull; Rev {s.sequenceNumber}</span>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                        {topic.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono">{s.durationMinutes} mins</span>
                    <button
                      onClick={() => onStartSession(s, topic)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                    >
                      Start Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
