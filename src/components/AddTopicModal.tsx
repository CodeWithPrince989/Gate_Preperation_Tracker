import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { ExamType, TopicType, LearningSource, ConfidenceLevel, DifficultyLevel, Topic, RevisionSession, SubjectItem } from '../types';
import { generateInitialSchedule, formatDateKey } from '../lib/scheduler';

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectItem[];
  onSave: (topic: Topic, sessions: RevisionSession[]) => void;
}

export const AddTopicModal: React.FC<AddTopicModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onSave
}) => {
  const [name, setName] = useState('');
  const [exam, setExam] = useState<ExamType>('CSE');
  const [subjectName, setSubjectName] = useState(subjects[0]?.name || 'Databases');
  const [firstStudiedAt, setFirstStudiedAt] = useState(formatDateKey(new Date()));
  const [topicType, setTopicType] = useState<TopicType>('Mixed');
  const [learningSource, setLearningSource] = useState<LearningSource>('Lecture');
  const [initialConfidence, setInitialConfidence] = useState<ConfidenceLevel>('Medium');
  const [estimatedDifficulty, setEstimatedDifficulty] = useState<DifficultyLevel>('Medium');
  const [notes, setNotes] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');

  if (!isOpen) return null;

  const filteredSubjects = subjects.filter(s => exam === 'BOTH' || s.exam === 'BOTH' || s.exam === exam);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const topicId = crypto.randomUUID();
    const newTopic: Topic = {
      id: topicId,
      name: name.trim(),
      subjectName,
      exam,
      firstStudiedAt,
      topicType,
      learningSource,
      initialConfidence,
      estimatedDifficulty,
      masteryStatus: 'Learning',
      notes,
      resourceUrl,
      checklist: [],
      createdAt: new Date().toISOString()
    };

    const scheduledSessions = generateInitialSchedule(topicId, firstStudiedAt);
    onSave(newTopic, scheduledSessions);
    // Reset form
    setName('');
    setNotes('');
    setResourceUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#08090D]/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#101218] border border-[#272C38] rounded-t-3xl sm:rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl max-h-[90dvh] sm:max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-10 h-1 bg-[#272C38] rounded-full mx-auto my-2" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#272C38] bg-[#161922]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#8B9CFF]/10 border border-[#8B9CFF]/20 text-[#8B9CFF] flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#F5F7FA]">
                Add Topic for Spaced Recall
              </h2>
              <span className="text-[11px] text-[#737B8C]">
                Auto-generates standard 7-session spaced intervals
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#737B8C] hover:text-[#F5F7FA] hover:bg-[#1C202B] transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Topic Name */}
          <div>
            <label className="block text-xs font-semibold text-[#F5F7FA] mb-1">
              Topic Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. B-Trees and B+ Trees Indexing"
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] placeholder-[#737B8C] focus:ring-1 focus:ring-[#8B9CFF] focus:border-[#8B9CFF] outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Exam */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A8B7] mb-1">
                Target Exam
              </label>
              <select
                value={exam}
                onChange={(e) => {
                  const newExam = e.target.value as ExamType;
                  setExam(newExam);
                  const firstValid = subjects.find(s => newExam === 'BOTH' || s.exam === 'BOTH' || s.exam === newExam);
                  if (firstValid) setSubjectName(firstValid.name);
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] outline-hidden"
              >
                <option value="CSE">GATE CSE</option>
                <option value="DA">GATE DA</option>
                <option value="BOTH">Both (Common)</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A8B7] mb-1">
                Subject
              </label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] outline-hidden truncate"
              >
                {filteredSubjects.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* First Studied Date */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A8B7] mb-1">
                Day 1 (First Studied)
              </label>
              <input
                type="date"
                required
                value={firstStudiedAt}
                onChange={(e) => setFirstStudiedAt(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] font-mono outline-hidden"
              />
            </div>

            {/* Topic Type */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A8B7] mb-1">
                Topic Nature
              </label>
              <select
                value={topicType}
                onChange={(e) => setTopicType(e.target.value as TopicType)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] outline-hidden"
              >
                <option value="Numerical">Numerical Problem Solving</option>
                <option value="Theory">Core Theoretical Concept</option>
                <option value="Programming">Programming & Data Structs</option>
                <option value="Mixed">Mixed (Theory + Problems)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#737B8C] mb-1">Source</label>
              <select
                value={learningSource}
                onChange={(e) => setLearningSource(e.target.value as LearningSource)}
                className="w-full text-xs p-2 rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] outline-hidden"
              >
                <option value="Lecture">Lecture</option>
                <option value="Book">Standard Book</option>
                <option value="Notes">Short Notes</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#737B8C] mb-1">Confidence</label>
              <select
                value={initialConfidence}
                onChange={(e) => setInitialConfidence(e.target.value as ConfidenceLevel)}
                className="w-full text-xs p-2 rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] outline-hidden"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#737B8C] mb-1">Difficulty</label>
              <select
                value={estimatedDifficulty}
                onChange={(e) => setEstimatedDifficulty(e.target.value as DifficultyLevel)}
                className="w-full text-xs p-2 rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] outline-hidden"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#A1A8B7] mb-1">
              Personal Formulas & Invariants
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Crucial equations, edge cases, or minimal keys..."
              className="w-full text-xs p-3 rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] placeholder-[#737B8C] focus:ring-1 focus:ring-[#8B9CFF] outline-hidden font-mono"
            />
          </div>

          {/* Actions */}
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
              Save & Auto-Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
