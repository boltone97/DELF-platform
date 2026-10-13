// Tokens : navy / paper / gold — thème « diplôme »

const vars = {
  '--ink': '#14213D',
  '--paper': '#E7DFCB',
  '--paper-light': '#F4EFE2',
  '--gold': '#A6813C',
  '--sage': '#4C7A5B',
  '--rust': '#A63D40',
  '--text': '#1B1B18',
  '--text-muted': '#6B6355',
};

export const styles = {
  shell: { ...vars, minHeight: '100%', width: '100%', background: 'var(--paper)', fontFamily: "'Inter', sans-serif", color: 'var(--text)' },
  page: { minHeight: '100%', display: 'flex', flexDirection: 'column' },

  loginWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '520px', padding: 24 },
  loginCard: { background: 'var(--paper-light)', border: '1px solid rgba(20,33,61,0.12)', borderRadius: 4, padding: '40px 36px', maxWidth: 400, width: '100%' },
  loginBadge: { display: 'inline-block', fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: 100, padding: '3px 12px', marginBottom: 18 },
  loginTitle: { fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 28, margin: '0 0 8px 0', color: 'var(--ink)' },
  loginSub: { color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.5, margin: '0 0 24px 0' },
  choiceRow: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-muted)' },
  input: { padding: '10px 12px', fontSize: 15, border: '1px solid rgba(20,33,61,0.25)', borderRadius: 3, background: '#fff', color: 'var(--text)' },
  errorText: { color: 'var(--rust)', fontSize: 13 },

  primaryBtn: { background: 'var(--ink)', color: 'var(--paper-light)', border: 'none', borderRadius: 3, padding: '11px 18px', fontSize: 14, fontWeight: 500 },
  secondaryBtn: { background: 'transparent', color: 'var(--ink)', border: '1px solid var(--ink)', borderRadius: 3, padding: '10px 18px', fontSize: 14, fontWeight: 500 },
  linkBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, textDecoration: 'underline', padding: 0, textAlign: 'left' },
  textBtn: { background: 'none', border: 'none', color: 'var(--paper-light)', fontSize: 13.5, padding: '4px 6px' },
  iconBtn: { background: 'none', border: 'none', color: 'var(--paper-light)', fontSize: 18, padding: '2px 6px' },

  teacherEntry: { display: 'flex', justifyContent: 'center', paddingBottom: 24 },

  topBar: { background: 'var(--ink)', color: 'var(--paper-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', flexWrap: 'wrap', gap: 8 },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  topBarBadge: { fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.06em', border: '1px solid var(--gold)', color: 'var(--gold)', borderRadius: 100, padding: '2px 10px' },
  topBarTitle: { fontSize: 14, opacity: 0.85 },
  topBarRight: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  topBarName: { fontSize: 14, fontWeight: 500 },

  dashBody: { padding: '32px 28px 48px', maxWidth: 900, margin: '0 auto', width: '100%' },
  h2: { fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 24, margin: '0 0 6px 0', color: 'var(--ink)' },
  h3: { fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18, margin: '28px 0 12px 0', color: 'var(--ink)' },
  muted: { color: 'var(--text-muted)', fontSize: 13.5, margin: 0 },

  levelGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginTop: 20 },
  levelCard: { textAlign: 'left', background: 'var(--paper-light)', border: '1px solid rgba(20,33,61,0.12)', borderRadius: 4, padding: 18, display: 'flex', flexDirection: 'column', gap: 8 },
  levelCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  levelBadge: { fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 20, color: 'var(--ink)' },
  levelCardName: { fontWeight: 600, fontSize: 14.5 },
  levelCardDesc: { fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.4 },

  stampGrid: { display: 'flex', flexDirection: 'column', gap: 10 },
  stampCard: { display: 'flex', alignItems: 'center', gap: 14, background: 'var(--paper-light)', border: '1px solid rgba(20,33,61,0.1)', borderRadius: 4, padding: '12px 16px' },
  stampLevel: { fontWeight: 600, fontSize: 14 },
  stampDetail: { fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 },

  levelHeader: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 },
  levelBadgeBig: { fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 34, color: 'var(--gold)', border: '2px solid var(--gold)', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  tabRow: { display: 'flex', gap: 4, borderBottom: '1px solid rgba(20,33,61,0.15)', marginTop: 20, marginBottom: 22 },
  tabBtn: { background: 'none', border: 'none', padding: '10px 4px', marginRight: 22, fontSize: 14, color: 'var(--text-muted)', borderBottom: '2px solid transparent', textTransform: 'capitalize' },
  tabBtnActive: { color: 'var(--ink)', fontWeight: 600, borderBottom: '2px solid var(--gold)' },

  coursWrap: { display: 'flex', flexDirection: 'column', gap: 8 },
  grammarCard: { background: 'var(--paper-light)', border: '1px solid rgba(20,33,61,0.1)', borderRadius: 4, padding: 16, marginBottom: 10 },
  grammarTitle: { fontWeight: 600, fontSize: 14.5, marginBottom: 6, color: 'var(--ink)' },
  grammarBody: { fontSize: 13.5, lineHeight: 1.6, color: 'var(--text)' },
  vocabList: { display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0, margin: 0 },
  vocabItem: { background: 'var(--paper-light)', border: '1px solid rgba(20,33,61,0.15)', borderRadius: 100, padding: '5px 14px', fontSize: 13 },

  quizCard: { marginBottom: 20 },
  quizQ: { fontWeight: 600, fontSize: 14.5, marginBottom: 10 },
  quizOptions: { display: 'flex', flexDirection: 'column', gap: 6 },
  quizOption: { textAlign: 'left', background: 'var(--paper-light)', border: '1px solid rgba(20,33,61,0.15)', borderRadius: 3, padding: '9px 14px', fontSize: 13.5 },
  quizOptionSelected: { borderColor: 'var(--ink)', background: '#DDD5C3' },
  quizOptionCorrect: { borderColor: 'var(--sage)', background: 'rgba(76,122,91,0.12)' },
  quizOptionWrong: { borderColor: 'var(--rust)', background: 'rgba(166,61,64,0.1)' },
  resultBox: { background: 'var(--paper-light)', border: '1px solid var(--gold)', borderRadius: 4, padding: 18, textAlign: 'center' },
  resultScore: { fontFamily: "'Fraunces', serif", fontSize: 22, color: 'var(--ink)', marginBottom: 4 },

  writingWrap: { display: 'flex', flexDirection: 'column', gap: 14 },
  writingPrompt: { background: 'var(--paper-light)', border: '1px solid var(--gold)', borderRadius: 4, padding: 16, fontSize: 14, lineHeight: 1.5 },
  writingSentBox: { background: 'var(--paper-light)', border: '1px solid rgba(20,33,61,0.12)', borderRadius: 4, padding: 16, fontSize: 13.5, lineHeight: 1.6, marginBottom: 10 },
  feedbackBox: { marginTop: 12, paddingTop: 12, borderTop: '1px dashed rgba(20,33,61,0.2)', fontSize: 13.5 },
  textarea: { width: '100%', padding: 12, fontSize: 13.5, border: '1px solid rgba(20,33,61,0.25)', borderRadius: 3, resize: 'vertical', marginBottom: 8, background: '#fff', color: 'var(--text)' },

  teacherLayout: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, marginTop: 20 },
  studentList: { display: 'flex', flexDirection: 'column', gap: 4 },
  studentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--paper-light)', border: '1px solid rgba(20,33,61,0.1)', borderRadius: 3, padding: '10px 12px', fontSize: 13.5 },
  studentRowActive: { borderColor: 'var(--gold)', background: '#F0E9D8' },
  studentDetail: { minHeight: 200 },
  teacherLevelCard: { background: 'var(--paper-light)', border: '1px solid rgba(20,33,61,0.1)', borderRadius: 4, padding: 16, marginBottom: 12 },
  teacherWriting: { marginTop: 10, fontSize: 13.5, lineHeight: 1.6 },
};

Object.assign(styles, {
  demoBanner: { background: 'var(--ink)', color: 'var(--paper-light)', fontSize: 12.5, textAlign: 'center', padding: '6px 12px', opacity: 0.9 },
  infoText: { color: 'var(--sage)', fontSize: 13 },
});
