-- A GLEAM — add "ตำหนิ" (flawed/defect item) as an allowed product tag,
-- for one-off items sold outside the normal catalog (damaged stock, etc).
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table products drop constraint if exists products_tag_check;

alter table products
  add constraint products_tag_check
  check (tag is null or tag in ('ใหม่', 'ขายดี', 'ลดราคา', 'ตำหนิ'));
