import React, { useState } from 'react';
import { Plus, CheckSquare, Filter } from 'lucide-react';
import { PracticeLog, Topic, ExamType } from '../types';
import { PYQLoggerModal } from '../components/PYQLoggerModal';

interface PYQTrackerViewProps {
  logs: PracticeLog[];
  topics: Topic[];
  examFilter: ExamType;
  onSaveLog: (log: PracticeLog) => void;
}

export const PYQTrackerView: React.FC<PYQTrackerViewProps> = ({
  logs,
  topics,
  examFilter,
  onSaveLog
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorFilter, setErrorFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter(l => {
    const matchExam = examFilter === 'BOTH' || l.exam === examFilter;
    const matchError = errorFilter === 'ALL' || l.errorCategory === errorFilter;
    return matchExam && matchError;
  });

  const total = filteredLogs.length;
  const correct = filteredLogs.filter(l => l.result === 'CORRECT').length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Breakdown by error category
  const errorCounts: Record<string, number> = {};
  logs.forEach(l => {
    if (l.errorCategory && l.errorCategory !== 'None') {
      errorCounts[l.errorCategory] = (errorCounts[l.errorCategory] || 0) + 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" /> GATE PYQ & Error Notebook
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record every question attempt, identify weak patterns, and prevent repeated mistakes.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Log PYQ Attempt
        </button>
      </div>

      {/* Accuracy & Error distribution cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Attempted</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">{total}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Correct Accuracy</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{accuracy}%</span>
        </div>
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Mistake Breakdown by Root Cause</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {Object.entries(errorCounts).length === 0 ? (
              <span className="text-xs text-slate-400">No logged errors yet.</span>
            ) : (
              Object.entries(errorCounts).map(([cat, count]) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900"
                >
                  {cat}: {count}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Practice Logs ({filteredLogs.length})
          </h3>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={errorFilter}
              onChange={e => setErrorFilter(e.target.value)}
              className="text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">All Categories</option>
              <option value="Conceptual">Conceptual</option>
              <option value="Calculation">Calculation</option>
              <option value="Misread Question">Misread Question</option>
              <option value="Formula Recall">Formula Recall</option>
              <option value="Time Management">Time Management</option>
            </select>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No PYQ attempts logged yet. Click &ldquo;Log PYQ Attempt&rdquo; above.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                      {log.exam}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {log.questionRef}
                    </span>
                    <span className="text-xs text-slate-400">({log.subjectName})</span>
                    <span className="text-xs text-slate-400">&bull; {log.marks} Mark{log.marks > 1 ? 's' : ''}</span>
                    {log.solvedIndependently && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                        Independent
                      </span>
                    )}
                  </div>
                  {log.explanation && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">
                      &ldquo;{log.explanation}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {log.errorCategory !== 'None' && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                      {log.errorCategory}
                    </span>
                  )}
                  <span className="text-xs font-mono text-slate-500">{log.timeTakenSeconds}s</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    log.result === 'CORRECT'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {log.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PYQLoggerModal
        isOpen={isModalOpen}
        topics={topics}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveLog}
      />
    </div>
  );
};
