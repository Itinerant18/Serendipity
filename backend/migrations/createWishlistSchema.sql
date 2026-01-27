-- Create wishlist table
create table if not exists public.wishlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id text not null, -- Storing product_id as text since products might be in a different system/table or just IDs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- Enable RLS
alter table public.wishlist enable row level security;

-- Policies
create policy "Users can view their own wishlist" 
  on public.wishlist for select 
  using (auth.uid() = user_id);

create policy "Users can insert into their own wishlist" 
  on public.wishlist for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete from their own wishlist" 
  on public.wishlist for delete 
  using (auth.uid() = user_id);

-- Create index for faster lookups
create index wishlist_user_id_idx on public.wishlist(user_id);
create index wishlist_user_product_idx on public.wishlist(user_id, product_id);
