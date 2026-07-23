-- A GLEAM — expand profiles into a real account profile: phone (so social
-- logins with no phone from the provider can still be linked to past guest
-- orders, and so customers can log in with phone+password instead of just
-- email), plus a saved default shipping address for checkout autofill and
-- the "ข้อมูลส่วนตัว" (my info) page.
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table profiles
  add column if not exists phone text unique,
  add column if not exists full_name text,
  add column if not exists address_line text,
  add column if not exists subdistrict text,
  add column if not exists district text,
  add column if not exists province text,
  add column if not exists postal_code text;

create policy "users update own profile" on profiles
  for update using (auth.uid() = id);
