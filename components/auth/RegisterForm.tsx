'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ROLES = [
  { value: 'nurse', icon: '👩‍⚕️', label: 'Nurse / Healthcare Professional', hint: 'RGN, RMN, RNLD, HCA' },
  { value: 'employer_admin', icon: '🏥', label: 'Employer', hint: 'Hospital, clinic, care home' },
]

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

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!fullName.trim() || fullName.trim().length < 2) e.fullName = 'Enter your full name'
    if (!email.includes('@')) e.email = 'Enter a valid email address'
    if (password.length < 10) e.password = 'Password must be at least 10 characters'
    if (!/[A-Z]/.test(password)) e.password = 'Password must contain an uppercase letter'
    if (!/[0-9]/.test(password)) e.password = 'Password must contain a number'
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
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: fullName.trim(), role },
        },
      })
      if (error) {
        setSubmitError('Registration failed. Please check your details and try again.')
        return
      }
      router.push('/verify-email')
    } catch {
      setSubmitError('Connection issue. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Role selector */}
      <div className="form-group">
        <label className="form-label">I am registering as</label>
        <div className="role-selector">
          {ROLES.map(r => (
            <button
              key={r.value} type="button"
              className={`role-option${role === r.value ? ' role-option--selected' : ''}`}
              onClick={() => setRole(r.value as 'nurse' | 'employer_admin')}
              disabled={loading}
            >
              <span className="role-option-icon">{r.icon}</span>
              <strong>{r.label}</strong>
              <span style={{ display: 'block', fontSize: '12px', marginTop: '4px', fontWeight: 400, opacity: 0.75 }}>{r.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="fullName" className="form-label">Full name</label>
        <span className="form-label-hint">Use your legal name as it appears on your ID</span>
        <input
          id="fullName" type="text"
          className={`form-input${errors.fullName ? ' form-input--error' : ''}`}
          value={fullName} onChange={e => setFullName(e.target.value)}
          autoComplete="name" placeholder="e.g. Sarah Johnson"
          disabled={loading}
        />
        {errors.fullName && <span className="form-error" role="alert">{errors.fullName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="reg-email" className="form-label">Email address</label>
        <input
          id="reg-email" type="email"
          className={`form-input${errors.email ? ' form-input--error' : ''}`}
          value={email} onChange={e => setEmail(e.target.value)}
          autoComplete="email" placeholder="you@example.com"
          disabled={loading}
        />
        {errors.email && <span className="form-error" role="alert">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="reg-password" className="form-label">Password</label>
        <span className="form-label-hint">At least 10 characters, one uppercase letter, one number</span>
        <input
          id="reg-password" type="password"
          className={`form-input${errors.password ? ' form-input--error' : ''}`}
          value={password} onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
          disabled={loading}
        />
        {errors.password && <span className="form-error" role="alert">{errors.password}</span>}
      </div>

      {submitError && <div className="form-alert" role="alert">{submitError}</div>}

      <div className="form-privacy">
        By creating an account you agree to our{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Notice</a>.
        {' '}We process your data to operate the platform in line with UK GDPR.
      </div>

      <button type="submit" className="btn-submit" disabled={loading} aria-busy={loading}>
        {loading ? 'Creating account…' : 'Create account →'}
      </button>
    </form>
  )
}
