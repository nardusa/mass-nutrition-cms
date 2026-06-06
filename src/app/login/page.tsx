'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const s = {
  page: { minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' } as React.CSSProperties,
  card: { width: '100%', maxWidth: 420, background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '48px 40px' } as React.CSSProperties,
  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 } as React.CSSProperties,
  logoIcon: { width: 44, height: 44, background: 'linear-gradient(135deg,#00A550,#007A3A)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff', boxShadow: '0 0 24px rgba(0,165,80,0.35)' } as React.CSSProperties,
  logoText: { fontSize: 18, fontWeight: 800, letterSpacing: 1, color: '#fff' } as React.CSSProperties,
  logoSub: { fontSize: 12, color: '#00A550', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' as const },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#fff' } as React.CSSProperties,
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 36 } as React.CSSProperties,
  label: { display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 },
  input: { width: '100%', background: '#1A1A1A', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 15, transition: 'border-color 0.2s', marginBottom: 20 } as React.CSSProperties,
  btn: { width: '100%', background: 'linear-gradient(135deg,#00A550,#007A3A)', border: 'none', borderRadius: 12, padding: '16px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5, boxShadow: '0 8px 24px rgba(0,165,80,0.35)' } as React.CSSProperties,
  error: { background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ff6b6b', fontSize: 13, marginBottom: 20 } as React.CSSProperties,
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' } as React.CSSProperties,
  dividerLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' } as React.CSSProperties,
  dividerText: { fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 } as React.CSSProperties,
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    const isAdmin = data.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
    router.push(isAdmin ? '/admin' : '/editor')
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoIcon}>M</div>
          <div>
            <div style={s.logoText}>MASS NUTRITION</div>
            <div style={s.logoSub}>Agency CMS</div>
          </div>
        </div>

        <div style={s.title}>Welcome back</div>
        <div style={s.subtitle}>Sign in to manage your client websites</div>

        {error && <div style={s.error}>⚠ {error}</div>}

        <form onSubmit={handleLogin}>
          <label style={s.label}>Email</label>
          <input
            style={s.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <label style={s.label}>Password</label>
          <input
            style={s.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div style={s.divider}>
          <div style={s.dividerLine} />
          <div style={s.dividerText}>SECURE LOGIN</div>
          <div style={s.dividerLine} />
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          Clients: use the email & password your agency provided
        </div>
      </div>
    </div>
  )
}
