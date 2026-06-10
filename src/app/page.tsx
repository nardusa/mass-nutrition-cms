import { createServerSupabaseClient, type AgencyContent } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type PortfolioClient = {
  business_name: string
  site_url: string | null
  logo_letter: string | null
  portal_color: string | null
}

const PLANS_DEFAULT = [
  {
    name: 'Starter',
    price: '$499',
    monthly: '$79/mo',
    desc: 'Perfect for getting your business online fast.',
    features: ['1-page professional website', 'Mobile-friendly design', 'Your own content dashboard', 'Contact form', '1 revision round'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$999',
    monthly: '$149/mo',
    desc: 'For businesses ready to grow their online presence.',
    features: ['Up to 5 pages', 'Product or services catalog', 'Full content dashboard', 'Image & color control', 'Priority support', '3 revision rounds'],
    highlight: true,
  },
  {
    name: 'Custom',
    price: "Let's talk",
    monthly: null,
    desc: 'For businesses with specific needs or multiple locations.',
    features: ['Everything in Pro', 'Custom features & integrations', 'E-commerce ready', 'Multiple team logins', 'Ongoing retainer available'],
    highlight: false,
  },
]

export default async function HomePage() {
  const db = createServerSupabaseClient()

  const [{ data: clientsData }, { data: acData }] = await Promise.all([
    db.from('clients')
      .select('business_name, site_url, logo_letter, portal_color')
      .eq('status', 'active')
      .not('site_url', 'is', null),
    db.from('agency_content').select('*').single(),
  ])

  const clients: PortfolioClient[] = clientsData || []
  const ac: AgencyContent | null = acData

  const primary       = ac?.primary_color      ?? '#F59E0B'
  const company       = ac?.company_name        ?? 'MJ Agency'
  const letters       = ac?.logo_letters        ?? 'MJ'
  const email         = ac?.contact_email       ?? 'contact@mjagency.com'
  const badge         = ac?.hero_badge          ?? 'Web Design & Development'
  const headline1     = ac?.hero_headline_1     ?? 'Your business deserves'
  const headline2     = ac?.hero_headline_2     ?? 'a website that works.'
  const subtitle      = ac?.hero_subtitle       ?? 'We build fast, modern websites for local businesses — and hand you a dashboard so you can update it yourself, any time.'
  const ctaPrimary    = ac?.hero_cta_primary    ?? 'Get a Free Quote'
  const ctaSecondary  = ac?.hero_cta_secondary  ?? 'See Our Work'
  const processTitle  = ac?.process_title       ?? 'Simple from start to finish'
  const servicesTitle = ac?.services_title      ?? 'Everything your business needs online'
  const pricingTitle  = ac?.pricing_title       ?? 'Straightforward pricing'
  const pricingSubtitle = ac?.pricing_subtitle  ?? 'One-time setup fee + a low monthly to keep everything running.'
  const ctaTitle      = ac?.cta_title           ?? 'Ready to get your business online?'
  const ctaSubtitle   = ac?.cta_subtitle        ?? "Send us a message and we'll reply within 24 hours. No sales pitch — just a real conversation about what you need."
  const ctaButton     = ac?.cta_button          ?? 'Start the Conversation'
  const copyright     = ac?.footer_copyright    ?? '© 2026 MJ Agency. All rights reserved.'
  const stats         = [
    { val: ac?.stat_1_val ?? '7-Day',    label: ac?.stat_1_label ?? 'Average delivery' },
    { val: ac?.stat_2_val ?? '100%',     label: ac?.stat_2_label ?? 'Mobile optimized' },
    { val: ac?.stat_3_val ?? 'You Own',  label: ac?.stat_3_label ?? 'Your dashboard & code' },
    { val: ac?.stat_4_val ?? '24hr',     label: ac?.stat_4_label ?? 'Response time' },
  ]
  const plans = ac?.pricing_plans ?? PLANS_DEFAULT

  return (
    <div style={{ background: '#080808', color: '#fff', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflowX: 'hidden' }}>

      {/* Grid */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />

      {/* Nav */}
      <nav className="lp-nav" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
          <div style={{ width: 32, height: 32, background: primary, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, letterSpacing: 0.5, color: '#000' }}>{letters}</div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: 0.2 }}>{company}</span>
        </a>
        <div className="lp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="#work" style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontWeight: 600 }}>Work</a>
          <a href="#pricing" style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontWeight: 600 }}>Pricing</a>
          <a href="/login" style={{ background: primary, borderRadius: 8, padding: '7px 16px', color: '#000', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Client Login
          </a>
        </div>
        <a className="lp-nav-mobile-btn" href="/login" style={{ display: 'none', background: primary, borderRadius: 8, padding: '7px 14px', color: '#000', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          Login
        </a>
      </nav>

      {/* Hero */}
      <section className="lp-hero" style={{ position: 'relative', zIndex: 1, padding: '120px 40px 100px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 36 }}>
          <span style={{ width: 6, height: 6, background: primary, borderRadius: '50%', display: 'inline-block' }} />
          {badge}
        </div>

        <h1 style={{ fontSize: 'clamp(38px, 6.5vw, 74px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: -2, margin: '0 0 28px', color: '#fff' }}>
          {headline1}<br />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>{headline2}</span>
        </h1>

        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.75, fontWeight: 400 }}>
          {subtitle}
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={`mailto:${email}?subject=Website Quote Request`} style={{ background: primary, borderRadius: 10, padding: '14px 30px', color: '#000', fontSize: 15, fontWeight: 700, textDecoration: 'none', letterSpacing: 0.2 }}>
            {ctaPrimary}
          </a>
          <a href="#work" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '14px 30px', color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 700, textDecoration: 'none', letterSpacing: 0.2 }}>
            {ctaSecondary}
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <div className="lp-stats" style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="lp-stats-inner" style={{ maxWidth: 900, margin: '0 auto', padding: '40px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 32 }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="lp-section-top" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="lp-section-hdr" style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>The Process</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>{processTitle}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2 }}>
          {[
            { step: '01', title: 'Tell us about your business', desc: 'Fill out a short intake form. Your vibe, your colors, what pages you need. Takes 5 minutes.' },
            { step: '02', title: 'We build it', desc: 'Your site goes live within 7 days. Fast, mobile-friendly, and built to your exact brand.' },
            { step: '03', title: 'You take the wheel', desc: 'Log into your own dashboard and update text, products, images, and colors — no coding required.' },
          ].map((item, i) => (
            <div key={item.step} style={{ padding: '40px 36px', background: i === 1 ? `${primary}0F` : 'transparent', border: `1px solid ${i === 1 ? `${primary}40` : 'rgba(255,255,255,0.05)'}`, borderRadius: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, marginBottom: 20 }}>STEP {item.step}</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14, lineHeight: 1.3 }}>{item.title}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What we build */}
      <section className="lp-section" style={{ position: 'relative', zIndex: 1, padding: '0 40px 100px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="lp-section-hdr" style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>What We Build</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>{servicesTitle}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { title: 'Custom Website', desc: 'A fast, professional site built around your brand — not a cookie-cutter template. Every detail is yours.', tag: 'Design & Dev' },
            { title: 'Content Dashboard', desc: "Log in and update your own site. Change prices, swap photos, update hours. You're always in control.", tag: 'Your CMS' },
            { title: 'Ongoing Support', desc: "We're reachable by message, not a support ticket system. Real help from the people who built your site.", tag: 'Support' },
          ].map(s => (
            <div key={s.title} style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '36px 32px' }}>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>{s.tag}</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, letterSpacing: -0.3 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio */}
      <section id="work" className="lp-section" style={{ position: 'relative', zIndex: 1, padding: '0 40px 100px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="lp-section-hdr" style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Our Work</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>Sites we&apos;ve built</h2>
        </div>
        {clients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#0F0F0F', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 22 }}>↗</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Portfolio coming soon</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', maxWidth: 320, margin: '0 auto', lineHeight: 1.7 }}>We&apos;re just getting started. Check back soon to see our latest work.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {clients.map(client => (
              <a key={client.business_name} href={client.site_url || '#'} target="_blank" rel="noreferrer" style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '32px 28px', textDecoration: 'none', color: '#fff', display: 'block' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${client.portal_color || '#fff'}, ${client.portal_color || '#aaa'}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                    {client.logo_letter || client.business_name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.2 }}>{client.business_name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 3 }}>View Live Site ↗</div>
                  </div>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Pricing */}
      <section id="pricing" className="lp-section" style={{ position: 'relative', zIndex: 1, padding: '0 40px 100px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="lp-section-hdr" style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Pricing</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, margin: '0 0 16px', letterSpacing: -0.5 }}>{pricingTitle}</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{pricingSubtitle}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'start' }}>
          {plans.map(plan => (
            <div key={plan.name} style={{ background: plan.highlight ? primary : '#0F0F0F', border: `1px solid ${plan.highlight ? 'transparent' : 'rgba(255,255,255,0.06)'}`, borderRadius: 18, padding: '36px 32px', position: 'relative', color: plan.highlight ? '#000' : '#fff' }}>
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#000', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '4px 14px', fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontSize: 14, fontWeight: 800, color: plan.highlight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginBottom: 16 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1 }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>setup</span>
              </div>
              {plan.monthly && <div style={{ fontSize: 14, color: plan.highlight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.35)', fontWeight: 600, marginBottom: 20 }}>then {plan.monthly}</div>}
              <div style={{ fontSize: 13, color: plan.highlight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 28 }}>{plan.desc}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: plan.highlight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.65)' }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: plan.highlight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)', border: `1px solid ${plan.highlight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0, fontWeight: 700 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <a href={`mailto:${email}?subject=Quote Request - ${plan.name} Plan`} style={{ display: 'block', textAlign: 'center', background: plan.highlight ? '#000' : primary, border: 'none', borderRadius: 10, padding: '13px', color: plan.highlight ? '#fff' : '#000', fontSize: 14, fontWeight: 700, textDecoration: 'none', letterSpacing: 0.2 }}>
                {plan.name === 'Custom' ? 'Get in Touch' : 'Get Started'}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="lp-section" style={{ position: 'relative', zIndex: 1, padding: '0 40px 120px', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <div className="lp-cta-card" style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '72px 48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, marginBottom: 16, letterSpacing: -0.5, lineHeight: 1.2 }}>{ctaTitle}</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 40, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 40px' }}>
              {ctaSubtitle}
            </p>
            <a href={`mailto:${email}?subject=Website Quote Request`} style={{ display: 'inline-block', background: primary, borderRadius: 10, padding: '16px 40px', color: '#000', fontSize: 15, fontWeight: 700, textDecoration: 'none', letterSpacing: 0.2 }}>
              {ctaButton}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer" style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: primary, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 10, color: '#000' }}>{letters}</div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>{copyright}</span>
        </div>
        <a href="/login" style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textDecoration: 'none', fontWeight: 600 }}>Client Login</a>
      </footer>

      <style>{`
        * { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
        a { transition: opacity 0.15s; } a:hover { opacity: 0.75; }
        @media (max-width: 768px) {
          .lp-nav { padding: 0 20px !important; }
          .lp-nav-links { display: none !important; }
          .lp-nav-mobile-btn { display: block !important; }
          .lp-hero { padding: 64px 20px 56px !important; }
          .lp-stats { }
          .lp-stats-inner { padding: 28px 20px !important; gap: 24px !important; justify-content: space-around !important; }
          .lp-section { padding: 0 20px 60px !important; }
          .lp-section-top { padding: 60px 20px 60px !important; }
          .lp-cta-card { padding: 40px 24px !important; border-radius: 18px !important; }
          .lp-footer { padding: 24px 20px !important; }
          .lp-section-hdr { margin-bottom: 36px !important; }
        }
      `}</style>
    </div>
  )
}
