-- A GLEAM — initial schema
-- Run this once in Supabase Dashboard → SQL Editor → New query → paste → Run

create extension if not exists pgcrypto;

-- ── products ──────────────────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  price numeric(10,2) not null,
  description text,
  images text[] not null default '{}',
  video_url text,
  measurements jsonb not null default '{}'::jsonb,
  stock_quantity integer not null default 0,
  tag text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── orders ────────────────────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  shipping_address text not null,
  total_amount numeric(10,2) not null,
  slip_image_path text not null,
  status text not null default 'pending_verification'
    check (status in ('pending_verification', 'confirmed', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── order_items ───────────────────────────────────────────────────────────
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null,
  quantity integer not null
);

-- ── shop_settings (singleton row: bank account / PromptPay QR) ─────────────
create table if not exists shop_settings (
  id boolean primary key default true check (id),
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  promptpay_qr_image_url text,
  updated_at timestamptz not null default now()
);
insert into shop_settings (id) values (true) on conflict (id) do nothing;

-- ── Row Level Security ───────────────────────────────────────────────────
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table shop_settings enable row level security;

create policy "public read published products" on products
  for select using (is_published = true);
create policy "admin manage products" on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin read orders" on orders
  for select using (auth.role() = 'authenticated');
create policy "admin update orders" on orders
  for update using (auth.role() = 'authenticated');

create policy "admin read order_items" on order_items
  for select using (auth.role() = 'authenticated');

create policy "public read shop settings" on shop_settings
  for select using (true);
create policy "admin update shop settings" on shop_settings
  for update using (auth.role() = 'authenticated');

-- ── Storage buckets ──────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('product-media', 'product-media', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('payment-slips', 'payment-slips', false)
  on conflict (id) do nothing;

create policy "public read product media" on storage.objects
  for select using (bucket_id = 'product-media');
create policy "admin write product media" on storage.objects
  for insert with check (bucket_id = 'product-media' and auth.role() = 'authenticated');
create policy "admin update product media" on storage.objects
  for update using (bucket_id = 'product-media' and auth.role() = 'authenticated');
create policy "admin delete product media" on storage.objects
  for delete using (bucket_id = 'product-media' and auth.role() = 'authenticated');

-- payment-slips bucket intentionally has no public/authenticated policies:
-- it is written to and read from only via server-side code using the
-- service-role key, which bypasses RLS entirely. This keeps customer
-- payment slips inaccessible to anyone browsing the site directly.
