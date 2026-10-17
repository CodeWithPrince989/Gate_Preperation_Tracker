import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  Settings,
  Flame,
  Database,
  Plus,
  Play
} from 'lucide-react';
import { ExamType } from '../types';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  examFilter: ExamType;
  setExamFilter: (e: ExamType) => void;
  currentStreak: number;
  isSupabase: boolean;
  onOpenAddTopic: () => void;
  onStartTodayRevision: () => void;
  dueTodayCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setTab,
  examFilter,
  setExamFilter,
  currentStreak,
  isSupabase,
  onOpenAddTopic,
  onStartTodayRevision,
  dueTodayCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: dueTodayCount > 0 ? dueTodayCount : null },
    { id: 'topics', label: 'My Topics', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'pyqs', label: 'PYQ Tracker', icon: CheckSquare },
    { id: 'planner', label: 'Daily Planner', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex w-60 shrink-0 bg-[#101218] border-r border-[#272C38] flex-col justify-between p-4 sticky top-0 h-screen select-none">
      {/* Top Block */}
      <div className="space-y-5">
        {/* Brand */}
        <div className="flex items-center gap-3 px-1.5 py-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B9CFF] to-[#6375FF] text-[#08090D] flex items-center justify-center font-bold text-sm shadow-xs">
            G
          </div>
          <div>
            <div className="font-semibold text-sm text-[#F5F7FA] tracking-tight leading-none">
              GATE Revision OS
            </div>
            <div className="text-[11px] text-[#737B8C] mt-1 leading-none font-medium">
              Spaced Repetition
            </div>
          </div>
        </div>

        {/* Exam Filter Segmented Control */}
        <div className="p-0.5 bg-[#161922] border border-[#272C38] rounded-lg grid grid-cols-3 gap-0.5">
          {(['BOTH', 'CSE', 'DA'] as ExamType[]).map((exam) => {
            const active = examFilter === exam;
            return (
              <button
                key={exam}
                onClick={() => setExamFilter(exam)}
                className={`py-1 text-[11px] font-medium rounded-md transition-all text-center ${
                  active
                    ? 'bg-[#1C202B] text-[#F5F7FA] shadow-xs font-semibold'
                    : 'text-[#737B8C] hover:text-[#A1A8B7]'
                }`}
              >
                {exam === 'BOTH' ? 'All' : exam}
              </button>
            );
          })}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#1C202B] text-[#F5F7FA] font-semibold shadow-2xs'
                    : 'text-[#A1A8B7] hover:text-[#F5F7FA] hover:bg-[#161922]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#8B9CFF]' : 'text-[#737B8C]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#8B9CFF]/20 text-[#8B9CFF]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Block */}
      <div className="space-y-3 pt-3 border-t border-[#272C38]">
        {/* Streak & Storage status */}
        <div className="flex items-center justify-between text-xs px-1 text-[#737B8C]">
          <div className="flex items-center gap-1.5 font-medium text-[#F5BE65]">
            <Flame className="w-3.5 h-3.5 fill-[#F5BE65]" />
            <span className="tabular-nums font-semibold">{currentStreak}d streak</span>
          </div>

          <div
            className="flex items-center gap-1 text-[11px] font-mono text-[#A1A8B7]"
            title={isSupabase ? 'Connected to Supabase PostgreSQL' : 'Local Storage Mode'}
          >
            <Database className="w-3 h-3 text-[#42D6A4]" />
            <span>{isSupabase ? 'Cloud' : 'Local'}</span>
          </div>
        </div>

        {/* Quick Action: Start Revision */}
        <button
          onClick={onStartTodayRevision}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] font-bold text-xs shadow-xs transition active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start Revision {dueTodayCount > 0 ? `(${dueTodayCount})` : ''}</span>
        </button>

        {/* Add Topic Action */}
        <button
          onClick={onOpenAddTopic}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#161922] hover:bg-[#1C202B] text-[#F5F7FA] border border-[#272C38] text-xs font-semibold transition active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 text-[#8B9CFF]" />
          <span>New Topic</span>
        </button>
      </div>
    </aside>
  );
};
