-- GardenScene Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Portfolio entries
create table if not exists portfolio (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  before_image text not null,
  after_image text not null,
  category text not null check (category in ('lawn-restoration', 'hedge-trimming', 'garden-clean-up', 'planting-flowers')),
  tags text[] default '{}',
  facebook_post_id text,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- Quote requests
create table if not exists quote_requests (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text not null,
  address text not null,
  image_url text,
  visualization_url text,
  preferences jsonb default '{}',
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost')),
  notes text,
  created_at timestamptz default now()
);

-- Clients (managed by GardenScene admin)
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text not null,
  phone text not null unique,
  email text,
  last_visit date,
  paid boolean default false,
  access_token text unique default encode(gen_random_bytes(32), 'hex'),
  latitude numeric(9,6),
  longitude numeric(9,6),
  active boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Garden health scores (one per client photo upload)
create table if not exists garden_health_scores (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  image_url text not null,
  analysis_notes text,
  analyzed_at timestamptz default now()
);

-- Watering logs
create table if not exists watering_logs (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  watered boolean not null,
  logged_at timestamptz default now()
);

-- Rainfall cache (avoid hitting weather API too often)
create table if not exists rainfall_cache (
  id uuid primary key default uuid_generate_v4(),
  location text not null,
  rainfall_mm numeric(6,2) not null,
  period_hours integer not null default 48,
  fetched_at timestamptz default now()
);

-- Indexes
create index if not exists idx_portfolio_category on portfolio(category);
create index if not exists idx_garden_health_client on garden_health_scores(client_id, analyzed_at desc);
create index if not exists idx_watering_client on watering_logs(client_id, logged_at desc);
create index if not exists idx_clients_phone on clients(phone);
create index if not exists idx_clients_token on clients(access_token);
create index if not exists idx_quotes_status on quote_requests(status, created_at desc);

-- Row-level security (public can read portfolio, rest is protected)
alter table portfolio enable row level security;
alter table quote_requests enable row level security;
alter table clients enable row level security;
alter table garden_health_scores enable row level security;
alter table watering_logs enable row level security;
alter table rainfall_cache enable row level security;

-- Portfolio is publicly readable
create policy "Portfolio is public" on portfolio for select using (true);

-- Everything else requires service role (handled server-side)
create policy "Service role only" on quote_requests using (auth.role() = 'service_role');
create policy "Service role only" on clients using (auth.role() = 'service_role');
create policy "Service role only" on garden_health_scores using (auth.role() = 'service_role');
create policy "Service role only" on watering_logs using (auth.role() = 'service_role');
create policy "Service role only" on rainfall_cache using (auth.role() = 'service_role');
