import React from 'react';
import { Plus, Play } from 'lucide-react';
import { format } from 'date-fns';

interface TopBarProps {
  currentTab: string;
  onOpenAddTopic: () => void;
  onStartTodayRevision: () => void;
  dueTodayCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onOpenAddTopic,
  onStartTodayRevision,
  dueTodayCount
}) => {
  const tabTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    topics: 'My Topics',
    calendar: 'Revision Calendar',
    pyqs: 'PYQ Error Notebook',
    planner: 'Daily Study Planner',
    settings: 'Settings & Storage',
  };

  const formattedDate = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <header className="hidden lg:flex items-center justify-between h-14 px-8 border-b border-[#272C38] bg-[#08090D]/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-[#F5F7FA]">
          {tabTitles[currentTab] || 'Dashboard'}
        </h1>
        <span className="text-xs text-[#737B8C]" aria-hidden="true">&bull;</span>
        <span className="text-xs text-[#737B8C] font-mono tabular-nums">
          {formattedDate}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenAddTopic}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161922] hover:bg-[#1C202B] text-[#F5F7FA] border border-[#272C38] transition active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 text-[#8B9CFF]" />
          <span>Add Topic</span>
        </button>

        <button
          onClick={onStartTodayRevision}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] shadow-xs transition active:scale-[0.98]"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Start Revision</span>
          {dueTodayCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#08090D] text-[#8B9CFF] font-mono font-bold">
              {dueTodayCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
