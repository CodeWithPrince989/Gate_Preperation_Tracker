import { Topic, RevisionSession, PracticeLog, StudyActivity, SubjectItem } from '../types';
import { DEFAULT_SUBJECTS } from './constants';
import { INITIAL_SEED_TOPICS, INITIAL_SEED_SESSIONS, INITIAL_SEED_LOGS, INITIAL_SEED_ACTIVITIES } from './seedData';
import { supabase, isSupabaseConfigured } from './supabase';

const KEYS = {
  TOPICS: 'gate_os_topics_v1',
  SESSIONS: 'gate_os_sessions_v1',
  LOGS: 'gate_os_logs_v1',
  ACTIVITIES: 'gate_os_activities_v1',
  SUBJECTS: 'gate_os_subjects_v1'
};

function getItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    console.error(`Error reading ${key}:`, e);
    return defaultVal;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key}:`, e);
  }
}

export const StorageEngine = {
  initSeedIfEmpty(): void {
    if (!localStorage.getItem(KEYS.TOPICS)) {
      setItem(KEYS.TOPICS, INITIAL_SEED_TOPICS);
      setItem(KEYS.SESSIONS, INITIAL_SEED_SESSIONS);
      setItem(KEYS.LOGS, INITIAL_SEED_LOGS);
      setItem(KEYS.ACTIVITIES, INITIAL_SEED_ACTIVITIES);
      setItem(KEYS.SUBJECTS, DEFAULT_SUBJECTS);
    }
  },

  async getTopics(): Promise<Topic[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('topics').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped: Topic[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            subjectName: d.subject_name,
            exam: d.exam,
            firstStudiedAt: d.first_studied_at,
            topicType: d.topic_type,
            learningSource: d.learning_source,
            initialConfidence: d.initial_confidence,
            estimatedDifficulty: d.estimated_difficulty,
            masteryStatus: d.mastery_status,
            notes: d.notes || '',
            resourceUrl: d.resource_url || '',
            checklist: d.checklist || [],
            createdAt: d.created_at
          }));
          setItem(KEYS.TOPICS, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
      }
    }
    return getItem<Topic[]>(KEYS.TOPICS, []);
  },

  async saveTopic(topic: Topic): Promise<void> {
    const topics = getItem<Topic[]>(KEYS.TOPICS, []);
    const idx = topics.findIndex(t => t.id === topic.id);
    if (idx >= 0) {
      topics[idx] = topic;
    } else {
      topics.unshift(topic);
    }
    setItem(KEYS.TOPICS, topics);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('topics').upsert({
          id: topic.id,
          name: topic.name,
          subject_name: topic.subjectName,
          exam: topic.exam,
          first_studied_at: topic.firstStudiedAt,
          topic_type: topic.topicType,
          learning_source: topic.learningSource,
          initial_confidence: topic.initialConfidence,
          estimated_difficulty: topic.estimatedDifficulty,
          mastery_status: topic.masteryStatus,
          notes: topic.notes,
          resource_url: topic.resourceUrl,
          checklist: topic.checklist
        });
      } catch (err) {
        console.warn('Supabase upsert topic failed:', err);
      }
    }
  },

  async deleteTopic(topicId: string): Promise<void> {
    const topics = getItem<Topic[]>(KEYS.TOPICS, []).filter(t => t.id !== topicId);
    const sessions = getItem<RevisionSession[]>(KEYS.SESSIONS, []).filter(s => s.topicId !== topicId);
    setItem(KEYS.TOPICS, topics);
    setItem(KEYS.SESSIONS, sessions);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('topics').delete().eq('id', topicId);
      } catch (err) {
        console.warn('Supabase delete topic failed:', err);
      }
    }
  },

  async getSessions(): Promise<RevisionSession[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('revision_sessions').select('*');
        if (!error && data && data.length > 0) {
          const mapped: RevisionSession[] = data.map((d: any) => ({
            id: d.id,
            topicId: d.topic_id,
            sequenceNumber: d.sequence_number,
            scheduledDate: d.scheduled_date,
            completedAt: d.completed_at,
            status: d.status,
            durationMinutes: d.duration_minutes,
            recallRating: d.recall_rating,
            questionsAttempted: d.questions_attempted,
            questionsCorrect: d.questions_correct,
            mistakesSummary: d.mistakes_summary,
            retrievalNotes: d.retrieval_notes
          }));
          setItem(KEYS.SESSIONS, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch sessions failed:', err);
      }
    }
    return getItem<RevisionSession[]>(KEYS.SESSIONS, []);
  },

  async saveSessions(newSessions: RevisionSession[]): Promise<void> {
    const sessions = getItem<RevisionSession[]>(KEYS.SESSIONS, []);
    newSessions.forEach(ns => {
      const idx = sessions.findIndex(s => s.id === ns.id);
      if (idx >= 0) sessions[idx] = ns;
      else sessions.push(ns);
    });
    setItem(KEYS.SESSIONS, sessions);

    if (isSupabaseConfigured && supabase) {
      try {
        const rows = newSessions.map(s => ({
          id: s.id,
          topic_id: s.topicId,
          sequence_number: s.sequenceNumber,
          scheduled_date: s.scheduledDate,
          completed_at: s.completedAt,
          status: s.status,
          duration_minutes: s.durationMinutes,
          recall_rating: s.recallRating,
          questions_attempted: s.questionsAttempted,
          questions_correct: s.questionsCorrect,
          mistakes_summary: s.mistakesSummary,
          retrieval_notes: s.retrievalNotes
        }));
        await supabase.from('revision_sessions').upsert(rows);
      } catch (err) {
        console.warn('Supabase upsert sessions failed:', err);
      }
    }
  },

  async getPracticeLogs(): Promise<PracticeLog[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('practice_logs').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped: PracticeLog[] = data.map((d: any) => ({
            id: d.id,
            topicId: d.topic_id,
            subjectName: d.subject_name,
            exam: d.exam,
            gateYear: d.gate_year,
            questionRef: d.question_ref,
            marks: Number(d.marks),
            result: d.result,
            timeTakenSeconds: d.time_taken_seconds,
            errorCategory: d.error_category,
            explanation: d.explanation,
            solvedIndependently: d.solved_independently,
            createdAt: d.created_at
          }));
          setItem(KEYS.LOGS, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch logs failed:', err);
      }
    }
    return getItem<PracticeLog[]>(KEYS.LOGS, []);
  },

  async savePracticeLog(log: PracticeLog): Promise<void> {
    const logs = getItem<PracticeLog[]>(KEYS.LOGS, []);
    logs.unshift(log);
    setItem(KEYS.LOGS, logs);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('practice_logs').insert({
          id: log.id,
          topic_id: log.topicId,
          subject_name: log.subjectName,
          exam: log.exam,
          gate_year: log.gateYear,
          question_ref: log.questionRef,
          marks: log.marks,
          result: log.result,
          time_taken_seconds: log.timeTakenSeconds,
          error_category: log.errorCategory,
          explanation: log.explanation,
          solved_independently: log.solvedIndependently
        });
      } catch (err) {
        console.warn('Supabase insert practice log failed:', err);
      }
    }
  },

  async getActivities(): Promise<StudyActivity[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('study_activities').select('*');
        if (!error && data && data.length > 0) {
          const mapped: StudyActivity[] = data.map((d: any) => ({
            id: d.id,
            activityDate: d.activity_date,
            activityType: d.activity_type,
            durationMinutes: d.duration_minutes,
            referenceId: d.reference_id
          }));
          setItem(KEYS.ACTIVITIES, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch activities failed:', err);
      }
    }
    return getItem<StudyActivity[]>(KEYS.ACTIVITIES, []);
  },

  async recordActivity(act: StudyActivity): Promise<void> {
    const acts = getItem<StudyActivity[]>(KEYS.ACTIVITIES, []);
    acts.push(act);
    setItem(KEYS.ACTIVITIES, acts);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_activities').insert({
          id: act.id,
          activity_date: act.activityDate,
          activity_type: act.activityType,
          duration_minutes: act.durationMinutes,
          reference_id: act.referenceId
        });
      } catch (err) {
        console.warn('Supabase insert study activity failed:', err);
      }
    }
  },

  async getSubjects(): Promise<SubjectItem[]> {
    return getItem<SubjectItem[]>(KEYS.SUBJECTS, DEFAULT_SUBJECTS);
  },

  async addSubject(name: string, exam: 'CSE' | 'DA' | 'BOTH'): Promise<void> {
    const subjects = getItem<SubjectItem[]>(KEYS.SUBJECTS, DEFAULT_SUBJECTS);
    if (!subjects.some(s => s.name.toLowerCase() === name.toLowerCase() && s.exam === exam)) {
      subjects.push({ id: crypto.randomUUID(), name, exam, isCustom: true });
      setItem(KEYS.SUBJECTS, subjects);
    }
  },

  exportJSON(): string {
    return JSON.stringify({
      topics: getItem(KEYS.TOPICS, []),
      sessions: getItem(KEYS.SESSIONS, []),
      practiceLogs: getItem(KEYS.LOGS, []),
      activities: getItem(KEYS.ACTIVITIES, []),
      subjects: getItem(KEYS.SUBJECTS, []),
      exportDate: new Date().toISOString()
    }, null, 2);
  },

  importJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.topics) setItem(KEYS.TOPICS, parsed.topics);
      if (parsed.sessions) setItem(KEYS.SESSIONS, parsed.sessions);
      if (parsed.practiceLogs) setItem(KEYS.LOGS, parsed.practiceLogs);
      if (parsed.activities) setItem(KEYS.ACTIVITIES, parsed.activities);
      if (parsed.subjects) setItem(KEYS.SUBJECTS, parsed.subjects);
      return true;
    } catch (e) {
      console.error('Failed import', e);
      return false;
    }
  },

  resetToDefaultSeed(): void {
    localStorage.removeItem(KEYS.TOPICS);
    localStorage.removeItem(KEYS.SESSIONS);
    localStorage.removeItem(KEYS.LOGS);
    localStorage.removeItem(KEYS.ACTIVITIES);
    localStorage.removeItem(KEYS.SUBJECTS);
    this.initSeedIfEmpty();
  }
};
