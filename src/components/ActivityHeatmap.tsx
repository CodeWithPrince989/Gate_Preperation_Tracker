import React from 'react';
import { format, subDays, startOfWeek, addDays } from 'date-fns';
import { StudyActivity } from '../types';

interface ActivityHeatmapProps {
  activities: StudyActivity[];
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ activities }) => {
  // Aggregate activity counts per calendar date
  const countsMap = new Map<string, number>();
  activities.forEach(a => {
    countsMap.set(a.activityDate, (countsMap.get(a.activityDate) || 0) + 1);
  });

  const today = new Date();
  const startDate = startOfWeek(subDays(today, 364), { weekStartsOn: 1 });
  const days: { date: Date; dateStr: string; count: number }[] = [];

  for (let i = 0; i < 371; i++) {
    const current = addDays(startDate, i);
    if (current > today) break;
    const str = format(current, 'yyyy-MM-dd');
    days.push({
      date: current,
      dateStr: str,
      count: countsMap.get(str) || 0
    });
  }

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50';
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900/60 border-emerald-300';
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-700 border-emerald-500';
    return 'bg-emerald-600 dark:bg-emerald-500 border-emerald-700 text-white';
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Study Consistency Heatmap (Last 365 Days)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Each cell represents qualifying study revisions, PYQ logs, and practice sessions.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Less</span>
          <div className="w-3 h-3 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <div className="w-3 h-3 rounded-xs bg-emerald-200 dark:bg-emerald-900/60" />
          <div className="w-3 h-3 rounded-xs bg-emerald-400 dark:bg-emerald-700" />
          <div className="w-3 h-3 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid grid-flow-col grid-rows-7 gap-1 w-max">
          {days.map((day) => (
            <div
              key={day.dateStr}
              title={`${day.dateStr}: ${day.count} activities`}
              className={`w-3.5 h-3.5 rounded-xs border transition-colors ${getColorClass(day.count)}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
