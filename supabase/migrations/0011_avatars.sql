-- A GLEAM — customer profile pictures. Public bucket (avatars are meant to
-- be seen), but each customer can only write to their own folder
-- (avatars/<user-id>/...), enforced by matching the folder name to auth.uid().
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table profiles
  add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "public read avatars" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "users upload own avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users update own avatar" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete own avatar" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
