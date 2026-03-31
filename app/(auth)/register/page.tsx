import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = { title: 'Create account — Nursly' }

export default function RegisterPage() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '0',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,94,184,0.08)',
    }}>
      {/* Warm header strip */}
      <div style={{
        background: 'linear-gradient(135deg, #005eb8 0%, #0072e5 100%)',
        padding: '28px 32px 24px',
        color: '#fff',
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
          Join the Nursly community
        </h1>
        <p style={{ fontSize: '14px', opacity: 0.88, marginTop: '6px', lineHeight: 1.5 }}>
          Connecting compassionate care across the UK
        </p>
        {/* Trust row */}
        <div style={{
          display: 'flex', gap: '20px', flexWrap: 'wrap',
          marginTop: '16px', paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.2)',
        }}>
          {[
            { icon: '✅', text: 'NMC-verified nurses' },
            { icon: '💷', text: 'Weekly pay' },
            { icon: '🏥', text: 'NHS & private roles' },
          ].map(({ icon, text }) => (
            <span key={text} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.92 }}>
              {icon} {text}
            </span>
          ))}
        </div>
      </div>

      {/* Form body */}
      <div style={{ padding: '28px 32px' }}>
        <div style={{
          background: '#f0f9f4',
          border: '1px solid #c6e8d4',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          fontSize: '14px',
          color: '#1a5e35',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          lineHeight: 1.5,
        }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>🔒</span>
          <span>Your details are secure. We verify all nurses against the NMC register before activation.</span>
        </div>

        <RegisterForm />

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#718096',
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0',
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#005eb8', fontWeight: 700, textDecoration: 'underline' }}>
            Sign in →
          </Link>
        </div>
      </div>
    </div>
  )
}
