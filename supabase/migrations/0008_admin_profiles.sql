-- A GLEAM — Phase 5: real admin flag (profiles.is_admin) replacing the
-- "anyone logged in = admin" placeholder every policy used until now.
-- Safe to run even though only one admin account exists today — this is
-- what unblocks opening customer sign-up later without granting them
-- admin rights by accident.
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "users read own profile" on profiles
  for select using (auth.uid() = id);

-- Auto-create a profile row (non-admin by default) for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Single source of truth for "is this request from a real admin?" — every
-- admin-only policy below calls this instead of repeating the subquery.
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ── Replace every "auth.role() = 'authenticated'" admin check ─────────────

drop policy if exists "admin manage products" on products;
create policy "admin manage products" on products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin read orders" on orders;
create policy "admin read orders" on orders
  for select using (public.is_admin());

drop policy if exists "admin update orders" on orders;
create policy "admin update orders" on orders
  for update using (public.is_admin());

drop policy if exists "admin read order_items" on order_items;
create policy "admin read order_items" on order_items
  for select using (public.is_admin());

drop policy if exists "admin update shop settings" on shop_settings;
create policy "admin update shop settings" on shop_settings
  for update using (public.is_admin());

drop policy if exists "admin manage reviews" on reviews;
create policy "admin manage reviews" on reviews
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manage variants" on product_variants;
create policy "admin manage variants" on product_variants
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin write product media" on storage.objects;
create policy "admin write product media" on storage.objects
  for insert with check (bucket_id = 'product-media' and public.is_admin());

drop policy if exists "admin update product media" on storage.objects;
create policy "admin update product media" on storage.objects
  for update using (bucket_id = 'product-media' and public.is_admin());

drop policy if exists "admin delete product media" on storage.objects;
create policy "admin delete product media" on storage.objects
  for delete using (bucket_id = 'product-media' and public.is_admin());
