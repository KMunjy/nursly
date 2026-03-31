import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmployerNav } from '@/components/EmployerNav'

export const metadata: Metadata = { title: 'Team — Nursly' }

export default async function EmployerTeamPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('nursly_profiles').select('full_name').eq('id', user.id).single()
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <EmployerNav active="/employer/team" userName={profile?.full_name || ''} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#212b32', marginBottom: '8px' }}>Team members</h1>
        <p style={{ fontSize: '15px', color: '#718096', marginBottom: '28px' }}>Manage who has access to your organisation account.</p>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#005eb8,#0072e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
              {profile?.full_name?.charAt(0) || '?'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#212b32' }}>{profile?.full_name}</div>
              <div style={{ fontSize: '13px', color: '#718096' }}>{user.email}</div>
            </div>
            <span style={{ background: '#d4edda', color: '#004d25', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>Admin</span>
          </div>
          <p style={{ fontSize: '13px', color: '#a0aec0', marginTop: '16px', textAlign: 'center' }}>
            Inviting team members is coming soon. Contact support@nursly.com to add colleagues.
          </p>
        </div>
      </div>
    </div>
  )
}
