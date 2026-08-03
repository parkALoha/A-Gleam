-- A GLEAM — confirm_order() decremented stock_quantity unconditionally, so
-- two pending orders that both claim the last unit of a variant could both
-- be confirmed, taking stock negative. Add a check before writing: if
-- confirming this order, add a stock guard to the existing function.
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

  -- Guard against a race where two pending orders both claim the same last
  -- unit and both end up confirmed (by an admin, or auto-confirm mode) —
  -- checked before writing so stock_quantity can never go negative.
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
