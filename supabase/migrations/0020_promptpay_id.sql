-- A GLEAM — PromptPay ID for generating a dynamic per-order QR (amount
-- baked into the QR itself, instead of a single static uploaded image).
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table shop_settings
  add column if not exists promptpay_id text;
