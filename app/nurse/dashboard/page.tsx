import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard — Nursly' }

export default async function NurseDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch nurse profile and stats
  const { data: profile } = await supabase
    .from('nursly_profiles')
    .select('full_name, status, role')
    .eq('id', user.id)
    .single()

  const { data: nurseProfile } = await supabase
    .from('nursly_nurse_profiles')
    .select('onboarding_complete, specialties, location_city')
    .eq('id', user.id)
    .single()

  const { data: applications } = await supabase
    .from('nursly_shift_applications')
    .select('id, status, applied_at')
    .eq('nurse_id', user.id)
    .order('applied_at', { ascending: false })
    .limit(5)

  const { count: openShiftCount } = await supabase
    .from('nursly_shifts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'open')

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const onboardingDone = nurseProfile?.onboarding_complete ?? false
  const appCount = applications?.length ?? 0

  const appStats = {
    pending: applications?.filter(a => a.status === 'pending').length ?? 0,
    selected: applications?.filter(a => a.status === 'selected').length ?? 0,
    total: appCount,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ background: '#005eb8', borderBottom: '4px solid #003d78', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '0', flexShrink: 0 }}>
        <Link href="/nurse/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff', marginRight: '32px' }}>
          <span style={{ background: '#fff', color: '#005eb8', fontWeight: 900, fontSize: '13px', padding: '2px 7px', borderRadius: '3px' }}>N</span>
          <span style={{ fontSize: '18px', fontWeight: 700 }}>Nursly</span>
        </Link>
        {[
          { href: '/nurse/dashboard', label: 'Dashboard', active: true },
          { href: '/nurse/shifts', label: 'Find shifts' },
          { href: '/nurse/applications', label: 'My applications' },
          { href: '/nurse/profile', label: 'My profile' },
        ].map(({ href, label, active }) => (
          <Link key={href} href={href} style={{
            fontSize: '14px', fontWeight: active ? 600 : 500,
            color: active ? '#fff' : 'rgba(255,255,255,0.8)',
            padding: '0 16px', height: '60px',
            display: 'flex', alignItems: 'center',
            textDecoration: 'none',
            borderBottom: active ? '4px solid #ffb81c' : '4px solid transparent',
          }}>
            {label}
          </Link>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{profile?.full_name}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px', padding: '6px 14px',
              fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
            }}>Sign out</button>
          </form>
        </div>
      </nav>

      {/* Main */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>

        {/* Welcome header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#212b32', marginBottom: '4px' }}>
            Good to see you, {firstName} 👋
          </h1>
          <p style={{ fontSize: '15px', color: '#718096' }}>
            {onboardingDone ? 'Your profile is complete and visible to employers.' : 'Complete your profile to start applying for shifts.'}
          </p>
        </div>

        {/* Onboarding banner */}
        {!onboardingDone && (
          <div style={{
            background: 'linear-gradient(135deg, #005eb8, #0072e5)',
            borderRadius: '12px', padding: '20px 24px',
            marginBottom: '28px', color: '#fff',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
          }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                Complete your profile to start finding shifts
              </div>
              <div style={{ fontSize: '14px', opacity: 0.88, lineHeight: 1.5 }}>
                Add your NMC PIN, specialties, and availability. Takes about 5 minutes.
              </div>
            </div>
            <Link href="/nurse/onboarding" style={{
              background: '#fff', color: '#005eb8',
              padding: '10px 20px', borderRadius: '8px',
              fontWeight: 700, fontSize: '14px', textDecoration: 'none',
              flexShrink: 0,
            }}>
              Complete profile →
            </Link>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Open shifts near you', value: openShiftCount ?? '—', color: '#005eb8', icon: '🏥', sub: 'Across UK' },
            { label: 'My applications', value: appStats.total, color: '#007f3b', icon: '📋', sub: `${appStats.pending} pending` },
            { label: 'Confirmed shifts', value: appStats.selected, color: '#f4a821', icon: '✅', sub: 'This month' },
          ].map(({ label, value, color, icon, sub }) => (
            <div key={label} style={{
              background: '#fff', border: '1px solid #e2e8f0',
              borderTop: `4px solid ${color}`,
              borderRadius: '10px', padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                <span style={{ fontSize: '20px' }}>{icon}</span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#212b32', lineHeight: 1, marginBottom: '4px' }}>{value}</div>
              <div style={{ fontSize: '12px', color: '#718096' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Two-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Quick actions */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#212b32', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              Quick actions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: '/nurse/shifts', label: '🔍 Browse available shifts', desc: `${openShiftCount ?? 0} shifts open now`, color: '#005eb8' },
                { href: '/nurse/profile', label: '👩‍⚕️ Update my profile', desc: 'Specialties, NMC PIN, availability', color: '#007f3b' },
                { href: '/nurse/applications', label: '📋 View my applications', desc: `${appStats.pending} pending responses`, color: '#f4a821' },
                { href: '/nurse/timesheets', label: '📄 Submit timesheet', desc: 'For completed shifts', color: '#718096' },
              ].map(({ href, label, desc, color }) => (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: '8px',
                  border: '1px solid #e2e8f0', textDecoration: 'none',
                  background: '#fafbfc', transition: 'all 0.15s',
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#212b32', marginBottom: '2px' }}>{label}</div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>{desc}</div>
                  </div>
                  <span style={{ color, fontSize: '16px' }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent applications */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#212b32', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              Recent applications
            </h2>
            {applications && applications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {applications.map(app => {
                  const statusColors: Record<string, { bg: string; text: string }> = {
                    pending:     { bg: '#fff4d0', text: '#7a5900' },
                    shortlisted: { bg: '#d8e8f7', text: '#003d78' },
                    selected:    { bg: '#d4edda', text: '#004d25' },
                    rejected:    { bg: '#fdecea', text: '#8b1912' },
                    withdrawn:   { bg: '#f0f4f5', text: '#718096' },
                  }
                  const sc = statusColors[app.status] || statusColors.pending
                  return (
                    <div key={app.id} style={{
                      padding: '12px 14px', borderRadius: '8px',
                      border: '1px solid #e2e8f0', background: '#fafbfc',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#212b32', marginBottom: '2px' }}>
                          Application #{app.id.substring(0, 8)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#718096' }}>
                          {new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <span style={{
                        background: sc.bg, color: sc.text,
                        fontSize: '11px', fontWeight: 700,
                        padding: '3px 10px', borderRadius: '100px',
                        textTransform: 'capitalize',
                      }}>
                        {app.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: 1.6 }}>
                  No applications yet. Browse available shifts to get started.
                </p>
                <Link href="/nurse/shifts" style={{
                  display: 'inline-block', marginTop: '16px',
                  background: '#005eb8', color: '#fff',
                  padding: '10px 20px', borderRadius: '8px',
                  fontWeight: 600, fontSize: '14px', textDecoration: 'none',
                }}>
                  Find shifts →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Support footer */}
        <div style={{ marginTop: '32px', padding: '16px 20px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '14px', color: '#718096' }}>
            Need help? Our support team is here Mon–Fri, 8am–6pm.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="mailto:support@nursly.com" style={{ color: '#005eb8', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>📧 Email support</a>
            <a href="tel:08001234567" style={{ color: '#005eb8', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>📞 0800 123 4567</a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#1a2b3d', color: 'rgba(255,255,255,0.55)', padding: '16px 24px', textAlign: 'center', fontSize: '12px', marginTop: 'auto' }}>
        Nursly Healthcare Staffing · <a href="/privacy" style={{ color: 'rgba(255,255,255,0.55)' }}>Privacy</a> · support@nursly.com
      </footer>
    </div>
  )
}
