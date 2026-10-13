import { useState, useEffect, useCallback } from 'react';
import { LEVELS, LEVEL_INFO, COURSES, scoreQuiz, countWords } from './content.js';
import { styles } from './styles.js';
import { api } from './api/index.js';

/* ============================================================
   SESSION (jeton conservé dans le navigateur)
   ============================================================ */

const STUDENT_TOKEN_KEY = 'delf-student-token';
const TEACHER_TOKEN_KEY = 'delf-teacher-token';

const readToken = (key) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const writeToken = (key, token) => {
  try {
    if (token) localStorage.setItem(key, token);
    else localStorage.removeItem(key);
  } catch { /* stockage indisponible : la session ne survivra pas au rechargement */ }
};

const ERRORS = {
  invalid: 'Entrez un nom (40 caractères max.) et un code à 4 chiffres.',
  name_taken: 'Ce nom existe déjà. Choisissez « J\'ai déjà un compte » ou un autre nom.',
  not_found: 'Aucun compte avec ce nom. Créez-en un.',
  bad_pin: 'Code incorrect.',
  locked: 'Trop de tentatives. Compte bloqué 15 minutes.',
  bad_password: 'Mot de passe incorrect.',
  not_configured: "Le mot de passe formateur n'est pas encore configuré (voir README).",
  unauthorized: 'Session expirée. Reconnectez-vous.',
};
const errorMessage = (status) => ERRORS[status] || 'Erreur de connexion au serveur. Réessayez.';

/* ============================================================
   ICÔNES (inline SVG, sobres)
   ============================================================ */

const Seal = ({ filled }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12" stroke="var(--gold)" strokeWidth={filled ? 0 : 1.5} fill={filled ? 'var(--gold)' : 'none'} />
    {filled && <path d="M9 14.5l3 3 7-7.5" stroke="var(--paper-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
  </svg>
);

/* ============================================================
   COMPOSANTS
   ============================================================ */

function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState('choose'); // choose | new | existing
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanName = name.trim();
    if (!cleanName || pin.length !== 4) {
      setError('Entrez un nom et un code à 4 chiffres.');
      return;
    }
    setBusy(true);
    const res = mode === 'new'
      ? await api.registerStudent(cleanName, pin)
      : await api.loginStudent(cleanName, pin);
    setBusy(false);
    if (res?.status === 'ok') onLogin(res.token, res.student);
    else setError(errorMessage(res?.status));
  };

  return (
    <div style={styles.loginWrap}>
      <div style={styles.loginCard}>
        <div style={styles.loginBadge}>DELF</div>
        <h1 style={styles.loginTitle}>Préparation au DELF</h1>
        <p style={styles.loginSub}>Un parcours du niveau A1 au niveau B2, avec suivi de votre progression.</p>

        {mode === 'choose' && (
          <div style={styles.choiceRow}>
            <button style={styles.primaryBtn} onClick={() => setMode('new')}>Créer un compte</button>
            <button style={styles.secondaryBtn} onClick={() => setMode('existing')}>J'ai déjà un compte</button>
          </div>
        )}

        {mode !== 'choose' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={styles.label}>
              Prénom / pseudo
              <input style={styles.input} value={name} maxLength={40} onChange={e => setName(e.target.value)} autoFocus />
            </label>
            <label style={styles.label}>
              Code à 4 chiffres {mode === 'new' ? '(à retenir)' : ''}
              <input style={styles.input} value={pin} maxLength={4} inputMode="numeric" type="password" autoComplete="off"
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))} />
            </label>
            {error && <div style={styles.errorText}>{error}</div>}
            <button style={styles.primaryBtn} type="submit" disabled={busy}>
              {busy ? 'Un instant…' : mode === 'new' ? 'Créer mon espace' : 'Entrer'}
            </button>
            <button type="button" style={styles.linkBtn} onClick={() => { setMode('choose'); setError(''); }}>← Retour</button>
          </form>
        )}
      </div>
    </div>
  );
}

function ProgressStamp({ level, progress }) {
  const p = progress[level];
  const done = (p.quizDone ? 1 : 0) + (p.writingSubmitted ? 1 : 0);
  return (
    <div style={styles.stampCard}>
      <Seal filled={done === 2} />
      <div>
        <div style={styles.stampLevel}>{level} — {LEVEL_INFO[level].name}</div>
        <div style={styles.stampDetail}>
          {p.quizDone ? `Quiz : ${p.quizScore}/${COURSES[level].quiz.length}` : 'Quiz non fait'} · {p.writingSubmitted ? 'Expression écrite envoyée' : 'Expression écrite à faire'}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ student, onOpenLevel, onLogout, onTeacher }) {
  return (
    <div style={styles.page}>
      <TopBar student={student} onLogout={onLogout} onTeacher={onTeacher} />
      <div style={styles.dashBody}>
        <h2 style={styles.h2}>Bonjour {student.name}</h2>
        <p style={styles.muted}>Choisissez un niveau pour continuer votre préparation.</p>
        <div style={styles.levelGrid}>
          {LEVELS.map(l => (
            <button key={l} style={styles.levelCard} onClick={() => onOpenLevel(l)}>
              <div style={styles.levelCardTop}>
                <span style={styles.levelBadge}>{l}</span>
                <Seal filled={student.progress[l].quizDone && student.progress[l].writingSubmitted} />
              </div>
              <div style={styles.levelCardName}>{LEVEL_INFO[l].name}</div>
              <div style={styles.levelCardDesc}>{LEVEL_INFO[l].desc}</div>
            </button>
          ))}
        </div>
        <h3 style={styles.h3}>Votre progression</h3>
        <div style={styles.stampGrid}>
          {LEVELS.map(l => <ProgressStamp key={l} level={l} progress={student.progress} />)}
        </div>
      </div>
    </div>
  );
}

function TopBar({ student, onLogout, onTeacher, onBack }) {
  return (
    <div style={styles.topBar}>
      <div style={styles.topBarLeft}>
        {onBack && <button style={styles.iconBtn} onClick={onBack} aria-label="Retour">←</button>}
        <span style={styles.topBarBadge}>DELF</span>
        <span style={styles.topBarTitle}>Espace {student ? 'élève' : 'formateur'}</span>
      </div>
      <div style={styles.topBarRight}>
        {student && <span style={styles.topBarName}>{student.name}</span>}
        {onTeacher && <button style={styles.textBtn} onClick={onTeacher}>Espace formateur</button>}
        <button style={styles.textBtn} onClick={onLogout}>Se déconnecter</button>
      </div>
    </div>
  );
}

function LevelView({ session, level, onBack, onLogout, onStudentUpdate }) {
  const [tab, setTab] = useState('cours');
  const course = COURSES[level];
  const info = LEVEL_INFO[level];

  return (
    <div style={styles.page}>
      <TopBar student={session.student} onLogout={onLogout} onBack={onBack} />
      <div style={styles.dashBody}>
        <div style={styles.levelHeader}>
          <span style={styles.levelBadgeBig}>{level}</span>
          <div>
            <h2 style={styles.h2}>{info.name}</h2>
            <p style={styles.muted}>{info.desc}</p>
          </div>
        </div>
        <div style={styles.tabRow}>
          {['cours', 'quiz', 'expression écrite'].map(t => (
            <button key={t} style={{ ...styles.tabBtn, ...(tab === t ? styles.tabBtnActive : {}) }} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        {tab === 'cours' && <CoursTab course={course} />}
        {tab === 'quiz' && <QuizTab level={level} course={course} token={session.token} onStudentUpdate={onStudentUpdate} />}
        {tab === 'expression écrite' && <WritingTab level={level} course={course} token={session.token} onStudentUpdate={onStudentUpdate} />}
      </div>
    </div>
  );
}

function CoursTab({ course }) {
  return (
    <div style={styles.coursWrap}>
      <div>
        <h3 style={styles.h3}>Grammaire</h3>
        {course.grammar.map((g, i) => (
          <div key={i} style={styles.grammarCard}>
            <div style={styles.grammarTitle}>{g.title}</div>
            <div style={styles.grammarBody}>{g.body}</div>
          </div>
        ))}
      </div>
      <div>
        <h3 style={styles.h3}>Vocabulaire à réviser</h3>
        <ul style={styles.vocabList}>
          {course.vocab.map((v, i) => <li key={i} style={styles.vocabItem}>{v}</li>)}
        </ul>
      </div>
    </div>
  );
}

function QuizTab({ level, course, token, onStudentUpdate }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error

  const score = submitted ? scoreQuiz(course.quiz, answers) : 0;

  const handleSubmit = async () => {
    if (Object.keys(answers).length < course.quiz.length) return;
    setSubmitted(true);
    setSaveState('saving');
    const res = await api.recordQuiz(token, level, scoreQuiz(course.quiz, answers));
    if (res?.status === 'ok') {
      onStudentUpdate(res.student);
      setSaveState('saved');
    } else {
      setSaveState('error');
    }
  };

  const retry = () => {
    setAnswers({});
    setSubmitted(false);
    setSaveState('idle');
  };

  return (
    <div>
      {course.quiz.map((q, i) => (
        <div key={i} style={styles.quizCard}>
          <div style={styles.quizQ}>{i + 1}. {q.q}</div>
          <div style={styles.quizOptions}>
            {q.options.map((opt, oi) => {
              let optStyle = { ...styles.quizOption };
              if (submitted) {
                if (oi === q.correct) optStyle = { ...optStyle, ...styles.quizOptionCorrect };
                else if (answers[i] === oi) optStyle = { ...optStyle, ...styles.quizOptionWrong };
              } else if (answers[i] === oi) {
                optStyle = { ...optStyle, ...styles.quizOptionSelected };
              }
              return (
                <button key={oi} style={optStyle} disabled={submitted}
                  onClick={() => setAnswers({ ...answers, [i]: oi })}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button style={styles.primaryBtn} onClick={handleSubmit} disabled={Object.keys(answers).length < course.quiz.length}>
          Valider mes réponses
        </button>
      ) : (
        <div style={styles.resultBox}>
          <div style={styles.resultScore}>Score : {score} / {course.quiz.length}</div>
          {saveState === 'error'
            ? <div style={styles.errorText}>La progression n'a pas pu être enregistrée.</div>
            : <div style={styles.muted}>{saveState === 'saving' ? 'Sauvegarde…' : 'Progression enregistrée.'}</div>}
          {saveState !== 'saving' && (
            <button style={{ ...styles.linkBtn, marginTop: 10 }} onClick={retry}>Refaire le quiz</button>
          )}
        </div>
      )}
    </div>
  );
}

function WritingTab({ level, course, token, onStudentUpdate }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('loading'); // loading | idle | saving | error
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    let active = true;
    api.getWriting(token, level).then(res => {
      if (!active) return;
      setExisting(res?.status === 'ok' ? res.writing : null);
      setStatus('idle');
    });
    return () => { active = false; };
  }, [token, level]);

  const handleSend = async () => {
    if (text.trim().length < 20) return;
    setStatus('saving');
    const res = await api.submitWriting(token, level, text.trim());
    if (res?.status === 'ok') {
      onStudentUpdate(res.student);
      setExisting(res.writing);
      setText('');
      setStatus('idle');
    } else {
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return <div style={styles.writingWrap}><div style={styles.writingPrompt}>{course.writingPrompt}</div><p style={styles.muted}>Chargement…</p></div>;
  }

  return (
    <div style={styles.writingWrap}>
      <div style={styles.writingPrompt}>{course.writingPrompt}</div>
      {existing ? (
        <div>
          <div style={styles.writingSentBox}>
            <div style={styles.muted}>Envoyé le {new Date(existing.submittedAt).toLocaleDateString('fr-FR')}</div>
            <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{existing.text}</p>
            {existing.feedback && (
              <div style={styles.feedbackBox}>
                <strong>Correction du formateur :</strong>
                <p style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{existing.feedback}</p>
              </div>
            )}
          </div>
          <button style={styles.secondaryBtn} onClick={() => { setText(existing.text); setExisting(null); }}>Renvoyer une nouvelle version</button>
        </div>
      ) : (
        <div>
          <textarea style={styles.textarea} rows={8} value={text} onChange={e => setText(e.target.value)}
            placeholder="Écrivez votre réponse ici…" />
          <div style={styles.muted}>{countWords(text)} mots</div>
          {status === 'error' && <div style={styles.errorText}>L'envoi a échoué. Réessayez.</div>}
          <button style={{ ...styles.primaryBtn, marginTop: 8 }} onClick={handleSend} disabled={text.trim().length < 20 || status === 'saving'}>
            {status === 'saving' ? 'Envoi…' : 'Envoyer au formateur'}
          </button>
        </div>
      )}
    </div>
  );
}

function TeacherLogin({ onLogin, onBack }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await api.teacherLogin(password);
    setBusy(false);
    if (res?.status === 'ok') onLogin(res.token);
    else setError(errorMessage(res?.status));
  };

  return (
    <div style={styles.loginWrap}>
      <div style={styles.loginCard}>
        <div style={styles.loginBadge}>DELF</div>
        <h1 style={styles.loginTitle}>Espace formateur</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={styles.label}>
            Mot de passe formateur
            <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
          </label>
          {error && <div style={styles.errorText}>{error}</div>}
          <button style={styles.primaryBtn} type="submit" disabled={busy || !password}>{busy ? 'Un instant…' : 'Entrer'}</button>
          <button type="button" style={styles.linkBtn} onClick={onBack}>← Retour</button>
        </form>
      </div>
    </div>
  );
}

function TeacherView({ token, onLogout, onExpired }) {
  const [students, setStudents] = useState(null);
  const [selected, setSelected] = useState(null);
  const [writings, setWritings] = useState({});
  const [feedbackDraft, setFeedbackDraft] = useState({});
  const [feedbackState, setFeedbackState] = useState({});

  useEffect(() => {
    api.teacherListStudents(token).then(res => {
      if (res?.status === 'unauthorized') onExpired();
      else setStudents(res?.status === 'ok' ? res.students : []);
    });
  }, [token, onExpired]);

  useEffect(() => {
    if (!selected) return;
    let active = true;
    setWritings({});
    setFeedbackDraft({});
    setFeedbackState({});
    api.teacherGetWritings(token, selected.name).then(res => {
      if (active && res?.status === 'ok') setWritings(res.writings);
    });
    return () => { active = false; };
  }, [token, selected]);

  const sendFeedback = async (level) => {
    const draft = (feedbackDraft[level] || '').trim();
    if (!draft) return;
    setFeedbackState(s => ({ ...s, [level]: 'saving' }));
    const res = await api.teacherSetFeedback(token, selected.name, level, draft);
    if (res?.status === 'ok') {
      setWritings(w => ({ ...w, [level]: res.writing }));
      setFeedbackDraft(d => ({ ...d, [level]: '' }));
      setFeedbackState(s => ({ ...s, [level]: 'saved' }));
    } else {
      setFeedbackState(s => ({ ...s, [level]: 'error' }));
    }
  };

  return (
    <div style={styles.page}>
      <TopBar student={null} onLogout={onLogout} />
      <div style={styles.dashBody}>
        <h2 style={styles.h2}>Espace formateur</h2>
        <p style={styles.muted}>Vue d'ensemble des élèves et de leurs devoirs.</p>
        {students === null && <p style={styles.muted}>Chargement…</p>}
        {students && students.length === 0 && <p style={styles.muted}>Aucun élève inscrit pour le moment.</p>}

        <div style={styles.teacherLayout} className="teacher-layout">
          <div style={styles.studentList}>
            {students && students.map(s => (
              <button key={s.name} style={{ ...styles.studentRow, ...(selected?.name === s.name ? styles.studentRowActive : {}) }}
                onClick={() => setSelected(s)}>
                <span>{s.name}</span>
                <span style={styles.muted}>
                  {LEVELS.filter(l => s.progress[l].quizDone).length}/4 quiz
                </span>
              </button>
            ))}
          </div>
          <div style={styles.studentDetail}>
            {!selected && <p style={styles.muted}>Sélectionnez un élève à gauche.</p>}
            {selected && (
              <div>
                <h3 style={styles.h3}>{selected.name}</h3>
                {LEVELS.map(l => (
                  <div key={l} style={styles.teacherLevelCard}>
                    <div style={styles.stampLevel}>{l} — {LEVEL_INFO[l].name}</div>
                    <div style={styles.muted}>
                      {selected.progress[l].quizDone ? `Quiz : ${selected.progress[l].quizScore}/${COURSES[l].quiz.length}` : 'Quiz non fait'}
                    </div>
                    {writings[l] ? (
                      <div style={styles.teacherWriting}>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{writings[l].text}</p>
                        {writings[l].feedback && (
                          <div style={styles.feedbackBox}><strong>Correction envoyée :</strong><p style={{ whiteSpace: 'pre-wrap' }}>{writings[l].feedback}</p></div>
                        )}
                        <textarea style={styles.textarea} rows={3} placeholder="Écrire une correction / un commentaire…"
                          value={feedbackDraft[l] || ''} onChange={e => setFeedbackDraft({ ...feedbackDraft, [l]: e.target.value })} />
                        <button style={styles.secondaryBtn} onClick={() => sendFeedback(l)}
                          disabled={!(feedbackDraft[l] || '').trim() || feedbackState[l] === 'saving'}>
                          {feedbackState[l] === 'saving' ? 'Envoi…' : 'Envoyer la correction'}
                        </button>
                        {feedbackState[l] === 'saved' && <span style={{ ...styles.infoText, marginLeft: 12 }}>Correction envoyée.</span>}
                        {feedbackState[l] === 'error' && <span style={{ ...styles.errorText, marginLeft: 12 }}>Échec de l'envoi.</span>}
                      </div>
                    ) : (
                      <div style={styles.muted}>Pas encore d'expression écrite envoyée.</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */

export default function App() {
  const [session, setSession] = useState(null); // { token, student }
  const [teacherToken, setTeacherToken] = useState(() => readToken(TEACHER_TOKEN_KEY));
  const [view, setView] = useState(() => (readToken(STUDENT_TOKEN_KEY) ? 'restoring' : 'login')); // restoring | login | dashboard | level | teacher
  const [activeLevel, setActiveLevel] = useState(null);

  // Reprise de session après rechargement de la page.
  useEffect(() => {
    const token = readToken(STUDENT_TOKEN_KEY);
    if (!token) return;
    api.studentMe(token).then(res => {
      if (res?.status === 'ok') {
        setSession({ token, student: res.student });
        setView(v => (v === 'restoring' ? 'dashboard' : v));
      } else {
        if (res?.status === 'unauthorized') writeToken(STUDENT_TOKEN_KEY, null);
        setView(v => (v === 'restoring' ? 'login' : v));
      }
    });
  }, []);

  const handleLogin = (token, student) => {
    writeToken(STUDENT_TOKEN_KEY, token);
    setSession({ token, student });
    setView('dashboard');
  };

  const handleLogout = () => {
    if (session) api.logout(session.token);
    writeToken(STUDENT_TOKEN_KEY, null);
    setSession(null);
    setView('login');
  };

  const handleStudentUpdate = (student) => setSession(s => (s ? { ...s, student } : s));

  const setTeacher = (token) => {
    writeToken(TEACHER_TOKEN_KEY, token);
    setTeacherToken(token);
  };
  const expireTeacher = useCallback(() => {
    writeToken(TEACHER_TOKEN_KEY, null);
    setTeacherToken(null);
  }, []);
  const leaveTeacher = () => setView(session ? 'dashboard' : 'login');
  const teacherLogout = () => {
    if (teacherToken) api.logout(teacherToken);
    setTeacher(null);
    leaveTeacher();
  };

  let content;
  if (view === 'restoring') {
    content = <div style={styles.loginWrap}><p style={styles.muted}>Chargement…</p></div>;
  } else if (view === 'teacher') {
    content = teacherToken
      ? <TeacherView token={teacherToken} onLogout={teacherLogout} onExpired={expireTeacher} />
      : <TeacherLogin onLogin={setTeacher} onBack={leaveTeacher} />;
  } else if (view === 'level' && session && activeLevel) {
    content = (
      <LevelView
        session={session}
        level={activeLevel}
        onBack={() => setView('dashboard')}
        onLogout={handleLogout}
        onStudentUpdate={handleStudentUpdate}
      />
    );
  } else if (view === 'dashboard' && session) {
    content = (
      <Dashboard
        student={session.student}
        onOpenLevel={(l) => { setActiveLevel(l); setView('level'); }}
        onLogout={handleLogout}
        onTeacher={() => setView('teacher')}
      />
    );
  } else {
    content = (
      <>
        <LoginScreen onLogin={handleLogin} />
        <div style={styles.teacherEntry}>
          <button style={styles.linkBtn} onClick={() => setView('teacher')}>Accès formateur</button>
        </div>
      </>
    );
  }

  return <Shell>{content}</Shell>;
}

function Shell({ children }) {
  return (
    <div style={styles.shell}>
      <style>{`
        * { box-sizing: border-box; }
        button { font-family: inherit; cursor: pointer; }
        button:disabled { cursor: default; opacity: 0.6; }
        input, textarea { font-family: inherit; }
        input:focus, textarea:focus, button:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        @media (max-width: 640px) { .teacher-layout { grid-template-columns: 1fr !important; } }
      `}</style>
      {api.mode === 'local' && (
        <div style={styles.demoBanner}>
          Mode démo local : les données restent dans ce navigateur (Supabase non configuré).
        </div>
      )}
      {children}
    </div>
  );
}
