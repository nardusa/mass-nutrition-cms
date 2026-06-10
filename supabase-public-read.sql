-- ─────────────────────────────────────────────────────────────
--  Public read access for client-facing static websites
--  Run in: Supabase Dashboard → SQL Editor
--
--  These policies allow the Supabase anon key to SELECT from
--  site_content, products, and clients so that static HTML
--  sites (e.g. Mass Nutrition) can load live data without
--  requiring a logged-in user.
--  All INSERT / UPDATE / DELETE remains restricted to
--  authenticated users via the existing policies.
-- ─────────────────────────────────────────────────────────────

-- site_content: public can read any row
create policy "Public can read site_content"
  on site_content for select
  using (true);

-- products: public can read any row
create policy "Public can read products"
  on products for select
  using (true);

-- clients: public can read any row (only id + business_name needed)
create policy "Public can read clients"
  on clients for select
  using (true);
