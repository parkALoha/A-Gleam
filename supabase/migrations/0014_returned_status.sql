-- A GLEAM — add "returned" status (Flash Express state 7: parcel returned
-- to sender). Manual for now since we don't have a Flash account/webhook
-- yet; will become automatic once that's wired up.
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table orders drop constraint if exists orders_status_check;

alter table orders
  add constraint orders_status_check
  check (status in (
    'pending_verification',
    'confirmed',
    'shipped',
    'delivered',
    'returned',
    'rejected'
  ));
