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
    supabase.from('clients').select('*').eq('slug', clientSlug).single()
      .then(({ data }) => { setClientData(data); setBrandLoading(false) })
  }, [clientSlug])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('role, must_change_password').eq('id', data.user!.id).single()
    const isAdmin = profile?.role === 'admin' || data.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
    if (!isAdmin && profile?.must_change_password) {
      router.push('/change-password')
    } else {
      router.push(isAdmin ? '/admin' : '/editor')
    }
  }

  // Client gets their brand colors; MJ Agency gets black & white
  const isAgency = !clientData
  const brand = clientData ? {
    primary: clientData.portal_color || '#ffffff',
    accent: clientData.portal_accent || '#aaaaaa',
    name: clientData.business_name,
    letter: clientData.logo_letter || clientData.business_name[0]?.toUpperCase() || 'B',
    tagline: 'Content Portal',
    welcomeMsg: `Sign in to manage your ${clientData.business_name} website`,
    btnTextColor: '#fff',
  } : {
    primary: '#F59E0B',
    accent: '#FCD34D',
    name: 'MJ Agency',
    letter: 'MJ',
    tagline: 'Admin Portal',
    welcomeMsg: 'Sign in to manage your client websites',
    btnTextColor: '#000',
  }

  if (brandLoading) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', background: '#0A0A0A',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
    padding: '14px 16px', color: '#fff', fontSize: 15, outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Grid */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />
      {/* Glow */}
      <div style={{ position: 'fixed', top: -200, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${brand.primary}12 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '48px 40px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>

        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <div style={{
            width: 48, height: 48, flexShrink: 0, borderRadius: 13,
            background: `linear-gradient(135deg, ${brand.primary}, ${brand.primary}BB)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: clientData ? 20 : 13, fontWeight: 900,
            color: brand.btnTextColor,
            boxShadow: `0 0 24px ${brand.primary}40`,
          }}>
            {brand.letter}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.3, color: '#fff', lineHeight: 1.2 }}>{brand.name.toUpperCase()}</div>
            <div style={{ fontSize: 10, color: brand.accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginTop: 3 }}>{brand.tagline}</div>
          </div>
        </div>

        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, color: '#fff', letterSpacing: -0.3 }}>Welcome back</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 32, lineHeight: 1.5 }}>{brand.welcomeMsg}</div>

        {error && (
          <div style={{ background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.25)', borderRadius: 10, padding: '12px 16px', color: '#ff6b6b', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginBottom: 8 }}>Email</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ ...inp, marginBottom: 16 }} />
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginBottom: 8 }}>Password</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ ...inp, marginBottom: 24 }} />
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', border: 'none', borderRadius: 12, padding: '15px',
              background: `linear-gradient(135deg, ${brand.primary}, ${brand.primary}CC)`,
              color: brand.btnTextColor, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              letterSpacing: 0.3, fontFamily: 'inherit',
              boxShadow: `0 8px 24px ${brand.primary}35`,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '28px 0' }} />
        <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>
          {clientData ? `${clientData.business_name} content management portal` : 'Use the credentials provided to you'}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input:focus{border-color:rgba(255,255,255,0.25)!important} *{-webkit-font-smoothing:antialiased}`}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
