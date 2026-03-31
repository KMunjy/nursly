import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Employer Dashboard — Nursly' }

export default async function EmployerDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('nursly_profiles')
    .select('full_name, status, role')
    .eq('id', user.id)
    .single()

  const { count: openShifts } = await supabase
    .from('nursly_shifts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'open')

  const { count: pendingApps } = await supabase
    .from('nursly_shift_applications')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#005eb8', borderBottom: '4px solid #003d78', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Link href="/employer/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff', marginRight: '32px' }}>
          <span style={{ background: '#fff', color: '#005eb8', fontWeight: 900, fontSize: '13px', padding: '2px 7px', borderRadius: '3px' }}>N</span>
          <span style={{ fontSize: '18px', fontWeight: 700 }}>Nursly</span>
        </Link>
        {[
          { href: '/employer/dashboard', label: 'Dashboard', active: true },
          { href: '/employer/shifts', label: 'Manage shifts' },
          { href: '/employer/timesheets', label: 'Timesheets' },
          { href: '/employer/team', label: 'My team' },
        ].map(({ href, label, active }) => (
          <Link key={href} href={href} style={{ fontSize: '14px', fontWeight: active ? 600 : 500, color: active ? '#fff' : 'rgba(255,255,255,0.8)', padding: '0 16px', height: '60px', display: 'flex', alignItems: 'center', textDecoration: 'none', borderBottom: active ? '4px solid #ffb81c' : '4px solid transparent' }}>
            {label}
          </Link>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{profile?.full_name}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Sign out</button>
          </form>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#212b32', marginBottom: '4px' }}>Welcome, {firstName} 👋</h1>
          <p style={{ fontSize: '15px', color: '#718096' }}>Manage your shifts and find trusted healthcare professionals.</p>
        </div>

        {/* Post shift CTA */}
        <div style={{ background: 'linear-gradient(135deg, #007f3b, #00a04d)', borderRadius: '12px', padding: '20px 24px', marginBottom: '28px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Post a new shift</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>NMC-verified nurses ready to work. Post in under 5 minutes.</div>
          </div>
          <Link href="/employer/shifts/new" style={{ background: '#fff', color: '#007f3b', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', textDecoration: 'none', flexShrink: 0 }}>
            Post a shift →
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Open shifts', value: openShifts ?? 0, color: '#005eb8', icon: '📋', sub: 'Currently live' },
            { label: 'Pending applications', value: pendingApps ?? 0, color: '#007f3b', icon: '👩‍⚕️', sub: 'Awaiting review' },
            { label: 'Month spend', value: '£0', color: '#f4a821', icon: '💷', sub: 'Platform fee included' },
          ].map(({ label, value, color, icon, sub }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: `4px solid ${color}`, borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                <span style={{ fontSize: '20px' }}>{icon}</span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#212b32', lineHeight: 1, marginBottom: '4px' }}>{value}</div>
              <div style={{ fontSize: '12px', color: '#718096' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#212b32', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>Quick actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { href: '/employer/shifts/new', label: '➕ Post a new shift', desc: 'Fill a vacancy fast' },
              { href: '/employer/shifts', label: '📋 View all shifts', desc: 'Active, filled, and drafts' },
              { href: '/employer/timesheets', label: '📄 Approve timesheets', desc: 'Pending sign-off' },
              { href: '/employer/team', label: '👥 Manage team access', desc: 'Add team members' },
            ].map(({ href, label, desc }) => (
              <Link key={href} href={href} style={{ display: 'flex', flexDirection: 'column', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textDecoration: 'none', background: '#fafbfc' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#212b32', marginBottom: '3px' }}>{label}</span>
                <span style={{ fontSize: '12px', color: '#718096' }}>{desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <footer style={{ background: '#1a2b3d', color: 'rgba(255,255,255,0.55)', padding: '16px 24px', textAlign: 'center', fontSize: '12px', marginTop: 'auto' }}>
        Nursly Healthcare Staffing · <a href="/privacy" style={{ color: 'rgba(255,255,255,0.55)' }}>Privacy</a> · support@nursly.com
      </footer>
    </div>
  )
}
