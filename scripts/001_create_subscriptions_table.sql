-- Create subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(10, 2) not null,
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly', 'weekly', 'quarterly')),
  next_billing_date date not null,
  category text not null,
  status text not null default 'active' check (status in ('active', 'cancelled', 'paused')),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.subscriptions enable row level security;

-- RLS Policies for subscriptions
create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger for updated_at
drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.handle_updated_at();
