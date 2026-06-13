'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, type Client, type SiteContent, type Product } from '@/lib/supabase'
import { Suspense } from 'react'

const TABS = ['Branding', 'Hero', 'Products', 'About', 'Social'] as const
type Tab = typeof TABS[number]

const TAB_META: Record<Tab, { icon: string; desc: string }> = {
  Branding: { icon: '◈', desc: 'Colors, name & tagline' },
  Hero:     { icon: '◉', desc: 'First thing visitors see' },
  Products: { icon: '▦', desc: 'Your product catalogue' },
  About:    { icon: '◎', desc: 'Story & stats' },
  Social:   { icon: '⊕', desc: 'Links & contact info' },
}

const DEFAULT_CONTENT: Partial<SiteContent> = {
  company_name: '', tagline: '', primary_color: '#00A550', accent_color: '#FFD700',
  hero_badge: '', hero_title_1: '', hero_title_2: '', hero_title_3: '',
  hero_subtitle: '', hero_cta: 'Shop All Products',
  about_title: 'OUR STORY', about_text: '',
  stat_founded: '', stat_customers: '', stat_products: '', stat_countries: '',
  contact_email: '', contact_phone: '', instagram: '', tiktok: '', youtube: '', facebook: '',
}

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0A1020', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: -0.1, color: '#fff' }}>{title}</div>
        {desc && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{desc}</div>}
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.1 }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
  width: '100%', background: '#060D1A', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
  ...extra,
})

function EditorInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientId = searchParams.get('clientId')

  const [tab, setTab] = useState<Tab>('Branding')
  const [client, setClient] = useState<Client | null>(null)
  const [content, setContent] = useState<Partial<SiteContent>>(DEFAULT_CONTENT)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState('')
  const [productModal, setProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [siteUrl, setSiteUrl] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const set = (key: keyof SiteContent, val: string) => setContent(c => ({ ...c, [key]: val }))

  const loadData = useCallback(async (cid: string) => {
    const [{ data: clientData }, { data: contentData }, { data: productsData }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', cid).single(),
      supabase.from('site_content').select('*').eq('client_id', cid).single(),
      supabase.from('products').select('*').eq('client_id', cid).order('display_order'),
    ])
    if (clientData) { setClient(clientData); setSiteUrl(clientData.site_url || '') }
    if (contentData) setContent(contentData)
    if (productsData) setProducts(productsData)
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role, client_id').eq('id', session.user.id).single()
      const admin = profile?.role === 'admin' || session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
      setIsAdmin(admin)
      let cid = clientId
      if (!cid && !admin) cid = profile?.client_id || null
      if (!cid) { router.replace(admin ? '/admin' : '/login'); return }
      loadData(cid)
    })
  }, [router, clientId, loadData])

  async function saveContent() {
    setSaving(true)
    const cid = content.client_id || clientId
    const { error } = await supabase
      .from('site_content')
      .upsert({ ...content, client_id: cid, updated_at: new Date().toISOString() })
    if (error) showToast('Error: ' + error.message)
    else {
      if (cid) await supabase.from('clients').update({ site_url: siteUrl }).eq('id', cid)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  async function saveProduct() {
    if (!editingProduct) return
    const cid = content.client_id || clientId
    if (editingProduct.id) {
      await supabase.from('products').update(editingProduct).eq('id', editingProduct.id)
    } else {
      await supabase.from('products').insert({ ...editingProduct, client_id: cid, display_order: products.length })
    }
    const { data } = await supabase.from('products').select('*').eq('client_id', cid).order('display_order')
    setProducts(data || [])
    setProductModal(false)
    setEditingProduct(null)
    showToast('Product saved')
  }

  async function uploadProductImage(file: File): Promise<string | null> {
    const cid = content.client_id || clientId
    if (!cid) return null
    setUploadingImage(true)
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${cid}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
    setUploadingImage(false)
    if (error) { showToast('Upload failed: ' + error.message); return null }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(p => p.filter(x => x.id !== id))
    showToast('Product deleted')
  }

  const brandColor  = isAdmin ? '#F59E0B' : (content.primary_color  || client?.portal_color  || '#ffffff')
  const brandColor2 = isAdmin ? '#FCD34D' : (content.accent_color   || client?.portal_accent || brandColor)
  const brandLetter = isAdmin ? 'MJ'      : (client?.logo_letter    || client?.business_name?.[0]?.toUpperCase() || 'C')
  const brandName   = isAdmin ? 'MJ Agency' : (client?.business_name || 'Your Brand')

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808' }}>
      <div style={{ width: 28, height: 28, border: `2px solid ${brandColor}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080808', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── Sidebar ── */}
      <div className="ed-sidebar" style={{ width: 256, background: '#070E1B', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Brand header */}
        <div style={{ padding: '24px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: client && isAdmin ? 16 : 0 }}>
            <div style={{ width: 38, height: 38, background: isAdmin ? '#F59E0B' : `linear-gradient(135deg,${brandColor},${brandColor2})`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: brandLetter.length > 1 ? 12 : 16, boxShadow: `0 0 20px ${brandColor}40`, flexShrink: 0, color: '#000' }}>
              {brandLetter}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: -0.2, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{brandName}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2, fontWeight: 500 }}>Content Manager</div>
            </div>
          </div>
          {client && isAdmin && (
            <div style={{ background: `${brandColor}10`, border: `1px solid ${brandColor}20`, borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{client.business_name}</div>
              <div style={{ fontSize: 11, color: brandColor, fontWeight: 600, textTransform: 'capitalize' }}>{client.plan} plan</div>
            </div>
          )}
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 20px' }} />

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: 1.5, textTransform: 'uppercase', padding: '8px 8px 10px' }}>Sections</div>
          {TABS.map(t => {
            const active = tab === t
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 10px', borderRadius: 10, marginBottom: 2,
                  background: active ? `${brandColor}12` : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', border: 'none', textAlign: 'left', fontFamily: 'inherit',
                  borderLeft: `2px solid ${active ? brandColor : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 14, color: active ? brandColor : 'rgba(255,255,255,0.25)', fontWeight: 600, width: 18, textAlign: 'center', flexShrink: 0 }}>
                  {TAB_META[t].icon}
                </span>
                <span style={{ flex: 1 }}>{t}</span>
                {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: brandColor, flexShrink: 0 }} />}
              </button>
            )
          })}
        </nav>

        {/* Footer actions */}
        <div style={{ padding: '12px 12px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {client?.site_url && (
            <a
              href={client.site_url} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', background: `${brandColor}10`, border: `1px solid ${brandColor}25`, borderRadius: 10, padding: '10px', color: brandColor, fontSize: 12, fontWeight: 600, textDecoration: 'none', marginBottom: 8, boxSizing: 'border-box' }}
            >
              View Live Site ↗
            </a>
          )}
          {isAdmin && (
            <button onClick={() => router.push('/admin')} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', fontWeight: 600, marginBottom: 8, fontFamily: 'inherit' }}>
              ← Dashboard
            </button>
          )}
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
            style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px', color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div className="ed-topbar" style={{ background: '#070E1B', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 60, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 17, color: brandColor, opacity: 0.8, fontWeight: 600 }}>{TAB_META[tab].icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: -0.2 }}>{tab}</div>
              <div className="ed-topbar-desc" style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{TAB_META[tab].desc}</div>
            </div>
          </div>
          <button
            className="ed-save-btn"
            onClick={saveContent}
            disabled={saving}
            style={{
              background: saved ? 'rgba(255,255,255,0.08)' : (isAdmin ? '#F59E0B' : `linear-gradient(135deg,${brandColor},${brandColor2})`),
              border: saved ? '1px solid rgba(255,255,255,0.15)' : 'none',
              borderRadius: 10, padding: '10px 24px',
              color: saved ? 'rgba(255,255,255,0.7)' : (isAdmin ? '#000' : '#fff'),
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              boxShadow: saved ? 'none' : `0 4px 16px ${brandColor}35`,
              transition: 'all 0.2s', fontFamily: 'inherit', minWidth: 120,
            }}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

        {/* Form panel */}
        <div className="ed-form" style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <div style={{ maxWidth: 700 }}>

            {/* ── BRANDING ── */}
            {tab === 'Branding' && (
              <>
                <SectionCard title="Identity" desc="How your brand appears across your site">
                  <Field label="Company Name">
                    <input style={inp()} value={content.company_name || ''} onChange={e => set('company_name', e.target.value)} placeholder="e.g. Mass Nutrition" />
                  </Field>
                  <Field label="Tagline" hint="Optional">
                    <input style={inp({ marginBottom: 0 })} value={content.tagline || ''} onChange={e => set('tagline', e.target.value)} placeholder="e.g. Fuel Your Potential" />
                  </Field>
                </SectionCard>

                <SectionCard title="Colors" desc="Pick your primary and accent brand colors">
                  <div className="ed-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <Field label="Primary">
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: 42, height: 42, flexShrink: 0 }}>
                          <input type="color" value={content.primary_color || '#0EA5E9'} onChange={e => set('primary_color', e.target.value)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', borderRadius: 8, cursor: 'pointer', padding: 3, background: 'transparent' }} />
                        </div>
                        <input style={inp({ flex: 1, marginBottom: 0 })} value={content.primary_color || ''} onChange={e => set('primary_color', e.target.value)} placeholder="#0EA5E9" />
                      </div>
                    </Field>
                    <Field label="Accent">
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: 42, height: 42, flexShrink: 0 }}>
                          <input type="color" value={content.accent_color || '#FFD700'} onChange={e => set('accent_color', e.target.value)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', borderRadius: 8, cursor: 'pointer', padding: 3, background: 'transparent' }} />
                        </div>
                        <input style={inp({ flex: 1, marginBottom: 0 })} value={content.accent_color || ''} onChange={e => set('accent_color', e.target.value)} placeholder="#FFD700" />
                      </div>
                    </Field>
                  </div>
                  <div style={{ display: 'flex', gap: 12, height: 52 }}>
                    <div style={{ flex: 1, borderRadius: 10, background: content.primary_color || brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 0.5 }}>PRIMARY</div>
                    <div style={{ flex: 1, borderRadius: 10, background: content.accent_color || brandColor2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: 'rgba(0,0,0,0.6)' }}>ACCENT</div>
                  </div>
                </SectionCard>
              </>
            )}

            {/* ── HERO ── */}
            {tab === 'Hero' && (
              <>
                <SectionCard title="Banner" desc="The badge and button that appear in your hero section">
                  <Field label="Top Badge" hint="Small label above headline">
                    <input style={inp()} value={content.hero_badge || ''} onChange={e => set('hero_badge', e.target.value)} placeholder="e.g. Premium Sports Nutrition" />
                  </Field>
                  <Field label="Button Text">
                    <input style={inp({ marginBottom: 0 })} value={content.hero_cta || ''} onChange={e => set('hero_cta', e.target.value)} placeholder="e.g. Shop All Products" />
                  </Field>
                </SectionCard>

                <SectionCard title="Headline" desc="Your main headline — split into 3 lines with different colors">
                  <Field label="Line 1" hint="white">
                    <input style={inp()} value={content.hero_title_1 || ''} onChange={e => set('hero_title_1', e.target.value)} placeholder="e.g. FUEL YOUR" />
                  </Field>
                  <Field label="Line 2" hint={`primary color — ${content.primary_color || 'pick above'}`}>
                    <input style={inp({ borderColor: `${content.primary_color || '#0EA5E9'}50` })} value={content.hero_title_2 || ''} onChange={e => set('hero_title_2', e.target.value)} placeholder="e.g. INNER" />
                  </Field>
                  <Field label="Line 3" hint={`accent color — ${content.accent_color || 'pick above'}`}>
                    <input style={inp({ borderColor: `${content.accent_color || '#FFD700'}50`, marginBottom: 0 })} value={content.hero_title_3 || ''} onChange={e => set('hero_title_3', e.target.value)} placeholder="e.g. CHAMPION" />
                  </Field>
                </SectionCard>

                <SectionCard title="Subtitle" desc="The supporting text under the headline">
                  <textarea style={inp({ minHeight: 100, resize: 'vertical', marginBottom: 0 })} value={content.hero_subtitle || ''} onChange={e => set('hero_subtitle', e.target.value)} placeholder="e.g. Science-backed nutrition engineered for peak performance." />
                </SectionCard>
              </>
            )}

            {/* ── PRODUCTS ── */}
            {tab === 'Products' && (
              <>
                <div className="ed-prod-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Product Catalogue</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{products.length} {products.length === 1 ? 'product' : 'products'}</div>
                  </div>
                  <button
                    onClick={() => { setEditingProduct({ name: '', category: '', description: '', price: 0, badge: '', badge_type: 'badge-new', stat1_val: '', stat1_key: '', stat2_val: '', stat2_key: '', stat3_val: '', stat3_key: '', color_theme: 'bg-green', image_url: '' }); setProductModal(true) }}
                    style={{ background: `linear-gradient(135deg,${brandColor},${brandColor2})`, border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 14px ${brandColor}35`, fontFamily: 'inherit' }}
                  >
                    + Add Product
                  </button>
                </div>

                {products.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 24px', background: '#0A1020', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.07)' }}>
                    <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 20 }}>▦</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No products yet</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Click "Add Product" to build your catalogue</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {products.map(p => (
                      <div key={p.id} style={{ background: '#0A1020', border: `1px solid ${brandColor}18`, borderRadius: 14, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 10, background: `${brandColor}18`, border: `1px solid ${brandColor}30`, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                            {p.image_url
                              ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <span style={{ color: brandColor, opacity: 0.7 }}>▦</span>
                            }
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{p.category} · ${p.price}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <button onClick={() => { setEditingProduct(p); setProductModal(true) }} style={{ background: `${brandColor}10`, border: `1px solid ${brandColor}25`, borderRadius: 8, padding: '7px 14px', color: brandColor, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                          <button onClick={() => deleteProduct(p.id)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px 14px', color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── ABOUT ── */}
            {tab === 'About' && (
              <>
                <SectionCard title="Brand Story" desc="Tell visitors who you are and what you stand for">
                  <Field label="Section Title">
                    <input style={inp()} value={content.about_title || ''} onChange={e => set('about_title', e.target.value)} placeholder="e.g. OUR STORY" />
                  </Field>
                  <Field label="Story" hint="2–4 sentences">
                    <textarea style={inp({ minHeight: 140, resize: 'vertical', marginBottom: 0 })} value={content.about_text || ''} onChange={e => set('about_text', e.target.value)} placeholder="Tell your brand story…" />
                  </Field>
                </SectionCard>

                <SectionCard title="Stats" desc="4 numbers that show your track record">
                  <div className="ed-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[
                      { key: 'stat_founded', label: 'Founded', placeholder: 'e.g. 2020' },
                      { key: 'stat_customers', label: 'Customers', placeholder: 'e.g. 10K+' },
                      { key: 'stat_products', label: 'Products', placeholder: 'e.g. 50+' },
                      { key: 'stat_countries', label: 'Countries', placeholder: 'e.g. 12' },
                    ].map(s => (
                      <Field key={s.key} label={s.label}>
                        <input style={inp({ marginBottom: 0 })} value={content[s.key as keyof SiteContent] as string || ''} onChange={e => set(s.key as keyof SiteContent, e.target.value)} placeholder={s.placeholder} />
                      </Field>
                    ))}
                  </div>
                </SectionCard>
              </>
            )}

            {/* ── SOCIAL ── */}
            {tab === 'Social' && (
              <>
                {isAdmin && (
                  <SectionCard title="Live Site" desc="The public URL where this site is hosted">
                    <Field label="Live Site URL" hint="Saved separately from other content">
                      <input
                        style={inp({ marginBottom: 0 })}
                        type="url"
                        value={siteUrl}
                        onChange={e => setSiteUrl(e.target.value)}
                        placeholder="https://yourclientsite.com"
                      />
                    </Field>
                  </SectionCard>
                )}

                <SectionCard title="Contact" desc="How customers reach you">
                  <Field label="Email">
                    <input style={inp()} type="email" value={content.contact_email || ''} onChange={e => set('contact_email', e.target.value)} placeholder="hello@yourbrand.com" />
                  </Field>
                  <Field label="Phone" hint="Optional">
                    <input style={inp({ marginBottom: 0 })} value={content.contact_phone || ''} onChange={e => set('contact_phone', e.target.value)} placeholder="+1 234 567 8900" />
                  </Field>
                </SectionCard>

                <SectionCard title="Social Media" desc="Link your accounts — only fill what you have">
                  {[
                    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourbrand' },
                    { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourbrand' },
                    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourbrand' },
                    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourbrand' },
                  ].map((s, i, arr) => (
                    <Field key={s.key} label={s.label}>
                      <input style={inp({ marginBottom: i === arr.length - 1 ? 0 : undefined })} value={content[s.key as keyof SiteContent] as string || ''} onChange={e => set(s.key as keyof SiteContent, e.target.value)} placeholder={s.placeholder} />
                    </Field>
                  ))}
                </SectionCard>
              </>
            )}

          </div>
        </div>
      </div>

      {/* ── Product Modal ── */}
      {productModal && editingProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={e => e.target === e.currentTarget && setProductModal(false)}>
          <div style={{ background: '#0A1020', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>{editingProduct.id ? 'Edit Product' : 'New Product'}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>Fill in the details below</div>
              </div>
              <button onClick={() => { setProductModal(false); setEditingProduct(null) }} style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>×</button>
            </div>

            {/* Image upload */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24, padding: '16px', background: '#060D1A', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 80, height: 80, borderRadius: 12, background: '#0A1020', border: `1px dashed ${brandColor}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {editingProduct.image_url
                  ? <img src={editingProduct.image_url} alt="product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 24, color: 'rgba(255,255,255,0.15)' }}>▦</span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Product Image</div>
                <label style={{ display: 'block', cursor: 'pointer', background: `${brandColor}10`, border: `1px solid ${brandColor}30`, borderRadius: 9, padding: '9px 14px', fontSize: 12, fontWeight: 700, color: brandColor, textAlign: 'center', marginBottom: 8 }}>
                  {uploadingImage ? 'Uploading…' : '↑ Upload Photo'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploadingImage} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const url = await uploadProductImage(file); if (url) setEditingProduct(p => ({ ...p!, image_url: url })) }} />
                </label>
                <input style={inp({ fontSize: 12, marginBottom: 0 })} placeholder="Or paste image URL…" value={editingProduct.image_url || ''} onChange={e => setEditingProduct(p => ({ ...p!, image_url: e.target.value }))} />
              </div>
            </div>

            <Field label="Product Name">
              <input style={inp()} value={editingProduct.name || ''} onChange={e => setEditingProduct(p => ({ ...p!, name: e.target.value }))} placeholder="e.g. Whey Gold Isolate" />
            </Field>
            <div className="ed-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Category">
                <input style={inp()} value={editingProduct.category || ''} onChange={e => setEditingProduct(p => ({ ...p!, category: e.target.value }))} placeholder="e.g. Protein" />
              </Field>
              <Field label="Price ($)">
                <input style={inp()} type="number" value={editingProduct.price || ''} onChange={e => setEditingProduct(p => ({ ...p!, price: parseFloat(e.target.value) }))} placeholder="69.99" />
              </Field>
            </div>
            <Field label="Description">
              <textarea style={inp({ minHeight: 80, resize: 'vertical' })} value={editingProduct.description || ''} onChange={e => setEditingProduct(p => ({ ...p!, description: e.target.value }))} placeholder="Short product description…" />
            </Field>
            <Field label="Badge" hint="Optional — e.g. Best Seller, New">
              <input style={inp()} value={editingProduct.badge || ''} onChange={e => setEditingProduct(p => ({ ...p!, badge: e.target.value }))} />
            </Field>

            <div style={{ background: '#060D1A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px', marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>Key Stats — 3 highlights (e.g. 30g Protein, 150 Calories)</div>
              {([1, 2, 3] as const).map(n => (
                <div key={n} className="ed-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: n < 3 ? 12 : 0 }}>
                  <Field label={`Stat ${n} — Value`}>
                    <input style={inp({ marginBottom: 0 })} value={editingProduct[`stat${n}_val` as keyof Product] as string || ''} onChange={e => setEditingProduct(p => ({ ...p!, [`stat${n}_val`]: e.target.value }))} placeholder="e.g. 30g" />
                  </Field>
                  <Field label="Label">
                    <input style={inp({ marginBottom: 0 })} value={editingProduct[`stat${n}_key` as keyof Product] as string || ''} onChange={e => setEditingProduct(p => ({ ...p!, [`stat${n}_key`]: e.target.value }))} placeholder="e.g. Protein" />
                  </Field>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setProductModal(false); setEditingProduct(null) }} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '13px', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={saveProduct} style={{ flex: 2, background: `linear-gradient(135deg,${brandColor},${brandColor2})`, border: 'none', borderRadius: 10, padding: '13px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 14px ${brandColor}35` }}>Save Product</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile bottom tab bar ── */}
      <div className="ed-bottom-tabs" style={{
        display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: '#070E1B', borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {TABS.map(t => {
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, background: 'none', border: 'none',
                color: active ? brandColor : 'rgba(255,255,255,0.3)',
                cursor: 'pointer', padding: '10px 4px 12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                fontFamily: 'inherit', borderTop: `2px solid ${active ? brandColor : 'transparent'}`,
                transition: 'color 0.15s',
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{TAB_META[t].icon}</span>
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, letterSpacing: 0.5, textTransform: 'uppercase' }}>{t}</span>
            </button>
          )
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, right: 16, background: '#0A1020', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px 18px', fontSize: 13, fontWeight: 600, zIndex: 2000, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', color: '#fff' }}>
          {toast}
        </div>
      )}

      <style>{`
        input:focus, textarea:focus { border-color: ${brandColor}66 !important; }
        * { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        @media (max-width: 768px) {
          .ed-sidebar { display: none !important; }
          .ed-topbar { padding: 0 16px !important; }
          .ed-topbar-desc { display: none !important; }
          .ed-save-btn { padding: 9px 16px !important; min-width: unset !important; font-size: 13px !important; }
          .ed-form { padding: 20px 16px 96px !important; }
          .ed-2col { grid-template-columns: 1fr !important; }
          .ed-bottom-tabs { display: flex !important; }
          .ed-prod-header { flex-wrap: wrap !important; gap: 12px !important; }
          .ed-prod-header button { width: 100% !important; }
        }
      `}</style>
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div style={{ height: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 28, height: 28, border: '2px solid #0EA5E9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
      <EditorInner />
    </Suspense>
  )
}
