'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ROLES = [
  {
    value: 'nurse',
    icon: '👩‍⚕️',
    title: 'Nurse / Healthcare Professional',
    subtitle: 'RGN, RMN, RNLD, HCA, Midwife',
    desc: 'Find flexible shifts near you',
    bg: '#EBF4FB',
    border: '#005eb8',
  },
  {
    value: 'employer_admin',
    icon: '🏥',
    title: 'Healthcare Employer',
    subtitle: 'Hospital, Clinic, Care Home, GP Surgery',
    desc: 'Post shifts and find trusted staff',
    bg: '#EBF5EE',
    border: '#007f3b',
  },
]

function getErrorMessage(error: { message?: string; status?: number } | null): string {
  if (!error) return ''
  const msg = error.message?.toLowerCase() || ''
  if (msg.includes('already registered') || msg.includes('user already exists') || msg.includes('email address is already')) {
    return 'This email address is already registered. Try signing in instead.'
  }
  if (msg.includes('password') && msg.includes('weak')) {
    return 'Your password is too weak. Use at least 10 characters with uppercase letters and numbers.'
  }
  if (msg.includes('invalid email') || msg.includes('email address is invalid')) {
    return 'Please enter a valid email address.'
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Connection issue. Please check your internet connection and try again.'
  }
  if (msg.includes('database error') || error.status === 500) {
    return 'A server error occurred. Our team has been notified. Please try again in a moment.'
  }
  return 'Registration failed. Please check your details and try again.'
}

export function RegisterForm() {
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole] = useState<'nurse' | 'employer_admin'>('nurse')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const passwordStrength = {
    length: password.length >= 10,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  }
  const passwordValid = Object.values(passwordStrength).every(Boolean)

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!fullName.trim() || fullName.trim().length < 2) e.fullName = 'Please enter your full name'
    if (!email.includes('@') || !email.includes('.')) e.email = 'Please enter a valid email address'
    if (!passwordValid) e.password = 'Password does not meet the requirements below'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName.trim(),
            role: role,
          },
        },
      })
      if (error) {
        setSubmitError(getErrorMessage(error))
        return
      }
      router.push('/verify-email')
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? { message: err.message } : null
      setSubmitError(getErrorMessage(errorObj))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* Role cards */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#212b32', marginBottom: '12px' }}>
          I am registering as
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {ROLES.map(r => {
            const selected = role === r.value
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value as 'nurse' | 'employer_admin')}
                disabled={loading}
                style={{
                  background: selected ? r.bg : '#fff',
                  border: `${selected ? '3px' : '2px'} solid ${selected ? r.border : '#d0d8dc'}`,
                  borderRadius: '10px',
                  padding: '18px 14px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.18s',
                  boxShadow: selected ? `0 0 0 3px ${r.border}22` : '0 1px 4px rgba(33,43,50,0.07)',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: '30px', display: 'block', marginBottom: '8px' }}>{r.icon}</span>
                <strong style={{ display: 'block', fontSize: '13px', color: selected ? r.border : '#212b32', marginBottom: '3px', lineHeight: 1.3 }}>
                  {r.title}
                </strong>
                <span style={{ display: 'block', fontSize: '11px', color: '#768692', marginBottom: '4px', lineHeight: 1.3 }}>
                  {r.subtitle}
                </span>
                <span style={{ display: 'block', fontSize: '11px', color: selected ? r.border : '#768692', fontStyle: 'italic' }}>
                  {r.desc}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Full name */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="fullName" style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#212b32', marginBottom: '3px' }}>
          Full name
        </label>
        <span style={{ display: 'block', fontSize: '13px', color: '#768692', marginBottom: '6px' }}>
          Use your legal name as it appears on your ID
        </span>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={e => { setFullName(e.target.value); if (errors.fullName) setErrors(p => ({ ...p, fullName: '' })) }}
          placeholder="e.g. Sarah Johnson"
          autoComplete="name"
          disabled={loading}
          style={{
            width: '100%',
            border: `2px solid ${errors.fullName ? '#da291c' : '#768692'}`,
            borderRadius: '4px',
            padding: '12px 14px',
            fontSize: '16px',
            color: '#212b32',
            fontFamily: 'inherit',
            background: '#fff',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.target.style.borderColor = errors.fullName ? '#da291c' : '#212b32'; e.target.style.boxShadow = '0 0 0 3px #ffb81c44' }}
          onBlur={e => { e.target.style.borderColor = errors.fullName ? '#da291c' : '#768692'; e.target.style.boxShadow = 'none' }}
        />
        {errors.fullName && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#da291c', marginTop: '5px', fontWeight: 600 }}>
            ⚠ {errors.fullName}
          </span>
        )}
      </div>

      {/* Email */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="reg-email" style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#212b32', marginBottom: '6px' }}>
          Email address
        </label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })) }}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={loading}
          style={{
            width: '100%',
            border: `2px solid ${errors.email ? '#da291c' : '#768692'}`,
            borderRadius: '4px',
            padding: '12px 14px',
            fontSize: '16px',
            color: '#212b32',
            fontFamily: 'inherit',
            background: '#fff',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.target.style.borderColor = errors.email ? '#da291c' : '#212b32'; e.target.style.boxShadow = '0 0 0 3px #ffb81c44' }}
          onBlur={e => { e.target.style.borderColor = errors.email ? '#da291c' : '#768692'; e.target.style.boxShadow = 'none' }}
        />
        {errors.email && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#da291c', marginTop: '5px', fontWeight: 600 }}>
            ⚠ {errors.email}
          </span>
        )}
      </div>

      {/* Password */}
      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="reg-password" style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#212b32', marginBottom: '6px' }}>
          Choose a password
        </label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })) }}
          placeholder="Create a secure password"
          autoComplete="new-password"
          disabled={loading}
          style={{
            width: '100%',
            border: `2px solid ${errors.password ? '#da291c' : '#768692'}`,
            borderRadius: '4px',
            padding: '12px 14px',
            fontSize: '16px',
            color: '#212b32',
            fontFamily: 'inherit',
            background: '#fff',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.target.style.borderColor = errors.password ? '#da291c' : '#212b32'; e.target.style.boxShadow = '0 0 0 3px #ffb81c44' }}
          onBlur={e => { e.target.style.borderColor = errors.password ? '#da291c' : '#768692'; e.target.style.boxShadow = 'none' }}
        />

        {/* Password strength indicators */}
        {password.length > 0 && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { ok: passwordStrength.length, label: 'At least 10 characters' },
              { ok: passwordStrength.upper, label: 'One uppercase letter (A–Z)' },
              { ok: passwordStrength.number, label: 'One number (0–9)' },
            ].map(({ ok, label }) => (
              <span key={label} style={{ fontSize: '13px', color: ok ? '#007f3b' : '#768692', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>{ok ? '✓' : '○'}</span>
                {label}
              </span>
            ))}
          </div>
        )}
        {!password && (
          <span style={{ display: 'block', fontSize: '13px', color: '#768692', marginTop: '5px' }}>
            Min 10 characters · one uppercase · one number
          </span>
        )}
        {errors.password && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#da291c', marginTop: '5px', fontWeight: 600 }}>
            ⚠ {errors.password}
          </span>
        )}
      </div>

      {/* Submit error */}
      {submitError && (
        <div role="alert" style={{
          background: '#fdecea',
          border: '2px solid #da291c',
          borderLeftWidth: '6px',
          borderRadius: '6px',
          padding: '14px 16px',
          marginBottom: '20px',
          fontSize: '15px',
          color: '#8b1912',
          fontWeight: 500,
          lineHeight: 1.5,
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
          <span>{submitError}</span>
        </div>
      )}

      {/* Privacy */}
      <div style={{
        fontSize: '13px',
        color: '#768692',
        marginBottom: '20px',
        lineHeight: 1.6,
        padding: '12px 14px',
        background: '#f5f8fa',
        borderRadius: '4px',
        borderLeft: '3px solid #d0d8dc',
      }}>
        By creating an account you agree to our{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#005eb8' }}>
          Privacy Notice
        </a>
        . We process your data to operate the platform in line with UK GDPR.
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        style={{
          width: '100%',
          background: loading ? '#768692' : '#007f3b',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          padding: '15px 20px',
          fontSize: '18px',
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          letterSpacing: '0.01em',
        }}
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Creating your account…
          </>
        ) : (
          <>Create account →</>
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  )
}
