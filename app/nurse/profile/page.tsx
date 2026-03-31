import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NurseNav } from '@/components/NurseNav'
import Link from 'next/link'

export const metadata: Metadata = { title: 'My Profile — Nursly' }

export default async function NurseProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('nursly_profiles').select('full_name, status').eq('id', user.id).single()
  const { data: nurseProfile } = await supabase.from('nursly_nurse_profiles').select('*').eq('id', user.id).single()
  const { data: credentials } = await supabase.from('nursly_credentials').select('type, status, expiry_date').eq('nurse_id', user.id)

  const credConfig: Record<string, string> = {
    nmc_registration: 'NMC Registration',
    dbs_certificate: 'DBS Certificate',
    right_to_work: 'Right to Work',
    mandatory_training: 'Mandatory Training',
    hepatitis_b: 'Hepatitis B',
    professional_indemnity: 'Professional Indemnity',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <NurseNav active="/nurse/profile" userName={profile?.full_name || ''} />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#212b32' }}>My profile</h1>
          <p style={{ fontSize: '15px', color: '#718096', marginTop: '4px' }}>Keep your details up to date so employers can match you with the right shifts.</p>
        </div>

        {/* Profile card */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #005eb8, #0072e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff', fontWeight: 800, flexShrink: 0 }}>
              {profile?.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#212b32' }}>{profile?.full_name || 'Your Name'}</div>
              <div style={{ fontSize: '14px', color: '#718096', marginTop: '2px' }}>{user.email}</div>
              <span style={{ background: '#d4edda', color: '#004d25', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', display: 'inline-block', marginTop: '6px' }}>
                ✅ {profile?.status?.replace(/_/g, ' ') || 'Active'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: 'NMC PIN', value: nurseProfile?.nmc_pin || '—' },
              { label: 'Phone', value: nurseProfile?.phone_number || '—' },
              { label: 'Location', value: nurseProfile?.location_city ? `${nurseProfile.location_city} (${nurseProfile.location_postcode || ''})` : '—' },
              { label: 'Search radius', value: nurseProfile?.preferred_radius_km ? `${nurseProfile.preferred_radius_km}km` : '25km' },
              { label: 'Experience', value: nurseProfile?.years_experience ? `${nurseProfile.years_experience} years` : '—' },
              { label: 'Specialties', value: nurseProfile?.specialties?.length ? nurseProfile.specialties.join(', ').replace(/_/g, ' ') : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '12px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '15px', color: value === '—' ? '#a0aec0' : '#212b32', fontStyle: value === '—' ? 'italic' : 'normal' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px' }}>
            <Link href="/nurse/onboarding" style={{ background: '#005eb8', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              ✏️ Edit profile
            </Link>
          </div>
        </div>

        {/* Credentials */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#212b32', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
            Credentials & documents
          </h2>
          {credentials && credentials.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {credentials.map((cred: any) => (
                <div key={cred.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#212b32' }}>{credConfig[cred.type] || cred.type}</span>
                  <div style={{ display: 'flex', align: 'center', gap: '12px' }}>
                    {cred.expiry_date && <span style={{ fontSize: '12px', color: '#718096' }}>Expires {new Date(cred.expiry_date).toLocaleDateString('en-GB')}</span>}
                    <span style={{ background: cred.status === 'verified' ? '#d4edda' : '#fff4d0', color: cred.status === 'verified' ? '#004d25' : '#7a5900', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>
                      {cred.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
              <p style={{ fontSize: '14px', color: '#718096', lineHeight: 1.6, marginBottom: '16px' }}>
                No documents uploaded yet. Add your NMC registration, DBS certificate, and right-to-work documents to unlock shift applications.
              </p>
              <Link href="/nurse/onboarding" style={{ background: '#007f3b', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                Upload documents →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
