-- A GLEAM — atomically confirm an order and cut stock for its items.
-- Stock must only ever be cut once per order, so the status check and the
-- stock update happen in one function instead of two separate round trips
-- from the app (which could race or partially fail).
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

  update product_variants v
  set stock_quantity = v.stock_quantity - oi.quantity
  from order_items oi
  where oi.order_id = p_order_id
    and oi.variant_id = v.id;
end;
$$;

revoke all on function confirm_order(uuid) from public;
grant execute on function confirm_order(uuid) to service_role;
