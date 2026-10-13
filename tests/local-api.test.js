import { describe, it, expect, beforeEach } from 'vitest';
import { createLocalApi } from '../src/api/local.js';
import { COURSES, LEVELS, scoreQuiz, countWords } from '../src/content.js';

const memoryStorage = () => {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
};

describe('API locale (miroir des RPC Supabase)', () => {
  let api;
  let clock;
  beforeEach(() => {
    clock = 1_000_000;
    api = createLocalApi({ storage: memoryStorage(), teacherPassword: 'prof', now: () => clock });
  });

  it('inscrit, refuse les doublons et valide les entrées', async () => {
    const r = await api.registerStudent('  Léa ', '1234');
    expect(r.status).toBe('ok');
    expect(r.student.name).toBe('Léa');
    expect(Object.keys(r.student.progress)).toEqual(LEVELS);
    expect((await api.registerStudent('Léa', '9999')).status).toBe('name_taken');
    expect((await api.registerStudent('Bob', '12a4')).status).toBe('invalid');
    expect((await api.registerStudent('', '1234')).status).toBe('invalid');
  });

  it('connecte et verrouille après 5 codes faux', async () => {
    await api.registerStudent('Léa', '1234');
    expect((await api.loginStudent('Inconnu', '1234')).status).toBe('not_found');
    for (let i = 0; i < 5; i++) expect((await api.loginStudent('Léa', '0000')).status).toBe('bad_pin');
    expect((await api.loginStudent('Léa', '1234')).status).toBe('locked');
    clock += 16 * 60 * 1000;
    expect((await api.loginStudent('Léa', '1234')).status).toBe('ok');
  });

  it('garde le meilleur score du quiz', async () => {
    const { token } = await api.registerStudent('Léa', '1234');
    expect((await api.recordQuiz(token, 'A1', 4)).student.progress.A1).toMatchObject({ quizDone: true, quizScore: 4 });
    expect((await api.recordQuiz(token, 'A1', 2)).student.progress.A1.quizScore).toBe(4);
    expect((await api.recordQuiz(token, 'A1', 9)).status).toBe('invalid');
    expect((await api.recordQuiz('faux', 'A1', 3)).status).toBe('unauthorized');
  });

  it('gère expressions écrites et corrections du formateur', async () => {
    const { token } = await api.registerStudent('Léa', '1234');
    expect((await api.getWriting(token, 'A2')).writing).toBeNull();
    expect((await api.submitWriting(token, 'A2', 'trop court')).status).toBe('invalid');
    const sent = await api.submitWriting(token, 'A2', 'Samedi, je suis allée au marché avec ma sœur.');
    expect(sent.student.progress.A2.writingSubmitted).toBe(true);

    expect((await api.teacherLogin('mauvais')).status).toBe('bad_password');
    expect((await api.teacherListStudents(token)).status).toBe('unauthorized');
    const { token: t } = await api.teacherLogin('prof');
    expect((await api.teacherListStudents(t)).students.map(s => s.name)).toEqual(['Léa']);
    expect(Object.keys((await api.teacherGetWritings(t, 'Léa')).writings)).toEqual(['A2']);
    expect((await api.teacherSetFeedback(t, 'Léa', 'B1', 'x')).status).toBe('not_found');
    await api.teacherSetFeedback(t, 'Léa', 'A2', 'Très bien !');
    expect((await api.getWriting(token, 'A2')).writing.feedback).toBe('Très bien !');

    // Une nouvelle version efface l'ancienne correction.
    await api.submitWriting(token, 'A2', 'Nouvelle version, plus longue et plus précise.');
    expect((await api.getWriting(token, 'A2')).writing.feedback).toBe('');
  });

  it('invalide le jeton à la déconnexion', async () => {
    const { token } = await api.registerStudent('Léa', '1234');
    expect((await api.studentMe(token)).status).toBe('ok');
    await api.logout(token);
    expect((await api.studentMe(token)).status).toBe('unauthorized');
  });
});

describe('contenu', () => {
  it('chaque niveau a 5 questions avec une bonne réponse valide', () => {
    for (const l of LEVELS) {
      expect(COURSES[l].quiz).toHaveLength(5);
      for (const q of COURSES[l].quiz) expect(q.options[q.correct]).toBeDefined();
    }
  });

  it('calcule score et nombre de mots', () => {
    const quiz = COURSES.A1.quiz;
    expect(scoreQuiz(quiz, Object.fromEntries(quiz.map((q, i) => [i, q.correct])))).toBe(5);
    expect(scoreQuiz(quiz, {})).toBe(0);
    expect(countWords('  Bonjour   tout le monde ')).toBe(4);
  });
});
