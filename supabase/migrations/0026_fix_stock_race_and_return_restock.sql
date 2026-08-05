-- A GLEAM — two stock-accounting bugs found in QA:
--
-- 1. confirm_order()'s stock guard (0021) reads stock_quantity, checks it,
--    then writes it — but the read and write aren't lock-protected. Two
--    orders confirmed at nearly the same instant (two admins, or admin +
--    auto-confirm) can both read the same pre-decrement stock, both pass
--    the guard, and both decrement — taking stock negative. Fix: lock the
--    touched variant rows (SELECT ... FOR UPDATE) before checking, so a
--    second concurrent confirm on the same variant blocks until the first
--    transaction commits and re-checks against the now-current stock.
--
-- 2. Marking an order "returned" never restores stock_quantity — a
--    physically-returned item stays permanently counted as sold until an
--    admin manually edits the product. Fix: a restock_returned_order() RPC,
--    called from the return API route right after the status flips to
--    'returned'.
--
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

create or replace function confirm_order(p_order_id uuid)
returns void
language plpgsql
as $$
begin
  update orders
  set status = 'confirmed', updated_at = now()
  where id = p_order_id and status = 'pending_verification';

  if not found then
    raise exception 'order not found or not pending verification';
  end if;

  -- Lock the variant rows this order touches before reading their stock,
  -- so a concurrent confirm_order() for a different order sharing a
  -- variant has to wait for this transaction to finish first.
  perform 1
  from product_variants v
  join order_items oi on oi.variant_id = v.id
  where oi.order_id = p_order_id
  for update of v;

  if exists (
    select 1
    from order_items oi
    join product_variants v on v.id = oi.variant_id
    where oi.order_id = p_order_id
      and v.stock_quantity < oi.quantity
  ) then
    raise exception 'insufficient stock for one or more items in this order';
  end if;

  update product_variants v
  set stock_quantity = v.stock_quantity - oi.quantity
  from order_items oi
  where oi.order_id = p_order_id
    and oi.variant_id = v.id;
end;
$$;

create or replace function restock_returned_order(p_order_id uuid)
returns void
language plpgsql
as $$
begin
  update product_variants v
  set stock_quantity = v.stock_quantity + oi.quantity
  from order_items oi
  where oi.order_id = p_order_id
    and oi.variant_id = v.id;
end;
$$;

revoke all on function restock_returned_order(uuid) from public;
grant execute on function restock_returned_order(uuid) to service_role;
