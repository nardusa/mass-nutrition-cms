'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, type Client, type SiteContent, type Product } from '@/lib/supabase'
import { Suspense } from 'react'

const TABS = ['Branding', 'Hero', 'Products', 'About', 'Social'] as const
type Tab = typeof TABS[number]

const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
  width: '100%', background: '#0F1929', border: '1.5px solid rgba(14,165,233,0.15)',
  borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14,
  fontFamily: 'inherit', ...extra,
})

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
  letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  )
}

const DEFAULT_CONTENT: Partial<SiteContent> = {
  company_name: '', tagline: '', primary_color: '#00A550', accent_color: '#FFD700',
  hero_badge: '', hero_title_1: '', hero_title_2: '', hero_title_3: '',
  hero_subtitle: '', hero_cta: 'Shop All Products',
  about_title: 'OUR STORY', about_text: '',
  stat_founded: '', stat_customers: '', stat_products: '', stat_countries: '',
  contact_email: '', contact_phone: '', instagram: '', tiktok: '', youtube: '', facebook: '',
}

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
  const [toast, setToast] = useState('')
  const [productModal, setProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const set = (key: keyof SiteContent, val: string) =>
    setContent(c => ({ ...c, [key]: val }))

  const loadData = useCallback(async (cid: string) => {
    const [{ data: clientData }, { data: contentData }, { data: productsData }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', cid).single(),
      supabase.from('site_content').select('*').eq('client_id', cid).single(),
      supabase.from('products').select('*').eq('client_id', cid).order('display_order'),
    ])
    if (clientData) setClient(clientData)
    if (contentData) setContent(contentData)
    if (productsData) setProducts(productsData)
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role, client_id').eq('id', session.user.id).single()
      const admin = profile?.role === 'admin'
      setIsAdmin(admin)
      let cid = clientId
      if (!cid && !admin) {
        cid = profile?.client_id || null
      }
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
    if (error) showToast('Error saving: ' + error.message)
    else showToast('✓ Changes saved!')
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
    showToast('✓ Product saved!')
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

  // Brand vars — admin sees MJ Agency blue, clients see their live color (updates as they type)
  const brandColor  = isAdmin ? '#0EA5E9' : (content.primary_color || client?.portal_color  || '#0EA5E9')
  const brandColor2 = isAdmin ? '#0284C7' : (content.accent_color  || client?.portal_accent || brandColor)
  const brandLetter = isAdmin ? 'MJ'       : (client?.logo_letter  || client?.business_name?.[0]?.toUpperCase() || 'C')
  const brandName   = isAdmin ? 'MJ AGENCY': (client?.business_name?.toUpperCase() || 'YOUR BRAND')

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070B14' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #0EA5E9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#070B14', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: '#0D1525', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${brandColor},${brandColor2})`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: brandLetter.length > 1 ? 11 : 14, boxShadow: `0 0 14px ${brandColor}55` }}>{brandLetter}</div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.5 }}>{brandName}</div>
          </div>
          {client && isAdmin && (
            <div style={{ background: `${brandColor}18`, border: `1px solid ${brandColor}30`, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{client.business_name}</div>
              <div style={{ fontSize: 11, color: brandColor, fontWeight: 600, marginTop: 2, textTransform: 'capitalize' }}>{client.plan} plan</div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 10, marginBottom: 3, background: tab === t ? `${brandColor}18` : 'transparent', color: tab === t ? brandColor : 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: tab === t ? 700 : 400, cursor: 'pointer', border: 'none', textAlign: 'left', fontFamily: 'inherit' }}>
              <span style={{ fontSize: 16 }}>
                {t === 'Branding' ? '🎨' : t === 'Hero' ? '🏠' : t === 'Products' ? '📦' : t === 'About' ? '📖' : '🔗'}
              </span>
              {t}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {isAdmin && (
            <button onClick={() => router.push('/admin')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              ← Back to Dashboard
            </button>
          )}
          {client?.site_url && (
            <a href={client.site_url} target="_blank" rel="noreferrer" style={{ background: `${brandColor}12`, border: `1px solid ${brandColor}30`, borderRadius: 8, padding: '9px', color: brandColor, fontSize: 12, fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>
              View Live Site ↗
            </a>
          )}
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ background: '#0D1525', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{tab}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              {tab === 'Branding' && 'Company name, colors, and tagline'}
              {tab === 'Hero' && 'The first thing visitors see'}
              {tab === 'Products' && 'Manage your product catalogue'}
              {tab === 'About' && 'Your brand story and stats'}
              {tab === 'Social' && 'Social media and contact links'}
            </div>
          </div>
          <button onClick={saveContent} disabled={saving} style={{ background: `linear-gradient(135deg,${brandColor},${brandColor2})`, border: 'none', borderRadius: 10, padding: '12px 28px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 16px ${brandColor}40` }}>
            {saving ? 'Saving…' : '✓ Save Changes'}
          </button>
        </div>

        {/* Form panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: 680 }}>

            {/* ── BRANDING ── */}
            {tab === 'Branding' && (
              <div>
                <Field label="Company Name">
                  <input style={inp()} value={content.company_name || ''} onChange={e => set('company_name', e.target.value)} placeholder="e.g. Mass Nutrition" />
                </Field>
                <Field label="Tagline">
                  <input style={inp()} value={content.tagline || ''} onChange={e => set('tagline', e.target.value)} placeholder="e.g. Fuel Your Potential" />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="Primary Colour">
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input type="color" value={content.primary_color || '#0EA5E9'} onChange={e => set('primary_color', e.target.value)} style={{ width: 48, height: 44, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent', padding: 2 }} />
                      <input style={inp({ flex: 1 })} value={content.primary_color || ''} onChange={e => set('primary_color', e.target.value)} placeholder="#0EA5E9" />
                    </div>
                  </Field>
                  <Field label="Accent Colour">
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input type="color" value={content.accent_color || '#FFD700'} onChange={e => set('accent_color', e.target.value)} style={{ width: 48, height: 44, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent', padding: 2 }} />
                      <input style={inp({ flex: 1 })} value={content.accent_color || ''} onChange={e => set('accent_color', e.target.value)} placeholder="#FFD700" />
                    </div>
                  </Field>
                </div>
                <div style={{ background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 12, padding: '16px 20px', marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0EA5E9', marginBottom: 8 }}>COLOUR PREVIEW</div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1, height: 48, borderRadius: 10, background: content.primary_color || '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>Primary</div>
                    <div style={{ flex: 1, height: 48, borderRadius: 10, background: content.accent_color || '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000' }}>Accent</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── HERO ── */}
            {tab === 'Hero' && (
              <div>
                <Field label="Badge Text (top label)">
                  <input style={inp()} value={content.hero_badge || ''} onChange={e => set('hero_badge', e.target.value)} placeholder="e.g. Premium Sports Nutrition" />
                </Field>
                <div style={{ background: '#0F1929', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Headline (3 lines)</div>
                  <Field label="Line 1 (white)">
                    <input style={inp()} value={content.hero_title_1 || ''} onChange={e => set('hero_title_1', e.target.value)} placeholder="e.g. FUEL YOUR" />
                  </Field>
                  <Field label={`Line 2 (${content.primary_color || 'primary colour'})`}>
                    <input style={inp({ borderColor: content.primary_color || '#0EA5E9' })} value={content.hero_title_2 || ''} onChange={e => set('hero_title_2', e.target.value)} placeholder="e.g. INNER" />
                  </Field>
                  <Field label={`Line 3 (${content.accent_color || 'accent colour'})`}>
                    <input style={inp({ borderColor: content.accent_color || '#FFD700' })} value={content.hero_title_3 || ''} onChange={e => set('hero_title_3', e.target.value)} placeholder="e.g. CHAMPION" />
                  </Field>
                </div>
                <Field label="Subtitle">
                  <textarea style={inp({ minHeight: 100, resize: 'vertical' })} value={content.hero_subtitle || ''} onChange={e => set('hero_subtitle', e.target.value)} placeholder="e.g. Science-backed nutrition engineered for peak performance…" />
                </Field>
                <Field label="CTA Button Text">
                  <input style={inp()} value={content.hero_cta || ''} onChange={e => set('hero_cta', e.target.value)} placeholder="e.g. Shop All Products" />
                </Field>
              </div>
            )}

            {/* ── PRODUCTS ── */}
            {tab === 'Products' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{products.length} products in catalogue</div>
                  <button onClick={() => { setEditingProduct({ name: '', category: '', description: '', price: 0, badge: '', badge_type: 'badge-new', stat1_val: '', stat1_key: '', stat2_val: '', stat2_key: '', stat3_val: '', stat3_key: '', color_theme: 'bg-green', image_url: '' }); setProductModal(true) }} style={{ background: `linear-gradient(135deg,${brandColor},${brandColor2})`, border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    + Add Product
                  </button>
                </div>

                {products.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', background: '#0F1929', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No products yet</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Click "Add Product" to build your catalogue</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {products.map(p => (
                      <div key={p.id} style={{ background: '#0F1929', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{p.category} · ${p.price}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => { setEditingProduct(p); setProductModal(true) }} style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '7px 14px', color: '#0EA5E9', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => deleteProduct(p.id)} style={{ background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.2)', borderRadius: 8, padding: '7px 14px', color: '#ff6b6b', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ABOUT ── */}
            {tab === 'About' && (
              <div>
                <Field label="Section Title">
                  <input style={inp()} value={content.about_title || ''} onChange={e => set('about_title', e.target.value)} placeholder="e.g. OUR STORY" />
                </Field>
                <Field label="Brand Story">
                  <textarea style={inp({ minHeight: 160, resize: 'vertical' })} value={content.about_text || ''} onChange={e => set('about_text', e.target.value)} placeholder="Tell your brand story…" />
                </Field>
                <div style={{ background: '#0F1929', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Stats Grid</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[
                      { key: 'stat_founded', label: 'Founded' },
                      { key: 'stat_customers', label: 'Customers' },
                      { key: 'stat_products', label: 'Products' },
                      { key: 'stat_countries', label: 'Countries' },
                    ].map(s => (
                      <Field key={s.key} label={s.label}>
                        <input style={inp()} value={content[s.key as keyof SiteContent] as string || ''} onChange={e => set(s.key as keyof SiteContent, e.target.value)} placeholder={s.key === 'stat_founded' ? 'e.g. 2020' : 'e.g. 10K+'} />
                      </Field>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── SOCIAL ── */}
            {tab === 'Social' && (
              <div>
                <Field label="Contact Email">
                  <input style={inp()} type="email" value={content.contact_email || ''} onChange={e => set('contact_email', e.target.value)} placeholder="hello@yourbrand.com" />
                </Field>
                <Field label="Phone Number">
                  <input style={inp()} value={content.contact_phone || ''} onChange={e => set('contact_phone', e.target.value)} placeholder="+1 234 567 8900" />
                </Field>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '24px 0' }} />
                {[
                  { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/yourbrand' },
                  { key: 'tiktok', label: 'TikTok URL', placeholder: 'https://tiktok.com/@yourbrand' },
                  { key: 'youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/@yourbrand' },
                  { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/yourbrand' },
                ].map(s => (
                  <Field key={s.key} label={s.label}>
                    <input style={inp()} value={content[s.key as keyof SiteContent] as string || ''} onChange={e => set(s.key as keyof SiteContent, e.target.value)} placeholder={s.placeholder} />
                  </Field>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Product Modal */}
      {productModal && editingProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={e => e.target === e.currentTarget && setProductModal(false)}>
          <div style={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '36px', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 28 }}>{editingProduct.id ? 'Edit Product' : 'Add Product'}</div>

            {/* Image upload */}
            <Field label="Product Image">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{
                  width: 88, height: 88, borderRadius: 14, flexShrink: 0,
                  background: '#0F1929', border: `1.5px dashed ${brandColor}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {editingProduct.image_url
                    ? <img src={editingProduct.image_url} alt="product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 28 }}>📦</span>
                  }
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{
                    display: 'inline-block', cursor: 'pointer',
                    background: `${brandColor}18`, border: `1px solid ${brandColor}40`,
                    borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, color: brandColor,
                    textAlign: 'center',
                  }}>
                    {uploadingImage ? 'Uploading…' : '⬆ Upload Image'}
                    <input
                      type="file" accept="image/*" style={{ display: 'none' }}
                      disabled={uploadingImage}
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const url = await uploadProductImage(file)
                        if (url) setEditingProduct(p => ({ ...p!, image_url: url }))
                      }}
                    />
                  </label>
                  <input
                    style={inp({ fontSize: 12 })}
                    placeholder="Or paste image URL…"
                    value={editingProduct.image_url || ''}
                    onChange={e => setEditingProduct(p => ({ ...p!, image_url: e.target.value }))}
                  />
                </div>
              </div>
            </Field>

            <Field label="Product Name">
              <input style={inp()} value={editingProduct.name || ''} onChange={e => setEditingProduct(p => ({ ...p!, name: e.target.value }))} placeholder="e.g. Whey Gold Isolate" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
            <Field label="Badge (optional)">
              <input style={inp()} value={editingProduct.badge || ''} onChange={e => setEditingProduct(p => ({ ...p!, badge: e.target.value }))} placeholder="e.g. Best Seller, New, Hot" />
            </Field>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Key Stats (3 macros / highlights)</div>
            {([1, 2, 3] as const).map(n => (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <Field label={`Stat ${n} Value`}>
                  <input style={inp()} value={editingProduct[`stat${n}_val` as keyof Product] as string || ''} onChange={e => setEditingProduct(p => ({ ...p!, [`stat${n}_val`]: e.target.value }))} placeholder="e.g. 30g" />
                </Field>
                <Field label={`Stat ${n} Label`}>
                  <input style={inp()} value={editingProduct[`stat${n}_key` as keyof Product] as string || ''} onChange={e => setEditingProduct(p => ({ ...p!, [`stat${n}_key`]: e.target.value }))} placeholder="e.g. Protein" />
                </Field>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={() => { setProductModal(false); setEditingProduct(null) }} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '13px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveProduct} style={{ flex: 2, background: `linear-gradient(135deg,${brandColor},${brandColor2})`, border: 'none', borderRadius: 10, padding: '13px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Save Product →</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: '#0F1929', border: '1px solid rgba(14,165,233,0.4)', borderRadius: 12, padding: '14px 22px', fontSize: 14, fontWeight: 600, zIndex: 2000, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div style={{ height: '100vh', background: '#070B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 32, height: 32, border: '3px solid #0EA5E9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
      <EditorInner />
    </Suspense>
  )
}
