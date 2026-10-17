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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" /> Log GATE PYQ Attempt
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Associated Topic
            </label>
            <select
              value={topicId}
              onChange={e => setTopicId(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {topics.map(t => (
                <option key={t.id} value={t.id}>[{t.exam}] {t.subjectName} — {t.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Exam</label>
              <select
                value={exam}
                onChange={e => setExam(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="CSE">GATE CSE</option>
                <option value="DA">GATE DA</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Year</label>
              <input
                type="number"
                value={gateYear}
                onChange={e => setGateYear(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Marks</label>
              <select
                value={marks}
                onChange={e => setMarks(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
              >
                <option value={1.0}>1 Mark</option>
                <option value={2.0}>2 Marks</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Question Reference / Identifier *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2024 Set-2 Q42 or GO-29384"
              value={questionRef}
              onChange={e => setQuestionRef(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Result</label>
              <select
                value={result}
                onChange={e => setResult(e.target.value as QuestionResult)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="CORRECT">Correct (+Marks)</option>
                <option value="INCORRECT">Incorrect (-Negative)</option>
                <option value="SKIPPED">Skipped (0)</option>
                <option value="PARTIAL">Partially Correct (MSQ)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Time (Seconds)</label>
              <input
                type="number"
                value={timeTakenSeconds}
                onChange={e => setTimeTakenSeconds(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {result !== 'CORRECT' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Root Cause Error Category
              </label>
              <select
                value={errorCategory}
                onChange={e => setErrorCategory(e.target.value as ErrorCategory)}
                className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mistake Explanation / Notebook Entry
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              placeholder="Why did you make this mistake and how will you avoid it next time?"
              className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="indep"
              checked={solvedIndependently}
              onChange={e => setSolvedIndependently(e.target.checked)}
              className="rounded text-blue-600"
            />
            <label htmlFor="indep" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              Solved independently without opening answer key or video solution
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition"
            >
              Save Practice Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
