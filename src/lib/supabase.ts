import { createClient, SupabaseClient } from '@supabase/supabase-js'

function createSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') return {} as SupabaseClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !url.startsWith('http') || !key) return {} as SupabaseClient
  return createClient(url, key)
}

export const supabase = createSupabaseClient()

export type Client = {
  id: string
  business_name: string
  client_name: string
  email: string
  site_url: string | null
  plan: 'starter' | 'pro' | 'agency'
  status: 'active' | 'inactive'
  created_at: string
  slug: string | null
  logo_letter: string | null
  portal_color: string | null
  portal_accent: string | null
}

export type SiteContent = {
  id: string
  client_id: string
  company_name: string
  tagline: string
  primary_color: string
  accent_color: string
  hero_badge: string
  hero_title_1: string
  hero_title_2: string
  hero_title_3: string
  hero_subtitle: string
  hero_cta: string
  about_title: string
  about_text: string
  stat_founded: string
  stat_customers: string
  stat_products: string
  stat_countries: string
  contact_email: string
  contact_phone: string
  instagram: string
  tiktok: string
  youtube: string
  facebook: string
  updated_at: string
}

export type AgencyContent = {
  id: string
  company_name: string
  logo_letters: string
  primary_color: string
  accent_color: string
  contact_email: string
  hero_badge: string
  hero_headline_1: string
  hero_headline_2: string
  hero_subtitle: string
  hero_cta_primary: string
  hero_cta_secondary: string
  stat_1_val: string
  stat_1_label: string
  stat_2_val: string
  stat_2_label: string
  stat_3_val: string
  stat_3_label: string
  stat_4_val: string
  stat_4_label: string
  process_title: string
  services_title: string
  pricing_title: string
  pricing_subtitle: string
  cta_title: string
  cta_subtitle: string
  cta_button: string
  footer_copyright: string
  pricing_plans: Array<{ name: string; price: string; monthly: string | null; desc: string; features: string[]; highlight: boolean }>
  updated_at: string
}

export type Product = {
  id: string
  client_id: string
  name: string
  category: string
  description: string
  price: number
  badge: string
  badge_type: string
  stat1_val: string
  stat1_key: string
  stat2_val: string
  stat2_key: string
  stat3_val: string
  stat3_key: string
  color_theme: string
  display_order: number
  image_url: string
}
