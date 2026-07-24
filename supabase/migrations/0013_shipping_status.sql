-- A GLEAM — extend order status with shipping stages, plus a tracking
-- number field for admin to record once an order is shipped.
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table orders
  add column if not exists tracking_number text;

alter table orders drop constraint if exists orders_status_check;

alter table orders
  add constraint orders_status_check
  check (status in (
    'pending_verification',
    'confirmed',
    'shipped',
    'delivered',
    'rejected'
  ));
