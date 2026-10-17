import { Topic, RevisionSession, PracticeLog, StudyActivity, SubjectItem } from '../types';
import { DEFAULT_SUBJECTS } from './constants';
import { getFreshSeedData } from './seedData';
import { supabase, isSupabaseConfigured } from './supabase';
import { format, subDays, addDays } from 'date-fns';

const KEYS = {
  TOPICS: 'gate_os_topics_v1',
  SESSIONS: 'gate_os_sessions_v1',
  LOGS: 'gate_os_logs_v1',
  ACTIVITIES: 'gate_os_activities_v1',
  SUBJECTS: 'gate_os_subjects_v1',
  STORAGE_MODE: 'gate_os_storage_mode_v1'
};

export type StorageMode = 'local' | 'cloud';

function getItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return defaultVal;
    return JSON.parse(raw);
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

// Ensure demo seed sessions are synchronized relative to the user's real browser today
function syncSeedSessionDates(sessions: RevisionSession[]): RevisionSession[] {
  if (!sessions || sessions.length === 0) return [];
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const twoDaysAgo = format(subDays(today, 2), 'yyyy-MM-dd');
  const tomorrow = format(addDays(today, 1), 'yyyy-MM-dd');
  const sixDaysAgo = format(subDays(today, 6), 'yyyy-MM-dd');

  return sessions.map(s => {
    if (s.id === 'ses-1' || s.id === '22222222-2222-2222-2222-222222222201') {
      return { ...s, scheduledDate: todayStr };
    }
    if (s.id === 'ses-2' || s.id === '22222222-2222-2222-2222-222222222202') {
      return { ...s, scheduledDate: twoDaysAgo };
    }
    if (s.id === 'ses-3' || s.id === '22222222-2222-2222-2222-222222222203') {
      return { ...s, scheduledDate: todayStr };
    }
    if (s.id === 'ses-4' || s.id === '22222222-2222-2222-2222-222222222204') {
      return { ...s, scheduledDate: tomorrow };
    }
    if (s.id === 'ses-hist-1' || s.id === '22222222-2222-2222-2222-222222222205') {
      return { ...s, scheduledDate: sixDaysAgo, status: 'COMPLETED' };
    }
    return s;
  });
}

// Ensure activities are returned without injecting synthetic data when user has 0 activities
function syncSeedActivities(acts: StudyActivity[]): StudyActivity[] {
  if (!acts || acts.length === 0) return [];
  return acts;
}

export const StorageEngine = {
  getStorageMode(): StorageMode {
    const saved = localStorage.getItem(KEYS.STORAGE_MODE) as StorageMode | null;
    if (saved === 'local' || saved === 'cloud') return saved;
    // Default to local if Supabase is not configured or user hasn't explicitly set cloud
    return isSupabaseConfigured ? 'cloud' : 'local';
  },

  setStorageMode(mode: StorageMode): void {
    localStorage.setItem(KEYS.STORAGE_MODE, mode);
  },

  // Initialize storage for brand-new user with zero initial data
  initSeedIfEmpty(): void {
    // If no prior records exist in localStorage, initialize clean empty arrays
    if (localStorage.getItem(KEYS.TOPICS) === null) {
      setItem(KEYS.TOPICS, []);
    }
    if (localStorage.getItem(KEYS.SESSIONS) === null) {
      setItem(KEYS.SESSIONS, []);
    }
    if (localStorage.getItem(KEYS.LOGS) === null) {
      setItem(KEYS.LOGS, []);
    }
    if (localStorage.getItem(KEYS.ACTIVITIES) === null) {
      setItem(KEYS.ACTIVITIES, []);
    }
    if (localStorage.getItem(KEYS.SUBJECTS) === null) {
      setItem(KEYS.SUBJECTS, DEFAULT_SUBJECTS);
    }
  },

  async getTopics(): Promise<Topic[]> {
    const mode = this.getStorageMode();

    if (mode === 'cloud') {
      // 1. Try Express API
      try {
        const res = await fetch('/api/topics');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
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
        }
      } catch {
        // network/server fallback
      }

      // 2. Try direct Supabase
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('topics').select('*').order('created_at', { ascending: false });
          if (!error && Array.isArray(data)) {
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
    }

    // Local Mode: returns exactly what is saved, initializing to [] if empty
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

    if (this.getStorageMode() === 'cloud') {
      const payload = {
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
      };

      try {
        await fetch('/api/topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return;
      } catch {
        // ignore
      }

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('topics').upsert(payload);
        } catch (err) {
          console.warn('Supabase upsert topic failed:', err);
        }
      }
    }
  },

  async deleteTopic(topicId: string): Promise<void> {
    const topics = getItem<Topic[]>(KEYS.TOPICS, []).filter(t => t.id !== topicId);
    const sessions = getItem<RevisionSession[]>(KEYS.SESSIONS, []).filter(s => s.topicId !== topicId);
    setItem(KEYS.TOPICS, topics);
    setItem(KEYS.SESSIONS, sessions);

    if (this.getStorageMode() === 'cloud') {
      try {
        await fetch(`/api/topics/${topicId}`, { method: 'DELETE' });
        return;
      } catch {
        // ignore
      }

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('topics').delete().eq('id', topicId);
        } catch (err) {
          console.warn('Supabase delete topic failed:', err);
        }
      }
    }
  },

  async getSessions(): Promise<RevisionSession[]> {
    const mode = this.getStorageMode();

    if (mode === 'cloud') {
      try {
        const res = await fetch('/api/sessions');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
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
            const synced = syncSeedSessionDates(mapped);
            setItem(KEYS.SESSIONS, synced);
            return synced;
          }
        }
      } catch {
        // ignore
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('revision_sessions').select('*');
          if (!error && Array.isArray(data)) {
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
            const synced = syncSeedSessionDates(mapped);
            setItem(KEYS.SESSIONS, synced);
            return synced;
          }
        } catch (err) {
          console.warn('Supabase fetch sessions failed:', err);
        }
      }
    }

    const local = getItem<RevisionSession[]>(KEYS.SESSIONS, []);
    return syncSeedSessionDates(local);
  },

  async saveSessions(newSessions: RevisionSession[]): Promise<void> {
    const sessions = getItem<RevisionSession[]>(KEYS.SESSIONS, []);
    newSessions.forEach(ns => {
      const idx = sessions.findIndex(s => s.id === ns.id);
      if (idx >= 0) sessions[idx] = ns;
      else sessions.push(ns);
    });
    setItem(KEYS.SESSIONS, sessions);

    if (this.getStorageMode() === 'cloud') {
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

      try {
        await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rows)
        });
        return;
      } catch {
        // ignore
      }

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('revision_sessions').upsert(rows);
        } catch (err) {
          console.warn('Supabase upsert sessions failed:', err);
        }
      }
    }
  },

  async getPracticeLogs(): Promise<PracticeLog[]> {
    const mode = this.getStorageMode();

    if (mode === 'cloud') {
      try {
        const res = await fetch('/api/practice-logs');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
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
        }
      } catch {
        // ignore
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('practice_logs').select('*').order('created_at', { ascending: false });
          if (!error && Array.isArray(data)) {
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
    }

    return getItem<PracticeLog[]>(KEYS.LOGS, []);
  },

  async savePracticeLog(log: PracticeLog): Promise<void> {
    const logs = getItem<PracticeLog[]>(KEYS.LOGS, []);
    logs.unshift(log);
    setItem(KEYS.LOGS, logs);

    if (this.getStorageMode() === 'cloud') {
      const payload = {
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
      };

      try {
        await fetch('/api/practice-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return;
      } catch {
        // ignore
      }

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('practice_logs').insert(payload);
        } catch (err) {
          console.warn('Supabase insert practice log failed:', err);
        }
      }
    }
  },

  async getActivities(): Promise<StudyActivity[]> {
    const mode = this.getStorageMode();
    let currentActs: StudyActivity[] = [];

    if (mode === 'cloud') {
      try {
        const res = await fetch('/api/activities');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            currentActs = data.map((d: any) => ({
              id: d.id,
              activityDate: d.activity_date,
              activityType: d.activity_type,
              durationMinutes: d.duration_minutes,
              referenceId: d.reference_id
            }));
          }
        }
      } catch {
        // ignore
      }

      if (currentActs.length === 0 && isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('study_activities').select('*');
          if (!error && Array.isArray(data)) {
            currentActs = data.map((d: any) => ({
              id: d.id,
              activityDate: d.activity_date,
              activityType: d.activity_type,
              durationMinutes: d.duration_minutes,
              referenceId: d.reference_id
            }));
          }
        } catch (err) {
          console.warn('Supabase fetch activities failed:', err);
        }
      }
    }

    if (currentActs.length === 0) {
      currentActs = getItem<StudyActivity[]>(KEYS.ACTIVITIES, []);
    }

    const synced = syncSeedActivities(currentActs);
    setItem(KEYS.ACTIVITIES, synced);
    return synced;
  },

  async recordActivity(act: StudyActivity): Promise<void> {
    const acts = getItem<StudyActivity[]>(KEYS.ACTIVITIES, []);
    acts.push(act);
    setItem(KEYS.ACTIVITIES, acts);

    if (this.getStorageMode() === 'cloud') {
      const payload = {
        id: act.id,
        activity_date: act.activityDate,
        activity_type: act.activityType,
        duration_minutes: act.durationMinutes,
        reference_id: act.referenceId
      };

      try {
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return;
      } catch {
        // ignore
      }

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('study_activities').insert(payload);
        } catch (err) {
          console.warn('Supabase insert study activity failed:', err);
        }
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
      if (Array.isArray(parsed.topics)) setItem(KEYS.TOPICS, parsed.topics);
      if (Array.isArray(parsed.sessions)) setItem(KEYS.SESSIONS, parsed.sessions);
      if (Array.isArray(parsed.practiceLogs)) setItem(KEYS.LOGS, parsed.practiceLogs);
      if (Array.isArray(parsed.activities)) setItem(KEYS.ACTIVITIES, parsed.activities);
      if (Array.isArray(parsed.subjects)) setItem(KEYS.SUBJECTS, parsed.subjects);
      return true;
    } catch (e) {
      console.error('Failed import', e);
      return false;
    }
  },

  // Reset to brand-new user state: completely empty arrays
  resetToEmpty(): void {
    setItem(KEYS.TOPICS, []);
    setItem(KEYS.SESSIONS, []);
    setItem(KEYS.LOGS, []);
    setItem(KEYS.ACTIVITIES, []);
    setItem(KEYS.SUBJECTS, DEFAULT_SUBJECTS);
  },

  // Manual action to populate sample syllabus and demo records
  loadSampleData(): void {
    const fresh = getFreshSeedData();
    setItem(KEYS.TOPICS, fresh.topics);
    setItem(KEYS.SESSIONS, fresh.sessions);
    setItem(KEYS.LOGS, fresh.practiceLogs);
    setItem(KEYS.ACTIVITIES, fresh.activities);
    setItem(KEYS.SUBJECTS, DEFAULT_SUBJECTS);

    if (this.getStorageMode() === 'cloud') {
      fetch('/api/seed', { method: 'POST' }).catch(() => {});
    }
  },

  resetToDefaultSeed(): void {
    this.loadSampleData();
  },

  resetToFreshSeed(): void {
    this.loadSampleData();
  }
};
