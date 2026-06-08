'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const VIBES = [
  { id: 'clean',    label: 'Clean & Modern',        desc: 'Minimal, professional, lots of white space',  emoji: '✨' },
  { id: 'bold',     label: 'Bold & Dark',            desc: 'Dark background, high contrast, edgy',        emoji: '⚡' },
  { id: 'warm',     label: 'Warm & Friendly',        desc: 'Welcoming, rounded, approachable',            emoji: '🌿' },
  { id: 'classic',  label: 'Classic & Professional', desc: 'Structured, trustworthy, traditional',        emoji: '🏛️' },
]

const PALETTES = [
  { id: 'blue',    label: 'Ocean Blue',    primary: '#0EA5E9', accent: '#38BDF8' },
  { id: 'green',   label: 'Forest Green',  primary: '#22C55E', accent: '#16A34A' },
  { id: 'orange',  label: 'Sunset Orange', primary: '#F97316', accent: '#FB923C' },
  { id: 'purple',  label: 'Royal Purple',  primary: '#8B5CF6', accent: '#A78BFA' },
  { id: 'red',     label: 'Bold Red',      primary: '#EF4444', accent: '#F87171' },
  { id: 'custom',  label: 'You choose for us', primary: '#0EA5E9', accent: '#0284C7' },
]

const ALL_PAGES = ['About Us', 'Services / Menu', 'Gallery', 'Contact', 'Booking / Appointments', 'Products / Shop']

function IntakeForm() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('client')

  const [clientId, setClientId] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const TOTAL_STEPS = 6

  const [vibe, setVibe] = useState('')
  const [palette, setPalette] = useState('')
  const [pages, setPages] = useState<string[]>([])
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return }
    supabase.from('clients').select('id, business_name').eq('slug', slug).single()
      .then(({ data }) => {
        if (!data) { setNotFound(true) } else { setClientId(data.id); setBusinessName(data.business_name) }
        setLoading(false)
      })
  }, [slug])

  function togglePage(p: string) {
    setPages(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function submit() {
    if (!clientId) return
    setSubmitting(true)
    const selected = PALETTES.find(p => p.id === palette)
    await supabase.from('intake_submissions').insert({
      client_id: clientId,
      status: 'pending',
      vibe,
      primary_color: selected?.primary || null,
      accent_color: selected?.accent || null,
      pages: ['Home', ...pages],
      instagram: instagram || null,
      facebook: facebook || null,
      tiktok: tiktok || null,
      notes: notes || null,
    })
    setSubmitting(false)
    setSubmitted(true)
  }

  const brandBlue = '#0EA5E9'

  const btnPrimary: React.CSSProperties = {
    background: `linear-gradient(135deg, ${brandBlue}, #0284C7)`,
    border: 'none', borderRadius: 12, padding: '15px 36px',
    color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
    boxShadow: `0 6px 20px rgba(14,165,233,0.35)`, width: '100%',
  }
  const btnSecondary: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: '15px 36px', color: 'rgba(255,255,255,0.6)',
    fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%',
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080C14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${brandBlue}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#080C14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Invalid link</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>This intake form link is not valid. Contact MJ Agency.</div>
      </div>
    </div>
  )

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#080C14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480 }}>
        <div style={{ width: 80, height: 80, background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px' }}>✓</div>
        <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>You&apos;re all set!</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
          We received everything we need to get started on your website.<br /><br />
          We&apos;ll reach out within <strong style={{ color: '#fff' }}>2 business days</strong> with your first draft.
        </div>
        <div style={{ marginTop: 40, padding: '20px 24px', background: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          Questions? Email us at <span style={{ color: brandBlue }}>Moro752006@gmail.com</span>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 560, marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${brandBlue},#0284C7)`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12 }}>MJ</div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>MJ Agency</span>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Step {step} of {TOTAL_STEPS}</div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / TOTAL_STEPS) * 100}%`, background: `linear-gradient(90deg, ${brandBlue}, #0284C7)`, borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 560, background: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '40px 36px' }}>

        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 13, color: brandBlue, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>Welcome</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, lineHeight: 1.2 }}>Hi, {businessName}! 👋</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 36 }}>
              We&apos;re building your new website. This takes about <strong style={{ color: '#fff' }}>5 minutes</strong> and helps us make sure it&apos;s exactly what you want. No tech knowledge needed — just a few quick questions.
            </p>
            <button style={btnPrimary} onClick={() => setStep(2)}>Let&apos;s get started →</button>
          </div>
        )}

        {/* Step 2 — Vibe */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 13, color: brandBlue, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>Look & Feel</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>What vibe fits your business?</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Pick the one that feels most like you.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {VIBES.map(v => (
                <div key={v.id} onClick={() => setVibe(v.id)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 14, border: `2px solid ${vibe === v.id ? brandBlue : 'rgba(255,255,255,0.08)'}`, background: vibe === v.id ? 'rgba(14,165,233,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{v.emoji}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{v.label}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{v.desc}</div>
                  </div>
                  {vibe === v.id && <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: brandBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>✓</div>}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={btnSecondary} onClick={() => setStep(1)}>← Back</button>
              <button style={{ ...btnPrimary, opacity: vibe ? 1 : 0.4 }} onClick={() => vibe && setStep(3)} disabled={!vibe}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Colors */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 13, color: brandBlue, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>Colors</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Pick a color direction</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>We&apos;ll fine-tune it — this just gives us a starting point.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
              {PALETTES.map(p => (
                <div key={p.id} onClick={() => setPalette(p.id)} style={{ padding: '16px', borderRadius: 14, border: `2px solid ${palette === p.id ? brandBlue : 'rgba(255,255,255,0.08)'}`, background: palette === p.id ? 'rgba(14,165,233,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {p.id !== 'custom' && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: p.primary }} />
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: p.accent }} />
                    </div>
                  )}
                  {p.id === 'custom' && <div style={{ fontSize: 24, marginBottom: 10 }}>🎨</div>}
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{p.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={btnSecondary} onClick={() => setStep(2)}>← Back</button>
              <button style={{ ...btnPrimary, opacity: palette ? 1 : 0.4 }} onClick={() => palette && setStep(4)} disabled={!palette}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 4 — Pages */}
        {step === 4 && (
          <div>
            <div style={{ fontSize: 13, color: brandBlue, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>Pages</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>What pages do you need?</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Home is always included. Select any others.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, padding: '12px 16px', background: 'rgba(14,165,233,0.08)', borderRadius: 10, border: '1px solid rgba(14,165,233,0.2)' }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: brandBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>✓</div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Home</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>Always included</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {ALL_PAGES.map(p => (
                <div key={p} onClick={() => togglePage(p)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', borderRadius: 12, border: `2px solid ${pages.includes(p) ? brandBlue : 'rgba(255,255,255,0.08)'}`, background: pages.includes(p) ? 'rgba(14,165,233,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${pages.includes(p) ? brandBlue : 'rgba(255,255,255,0.2)'}`, background: pages.includes(p) ? brandBlue : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0, transition: 'all 0.15s' }}>
                    {pages.includes(p) && '✓'}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{p}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={btnSecondary} onClick={() => setStep(3)}>← Back</button>
              <button style={btnPrimary} onClick={() => setStep(5)}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 5 — Socials */}
        {step === 5 && (
          <div>
            <div style={{ fontSize: 13, color: brandBlue, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>Social Media</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Any social accounts to link?</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>All optional — just your handle (e.g. @mybusiness)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
              {[
                { label: '📸 Instagram', val: instagram, set: setInstagram, placeholder: '@yourbusiness' },
                { label: '👤 Facebook', val: facebook, set: setFacebook, placeholder: 'facebook.com/yourbusiness' },
                { label: '🎵 TikTok', val: tiktok, set: setTiktok, placeholder: '@yourbusiness' },
              ].map(s => (
                <div key={s.label}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{s.label}</label>
                  <input
                    value={s.val} onChange={e => s.set(e.target.value)}
                    placeholder={s.placeholder}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#0F1929', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={btnSecondary} onClick={() => setStep(4)}>← Back</button>
              <button style={btnPrimary} onClick={() => setStep(6)}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 6 — Notes + Submit */}
        {step === 6 && (
          <div>
            <div style={{ fontSize: 13, color: brandBlue, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>Almost done</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Anything specific you want?</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Totally optional. Most people skip this — we&apos;ve got everything we need.</p>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. We want a booking button at the top, or we have a specific tagline we always use..."
              rows={4}
              style={{ width: '100%', boxSizing: 'border-box', background: '#0F1929', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '13px 16px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'none', marginBottom: 32 }}
            />
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px', marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>YOUR CHOICES</div>
              {[
                { label: 'Vibe', value: VIBES.find(v => v.id === vibe)?.label || '—' },
                { label: 'Colors', value: PALETTES.find(p => p.id === palette)?.label || '—' },
                { label: 'Pages', value: ['Home', ...pages].join(', ') || 'Home' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={btnSecondary} onClick={() => setStep(5)}>← Back</button>
              <button style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1 }} onClick={submit} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit ✓'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function IntakePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080C14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #0EA5E9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <IntakeForm />
    </Suspense>
  )
}
