import React, { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, Bell, Database, CheckCircle, Info } from 'lucide-react';
import { StorageEngine } from '../lib/storage';

interface SettingsViewProps {
  onDataReset: () => void;
  isSupabase: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onDataReset, isSupabase }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notificationStatus, setNotificationStatus] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {statusMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Connection Mode Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" /> Database & Storage Engine
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          GATE Revision OS seamlessly operates in dual storage modes.
        </p>

        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-start gap-3">
          <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${isSupabase ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-blue-500 ring-4 ring-blue-500/20'}`} />
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {isSupabase ? 'Connected to Supabase PostgreSQL' : 'Local Demo Mode (Browser Storage)'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isSupabase
                ? 'Your topics, revisions, and practice logs are safely synchronized with your Supabase database.'
                : 'Data is persistently stored in your browser storage with zero latency and full offline capability. To sync with cloud PostgreSQL, provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'}
            </p>
          </div>
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

      <div className="text-center text-xs text-slate-400 py-2 flex items-center justify-center gap-1">
        <Info className="w-3.5 h-3.5" />
        GATE Revision OS &bull; Spaced Repetition for CSE & DA Aspirants
      </div>
    </div>
  );
};
