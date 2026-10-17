import React, { useState } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { Topic, PracticeLog, ErrorCategory, QuestionResult } from '../types';

interface PYQLoggerModalProps {
  isOpen: boolean;
  topics: Topic[];
  onClose: () => void;
  onSave: (log: PracticeLog) => void;
}

export const PYQLoggerModal: React.FC<PYQLoggerModalProps> = ({
  isOpen,
  topics,
  onClose,
  onSave
}) => {
  const [topicId, setTopicId] = useState(topics[0]?.id || '');
  const [exam, setExam] = useState<'CSE' | 'DA'>('CSE');
  const [gateYear, setGateYear] = useState(2024);
  const [questionRef, setQuestionRef] = useState('');
  const [marks, setMarks] = useState(2.0);
  const [result, setResult] = useState<QuestionResult>('CORRECT');
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(180);
  const [errorCategory, setErrorCategory] = useState<ErrorCategory>('None');
  const [explanation, setExplanation] = useState('');
  const [solvedIndependently, setSolvedIndependently] = useState(true);

  if (!isOpen) return null;

  const selectedTopic = topics.find(t => t.id === topicId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionRef.trim()) return;

    const newLog: PracticeLog = {
      id: crypto.randomUUID(),
      topicId: topicId || undefined,
      subjectName: selectedTopic?.subjectName || 'General',
      exam,
      gateYear,
      questionRef: questionRef.trim(),
      marks,
      result,
      timeTakenSeconds,
      errorCategory: result === 'CORRECT' ? 'None' : errorCategory,
      explanation,
      solvedIndependently,
      createdAt: new Date().toISOString()
    };

    onSave(newLog);
    // Reset form
    setQuestionRef('');
    setExplanation('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#08090D]/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#101218] border border-[#272C38] rounded-t-3xl sm:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90dvh] sm:max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-10 h-1 bg-[#272C38] rounded-full mx-auto my-2" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#272C38] bg-[#161922]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#8B9CFF]/10 border border-[#8B9CFF]/20 text-[#8B9CFF] flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#F5F7FA]">
              Log GATE PYQ Attempt
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#737B8C] hover:text-[#F5F7FA] hover:bg-[#1C202B] transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-[#A1A8B7] mb-1">
              Associated Syllabus Topic
            </label>
            <select
              value={topicId}
              onChange={e => setTopicId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] outline-hidden truncate"
            >
              {topics.map(t => (
                <option key={t.id} value={t.id}>[{t.exam}] {t.subjectName} — {t.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#A1A8B7] mb-1">Exam</label>
              <select
                value={exam}
                onChange={e => setExam(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] outline-hidden"
              >
                <option value="CSE">GATE CSE</option>
                <option value="DA">GATE DA</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A1A8B7] mb-1">Year</label>
              <input
                type="number"
                value={gateYear}
                onChange={e => setGateYear(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-[#272C38] rounded-xl bg-[#161922] text-[#F5F7FA] font-mono outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A1A8B7] mb-1">Marks</label>
              <select
                value={marks}
                onChange={e => setMarks(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-[#272C38] rounded-xl bg-[#161922] text-[#F5F7FA] outline-hidden font-mono"
              >
                <option value={1.0}>1 Mark</option>
                <option value={2.0}>2 Marks</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F5F7FA] mb-1">
              Question Reference / Identifier *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GATE CSE 2024 Set-2 Q42 or GO-29384"
              value={questionRef}
              onChange={e => setQuestionRef(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 border border-[#272C38] rounded-xl bg-[#161922] text-[#F5F7FA] placeholder-[#737B8C] focus:ring-1 focus:ring-[#8B9CFF] outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#A1A8B7] mb-1">Result</label>
              <select
                value={result}
                onChange={e => setResult(e.target.value as QuestionResult)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] outline-hidden font-semibold"
              >
                <option value="CORRECT">Correct (+Marks)</option>
                <option value="INCORRECT">Incorrect (-Negative)</option>
                <option value="SKIPPED">Skipped (0)</option>
                <option value="PARTIAL">Partially Correct (MSQ)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A1A8B7] mb-1">Time (Seconds)</label>
              <input
                type="number"
                value={timeTakenSeconds}
                onChange={e => setTimeTakenSeconds(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-[#272C38] rounded-xl bg-[#161922] text-[#F5F7FA] font-mono tabular-nums outline-hidden"
              />
            </div>
          </div>

          {result !== 'CORRECT' && (
            <div>
              <label className="block text-xs font-semibold text-[#FF727C] mb-1">
                Root Cause Error Category
              </label>
              <select
                value={errorCategory}
                onChange={e => setErrorCategory(e.target.value as ErrorCategory)}
                className="w-full text-xs p-2.5 border border-[#272C38] rounded-xl bg-[#161922] text-[#F5F7FA] outline-hidden"
              >
                <option value="Conceptual">Conceptual Misunderstanding</option>
                <option value="Calculation">Calculation / Arithmetic Slip</option>
                <option value="Misread Question">Misread Question / Trap Noticed Late</option>
                <option value="Formula Recall">Formula Recall Failure</option>
                <option value="Time Management">Time Pressure Mistake</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#A1A8B7] mb-1">
              Mistake Explanation / Notebook Entry
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              placeholder="Why did you make this mistake and how will you prevent it?"
              className="w-full text-xs p-2.5 border border-[#272C38] rounded-xl bg-[#161922] text-[#F5F7FA] placeholder-[#737B8C] outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="indep"
              checked={solvedIndependently}
              onChange={e => setSolvedIndependently(e.target.checked)}
              className="rounded accent-[#8B9CFF] w-4 h-4"
            />
            <label htmlFor="indep" className="text-xs text-[#A1A8B7] cursor-pointer select-none">
              Solved independently without checking solutions
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-[#272C38]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A1A8B7] hover:bg-[#161922] transition min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#8B9CFF] text-[#08090D] rounded-xl text-xs font-bold hover:bg-[#9DAEFF] shadow-xs transition active:scale-[0.98] min-h-[44px]"
            >
              Save Attempt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
