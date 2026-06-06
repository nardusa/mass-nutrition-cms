'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, type Client } from '@/lib/supabase'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientSlug = searchParams.get('client')

  const [clientData, setClientData] = useState<Client | null>(null)
  const [brandLoading, setBrandLoading] = useState(!!clientSlug)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!clientSlug) { setBrandLoading(false); return }
    supabase
      .from('clients')
      .select('*')
      .eq('slug', clientSlug)
      .single()
      .then(({ data }) => { setClientData(data); setBrandLoading(false) })
  }, [clientSlug])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }
    const isAdmin = data.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
    router.push(isAdmin ? '/admin' : '/editor')
  }

  const brand = clientData ? {
    name: clientData.business_name,
    letter: clientData.logo_letter || clientData.business_name[0]?.toUpperCase() || 'B',
    primary: clientData.portal_color || '#00A550',
    accent: clientData.portal_accent || '#FFD700',
    tagline: 'Content Portal',
    welcomeMsg: `Sign in to manage your ${clientData.business_name} website`,
  } : {
    name: 'Agency CMS',
    letter: 'A',
    primary: '#00A550',
    accent: '#FFD700',
    tagline: 'Agency Admin Panel',
    welcomeMsg: 'Sign in to manage your client websites',
  }

  if (brandLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Loading…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: -300, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 600, borderRadius: '50%',
        background: `radial-gradient(circle, ${brand.primary}1A 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 420,
        background: '#111',
        border: `1px solid ${clientData ? brand.primary + '30' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 20, padding: '48px 40px',
        boxShadow: clientData ? `0 0 60px ${brand.primary}15` : 'none',
      }}>
        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <div style={{
            width: 50, height: 50, flexShrink: 0,
            background: `linear-gradient(135deg, ${brand.primary}, ${brand.primary}BB)`,
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900, color: '#fff',
            boxShadow: `0 0 28px ${brand.primary}45`,
          }}>
            {brand.letter}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: 0.5, color: '#fff', lineHeight: 1.2 }}>
              {brand.name.toUpperCase()}
            </div>
            <div style={{ fontSize: 10, color: brand.primary, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginTop: 3 }}>
              {brand.tagline}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, color: '#fff' }}>Welcome back</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 36, lineHeight: 1.5 }}>{brand.welcomeMsg}</div>

        {error && (
          <div style={{ background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ff6b6b', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            Email
          </label>
          <input
            type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required
            style={{ width: '100%', boxSizing: 'border-box', background: '#1A1A1A', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 15, marginBottom: 20, outline: 'none' }}
          />
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            Password
          </label>
          <input
            type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)} required
            style={{ width: '100%', boxSizing: 'border-box', background: '#1A1A1A', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 15, marginBottom: 24, outline: 'none' }}
          />
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', border: 'none', borderRadius: 12, padding: '16px',
              background: `linear-gradient(135deg, ${brand.primary}, ${brand.primary}BB)`,
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 8px 24px ${brand.primary}45`, letterSpacing: 0.5,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 700, letterSpacing: 1.5 }}>SECURE LOGIN</div>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          {clientData
            ? `${clientData.business_name} content management portal`
            : 'Use the credentials provided to you'}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Loading…</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
