'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

/* ─── Role definitions ─────────────────────────────────────────────────── */
const ROLES = [
  {
    value: 'nurse' as const,
    emoji: '👩‍⚕️',
    title: 'Nurse / Healthcare Professional',
    subtitle: 'RGN · RMN · RNLD · HCA · Midwife · AHP',
    benefits: ['Find flexible shifts near you', 'Weekly pay, direct to your account', 'Build your professional portfolio'],
    selectedBg: '#eaf4fb',
    selectedBorder: '#005eb8',
    selectedText: '#003d78',
    accentColor: '#005eb8',
  },
  {
    value: 'employer_admin' as const,
    emoji: '🏥',
    title: 'Healthcare Employer',
    subtitle: 'Hospital · Clinic · Care Home · GP Surgery',
    benefits: ['Post shifts in under 5 minutes', 'Access NMC-verified professionals', 'Transparent pricing, no hidden fees'],
    selectedBg: '#eaf6f0',
    selectedBorder: '#007f3b',
    selectedText: '#004d25',
    accentColor: '#007f3b',
  },
]

/* ─── Supabase error → human message ───────────────────────────────────── */
function parseError(err: { message?: string; status?: number; code?: string } | null): { text: string; showSignIn: boolean } {
  if (!err) return { text: '', showSignIn: false }
  const msg = (err.message || '').toLowerCase()
  const code = err.code || ''

  if (msg.includes('already registered') || msg.includes('user already exists') || msg.includes('email address is already') || code === 'user_already_exists') {
    return { text: 'This email address already has an account.', showSignIn: true }
  }
  if (msg.includes('invalid email') || msg.includes('email address is invalid')) {
    return { text: 'Please enter a valid email address.', showSignIn: false }
  }
  if (msg.includes('password') && (msg.includes('weak') || msg.includes('strength'))) {
    return { text: 'Your password is too weak. Use at least 10 characters including uppercase letters and numbers.', showSignIn: false }
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return { text: 'Too many attempts. Please wait a few minutes and try again.', showSignIn: false }
  }
  if (msg.includes('signup') && msg.includes('disabled')) {
    return { text: 'Registrations are temporarily paused. Please contact support@nursly.com.', showSignIn: false }
  }
  if (msg.includes('database') || err.status === 500) {
    return { text: 'A server error occurred. Please try again in a moment — your details have not been saved.', showSignIn: false }
  }
  return { text: 'Registration failed. Please check your details and try again, or contact support@nursly.com.', showSignIn: false }
}

/* ─── Password strength ─────────────────────────────────────────────────── */
function getStrength(pw: string): number {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score // 0-5
}

const strengthLabel = ['', 'Very weak', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor = ['', '#da291c', '#da291c', '#f4a821', '#007f3b', '#005eb8']

/* ─── Component ─────────────────────────────────────────────────────────── */
export function RegisterForm() {
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole] = useState<'nurse' | 'employer_admin'>('nurse')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitError, setSubmitError] = useState<{ text: string; showSignIn: boolean } | null>(null)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const activeRole = ROLES.find(r => r.value === role)!
  const strength = getStrength(password)

  const passwordMeta = {
    length: password.length >= 10,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  }
  const passwordValid = Object.values(passwordMeta).every(Boolean)

  // Inline field errors — only shown after touched
  const fieldErrors: Record<string, string> = {}
  if (touched.fullName && fullName.trim().length < 2) fieldErrors.fullName = 'Please enter your full name'
  if (touched.email && (!email.includes('@') || !email.includes('.'))) fieldErrors.email = 'Please enter a valid email address'
  if (touched.password && password.length > 0 && !passwordValid) fieldErrors.password = 'Password does not meet the requirements below'

  function handleBlur(field: string) {
    setTouched(p => ({ ...p, [field]: true }))
    setFocusedField(null)
  }

  function validate(): boolean {
    setTouched({ fullName: true, email: true, password: true })
    return (
      fullName.trim().length >= 2 &&
      email.includes('@') && email.includes('.') &&
      passwordValid
    )
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
          data: { full_name: fullName.trim(), role },
        },
      })
      if (error) {
        setSubmitError(parseError(error))
        return
      }
      router.push('/verify-email')
    } catch (err: unknown) {
      const e = err instanceof Error ? { message: err.message } : null
      setSubmitError(parseError(e))
    } finally {
      setLoading(false)
    }
  }

  // Colour for the current role
  const accentColor = activeRole.accentColor

  return (
    <form onSubmit={handleSubmit} noValidate style={{ fontFamily: 'inherit' }}>

      {/* ── Role selector ────────────────────────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
          I am joining as
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {ROLES.map(r => {
            const sel = role === r.value
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => { setRole(r.value); setSubmitError(null) }}
                disabled={loading}
                style={{
                  background: sel ? r.selectedBg : '#fff',
                  border: `${sel ? '3px' : '2px'} solid ${sel ? r.selectedBorder : '#cbd5e0'}`,
                  borderRadius: '12px',
                  padding: '18px 12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                  boxShadow: sel ? `0 0 0 4px ${r.selectedBorder}18, 0 4px 12px rgba(0,0,0,0.08)` : '0 1px 3px rgba(0,0,0,0.06)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  position: 'relative',
                  transform: sel ? 'translateY(-1px)' : 'none',
                }}
              >
                {sel && (
                  <span style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: r.selectedBorder, color: '#fff',
                    borderRadius: '50%', width: '18px', height: '18px',
                    fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700,
                  }}>✓</span>
                )}
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px', lineHeight: 1 }}>{r.emoji}</span>
                <strong style={{
                  display: 'block', fontSize: '13px', lineHeight: 1.3, marginBottom: '4px',
                  color: sel ? r.selectedText : '#2d3748',
                }}>
                  {r.title}
                </strong>
                <span style={{ display: 'block', fontSize: '11px', color: '#718096', marginBottom: '10px', lineHeight: 1.4 }}>
                  {r.subtitle}
                </span>
                {sel && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left' }}>
                    {r.benefits.map(b => (
                      <li key={b} style={{
                        fontSize: '11px', color: r.selectedText,
                        display: 'flex', alignItems: 'flex-start', gap: '5px',
                        marginBottom: '3px', lineHeight: 1.4,
                      }}>
                        <span style={{ flexShrink: 0, marginTop: '1px', color: r.selectedBorder }}>✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Full name ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="reg-name" style={labelStyle}>Full name</label>
        <span style={hintStyle}>As it appears on your official ID</span>
        <input
          id="reg-name"
          type="text"
          value={fullName}
          placeholder="e.g. Sarah Johnson"
          autoComplete="name"
          disabled={loading}
          onChange={e => setFullName(e.target.value)}
          onFocus={() => setFocusedField('fullName')}
          onBlur={() => handleBlur('fullName')}
          style={inputStyle(!!fieldErrors.fullName, focusedField === 'fullName', accentColor)}
        />
        {fieldErrors.fullName && <FieldError msg={fieldErrors.fullName} />}
      </div>

      {/* ── Email ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="reg-email" style={labelStyle}>Email address</label>
        <input
          id="reg-email"
          type="email"
          value={email}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={loading}
          onChange={e => setEmail(e.target.value)}
          onFocus={() => setFocusedField('email')}
          onBlur={() => handleBlur('email')}
          style={inputStyle(!!fieldErrors.email, focusedField === 'email', accentColor)}
        />
        {fieldErrors.email && <FieldError msg={fieldErrors.email} />}
      </div>

      {/* ── Password ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="reg-password" style={labelStyle}>Choose a password</label>
        <div style={{ position: 'relative' }}>
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            placeholder="Create a secure password"
            autoComplete="new-password"
            disabled={loading}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setFocusedField('password')}
            onBlur={() => handleBlur('password')}
            style={{ ...inputStyle(!!fieldErrors.password, focusedField === 'password', accentColor), paddingRight: '48px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
              color: '#718096', fontSize: '13px', fontFamily: 'inherit',
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Strength bar */}
        {password.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{
                  flex: 1, height: '4px', borderRadius: '2px',
                  background: i <= strength ? strengthColor[strength] : '#e2e8f0',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
            <span style={{ fontSize: '12px', color: strengthColor[strength] || '#718096', fontWeight: 600 }}>
              {strengthLabel[strength]}
            </span>
          </div>
        )}

        {/* Requirements */}
        {(password.length > 0 || touched.password) && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {[
              { ok: passwordMeta.length, label: 'At least 10 characters' },
              { ok: passwordMeta.upper, label: 'One uppercase letter (A–Z)' },
              { ok: passwordMeta.number, label: 'One number (0–9)' },
            ].map(({ ok, label }) => (
              <span key={label} style={{
                fontSize: '13px',
                color: ok ? '#007f3b' : (touched.password && !ok ? '#da291c' : '#718096'),
                display: 'flex', alignItems: 'center', gap: '7px',
                fontWeight: ok ? 600 : 400,
                transition: 'color 0.2s',
              }}>
                <span style={{
                  width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                  background: ok ? '#007f3b' : '#e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', color: ok ? '#fff' : '#718096',
                  transition: 'all 0.2s',
                }}>
                  {ok ? '✓' : ''}
                </span>
                {label}
              </span>
            ))}
          </div>
        )}

        {!password && !touched.password && (
          <p style={{ fontSize: '13px', color: '#718096', marginTop: '6px', lineHeight: 1.5 }}>
            Min 10 characters · uppercase letter · number
          </p>
        )}
      </div>

      {/* ── Submit error ─────────────────────────────────────────────── */}
      {submitError && (
        <div role="alert" style={{
          background: '#fff5f5',
          border: '1px solid #fed7d7',
          borderLeft: '4px solid #da291c',
          borderRadius: '8px',
          padding: '14px 16px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#742a2a',
          lineHeight: 1.6,
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
          <span>
            {submitError.text}
            {submitError.showSignIn && (
              <> {' '}<Link href="/login" style={{ color: '#005eb8', fontWeight: 700, textDecoration: 'underline' }}>Sign in instead →</Link></>
            )}
          </span>
        </div>
      )}

      {/* ── Privacy ──────────────────────────────────────────────────── */}
      <div style={{
        fontSize: '13px', color: '#718096', marginBottom: '20px',
        lineHeight: 1.7, padding: '12px 14px',
        background: '#f7fafc', borderRadius: '8px',
        border: '1px solid #e2e8f0',
      }}>
        🔒 By creating an account you agree to our{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>
          Privacy Notice
        </a>
        . We process your data to operate the platform in line with{' '}
        <strong style={{ color: '#4a5568' }}>UK GDPR</strong>.
        Your details are never sold to third parties.
      </div>

      {/* ── Submit button ────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        style={{
          width: '100%',
          background: loading ? '#718096' : accentColor,
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '16px 20px',
          fontSize: '17px',
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          letterSpacing: '0.01em',
          boxShadow: loading ? 'none' : `0 4px 14px ${accentColor}40`,
        }}
      >
        {loading ? (
          <>
            <Spinner />
            Creating your account…
          </>
        ) : (
          `Join Nursly as a ${role === 'nurse' ? 'Healthcare Professional' : 'Healthcare Employer'} →`
        )}
      </button>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
      `}</style>
    </form>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function FieldError({ msg }: { msg: string }) {
  return (
    <span role="alert" style={{
      display: 'flex', alignItems: 'center', gap: '5px',
      fontSize: '13px', color: '#da291c', marginTop: '5px',
      fontWeight: 600, animation: 'fadeIn 0.15s ease',
    }}>
      ⚠ {msg}
    </span>
  )
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: '16px', height: '16px',
      border: '2px solid rgba(255,255,255,0.35)',
      borderTopColor: '#fff', borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  )
}

/* ─── Shared styles ──────────────────────────────────────────────────────── */
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '15px', fontWeight: 700,
  color: '#2d3748', marginBottom: '3px',
}
const hintStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', color: '#718096', marginBottom: '7px',
}
function inputStyle(hasError: boolean, focused: boolean, accentColor: string): React.CSSProperties {
  return {
    width: '100%',
    border: `2px solid ${hasError ? '#fc8181' : focused ? accentColor : '#cbd5e0'}`,
    borderRadius: '8px',
    padding: '13px 16px',
    fontSize: '16px',
    color: '#2d3748',
    fontFamily: 'inherit',
    background: hasError ? '#fff5f5' : focused ? '#fff' : '#fafbfc',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
    boxShadow: focused ? `0 0 0 3px ${accentColor}20` : '0 1px 2px rgba(0,0,0,0.05)',
  } as React.CSSProperties
}
