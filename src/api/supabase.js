import { createClient } from '@supabase/supabase-js';

// Toutes les opérations passent par des fonctions RPC (voir supabase/schema.sql) :
// le navigateur n'a aucun accès direct aux tables.
export function createSupabaseApi(url, anonKey) {
  const client = createClient(url, anonKey, { auth: { persistSession: false } });

  const rpc = async (fn, args) => {
    try {
      const { data, error } = await client.rpc(fn, args);
      if (error) {
        console.error(`[supabase] ${fn}`, error);
        return { status: 'error' };
      }
      return data;
    } catch (e) {
      console.error(`[supabase] ${fn}`, e);
      return { status: 'error' };
    }
  };

  return {
    mode: 'supabase',
    registerStudent: (name, pin) => rpc('register_student', { p_name: name, p_pin: pin }),
    loginStudent: (name, pin) => rpc('login_student', { p_name: name, p_pin: pin }),
    studentMe: (token) => rpc('student_me', { p_token: token }),
    logout: (token) => rpc('logout', { p_token: token }),
    recordQuiz: (token, level, score) => rpc('record_quiz', { p_token: token, p_level: level, p_score: score }),
    getWriting: (token, level) => rpc('get_writing', { p_token: token, p_level: level }),
    submitWriting: (token, level, text) => rpc('submit_writing', { p_token: token, p_level: level, p_text: text }),
    teacherLogin: (password) => rpc('teacher_login', { p_password: password }),
    teacherListStudents: (token) => rpc('teacher_list_students', { p_token: token }),
    teacherGetWritings: (token, name) => rpc('teacher_get_writings', { p_token: token, p_name: name }),
    teacherSetFeedback: (token, name, level, feedback) =>
      rpc('teacher_set_feedback', { p_token: token, p_name: name, p_level: level, p_feedback: feedback }),
  };
}
