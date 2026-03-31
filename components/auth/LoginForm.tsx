'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError('Email or password is incorrect.')
        return
      }
      const redirectTo = searchParams.get('redirectTo') || '/'
      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
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
          className="form-input"
          value={email} onChange={e => setEmail(e.target.value)}
          autoComplete="email" placeholder="you@example.com"
          disabled={loading} required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
          <Link href="/forgot-password" style={{ float: 'right', fontSize: '14px', fontWeight: 400 }}>
            Forgot password?
          </Link>
        </label>
        <input
          id="password" type="password"
          className="form-input"
          value={password} onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={loading} required
        />
      </div>

      {error && <div className="form-alert" role="alert">{error}</div>}

      <button type="submit" className="btn-submit" disabled={loading} aria-busy={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
