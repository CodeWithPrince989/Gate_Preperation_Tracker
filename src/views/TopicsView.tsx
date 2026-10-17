import React, { useState } from 'react';
import { Plus, Search, Filter, BookOpen, Sparkles, CheckSquare, Clock, ArrowRight, RotateCcw } from 'lucide-react';
import { Topic, RevisionSession, ExamType } from '../types';

interface TopicsViewProps {
  topics: Topic[];
  sessions: RevisionSession[];
  examFilter: ExamType;
  onOpenAddTopic: () => void;
  onSelectTopic: (topic: Topic) => void;
  onLoadSampleData?: () => void;
}

export const TopicsView: React.FC<TopicsViewProps> = ({
  topics,
  sessions,
  examFilter,
  onOpenAddTopic,
  onSelectTopic,
  onLoadSampleData
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

  // ==========================================
  // BRAND-NEW USER ZERO TOPICS EMPTY STATE
  // ==========================================
  if (topics.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#161922] border border-[#272C38] flex items-center justify-center mx-auto mb-4 text-[#8B9CFF]">
            <BookOpen className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161922] border border-[#272C38] text-[11px] font-mono text-[#8B9CFF] mb-3">
            <span>Syllabus Management</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">
            No GATE Topics in Your Syllabus Yet
          </h2>

          <p className="text-xs sm:text-sm text-[#A1A8B7] max-w-lg mx-auto mt-2 leading-relaxed">
            Start structuring your revision roadmap. Add core subjects like Operating Systems, DBMS, Linear Algebra, Machine Learning, or Discrete Mathematics. The OS will automatically create spaced repetition milestones (Day 1, 3, 7, 15, and 30) and track key theorem checklists.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={onOpenAddTopic}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Your First Topic</span>
            </button>

            {onLoadSampleData && (
              <button
                onClick={onLoadSampleData}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#161922] hover:bg-[#1C202B] text-[#A1A8B7] hover:text-[#F5F7FA] border border-[#272C38] font-semibold text-xs rounded-xl transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8B9CFF]" />
                <span>Load Sample GATE Topics</span>
              </button>
            )}
          </div>

          {/* Quick Features Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left mt-10 pt-8 border-t border-[#272C38]">
            <div className="p-3.5 rounded-xl bg-[#161922] border border-[#272C38]">
              <span className="text-[11px] font-mono text-[#8B9CFF] block mb-1">01 / Intervals</span>
              <strong className="text-xs text-[#F5F7FA] block mb-1">Spaced Repetition</strong>
              <span className="text-[11px] text-[#737B8C]">
                Calculated intervals at 1, 3, 7, 15, and 30 days.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161922] border border-[#272C38]">
              <span className="text-[11px] font-mono text-[#42D6A4] block mb-1">02 / Checklists</span>
              <strong className="text-xs text-[#F5F7FA] block mb-1">Formula Verification</strong>
              <span className="text-[11px] text-[#737B8C]">
                Break topics down into key proofs and algorithm steps.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161922] border border-[#272C38]">
              <span className="text-[11px] font-mono text-[#F5BE65] block mb-1">03 / Retrieval</span>
              <strong className="text-xs text-[#F5F7FA] block mb-1">Active Recall</strong>
              <span className="text-[11px] text-[#737B8C]">
                Timed closed-book recall before reading notes.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TOPICS LIST & FILTER VIEW
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#101218] p-5 rounded-2xl border border-[#272C38] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#8B9CFF]" />
              Syllabus Topics &amp; Retention
            </h2>
            <span className="text-xs text-[#737B8C]" aria-hidden="true">&bull;</span>
            <span className="text-xs text-[#A1A8B7] font-mono tabular-nums">
              {filtered.length} of {topics.length} topics
            </span>
          </div>
          <p className="text-xs text-[#737B8C] mt-1">
            Tracked concepts, formula checklists, and spaced repetition schedules across GATE CSE &amp; DA.
          </p>
        </div>

        <button
          onClick={onOpenAddTopic}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] rounded-xl text-xs font-bold transition shadow-xs self-start md:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Topic</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#101218] p-4 rounded-2xl border border-[#272C38] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#737B8C] absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search topic name, subject, or formula notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#272C38] bg-[#161922] text-[#F5F7FA] placeholder-[#737B8C] focus:ring-1 focus:ring-[#8B9CFF] focus:border-[#8B9CFF] outline-hidden transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 bg-[#161922] border border-[#272C38] rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-[#737B8C]" />
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="bg-transparent text-xs text-[#A1A8B7] focus:text-[#F5F7FA] outline-hidden cursor-pointer"
            >
              <option value="ALL">All Subjects</option>
              {subjectsList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#161922] border border-[#272C38] rounded-xl px-3 py-1.5">
            <select
              value={selectedMastery}
              onChange={e => setSelectedMastery(e.target.value)}
              className="bg-transparent text-xs text-[#A1A8B7] focus:text-[#F5F7FA] outline-hidden cursor-pointer"
            >
              <option value="ALL">All Mastery</option>
              <option value="Learning">Learning</option>
              <option value="Revising">Revising</option>
              <option value="Mastered">Mastered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filtered Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-12 text-center text-[#737B8C]">
          <Search className="w-10 h-10 mx-auto mb-3 text-[#737B8C]/60" />
          <h3 className="text-sm font-semibold text-[#F5F7FA]">No matching topics found</h3>
          <p className="text-xs text-[#737B8C] mt-1 max-w-sm mx-auto">
            No syllabus topics match your active search &ldquo;{searchQuery}&rdquo; or filter settings.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSubject('ALL');
              setSelectedMastery('ALL');
            }}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#161922] border border-[#272C38] text-[#8B9CFF] hover:bg-[#1C202B] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(topic => {
            const topicSessions = sessions.filter(s => s.topicId === topic.id);
            const completedCount = topicSessions.filter(s => s.status === 'COMPLETED').length;
            const nextPending = topicSessions
              .filter(s => s.status === 'PENDING')
              .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))[0];

            const completedChecklist = topic.checklist.filter(c => c.done).length;

            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                className="bg-[#101218] border border-[#272C38] hover:border-[#3B4254] p-5 rounded-2xl flex flex-col justify-between transition cursor-pointer group shadow-2xs"
              >
                <div>
                  {/* Unboxed Metadata Header */}
                  <div className="flex items-center justify-between text-xs text-[#737B8C] mb-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[#8B9CFF] font-semibold">{topic.exam}</span>
                      <span aria-hidden="true">&bull;</span>
                      <span className="truncate">{topic.subjectName}</span>
                    </div>
                    <span
                      className={`text-[11px] font-mono font-semibold ${
                        topic.masteryStatus === 'Mastered'
                          ? 'text-[#42D6A4]'
                          : topic.masteryStatus === 'Revising'
                          ? 'text-[#8B9CFF]'
                          : 'text-[#F5BE65]'
                      }`}
                    >
                      {topic.masteryStatus}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#F5F7FA] group-hover:text-[#8B9CFF] transition line-clamp-2">
                    {topic.name}
                  </h3>

                  {topic.notes && (
                    <p className="text-xs text-[#737B8C] line-clamp-2 mt-2 leading-relaxed">
                      {topic.notes}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-[#272C38] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#737B8C]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#8B9CFF]" />
                      <span>Next:</span>
                      <span className="font-mono text-[#F5F7FA] tabular-nums font-semibold">
                        {nextPending ? nextPending.scheduledDate : 'All Done'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="text-[#A1A8B7] tabular-nums">
                        {completedCount} / {topicSessions.length} Revs
                      </span>
                    </div>
                  </div>

                  {topic.checklist.length > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-[#737B8C] pt-1">
                      <span className="flex items-center gap-1 text-[#A1A8B7]">
                        <CheckSquare className="w-3 h-3 text-[#42D6A4]" /> Formula Checklist
                      </span>
                      <span className="font-mono tabular-nums text-[#42D6A4]">
                        {completedChecklist}/{topic.checklist.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
