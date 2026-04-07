import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmployerNav } from '@/components/EmployerNav'

export const metadata: Metadata = { title: 'Team â Nursly' }

export default async function EmployerTeamPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('nursly_profiles').select('full_name').eq('id', user.id).single()

  // Get user's org
  const { data: memberData } = await supabase
    .from('nursly_org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  let teamMembers: any[] = []

  if (memberData?.org_id) {
    // Get all org members with their profile names
    const { data: members } = await supabase
      .from('nursly_org_members')
      .select('id, user_id, org_role, created_at')
      .eq('org_id', memberData.org_id)
      .order('created_at', { ascending: true })

    if (members && members.length > 0) {
      const userIds = members.map(m => m.user_id)
      const { data: profiles } = await supabase
        .from('nursly_profiles')
        .select('id, full_name')
        .in('id', userIds)

      const nameMap: Record<string, string> = {}
      profiles?.forEach((p: any) => { nameMap[p.id] = p.full_name || 'Unknown' })

      teamMembers = members.map(m => ({
        ...m,
        full_name: nameMap[m.user_id] || 'Unknown',
        is_current_user: m.user_id === user.id,
      }))
    }
  }

  const roleColors: Record<string, { bg: string; text: string }> = {
    admin: { bg: '#005eb8', text: '#fff' },
    manager: { bg: '#007f3b', text: '#fff' },
    staff: { bg: '#e2e8f0', text: '#005eb8' },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <EmployerNav active="/employer/team" userName={profile?.full_name || ''} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#212b32', marginBottom: '8px' }}>Team members</h1>
        <p style={{ fontSize: '15px', color: '#718096', marginBottom: '28px' }}>Manage who has access to your organisation account.</p>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {teamMembers.length > 0 ? (
            teamMembers.map((member: any, idx: number) => {
              const rc = roleColors[member.org_role] || roleColors.staff
              const joinDate = new Date(member.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
              return (
                <div key={member.id} style={{
                  padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                  borderBottom: idx < teamMembers.length - 1 ? '1px solid #e2e8f0' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#005eb8,#0072e5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '16px', flexShrink: 0,
                    }}>
                      {member.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#212b32' }}>
                        {member.full_name}{member.is_current_user ? ' (you)' : ''}
                      </div>
                      <div style={{ fontSize: '13px', color: '#718096' }}>Joined {joinDate}</div>
                    </div>
                  </div>
                  <span style={{
                    background: rc.bg, color: rc.text, fontSize: '11px', fontWeight: 700,
                    padding: '4px 12px', borderRadius: '100px', textTransform: 'capitalize',
                  }}>
                    {member.org_role}
                  </span>
                </div>
              )
            })
          ) : (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>ð¥</div>
              <p style={{ color: '#718096', fontSize: '15px' }}>No team members found.</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: '20px', padding: '16px 20px', background: '#f0f9f4', border: '1px solid #c6e8d4', borderRadius: '8px', fontSize: '14px', color: '#1a5e35', lineHeight: 1.5 }}>
          Team invitations are coming soon. To add colleagues now, contact <a href="mailto:support@nursly.com" style={{ color: '#005eb8', fontWeight: 600 }}>support@nursly.com</a>.
        </div>
      </div>
    </div>
  )
}
