'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type PortfolioClient = {
  business_name: string
  site_url: string | null
  logo_letter: string | null
  portal_color: string | null
}

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
    <div style={{ background: '#080C14', color: '#fff', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,12,20,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(14,165,233,0.1)', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, letterSpacing: 0.5, boxShadow: '0 0 16px rgba(14,165,233,0.35)' }}>MJ</div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: 0.3 }}>MJ Agency</span>
        </div>
        <a href="/login" style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 8, padding: '8px 18px', color: '#0EA5E9', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}>
          Client Login →
        </a>
      </nav>

      {/* Hero */}
      <section style={{ padding: '100px 40px 80px', maxWidth: 1100, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'inline-block', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 50, padding: '6px 18px', fontSize: 12, fontWeight: 700, color: '#0EA5E9', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 28 }}>
          Web Design & Development Agency
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, margin: '0 0 24px' }}>
          We build modern websites<br />
          <span style={{ color: '#0EA5E9' }}>for businesses that deserve better.</span>
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', maxWidth: 580, margin: '0 auto 44px', lineHeight: 1.7 }}>
          Local businesses. Real results. We design, build, and hand you the keys — so you stay in control of your site forever.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#work" style={{ background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', border: 'none', borderRadius: 12, padding: '15px 32px', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 24px rgba(14,165,233,0.35)' }}>
            See Our Work ↓
          </a>
          <a href="mailto:Moro752006@gmail.com?subject=Website Quote Request" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '15px 32px', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
            Get a Free Quote →
          </a>
        </div>
      </section>

      {/* Services */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0EA5E9', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>What We Build</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>Everything your business needs online</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            {
              icon: '🌐',
              title: 'Custom Website',
              desc: 'A fast, mobile-friendly site built to reflect your brand — not a template. Your business, your look.',
            },
            {
              icon: '⚙️',
              title: 'Your Own Dashboard',
              desc: 'Log in and update your site yourself — change products, text, images, colors. No developer needed.',
            },
            {
              icon: '🤝',
              title: 'Ongoing Support',
              desc: 'We\'re local and reachable. Need a change or something fixed? We\'re a message away.',
            },
          ].map(s => (
            <div key={s.title} style={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '32px 28px' }}>
              <div style={{ fontSize: 36, marginBottom: 18 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio */}
      <section id="work" style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0EA5E9', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Our Work</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>Sites we&apos;ve built</h2>
        </div>
        {clients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#0D1525', borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Portfolio coming soon</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Check back soon — we&apos;re just getting started.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {clients.map(client => (
              <a
                key={client.business_name}
                href={client.site_url || '#'}
                target="_blank"
                rel="noreferrer"
                style={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '32px 28px', textDecoration: 'none', color: '#fff', display: 'block', transition: 'border-color 0.2s, transform 0.2s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${client.portal_color || '#0EA5E9'}, ${client.portal_color || '#0EA5E9'}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', boxShadow: `0 0 20px ${client.portal_color || '#0EA5E9'}40`, flexShrink: 0 }}>
                    {client.logo_letter || client.business_name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{client.business_name}</div>
                    <div style={{ fontSize: 12, color: client.portal_color || '#0EA5E9', fontWeight: 600, marginTop: 2 }}>View Site ↗</div>
                  </div>
                </div>
                <div style={{ height: 4, background: `linear-gradient(90deg, ${client.portal_color || '#0EA5E9'}, transparent)`, borderRadius: 2 }} />
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Why MJ */}
      <section style={{ padding: '80px 40px', background: 'rgba(14,165,233,0.03)', borderTop: '1px solid rgba(14,165,233,0.08)', borderBottom: '1px solid rgba(14,165,233,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0EA5E9', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Why MJ Agency</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>Not your average web agency</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { icon: '📍', title: 'Local & Personal', desc: 'We work with businesses in our community. You\'re not a ticket in a queue — you\'re a neighbor.' },
              { icon: '🎨', title: 'Built to Your Brand', desc: 'Every pixel is customized to match your business. Colors, content, layout — all yours.' },
              { icon: '🔑', title: 'You Own Everything', desc: 'We hand you full access to your site and dashboard when we\'re done. No dependency on us to make updates.' },
            ].map(w => (
              <div key={w.title} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>{w.icon}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{w.title}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: '100px 40px', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#0EA5E9', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Get In Touch</div>
        <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 16, margin: '0 0 16px' }}>Ready to upgrade your website?</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 40, lineHeight: 1.7 }}>
          Send us a message and we&apos;ll get back to you within 24 hours. No sales pitch — just a real conversation about what your business needs.
        </p>
        <a
          href="mailto:Moro752006@gmail.com?subject=Website Quote Request"
          style={{ display: 'inline-block', background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', borderRadius: 12, padding: '18px 40px', color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 32px rgba(14,165,233,0.35)', marginBottom: 24 }}
        >
          Email Us →
        </a>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
          Moro752006@gmail.com
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11 }}>MJ</div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>© 2026 MJ Agency. All rights reserved.</span>
        </div>
        <a href="/login" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontWeight: 600 }}>Client Login →</a>
      </footer>
    </div>
  )
}
