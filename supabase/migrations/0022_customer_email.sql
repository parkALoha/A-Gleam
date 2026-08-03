-- A GLEAM — optional customer email on orders, so we can send order-status
-- notifications. Nullable: guest checkout without an email still works
-- exactly as before, it just won't get emailed.
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table orders
  add column if not exists customer_email text;
