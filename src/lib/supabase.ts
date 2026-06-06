import { createClient, SupabaseClient } from '@supabase/supabase-js'

function createSupabaseClient(): SupabaseClient {
  // During SSR/build the client isn't needed — all DB calls happen in useEffect (browser only)
  if (typeof window === 'undefined') return {} as SupabaseClient
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
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
}
