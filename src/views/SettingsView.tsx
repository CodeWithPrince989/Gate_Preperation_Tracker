import React, { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, Bell, Database, CheckCircle, Copy, Check, ExternalLink, ChevronDown, ChevronUp, Trash2, Sparkles, HardDrive } from 'lucide-react';
import { StorageEngine, StorageMode } from '../lib/storage';
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
  const [currentStorageMode, setCurrentStorageMode] = useState<StorageMode>(StorageEngine.getStorageMode());

  // Cloud Database Connection state
  const existingCreds = getCustomSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(existingCreds.url);
  const [supabaseKey, setSupabaseKey] = useState(existingCreds.key);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleModeSwitch = (mode: StorageMode) => {
    StorageEngine.setStorageMode(mode);
    setCurrentStorageMode(mode);
    setStatusMessage(`Switched to ${mode === 'local' ? 'Local Storage Mode' : 'Cloud Mode'}. Reloading...`);
    setTimeout(() => {
      onDataReset();
      window.location.reload();
    }, 600);
  };

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
          onDataReset();
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
      const { error } = await client.from('topics').select('id').limit(1);
      if (error && error.code !== 'PGRST116' && !error.message.includes('relation "public.topics" does not exist')) {
        setTestResult({
          success: false,
          msg: `Connection error: ${error.message}`
        });
      } else if (error && error.message.includes('relation "public.topics" does not exist')) {
        setTestResult({
          success: true,
          msg: 'Connected to Supabase! (Note: Run the SQL schema below to create tables).'
        });
        setCustomSupabaseCredentials(supabaseUrl.trim(), supabaseKey.trim());
        StorageEngine.setStorageMode('cloud');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setTestResult({
          success: true,
          msg: 'Successfully connected and verified database tables! Cloud Mode enabled.'
        });
        setCustomSupabaseCredentials(supabaseUrl.trim(), supabaseKey.trim());
        StorageEngine.setStorageMode('cloud');
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
    StorageEngine.setStorageMode('local');
    setTestResult({
      success: true,
      msg: 'Operating in Local Storage Mode (Browser Only).'
    });
    setTimeout(() => window.location.reload(), 600);
  };

  const copySql = () => {
    navigator.clipboard.writeText(INIT_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {statusMessage && (
        <div className="p-3.5 bg-[#161922] border border-[#42D6A4]/30 rounded-xl text-xs text-[#42D6A4] flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Storage Mode Selector Card */}
      <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#8B9CFF]" /> Storage Engine Mode
          </h2>
          <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
            currentStorageMode === 'cloud' && isSupabase
              ? 'bg-[#42D6A4]/15 text-[#42D6A4]'
              : 'bg-[#8B9CFF]/15 text-[#8B9CFF]'
          }`}>
            {currentStorageMode === 'cloud' ? 'Cloud Supabase' : 'Local Browser Mode'}
          </span>
        </div>

        <p className="text-xs text-[#737B8C] mb-4">
          Choose where your revision schedules, topics, and PYQs are stored. In Local Mode, data is kept strictly inside your browser with instant zero-latency responses and full offline resilience.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleModeSwitch('local')}
            className={`p-3.5 rounded-xl border text-left transition ${
              currentStorageMode === 'local'
                ? 'bg-[#161922] border-[#8B9CFF] ring-1 ring-[#8B9CFF]/30'
                : 'bg-[#101218] border-[#272C38] hover:border-[#3B4254]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#F5F7FA]">Local Storage Mode</span>
              {currentStorageMode === 'local' && (
                <span className="text-[10px] font-mono text-[#8B9CFF] font-semibold">Active</span>
              )}
            </div>
            <p className="text-[11px] text-[#737B8C]">
              Zero-setup, works completely offline in your browser. Initializes with zero data or sample syllabus.
            </p>
          </button>

          <button
            onClick={() => handleModeSwitch('cloud')}
            className={`p-3.5 rounded-xl border text-left transition ${
              currentStorageMode === 'cloud'
                ? 'bg-[#161922] border-[#8B9CFF] ring-1 ring-[#8B9CFF]/30'
                : 'bg-[#101218] border-[#272C38] hover:border-[#3B4254]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#F5F7FA]">Cloud Database Mode</span>
              {currentStorageMode === 'cloud' && (
                <span className="text-[10px] font-mono text-[#42D6A4] font-semibold">Active</span>
              )}
            </div>
            <p className="text-[11px] text-[#737B8C]">
              Sync across multiple devices via PostgreSQL tables on Supabase.
            </p>
          </button>
        </div>
      </div>

      {/* Cloud Supabase Configuration */}
      <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#8B9CFF]" /> Supabase PostgreSQL Credentials
          </h2>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-[#8B9CFF] flex items-center gap-1 hover:underline"
          >
            Supabase Console <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <p className="text-xs text-[#737B8C] mb-4">
          Connect your custom Supabase PostgreSQL project or verify existing connection settings.
        </p>

        <div className="p-4 rounded-xl border border-[#272C38] bg-[#161922] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#A1A8B7] mb-1">
                Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#272C38] rounded-xl bg-[#101218] text-[#F5F7FA] focus:ring-1 focus:ring-[#8B9CFF] outline-hidden font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#A1A8B7] mb-1">
                Anon Public Key
              </label>
              <input
                type="password"
                placeholder="sb_publishable_... or anon key"
                value={supabaseKey}
                onChange={e => setSupabaseKey(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#272C38] rounded-xl bg-[#101218] text-[#F5F7FA] focus:ring-1 focus:ring-[#8B9CFF] outline-hidden font-mono"
              />
            </div>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs border ${
              testResult.success
                ? 'bg-[#101218] text-[#42D6A4] border-[#42D6A4]/40'
                : 'bg-[#101218] text-[#FF727C] border-[#FF727C]/40'
            }`}>
              {testResult.msg}
            </div>
          )}

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={testAndSaveSupabase}
              disabled={isTesting}
              className="px-4 py-2 bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 active:scale-95"
            >
              {isTesting ? 'Connecting & Verifying...' : 'Test & Connect Cloud'}
            </button>
            <button
              onClick={disconnectSupabase}
              className="px-3.5 py-2 border border-[#272C38] text-[#A1A8B7] hover:text-[#F5F7FA] rounded-xl text-xs font-semibold hover:bg-[#1C202B] transition"
            >
              Switch to Local Storage
            </button>
          </div>
        </div>

        {/* Collapsible SQL Schema Viewer */}
        <div className="mt-4 pt-3 border-t border-[#272C38]">
          <button
            onClick={() => setShowSqlSchema(!showSqlSchema)}
            className="flex items-center justify-between w-full text-xs font-medium text-[#A1A8B7] hover:text-[#F5F7FA] transition py-1"
          >
            <span>Supabase DDL Table Schema (Click to View SQL)</span>
            {showSqlSchema ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showSqlSchema && (
            <div className="mt-3 relative">
              <button
                onClick={copySql}
                className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-[#161922] border border-[#272C38] text-[11px] font-mono text-[#A1A8B7] hover:text-[#F5F7FA] flex items-center gap-1 transition"
              >
                {copiedSql ? <Check className="w-3 h-3 text-[#42D6A4]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
              </button>
              <pre className="p-3 bg-[#08090D] border border-[#272C38] rounded-xl text-[11px] text-[#A1A8B7] overflow-x-auto max-h-56 font-mono leading-relaxed">
                {INIT_SQL_SCHEMA}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Zero Data & Demo Syllabus Controls */}
      <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-[#F5F7FA] mb-1">
            Data State &amp; Syllabus Seeding
          </h2>
          <p className="text-xs text-[#737B8C]">
            Experience a brand-new user journey with zero data, or load a pre-configured GATE CSE &amp; DA curriculum with spaced review cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Zero Data Reset */}
          <div className="p-4 rounded-xl border border-[#FF727C]/30 bg-[#161922] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#FF727C] text-xs font-bold mb-1">
                <Trash2 className="w-4 h-4" />
                <span>Reset to Brand-New (Zero Data)</span>
              </div>
              <p className="text-[11px] text-[#737B8C] leading-relaxed">
                Initializes clean empty arrays (0 topics, 0 sessions, 0 logs). Test empty-state views and custom syllabus creation.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Clear all topics, revision sessions, and practice logs to a clean empty state?')) {
                  StorageEngine.resetToEmpty();
                  onDataReset();
                  setStatusMessage('All data cleared. System initialized to zero data empty state.');
                }
              }}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-[#1C202B] hover:bg-[#FF727C] text-[#FF727C] hover:text-[#08090D] border border-[#FF727C]/40 text-xs font-bold transition active:scale-95"
            >
              Clear to Zero Data
            </button>
          </div>

          {/* Load Sample GATE Syllabus */}
          <div className="p-4 rounded-xl border border-[#8B9CFF]/30 bg-[#161922] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#8B9CFF] text-xs font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Load Sample GATE Syllabus</span>
              </div>
              <p className="text-[11px] text-[#737B8C] leading-relaxed">
                Loads realistic GATE syllabus topics (Normalization, Multi-level Paging, Eigenvalues, Backprop) with active retention intervals.
              </p>
            </div>
            <button
              onClick={() => {
                StorageEngine.loadSampleData();
                onDataReset();
                setStatusMessage('Loaded sample GATE CSE & DA syllabus topics!');
              }}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-[#8B9CFF] hover:bg-[#9DAEFF] text-[#08090D] text-xs font-bold shadow-xs transition active:scale-95"
            >
              Load Sample Topics
            </button>
          </div>
        </div>
      </div>

      {/* JSON Backup & Portability */}
      <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-5 sm:p-6 shadow-xs">
        <h2 className="text-base font-bold text-[#F5F7FA] mb-1">
          Backup &amp; Data Portability
        </h2>
        <p className="text-xs text-[#737B8C] mb-4">
          Export your entire revision history, mistake logs, and schedule to JSON or restore a previous snapshot.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#272C38] rounded-xl text-xs font-semibold text-[#F5F7FA] hover:bg-[#161922] transition active:scale-95"
          >
            <Download className="w-4 h-4 text-[#8B9CFF]" />
            <span>Export Backup (.JSON)</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#272C38] rounded-xl text-xs font-semibold text-[#F5F7FA] hover:bg-[#161922] transition active:scale-95"
          >
            <Upload className="w-4 h-4 text-[#42D6A4]" />
            <span>Restore from Backup</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#101218] border border-[#272C38] rounded-2xl p-5 sm:p-6 shadow-xs">
        <h2 className="text-base font-bold text-[#F5F7FA] mb-1">
          Study Reminders &amp; Notifications
        </h2>
        <p className="text-xs text-[#737B8C] mb-4">
          Enable local browser notifications to remind you when daily spaced repetitions are scheduled.
        </p>
        <button
          onClick={requestNotificationPermission}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#272C38] rounded-xl text-xs font-semibold text-[#F5F7FA] hover:bg-[#1C202B] transition active:scale-95"
        >
          <Bell className="w-4 h-4 text-[#8B9CFF]" />
          <span>Enable Notifications</span>
        </button>
        {notificationStatus && (
          <p className="text-xs text-[#8B9CFF] mt-2 font-mono">{notificationStatus}</p>
        )}
      </div>
    </div>
  );
};
