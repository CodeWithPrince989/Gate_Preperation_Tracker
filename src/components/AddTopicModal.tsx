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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" /> Add Topic for Spaced Repetition
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Topic Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topic Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. B-Trees and B+ Trees Indexing"
              className="w-full text-sm p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Exam */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                className="w-full text-sm p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
              >
                <option value="CSE">GATE CSE</option>
                <option value="DA">GATE DA</option>
                <option value="BOTH">Both (Common)</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full text-sm p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
              >
                {filteredSubjects.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* First Studied Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date First Studied (Day 1)
              </label>
              <input
                type="date"
                required
                value={firstStudiedAt}
                onChange={(e) => setFirstStudiedAt(e.target.value)}
                className="w-full text-sm p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Topic Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Topic Type
              </label>
              <select
                value={topicType}
                onChange={(e) => setTopicType(e.target.value as TopicType)}
                className="w-full text-sm p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
              >
                <option value="Theory">Theory</option>
                <option value="Numerical">Numerical</option>
                <option value="Programming">Programming</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Source</label>
              <select
                value={learningSource}
                onChange={(e) => setLearningSource(e.target.value as LearningSource)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
              >
                <option value="Lecture">Lecture</option>
                <option value="Book">Book</option>
                <option value="Notes">Notes</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confidence</label>
              <select
                value={initialConfidence}
                onChange={(e) => setInitialConfidence(e.target.value as ConfidenceLevel)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
              <select
                value={estimatedDifficulty}
                onChange={(e) => setEstimatedDifficulty(e.target.value as DifficultyLevel)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Short Invariant Notes / Formulas
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Crucial takeaway or formula to recall..."
              className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
            />
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
              Create Topic & Auto-Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
