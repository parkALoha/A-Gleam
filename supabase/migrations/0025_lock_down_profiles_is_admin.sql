-- A GLEAM — CRITICAL SECURITY FIX: any logged-in customer could grant
-- themselves admin access.
--
-- "users update own profile" (0010_profile_details.sql) only checks
-- `auth.uid() = id` — it never restricts which COLUMNS can change. Since
-- `profiles.is_admin` lives on the same row, any signed-in customer could
-- call the public Supabase REST API directly (using only the publishable
-- anon key + their own session, no app code needed) and run:
--   supabase.from('profiles').update({ is_admin: true }).eq('id', myOwnId)
-- ...which RLS happily allowed, instantly making them a full admin (manage
-- all products/orders/customer data). Confirmed exploitable live before
-- this fix. The app's own update-profile route was never at fault (it
-- never sends is_admin) — the hole was reachable by going around it.
--
-- Fix: a trigger that silently reverts any change to is_admin unless the
-- write comes from the service_role (used by scripts/set-admin.mjs and any
-- future backend admin-invite flow). Using a trigger instead of tightening
-- RLS's WITH CHECK because RLS can't compare OLD vs NEW column-by-column —
-- only a trigger can allow every other profile field to keep updating
-- normally while single out this one column.
--
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

create or replace function public.protect_is_admin()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin then
    if auth.role() <> 'service_role' then
      new.is_admin := old.is_admin;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_is_admin_trigger on profiles;
create trigger protect_is_admin_trigger
  before update on profiles
  for each row execute function public.protect_is_admin();
