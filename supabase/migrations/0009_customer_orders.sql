-- A GLEAM — Phase 7: link orders to member accounts (optional) so logged-in
-- customers can see their own order history and have checkout autofilled
-- from their last order. Guest checkout still works exactly as before —
-- customer_id is nullable and only ever set after a customer creates an
-- account (or was already logged in) at checkout time.
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table orders
  add column if not exists customer_id uuid references auth.users(id) on delete set null;

create index if not exists orders_customer_id_idx on orders (customer_id);

create policy "customers read own orders" on orders
  for select using (auth.uid() = customer_id);

create policy "customers read own order_items" on order_items
  for select using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id and o.customer_id = auth.uid()
    )
  );
