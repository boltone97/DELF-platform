-- Définit (ou change) le mot de passe de l'espace formateur.
-- Remplacez le texte entre guillemets, puis exécutez dans Supabase → SQL Editor.
-- Ne commitez jamais ce fichier avec votre vrai mot de passe.

insert into public.app_config (id, teacher_password_hash)
values (1, extensions.crypt('CHANGEZ-MOI', extensions.gen_salt('bf')))
on conflict (id) do update set teacher_password_hash = excluded.teacher_password_hash;
