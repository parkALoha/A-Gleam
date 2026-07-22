-- A GLEAM — structured Thai shipping address (province/district/subdistrict/postal code)
-- replaces the old single shipping_address text column.
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table orders
  add column if not exists address_line text,
  add column if not exists subdistrict text,
  add column if not exists district text,
  add column if not exists province text,
  add column if not exists postal_code text;

-- Backfill any existing test orders so the not-null constraints below don't fail
update orders
set
  address_line = coalesce(address_line, shipping_address, 'ไม่ระบุ'),
  subdistrict = coalesce(subdistrict, 'ไม่ระบุ'),
  district = coalesce(district, 'ไม่ระบุ'),
  province = coalesce(province, 'ไม่ระบุ'),
  postal_code = coalesce(postal_code, '00000')
where address_line is null
   or subdistrict is null
   or district is null
   or province is null
   or postal_code is null;

alter table orders
  alter column address_line set not null,
  alter column subdistrict set not null,
  alter column district set not null,
  alter column province set not null,
  alter column postal_code set not null;

alter table orders drop column if exists shipping_address;
