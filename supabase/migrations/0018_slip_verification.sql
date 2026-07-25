-- A GLEAM — Slip2Go auto-verification (Phase 9).
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table shop_settings
  add column if not exists slip_verification_mode text not null default 'manual'
    check (slip_verification_mode in ('manual', 'semi_auto', 'auto_confirm'));

alter table orders
  add column if not exists slip_verification_status text
    check (slip_verification_status in ('verified', 'amount_mismatch', 'fraud', 'error')),
  add column if not exists slip_verification_result jsonb;
