import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  Settings,
  Flame,
  Plus,
  Play
} from 'lucide-react';
import { ExamType } from '../types';

interface MobileNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
  examFilter: ExamType;
  setExamFilter: (e: ExamType) => void;
  currentStreak: number;
  onOpenAddTopic: () => void;
  onStartTodayRevision: () => void;
  dueTodayCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  setTab,
  examFilter,
  setExamFilter,
  currentStreak,
  onOpenAddTopic,
  onStartTodayRevision,
  dueTodayCount
}) => {
  const primaryTabs = [
    { id: 'dashboard', label: 'Today', icon: LayoutDashboard },
    { id: 'topics', label: 'Topics', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'pyqs', label: 'PYQs', icon: CheckSquare },
    { id: 'planner', label: 'Planner', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* 1. Mobile Top App Bar (Compact, sticky) */}
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-[#101218]/95 backdrop-blur-md border-b border-[#272C38] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B9CFF] to-[#6375FF] text-[#08090D] flex items-center justify-center font-bold text-xs">
            G
          </div>
          <span className="font-bold text-sm text-[#F5F7FA] tracking-tight">
            GATE Revision
          </span>

          {/* Compact Exam Switcher */}
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value as ExamType)}
            className="text-[11px] font-semibold bg-[#161922] text-[#A1A8B7] border border-[#272C38] rounded-md px-2 py-1 outline-hidden"
          >
            <option value="BOTH">All</option>
            <option value="CSE">CSE</option>
            <option value="DA">DA</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak pill */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#161922] border border-[#272C38] text-[#F5BE65] text-xs font-semibold tabular-nums">
            <Flame className="w-3.5 h-3.5 fill-[#F5BE65]" />
            <span>{currentStreak}d</span>
          </div>

          {/* Quick Add */}
          <button
            onClick={onOpenAddTopic}
            className="w-8 h-8 rounded-lg bg-[#161922] border border-[#272C38] text-[#F5F7FA] flex items-center justify-center active:scale-95 transition"
            aria-label="Add Topic"
          >
            <Plus className="w-4 h-4 text-[#8B9CFF]" />
          </button>

          {/* Start Revision CTA */}
          <button
            onClick={onStartTodayRevision}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-[#8B9CFF] text-[#08090D] font-bold text-xs active:scale-95 transition shadow-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{dueTodayCount > 0 ? dueTodayCount : 'Revise'}</span>
          </button>
        </div>
      </header>

      {/* 2. Fixed Mobile Bottom Tab Bar (iOS style, natural thumb reach zone) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101218]/95 backdrop-blur-md border-t border-[#272C38] pb-safe">
        <div className="grid grid-cols-6 h-14 items-center max-w-md mx-auto px-1">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`min-h-[44px] flex flex-col items-center justify-center transition-all ${
                  isActive ? 'text-[#8B9CFF]' : 'text-[#737B8C] hover:text-[#A1A8B7]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                <span className={`text-[10px] mt-1 leading-none ${isActive ? 'font-semibold' : 'font-normal'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
