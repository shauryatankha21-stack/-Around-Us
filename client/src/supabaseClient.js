import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasConfig =
  supabaseUrl &&
  !supabaseUrl.includes('YOUR_') &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('YOUR_');

/**
 * supabase will be null if the env vars are not configured.
 * Components should check for null and fall back to localStorage mode.
 */
export const supabase = hasConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export { hasConfig };
