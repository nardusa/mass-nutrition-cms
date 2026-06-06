'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Client } from '@/lib/supabase'

const PLAN_COLORS: Record<string, string> = {
  starter: '#00A550',
  pro: '#FFD700',
  agency: '#8B5CF6',
}

const STATUS_COLORS: Record<string, string> = {
  active: '#00A550',
  inactive: '#666',
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

  const [form, setForm] = useState({
    business_name: '',
    client_name: '',
    email: '',
    password: '',
    plan: 'starter',
    site_url: '',
  })

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
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
      if (email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.replace('/editor')
        return
      }
      loadClients()
    })
  }, [router, loadClients])

  async function addClient(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    // Create Supabase auth user for client
    const { data: authData, error: authError } = await supabase.auth.admin
      ? { data: null, error: { message: 'Use service role for user creation' } }
      : { data: null, error: null }

    // Insert client record directly (auth user created manually or via invite)
    const { error } = await supabase.from('clients').insert({
      business_name: form.business_name,
      client_name: form.client_name,
      email: form.email,
      plan: form.plan,
      site_url: form.site_url || null,
      status: 'active',
    })

    if (error) { showToast('Error: ' + error.message); setSaving(false); return }

    // Seed default site content
    const { data: newClient } = await supabase
      .from('clients')
      .select('id')
      .eq('email', form.email)
      .single()

    if (newClient) {
      await supabase.from('site_content').insert({
        client_id: newClient.id,
        company_name: form.business_name,
        tagline: 'Fuel Your Potential',
        primary_color: '#00A550',
        accent_color: '#FFD700',
        hero_badge: 'Premium Sports Nutrition',
        hero_title_1: 'FUEL YOUR',
        hero_title_2: 'INNER',
        hero_title_3: 'CHAMPION',
        hero_subtitle: 'Science-backed nutrition engineered for peak performance.',
        hero_cta: 'Shop All Products',
        about_title: 'OUR STORY',
        about_text: 'Founded with a single mission: create supplements that match the relentless intensity of top athletes.',
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

    showToast('✓ Client added successfully!')
    setShowModal(false)
    setForm({ business_name: '', client_name: '', email: '', password: '', plan: 'starter', site_url: '' })
    loadClients()
    setSaving(false)
    void authData; void authError
  }

  async function deleteClient(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    await supabase.from('clients').delete().eq('id', id)
    showToast('Client deleted')
    loadClients()
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A' }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: '#111', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 20px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#00A550,#007A3A)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, boxShadow: '0 0 16px rgba(0,165,80,0.3)' }}>M</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 0.5 }}>MASS CMS</div>
              <div style={{ fontSize: 10, color: '#00A550', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Agency Panel</div>
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
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 10, marginBottom: 4, background: item.active ? 'rgba(0,165,80,0.12)' : 'transparent', color: item.active ? '#00A550' : 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: item.active ? 600 : 400, cursor: 'pointer' }}>
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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>Manage all client websites from one place</div>
          </div>
          <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg,#00A550,#007A3A)', border: 'none', borderRadius: 12, padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,165,80,0.35)', display: 'flex', alignItems: 'center', gap: 8 }}>
            + Add Client
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Clients', value: stats.total, icon: '👥', color: '#00A550' },
            { label: 'Active Sites', value: stats.active, icon: '🌐', color: '#FFD700' },
            { label: 'Pro / Agency', value: stats.pro, icon: '⭐', color: '#8B5CF6' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px' }}>
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

        {/* Search + Table */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>All Clients</div>
            <input
              style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 16px', color: '#fff', fontSize: 13, width: 220 }}
              placeholder="Search clients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
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
                    <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => (
                  <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{client.business_name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{client.client_name}</div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{client.email}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ background: `${PLAN_COLORS[client.plan]}22`, color: PLAN_COLORS[client.plan], border: `1px solid ${PLAN_COLORS[client.plan]}44`, borderRadius: 50, padding: '4px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {client.plan}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLORS[client.status] }} />
                        <span style={{ fontSize: 13, color: STATUS_COLORS[client.status], fontWeight: 600, textTransform: 'capitalize' }}>{client.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {client.site_url ? (
                        <a href={client.site_url} target="_blank" rel="noreferrer" style={{ color: '#00A550', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                          View Site ↗
                        </a>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Not deployed</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => router.push(`/editor?clientId=${client.id}`)}
                          style={{ background: 'rgba(0,165,80,0.12)', border: '1px solid rgba(0,165,80,0.25)', borderRadius: 8, padding: '7px 14px', color: '#00A550', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Edit Site
                        </button>
                        <button
                          onClick={() => deleteClient(client.id, client.business_name)}
                          style={{ background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.2)', borderRadius: 8, padding: '7px 14px', color: '#ff6b6b', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Delete
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '40px', width: '100%', maxWidth: 480 }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Add New Client</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 32 }}>Create a client account and their CMS access</div>

            <form onSubmit={addClient}>
              {[
                { key: 'business_name', label: 'Business Name', placeholder: 'e.g. Iron Body Gym', type: 'text' },
                { key: 'client_name', label: 'Contact Name', placeholder: 'e.g. John Smith', type: 'text' },
                { key: 'email', label: 'Client Email', placeholder: 'john@ironbody.com', type: 'email' },
                { key: 'site_url', label: 'Live Site URL (optional)', placeholder: 'https://ironbody.vercel.app', type: 'text' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7 }}>{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    required={field.key !== 'site_url'}
                    style={{ width: '100%', background: '#1A1A1A', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14 }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7 }}>Plan</label>
                <select
                  value={form.plan}
                  onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                  style={{ width: '100%', background: '#1A1A1A', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14 }}
                >
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="agency">Agency</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '13px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex: 2, background: 'linear-gradient(135deg,#00A550,#007A3A)', border: 'none', borderRadius: 10, padding: '13px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  {saving ? 'Adding…' : 'Add Client →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: '#1A1A1A', border: '1px solid rgba(0,165,80,0.4)', borderRadius: 12, padding: '14px 22px', fontSize: 14, fontWeight: 600, zIndex: 2000, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
