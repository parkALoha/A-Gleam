-- A GLEAM — Web Push subscriptions for the admin PWA, so an admin can get a
-- real notification on their phone/laptop when a new order comes in without
-- needing the tab open. One admin can have several rows (one per device/
-- browser they've enabled notifications on).
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "admin manage own push subscriptions" on push_subscriptions
  for all using (public.is_admin() and auth.uid() = user_id)
  with check (public.is_admin() and auth.uid() = user_id);
