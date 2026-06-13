'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type PortfolioClient = {
  business_name: string
  site_url: string | null
  logo_letter: string | null
  portal_color: string | null
}

const PLANS = [
  {
    name: 'Starter',
    price: '$499',
    monthly: '$79/mo',
    desc: 'Get your business online fast with a clean, professional site.',
    features: ['1-page professional website', 'Mobile-friendly design', 'Your own content dashboard', 'Contact form', '1 revision round'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$999',
    monthly: '$149/mo',
    desc: 'Everything you need to grow your online presence and convert customers.',
    features: ['Up to 5 pages', 'Product or services catalog', 'Full content dashboard', 'Image & color control', 'Priority support', '3 revision rounds'],
    highlight: true,
  },
  {
    name: 'Custom',
    price: "Let's talk",
    monthly: null,
    desc: 'For businesses with specific needs, multiple locations, or complex requirements.',
    features: ['Everything in Pro', 'Custom features & integrations', 'E-commerce ready', 'Multiple team logins', 'Ongoing retainer available'],
    highlight: false,
  },
]

const A = '#F59E0B'
const AD = 'rgba(245,158,11,0.1)'
const AB = 'rgba(245,158,11,0.22)'

export default function HomePage() {
  const [clients, setClients] = useState<PortfolioClient[]>([])

  useEffect(() => {
    supabase
      .from('clients')
      .select('business_name, site_url, logo_letter, portal_color')
      .eq('status', 'active')
      .not('site_url', 'is', null)
      .then(({ data }) => setClients(data || []))
  }, [])

  return (
    <div style={{ background: '#070707', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)', overflowX: 'hidden' }}>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      <div style={{ position: 'fixed', top: -400, left: '50%', transform: 'translateX(-50%)', width: 1100, height: 700, background: 'radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(7,7,7,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 34, height: 34, background: A, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, letterSpacing: 0.5, color: '#000', boxShadow: `0 0 20px rgba(245,158,11,0.3)` }}>MJ</div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: -0.2 }}>MJ Agency</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#work" style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', textDecoration: 'none', fontWeight: 500 }}>Work</a>
          <a href="#pricing" style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', textDecoration: 'none', fontWeight: 500 }}>Pricing</a>
          <a href="/login" style={{ background: A, borderRadius: 8, padding: '8px 18px', color: '#000', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: `0 4px 14px rgba(245,158,11,0.28)` }}>
            Client Login
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '148px 48px 128px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: AD, border: `1px solid ${AB}`, borderRadius: 100, padding: '7px 18px', fontSize: 11, fontWeight: 700, color: A, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 44 }}>
          <span style={{ width: 5, height: 5, background: A, borderRadius: '50%', display: 'inline-block', boxShadow: `0 0 8px ${A}` }} />
          Web Design & Development
        </div>

        <h1 style={{ fontSize: 'clamp(44px, 7.5vw, 82px)', fontWeight: 900, lineHeight: 1.04, letterSpacing: -2.5, margin: '0 0 32px' }}>
          Your business deserves<br />
          <span style={{ color: A }}>a website that works.</span>
        </h1>

        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.36)', maxWidth: 510, margin: '0 auto 52px', lineHeight: 1.82, fontWeight: 400 }}>
          We build fast, modern websites for local businesses — and hand you a dashboard so you can update it yourself, any time.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="mailto:contact@mjagency.com?subject=Website Quote Request" style={{ background: A, borderRadius: 10, padding: '15px 32px', color: '#000', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: `0 8px 32px rgba(245,158,11,0.32)` }}>
            Get a Free Quote →
          </a>
          <a href="#work" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: '15px 32px', color: 'rgba(255,255,255,0.55)', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
            See Our Work
          </a>
        </div>
      </section>

      {/* ── Stats ── */}
      <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 120 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 48px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[
            { val: '7 days', label: 'Average delivery' },
            { val: '100%', label: 'Mobile optimized' },
            { val: 'You own it', label: 'Dashboard & code' },
            { val: '24 hr', label: 'Response time' },
          ].map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', padding: '36px 16px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: A, letterSpacing: -0.5, marginBottom: 7 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Process ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 120px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: A, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 14, opacity: 0.85 }}>The Process</div>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, margin: 0, letterSpacing: -1.2, lineHeight: 1.1 }}>Simple from start to finish</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 2 }}>
          {[
            { step: '01', title: 'Tell us about your business', desc: 'Fill out a short intake form. Your vibe, your colors, what pages you need. Takes 5 minutes.' },
            { step: '02', title: 'We build it', desc: 'Your site goes live within 7 days. Fast, mobile-friendly, and built to your exact brand.' },
            { step: '03', title: 'You take the wheel', desc: 'Log into your own dashboard and update text, products, images, and colors — no coding required.' },
          ].map((item, i) => (
            <div key={item.step} style={{ padding: '40px 34px', background: i === 1 ? AD : 'rgba(255,255,255,0.01)', border: `1px solid ${i === 1 ? AB : 'rgba(255,255,255,0.04)'}`, borderRadius: 18 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: i === 1 ? A : 'rgba(255,255,255,0.05)', border: `1px solid ${i === 1 ? 'transparent' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: i === 1 ? '#000' : 'rgba(255,255,255,0.3)', marginBottom: 28, letterSpacing: 0.5 }}>{item.step}</div>
              <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 13, lineHeight: 1.3, letterSpacing: -0.4 }}>{item.title}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.36)', lineHeight: 1.88 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 120px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: A, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 14, opacity: 0.85 }}>What We Build</div>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, margin: 0, letterSpacing: -1.2, lineHeight: 1.1 }}>Everything your business needs online</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          {[
            { icon: '◈', title: 'Custom Website', desc: "A fast, professional site built around your brand — not a cookie-cutter template. Every detail is yours.", tag: 'Design & Dev' },
            { icon: '◉', title: 'Content Dashboard', desc: "Log in and update your own site. Change prices, swap photos, update hours. You're always in control.", tag: 'Your CMS' },
            { icon: '⊕', title: 'Ongoing Support', desc: "We're reachable by message, not a ticket system. Real help from the people who built your site.", tag: 'Support' },
          ].map(s => (
            <div key={s.title} style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, padding: '36px 30px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${A}55, transparent)` }} />
              <div style={{ fontSize: 26, marginBottom: 18, color: A, opacity: 0.85 }}>{s.icon}</div>
              <div style={{ display: 'inline-block', background: AD, border: `1px solid ${AB}`, borderRadius: 6, padding: '3px 10px', fontSize: 10, fontWeight: 700, color: A, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 16 }}>{s.tag}</div>
              <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 12, letterSpacing: -0.4, lineHeight: 1.2 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.36)', lineHeight: 1.88 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Portfolio ── */}
      <section id="work" style={{ position: 'relative', zIndex: 1, padding: '0 48px 120px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: A, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 14, opacity: 0.85 }}>Our Work</div>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, margin: 0, letterSpacing: -1.2, lineHeight: 1.1 }}>Sites we&apos;ve built</h2>
        </div>
        {clients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '88px 20px', background: '#0D0D0D', borderRadius: 18, border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 60, height: 60, background: AD, border: `1px solid ${AB}`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 22, color: A }}>↗</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10, letterSpacing: -0.3 }}>Portfolio coming soon</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.28)', maxWidth: 300, margin: '0 auto', lineHeight: 1.78 }}>We&apos;re just getting started. Check back soon to see our latest work.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
            {clients.map(client => (
              <a key={client.business_name} href={client.site_url || '#'} target="_blank" rel="noreferrer" style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, padding: '28px 26px', textDecoration: 'none', color: '#fff', display: 'block', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${client.portal_color || A}, ${client.portal_color || A}55)` }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: `linear-gradient(135deg, ${client.portal_color || A}, ${client.portal_color || A}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: `0 4px 14px ${client.portal_color || A}30` }}>
                    {client.logo_letter || client.business_name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.3 }}>{client.business_name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', fontWeight: 500, marginTop: 3 }}>View Live Site ↗</div>
                  </div>
                </div>
                <div style={{ height: 72, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.12)', fontWeight: 700, letterSpacing: 1.5 }}>LIVE PREVIEW</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ position: 'relative', zIndex: 1, padding: '0 48px 120px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: A, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 14, opacity: 0.85 }}>Pricing</div>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, margin: '0 0 12px', letterSpacing: -1.2, lineHeight: 1.1 }}>Straightforward pricing</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', margin: 0, fontWeight: 400 }}>One-time setup fee + a low monthly to keep everything running.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, alignItems: 'start' }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{ background: plan.highlight ? A : '#0D0D0D', border: `1px solid ${plan.highlight ? 'transparent' : 'rgba(255,255,255,0.05)'}`, borderRadius: 20, padding: '40px 32px', position: 'relative', color: plan.highlight ? '#000' : '#fff', boxShadow: plan.highlight ? `0 24px 60px rgba(245,158,11,0.22)` : 'none' }}>
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: '#120C00', border: `1px solid ${AB}`, borderRadius: 100, padding: '4px 16px', fontSize: 10, fontWeight: 800, color: A, letterSpacing: 1.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontSize: 11, fontWeight: 800, color: plan.highlight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.3)', letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 20 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 42, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1 }}>{plan.price}</span>
                {plan.price !== "Let's talk" && <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.28)', fontWeight: 600 }}>setup</span>}
              </div>
              {plan.monthly && <div style={{ fontSize: 14, color: plan.highlight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.3)', fontWeight: 600, marginBottom: 16 }}>then {plan.monthly}</div>}
              <div style={{ fontSize: 14, color: plan.highlight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.36)', lineHeight: 1.78, marginBottom: 24 }}>{plan.desc}</div>
              <div style={{ height: 1, background: plan.highlight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)', marginBottom: 22 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 32 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: plan.highlight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.58)' }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: plan.highlight ? 'rgba(0,0,0,0.1)' : AD, border: `1px solid ${plan.highlight ? 'rgba(0,0,0,0.15)' : AB}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0, fontWeight: 900, color: plan.highlight ? 'rgba(0,0,0,0.55)' : A }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <a href="mailto:contact@mjagency.com?subject=Quote Request - MJ Agency" style={{ display: 'block', textAlign: 'center', background: plan.highlight ? 'rgba(0,0,0,0.85)' : A, borderRadius: 11, padding: '14px', color: plan.highlight ? '#fff' : '#000', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: plan.highlight ? 'none' : `0 4px 16px rgba(245,158,11,0.28)` }}>
                {plan.name === 'Custom' ? 'Get in Touch →' : 'Get Started →'}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 148px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: '#0D0D0D', border: `1px solid ${AB}`, borderRadius: 24, padding: '84px 56px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: A, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 20, opacity: 0.85 }}>Let&apos;s work together</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, marginBottom: 18, letterSpacing: -1.2, lineHeight: 1.12 }}>Ready to get your<br />business online?</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.36)', lineHeight: 1.82, maxWidth: 420, margin: '0 auto 44px', fontWeight: 400 }}>
              Send us a message and we&apos;ll reply within 24 hours. No sales pitch — just a real conversation about what you need.
            </p>
            <a href="mailto:contact@mjagency.com?subject=Website Quote Request" style={{ display: 'inline-block', background: A, borderRadius: 11, padding: '17px 44px', color: '#000', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: `0 8px 32px rgba(245,158,11,0.3)` }}>
              Start the Conversation →
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.04)', padding: '32px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 28, height: 28, background: A, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 10, color: '#000' }}>MJ</div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.18)', fontWeight: 500 }}>© 2026 MJ Agency. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="#work" style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', textDecoration: 'none', fontWeight: 500 }}>Work</a>
          <a href="#pricing" style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', textDecoration: 'none', fontWeight: 500 }}>Pricing</a>
          <a href="/login" style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', textDecoration: 'none', fontWeight: 600 }}>Client Login</a>
        </div>
      </footer>

      <style>{`
        * { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
        a { transition: opacity 0.15s; }
        a:hover { opacity: 0.76; }
      `}</style>
    </div>
  )
}
