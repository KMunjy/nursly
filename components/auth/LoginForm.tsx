'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getPostAuthRedirect, isSafeRedirect } from '@/lib/auth/redirects'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setEmailError(null)

    if (!email.includes('@')) {
      setEmailError('Enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        // Deliberately vague — do not reveal whether email exists
        setSubmitError('Email or password is incorrect.')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSubmitError('Sign in failed. Please try again.'); return }

      const { data: profile } = await supabase
        .from('profiles').select('role, status').eq('id', user.id).single()

      if (!profile) { setSubmitError('Account not found. Contact support@nursly.com'); return }

      if (redirectTo && isSafeRedirect(redirectTo)) {
        router.push(redirectTo)
        return
      }

      const { data: nurseProfile } = profile.role === 'nurse'
        ? await supabase.from('nurse_profiles').select('onboarding_complete').eq('id', user.id).single()
        : { data: null }

      router.push(getPostAuthRedirect(profile.role as any, nurseProfile?.onboarding_complete ?? false))
    } catch {
      setSubmitError('Connection issue. Check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="email" className="form-label">Email address</label>
        <input
          id="email" type="email"
          className={`form-input ${emailError ? 'form-input--error' : ''}`}
          value={email} onChange={(e) => setEmail(e.target.value)}
          autoComplete="email" disabled={loading}
        />
        {emailError && <span className="form-error" role="alert">{emailError}</span>}
      </div>

      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label htmlFor="password" className="form-label" style={{ margin: 0 }}>Password</label>
          <Link href="/forgot-password" style={{ fontSize: '12px' }}>Forgot password?</Link>
        </div>
        <input
          id="password" type="password"
          className="form-input"
          value={password} onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password" disabled={loading}
        />
      </div>

      {submitError && <div className="form-alert" role="alert">{submitError}</div>}

      <button type="submit" className="btn-submit" disabled={loading} aria-busy={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
