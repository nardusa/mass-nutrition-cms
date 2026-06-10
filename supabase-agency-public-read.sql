-- Allow public (unauthenticated) reads on agency_content
-- Required for server-side rendering of the landing page
-- Run in: Supabase Dashboard → SQL Editor

create policy "Public can read agency_content"
  on agency_content for select
  using (true);
