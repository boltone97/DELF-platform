# Préparation au DELF (A1 → B2)

Plateforme d'entraînement au DELF : cours de grammaire et vocabulaire, quiz par niveau,
expression écrite corrigée par un formateur, suivi de progression.

Projet né d'un artefact React Claude (qui utilisait `window.storage`), transformé en
application **Vite + React** avec **Supabase** comme base de données.

## Démarrer en local

```bash
npm install
npm run dev
```

Sans configuration Supabase, l'app tourne en **mode démo local** : les données restent
dans le navigateur, et le mot de passe formateur est `formateur`.

```bash
npm test         # tests unitaires
npm run build    # build de production dans dist/
```

## Brancher Supabase

1. Créez un compte et un projet sur <https://supabase.com> (offre gratuite suffisante).
2. Dans **SQL Editor → New query**, collez le contenu de [`supabase/schema.sql`](supabase/schema.sql) et cliquez **Run**.
   Le script réutilise vos tables `students (name, pin, progress, created_at)` et
   `writings (id, student_name, level, text, feedback, submitted_at)` si elles existent déjà :
   il y ajoute seulement deux colonnes anti force brute (`failed_attempts`, `locked_until`),
   un index d'unicité sur `students.name`, et deux tables techniques (`sessions`, `app_config`).
   Les codes PIN déjà présents en clair dans `students.pin` sont hachés (bcrypt).
3. Toujours dans le SQL Editor, collez [`supabase/set_teacher_password.sql`](supabase/set_teacher_password.sql),
   remplacez `CHANGEZ-MOI` par le mot de passe formateur de votre choix, puis **Run**.
   (Ne commitez pas votre vrai mot de passe.)
4. Dans **Project Settings → API**, récupérez la *Project URL* et la clé *anon / publishable*.
5. En local : copiez `.env.example` en `.env.local` et remplissez les deux valeurs.

La clé « anon » est publique par nature : elle ne donne accès à rien directement.
Les tables sont fermées (RLS sans policy) et tout passe par des fonctions RPC qui vérifient
le code de l'élève ou le jeton de session.

## Déployer

### Vercel (recommandé)

1. <https://vercel.com/new> → importez ce dépôt GitHub (Vercel détecte Vite tout seul).
2. Dans **Environment Variables**, ajoutez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
3. **Deploy**. Chaque push sur la branche principale redéploie automatiquement.

### Netlify

<https://app.netlify.com/start> → importez le dépôt (le fichier `netlify.toml` fournit déjà
la commande de build), ajoutez les deux mêmes variables d'environnement, puis déployez.

> Les variables `VITE_*` sont lues **au moment du build** : après les avoir ajoutées ou
> modifiées, relancez un déploiement.

## Structure

```
src/
  App.jsx            interface (connexion, tableau de bord, niveaux, espace formateur)
  content.js         contenu pédagogique (cours, quiz, sujets d'écriture)
  styles.js          thème « diplôme » (navy / papier / or)
  api/
    index.js         choisit Supabase ou le mode démo local
    supabase.js      appels RPC Supabase
    local.js         même API, stockée dans le navigateur (dev / tests)
supabase/
  schema.sql                 tables + fonctions RPC + droits
  set_teacher_password.sql   définir le mot de passe formateur
tests/                       tests Vitest
```

## Sécurité : ce qui a changé par rapport à l'artefact

- Codes PIN **hachés** (bcrypt) côté base, jamais renvoyés au navigateur.
- 5 codes faux d'affilée → compte bloqué 15 minutes (un code à 4 chiffres reste faible :
  c'est un outil pédagogique, pas un coffre-fort).
- L'espace formateur, auparavant ouvert à tous, est protégé par un mot de passe.
- Le score du quiz et le statut « expression écrite envoyée » sont mis à jour par le serveur,
  pas réécrits librement par le navigateur.
