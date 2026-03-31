import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmployerNav } from '@/components/EmployerNav'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Post a Shift — Nursly' }

export default async function PostShiftPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('nursly_profiles').select('full_name').eq('id', user.id).single()

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <EmployerNav active="/employer/shifts" userName={profile?.full_name || ''} />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link href="/employer/shifts" style={{ color: '#005eb8', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>← Back to shifts</Link>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#212b32', marginBottom: '8px' }}>Post a new shift</h1>
          <p style={{ fontSize: '15px', color: '#718096', marginBottom: '28px', lineHeight: 1.6 }}>Fill in the details below to advertise your vacancy to NMC-verified nurses.</p>
          <div style={{ background: '#f0f9f4', border: '1px solid #c6e8d4', borderRadius: '8px', padding: '14px 16px', marginBottom: '24px', fontSize: '14px', color: '#1a5e35', lineHeight: 1.5 }}>
            🚀 Shift posting form is coming shortly. To post a shift immediately, contact us at <a href="mailto:support@nursly.com" style={{ color: '#005eb8', fontWeight: 600 }}>support@nursly.com</a> or call <strong>0800 123 4567</strong> — we'll post it for you within the hour.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {['Role title', 'Specialty', 'Band level', 'Date', 'Start time', 'End time', 'Rate (£/hr)', 'Location'].map(field => (
              <div key={field} style={{ padding: '12px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0', opacity: 0.6 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#718096', textTransform: 'uppercase', marginBottom: '4px' }}>{field}</div>
                <div style={{ height: '20px', background: '#e2e8f0', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
