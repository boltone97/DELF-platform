import { LEVELS } from '../content.js';

// Backend « démo local » : reproduit le comportement des fonctions RPC Supabase
// en stockant tout dans le navigateur. Sert au développement sans Supabase
// et aux tests. À ne pas utiliser en production (codes non hachés).

const DB_KEY = 'delf-local-db';
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export const emptyProgress = () => {
  const p = {};
  LEVELS.forEach(l => { p[l] = { quizDone: false, quizScore: 0, writingSubmitted: false }; });
  return p;
};

const studentJson = (s) => ({ name: s.name, progress: structuredClone(s.progress), createdAt: s.createdAt });

export function createLocalApi({ storage = globalThis.localStorage, teacherPassword = 'formateur', now = () => Date.now() } = {}) {
  const load = () => {
    try {
      const raw = storage.getItem(DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* données corrompues : on repart de zéro */ }
    return { students: {}, writings: {}, sessions: {} };
  };
  const save = (db) => storage.setItem(DB_KEY, JSON.stringify(db));
  const newToken = () => globalThis.crypto.randomUUID();

  const withDb = (fn) => async (...args) => {
    const db = load();
    const result = fn(db, ...args);
    save(db);
    return result;
  };

  const sessionStudent = (db, token) => {
    const s = db.sessions[token];
    return s && !s.teacher ? db.students[s.name] : null;
  };
  const isTeacher = (db, token) => Boolean(db.sessions[token]?.teacher);
  const validLevel = (level) => LEVELS.includes(level);

  return {
    mode: 'local',

    registerStudent: withDb((db, name, pin) => {
      const clean = (name || '').trim();
      if (!clean || clean.length > 40 || !/^[0-9]{4}$/.test(pin || '')) return { status: 'invalid' };
      if (db.students[clean]) return { status: 'name_taken' };
      const s = { name: clean, pin, progress: emptyProgress(), createdAt: new Date(now()).toISOString(), failedAttempts: 0, lockedUntil: 0 };
      db.students[clean] = s;
      const token = newToken();
      db.sessions[token] = { name: clean };
      return { status: 'ok', token, student: studentJson(s) };
    }),

    loginStudent: withDb((db, name, pin) => {
      const s = db.students[(name || '').trim()];
      if (!s) return { status: 'not_found' };
      if (s.lockedUntil > now()) return { status: 'locked' };
      if (s.pin !== pin) {
        s.failedAttempts += 1;
        if (s.failedAttempts >= MAX_ATTEMPTS) s.lockedUntil = now() + LOCK_MS;
        return { status: 'bad_pin' };
      }
      s.failedAttempts = 0;
      s.lockedUntil = 0;
      const token = newToken();
      db.sessions[token] = { name: s.name };
      return { status: 'ok', token, student: studentJson(s) };
    }),

    studentMe: withDb((db, token) => {
      const s = sessionStudent(db, token);
      return s ? { status: 'ok', student: studentJson(s) } : { status: 'unauthorized' };
    }),

    logout: withDb((db, token) => {
      delete db.sessions[token];
      return { status: 'ok' };
    }),

    recordQuiz: withDb((db, token, level, score) => {
      const s = sessionStudent(db, token);
      if (!s) return { status: 'unauthorized' };
      if (!validLevel(level) || !Number.isInteger(score) || score < 0 || score > 5) return { status: 'invalid' };
      const p = s.progress[level];
      s.progress[level] = { ...p, quizDone: true, quizScore: Math.max(score, p.quizScore || 0) };
      return { status: 'ok', student: studentJson(s) };
    }),

    getWriting: withDb((db, token, level) => {
      const s = sessionStudent(db, token);
      if (!s) return { status: 'unauthorized' };
      return { status: 'ok', writing: db.writings[`${s.name}:${level}`] || null };
    }),

    submitWriting: withDb((db, token, level, text) => {
      const s = sessionStudent(db, token);
      if (!s) return { status: 'unauthorized' };
      const clean = (text || '').trim();
      if (!validLevel(level) || clean.length < 20 || clean.length > 20000) return { status: 'invalid' };
      const writing = { text: clean, submittedAt: new Date(now()).toISOString(), feedback: '' };
      db.writings[`${s.name}:${level}`] = writing;
      s.progress[level] = { ...s.progress[level], writingSubmitted: true };
      return { status: 'ok', writing, student: studentJson(s) };
    }),

    teacherLogin: withDb((db, password) => {
      if (password !== teacherPassword) return { status: 'bad_password' };
      const token = newToken();
      db.sessions[token] = { teacher: true };
      return { status: 'ok', token };
    }),

    teacherListStudents: withDb((db, token) => {
      if (!isTeacher(db, token)) return { status: 'unauthorized' };
      const students = Object.values(db.students).map(studentJson).sort((a, b) => a.name.localeCompare(b.name));
      return { status: 'ok', students };
    }),

    teacherGetWritings: withDb((db, token, name) => {
      if (!isTeacher(db, token)) return { status: 'unauthorized' };
      const writings = {};
      LEVELS.forEach(l => { if (db.writings[`${name}:${l}`]) writings[l] = db.writings[`${name}:${l}`]; });
      return { status: 'ok', writings };
    }),

    teacherSetFeedback: withDb((db, token, name, level, feedback) => {
      if (!isTeacher(db, token)) return { status: 'unauthorized' };
      const w = db.writings[`${name}:${level}`];
      if (!w) return { status: 'not_found' };
      w.feedback = (feedback || '').trim();
      return { status: 'ok', writing: w };
    }),
  };
}
