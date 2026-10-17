import React, { useState } from 'react';
import { Plus, Search, Filter, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { Topic, RevisionSession, ExamType, MasteryStatus } from '../types';

interface TopicsViewProps {
  topics: Topic[];
  sessions: RevisionSession[];
  examFilter: ExamType;
  onOpenAddTopic: () => void;
  onSelectTopic: (topic: Topic) => void;
}

export const TopicsView: React.FC<TopicsViewProps> = ({
  topics,
  sessions,
  examFilter,
  onOpenAddTopic,
  onSelectTopic
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedMastery, setSelectedMastery] = useState<string>('ALL');

  // Extract unique subjects
  const subjectsList = Array.from(new Set(topics.map(t => t.subjectName))).sort();

  const filtered = topics.filter(t => {
    const matchExam = examFilter === 'BOTH' || t.exam === 'BOTH' || t.exam === examFilter;
    const matchSubject = selectedSubject === 'ALL' || t.subjectName === selectedSubject;
    const matchMastery = selectedMastery === 'ALL' || t.masteryStatus === selectedMastery;
    const matchSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchExam && matchSubject && matchMastery && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" /> Syllabus Topics & Memory Retention
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tracked concepts, revision timelines, and checklist lemmas across GATE CSE & DA.
          </p>
        </div>

        <button
          onClick={onOpenAddTopic}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Topic
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search topic name, subject, or formula notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-hidden cursor-pointer"
            >
              <option value="ALL">All Subjects</option>
              {subjectsList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1">
            <select
              value={selectedMastery}
              onChange={e => setSelectedMastery(e.target.value)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-hidden cursor-pointer"
            >
              <option value="ALL">All Mastery Levels</option>
              <option value="Learning">Learning</option>
              <option value="Revising">Revising</option>
              <option value="Mastered">Mastered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold">No topics match your current filter.</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the search query or subject filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(topic => {
            const topicSessions = sessions.filter(s => s.topicId === topic.id);
            const completedCount = topicSessions.filter(s => s.status === 'COMPLETED').length;
            const completedChecklist = topic.checklist.filter(c => c.done).length;

            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 p-4 rounded-xl cursor-pointer transition shadow-2xs flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {topic.exam}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      topic.masteryStatus === 'Mastered'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : topic.masteryStatus === 'Revising'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {topic.masteryStatus}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition line-clamp-2">
                    {topic.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{topic.subjectName}</p>

                  {topic.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded">
                      &ldquo;{topic.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5" title="Completed Revisions">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{completedCount}/{topicSessions.length} Revs</span>
                  </div>

                  {topic.checklist.length > 0 && (
                    <span title="Formulas Checked">
                      {completedChecklist}/{topic.checklist.length} checks
                    </span>
                  )}

                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{topic.firstStudiedAt}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
