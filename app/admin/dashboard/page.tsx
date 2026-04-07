import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Admin \u2014 Nursly' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) {
    redirect('/login')
  }

  const [
    { count: totalUsers },
    { data: nursesCount },
    { data: employersCount },
    { count: openShifts },
    { count: pendingApplications },
    { count: activeOrgs },
    { data: recentShifts },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('nursly_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('nursly_profiles').select('role').eq('role', 'nurse').then((res) => ({ data: res.data?.length || 0 })),
    supabase.from('nursly_profiles').select('role').in('role', ['employer_admin', 'employer_member']).then((res) => ({ data: res.data?.length || 0 })),
    supabase.from('nursly_shifts').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('nursly_shift_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('nursly_organisations').select('*', { count: 'exact', head: true }),
    supabase.from('nursly_shifts').select('id, title, specialty, created_at, nursly_organisations(name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('nursly_profiles').select('id, full_name, role, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const statColor = { primary: '#005eb8', success: '#007f3b' }

  const StatCard = ({ icon, label, value }: { icon: string; label: string; value: number }) => (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <span style={{ fontSize: '24px' }}>{icon}</span>
      <p style={{ fontSize: '13px', color: '#a0aec0', fontWeight: '500', margin: 0 }}>{label}</p>
      <p style={{ fontSize: '32px', fontWeight: '800', color: '#212b32', margin: 0 }}>{value}</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#005eb8' }}>Nursly Admin</div>
        <Link href="/admin/dashboard" style={{ fontSize: '14px', fontWeight: '600', color: '#005eb8', textDecoration: 'none', borderBottom: '2px solid #005eb8', paddingBottom: '4px' }}>Dashboard</Link>
      </nav>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#212b32', marginBottom: '8px' }}>Admin Dashboard</h1>
          <p style={{ fontSize: '15px', color: '#718096', margin: 0 }}>Platform overview and recent activity</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <StatCard icon="\ud83d\udc65" label="Total Users" value={totalUsers || 0} />
          <StatCard icon="\ud83d\udcbc" label="Nurses" value={nursesCount || 0} />
          <StatCard icon="\ud83c\udfe5" label="Employers" value={employersCount || 0} />
          <StatCard icon="\ud83d\udccb" label="Open Shifts" value={openShifts || 0} />
          <StatCard icon="\u23f3" label="Pending Applications" value={pendingApplications || 0} />
          <StatCard icon="\ud83c\udfe2" label="Active Organisations" value={activeOrgs || 0} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#212b32', marginBottom: '16px', margin: 0 }}>\ud83d\udccc Latest Shifts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {recentShifts && recentShifts.length > 0 ? (recentShifts.map((shift: any) => (
                <div key={shift.id} style={{ paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#212b32', margin: '0 0 4px 0' }}>{shift.title}</p>
                  <p style={{ fontSize: '13px', color: '#718096', margin: '0 0 4px 0' }}>{(shift.nursly_organisations as any)?.name || 'Healthcare Employer'}</p>
                  <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>{new Date(shift.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))) : (<p style={{ fontSize: '13px', color: '#a0aec0', margin: 0 }}>No recent shifts</p>)}
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#212b32', marginBottom: '16px', margin: 0 }}>\ud83c\udd95 Latest Registrations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {recentUsers && recentUsers.length > 0 ? (recentUsers.map((user: any) => (
                <div key={user.id} style={{ paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#212b32', margin: '0 0 4px 0' }}>{user.full_name}</p>
                  <p style={{ fontSize: '13px', color: '#718096', margin: '0 0 4px 0', textTransform: 'capitalize' }}>{user.role?.replace('_', ' ')}</p>
                  <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>{new Date(user.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))) : (<p style={{ fontSize: '13px', color: '#a0aec0', margin: 0 }}>No recent registrations</p>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
