import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, ArrowRight, ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
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
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [timerSeconds, setTimerSeconds] = useState(180); // 3-minute active recall timer
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [retrievalNotes, setRetrievalNotes] = useState('');
  const [questionsAttempted, setQuestionsAttempted] = useState(0);
  const [questionsCorrect, setQuestionsCorrect] = useState(0);
  const [recallRating, setRecallRating] = useState<1 | 2 | 3 | 4>(3);
  const [mistakesSummary, setMistakesSummary] = useState('');
  const [completedSummary, setCompletedSummary] = useState<{ updated: RevisionSession; next: RevisionSession } | null>(null);

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

    setCompletedSummary({ updated: updatedCurrent, next: nextSession });
    setStep(5); // Show success screen
  };

  const handleFinalAcknowledge = () => {
    if (completedSummary) {
      onComplete(completedSummary.updated, completedSummary.next);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#08090D]/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#101218] border border-[#272C38] rounded-t-3xl sm:rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-10 h-1 bg-[#272C38] rounded-full mx-auto my-2" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#272C38] bg-[#161922]/60">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#737B8C]">
              <span className="font-mono font-semibold text-[#8B9CFF]">{topic.exam}</span>
              <span aria-hidden="true">&bull;</span>
              <span>{topic.subjectName}</span>
              <span aria-hidden="true">&bull;</span>
              <span className="text-[#A1A8B7]">Rev {session.sequenceNumber}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#F5F7FA] mt-0.5 line-clamp-1">
              {topic.name}
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

        {/* Stepper Progress Bar */}
        {step < 5 && (
          <div className="grid grid-cols-4 border-b border-[#272C38] text-[11px] font-medium text-center">
            {[
              { num: 1, label: '1. Recall' },
              { num: 2, label: '2. Writeup' },
              { num: 3, label: '3. Audit' },
              { num: 4, label: '4. Rate' },
            ].map(s => (
              <div
                key={s.num}
                className={`py-2.5 transition-colors border-b-2 ${
                  step === s.num
                    ? 'border-[#8B9CFF] text-[#8B9CFF] font-semibold bg-[#8B9CFF]/5'
                    : step > s.num
                    ? 'border-[#42D6A4] text-[#42D6A4]'
                    : 'border-transparent text-[#737B8C]'
                }`}
              >
                {s.label}
              </div>
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: Closed-Book Recall Timer */}
          {step === 1 && (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161922] border border-[#272C38] text-[#8B9CFF] text-xs font-mono font-medium">
                <Clock className="w-3.5 h-3.5" /> CLOSED-BOOK RETRIEVAL
              </div>

              <div className="text-6xl font-mono font-extrabold text-[#F5F7FA] tracking-wider tabular-nums">
                {formatTimer(timerSeconds)}
              </div>

              <p className="text-xs sm:text-sm text-[#A1A8B7] max-w-md mx-auto leading-relaxed">
                Keep notes closed. Spend the next 3 minutes in mental recall.
                {topic.topicType === 'Numerical' && ' Mentally reconstruct equations, derivation steps, and units.'}
                {topic.topicType === 'Programming' && ' Visualize loop invariants, base cases, and complexity bounds.'}
                {topic.topicType === 'Theory' && ' State definitions, properties, and trade-offs.'}
              </p>

              <div className="flex justify-center gap-3 pt-3">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-4 py-2 border border-[#272C38] rounded-xl text-xs font-semibold text-[#A1A8B7] hover:bg-[#161922] transition min-h-[44px]"
                >
                  {isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#8B9CFF] text-[#08090D] rounded-xl text-xs font-bold hover:bg-[#9DAEFF] transition min-h-[44px] active:scale-[0.98]"
                >
                  <span>Proceed to Writeup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Active Writeup */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-1">
                  Active Retrieval Output
                </label>
                <p className="text-xs text-[#737B8C]">
                  Dump all formulas, theorems, edge cases, and definitions you recalled before checking your syllabus notes.
                </p>
              </div>

              <textarea
                rows={7}
                value={retrievalNotes}
                onChange={(e) => setRetrievalNotes(e.target.value)}
                placeholder="Write equations, lemmas, proofs, or corner cases here..."
                className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] placeholder-[#737B8C] focus:ring-1 focus:ring-[#8B9CFF] focus:border-[#8B9CFF] outline-hidden leading-relaxed font-mono"
              />

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#737B8C] hover:text-[#A1A8B7] min-h-[44px] px-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#8B9CFF] text-[#08090D] rounded-xl text-xs font-bold hover:bg-[#9DAEFF] transition min-h-[44px] active:scale-[0.98]"
                >
                  <span>Verify Against Notes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Practice & Audit */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-[#161922] border border-[#272C38] rounded-xl text-xs text-[#A1A8B7] leading-relaxed">
                <span className="font-semibold text-[#F5F7FA] block mb-0.5">Audit Reference:</span>
                Open your reference book, short notes, or GATE syllabus. Check what you missed or misremembered.
              </div>

              {topic.notes && (
                <div className="p-3 bg-[#161922]/80 border border-[#272C38] rounded-xl text-xs">
                  <span className="font-semibold text-[#8B9CFF] block mb-1">Saved Topic Notes:</span>
                  <p className="text-[#A1A8B7] whitespace-pre-wrap">{topic.notes}</p>
                </div>
              )}

              {/* Checklist review */}
              {topic.checklist.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#F5F7FA]">Key Invariants to Verify:</span>
                  <div className="space-y-1">
                    {topic.checklist.map(c => (
                      <div key={c.id} className="text-xs text-[#A1A8B7] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8B9CFF]" />
                        <span>{c.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-[#A1A8B7] mb-1">
                    Questions Attempted
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={questionsAttempted}
                    onChange={(e) => setQuestionsAttempted(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] font-mono tabular-nums outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A1A8B7] mb-1">
                    Questions Correct
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={questionsAttempted}
                    value={questionsCorrect}
                    onChange={(e) => setQuestionsCorrect(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] font-mono tabular-nums outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A8B7] mb-1">
                  Mistakes or Missed Concepts
                </label>
                <input
                  type="text"
                  value={mistakesSummary}
                  onChange={(e) => setMistakesSummary(e.target.value)}
                  placeholder="e.g. Forgot candidate key definition when attribute closure has multiple determinants"
                  className="w-full p-2.5 text-xs rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] outline-hidden placeholder-[#737B8C]"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#737B8C] hover:text-[#A1A8B7] min-h-[44px] px-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#8B9CFF] text-[#08090D] rounded-xl text-xs font-bold hover:bg-[#9DAEFF] transition min-h-[44px] active:scale-[0.98]"
                >
                  <span>Rate Recall</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Adaptive Rating */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#F5F7FA]">
                  How accurately did you recall the material?
                </h3>
                <p className="text-xs text-[#737B8C] mt-0.5">
                  Your rating adaptively calculates the next spaced review interval.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    val: 1,
                    title: '1. Forgot most concepts',
                    desc: 'Review again tomorrow (+1 day)',
                    badge: 'Next Day',
                    color: 'text-[#FF727C]'
                  },
                  {
                    val: 2,
                    title: '2. Remembered partially',
                    desc: 'Review in 2 days (+2 days)',
                    badge: '+2 Days',
                    color: 'text-[#F5BE65]'
                  },
                  {
                    val: 3,
                    title: '3. Remembered with effort',
                    desc: 'Continue planned interval',
                    badge: 'Normal Jump',
                    color: 'text-[#8B9CFF]'
                  },
                  {
                    val: 4,
                    title: '4. Remembered effortlessly',
                    desc: 'Accelerate to longer interval',
                    badge: 'Accelerated',
                    color: 'text-[#42D6A4]'
                  }
                ].map(opt => (
                  <label
                    key={opt.val}
                    className={`p-3.5 border rounded-xl cursor-pointer transition flex flex-col justify-between select-none ${
                      recallRating === opt.val
                        ? 'border-[#8B9CFF] bg-[#161922] ring-1 ring-[#8B9CFF]/30'
                        : 'border-[#272C38] bg-[#101218] hover:border-[#737B8C]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recallRating"
                      value={opt.val}
                      checked={recallRating === opt.val}
                      onChange={() => setRecallRating(opt.val as any)}
                      className="hidden"
                    />
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${opt.color}`}>{opt.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1C202B] text-[#A1A8B7]">
                          {opt.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#737B8C] leading-snug block">
                        {opt.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[#272C38]">
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#737B8C] hover:text-[#A1A8B7] min-h-[44px] px-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={handleFinish}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#42D6A4] hover:bg-[#55F0BB] text-[#08090D] rounded-xl text-xs font-bold shadow-md transition active:scale-[0.98] min-h-[44px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Revision</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Success & Next Schedule Confirmation */}
          {step === 5 && completedSummary && (
            <div className="py-6 text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-[#42D6A4]/10 border border-[#42D6A4]/30 text-[#42D6A4] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#F5F7FA]">
                  Revision Completed!
                </h3>
                <p className="text-xs text-[#A1A8B7]">
                  Your recall rating and study activity have been saved to your schedule.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#161922] border border-[#272C38] max-w-sm mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#737B8C]">Topic:</span>
                  <span className="font-semibold text-[#F5F7FA] truncate max-w-[200px]">{topic.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737B8C]">Next Review:</span>
                  <span className="font-bold text-[#8B9CFF] font-mono tabular-nums">
                    {completedSummary.next.scheduledDate} (Rev {completedSummary.next.sequenceNumber})
                  </span>
                </div>
                {questionsAttempted > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#737B8C]">Practice:</span>
                    <span className="font-mono text-[#F5F7FA] tabular-nums">
                      {questionsCorrect}/{questionsAttempted} correct ({Math.round((questionsCorrect / questionsAttempted) * 100)}%)
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleFinalAcknowledge}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] font-bold text-xs rounded-xl shadow-xs transition active:scale-[0.98] min-h-[44px]"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
