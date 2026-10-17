import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './views/DashboardView';
import { TopicsView } from './views/TopicsView';
import { PYQTrackerView } from './views/PYQTrackerView';
import { DailyPlannerView } from './views/DailyPlannerView';
import { CalendarView } from './views/CalendarView';
import { SettingsView } from './views/SettingsView';
import { RevisionRunnerModal } from './components/RevisionRunnerModal';
import { AddTopicModal } from './components/AddTopicModal';
import { TopicDetailModal } from './components/TopicDetailModal';
import { StorageEngine } from './lib/storage';
import { isSupabaseConfigured } from './lib/supabase';
import { calculateStreaks, formatDateKey } from './lib/scheduler';
import { Topic, RevisionSession, PracticeLog, StudyActivity, SubjectItem, ExamType } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [examFilter, setExamFilter] = useState<ExamType>('BOTH');
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [topics, setTopics] = useState<Topic[]>([]);
  const [sessions, setSessions] = useState<RevisionSession[]>([]);
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]);
  const [activities, setActivities] = useState<StudyActivity[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);

  // Modals state
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [activeRevisionSession, setActiveRevisionSession] = useState<RevisionSession | null>(null);
  const [activeRevisionTopic, setActiveRevisionTopic] = useState<Topic | null>(null);
  const [detailTopic, setDetailTopic] = useState<Topic | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadData = async () => {
    StorageEngine.initSeedIfEmpty();
    const [t, s, p, a, sub] = await Promise.all([
      StorageEngine.getTopics(),
      StorageEngine.getSessions(),
      StorageEngine.getPracticeLogs(),
      StorageEngine.getActivities(),
      StorageEngine.getSubjects()
    ]);
    setTopics(t);
    setSessions(s);
    setPracticeLogs(p);
    setActivities(a);
    setSubjects(sub);
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = formatDateKey(new Date());
  const { currentStreak, longestStreak } = calculateStreaks(
    activities.map(a => a.activityDate),
    todayStr
  );

  const dueTodayCount = sessions.filter(s => s.status === 'PENDING' && s.scheduledDate === todayStr).length;

  const handleSaveTopic = async (topic: Topic, newSessions: RevisionSession[]) => {
    await StorageEngine.saveTopic(topic);
    await StorageEngine.saveSessions(newSessions);
    // Record learning activity
    await StorageEngine.recordActivity({
      id: crypto.randomUUID(),
      activityDate: topic.firstStudiedAt,
      activityType: 'NEW_TOPIC',
      durationMinutes: 45,
      referenceId: topic.id
    });
    await loadData();
  };

  const handleCompleteRevision = async (updated: RevisionSession, next: RevisionSession) => {
    await StorageEngine.saveSessions([updated, next]);
    await StorageEngine.recordActivity({
      id: crypto.randomUUID(),
      activityDate: todayStr,
      activityType: 'REVISION',
      durationMinutes: updated.durationMinutes,
      referenceId: updated.id
    });
    setActiveRevisionSession(null);
    setActiveRevisionTopic(null);
    await loadData();
  };

  const handleRescheduleSession = async (session: RevisionSession) => {
    const updated: RevisionSession = {
      ...session,
      scheduledDate: todayStr,
      status: 'PENDING'
    };
    await StorageEngine.saveSessions([updated]);
    await loadData();
  };

  const handleSavePracticeLog = async (log: PracticeLog) => {
    await StorageEngine.savePracticeLog(log);
    await StorageEngine.recordActivity({
      id: crypto.randomUUID(),
      activityDate: todayStr,
      activityType: 'PYQ',
      durationMinutes: Math.round(log.timeTakenSeconds / 60) || 5,
      referenceId: log.id
    });
    await loadData();
  };

  const startNextDueRevision = () => {
    const due = sessions.find(s => s.status === 'PENDING' && s.scheduledDate <= todayStr);
    if (due) {
      const top = topics.find(t => t.id === due.topicId);
      if (top) {
        setActiveRevisionSession(due);
        setActiveRevisionTopic(top);
      }
    } else {
      alert('No sessions due right now! Check the calendar or add a new topic.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans flex flex-col">
      <Navbar
        currentTab={currentTab}
        setTab={setCurrentTab}
        examFilter={examFilter}
        setExamFilter={setExamFilter}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentStreak={currentStreak}
        isSupabase={isSupabaseConfigured}
        onOpenAddTopic={() => setIsAddTopicOpen(true)}
        onStartTodayRevision={startNextDueRevision}
        dueTodayCount={dueTodayCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            topics={topics}
            sessions={sessions}
            practiceLogs={practiceLogs}
            activities={activities}
            examFilter={examFilter}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            onStartSession={(s, t) => {
              setActiveRevisionSession(s);
              setActiveRevisionTopic(t);
            }}
            onRescheduleSession={handleRescheduleSession}
            onOpenTopicDetail={setDetailTopic}
          />
        )}

        {currentTab === 'topics' && (
          <TopicsView
            topics={topics}
            sessions={sessions}
            examFilter={examFilter}
            onOpenAddTopic={() => setIsAddTopicOpen(true)}
            onSelectTopic={setDetailTopic}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            sessions={sessions}
            topics={topics}
            examFilter={examFilter}
            onOpenSession={(s, t) => {
              setActiveRevisionSession(s);
              setActiveRevisionTopic(t);
            }}
          />
        )}

        {currentTab === 'pyqs' && (
          <PYQTrackerView
            logs={practiceLogs}
            topics={topics}
            examFilter={examFilter}
            onSaveLog={handleSavePracticeLog}
          />
        )}

        {currentTab === 'planner' && (
          <DailyPlannerView
            sessions={sessions}
            topics={topics}
            examFilter={examFilter}
            onStartSession={(s, t) => {
              setActiveRevisionSession(s);
              setActiveRevisionTopic(t);
            }}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            onDataReset={loadData}
            isSupabase={isSupabaseConfigured}
          />
        )}
      </main>

      {/* Active Revision Runner Wizard */}
      <RevisionRunnerModal
        session={activeRevisionSession}
        topic={activeRevisionTopic}
        onClose={() => {
          setActiveRevisionSession(null);
          setActiveRevisionTopic(null);
        }}
        onComplete={handleCompleteRevision}
      />

      {/* Add Topic Modal */}
      <AddTopicModal
        isOpen={isAddTopicOpen}
        onClose={() => setIsAddTopicOpen(false)}
        subjects={subjects}
        onSave={handleSaveTopic}
      />

      {/* Topic Detail View */}
      <TopicDetailModal
        topic={detailTopic}
        sessions={sessions}
        practiceLogs={practiceLogs}
        onClose={() => setDetailTopic(null)}
        onUpdateTopic={async (t) => {
          await StorageEngine.saveTopic(t);
          await loadData();
          setDetailTopic(t);
        }}
        onDeleteTopic={async (id) => {
          await StorageEngine.deleteTopic(id);
          await loadData();
        }}
      />
    </div>
  );
}
