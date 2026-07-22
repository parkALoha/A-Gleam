-- A GLEAM — hero becomes a looping slideshow (multiple images instead of one)
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table shop_settings
  add column if not exists hero_image_urls text[] not null default '{}';
