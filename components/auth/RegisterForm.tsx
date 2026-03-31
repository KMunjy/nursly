'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SELF_REGISTRATION_ROLES, ROLE_LABELS } from '@/lib/auth/roles'
import type { UserRole } from '@/lib/auth/roles'

export function RegisterForm() {
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole] = useState<UserRole>('nurse')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!fullName || fullName.trim().length < 2) e.fullName = 'Enter your full name'
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
        // Never confirm whether email exists
        setSubmitError('Registration failed. Check your details and try again.')
        return
      }
      router.push('/verify-email')
    } catch {
      setSubmitError('Connection issue. Check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label">I am registering as</label>
        <div className="role-selector">
          {SELF_REGISTRATION_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              className={`role-option ${role === r ? 'role-option--selected' : ''}`}
              onClick={() => setRole(r)}
              disabled={loading}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="fullName" className="form-label">Full name</label>
        <input
          id="fullName" type="text"
          className={`form-input ${errors.fullName ? 'form-input--error' : ''}`}
          value={fullName} onChange={(e) => setFullName(e.target.value)}
          autoComplete="name" placeholder="Your full legal name" disabled={loading}
        />
        {errors.fullName && <span className="form-error" role="alert">{errors.fullName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="reg-email" className="form-label">Email address</label>
        <input
          id="reg-email" type="email"
          className={`form-input ${errors.email ? 'form-input--error' : ''}`}
          value={email} onChange={(e) => setEmail(e.target.value)}
          autoComplete="email" placeholder="you@example.com" disabled={loading}
        />
        {errors.email && <span className="form-error" role="alert">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="reg-password" className="form-label">Password</label>
        <input
          id="reg-password" type="password"
          className={`form-input ${errors.password ? 'form-input--error' : ''}`}
          value={password} onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password" placeholder="At least 10 characters" disabled={loading}
        />
        {errors.password
          ? <span className="form-error" role="alert">{errors.password}</span>
          : <span className="form-hint">Min 10 characters, one uppercase letter, one number.</span>
        }
      </div>

      {submitError && <div className="form-alert" role="alert">{submitError}</div>}

      <p className="form-privacy">
        By creating an account you agree to our{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Notice</a>
        {' '}and confirm we may process your data to operate the platform.
      </p>

      <button type="submit" className="btn-submit" disabled={loading} aria-busy={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}
