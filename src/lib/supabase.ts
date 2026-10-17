import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase configuration provided for GATE Revision OS
const DEFAULT_SUPABASE_URL = 'https://ddctlkwarmszbhrlvjdy.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_5eurSUmqRDCB_akKnXijlA_CMAVhknq';

function getSupabaseConfig(): { url: string; key: string } {
  try {
    const localUrl = localStorage.getItem('gate_custom_supabase_url');
    const localKey = localStorage.getItem('gate_custom_supabase_key');
    if (localUrl && localKey) {
      return { url: localUrl, key: localKey };
    }
  } catch (e) {
    // ignore
  }

  const envUrl =
    (import.meta.env.VITE_SUPABASE_URL as string) ||
    (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
    DEFAULT_SUPABASE_URL;

  const envKey =
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
    (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) ||
    (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
    DEFAULT_SUPABASE_KEY;

  return { url: envUrl, key: envKey };
}

const config = getSupabaseConfig();

export const isSupabaseConfigured = Boolean(config.url && config.key);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(config.url, config.key)
  : null;

export function setCustomSupabaseCredentials(url: string, key: string) {
  if (url && key) {
    localStorage.setItem('gate_custom_supabase_url', url.trim());
    localStorage.setItem('gate_custom_supabase_key', key.trim());
  } else {
    localStorage.removeItem('gate_custom_supabase_url');
    localStorage.removeItem('gate_custom_supabase_key');
  }
}

export function getCustomSupabaseCredentials(): { url: string; key: string } {
  const current = getSupabaseConfig();
  return current;
}
