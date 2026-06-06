-- ─────────────────────────────────────────────
--  Mass Nutrition CMS — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────

-- 1. CLIENTS
create table if not exists clients (
  id            uuid default gen_random_uuid() primary key,
  business_name text not null,
  client_name   text not null,
  email         text unique not null,
  site_url      text,
  plan          text default 'starter' check (plan in ('starter','pro','agency')),
  status        text default 'active'  check (status in ('active','inactive')),
  created_at    timestamptz default now()
);

-- 2. SITE CONTENT (one row per client)
create table if not exists site_content (
  id              uuid default gen_random_uuid() primary key,
  client_id       uuid references clients(id) on delete cascade,
  company_name    text default '',
  tagline         text default '',
  primary_color   text default '#00A550',
  accent_color    text default '#FFD700',
  hero_badge      text default 'Premium Sports Nutrition',
  hero_title_1    text default 'FUEL YOUR',
  hero_title_2    text default 'INNER',
  hero_title_3    text default 'CHAMPION',
  hero_subtitle   text default 'Science-backed nutrition engineered for peak performance.',
  hero_cta        text default 'Shop All Products',
  about_title     text default 'OUR STORY',
  about_text      text default '',
  stat_founded    text default '',
  stat_customers  text default '',
  stat_products   text default '',
  stat_countries  text default '',
  contact_email   text default '',
  contact_phone   text default '',
  instagram       text default '',
  tiktok          text default '',
  youtube         text default '',
  facebook        text default '',
  updated_at      timestamptz default now(),
  unique(client_id)
);

-- 3. PRODUCTS (many per client)
create table if not exists products (
  id            uuid default gen_random_uuid() primary key,
  client_id     uuid references clients(id) on delete cascade,
  name          text not null,
  category      text default '',
  description   text default '',
  price         decimal(10,2) default 0,
  badge         text default '',
  badge_type    text default 'badge-new',
  stat1_val     text default '',
  stat1_key     text default '',
  stat2_val     text default '',
  stat2_key     text default '',
  stat3_val     text default '',
  stat3_key     text default '',
  color_theme   text default 'bg-green',
  display_order int default 0,
  created_at    timestamptz default now()
);

-- ─── Row Level Security ───────────────────────
-- Enable RLS on all tables
alter table clients      enable row level security;
alter table site_content enable row level security;
alter table products     enable row level security;

-- Allow all access via the anon/service key for now
-- (you can tighten this per-user later)
create policy "allow_all_clients"      on clients      for all using (true) with check (true);
create policy "allow_all_site_content" on site_content for all using (true) with check (true);
create policy "allow_all_products"     on products     for all using (true) with check (true);
