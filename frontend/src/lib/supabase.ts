import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Ensure .env file contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

/**
 * AUTHENTICATION & DATA ACCESS RULEBOOK:
 * 1. Only JSON tables are queried.
 * 2. No RLS joins in queries.
 * 3. All logic mapping UI to JSON happens via services using src/types/company.ts.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
