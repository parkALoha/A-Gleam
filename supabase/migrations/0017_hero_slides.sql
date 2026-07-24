-- A GLEAM — hero banner: each slide gets its own headline, text position,
-- and background overlay strength instead of one shared headline for
-- every image. Backfills existing hero_image_urls/hero_headline into the
-- new hero_slides jsonb array so nothing breaks on the way over.
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table shop_settings
  add column if not exists hero_slides jsonb not null default '[]'::jsonb;

update shop_settings
set hero_slides = (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'imageUrl', img,
        'headline', coalesce(shop_settings.hero_headline, ''),
        'position', 'bottom',
        'overlay', 'medium'
      )
    ),
    '[]'::jsonb
  )
  from unnest(shop_settings.hero_image_urls) as img
)
where hero_slides = '[]'::jsonb
  and hero_image_urls is not null
  and array_length(hero_image_urls, 1) > 0;
