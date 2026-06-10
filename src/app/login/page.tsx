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
    const { data: profile } = await supabase.from('profiles').select('role, must_change_password').eq('id', data.user!.id).single()
    const isAdmin = profile?.role === 'admin' || data.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
    if (!isAdmin && profile?.must_change_password) {
      router.push('/change-password')
    } else {
      router.push(isAdmin ? '/admin' : '/editor')
    }
  }

  // Client white-label brand OR agency default (blue)
  const brand = clientData ? {
    name: clientData.business_name,
    letter: clientData.logo_letter || clientData.business_name[0]?.toUpperCase() || 'B',
    primary: clientData.portal_color || '#0EA5E9',
    accent: clientData.portal_accent || '#FFD700',
    tagline: 'Content Portal',
    welcomeMsg: `Sign in to manage your ${clientData.business_name} website`,
  } : {
    name: 'MJ Agency',
    letter: 'MJ',
    primary: '#0EA5E9',
    accent: '#38BDF8',
    tagline: 'Admin Portal',
    welcomeMsg: 'Sign in to manage your client websites',
  }

  if (brandLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#070B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, border: '3px solid #0EA5E9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050A12', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: -300, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 600, borderRadius: '50%',
        background: `radial-gradient(circle, ${brand.primary}1A 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      {/* Grid lines */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(14,165,233,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.025) 1px, transparent 1px)`,
        backgroundSize: '72px 72px',
      }} />

      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 420,
        background: '#0A1020',
        border: `1px solid ${clientData ? brand.primary + '35' : 'rgba(14,165,233,0.18)'}`,
        borderRadius: 20, padding: '48px 40px',
        boxShadow: `0 0 60px ${brand.primary}12, 0 24px 64px rgba(0,0,0,0.5)`,
      }}>
        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <div style={{
            width: 50, height: 50, flexShrink: 0,
            background: `linear-gradient(135deg, ${brand.primary}, ${brand.primary}BB)`,
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: clientData ? 22 : 15, fontWeight: 900, color: '#fff',
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
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Email</label>
          <input
            type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required
            style={{ width: '100%', boxSizing: 'border-box', background: '#0F1929', border: '1.5px solid rgba(14,165,233,0.15)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 15, marginBottom: 20, outline: 'none' }}
          />
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Password</label>
          <input
            type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)} required
            style={{ width: '100%', boxSizing: 'border-box', background: '#0F1929', border: '1.5px solid rgba(14,165,233,0.15)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 15, marginBottom: 24, outline: 'none' }}
          />
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', border: 'none', borderRadius: 12, padding: '16px',
              background: `linear-gradient(135deg, ${brand.primary}, ${brand.primary}BB)`,
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 8px 24px ${brand.primary}40`, letterSpacing: 0.5,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '28px 0' }} />

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
      <div style={{ minHeight: '100vh', background: '#070B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, border: '3px solid #0EA5E9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
