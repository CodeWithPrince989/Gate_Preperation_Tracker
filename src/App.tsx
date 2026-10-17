import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MobileNav } from './components/MobileNav';
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

  const [topics, setTopics] = useState<Topic[]>([]);
  const [sessions, setSessions] = useState<RevisionSession[]>([]);
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]);
  const [activities, setActivities] = useState<StudyActivity[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [activeRevisionSession, setActiveRevisionSession] = useState<RevisionSession | null>(null);
  const [activeRevisionTopic, setActiveRevisionTopic] = useState<Topic | null>(null);
  const [detailTopic, setDetailTopic] = useState<Topic | null>(null);

  // Ensure dark mode class is permanently attached for deep-dark design system
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
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
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
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
    // Record PYQ activity
    await StorageEngine.recordActivity({
      id: crypto.randomUUID(),
      activityDate: todayStr,
      activityType: 'PYQ',
      durationMinutes: Math.round(log.timeTakenSeconds / 60) || 15,
      referenceId: log.id
    });
    await loadData();
  };

  // Start next due revision session
  const startNextDueRevision = () => {
    const dueToday = sessions.find(s => s.status === 'PENDING' && s.scheduledDate === todayStr);
    if (dueToday) {
      const topic = topics.find(t => t.id === dueToday.topicId);
      if (topic) {
        setActiveRevisionSession(dueToday);
        setActiveRevisionTopic(topic);
        return;
      }
    }
    const overdue = sessions.find(s => s.status === 'PENDING' && s.scheduledDate < todayStr);
    if (overdue) {
      const topic = topics.find(t => t.id === overdue.topicId);
      if (topic) {
        setActiveRevisionSession(overdue);
        setActiveRevisionTopic(topic);
        return;
      }
    }
    if (topics.length === 0) {
      setIsAddTopicOpen(true);
    } else {
      setCurrentTab('topics');
    }
  };

  const handlePopulateDemoData = async () => {
    StorageEngine.loadSampleData();
    await loadData();
  };

  const isConnectedCloud = StorageEngine.getStorageMode() === 'cloud' && isSupabaseConfigured;

  return (
    <div className="min-h-screen bg-[#08090D] text-[#F5F7FA] antialiased flex selection:bg-[#8B9CFF]/30 selection:text-[#F5F7FA]">
      {/* 1. Desktop Persistent Left Sidebar (240px) */}
      <Sidebar
        currentTab={currentTab}
        setTab={setCurrentTab}
        examFilter={examFilter}
        setExamFilter={setExamFilter}
        currentStreak={currentStreak}
        isSupabase={isConnectedCloud}
        onOpenAddTopic={() => setIsAddTopicOpen(true)}
        onStartTodayRevision={startNextDueRevision}
        dueTodayCount={dueTodayCount}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 lg:pb-8">
        {/* Mobile App Bar & Bottom Tab Bar */}
        <MobileNav
          currentTab={currentTab}
          setTab={setCurrentTab}
          examFilter={examFilter}
          setExamFilter={setExamFilter}
          currentStreak={currentStreak}
          onOpenAddTopic={() => setIsAddTopicOpen(true)}
          onStartTodayRevision={startNextDueRevision}
          dueTodayCount={dueTodayCount}
        />

        {/* Desktop Sticky Header */}
        <TopBar
          currentTab={currentTab}
          onOpenAddTopic={() => setIsAddTopicOpen(true)}
          onStartTodayRevision={startNextDueRevision}
          dueTodayCount={dueTodayCount}
        />

        {/* Main Content Area */}
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
              onOpenAddTopic={() => setIsAddTopicOpen(true)}
              onLoadSampleData={handlePopulateDemoData}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'topics' && (
            <TopicsView
              topics={topics}
              sessions={sessions}
              examFilter={examFilter}
              onOpenAddTopic={() => setIsAddTopicOpen(true)}
              onSelectTopic={setDetailTopic}
              onLoadSampleData={handlePopulateDemoData}
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
              onOpenAddTopic={() => setIsAddTopicOpen(true)}
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
              onOpenAddTopic={() => setIsAddTopicOpen(true)}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              onDataReset={loadData}
              isSupabase={isConnectedCloud}
            />
          )}
        </main>
      </div>

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
