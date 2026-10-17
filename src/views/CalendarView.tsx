import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { RevisionSession, Topic, ExamType } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, BookOpen } from 'lucide-react';

interface CalendarViewProps {
  sessions: RevisionSession[];
  topics: Topic[];
  examFilter: ExamType;
  onOpenSession: (session: RevisionSession, topic: Topic) => void;
  onOpenAddTopic?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  topics,
  examFilter,
  onOpenSession,
  onOpenAddTopic
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const topicMap = new Map<string, Topic>(topics.map(t => [t.id, t]));
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-5 shadow-xs space-y-4">
      {/* Month Header and Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#272C38]">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#8B9CFF]" />
          <h2 className="text-base font-bold text-[#F5F7FA]">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 border border-[#272C38] rounded-xl hover:bg-[#161922] text-[#A1A8B7] hover:text-[#F5F7FA] transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 text-xs font-semibold border border-[#272C38] rounded-xl hover:bg-[#161922] text-[#F5F7FA] transition font-mono"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 border border-[#272C38] rounded-xl hover:bg-[#161922] text-[#A1A8B7] hover:text-[#F5F7FA] transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Zero topics banner if empty */}
      {topics.length === 0 && (
        <div className="p-3.5 bg-[#161922] border border-[#272C38] rounded-xl flex items-center justify-between text-xs text-[#A1A8B7] gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#8B9CFF] shrink-0" />
            <span>No topics added yet. Add topics to populate your spaced repetition review schedule.</span>
          </div>
          {onOpenAddTopic && (
            <button
              onClick={onOpenAddTopic}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] font-bold text-xs shrink-0 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Topic</span>
            </button>
          )}
        </div>
      )}

      {/* Weekday Columns */}
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-[#737B8C] py-2 border-b border-[#272C38]">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {daysInMonth.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const daySessions = sessions.filter(s => {
            const t = topicMap.get(s.topicId);
            if (!t) return false;
            if (examFilter !== 'BOTH' && t.exam !== 'BOTH' && t.exam !== examFilter) return false;
            return s.scheduledDate === dayStr;
          });

          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={dayStr}
              className={`min-h-[105px] p-2 border rounded-xl text-left transition flex flex-col justify-between ${
                isToday
                  ? 'bg-[#1C202B] border-[#8B9CFF]/60 ring-1 ring-[#8B9CFF]/30'
                  : 'bg-[#161922] border-[#272C38] hover:border-[#3B4254]'
              }`}
            >
              <div>
                <div className="text-[11px] font-mono font-bold text-[#737B8C] mb-1.5 flex items-center justify-between">
                  <span className={isToday ? 'text-[#8B9CFF]' : ''}>{format(day, 'd')}</span>
                  {isToday && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#8B9CFF]/20 text-[#8B9CFF] font-semibold">
                      Today
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {daySessions.slice(0, 3).map(s => {
                    const t = topicMap.get(s.topicId);
                    const isCompleted = s.status === 'COMPLETED';
                    const isOverdue = !isCompleted && s.scheduledDate < todayStr;

                    return (
                      <div
                        key={s.id}
                        onClick={() => t && onOpenSession(s, t)}
                        title={`${t?.name} (Rev ${s.sequenceNumber})`}
                        className={`text-[10px] p-1.5 rounded-lg font-medium cursor-pointer truncate transition ${
                          isCompleted
                            ? 'bg-[#42D6A4]/15 text-[#42D6A4] hover:bg-[#42D6A4]/25'
                            : isOverdue
                            ? 'bg-[#FF727C]/15 text-[#FF727C] hover:bg-[#FF727C]/25'
                            : 'bg-[#8B9CFF]/15 text-[#8B9CFF] hover:bg-[#8B9CFF]/25'
                        }`}
                      >
                        <span className="font-semibold font-mono">R{s.sequenceNumber}:</span> {t?.name}
                      </div>
                    );
                  })}
                  {daySessions.length > 3 && (
                    <div className="text-[9px] text-[#737B8C] text-right font-mono pr-1">
                      +{daySessions.length - 3} more
                    </div>
                  )}
                </div>
              </div>

              {daySessions.length > 0 && (
                <div className="text-[9px] text-[#737B8C] font-mono mt-2 pt-1 border-t border-[#272C38]/50 flex justify-between">
                  <span>{daySessions.filter(s => s.status === 'COMPLETED').length}/{daySessions.length} done</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
