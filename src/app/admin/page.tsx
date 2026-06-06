'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Client } from '@/lib/supabase'

const PLAN_COLORS: Record<string, string> = {
  starter: '#22C55E',
  pro: '#FFD700',
  agency: '#8B5CF6',
}

const STATUS_COLORS: Record<string, string> = {
  active: '#22C55E',
  inactive: '#555',
}

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [successClient, setSuccessClient] = useState<{ name: string; loginUrl: string } | null>(null)

  const [form, setForm] = useState({
    business_name: '',
    client_name: '',
    email: '',
    plan: 'starter',
    site_url: '',
    slug: '',
    logo_letter: '',
    portal_color: '#00A550',
    portal_accent: '#FFD700',
  })

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const loadClients = useCallback(async () => {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const email = session.user.email || ''
      setAdminEmail(email)
      if (email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) { router.replace('/editor'); return }
      loadClients()
    })
  }, [router, loadClients])

  function updateForm(key: string, value: string) {
    setForm(f => {
      const next = { ...f, [key]: value }
      if (key === 'business_name') {
        next.slug = slugify(value)
        if (!f.logo_letter || f.logo_letter === f.business_name[0]?.toUpperCase()) {
          next.logo_letter = value[0]?.toUpperCase() || ''
        }
      }
      return next
    })
  }

  async function addClient(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase.from('clients').insert({
      business_name: form.business_name,
      client_name: form.client_name,
      email: form.email,
      plan: form.plan,
      site_url: form.site_url || null,
      status: 'active',
      slug: form.slug || slugify(form.business_name),
      logo_letter: form.logo_letter || form.business_name[0]?.toUpperCase() || 'B',
      portal_color: form.portal_color,
      portal_accent: form.portal_accent,
    })

    if (error) { showToast('Error: ' + error.message); setSaving(false); return }

    const { data: newClient } = await supabase
      .from('clients').select('id').eq('email', form.email).single()

    if (newClient) {
      await supabase.from('site_content').insert({
        client_id: newClient.id,
        company_name: form.business_name,
        tagline: 'Fuel Your Potential',
        primary_color: form.portal_color,
        accent_color: form.portal_accent,
        hero_badge: 'Premium Sports Nutrition',
        hero_title_1: 'FUEL YOUR',
        hero_title_2: 'INNER',
        hero_title_3: 'CHAMPION',
        hero_subtitle: 'Science-backed nutrition engineered for peak performance.',
        hero_cta: 'Shop All Products',
        about_title: 'OUR STORY',
        about_text: 'Founded with a single mission: deliver results that speak for themselves.',
        stat_founded: '2024',
        stat_customers: '1K+',
        stat_products: '20+',
        stat_countries: '5+',
        contact_email: form.email,
        contact_phone: '',
        instagram: '',
        tiktok: '',
        youtube: '',
        facebook: '',
      })
    }

    const loginUrl = `${window.location.origin}/login?client=${form.slug || slugify(form.business_name)}`
    setSuccessClient({ name: form.business_name, loginUrl })
    setForm({ business_name: '', client_name: '', email: '', plan: 'starter', site_url: '', slug: '', logo_letter: '', portal_color: '#0EA5E9', portal_accent: '#FFD700' })
    loadClients()
    setSaving(false)
  }

  async function deleteClient(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    await supabase.from('clients').delete().eq('id', id)
    showToast('Client deleted')
    loadClients()
  }

  function copyLoginLink(client: Client) {
    if (!client.slug) { showToast('No login link — client has no slug set'); return }
    const url = `${window.location.origin}/login?client=${client.slug}`
    navigator.clipboard.writeText(url)
    showToast('Login link copied!')
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filtered = clients.filter(c =>
    c.business_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    pro: clients.filter(c => c.plan === 'pro' || c.plan === 'agency').length,
  }

  const fieldStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    background: '#0F1929', border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none',
  }
  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: 'rgba(255,255,255,0.5)', letterSpacing: 1,
    textTransform: 'uppercase' as const, marginBottom: 7,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#070B14', color: '#fff' }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: '#0D1525', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 20px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, boxShadow: '0 0 16px rgba(14,165,233,0.3)' }}>MJ</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 0.5 }}>MJ AGENCY</div>
              <div style={{ fontSize: 10, color: '#0EA5E9', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Admin Panel</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 12px' }}>
          {[
            { icon: '⬛', label: 'Dashboard', active: true },
            { icon: '👥', label: 'Clients', active: false },
            { icon: '📊', label: 'Analytics', active: false },
            { icon: '⚙️', label: 'Settings', active: false },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 10, marginBottom: 4, background: item.active ? 'rgba(14,165,233,0.12)' : 'transparent', color: item.active ? '#0EA5E9' : 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: item.active ? 600 : 400, cursor: 'pointer' }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{ padding: '20px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminEmail}</div>
          <button onClick={signOut} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, margin: 0 }}>Dashboard</h1>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Manage all client websites from one place</div>
          </div>
          <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', border: 'none', borderRadius: 12, padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(14,165,233,0.35)' }}>
            + Add Client
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Clients', value: stats.total, icon: '👥', color: '#0EA5E9' },
            { label: 'Active Sites', value: stats.active, icon: '🌐', color: '#FFD700' },
            { label: 'Pro / Agency', value: stats.pro, icon: '⭐', color: '#8B5CF6' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 8 }}>{stat.label}</div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                </div>
                <div style={{ fontSize: 28 }}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Client table */}
        <div style={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>All Clients</div>
            <input
              style={{ background: '#0F1929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 16px', color: '#fff', fontSize: 13, width: 220, outline: 'none' }}
              placeholder="Search clients…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading clients…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 64, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No clients yet</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Click "+ Add Client" to get started</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Business', 'Contact', 'Plan', 'Status', 'Site', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => (
                  <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          background: `linear-gradient(135deg, ${client.portal_color || '#0EA5E9'}, ${client.portal_color || '#0EA5E9'}BB)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 900, color: '#fff',
                        }}>
                          {client.logo_letter || client.business_name[0]?.toUpperCase() || 'B'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{client.business_name}</div>
                          {client.slug && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>/{client.slug}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{client.client_name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{client.email}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ background: `${PLAN_COLORS[client.plan]}22`, color: PLAN_COLORS[client.plan], border: `1px solid ${PLAN_COLORS[client.plan]}44`, borderRadius: 50, padding: '4px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {client.plan}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLORS[client.status] }} />
                        <span style={{ fontSize: 13, color: STATUS_COLORS[client.status], fontWeight: 600, textTransform: 'capitalize' }}>{client.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {client.site_url ? (
                        <a href={client.site_url} target="_blank" rel="noreferrer" style={{ color: '#0EA5E9', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>View Site ↗</a>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => router.push(`/editor?clientId=${client.id}`)}
                          style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 8, padding: '7px 12px', color: '#0EA5E9', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => copyLoginLink(client)}
                          title="Copy client login link"
                          style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 8, padding: '7px 10px', color: '#FFD700', fontSize: 13, cursor: 'pointer' }}
                        >
                          🔗
                        </button>
                        <button
                          onClick={() => deleteClient(client.id, client.business_name)}
                          style={{ background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.2)', borderRadius: 8, padding: '7px 12px', color: '#ff6b6b', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div style={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '40px', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            {successClient ? (
              /* Success Screen */
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✓</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{successClient.name} added!</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>Send this login link to your client</div>

                <div style={{ background: '#0F1929', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 12, padding: '18px 20px', marginBottom: 20, wordBreak: 'break-all', fontSize: 13, color: '#0EA5E9', fontFamily: 'monospace', textAlign: 'left' }}>
                  {successClient.loginUrl}
                </div>

                <button
                  onClick={() => { navigator.clipboard.writeText(successClient.loginUrl); showToast('Login link copied!') }}
                  style={{ width: '100%', background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', border: 'none', borderRadius: 10, padding: '14px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}
                >
                  Copy Login Link
                </button>
                <button
                  onClick={() => { setSuccessClient(null); setShowModal(false) }}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '13px', color: '#fff', fontSize: 14, cursor: 'pointer' }}
                >
                  Done
                </button>

                <div style={{ marginTop: 24, padding: '16px', background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 10, fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'left', lineHeight: 1.6 }}>
                  <strong style={{ color: '#FFD700' }}>What to send your client:</strong><br />
                  1. Their login link above<br />
                  2. Their email: create a Supabase auth user for them<br />
                  3. A temporary password they can change on first login
                </div>
              </div>
            ) : (
              /* Add Client Form */
              <>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Add New Client</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>Create their account and white-label login portal</div>

                <form onSubmit={addClient}>
                  {/* Business + Contact */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Business Name</label>
                    <input type="text" placeholder="e.g. Iron Body Gym" value={form.business_name} onChange={e => updateForm('business_name', e.target.value)} required style={fieldStyle} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Contact Name</label>
                    <input type="text" placeholder="e.g. John Smith" value={form.client_name} onChange={e => updateForm('client_name', e.target.value)} required style={fieldStyle} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Client Email</label>
                    <input type="email" placeholder="john@ironbodygym.com" value={form.email} onChange={e => updateForm('email', e.target.value)} required style={fieldStyle} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Live Site URL (optional)</label>
                    <input type="text" placeholder="https://ironbodygym.vercel.app" value={form.site_url} onChange={e => updateForm('site_url', e.target.value)} style={fieldStyle} />
                  </div>

                  {/* Portal URL slug */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Login Portal Slug</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>?client=</span>
                      <input
                        type="text" placeholder="iron-body-gym"
                        value={form.slug} onChange={e => updateForm('slug', e.target.value)}
                        required
                        style={{ ...fieldStyle, paddingLeft: 90 }}
                      />
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 5 }}>
                      Client login URL: <span style={{ color: '#0EA5E9' }}>/login?client={form.slug || 'slug'}</span>
                    </div>
                  </div>

                  {/* Branding row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px', gap: 10, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Logo Letter</label>
                      <input type="text" placeholder="M" maxLength={2} value={form.logo_letter} onChange={e => updateForm('logo_letter', e.target.value.toUpperCase())} style={{ ...fieldStyle, textAlign: 'center', fontWeight: 900, fontSize: 18 }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Primary</label>
                      <input type="color" value={form.portal_color} onChange={e => updateForm('portal_color', e.target.value)} style={{ ...fieldStyle, padding: '6px', height: 44, cursor: 'pointer' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Accent</label>
                      <input type="color" value={form.portal_accent} onChange={e => updateForm('portal_accent', e.target.value)} style={{ ...fieldStyle, padding: '6px', height: 44, cursor: 'pointer' }} />
                    </div>
                  </div>

                  {/* Preview */}
                  {(form.business_name || form.logo_letter) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#070B14', borderRadius: 10, padding: '12px 16px', marginBottom: 20, border: `1px solid ${form.portal_color}30` }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${form.portal_color}, ${form.portal_color}BB)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#fff', flexShrink: 0, boxShadow: `0 0 16px ${form.portal_color}40` }}>
                        {form.logo_letter || form.business_name[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{(form.business_name || 'Client Name').toUpperCase()}</div>
                        <div style={{ fontSize: 10, color: form.portal_color, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Content Portal</div>
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>Login preview</div>
                    </div>
                  )}

                  <div style={{ marginBottom: 28 }}>
                    <label style={labelStyle}>Plan</label>
                    <select value={form.plan} onChange={e => updateForm('plan', e.target.value)} style={{ ...fieldStyle }}>
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="agency">Agency</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '13px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={saving} style={{ flex: 2, background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', border: 'none', borderRadius: 10, padding: '13px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(14,165,233,0.3)' }}>
                      {saving ? 'Creating…' : 'Create Client →'}
                    </button>
                  </div>
                </form>
              </>
            )}
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
