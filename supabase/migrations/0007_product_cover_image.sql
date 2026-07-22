-- A GLEAM — optional "all colors at a glance" cover image for products with
-- multiple color variants (shown on the product card and as the first
-- gallery slide before a color is picked).
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table products
  add column if not exists cover_image text;
