import React, { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, Bell, Database, CheckCircle, Copy, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { StorageEngine } from '../lib/storage';
import { setCustomSupabaseCredentials, getCustomSupabaseCredentials } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

const INIT_SQL_SCHEMA = `-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SUBJECTS
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    exam TEXT NOT NULL CHECK (exam IN ('CSE', 'DA', 'BOTH')),
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TOPICS
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_name TEXT NOT NULL,
    name TEXT NOT NULL,
    exam TEXT NOT NULL CHECK (exam IN ('CSE', 'DA', 'BOTH')),
    first_studied_at DATE NOT NULL,
    topic_type TEXT NOT NULL,
    learning_source TEXT NOT NULL,
    initial_confidence TEXT NOT NULL,
    estimated_difficulty TEXT NOT NULL,
    mastery_status TEXT NOT NULL DEFAULT 'Learning',
    notes TEXT DEFAULT '',
    resource_url TEXT DEFAULT '',
    checklist JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REVISION SESSIONS
CREATE TABLE IF NOT EXISTS public.revision_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL,
    sequence_number INT NOT NULL,
    scheduled_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'PENDING',
    duration_minutes INT DEFAULT 30,
    recall_rating INT,
    questions_attempted INT DEFAULT 0,
    questions_correct INT DEFAULT 0,
    mistakes_summary TEXT DEFAULT '',
    retrieval_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRACTICE LOGS (PYQ Tracker)
CREATE TABLE IF NOT EXISTS public.practice_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID,
    subject_name TEXT NOT NULL,
    exam TEXT NOT NULL CHECK (exam IN ('CSE', 'DA')),
    gate_year INT NOT NULL,
    question_ref TEXT NOT NULL,
    marks NUMERIC(3,1) NOT NULL DEFAULT 1.0,
    result TEXT NOT NULL,
    time_taken_seconds INT DEFAULT 180,
    error_category TEXT,
    explanation TEXT DEFAULT '',
    solved_independently BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STUDY ACTIVITIES
CREATE TABLE IF NOT EXISTS public.study_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_date DATE NOT NULL,
    activity_type TEXT NOT NULL,
    duration_minutes INT NOT NULL,
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`;

interface SettingsViewProps {
  onDataReset: () => void;
  isSupabase: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onDataReset, isSupabase }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notificationStatus, setNotificationStatus] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Cloud Database Connection state
  const existingCreds = getCustomSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(existingCreds.url);
  const [supabaseKey, setSupabaseKey] = useState(existingCreds.key);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleExport = () => {
    const data = StorageEngine.exportJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gate-revision-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Backup exported successfully as JSON file!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && StorageEngine.importJSON(content)) {
        setStatusMessage('Backup imported successfully! Reloading...');
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } else {
        alert('Failed to parse backup JSON. Please check file format.');
      }
    };
    reader.readAsText(file);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('GATE Revision OS', {
          body: 'Browser alerts enabled for due revision sessions.'
        });
        setNotificationStatus('Browser notifications are enabled!');
      } else {
        setNotificationStatus(`Notification permission: ${permission}`);
      }
    } else {
      setNotificationStatus('Browser notifications not supported in this environment.');
    }
  };

  const testAndSaveSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      alert('Please enter both Supabase Project URL and Anon API Key.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const client = createClient(supabaseUrl.trim(), supabaseKey.trim());
      // Test querying or verifying connection
      const { error } = await client.from('topics').select('id').limit(1);
      if (error && error.code !== 'PGRST116' && !error.message.includes('relation "public.topics" does not exist')) {
        setTestResult({
          success: false,
          msg: `Connection error: ${error.message}`
        });
      } else if (error && error.message.includes('relation "public.topics" does not exist')) {
        setTestResult({
          success: true,
          msg: 'Connected to Supabase! (Note: Remember to run the SQL schema below to create the tables).'
        });
        setCustomSupabaseCredentials(supabaseUrl.trim(), supabaseKey.trim());
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setTestResult({
          success: true,
          msg: 'Successfully connected and verified database tables! Switching to Cloud Mode...'
        });
        setCustomSupabaseCredentials(supabaseUrl.trim(), supabaseKey.trim());
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        msg: `Connection failed: ${err.message || 'Check URL and Key'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const disconnectSupabase = () => {
    setCustomSupabaseCredentials('', '');
    setSupabaseUrl('');
    setSupabaseKey('');
    setTestResult({
      success: true,
      msg: 'Disconnected from cloud database. Reverted to Local Browser Storage.'
    });
    setTimeout(() => window.location.reload(), 1000);
  };

  const copySql = () => {
    navigator.clipboard.writeText(INIT_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {statusMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Database Mode Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" /> Database & Storage Engine
          </h2>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
            isSupabase
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
          }`}>
            {isSupabase ? 'Cloud (Supabase PostgreSQL)' : 'Local Mode (Browser Storage)'}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          By default, all your data is stored locally in your browser with zero latency and full offline support.
          You can optionally connect a free Supabase cloud database to sync across devices.
        </p>

        {/* Supabase Connection Form */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isSupabase ? 'Cloud Database Connected' : 'Connect Cloud Database (Supabase PostgreSQL)'}
            </span>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
            >
              Get Free Supabase <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Anon Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={supabaseKey}
                onChange={e => setSupabaseKey(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {testResult && (
            <div className={`p-2.5 rounded-lg text-xs ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                : 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300'
            }`}>
              {testResult.msg}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={testAndSaveSupabase}
              disabled={isTesting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-50"
            >
              {isTesting ? 'Connecting & Verifying...' : isSupabase ? 'Update Connection' : 'Connect & Save'}
            </button>
            {isSupabase && (
              <button
                onClick={disconnectSupabase}
                className="px-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Disconnect & Use Local Storage
              </button>
            )}
          </div>
        </div>

        {/* SQL Schema helper */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div
            onClick={() => setShowSqlSchema(!showSqlSchema)}
            className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
          >
            <span>Need to set up tables in Supabase? View SQL Schema</span>
            {showSqlSchema ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>

          {showSqlSchema && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Copy and paste into your Supabase Dashboard &rarr; <strong>SQL Editor</strong>:</span>
                <button
                  onClick={copySql}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded font-semibold text-xs transition"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copied!' : 'Copy SQL'}
                </button>
              </div>
              <pre className="text-[11px] font-mono bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto max-h-60 border border-slate-800">
                {INIT_SQL_SCHEMA}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Backup & Portability */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Data Backup & Portability
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Export your entire spaced repetition history, topics, and PYQ logs to standard JSON.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4" /> Export Backup (JSON)
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition"
          >
            <Upload className="w-4 h-4" /> Restore from JSON
          </button>
        </div>
      </div>

      {/* Browser Notifications */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Study Reminders & Notifications
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Enable local browser notifications to remind you when daily spaced repetitions are scheduled.
        </p>
        <button
          onClick={requestNotificationPermission}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Bell className="w-4 h-4 text-blue-600" /> Enable Notifications
        </button>
        {notificationStatus && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">{notificationStatus}</p>
        )}
      </div>

      {/* Reset Seed Data */}
      <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 rounded-xl p-5 shadow-2xs">
        <h2 className="text-base font-bold text-red-600 dark:text-red-400 mb-1">
          Reset Data
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Reset local browser storage back to default seed data (Normalization, Virtual Memory, SVD, Gradient Descent, etc.).
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all records back to default demo seed data?')) {
              StorageEngine.resetToDefaultSeed();
              onDataReset();
              setStatusMessage('Data reset to default GATE seed!');
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition"
        >
          <RotateCcw className="w-4 h-4" /> Reset to Demo Seed Data
        </button>
      </div>
    </div>
  );
};
