-- A GLEAM — color variants: one product listing per style, multiple colors
-- (each with its own photos + stock), selectable on the product page and
-- changeable on the cart page.
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  color_name text not null,
  images text[] not null default '{}',
  stock_quantity integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table product_variants enable row level security;

create policy "public read variants of published products" on product_variants
  for select using (
    exists (
      select 1 from products p
      where p.id = product_variants.product_id and p.is_published = true
    )
  );

create policy "admin manage variants" on product_variants
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
-- Note: tightened to a real is_admin() check in the Phase 5 RLS migration,
-- same as the other admin-only policies.

-- order_items needs to record which color variant was actually ordered
alter table order_items
  add column if not exists variant_id uuid references product_variants(id),
  add column if not exists color_name text;
