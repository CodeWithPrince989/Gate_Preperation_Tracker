import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Topic, RevisionSession, PracticeLog, MasteryStatus } from '../types';
import { getSessionStatus, formatDateKey } from '../lib/scheduler';

interface TopicDetailModalProps {
  topic: Topic | null;
  sessions: RevisionSession[];
  practiceLogs: PracticeLog[];
  onClose: () => void;
  onUpdateTopic: (topic: Topic) => void;
  onDeleteTopic: (topicId: string) => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  topic,
  sessions,
  practiceLogs,
  onClose,
  onUpdateTopic,
  onDeleteTopic
}) => {
  const [newChecklistText, setNewChecklistText] = useState('');

  if (!topic) return null;

  const todayStr = formatDateKey(new Date());
  const topicSessions = sessions
    .filter(s => s.topicId === topic.id)
    .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  const topicLogs = practiceLogs.filter(p => p.topicId === topic.id);

  const toggleChecklist = (id: string) => {
    const updated = topic.checklist.map(c => c.id === id ? { ...c, done: !c.done } : c);
    onUpdateTopic({ ...topic, checklist: updated });
  };

  const addChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const updated = [
      ...topic.checklist,
      { id: crypto.randomUUID(), text: newChecklistText.trim(), done: false }
    ];
    onUpdateTopic({ ...topic, checklist: updated });
    setNewChecklistText('');
  };

  const handleMasteryChange = (status: MasteryStatus) => {
    onUpdateTopic({ ...topic, masteryStatus: status });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                {topic.exam}
              </span>
              <span className="text-xs text-slate-500">{topic.subjectName}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {topic.topicType}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {topic.name}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={topic.masteryStatus}
              onChange={(e) => handleMasteryChange(e.target.value as MasteryStatus)}
              className="text-xs px-2.5 py-1 font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white"
            >
              <option value="Learning">Learning</option>
              <option value="Revising">Revising</option>
              <option value="Mastered">Mastered 🏆</option>
            </select>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Visual Revision Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Spaced Repetition Progression Timeline
            </h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {/* Day 1 Initial Learn */}
              <div className="shrink-0 text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 min-w-[90px]">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">Learned</span>
                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">{topic.firstStudiedAt}</span>
              </div>

              {topicSessions.map((s) => {
                const status = getSessionStatus(s, todayStr);
                let badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                if (status === 'COMPLETED') badgeClass = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
                if (status === 'DUE_TODAY') badgeClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 animate-pulse';
                if (status === 'OVERDUE') badgeClass = 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800';

                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className="text-slate-300 dark:text-slate-600">&rarr;</span>
                    <div className={`shrink-0 text-center p-2 rounded-lg border min-w-[95px] ${badgeClass}`}>
                      <span className="text-[10px] font-bold block">
                        Rev {s.sequenceNumber} ({status})
                      </span>
                      <span className="text-[11px] font-mono block">{s.scheduledDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Topic Invariants & Notes */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Personal Formulas & Invariant Notes
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
              {topic.notes || 'No specific notes saved.'}
            </p>
          </div>

          {/* 3. Concept / Formula Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Concept & Formula Checklist
            </h4>
            <div className="space-y-1.5 mb-2">
              {topic.checklist.length === 0 ? (
                <p className="text-xs text-slate-400">No checklist items yet. Add key lemmas, formulas, or proof steps below.</p>
              ) : (
                topic.checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleChecklist(item.id)}
                      className="rounded text-blue-600"
                    />
                    <span className={item.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}>
                      {item.text}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add formula/concept check..."
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem(); } }}
                className="flex-1 text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
              />
              <button
                onClick={addChecklistItem}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* 4. PYQ Practice Log for this topic */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              PYQ Attempt History ({topicLogs.length} attempts)
            </h4>
            {topicLogs.length === 0 ? (
              <p className="text-xs text-slate-400">No practice attempts recorded for this topic yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                {topicLogs.map(log => (
                  <div key={log.id} className="p-2.5 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{log.questionRef}</span>
                      <span className="text-[10px] text-slate-400 ml-2">({log.marks} Marks, {log.timeTakenSeconds}s)</span>
                      {log.errorCategory !== 'None' && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                          {log.errorCategory}
                        </span>
                      )}
                    </div>
                    <span className={`font-bold ${log.result === 'CORRECT' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {log.result}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={() => {
              if (confirm('Delete this topic and all its revision sessions?')) {
                onDeleteTopic(topic.id);
                onClose();
              }
            }}
            className="text-xs text-red-500 hover:text-red-700 inline-flex items-center gap-1 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Topic
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
