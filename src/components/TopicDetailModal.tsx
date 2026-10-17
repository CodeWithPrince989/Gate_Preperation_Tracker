import React, { useState } from 'react';
import { X, Trash2, Plus, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-[#08090D]/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#101218] border border-[#272C38] rounded-t-3xl sm:rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-10 h-1 bg-[#272C38] rounded-full mx-auto my-2" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#272C38] bg-[#161922]/60">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#737B8C]">
              <span className="font-mono font-semibold text-[#8B9CFF]">{topic.exam}</span>
              <span aria-hidden="true">&bull;</span>
              <span>{topic.subjectName}</span>
              <span aria-hidden="true">&bull;</span>
              <span>{topic.topicType}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#F5F7FA] mt-0.5 line-clamp-1">
              {topic.name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={topic.masteryStatus}
              onChange={(e) => handleMasteryChange(e.target.value as MasteryStatus)}
              className="text-xs px-2.5 py-1.5 font-semibold rounded-lg border border-[#272C38] bg-[#161922] text-[#F5F7FA] outline-hidden"
            >
              <option value="Learning">Learning</option>
              <option value="Revising">Revising</option>
              <option value="Mastered">Mastered 🏆</option>
            </select>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#737B8C] hover:text-[#F5F7FA] hover:bg-[#1C202B] transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. Spaced Repetition Timeline */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737B8C] mb-3">
              Spaced Repetition Progression Timeline
            </h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2">
              {/* Day 1 Initial Learn */}
              <div className="shrink-0 text-center p-2.5 rounded-xl bg-[#161922] border border-[#42D6A4]/40 min-w-[95px]">
                <span className="text-[10px] font-bold text-[#42D6A4] block uppercase tracking-wide">Learned</span>
                <span className="text-[11px] font-mono text-[#F5F7FA] tabular-nums mt-0.5 block">{topic.firstStudiedAt}</span>
              </div>

              {topicSessions.map((s) => {
                const status = getSessionStatus(s, todayStr);
                let badgeClass = 'bg-[#161922] text-[#A1A8B7] border-[#272C38]';
                let labelColor = 'text-[#737B8C]';
                if (status === 'COMPLETED') {
                  badgeClass = 'bg-[#183D31] text-[#42D6A4] border-[#235E4B]';
                  labelColor = 'text-[#42D6A4]';
                } else if (status === 'DUE_TODAY') {
                  badgeClass = 'bg-[#1C202B] text-[#8B9CFF] border-[#8B9CFF]/50 ring-1 ring-[#8B9CFF]/30';
                  labelColor = 'text-[#8B9CFF] font-bold';
                } else if (status === 'OVERDUE') {
                  badgeClass = 'bg-[#2A181C] text-[#FF727C] border-[#FF727C]/40';
                  labelColor = 'text-[#FF727C] font-bold';
                }

                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className="text-[#272C38]">&rarr;</span>
                    <div className={`shrink-0 text-center p-2.5 rounded-xl border min-w-[95px] ${badgeClass}`}>
                      <span className={`text-[10px] uppercase tracking-wide block ${labelColor}`}>
                        Rev {s.sequenceNumber} ({status === 'DUE_TODAY' ? 'Due' : status.toLowerCase()})
                      </span>
                      <span className="text-[11px] font-mono tabular-nums mt-0.5 block">{s.scheduledDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Personal Formulas & Invariant Notes */}
          <div className="bg-[#161922] p-4 rounded-xl border border-[#272C38]">
            <h4 className="text-xs font-semibold text-[#8B9CFF] mb-1">
              Personal Formulas & Invariants
            </h4>
            <p className="text-xs text-[#F5F7FA] whitespace-pre-wrap leading-relaxed font-mono">
              {topic.notes || 'No specific invariant notes recorded yet.'}
            </p>
          </div>

          {/* 3. Concept / Formula Checklist */}
          <div>
            <h4 className="text-xs font-semibold text-[#F5F7FA] mb-2">
              Concept & Formula Verification Checklist
            </h4>
            <div className="space-y-1.5 mb-3">
              {topic.checklist.length === 0 ? (
                <p className="text-xs text-[#737B8C]">No checklist items yet. Add formulas or proof checks below.</p>
              ) : (
                topic.checklist.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-[#161922] border border-[#272C38] cursor-pointer hover:border-[#737B8C] transition text-xs"
                  >
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                      item.done ? 'bg-[#42D6A4] border-[#42D6A4] text-[#08090D]' : 'border-[#737B8C]'
                    }`}>
                      {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={item.done ? 'line-through text-[#737B8C]' : 'text-[#F5F7FA]'}>
                      {item.text}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add formula or concept check..."
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem(); } }}
                className="flex-1 text-xs p-2.5 border border-[#272C38] rounded-xl bg-[#161922] text-[#F5F7FA] outline-hidden placeholder-[#737B8C]"
              />
              <button
                onClick={addChecklistItem}
                className="px-3.5 py-2 bg-[#1C202B] hover:bg-[#272C38] text-[#F5F7FA] text-xs font-semibold rounded-xl border border-[#272C38] transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* 4. PYQ Practice Log for this topic */}
          <div>
            <h4 className="text-xs font-semibold text-[#F5F7FA] mb-2">
              Topic PYQ Attempt History ({topicLogs.length})
            </h4>
            {topicLogs.length === 0 ? (
              <p className="text-xs text-[#737B8C]">No practice attempts recorded for this topic yet.</p>
            ) : (
              <div className="divide-y divide-[#272C38] border border-[#272C38] rounded-xl overflow-hidden bg-[#161922]">
                {topicLogs.map(log => (
                  <div key={log.id} className="p-3 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#F5F7FA]">{log.questionRef}</span>
                      <span className="text-[11px] text-[#737B8C] ml-2 tabular-nums">({log.marks}M, {log.timeTakenSeconds}s)</span>
                      {log.errorCategory !== 'None' && (
                        <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] bg-[#FF727C]/20 text-[#FF727C] font-mono">
                          {log.errorCategory}
                        </span>
                      )}
                    </div>
                    <span className={`font-mono text-xs font-bold ${log.result === 'CORRECT' ? 'text-[#42D6A4]' : 'text-[#FF727C]'}`}>
                      {log.result}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#272C38] flex justify-between items-center bg-[#161922]/60">
          <button
            onClick={() => {
              if (confirm('Delete this topic and all its revision sessions?')) {
                onDeleteTopic(topic.id);
                onClose();
              }
            }}
            className="text-xs text-[#FF727C] hover:text-[#ff929a] inline-flex items-center gap-1.5 font-semibold min-h-[44px]"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Topic
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1C202B] hover:bg-[#272C38] text-[#F5F7FA] rounded-xl text-xs font-semibold transition min-h-[44px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
