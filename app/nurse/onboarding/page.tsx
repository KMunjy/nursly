import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NurseNav } from '@/components/NurseNav'

export const metadata: Metadata = { title: 'Complete Profile — Nursly' }

export default async function NurseOnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('nursly_profiles').select('full_name').eq('id', user.id).single()

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <NurseNav active="/nurse/profile" userName={profile?.full_name || ''} />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👩‍⚕️</div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#212b32', marginBottom: '8px' }}>Complete your profile</h1>
            <p style={{ fontSize: '15px', color: '#718096', lineHeight: 1.6 }}>Add your details to unlock shift applications. This takes about 5 minutes.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {[
              { icon: '🪪', title: 'NMC PIN', desc: 'Your Nursing & Midwifery Council registration number', done: false },
              { icon: '📍', title: 'Location & availability', desc: 'Where you want to work and your preferred hours', done: false },
              { icon: '🏥', title: 'Specialties & experience', desc: 'Your clinical skills and years of experience', done: false },
              { icon: '📄', title: 'Documents', desc: 'DBS certificate, right to work, and other credentials', done: false },
            ].map(({ icon, title, desc, done }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f7fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '24px', width: '40px', height: '40px', background: done ? '#d4edda' : '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{done ? '✅' : icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#212b32', marginBottom: '2px' }}>{title}</div>
                  <div style={{ fontSize: '13px', color: '#718096' }}>{desc}</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: done ? '#007f3b' : '#a0aec0' }}>{done ? 'Done' : 'Pending'}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#f0f9f4', border: '1px solid #c6e8d4', borderRadius: '8px', padding: '14px 16px', marginBottom: '24px', fontSize: '14px', color: '#1a5e35', lineHeight: 1.5 }}>
            🔒 Profile editing is coming shortly. For now, contact <a href="mailto:support@nursly.com" style={{ color: '#005eb8', fontWeight: 600 }}>support@nursly.com</a> and we'll update your details within 2 hours.
          </div>
        </div>
      </div>
    </div>
  )
}
