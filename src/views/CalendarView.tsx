import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { RevisionSession, Topic, ExamType } from '../types';

interface CalendarViewProps {
  sessions: RevisionSession[];
  topics: Topic[];
  examFilter: ExamType;
  onOpenSession: (session: RevisionSession, topic: Topic) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  topics,
  examFilter,
  onOpenSession
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const topicMap = new Map<string, Topic>(topics.map(t => [t.id, t]));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Revision Calendar — {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Spaced repetition distribution and planned recall deadlines.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Current Month
          </button>
          <button
            onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 py-2 border-b border-slate-200 dark:border-slate-800">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mt-2">
        {daysInMonth.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const daySessions = sessions.filter(s => {
            const t = topicMap.get(s.topicId);
            if (!t) return false;
            if (examFilter !== 'BOTH' && t.exam !== 'BOTH' && t.exam !== examFilter) return false;
            return s.scheduledDate === dayStr;
          });

          return (
            <div
              key={dayStr}
              className={`min-h-[96px] p-1.5 border rounded-lg text-left transition ${
                isSameDay(day, new Date())
                  ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-400 dark:border-blue-700 ring-1 ring-blue-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500 mb-1 flex items-center justify-between">
                <span>{format(day, 'd')}</span>
                {isSameDay(day, new Date()) && (
                  <span className="text-[9px] px-1 rounded bg-blue-600 text-white font-mono">Today</span>
                )}
              </div>
              <div className="space-y-1">
                {daySessions.slice(0, 3).map(s => {
                  const t = topicMap.get(s.topicId);
                  return (
                    <div
                      key={s.id}
                      onClick={() => t && onOpenSession(s, t)}
                      title={`${t?.name} (Rev ${s.sequenceNumber})`}
                      className={`text-[10px] p-1 rounded font-medium cursor-pointer truncate transition hover:opacity-80 ${
                        s.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : s.scheduledDate < format(new Date(), 'yyyy-MM-dd')
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {t?.name}
                    </div>
                  );
                })}
                {daySessions.length > 3 && (
                  <span className="text-[10px] text-slate-400 font-semibold block px-1">
                    +{daySessions.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
