import React from 'react';
import { BookOpen, Calendar, CheckSquare, BarChart3, Settings, Moon, Sun, Flame, Database, Plus } from 'lucide-react';
import { ExamType } from '../types';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  examFilter: ExamType;
  setExamFilter: (e: ExamType) => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
  currentStreak: number;
  isSupabase: boolean;
  onOpenAddTopic: () => void;
  onStartTodayRevision: () => void;
  dueTodayCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setTab,
  examFilter,
  setExamFilter,
  darkMode,
  setDarkMode,
  currentStreak,
  isSupabase,
  onOpenAddTopic,
  onStartTodayRevision,
  dueTodayCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Exam Selector */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setTab('dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-blue-500/20">
                G
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight block leading-tight">
                  GATE Revision OS
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider">
                  CSE &bull; DA &bull; SPATIAL RECALL
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
              {(['BOTH', 'CSE', 'DA'] as ExamType[]).map((exam) => (
                <button
                  key={exam}
                  onClick={() => setExamFilter(exam)}
                  className={`px-3 py-1 rounded-md transition-all ${
                    examFilter === exam
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {exam === 'BOTH' ? 'All Exams' : exam}
                </button>
              ))}
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'topics', label: 'My Topics', icon: BookOpen },
              { id: 'calendar', label: 'Calendar', icon: Calendar },
              { id: 'pyqs', label: 'PYQ Tracker', icon: CheckSquare },
              { id: 'planner', label: 'Daily Planner', icon: CheckSquare },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold"
              title="Daily study streak"
            >
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{currentStreak}d</span>
            </div>

            {/* Storage indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md font-mono border ${
                isSupabase
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                  : 'border-slate-300 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
              title={isSupabase ? 'Connected to Supabase PostgreSQL' : 'Local Demo Mode (Browser Storage)'}
            >
              <Database className="w-3 h-3" />
              {isSupabase ? 'Cloud' : 'Local'}
            </div>

            {/* Add Topic CTA */}
            <button
              onClick={onOpenAddTopic}
              className="hidden sm:inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Topic
            </button>

            {/* Main Primary Action: Start Today's Revision */}
            <button
              onClick={onStartTodayRevision}
              className="relative inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition active:scale-95"
            >
              Start Revision
              {dueTodayCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                  {dueTodayCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Submenu for tabs */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'topics', label: 'Topics', icon: BookOpen },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'pyqs', label: 'PYQ Tracker', icon: CheckSquare },
            { id: 'planner', label: 'Planner', icon: CheckSquare },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
