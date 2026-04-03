-- Cover Letter Generator schema
-- Run this in your Supabase SQL editor

-- generations table: tracks each AI generation (for rate limiting)
create table if not exists generations (
  id uuid default gen_random_uuid() primary key,
  ip_address text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Index for fast rate-limit queries
create index if not exists generations_ip_created_idx on generations (ip_address, created_at);
create index if not exists generations_user_created_idx on generations (user_id, created_at);

-- subscribers table: Stripe Pro subscribers linked to auth users
create table if not exists subscribers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  email text unique,
  stripe_customer_id text unique,
  is_pro boolean default false,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table generations enable row level security;
alter table subscribers enable row level security;

-- Allow service role full access (used by server-side API routes)
create policy "Service role full access on generations"
  on generations for all
  using (true)
  with check (true);

create policy "Service role full access on subscribers"
  on subscribers for all
  using (true)
  with check (true);

-- Migration: if upgrading from a previous schema version that had email column
-- on generations, run:
-- alter table generations drop column if exists email;
-- alter table generations add column if not exists user_id uuid references auth.users(id) on delete set null;
-- alter table subscribers add column if not exists user_id uuid references auth.users(id) on delete cascade unique;
-- alter table subscribers add column if not exists stripe_customer_id text unique;
-- create unique index if not exists subscribers_stripe_customer_id_idx on subscribers (stripe_customer_id) where stripe_customer_id is not null;
