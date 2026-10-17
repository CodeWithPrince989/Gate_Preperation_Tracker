import React, { useState } from 'react';
import { Plus, CheckSquare, Filter, RotateCcw, AlertTriangle, Clock, Award, HelpCircle } from 'lucide-react';
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

  // ==========================================
  // BRAND-NEW USER ZERO LOGS EMPTY STATE
  // ==========================================
  if (logs.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#161922] border border-[#272C38] flex items-center justify-center mx-auto mb-4 text-[#8B9CFF]">
            <CheckSquare className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161922] border border-[#272C38] text-[11px] font-mono text-[#8B9CFF] mb-3">
            <span>Question Practice &amp; Error Notebook</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">
            No PYQ Practice Attempts Logged Yet
          </h2>

          <p className="text-xs sm:text-sm text-[#A1A8B7] max-w-lg mx-auto mt-2 leading-relaxed">
            Record every GATE previous year question you solve. Tag question references (e.g. GATE CSE 2023 Q14), record your time taken, and pinpoint root-cause errors (Conceptual, Calculation, Formula Forgotten, Silly Mistake, or Time Pressure) so you never repeat the same blunder.
          </p>

          <div className="flex justify-center mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log Your First PYQ Attempt</span>
            </button>
          </div>

          {/* 3 Strategy Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left mt-10 pt-8 border-t border-[#272C38]">
            <div className="p-3.5 rounded-xl bg-[#161922] border border-[#272C38]">
              <div className="flex items-center gap-1.5 text-[#FF727C] text-xs font-semibold mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Root-Cause Isolation</span>
              </div>
              <p className="text-[11px] text-[#737B8C] leading-relaxed">
                Categorize whether mistakes came from knowledge gaps or rushed arithmetic.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161922] border border-[#272C38]">
              <div className="flex items-center gap-1.5 text-[#8B9CFF] text-xs font-semibold mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Pacing &amp; Speed</span>
              </div>
              <p className="text-[11px] text-[#737B8C] leading-relaxed">
                Measure seconds per question to build exam stamina under the 3-minute target.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161922] border border-[#272C38]">
              <div className="flex items-center gap-1.5 text-[#42D6A4] text-xs font-semibold mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>Independent Solving</span>
              </div>
              <p className="text-[11px] text-[#737B8C] leading-relaxed">
                Track whether you solved without glancing at answer keys or video solutions.
              </p>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <PYQLoggerModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={onSaveLog}
            topics={topics}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // PYQ LOGS LIST VIEW
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101218] p-5 rounded-2xl border border-[#272C38] shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#8B9CFF]" />
            GATE PYQ &amp; Error Notebook
          </h2>
          <p className="text-xs text-[#737B8C] mt-1">
            Audit every solved question, isolate conceptual and calculation errors, and review root causes.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Log PYQ Attempt</span>
        </button>
      </div>

      {/* Accuracy & Error distribution cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#101218] p-4 rounded-2xl border border-[#272C38] shadow-2xs">
          <span className="text-xs text-[#737B8C] block">Total Questions</span>
          <span className="text-2xl font-bold text-[#F5F7FA] font-mono tabular-nums mt-1 block">
            {total}
          </span>
        </div>
        <div className="bg-[#101218] p-4 rounded-2xl border border-[#272C38] shadow-2xs">
          <span className="text-xs text-[#737B8C] block">Correct Accuracy</span>
          <span className="text-2xl font-bold text-[#42D6A4] font-mono tabular-nums mt-1 block">
            {accuracy}%
          </span>
        </div>
        <div className="md:col-span-2 bg-[#101218] p-4 rounded-2xl border border-[#272C38] shadow-2xs">
          <span className="text-xs text-[#737B8C] block mb-2">Error Breakdown by Root Cause</span>
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(errorCounts).length === 0 ? (
              <span className="text-xs text-[#737B8C]">No error categories recorded yet.</span>
            ) : (
              Object.entries(errorCounts).map(([cat, count]) => (
                <div
                  key={cat}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#161922] text-[#FF727C] border border-[#FF727C]/30 flex items-center gap-1.5"
                >
                  <span>{cat.replace('_', ' ')}</span>
                  <span className="font-bold text-[#F5F7FA] tabular-nums">({count})</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-[#101218] border border-[#272C38] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#272C38] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A8B7]">
              Practice Attempts
            </h3>
            <span className="text-xs text-[#737B8C] font-mono tabular-nums">
              ({filteredLogs.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#737B8C]" />
            <select
              value={errorFilter}
              onChange={e => setErrorFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-[#272C38] rounded-xl bg-[#161922] text-[#F5F7FA] outline-hidden cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Conceptual">Conceptual Errors</option>
              <option value="Calculation">Calculation Errors</option>
              <option value="Silly">Silly Mistakes</option>
              <option value="Time_Pressure">Time Pressure</option>
              <option value="Formula_Forgotten">Formula Forgotten</option>
              <option value="None">None (Correct)</option>
            </select>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-[#737B8C] text-xs">
            <p>No practice logs match your selected filter &ldquo;{errorFilter}&rdquo;.</p>
            <button
              onClick={() => setErrorFilter('ALL')}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161922] border border-[#272C38] text-[#8B9CFF] hover:bg-[#1C202B] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All Attempts</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#272C38] bg-[#161922] text-[#737B8C] font-medium">
                  <th className="py-2.5 px-4">Exam / Year</th>
                  <th className="py-2.5 px-4">Question Reference</th>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4">Marks</th>
                  <th className="py-2.5 px-4">Result</th>
                  <th className="py-2.5 px-4">Error Cause</th>
                  <th className="py-2.5 px-4">Time</th>
                  <th className="py-2.5 px-4">Explanation / Trap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272C38]">
                {filteredLogs.map(l => (
                  <tr key={l.id} className="hover:bg-[#161922]/60 transition">
                    <td className="py-3 px-4 font-mono">
                      <span className="font-semibold text-[#8B9CFF]">{l.exam}</span>{' '}
                      <span className="text-[#A1A8B7] tabular-nums">{l.gateYear}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#F5F7FA]">
                      {l.questionRef}
                    </td>
                    <td className="py-3 px-4 text-[#A1A8B7]">{l.subjectName}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-[#A1A8B7]">
                      {l.marks}m
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          l.result === 'CORRECT' ? 'text-[#42D6A4]' : 'text-[#FF727C]'
                        }`}
                      >
                        {l.result}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {l.errorCategory && l.errorCategory !== 'None' ? (
                        <span className="font-mono text-[11px] text-[#FF727C]">
                          {l.errorCategory.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-[#737B8C]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#A1A8B7] tabular-nums">
                      {Math.floor(l.timeTakenSeconds / 60)}m {l.timeTakenSeconds % 60}s
                    </td>
                    <td className="py-3 px-4 text-[#737B8C] max-w-xs truncate" title={l.explanation}>
                      {l.explanation || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <PYQLoggerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={onSaveLog}
          topics={topics}
        />
      )}
    </div>
  );
};
