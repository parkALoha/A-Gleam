-- A GLEAM — let logged-in customers submit their own review tied to a
-- delivered order (photo + caption + star rating), pending admin approval
-- via the existing is_visible toggle. One review per order.
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run

alter table reviews
  add column if not exists order_id uuid references orders(id) on delete cascade,
  add column if not exists customer_id uuid references auth.users(id) on delete cascade;

create unique index if not exists reviews_order_id_key on reviews (order_id);

alter table reviews alter column is_visible set default false;

create policy "customers insert own review" on reviews
  for insert with check (
    customer_id = auth.uid()
    and exists (
      select 1 from orders o
      where o.id = order_id
        and o.customer_id = auth.uid()
        and o.status = 'delivered'
    )
  );

create policy "customers read own reviews" on reviews
  for select using (customer_id = auth.uid());

-- Storage bucket for customer-submitted review photos, folder-scoped like
-- the avatars bucket (avatars/<user-id>/...) so customers can only write
-- into their own folder.
insert into storage.buckets (id, name, public)
  values ('review-photos', 'review-photos', true)
  on conflict (id) do nothing;

create policy "public read review photos" on storage.objects
  for select using (bucket_id = 'review-photos');

create policy "customers upload own review photos" on storage.objects
  for insert with check (
    bucket_id = 'review-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
