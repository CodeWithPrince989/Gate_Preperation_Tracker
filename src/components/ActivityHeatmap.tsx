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
    if (count === 0) return 'bg-[#161922] border-[#272C38]/60 hover:border-[#737B8C]';
    if (count === 1) return 'bg-[#183D31] border-[#235E4B]';
    if (count === 2) return 'bg-[#297B5E] border-[#34A47E]';
    return 'bg-[#42D6A4] border-[#55F0BB]';
  };

  const totalQualifying = activities.length;

  return (
    <div className="bg-[#101218] p-5 rounded-2xl border border-[#272C38] shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F5F7FA]">
              Study Consistency Heatmap
            </h3>
            <span className="text-xs text-[#737B8C]" aria-hidden="true">&bull;</span>
            <span className="text-xs text-[#A1A8B7] tabular-nums font-mono">
              {totalQualifying} sessions this year
            </span>
          </div>
          <p className="text-xs text-[#737B8C] mt-0.5">
            Spaced recall sessions, PYQ audits, and concept reviews across 365 days.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#737B8C]">
          <span>Less</span>
          <div className="w-3 h-3 rounded-xs bg-[#161922] border border-[#272C38]" />
          <div className="w-3 h-3 rounded-xs bg-[#183D31] border border-[#235E4B]" />
          <div className="w-3 h-3 rounded-xs bg-[#297B5E]" />
          <div className="w-3 h-3 rounded-xs bg-[#42D6A4]" />
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="grid grid-flow-col grid-rows-7 gap-1 w-max">
          {days.map((day) => (
            <div
              key={day.dateStr}
              title={`${day.dateStr}: ${day.count} active study events`}
              className={`w-3.5 h-3.5 rounded-xs border transition-colors ${getColorClass(day.count)}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
