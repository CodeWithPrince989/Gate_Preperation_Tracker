import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { RevisionSession, Topic } from '../types';
import { computeNextAdaptiveSession, formatDateKey } from '../lib/scheduler';

interface RevisionRunnerModalProps {
  session: RevisionSession | null;
  topic: Topic | null;
  onClose: () => void;
  onComplete: (updatedSession: RevisionSession, nextSession: RevisionSession) => void;
}

export const RevisionRunnerModal: React.FC<RevisionRunnerModalProps> = ({
  session,
  topic,
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [timerSeconds, setTimerSeconds] = useState(180); // 3-minute active recall timer
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [retrievalNotes, setRetrievalNotes] = useState('');
  const [questionsAttempted, setQuestionsAttempted] = useState(0);
  const [questionsCorrect, setQuestionsCorrect] = useState(0);
  const [recallRating, setRecallRating] = useState<1 | 2 | 3 | 4>(3);
  const [mistakesSummary, setMistakesSummary] = useState('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timerSeconds > 0 && step === 1) {
      interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds, step]);

  if (!session || !topic) return null;

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFinish = () => {
    const todayStr = formatDateKey(new Date());
    const updatedCurrent: RevisionSession = {
      ...session,
      completedAt: new Date().toISOString(),
      status: 'COMPLETED',
      recallRating,
      questionsAttempted,
      questionsCorrect,
      mistakesSummary,
      retrievalNotes
    };

    const nextSession = computeNextAdaptiveSession(
      topic.id,
      session.sequenceNumber,
      todayStr,
      recallRating
    );

    onComplete(updatedCurrent, nextSession);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <span className="text-[11px] font-mono font-semibold tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              {topic.exam} &bull; {topic.subjectName}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
              {topic.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-medium">
          <div className={`flex-1 py-2.5 text-center border-b-2 transition ${step === 1 ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold' : 'border-transparent text-slate-400'}`}>
            1. Recall Timer
          </div>
          <div className={`flex-1 py-2.5 text-center border-b-2 transition ${step === 2 ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold' : 'border-transparent text-slate-400'}`}>
            2. Active Writeup
          </div>
          <div className={`flex-1 py-2.5 text-center border-b-2 transition ${step === 3 ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold' : 'border-transparent text-slate-400'}`}>
            3. Practice & Audit
          </div>
          <div className={`flex-1 py-2.5 text-center border-b-2 transition ${step === 4 ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold' : 'border-transparent text-slate-400'}`}>
            4. Adaptive Rating
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold">
                <Clock className="w-4 h-4" /> CLOSED-BOOK RETRIEVAL PHASE
              </div>
              <div className="text-5xl font-mono font-extrabold text-slate-900 dark:text-white tracking-wider">
                {formatTimer(timerSeconds)}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Do not open notes or look at formulas yet. Spend the next 3 minutes in mental recall.
                {topic.topicType === 'Numerical' && ' Try to write down core equations and invariant conditions.'}
                {topic.topicType === 'Programming' && ' Try to write the core loop invariant and edge cases.'}
                {topic.topicType === 'Theory' && ' Reconstruct the primary definition and why it exists.'}
              </p>
              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                >
                  Proceed to Writeup <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Active Retrieval Output (Dump all recalled definitions, formulas & conditions)
              </label>
              <textarea
                rows={6}
                value={retrievalNotes}
                onChange={(e) => setRetrievalNotes(e.target.value)}
                placeholder="Without checking notes: Write down formulas, corner cases, and definitions you recall..."
                className="w-full text-sm p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden dark:text-white"
              />
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                >
                  Next: Verify & Practice <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                <strong>Audit Notes:</strong> Now open reference materials or syllabus notes. Compare what you missed.
              </div>

              {topic.notes && (
                <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold block text-slate-900 dark:text-white mb-1">Saved Topic Notes:</span>
                  {topic.notes}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Questions Attempted
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={questionsAttempted}
                    onChange={(e) => setQuestionsAttempted(Number(e.target.value))}
                    className="w-full p-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Questions Correct
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={questionsAttempted}
                    value={questionsCorrect}
                    onChange={(e) => setQuestionsCorrect(Number(e.target.value))}
                    className="w-full p-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mistakes & Weak Concepts to Reinforce
                </label>
                <input
                  type="text"
                  value={mistakesSummary}
                  onChange={(e) => setMistakesSummary(e.target.value)}
                  placeholder="e.g., Confused left-associative parser rules"
                  className="w-full p-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button onClick={() => setStep(2)} className="text-xs text-slate-500">Back</button>
                <button
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                >
                  Rate Recall & Complete <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  How well did you remember this topic without looking at notes?
                </h4>
                <p className="text-xs text-slate-500">
                  Your rating will adaptively decide your next review date.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    val: 1,
                    title: '1. Forgot almost everything',
                    desc: 'Review weak concepts again tomorrow (+1 day)',
                    badge: 'Next Day'
                  },
                  {
                    val: 2,
                    title: '2. Remembered a little',
                    desc: 'Review again in 2 days (+2 days)',
                    badge: '+2 Days'
                  },
                  {
                    val: 3,
                    title: '3. Remembered most concepts',
                    desc: 'Continue planned spaced interval',
                    badge: 'Normal Jump'
                  },
                  {
                    val: 4,
                    title: '4. Remembered confidently',
                    desc: 'Fast-track to next longer interval',
                    badge: 'Accelerated'
                  }
                ].map(opt => (
                  <label
                    key={opt.val}
                    className={`p-3.5 border-2 rounded-xl cursor-pointer transition flex flex-col justify-between ${
                      recallRating === opt.val
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={opt.val}
                      checked={recallRating === opt.val}
                      onChange={() => setRecallRating(opt.val as any)}
                      className="hidden"
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {opt.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-mono">
                          {opt.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                        {opt.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                <button onClick={() => setStep(3)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Back</button>
                <button
                  onClick={handleFinish}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-md transition"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save & Schedule Next Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
