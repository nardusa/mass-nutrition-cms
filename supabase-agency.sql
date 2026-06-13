-- ─────────────────────────────────────────────
--  Agency Landing Page Content
--  Run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────

create table if not exists agency_content (
  id                 uuid primary key default gen_random_uuid(),
  -- Branding
  company_name       text not null default 'MJ Agency',
  logo_letters       text not null default 'MJ',
  primary_color      text not null default '#F59E0B',
  accent_color       text not null default '#FCD34D',
  contact_email      text not null default 'contact@mjagency.com',
  -- Hero
  hero_badge         text not null default 'Web Design & Development',
  hero_headline_1    text not null default 'Your business deserves',
  hero_headline_2    text not null default 'a website that works.',
  hero_subtitle      text not null default 'We build fast, modern websites for local businesses — and hand you a dashboard so you can update it yourself, any time.',
  hero_cta_primary   text not null default 'Get a Free Quote',
  hero_cta_secondary text not null default 'See Our Work',
  -- Stats bar (4 value/label pairs)
  stat_1_val         text not null default '7-Day',
  stat_1_label       text not null default 'Average delivery',
  stat_2_val         text not null default '100%',
  stat_2_label       text not null default 'Mobile optimized',
  stat_3_val         text not null default 'You Own',
  stat_3_label       text not null default 'Your dashboard & code',
  stat_4_val         text not null default '24hr',
  stat_4_label       text not null default 'Response time',
  -- Section text
  process_title      text not null default 'Simple from start to finish',
  services_title     text not null default 'Everything your business needs online',
  pricing_title      text not null default 'Straightforward pricing',
  pricing_subtitle   text not null default 'One-time setup fee + a low monthly to keep everything running.',
  cta_title          text not null default 'Ready to get your business online?',
  cta_subtitle       text not null default 'Send us a message and we''ll reply within 24 hours. No sales pitch — just a real conversation about what you need.',
  cta_button         text not null default 'Start the Conversation',
  footer_copyright   text not null default '© 2026 MJ Agency. All rights reserved.',
  -- Pricing plans (JSON array so you can freely edit all 3 plans)
  pricing_plans      jsonb not null default '[
    {"name":"Starter","price":"$499","monthly":"$79/mo","desc":"Perfect for getting your business online fast.","features":["1-page professional website","Mobile-friendly design","Your own content dashboard","Contact form","1 revision round"],"highlight":false},
    {"name":"Pro","price":"$999","monthly":"$149/mo","desc":"For businesses ready to grow their online presence.","features":["Up to 5 pages","Product or services catalog","Full content dashboard","Image & color control","Priority support","3 revision rounds"],"highlight":true},
    {"name":"Custom","price":"Let''s talk","monthly":null,"desc":"For businesses with specific needs or multiple locations.","features":["Everything in Pro","Custom features & integrations","E-commerce ready","Multiple team logins","Ongoing retainer available"],"highlight":false}
  ]'::jsonb,
  updated_at         timestamptz not null default now()
);

alter table agency_content enable row level security;

create policy "Authenticated users can manage agency_content"
  on agency_content for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
