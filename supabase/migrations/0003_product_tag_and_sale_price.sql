-- A GLEAM — constrain product tag to a fixed set (easy dropdown for admin
-- later) + add an optional "compare at" price so a "ลดราคา" (sale) tag can
-- show a real discount, not just a decorative badge.
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table products
  add constraint products_tag_check
  check (tag is null or tag in ('ใหม่', 'ขายดี', 'ลดราคา'));

alter table products
  add column if not exists compare_at_price numeric(10,2);
