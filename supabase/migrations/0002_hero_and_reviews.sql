-- A GLEAM — hero banner config + customer review gallery
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table shop_settings
  add column if not exists hero_image_url text,
  add column if not exists hero_headline text,
  add column if not exists hero_subheadline text,
  add column if not exists reviews_section_enabled boolean not null default false;

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  customer_handle text not null,
  image_url text not null,
  caption text,
  rating integer not null default 5 check (rating between 1 and 5),
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table reviews enable row level security;

create policy "public read visible reviews" on reviews
  for select using (is_visible = true);

create policy "admin manage reviews" on reviews
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
-- Note: this policy will be tightened to a real is_admin() check in the
-- Phase 5 migration (0003_profiles_and_admin_rls.sql), same as the other
-- admin-only policies from 0001_init.sql.
