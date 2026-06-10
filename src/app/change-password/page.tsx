'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      setUserEmail(session.user.email || '')
      setChecking(false)
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setSaving(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) { setError(updateError.message); setSaving(false); return }

    // Mark password as changed in profile
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from('profiles').update({ must_change_password: false }).eq('id', session.user.id)
    }

    router.replace('/editor')
  }

  if (checking) return (
    <div style={{ minHeight: '100vh', background: '#080C14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '3px solid #0EA5E9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '48px 40px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
          <div style={{ width: 34, height: 34, background: '#fff', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: '#000' }}>MJ</div>
          <span style={{ fontWeight: 800, fontSize: 14 }}>MJ Agency</span>
        </div>

        <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Set your password</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 32, lineHeight: 1.6 }}>
          Welcome! Choose a personal password to secure your account.<br />
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>{userEmail}</span>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ff6b6b', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>New Password</label>
          <input
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', boxSizing: 'border-box', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 15, marginBottom: 16, outline: 'none', fontFamily: 'inherit' }}
          />
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            style={{ width: '100%', boxSizing: 'border-box', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 15, marginBottom: 28, outline: 'none', fontFamily: 'inherit' }}
          />

          {password.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: password.length >= i * 3 ? (password.length >= 10 ? '#22C55E' : password.length >= 6 ? '#FFD700' : '#EF4444') : 'rgba(255,255,255,0.08)' }} />
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{ width: '100%', border: 'none', borderRadius: 12, padding: '16px', background: '#fff', color: '#000', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'inherit' }}
          >
            {saving ? 'Saving…' : 'Set Password & Enter →'}
          </button>
        </form>
      </div>
    </div>
  )
}
