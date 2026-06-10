-- ─────────────────────────────────────────────
--  Pipeline Leads — Cloud Sync Table
--  Run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────

create table if not exists pipeline_leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default '',
  business   text not null default '',
  email      text not null default '',
  phone      text not null default '',
  stage      text not null default 'lead',
  value      numeric not null default 149,
  notes      text not null default '',
  created_at timestamptz not null default now()
);

alter table pipeline_leads enable row level security;

-- Allow any authenticated user (only admin can reach this page anyway)
create policy "Authenticated users can manage pipeline_leads"
  on pipeline_leads for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
