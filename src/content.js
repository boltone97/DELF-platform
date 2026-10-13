// Contenu pédagogique — DELF A1 à B2

export const LEVELS = ['A1', 'A2', 'B1', 'B2'];

export const LEVEL_INFO = {
  A1: { name: 'Découverte', desc: "Se présenter, échanger sur des besoins simples de la vie quotidienne." },
  A2: { name: 'Survie', desc: "Communiquer dans des situations courantes et raconter des événements passés." },
  B1: { name: 'Seuil', desc: "Exprimer une opinion, argumenter simplement, gérer l'imprévu." },
  B2: { name: 'Avancé', desc: "Débattre, nuancer sa pensée, comprendre des textes complexes." },
};

export const COURSES = {
  A1: {
    grammar: [
      { title: "Les articles définis et indéfinis", body: "le / la / les (défini) désignent une chose précise. un / une / des (indéfini) désignent une chose non précisée. Ex : « J'ai un chat. Le chat s'appelle Milo. »" },
      { title: "Le présent de l'indicatif", body: "Les verbes réguliers en -ER se conjuguent sur le modèle de « parler » : je parle, tu parles, il/elle parle, nous parlons, vous parlez, ils/elles parlent. Être et avoir sont irréguliers et à mémoriser en priorité." },
      { title: "Se présenter", body: "Structures clés : Je m'appelle... / J'ai ... ans / J'habite à... / Je suis (nationalité, métier). Pour poser une question simple : Comment tu t'appelles ? Où habites-tu ?" },
    ],
    vocab: ["la famille", "les nombres de 0 à 100", "les jours de la semaine", "les couleurs", "les aliments courants"],
    quiz: [
      { q: "Complétez : « ___ chat de ma sœur est noir. »", options: ["Le", "La", "Les", "Un"], correct: 0 },
      { q: "Quelle est la forme correcte du verbe « avoir » avec « nous » ?", options: ["avons", "avez", "ont", "as"], correct: 0 },
      { q: "« Je ___ étudiant. »", options: ["es", "suis", "est", "sommes"], correct: 1 },
      { q: "Comment demande-t-on l'âge de quelqu'un poliment ?", options: ["Tu as combien ?", "Quel âge as-tu ?", "Comment tu as ?", "Tu es qui ?"], correct: 1 },
      { q: "« Il y a sept ___ dans une semaine. »", options: ["mois", "jours", "ans", "heures"], correct: 1 },
    ],
    writingPrompt: "Présentez-vous en 5 phrases minimum : nom, âge, ville, famille, une chose que vous aimez.",
  },
  A2: {
    grammar: [
      { title: "Le passé composé", body: "Formation : auxiliaire (avoir/être) au présent + participe passé. La plupart des verbes utilisent « avoir ». Les verbes de mouvement (aller, venir, partir...) et les verbes pronominaux utilisent « être », avec accord du participe." },
      { title: "Les expressions de fréquence", body: "toujours, souvent, parfois, rarement, jamais, tous les jours, une fois par semaine. Elles se placent généralement après le verbe conjugué." },
      { title: "Les comparatifs", body: "plus... que / moins... que / aussi... que. Ex : « Paris est plus grand que Lyon. » Attention à l'irrégulier : bon → meilleur." },
    ],
    vocab: ["les transports", "faire les courses", "les vêtements", "le corps et la santé", "les loisirs"],
    quiz: [
      { q: "« Hier, je ___ au cinéma. » (aller, passé composé)", options: ["ai allé", "suis allé", "ai été", "allais"], correct: 1 },
      { q: "« Elle ___ ses devoirs avant le dîner. » (finir)", options: ["a fini", "est finie", "finissait", "a finit"], correct: 0 },
      { q: "Quel mot exprime une fréquence élevée ?", options: ["jamais", "rarement", "souvent", "parfois"], correct: 2 },
      { q: "« Ce livre est ___ intéressant que le film. »", options: ["plus", "meilleur", "aussi bon", "bien"], correct: 0 },
      { q: "Participe passé de « prendre » ?", options: ["pris", "prendu", "prend", "prenu"], correct: 0 },
    ],
    writingPrompt: "Racontez votre dernier week-end (au passé composé), en 6 phrases minimum.",
  },
  B1: {
    grammar: [
      { title: "Le subjonctif présent (usages courants)", body: "Après « il faut que », « je veux que », « bien que »... Formation : à partir de la 3e pers. pluriel du présent (ils parlent → que je parle) + terminaisons -e, -es, -e, -ions, -iez, -ent." },
      { title: "Exprimer une opinion", body: "Je pense que / Je trouve que / À mon avis / Selon moi + indicatif. Mais : Je ne pense pas que + subjonctif." },
      { title: "Les connecteurs logiques", body: "Cause : parce que, car, puisque. Conséquence : donc, c'est pourquoi, alors. Opposition : mais, cependant, pourtant." },
    ],
    vocab: ["l'environnement", "le monde du travail", "les médias", "les sentiments", "la vie associative"],
    quiz: [
      { q: "« Il faut que tu ___ à l'heure. » (venir)", options: ["viens", "viennes", "venais", "viendras"], correct: 1 },
      { q: "« Je ne pense pas qu'il ___ raison. » (avoir)", options: ["a", "ait", "aura", "avait"], correct: 1 },
      { q: "Quel connecteur exprime une opposition ?", options: ["donc", "car", "cependant", "puisque"], correct: 2 },
      { q: "« ___ moi, cette décision est injuste. »", options: ["À", "Selon", "Par", "De"], correct: 1 },
      { q: "« Il travaille beaucoup, ___ il réussit ses examens. »", options: ["donc", "bien que", "parce que", "afin que"], correct: 0 },
    ],
    writingPrompt: "Donnez votre opinion sur le télétravail : avantages, inconvénients, et votre position personnelle (10 phrases minimum).",
  },
  B2: {
    grammar: [
      { title: "Le subjonctif passé", body: "Pour exprimer un fait antérieur dans une proposition au subjonctif : avoir/être au subjonctif présent + participe passé. Ex : « Je suis content qu'elle ait réussi son examen. »" },
      { title: "La concordance des temps", body: "Au discours indirect passé, les temps reculent : présent → imparfait, passé composé → plus-que-parfait, futur → conditionnel présent." },
      { title: "Nuancer sa pensée", body: "Bien que / quoique + subjonctif pour la concession. Dans la mesure où pour une restriction. Il n'empêche que pour une opposition atténuée." },
    ],
    vocab: ["l'argumentation soutenue", "l'actualité politique", "les enjeux de société", "les nuances de sentiment", "le registre soutenu vs familier"],
    quiz: [
      { q: "« Je regrette qu'il ___ hier. » (partir, subjonctif passé)", options: ["parte", "soit parti", "était parti", "partait"], correct: 1 },
      { q: "Discours indirect passé : « Il a dit : je viendrai. » → « Il a dit qu'il ___. »", options: ["viendra", "viendrait", "vienne", "venait"], correct: 1 },
      { q: "« ___ il pleuve, la manifestation aura lieu. »", options: ["Parce que", "Bien que", "Puisque", "Comme"], correct: 1 },
      { q: "Quel registre est « bagnole » ?", options: ["soutenu", "standard", "familier", "administratif"], correct: 2 },
      { q: "« Dans la mesure où vous ___ vos preuves, nous accepterons. » (apporter)", options: ["apportez", "apportiez", "avez apporté", "apporteriez"], correct: 2 },
    ],
    writingPrompt: "Rédigez un essai argumenté sur un enjeu de société de votre choix (pour/contre, exemples, conclusion nuancée — 15 phrases minimum).",
  },
};

export const scoreQuiz = (quiz, answers) =>
  quiz.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);

export const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;
