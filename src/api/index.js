import { createSupabaseApi } from './supabase.js';
import { createLocalApi } from './local.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Avec les variables Supabase → vraie base partagée. Sans → mode démo local.
export const api = url && anonKey
  ? createSupabaseApi(url, anonKey)
  : createLocalApi({ teacherPassword: import.meta.env.VITE_LOCAL_TEACHER_PASSWORD || 'formateur' });
