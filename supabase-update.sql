-- ─────────────────────────────────────────────
--  White-Label Onboarding — Schema Update
--  Run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────

-- Add white-label branding columns to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS slug         text unique;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS logo_letter  text default '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS portal_color text default '#00A550';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS portal_accent text default '#FFD700';

-- Update existing Mass Nutrition client with its slug
-- (so the login link /login?client=mass-nutrition works immediately)
UPDATE clients SET
  slug         = 'mass-nutrition',
  logo_letter  = 'M',
  portal_color = '#00A550',
  portal_accent = '#FFD700'
WHERE business_name ILIKE '%mass nutrition%'
  AND slug IS NULL;
