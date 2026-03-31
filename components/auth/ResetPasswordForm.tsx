'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function getStrength(pw: string): number {
  let s = 0
  if (pw.length >= 8) s++; if (pw.length >= 10) s++
  if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const strengthLabel = ['', 'Very weak', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor = ['', '#da291c', '#da291c', '#f4a821', '#007f3b', '#005eb8']

export function ResetPasswordForm() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const strength = getStrength(password)
  const meta = { length: password.length >= 10, upper: /[A-Z]/.test(password), number: /[0-9]/.test(password) }
  const valid = Object.values(meta).every(Boolean)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) { setError('Password does not meet the requirements below.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setError(''); setLoading(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) { setError('Failed to update password. The reset link may have expired. Please request a new one.'); return }
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } finally { setLoading(false) }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#2d3748', marginBottom: '10px' }}>Password updated</h2>
        <p style={{ fontSize: '15px', color: '#718096', lineHeight: 1.6 }}>
          Your password has been changed. Redirecting you to sign in…
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="new-pw" style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#2d3748', marginBottom: '6px' }}>New password</label>
        <div style={{ position: 'relative' }}>
          <input
            id="new-pw" type={showPw ? 'text' : 'password'} value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            placeholder="Create a strong password" autoComplete="new-password" disabled={loading}
            style={{ width: '100%', border: `2px solid ${error ? '#fc8181' : '#cbd5e0'}`, borderRadius: '8px', padding: '13px 48px 13px 16px', fontSize: '16px', color: '#2d3748', fontFamily: 'inherit', background: '#fafbfc', outline: 'none', boxSizing: 'border-box' }}
          />
          <button type="button" onClick={() => setShowPw(s => !s)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#718096', fontSize: '13px', fontFamily: 'inherit' }}>
            {showPw ? 'Hide' : 'Show'}
          </button>
        </div>
        {password.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= strength ? strengthColor[strength] : '#e2e8f0', transition: 'background 0.3s' }} />
              ))}
            </div>
            <span style={{ fontSize: '12px', color: strengthColor[strength], fontWeight: 600 }}>{strengthLabel[strength]}</span>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[{ok: meta.length, l: 'At least 10 characters'}, {ok: meta.upper, l: 'One uppercase letter'}, {ok: meta.number, l: 'One number'}].map(({ok, l}) => (
                <span key={l} style={{ fontSize: '13px', color: ok ? '#007f3b' : '#718096', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: ok ? '#007f3b' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: ok ? '#fff' : '#718096', flexShrink: 0 }}>{ok ? '✓' : ''}</span>
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="confirm-pw" style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#2d3748', marginBottom: '6px' }}>Confirm new password</label>
        <input
          id="confirm-pw" type={showPw ? 'text' : 'password'} value={confirm}
          onChange={e => { setConfirm(e.target.value); setError('') }}
          placeholder="Re-enter your new password" autoComplete="new-password" disabled={loading}
          style={{ width: '100%', border: `2px solid ${confirm && confirm !== password ? '#fc8181' : '#cbd5e0'}`, borderRadius: '8px', padding: '13px 16px', fontSize: '16px', color: '#2d3748', fontFamily: 'inherit', background: confirm && confirm !== password ? '#fff5f5' : '#fafbfc', outline: 'none', boxSizing: 'border-box' }}
        />
        {confirm && confirm !== password && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#da291c', marginTop: '5px', fontWeight: 600 }}>⚠ Passwords do not match</span>
        )}
      </div>
      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderLeft: '4px solid #da291c', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px', fontSize: '14px', color: '#742a2a', lineHeight: 1.6 }}>
          ⚠️ {error}
        </div>
      )}
      <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#718096' : '#007f3b', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 20px', fontSize: '17px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
        {loading ? 'Updating…' : 'Set new password →'}
      </button>
    </form>
  )
}
