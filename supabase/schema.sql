-- ============================================================
-- DELF Platform — schéma Supabase
-- À exécuter une fois dans Supabase : SQL Editor → New query → Run.
-- Le script est ré-exécutable (idempotent).
--
-- Principe de sécurité : le navigateur n'a AUCUN accès direct aux tables
-- (RLS activé, aucune policy). Tout passe par des fonctions RPC
-- « security definer » qui vérifient le code PIN (haché avec bcrypt)
-- ou le jeton de session.
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- Tables ----------
-- Compatible avec les tables existantes :
--   students (name, pin, progress jsonb, created_at)
--   writings (id, student_name, level, text, feedback, submitted_at)
-- Elles ne sont créées que si elles n'existent pas encore ; le script ajoute
-- seulement ce qui manque (colonnes anti force brute, index d'unicité).

create table if not exists public.students (
  name       text primary key,
  pin        text not null,
  progress   jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.writings (
  id           bigint generated always as identity primary key,
  student_name text not null,
  level        text not null,
  text         text not null,
  feedback     text default '',
  submitted_at timestamptz not null default now()
);

-- La colonne « pin » contient désormais un hachage bcrypt, jamais le code en clair.
alter table public.students alter column pin type text using pin::text;
alter table public.students add column if not exists failed_attempts int not null default 0;
alter table public.students add column if not exists locked_until timestamptz;
create unique index if not exists students_name_uniq on public.students (name);
create index if not exists writings_student_level_idx on public.writings (student_name, level, submitted_at desc);

-- Hache les éventuels codes encore stockés en clair (4 chiffres).
update public.students set pin = extensions.crypt(pin, extensions.gen_salt('bf'))
 where pin ~ '^[0-9]{4}$';

create table if not exists public.sessions (
  token        uuid primary key default gen_random_uuid(),
  student_name text,
  is_teacher   boolean not null default false,
  expires_at   timestamptz not null default now() + interval '30 days'
);

create table if not exists public.app_config (
  id                    int primary key default 1 check (id = 1),
  teacher_password_hash text not null
);

alter table public.students   enable row level security;
alter table public.writings   enable row level security;
alter table public.sessions   enable row level security;
alter table public.app_config enable row level security;

revoke all on public.students, public.writings, public.sessions, public.app_config from anon, authenticated;

-- ---------- Helpers internes (non exposés) ----------

create or replace function public._empty_progress() returns jsonb
language sql immutable as $$
  select '{"A1":{"quizDone":false,"quizScore":0,"writingSubmitted":false},
           "A2":{"quizDone":false,"quizScore":0,"writingSubmitted":false},
           "B1":{"quizDone":false,"quizScore":0,"writingSubmitted":false},
           "B2":{"quizDone":false,"quizScore":0,"writingSubmitted":false}}'::jsonb
$$;

create or replace function public._student_json(s public.students) returns jsonb
language sql stable as $$
  select jsonb_build_object('name', s.name, 'progress', s.progress, 'createdAt', s.created_at)
$$;

create or replace function public._writing_json(w public.writings) returns jsonb
language sql stable as $$
  select case when w.student_name is null then null
    else jsonb_build_object('text', w.text, 'submittedAt', w.submitted_at, 'feedback', coalesce(w.feedback, '')) end
$$;

create or replace function public._session_student(p_token uuid) returns text
language sql stable security definer set search_path = public as $$
  select student_name from public.sessions
  where token = p_token and not is_teacher and expires_at > now()
$$;

create or replace function public._session_is_teacher(p_token uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.sessions where token = p_token and is_teacher and expires_at > now())
$$;

-- ---------- Élèves ----------

create or replace function public.register_student(p_name text, p_pin text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_name  text := btrim(coalesce(p_name, ''));
  v_token uuid;
  s       public.students;
begin
  if v_name = '' or char_length(v_name) > 40 or coalesce(p_pin, '') !~ '^[0-9]{4}$' then
    return jsonb_build_object('status', 'invalid');
  end if;
  insert into public.students (name, pin, progress, created_at)
  values (v_name, crypt(p_pin, gen_salt('bf')), public._empty_progress(), now())
  on conflict (name) do nothing
  returning * into s;
  if not found then
    return jsonb_build_object('status', 'name_taken');
  end if;
  insert into public.sessions (student_name) values (v_name) returning token into v_token;
  return jsonb_build_object('status', 'ok', 'token', v_token, 'student', public._student_json(s));
end $$;

-- 5 codes faux d'affilée → compte verrouillé 15 minutes (anti force brute).
create or replace function public.login_student(p_name text, p_pin text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  s       public.students;
  v_token uuid;
begin
  select * into s from public.students where name = btrim(coalesce(p_name, '')) for update;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;
  if s.locked_until is not null and s.locked_until > now() then
    return jsonb_build_object('status', 'locked');
  end if;
  if s.pin <> crypt(coalesce(p_pin, ''), s.pin) then
    update public.students
       set failed_attempts = failed_attempts + 1,
           locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' end
     where name = s.name;
    return jsonb_build_object('status', 'bad_pin');
  end if;
  update public.students set failed_attempts = 0, locked_until = null where name = s.name;
  delete from public.sessions where expires_at < now();
  insert into public.sessions (student_name) values (s.name) returning token into v_token;
  return jsonb_build_object('status', 'ok', 'token', v_token, 'student', public._student_json(s));
end $$;

create or replace function public.student_me(p_token uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare s public.students;
begin
  select * into s from public.students where name = public._session_student(p_token);
  if not found then return jsonb_build_object('status', 'unauthorized'); end if;
  return jsonb_build_object('status', 'ok', 'student', public._student_json(s));
end $$;

create or replace function public.logout(p_token uuid) returns jsonb
language sql security definer set search_path = public as $$
  delete from public.sessions where token = p_token;
  select jsonb_build_object('status', 'ok');
$$;

create or replace function public.record_quiz(p_token uuid, p_level text, p_score int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_name text := public._session_student(p_token);
  s      public.students;
begin
  if v_name is null then return jsonb_build_object('status', 'unauthorized'); end if;
  if p_level not in ('A1', 'A2', 'B1', 'B2') or p_score is null or p_score < 0 or p_score > 5 then
    return jsonb_build_object('status', 'invalid');
  end if;
  update public.students
     set progress = jsonb_set(progress, array[p_level],
           coalesce(progress -> p_level, '{}'::jsonb) || jsonb_build_object(
             'quizDone', true,
             'quizScore', greatest(p_score, coalesce((progress -> p_level ->> 'quizScore')::int, 0))))
   where name = v_name
   returning * into s;
  return jsonb_build_object('status', 'ok', 'student', public._student_json(s));
end $$;

create or replace function public.get_writing(p_token uuid, p_level text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_name text := public._session_student(p_token);
  w      public.writings;
begin
  if v_name is null then return jsonb_build_object('status', 'unauthorized'); end if;
  select * into w from public.writings where student_name = v_name and level = p_level
   order by submitted_at desc limit 1;
  return jsonb_build_object('status', 'ok', 'writing', public._writing_json(w));
end $$;

create or replace function public.submit_writing(p_token uuid, p_level text, p_text text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_name text := public._session_student(p_token);
  v_text text := btrim(coalesce(p_text, ''));
  w      public.writings;
  s      public.students;
begin
  if v_name is null then return jsonb_build_object('status', 'unauthorized'); end if;
  if p_level not in ('A1', 'A2', 'B1', 'B2') or char_length(v_text) < 20 or char_length(v_text) > 20000 then
    return jsonb_build_object('status', 'invalid');
  end if;
  -- Une seule expression écrite par élève et par niveau : la nouvelle version
  -- remplace l'ancienne (et efface l'ancienne correction).
  update public.writings set text = v_text, submitted_at = now(), feedback = ''
   where id = (select id from public.writings where student_name = v_name and level = p_level
               order by submitted_at desc limit 1)
  returning * into w;
  if not found then
    insert into public.writings (student_name, level, text, submitted_at, feedback)
    values (v_name, p_level, v_text, now(), '')
    returning * into w;
  end if;
  update public.students
     set progress = jsonb_set(progress, array[p_level],
           coalesce(progress -> p_level, '{}'::jsonb) || '{"writingSubmitted": true}'::jsonb)
   where name = v_name
   returning * into s;
  return jsonb_build_object('status', 'ok', 'writing', public._writing_json(w), 'student', public._student_json(s));
end $$;

-- ---------- Formateur ----------

create or replace function public.teacher_login(p_password text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_hash  text;
  v_token uuid;
begin
  select teacher_password_hash into v_hash from public.app_config where id = 1;
  if v_hash is null then return jsonb_build_object('status', 'not_configured'); end if;
  if v_hash <> crypt(coalesce(p_password, ''), v_hash) then
    perform pg_sleep(1);
    return jsonb_build_object('status', 'bad_password');
  end if;
  insert into public.sessions (is_teacher, expires_at) values (true, now() + interval '12 hours')
  returning token into v_token;
  return jsonb_build_object('status', 'ok', 'token', v_token);
end $$;

create or replace function public.teacher_list_students(p_token uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public._session_is_teacher(p_token) then return jsonb_build_object('status', 'unauthorized'); end if;
  return jsonb_build_object('status', 'ok', 'students', coalesce(
    (select jsonb_agg(public._student_json(s) order by s.name) from public.students s), '[]'::jsonb));
end $$;

create or replace function public.teacher_get_writings(p_token uuid, p_name text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public._session_is_teacher(p_token) then return jsonb_build_object('status', 'unauthorized'); end if;
  return jsonb_build_object('status', 'ok', 'writings', coalesce(
    (select jsonb_object_agg(w.level, public._writing_json(w))
       from (select distinct on (level) * from public.writings
              where student_name = p_name order by level, submitted_at desc) w),
    '{}'::jsonb));
end $$;

create or replace function public.teacher_set_feedback(p_token uuid, p_name text, p_level text, p_feedback text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare w public.writings;
begin
  if not public._session_is_teacher(p_token) then return jsonb_build_object('status', 'unauthorized'); end if;
  update public.writings set feedback = btrim(coalesce(p_feedback, ''))
   where id = (select id from public.writings where student_name = p_name and level = p_level
               order by submitted_at desc limit 1)
   returning * into w;
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  return jsonb_build_object('status', 'ok', 'writing', public._writing_json(w));
end $$;

-- ---------- Droits ----------
-- Seules les fonctions publiques ci-dessous sont appelables depuis le navigateur.

revoke all on all functions in schema public from public, anon, authenticated;

grant execute on function
  public.register_student(text, text),
  public.login_student(text, text),
  public.student_me(uuid),
  public.logout(uuid),
  public.record_quiz(uuid, text, int),
  public.get_writing(uuid, text),
  public.submit_writing(uuid, text, text),
  public.teacher_login(text),
  public.teacher_list_students(uuid),
  public.teacher_get_writings(uuid, text),
  public.teacher_set_feedback(uuid, text, text, text)
to anon, authenticated;
