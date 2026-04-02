-- Cover Letter Generator schema
-- Run this in your Supabase SQL editor

-- generations table: tracks each cover letter generated (for rate limiting)
create table if not exists generations (
  id uuid default gen_random_uuid() primary key,
  ip_address text,
  email text,
  created_at timestamp with time zone default now()
);

-- Index for fast rate-limit queries
create index if not exists generations_ip_created_idx on generations (ip_address, created_at);
create index if not exists generations_email_idx on generations (email);

-- subscribers table: email captures + Stripe Pro subscribers
create table if not exists subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  stripe_customer_id text,
  is_pro boolean default false,
  created_at timestamp with time zone default now()
);

-- Row Level Security (optional but recommended)
alter table generations enable row level security;
alter table subscribers enable row level security;

-- Allow service role full access (used by server-side API)
create policy "Service role full access on generations"
  on generations for all
  using (true)
  with check (true);

create policy "Service role full access on subscribers"
  on subscribers for all
  using (true)
  with check (true);
