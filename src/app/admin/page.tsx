'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Client } from '@/lib/supabase'

// ── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:           '#0A0A0A',
  sidebar:      '#111111',
  card:         '#141414',
  cardAlt:      '#0F0F0F',
  border:       'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.1)',
  accent:       '#F59E0B',
  accentDim:    'rgba(245,158,11,0.1)',
  accentBorder: 'rgba(245,158,11,0.25)',
  accentText:   '#FCD34D',
  success:      '#10B981',
  successDim:   'rgba(16,185,129,0.1)',
  warning:      '#F59E0B',
  error:        '#EF4444',
  errorDim:     'rgba(239,68,68,0.08)',
  purple:       '#8B5CF6',
  text:         '#fff',
  textMuted:    'rgba(255,255,255,0.5)',
  textDim:      'rgba(255,255,255,0.25)',
  input:        '#0A0A0A',
}

// ── Config ───────────────────────────────────────────────────────────────────
const PLAN_PRICES: Record<string, number> = { starter: 49, pro: 149, agency: 299 }
const PLAN_COLORS: Record<string, string> = { starter: '#10B981', pro: '#F59E0B', agency: '#8B5CF6' }
const STATUS_COLORS: Record<string, string> = { active: '#10B981', inactive: '#555' }

type Section = 'Dashboard' | 'Clients' | 'Pipeline' | 'Intakes' | 'Analytics' | 'Settings'

const NAV: { icon: string; label: Section }[] = [
  { icon: '◈', label: 'Dashboard' },
  { icon: '◉', label: 'Clients' },
  { icon: '▷', label: 'Pipeline' },
  { icon: '◫', label: 'Intakes' },
  { icon: '◎', label: 'Analytics' },
  { icon: '⊕', label: 'Settings' },
]

type PipelineLead = {
  id: string
  name: string
  business: string
  email: string
  phone: string
  stage: 'lead' | 'contacted' | 'proposal' | 'negotiating' | 'won' | 'lost'
  value: number
  notes: string
  createdAt: string
}

const STAGES: { key: PipelineLead['stage']; label: string; color: string }[] = [
  { key: 'lead',        label: 'New Lead',        color: '#6366F1' },
  { key: 'contacted',   label: 'Contacted',       color: '#3B82F6' },
  { key: 'proposal',    label: 'Proposal Sent',   color: '#F59E0B' },
  { key: 'negotiating', label: 'Negotiating',     color: '#EC4899' },
  { key: 'won',         label: 'Won ✓',           color: '#10B981' },
  { key: 'lost',        label: 'Lost',            color: '#555'    },
]

type IntakeSubmission = {
  id: string
  client_id: string
  status: string
  vibe: string | null
  primary_color: string | null
  accent_color: string | null
  pages: string[] | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  notes: string | null
  submitted_at: string
  clients?: { business_name: string; slug: string | null }
}

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminPage() {
  const router = useRouter()
  const [section, setSection]   = useState<Section>('Dashboard')
  const [clients, setClients]   = useState<Client[]>([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState<{ msg: string; type?: 'success' | 'error' } | null>(null)
  const [search, setSearch]     = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [successClient, setSuccessClient] = useState<{ name: string; loginUrl: string; intakeUrl: string; email: string; password: string } | null>(null)
  const [intakes, setIntakes]   = useState<IntakeSubmission[]>([])
  const [importingId, setImportingId] = useState<string | null>(null)
  const [linksClient, setLinksClient] = useState<Client | null>(null)
  const [leads, setLeads]       = useState<PipelineLead[]>([])
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [leadForm, setLeadForm] = useState({
    name: '', business: '', email: '', phone: '',
    stage: 'lead' as PipelineLead['stage'], value: '149', notes: '',
  })
  const [editCell, setEditCell] = useState<{ id: string; field: string } | null>(null)
  const [editVal, setEditVal]   = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [importRows, setImportRows] = useState<Partial<PipelineLead>[]>([])
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    business_name: '', client_name: '', email: '', password: '',
    plan: 'starter', site_url: '', slug: '', logo_letter: '',
    portal_color: '#00A550', portal_accent: '#FFD700',
  })

  function generatePassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadClients = useCallback(async () => {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }, [])

  const loadIntakes = useCallback(async () => {
    const { data } = await supabase
      .from('intake_submissions')
      .select('*, clients(business_name, slug)')
      .order('submitted_at', { ascending: false })
    setIntakes(data || [])
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const email = session.user.email || ''
      setAdminEmail(email)
      if (email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) { router.replace('/editor'); return }
      loadClients()
      loadIntakes()
    })
    try {
      const saved = localStorage.getItem('mj_pipeline')
      if (saved) setLeads(JSON.parse(saved))
    } catch { /* no-op */ }
  }, [router, loadClients, loadIntakes])

  function savePipeline(next: PipelineLead[]) {
    setLeads(next)
    localStorage.setItem('mj_pipeline', JSON.stringify(next))
  }

  function updateForm(key: string, value: string) {
    setForm(f => {
      const next = { ...f, [key]: value }
      if (key === 'business_name') {
        next.slug = slugify(value)
        if (!f.logo_letter || f.logo_letter === f.business_name[0]?.toUpperCase())
          next.logo_letter = value[0]?.toUpperCase() || ''
      }
      return next
    })
  }

  async function addClient(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('clients').insert({
      business_name: form.business_name, client_name: form.client_name,
      email: form.email, plan: form.plan, site_url: form.site_url || null,
      status: 'active', slug: form.slug || slugify(form.business_name),
      logo_letter: form.logo_letter || form.business_name[0]?.toUpperCase() || 'B',
      portal_color: form.portal_color, portal_accent: form.portal_accent,
    })
    if (error) { showToast('Error: ' + error.message, 'error'); setSaving(false); return }

    const { data: newClient } = await supabase.from('clients').select('id').eq('email', form.email).single()
    if (newClient) {
      await supabase.from('site_content').insert({
        client_id: newClient.id, company_name: form.business_name,
        tagline: 'Fuel Your Potential', primary_color: form.portal_color, accent_color: form.portal_accent,
        hero_badge: 'Premium Sports Nutrition', hero_title_1: 'FUEL YOUR', hero_title_2: 'INNER', hero_title_3: 'CHAMPION',
        hero_subtitle: 'Science-backed nutrition engineered for peak performance.', hero_cta: 'Shop All Products',
        about_title: 'OUR STORY', about_text: 'Founded with a single mission: deliver results that speak for themselves.',
        stat_founded: '2024', stat_customers: '1K+', stat_products: '20+', stat_countries: '5+',
        contact_email: form.email, contact_phone: '', instagram: '', tiktok: '', youtube: '', facebook: '',
      })
    }
    if (newClient && form.password) {
      const res = await fetch('/api/create-client-user', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, clientId: newClient.id }),
      })
      const result = await res.json()
      if (!res.ok) showToast('Auth setup failed: ' + result.error, 'error')
    }

    const slug = form.slug || slugify(form.business_name)
    const origin = window.location.origin
    setSuccessClient({ name: form.business_name, loginUrl: `${origin}/login?client=${slug}`, intakeUrl: `${origin}/intake?client=${slug}`, email: form.email, password: form.password })
    setForm({ business_name: '', client_name: '', email: '', password: '', plan: 'starter', site_url: '', slug: '', logo_letter: '', portal_color: '#00A550', portal_accent: '#FFD700' })
    loadClients()
    setSaving(false)
  }

  async function setOwner(client: Client) {
    if (!client.email) { showToast('Client has no email set', 'error'); return }
    const res = await fetch('/api/set-owner', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: client.email, clientId: client.id }),
    })
    const json = await res.json()
    if (!res.ok) showToast('Error: ' + json.error, 'error')
    else showToast(`✓ ${client.business_name} set as owner`)
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

  async function importToEditor(intake: IntakeSubmission) {
    setImportingId(intake.id)
    if (intake.primary_color || intake.accent_color || intake.instagram || intake.tiktok || intake.facebook) {
      await supabase.from('site_content').update({
        ...(intake.primary_color && { primary_color: intake.primary_color }),
        ...(intake.accent_color  && { accent_color:  intake.accent_color  }),
        ...(intake.instagram     && { instagram:      intake.instagram     }),
        ...(intake.facebook      && { facebook:       intake.facebook      }),
        ...(intake.tiktok        && { tiktok:         intake.tiktok        }),
      }).eq('client_id', intake.client_id)
    }
    if (intake.primary_color)
      await supabase.from('clients').update({ portal_color: intake.primary_color, portal_accent: intake.accent_color }).eq('id', intake.client_id)
    await supabase.from('intake_submissions').update({ status: 'imported' }).eq('id', intake.id)
    loadIntakes()
    setImportingId(null)
    showToast('Imported! Opening editor…')
    setTimeout(() => router.push(`/editor?clientId=${intake.client_id}`), 800)
  }

  async function markReviewed(id: string) {
    await supabase.from('intake_submissions').update({ status: 'reviewed' }).eq('id', id)
    loadIntakes()
  }

  function addLead() {
    const lead: PipelineLead = {
      id: Date.now().toString(), ...leadForm,
      value: Number(leadForm.value) || 149,
      createdAt: new Date().toISOString(),
    }
    savePipeline([lead, ...leads])
    setLeadForm({ name: '', business: '', email: '', phone: '', stage: 'lead', value: '149', notes: '' })
    setShowLeadModal(false)
    showToast('Lead added to pipeline')
  }

  function updateLeadStage(id: string, stage: PipelineLead['stage']) {
    savePipeline(leads.map(l => l.id === id ? { ...l, stage } : l))
  }

  function deleteLead(id: string) {
    savePipeline(leads.filter(l => l.id !== id))
    showToast('Lead removed')
  }

  function startEdit(id: string, field: string, val: string) {
    setEditCell({ id, field })
    setEditVal(val)
  }

  function commitEdit() {
    if (!editCell) return
    savePipeline(leads.map(l => l.id !== editCell.id ? l : {
      ...l, [editCell.field]: editCell.field === 'value' ? (Number(editVal) || 0) : editVal,
    }))
    setEditCell(null)
  }

  function parseCSV(text: string): Record<string, string>[] {
    const rows: string[][] = []
    let cur = '', inQ = false, row: string[] = []
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      if (ch === '"') {
        if (inQ && text[i + 1] === '"') { cur += '"'; i++ } else inQ = !inQ
      } else if (ch === ',' && !inQ) {
        row.push(cur.trim()); cur = ''
      } else if ((ch === '\n' || ch === '\r') && !inQ) {
        if (ch === '\r' && text[i + 1] === '\n') i++
        row.push(cur.trim()); cur = ''
        if (row.some(c => c)) rows.push(row)
        row = []
      } else { cur += ch }
    }
    if (cur || row.length) { row.push(cur.trim()); if (row.some(c => c)) rows.push(row) }
    if (rows.length < 2) return []
    const headers = rows[0].map(h => h.toLowerCase().replace(/"/g, '').trim())
    return rows.slice(1).map(vals => {
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => { obj[h] = (vals[i] || '').replace(/"/g, '').trim() })
      return obj
    })
  }

  function mapToLead(row: Record<string, string>): Partial<PipelineLead> {
    const pick = (...keys: string[]) => {
      for (const col of Object.keys(row)) {
        if (keys.some(k => col.includes(k))) return row[col]
      }
      return ''
    }
    return {
      business: pick('business', 'company', 'organization', 'brand', 'studio', 'gym') || pick('name'),
      name:     pick('contact name', 'full name', 'first name', 'person', 'contact') || pick('name'),
      email:    pick('email'),
      phone:    pick('phone', 'mobile', 'cell', 'tel'),
      value:    Number(pick('value', 'mrr', 'monthly', 'price', 'amount', 'revenue', 'rate')) || 149,
      notes:    pick('notes', 'note', 'comment', 'description', 'details'),
      stage:    'lead',
    }
  }

  function handleCSVFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => {
      const text = evt.target?.result as string
      const raw = parseCSV(text)
      const mapped = raw.map(mapToLead).filter(l => l.business || l.name || l.email)
      setImportRows(mapped)
      setShowImportModal(true)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function confirmImport() {
    const newLeads: PipelineLead[] = importRows.map((row, i) => ({
      id: `import_${Date.now()}_${i}`,
      business:  row.business || '',
      name:      row.name     || '',
      email:     row.email    || '',
      phone:     row.phone    || '',
      stage:     'lead',
      value:     Number(row.value) || 149,
      notes:     row.notes    || '',
      createdAt: new Date().toISOString(),
    }))
    savePipeline([...newLeads, ...leads])
    setShowImportModal(false)
    setImportRows([])
    showToast(`Imported ${newLeads.length} lead${newLeads.length !== 1 ? 's' : ''}`)
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  const filtered   = clients.filter(c => c.business_name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
  const mrr        = clients.filter(c => c.status === 'active').reduce((s, c) => s + (PLAN_PRICES[c.plan] || 0), 0)
  const arr        = mrr * 12
  const pendingIntakes = intakes.filter(i => i.status === 'pending').length
  const stats = {
    total:    clients.length,
    active:   clients.filter(c => c.status === 'active').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
    starter:  clients.filter(c => c.plan === 'starter').length,
    pro:      clients.filter(c => c.plan === 'pro').length,
    agency:   clients.filter(c => c.plan === 'agency').length,
  }
  const pipelineValue = leads.filter(l => l.stage !== 'lost').reduce((s, l) => s + (l.value || 0), 0)
  const activeLeads   = leads.filter(l => !['won','lost'].includes(l.stage)).length
  const wonLeads      = leads.filter(l => l.stage === 'won').length

  // ── Shared styles ──────────────────────────────────────────────────────────
  const fieldStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', background: '#080808',
    border: `1.5px solid ${T.borderStrong}`, borderRadius: 10,
    padding: '12px 14px', color: T.text, fontSize: 14, outline: 'none', fontFamily: 'inherit',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: T.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7,
  }

  // ── KPI Card ──────────────────────────────────────────────────────────────
  function KPI({ label, value, sub, color, icon }: { label: string; value: string | number; sub?: string; color?: string; icon: string }) {
    return (
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</span>
          <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
        </div>
        <div style={{ fontSize: 34, fontWeight: 900, color: color || T.text, lineHeight: 1, letterSpacing: -1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: T.textDim, marginTop: 6 }}>{sub}</div>}
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  function renderDashboard() {
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 6 }}>Overview</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -1 }}>Dashboard</h1>
          </div>
          <button onClick={() => setShowModal(true)} style={{ background: T.accent, border: 'none', borderRadius: 12, padding: '13px 24px', color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
            + Add Client
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          <KPI label="Monthly Revenue"  value={`$${mrr.toLocaleString()}`}  sub={`$${arr.toLocaleString()} ARR`}                color={T.accentText} icon="💰" />
          <KPI label="Active Clients"   value={stats.active}                sub={`${stats.total} total`}                          color={T.success}    icon="✓"  />
          <KPI label="Pipeline Value"   value={`$${pipelineValue.toLocaleString()}`} sub={`${activeLeads} active lead${activeLeads !== 1 ? 's' : ''}`} color="#F59E0B" icon="▷" />
          <KPI label="Pending Intakes"  value={pendingIntakes}              sub={`${intakes.length} total submitted`}              color={pendingIntakes > 0 ? T.error : T.textMuted} icon="📋" />
        </div>

        {/* Revenue breakdown + Recent clients */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20, marginBottom: 20 }}>
          {/* Revenue by plan */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 22, color: T.text }}>Revenue by Plan</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { label: 'Agency', count: stats.agency, price: PLAN_PRICES.agency, color: '#8B5CF6' },
                { label: 'Pro',    count: stats.pro,    price: PLAN_PRICES.pro,    color: T.accent   },
                { label: 'Starter',count: stats.starter,price: PLAN_PRICES.starter,color: T.success  },
              ].map(p => {
                const rev = p.count * p.price
                const pct = mrr > 0 ? (rev / mrr) * 100 : 0
                return (
                  <div key={p.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{p.label}</span>
                        <span style={{ fontSize: 11, color: T.textDim }}>{p.count} client{p.count !== 1 ? 's' : ''}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>${rev.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: p.color, borderRadius: 3 }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: T.textMuted }}>Total MRR</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: T.accentText }}>${mrr.toLocaleString()}/mo</span>
            </div>
          </div>

          {/* Recent clients */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Recent Clients</span>
              <button onClick={() => setSection('Clients')} style={{ background: 'none', border: 'none', color: T.accentText, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View all →</button>
            </div>
            {loading ? (
              <div style={{ padding: 32, textAlign: 'center', color: T.textMuted, fontSize: 13 }}>Loading…</div>
            ) : clients.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.textDim, fontSize: 13 }}>
                No clients yet — <button onClick={() => setShowModal(true)} style={{ background: 'none', border: 'none', color: T.accentText, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>add one</button>
              </div>
            ) : (
              <div>
                {clients.slice(0, 6).map((client, i) => (
                  <div key={client.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', borderTop: i > 0 ? `1px solid ${T.border}` : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${client.portal_color || T.accent}, ${client.portal_color || T.accent}BB)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff' }}>
                      {client.logo_letter || client.business_name[0]?.toUpperCase() || 'B'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.business_name}</div>
                      <div style={{ fontSize: 11, color: T.textDim, marginTop: 1 }}>{client.email}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: PLAN_COLORS[client.plan] }}>${PLAN_PRICES[client.plan]}/mo</div>
                      <div style={{ fontSize: 10, color: T.textDim, marginTop: 1, textTransform: 'capitalize' }}>{client.plan}</div>
                    </div>
                    <button onClick={() => router.push(`/editor?clientId=${client.id}`)} style={{ background: T.accentDim, border: `1px solid ${T.accentBorder}`, borderRadius: 8, padding: '6px 12px', color: T.accentText, fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Edit</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: T.textMuted, letterSpacing: 0.3 }}>Quick Actions</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: '+ Add Client',     action: () => setShowModal(true), primary: true },
              { label: '+ Add Lead',       action: () => { setSection('Pipeline'); setTimeout(() => setShowLeadModal(true), 50) } },
              { label: `Intakes${pendingIntakes > 0 ? ` (${pendingIntakes})` : ''}`, action: () => setSection('Intakes'), alert: pendingIntakes > 0 },
              { label: 'Analytics',        action: () => setSection('Analytics') },
              { label: 'Settings',         action: () => setSection('Settings') },
            ].map(a => (
              <button key={a.label} onClick={a.action} style={{
                background: a.primary ? T.accent : a.alert ? 'rgba(239,68,68,0.1)' : T.accentDim,
                border: `1px solid ${a.primary ? 'transparent' : a.alert ? 'rgba(239,68,68,0.25)' : T.accentBorder}`,
                borderRadius: 10, padding: '10px 18px',
                color: a.primary ? '#000' : a.alert ? T.error : T.accentText,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </>
    )
  }

  // ── Clients ───────────────────────────────────────────────────────────────
  function renderClients() {
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 6 }}>Management</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -1 }}>Clients</h1>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <input
                style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 16px 10px 40px', color: T.text, fontSize: 13, width: 240, outline: 'none', fontFamily: 'inherit' }}
                placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)}
              />
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: 0.3, pointerEvents: 'none' }}>⌕</span>
            </div>
            <button onClick={() => setShowModal(true)} style={{ background: T.accent, border: 'none', borderRadius: 10, padding: '10px 22px', color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              + Add Client
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 64, textAlign: 'center', color: T.textMuted }}>Loading clients…</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 64, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>👥</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No clients yet</div>
            <div style={{ color: T.textMuted, fontSize: 14, marginBottom: 24 }}>Add your first client to get started</div>
            <button onClick={() => setShowModal(true)} style={{ background: T.accent, border: 'none', borderRadius: 10, padding: '12px 24px', color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              + Add Client
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filtered.map(client => (
              <div key={client.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
                {/* Brand color strip */}
                <div style={{ height: 3, background: `linear-gradient(90deg, ${client.portal_color || T.accent}, ${client.portal_accent || client.portal_color || T.accent}60)` }} />
                <div style={{ padding: '20px 20px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg, ${client.portal_color || T.accent}, ${client.portal_color || T.accent}BB)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 900, color: '#fff' }}>
                      {client.logo_letter || client.business_name[0]?.toUpperCase() || 'B'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.business_name}</div>
                      <div style={{ fontSize: 11, color: T.textDim, marginTop: 1 }}>{client.client_name}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: PLAN_COLORS[client.plan] }}>${PLAN_PRICES[client.plan]}<span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>/mo</span></div>
                      <span style={{ background: `${PLAN_COLORS[client.plan]}18`, color: PLAN_COLORS[client.plan], border: `1px solid ${PLAN_COLORS[client.plan]}30`, borderRadius: 50, padding: '2px 8px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {client.plan}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: T.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 12 }}>{client.email}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[client.status] }} />
                      <span style={{ fontSize: 11, color: STATUS_COLORS[client.status], fontWeight: 600, textTransform: 'capitalize' }}>{client.status}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
                    <button onClick={() => router.push(`/editor?clientId=${client.id}`)} style={{ flex: 1, background: T.accentDim, border: `1px solid ${T.accentBorder}`, borderRadius: 8, padding: '9px', color: T.accentText, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => setLinksClient(client)} style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 8, padding: '9px 12px', color: '#FFD700', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Links</button>
                    <button onClick={() => setOwner(client)} title="Set as site owner" style={{ background: `rgba(139,92,246,0.08)`, border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, padding: '9px 12px', color: '#8B5CF6', fontSize: 13, cursor: 'pointer' }}>👑</button>
                    {client.site_url && (
                      <a href={client.site_url} target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, borderRadius: 8, padding: '9px 10px', color: T.textMuted, fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>↗</a>
                    )}
                    <button onClick={() => deleteClient(client.id, client.business_name)} style={{ background: T.errorDim, border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '9px 10px', color: T.error, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )
  }

  // ── Pipeline ──────────────────────────────────────────────────────────────
  function renderPipeline() {
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 6 }}>Sales</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -1 }}>Pipeline</h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => fileInputRef.current?.click()} style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.borderStrong}`, borderRadius: 12, padding: '13px 20px', color: T.textMuted, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⬆ Import CSV
            </button>
            <button onClick={() => setShowLeadModal(true)} style={{ background: T.accent, border: 'none', borderRadius: 12, padding: '13px 24px', color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              + Add Lead
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          <KPI label="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} sub="projected MRR from leads" color="#F59E0B" icon="💼" />
          <KPI label="Active Leads"   value={activeLeads} sub={`${leads.length} total in pipeline`} color={T.accentText} icon="▷" />
          <KPI label="Deals Won"      value={wonLeads} sub={wonLeads > 0 ? `$${leads.filter(l=>l.stage==='won').reduce((s,l)=>s+l.value,0).toLocaleString()}/mo closed` : 'none yet'} color={T.success} icon="✓" />
        </div>

        {leads.length === 0 ? (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 72, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No leads yet</div>
            <div style={{ color: T.textMuted, fontSize: 14, marginBottom: 24 }}>Track prospects from first contact to signed client</div>
            <button onClick={() => setShowLeadModal(true)} style={{ background: T.accent, border: 'none', borderRadius: 10, padding: '12px 24px', color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              + Add Your First Lead
            </button>
          </div>
        ) : (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
            {/* hint row */}
            <div style={{ padding: '10px 20px', borderBottom: `1px solid ${T.border}`, fontSize: 11, color: T.textDim, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ opacity: 0.5 }}>✎</span> Click any cell to edit · Enter to save · Esc to cancel
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {['Business', 'Contact Name', 'Email', 'Phone', 'Stage', '$/mo', 'Notes', ''].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.textDim, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => {
                    const s = STAGES.find(x => x.key === lead.stage)!
                    function EC({ field, val, bold, num }: { field: string; val: string | number; bold?: boolean; num?: boolean }) {
                      const active = editCell?.id === lead.id && editCell?.field === field
                      if (active) return (
                        <input
                          autoFocus
                          type={num ? 'number' : 'text'}
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditCell(null) }}
                          style={{ background: T.accentDim, border: `1.5px solid ${T.accentBorder}`, borderRadius: 6, padding: '5px 8px', color: T.text, fontSize: 13, outline: 'none', width: '100%', minWidth: 70, fontFamily: 'inherit', fontWeight: bold ? 700 : 400 }}
                        />
                      )
                      const display = String(val || '')
                      return (
                        <span
                          onClick={() => startEdit(lead.id, field, display)}
                          title="Click to edit"
                          style={{ cursor: 'text', display: 'block', padding: '4px 6px', borderRadius: 6, border: '1px solid transparent', minWidth: 50, color: display ? (bold ? T.text : T.textMuted) : T.textDim, fontWeight: bold ? 700 : 400, fontSize: 13, transition: 'border-color 0.1s' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                        >
                          {display || <em style={{ opacity: 0.3, fontStyle: 'normal' }}>—</em>}
                        </span>
                      )
                    }
                    return (
                      <tr key={lead.id} style={{ borderTop: i > 0 ? `1px solid ${T.border}` : 'none' }}>
                        <td style={{ padding: '10px 14px' }}><EC field="business" val={lead.business} bold /></td>
                        <td style={{ padding: '10px 14px' }}><EC field="name" val={lead.name} /></td>
                        <td style={{ padding: '10px 14px' }}><EC field="email" val={lead.email} /></td>
                        <td style={{ padding: '10px 14px' }}><EC field="phone" val={lead.phone} /></td>
                        <td style={{ padding: '10px 14px' }}>
                          <select
                            value={lead.stage}
                            onChange={e => updateLeadStage(lead.id, e.target.value as PipelineLead['stage'])}
                            style={{ background: `${s.color}18`, border: `1px solid ${s.color}40`, borderRadius: 8, padding: '5px 10px', color: s.color, fontSize: 11, fontWeight: 700, cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
                          >
                            {STAGES.map(st => <option key={st.key} value={st.key} style={{ background: T.card, color: T.text }}>{st.label}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '10px 14px', minWidth: 80 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: 12, color: T.textDim, marginRight: 1 }}>$</span>
                            <EC field="value" val={lead.value} num bold />
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', maxWidth: 180 }}><EC field="notes" val={lead.notes} /></td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {lead.stage !== 'won' && lead.stage !== 'lost' && (
                              <button onClick={() => updateLeadStage(lead.id, 'won')} style={{ background: T.successDim, border: '1px solid rgba(16,185,129,0.25)', borderRadius: 7, padding: '5px 10px', color: T.success, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Won</button>
                            )}
                            <button onClick={() => deleteLead(lead.id)} style={{ background: T.errorDim, border: '1px solid rgba(239,68,68,0.15)', borderRadius: 7, padding: '5px 8px', color: T.error, fontSize: 11, cursor: 'pointer' }}>✕</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    )
  }

  // ── Intakes ───────────────────────────────────────────────────────────────
  function renderIntakes() {
    const pending  = intakes.filter(i => i.status === 'pending')
    const reviewed = intakes.filter(i => i.status !== 'pending')
    const VIBE_LABELS: Record<string, string> = {
      clean: '✨ Clean & Modern', bold: '⚡ Bold & Dark',
      warm: '🌿 Warm & Friendly', classic: '🏛️ Classic & Professional',
    }
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 6 }}>Submissions</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -1 }}>Intakes</h1>
          </div>
          {pending.length > 0 && (
            <div style={{ background: T.errorDim, border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700, color: T.error }}>
              {pending.length} pending review
            </div>
          )}
        </div>

        {intakes.length === 0 ? (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 80, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No intakes yet</div>
            <div style={{ color: T.textMuted, fontSize: 14 }}>When a client fills out their intake form, it shows up here.</div>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.error, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Pending Review</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {pending.map(intake => (
                    <div key={intake.id} style={{ background: T.card, border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: 28 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 18, fontWeight: 800 }}>{intake.clients?.business_name || 'Unknown Client'}</div>
                          <div style={{ fontSize: 12, color: T.textDim, marginTop: 3 }}>Submitted {new Date(intake.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={() => markReviewed(intake.id)} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.borderStrong}`, borderRadius: 8, padding: '9px 16px', color: T.textMuted, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Mark Reviewed</button>
                          <button onClick={() => importToEditor(intake)} disabled={importingId === intake.id} style={{ background: T.accent, border: 'none', borderRadius: 8, padding: '9px 20px', color: '#000', fontSize: 12, fontWeight: 800, cursor: 'pointer', opacity: importingId === intake.id ? 0.6 : 1 }}>
                            {importingId === intake.id ? 'Importing…' : 'Import to Editor →'}
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                        {[
                          { label: 'Vibe', value: intake.vibe ? VIBE_LABELS[intake.vibe] : '—' },
                          { label: 'Colors', value: intake.primary_color ? (<div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><div style={{ width: 18, height: 18, borderRadius: 4, background: intake.primary_color }} /><div style={{ width: 18, height: 18, borderRadius: 4, background: intake.accent_color || '#ccc' }} /><span>{intake.primary_color}</span></div>) : 'You choose' },
                          { label: 'Pages', value: intake.pages?.join(', ') || 'Home' },
                          { label: 'Instagram', value: intake.instagram || '—' },
                          { label: 'Facebook', value: intake.facebook || '—' },
                          { label: 'TikTok', value: intake.tiktok || '—' },
                          ...(intake.notes ? [{ label: 'Notes', value: intake.notes }] : []),
                        ].map(row => (
                          <div key={row.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{row.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{row.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {reviewed.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Reviewed / Imported</div>
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
                  {reviewed.map((intake, i) => (
                    <div key={intake.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: i > 0 ? `1px solid ${T.border}` : 'none', opacity: 0.7 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{intake.clients?.business_name || 'Unknown'}</div>
                        <div style={{ fontSize: 12, color: T.textDim, marginTop: 2 }}>{new Date(intake.submitted_at).toLocaleDateString()}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: intake.status === 'imported' ? T.success : T.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {intake.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </>
    )
  }

  // ── Analytics ─────────────────────────────────────────────────────────────
  function renderAnalytics() {
    const planData = [
      { label: 'Agency',  count: stats.agency,  price: PLAN_PRICES.agency,  color: '#8B5CF6' },
      { label: 'Pro',     count: stats.pro,     price: PLAN_PRICES.pro,     color: T.accent   },
      { label: 'Starter', count: stats.starter, price: PLAN_PRICES.starter, color: T.success  },
    ]
    const maxCount = Math.max(...planData.map(p => p.count), 1)

    return (
      <>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 6 }}>Growth</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -1 }}>Analytics</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          <KPI label="MRR"                value={`$${mrr.toLocaleString()}`}  sub="monthly recurring"      color={T.accentText} icon="💰" />
          <KPI label="ARR"                value={`$${arr.toLocaleString()}`}  sub="annual run rate"         color="#F59E0B"      icon="📈" />
          <KPI label="Active Clients"     value={stats.active}               sub={`${stats.inactive} inactive`} color={T.success} icon="✓" />
          <KPI label="Avg / Client"       value={stats.active > 0 ? `$${Math.round(mrr / stats.active)}` : '—'} sub="per active client/mo" color="#8B5CF6" icon="⭐" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 24 }}>Plan Distribution</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {planData.map(p => (
                <div key={p.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{p.label}</span>
                      <span style={{ fontSize: 11, color: T.textDim }}>{p.count} client{p.count !== 1 ? 's' : ''}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>${(p.count * p.price).toLocaleString()}/mo</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(p.count / maxCount) * 100}%`, background: p.color, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 24 }}>Revenue Summary</div>
            <div>
              {[
                { label: 'Monthly Recurring Revenue',  value: `$${mrr.toLocaleString()}`,                                                      color: T.accentText },
                { label: 'Annual Run Rate',             value: `$${arr.toLocaleString()}`,                                                      color: '#F59E0B'    },
                { label: 'Pipeline Value',              value: `$${pipelineValue.toLocaleString()}`,                                            color: '#EC4899'    },
                { label: 'Avg Revenue / Active Client', value: stats.active > 0 ? `$${Math.round(mrr / stats.active)}/mo` : '—',               color: T.success    },
                { label: 'Active Clients',              value: `${stats.active} of ${stats.total} (${stats.total > 0 ? Math.round((stats.active/stats.total)*100) : 0}%)`, color: T.text },
                { label: 'Pipeline Leads',              value: `${activeLeads} active, ${wonLeads} won`,                                        color: T.text       },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 13, color: T.textMuted }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  function renderSettings() {
    return (
      <>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 6 }}>Configuration</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -1 }}>Settings</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Agency Account</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20, color: '#000', flexShrink: 0 }}>
                {adminEmail[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{adminEmail}</div>
                <div style={{ fontSize: 12, color: T.accentText, fontWeight: 600, marginTop: 3 }}>Agency Owner</div>
              </div>
            </div>
            <button onClick={signOut} style={{ background: T.errorDim, border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '11px 20px', color: T.error, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Plan Pricing</div>
            <div>
              {Object.entries(PLAN_PRICES).map(([plan, price]) => (
                <div key={plan} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: PLAN_COLORS[plan] }} />
                    <span style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{plan}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: PLAN_COLORS[plan] }}>${price}/mo</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 12 }}>Used to calculate MRR across your client base.</div>
          </div>

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>System Info</div>
            <div>
              {[
                { label: 'Platform',       value: 'MJ Agency CMS'                      },
                { label: 'Framework',      value: 'Next.js'                             },
                { label: 'Database',       value: 'Supabase'                            },
                { label: 'MRR',            value: `$${mrr.toLocaleString()}/mo`         },
                { label: 'ARR',            value: `$${arr.toLocaleString()}/yr`         },
                { label: 'Total Clients',  value: String(stats.total)                   },
                { label: 'Pipeline Leads', value: String(leads.length)                  },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 13, color: T.textMuted }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── Shell ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── Mobile overlay ── */}
      {mobileNavOpen && (
        <div onClick={() => setMobileNavOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 99 }} />
      )}

      {/* ── Sidebar ── */}
      <div className={`admin-sidebar${mobileNavOpen ? ' open' : ''}`} style={{ width: 240, background: T.sidebar, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100 }}>
        {/* Logo — click to open landing page */}
        <div style={{ padding: '28px 20px 24px' }}>
          <div
            onClick={() => window.open('/', '_blank')}
            title="View landing page"
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <div style={{ width: 38, height: 38, background: T.accent, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#000', flexShrink: 0 }}>MJ</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 0.5 }}>MJ AGENCY</div>
              <div style={{ fontSize: 10, color: T.accentText, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Admin</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '4px 10px' }}>
          {NAV.map(item => {
            const badge = item.label === 'Intakes' ? pendingIntakes : 0
            const active = section === item.label
            return (
              <div
                key={item.label}
                onClick={() => { setSection(item.label); setMobileNavOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 10, marginBottom: 2,
                  background: active ? T.accentDim : 'transparent',
                  borderLeft: active ? `2px solid ${T.accent}` : '2px solid transparent',
                  color: active ? T.accentText : T.textMuted,
                  fontSize: 14, fontWeight: active ? 600 : 400, cursor: 'pointer',
                }}
              >
                <span style={{ fontFamily: 'monospace', width: 18, textAlign: 'center', flexShrink: 0, fontSize: 13 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {badge > 0 && (
                  <span style={{ background: T.error, borderRadius: 50, minWidth: 20, height: 20, padding: '0 5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>
                    {badge}
                  </span>
                )}
              </div>
            )
          })}
        </nav>

        {/* MRR widget */}
        <div style={{ margin: '0 10px 12px', background: T.accentDim, border: `1px solid ${T.accentBorder}`, borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontSize: 10, color: T.accentText, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Monthly Revenue</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: T.accentText, letterSpacing: -1 }}>${mrr.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: T.textDim, marginTop: 3 }}>{stats.active} active client{stats.active !== 1 ? 's' : ''}</div>
        </div>

        {/* User footer */}
        <div style={{ padding: '10px 10px 16px', borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accentDim, border: `1px solid ${T.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: T.accentText, flexShrink: 0 }}>
              {adminEmail[0]?.toUpperCase() || 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminEmail.split('@')[0]}</div>
              <div style={{ fontSize: 10, color: T.textDim }}>Agency Owner</div>
            </div>
            <button onClick={signOut} title="Sign out" style={{ background: 'none', border: 'none', color: T.textDim, fontSize: 16, cursor: 'pointer', padding: 4, borderRadius: 6 }}>
              ↩
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="admin-main" style={{ flex: 1, marginLeft: 240, padding: '44px 52px', overflowY: 'auto', minHeight: '100vh', backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '72px 72px' }}>
        {/* Mobile hamburger */}
        <button
          className="admin-hamburger"
          onClick={() => setMobileNavOpen(o => !o)}
          style={{ display: 'none', alignItems: 'center', gap: 10, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 16px', color: T.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 24, fontFamily: 'inherit' }}
        >
          <span style={{ fontSize: 16 }}>☰</span> Menu
        </button>
        {section === 'Dashboard' && renderDashboard()}
        {section === 'Clients'   && renderClients()}
        {section === 'Pipeline'  && renderPipeline()}
        {section === 'Intakes'   && renderIntakes()}
        {section === 'Analytics' && renderAnalytics()}
        {section === 'Settings'  && renderSettings()}
      </div>

      {/* ── Add Client Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: '#141414', border: `1px solid ${T.borderStrong}`, borderRadius: 20, padding: '40px', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            {successClient ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, background: T.accentDim, border: `2px solid ${T.accentBorder}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 20px' }}>✓</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{successClient.name} added!</div>
                <div style={{ fontSize: 14, color: T.textMuted, marginBottom: 28 }}>Send these two links to your client in order</div>

                {successClient.email && successClient.password && (
                  <div style={{ textAlign: 'left', marginBottom: 20, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 12, padding: '16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#8B5CF6', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Account Created — Credentials</div>
                    <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 4 }}>Email: <span style={{ color: T.text, fontWeight: 600 }}>{successClient.email}</span></div>
                    <div style={{ fontSize: 13, color: T.textMuted }}>Password: <span style={{ color: T.text, fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}>{successClient.password}</span></div>
                  </div>
                )}

                {[
                  { step: 'Step 1', label: 'Send first — intake form',         url: successClient.intakeUrl, copy: 'Copy Intake Link' },
                  { step: 'Step 2', label: 'Send after site is built — login', url: successClient.loginUrl,  copy: 'Copy Login Link'  },
                ].map(s => (
                  <div key={s.step} style={{ textAlign: 'left', marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.accentText, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{s.step} — {s.label}</div>
                    <div style={{ background: '#080808', border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 8, wordBreak: 'break-all', fontSize: 12, color: T.textMuted, fontFamily: 'monospace' }}>{s.url}</div>
                    <button onClick={() => { navigator.clipboard.writeText(s.url); showToast(`${s.step} link copied!`) }} style={{ width: '100%', background: T.accentDim, border: `1px solid ${T.accentBorder}`, borderRadius: 10, padding: '11px', color: T.accentText, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      {s.copy}
                    </button>
                  </div>
                ))}

                <button onClick={() => { setSuccessClient(null); setShowModal(false) }} style={{ width: '100%', marginTop: 4, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, borderRadius: 10, padding: '13px', color: T.text, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Done</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Add New Client</div>
                <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 28 }}>Create their account and white-label login portal</div>
                <form onSubmit={addClient}>
                  {[
                    { key: 'business_name', label: 'Business Name',         placeholder: 'e.g. Iron Body Gym',              type: 'text',  required: true  },
                    { key: 'client_name',   label: 'Contact Name',          placeholder: 'e.g. John Smith',                 type: 'text',  required: true  },
                    { key: 'email',         label: 'Client Email',          placeholder: 'john@ironbodygym.com',            type: 'email', required: true  },
                    { key: 'site_url',      label: 'Live Site URL (optional)', placeholder: 'https://ironbodygym.vercel.app', type: 'text',  required: false },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder} value={(form as Record<string,string>)[f.key]} onChange={e => updateForm(f.key, e.target.value)} required={f.required} style={fieldStyle} />
                    </div>
                  ))}
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Password <span style={{ color: T.textDim, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— share with client</span></label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input type="text" placeholder="Set a password" value={form.password} onChange={e => updateForm('password', e.target.value)} style={{ ...fieldStyle, flex: 1 }} />
                      <button type="button" onClick={() => updateForm('password', generatePassword())} style={{ background: T.accentDim, border: `1px solid ${T.accentBorder}`, borderRadius: 10, padding: '0 14px', color: T.accentText, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        Auto-generate
                      </button>
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Login Portal Slug</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: T.textDim, pointerEvents: 'none' }}>?client=</span>
                      <input type="text" placeholder="iron-body-gym" value={form.slug} onChange={e => updateForm('slug', e.target.value)} required style={{ ...fieldStyle, paddingLeft: 90 }} />
                    </div>
                    <div style={{ fontSize: 11, color: T.textDim, marginTop: 5 }}>Login URL: <span style={{ color: T.accentText }}>/login?client={form.slug || 'slug'}</span></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px', gap: 10, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Logo Letter</label>
                      <input type="text" placeholder="M" maxLength={2} value={form.logo_letter} onChange={e => updateForm('logo_letter', e.target.value.toUpperCase())} style={{ ...fieldStyle, textAlign: 'center', fontWeight: 900, fontSize: 18 }} />
                    </div>
                    <div><label style={labelStyle}>Primary</label><input type="color" value={form.portal_color} onChange={e => updateForm('portal_color', e.target.value)} style={{ ...fieldStyle, padding: '6px', height: 44, cursor: 'pointer' }} /></div>
                    <div><label style={labelStyle}>Accent</label><input type="color" value={form.portal_accent} onChange={e => updateForm('portal_accent', e.target.value)} style={{ ...fieldStyle, padding: '6px', height: 44, cursor: 'pointer' }} /></div>
                  </div>
                  {(form.business_name || form.logo_letter) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#0A0A0A', borderRadius: 10, padding: '12px 16px', marginBottom: 20, border: `1px solid ${form.portal_color}30` }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${form.portal_color}, ${form.portal_color}BB)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#fff', flexShrink: 0 }}>
                        {form.logo_letter || form.business_name[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{(form.business_name || 'Client Name').toUpperCase()}</div>
                        <div style={{ fontSize: 10, color: form.portal_color, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Content Portal</div>
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: 10, color: T.textDim }}>Login preview</div>
                    </div>
                  )}
                  <div style={{ marginBottom: 28 }}>
                    <label style={labelStyle}>Plan</label>
                    <select value={form.plan} onChange={e => updateForm('plan', e.target.value)} style={fieldStyle}>
                      <option value="starter">Starter — $49/mo</option>
                      <option value="pro">Pro — $149/mo</option>
                      <option value="agency">Agency — $299/mo</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, borderRadius: 10, padding: '13px', color: T.text, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                    <button type="submit" disabled={saving} style={{ flex: 2, background: T.accent, border: 'none', borderRadius: 10, padding: '13px', color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'inherit' }}>
                      {saving ? 'Creating…' : 'Create Client →'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Hidden CSV file input ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={handleCSVFile}
      />

      {/* ── CSV Import Preview Modal ── */}
      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowImportModal(false)}>
          <div style={{ background: '#141414', border: `1px solid ${T.borderStrong}`, borderRadius: 20, padding: '40px', width: '100%', maxWidth: 780, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Import Leads</div>
                <div style={{ fontSize: 13, color: T.textMuted }}>{importRows.length} row{importRows.length !== 1 ? 's' : ''} detected — all will be added as <span style={{ color: T.accentText, fontWeight: 700 }}>New Lead</span></div>
              </div>
              <button onClick={() => setShowImportModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, color: T.textMuted, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {importRows.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: T.textMuted, fontSize: 14 }}>
                No recognizable rows found. Make sure your CSV has headers like: <span style={{ color: T.accentText }}>business, name, email, phone, value, notes</span>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600, fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                        {['#', 'Business', 'Contact Name', 'Email', 'Phone', '$/mo', 'Notes'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.textDim, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.slice(0, 10).map((row, i) => (
                        <tr key={i} style={{ borderTop: `1px solid ${T.border}` }}>
                          <td style={{ padding: '10px 14px', color: T.textDim, fontSize: 11 }}>{i + 1}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700 }}>{row.business || <em style={{ color: T.textDim, fontStyle: 'normal' }}>—</em>}</td>
                          <td style={{ padding: '10px 14px', color: T.textMuted }}>{row.name || <em style={{ color: T.textDim, fontStyle: 'normal' }}>—</em>}</td>
                          <td style={{ padding: '10px 14px', color: T.textMuted }}>{row.email || <em style={{ color: T.textDim, fontStyle: 'normal' }}>—</em>}</td>
                          <td style={{ padding: '10px 14px', color: T.textMuted }}>{String(row.phone || '') || <em style={{ color: T.textDim, fontStyle: 'normal' }}>—</em>}</td>
                          <td style={{ padding: '10px 14px', color: T.accentText, fontWeight: 700 }}>${row.value || 149}</td>
                          <td style={{ padding: '10px 14px', color: T.textMuted, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(row.notes || '') || <em style={{ color: T.textDim, fontStyle: 'normal' }}>—</em>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importRows.length > 10 && (
                    <div style={{ padding: '12px 14px', color: T.textDim, fontSize: 12 }}>
                      + {importRows.length - 10} more row{importRows.length - 10 !== 1 ? 's' : ''} not shown
                    </div>
                  )}
                </div>

                <div style={{ background: T.accentDim, border: `1px solid ${T.accentBorder}`, borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 12, color: T.accentText }}>
                  All rows will be added with stage <strong>New Lead</strong>. You can update individual fields inline in the pipeline table after importing.
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setShowImportModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, borderRadius: 10, padding: '13px', color: T.text, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  <button onClick={confirmImport} style={{ flex: 2, background: T.accent, border: 'none', borderRadius: 10, padding: '13px', color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Import {importRows.length} Lead{importRows.length !== 1 ? 's' : ''} →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Add Lead Modal ── */}
      {showLeadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowLeadModal(false)}>
          <div style={{ background: '#141414', border: `1px solid ${T.borderStrong}`, borderRadius: 20, padding: '40px', width: '100%', maxWidth: 460 }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Add Lead</div>
            <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 28 }}>Track a prospect in your sales pipeline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { key: 'name',     label: 'Contact Name',         placeholder: 'Jane Smith'          },
                { key: 'business', label: 'Business Name',        placeholder: 'Fit Life Studio'     },
                { key: 'email',    label: 'Email',                placeholder: 'jane@fitlife.com'    },
                { key: 'phone',    label: 'Phone (optional)',     placeholder: '+1 (555) 000-0000'   },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={(leadForm as Record<string,string>)[f.key]} onChange={e => setLeadForm(lf => ({ ...lf, [f.key]: e.target.value }))} style={fieldStyle} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Stage</label>
                  <select value={leadForm.stage} onChange={e => setLeadForm(lf => ({ ...lf, stage: e.target.value as PipelineLead['stage'] }))} style={fieldStyle}>
                    {STAGES.slice(0, 4).map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Expected Value /mo</label>
                  <input type="number" placeholder="149" value={leadForm.value} onChange={e => setLeadForm(lf => ({ ...lf, value: e.target.value }))} style={fieldStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea placeholder="Any relevant details about this lead…" value={leadForm.notes} onChange={e => setLeadForm(lf => ({ ...lf, notes: e.target.value }))} style={{ ...fieldStyle, resize: 'vertical', minHeight: 80 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setShowLeadModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, borderRadius: 10, padding: '13px', color: T.text, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={addLead} style={{ flex: 2, background: T.accent, border: 'none', borderRadius: 10, padding: '13px', color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>Add to Pipeline →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Links Modal ── */}
      {linksClient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={e => e.target === e.currentTarget && setLinksClient(null)}>
          <div style={{ background: '#141414', border: `1px solid ${T.borderStrong}`, borderRadius: 20, padding: '36px', width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{linksClient.business_name}</div>
                <div style={{ fontSize: 12, color: T.textDim, marginTop: 2 }}>Client links</div>
              </div>
              <button onClick={() => setLinksClient(null)} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, color: T.textMuted, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            {[
              { label: 'Intake Form',  sublabel: 'Send this first — client fills out their preferences', color: T.success,   url: `${typeof window !== 'undefined' ? window.location.origin : ''}/intake?client=${linksClient.slug}` },
              { label: 'Login Portal', sublabel: 'Send this after the site is built',                    color: T.accentText, url: `${typeof window !== 'undefined' ? window.location.origin : ''}/login?client=${linksClient.slug}`  },
            ].map(link => (
              <div key={link.label} style={{ marginBottom: 16, background: '#0A0A0A', border: `1px solid ${link.color}20`, borderRadius: 14, padding: '18px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: link.color, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{link.label}</div>
                <div style={{ fontSize: 12, color: T.textDim, marginBottom: 10 }}>{link.sublabel}</div>
                <div style={{ fontSize: 12, color: T.textMuted, fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 12, padding: '8px 10px', background: 'rgba(0,0,0,0.4)', borderRadius: 8 }}>{link.url}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { navigator.clipboard.writeText(link.url); showToast(`${link.label} copied!`) }} style={{ flex: 1, background: `${link.color}12`, border: `1px solid ${link.color}25`, borderRadius: 8, padding: '9px', color: link.color, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Copy Link</button>
                  <a href={link.url} target="_blank" rel="noreferrer" style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`, borderRadius: 8, padding: '9px', color: T.textMuted, fontSize: 12, fontWeight: 700, textDecoration: 'none', textAlign: 'center', display: 'block' }}>Open →</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: '#141414', border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.3)' : T.accentBorder}`, borderRadius: 12, padding: '14px 22px', fontSize: 14, fontWeight: 600, zIndex: 2000, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', color: toast.type === 'error' ? T.error : T.text }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        * { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color: ${T.accentBorder} !important; box-shadow: 0 0 0 3px ${T.accentDim}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.14); }
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%); transition: transform 0.22s ease; }
          .admin-sidebar.open { transform: translateX(0) !important; }
          .admin-main { margin-left: 0 !important; padding: 20px 16px !important; }
          .admin-hamburger { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
