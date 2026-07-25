-- A GLEAM — bank code for Slip2Go's checkReceiver verification.
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table shop_settings
  add column if not exists bank_code text;
