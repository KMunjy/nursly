import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Privacy Notice — Nursly' }

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#005eb8', borderBottom: '4px solid #003d78', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}>
          <span style={{ background: '#fff', color: '#005eb8', fontWeight: 900, fontSize: '14px', padding: '3px 8px', borderRadius: '3px' }}>N</span>
          <span style={{ fontSize: '18px', fontWeight: 700 }}>Nursly</span>
        </Link>
      </nav>
      <div style={{ maxWidth: '760px', margin: '40px auto', padding: '0 24px', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#2d3748', marginBottom: '8px' }}>Privacy Notice</h1>
          <p style={{ fontSize: '14px', color: '#718096', marginBottom: '32px' }}>Last updated: March 2026</p>

          {[
            { title: '1. Who we are', body: 'Nursly is a UK-based healthcare staffing marketplace. We are the data controller for the personal data you provide to us. Contact: privacy@nursly.com' },
            { title: '2. What data we collect', body: 'We collect your name, email address, professional registration number (NMC PIN for nurses), employment history, and preferences necessary to operate the platform. For employers, we collect organisation name, billing details, and contact information.' },
            { title: '3. How we use your data', body: 'We use your data to operate the Nursly platform, verify your professional credentials against the NMC register, match you with suitable shifts or candidates, process payments, and send service notifications. We do not sell your data to third parties.' },
            { title: '4. Legal basis', body: 'We process your data under: (a) contract performance — to deliver the staffing service; (b) legal obligation — NMC/DBS verification requirements; (c) legitimate interests — platform security and fraud prevention.' },
            { title: '5. Data retention', body: 'We retain your data for the duration of your account plus 7 years for legal compliance purposes. You may request deletion at any time subject to legal obligations.' },
            { title: '6. Your rights', body: 'Under UK GDPR you have the right to access, correct, delete, port, and restrict processing of your data. To exercise these rights, contact privacy@nursly.com. You may also lodge a complaint with the ICO at ico.org.uk.' },
            { title: '7. Cookies', body: 'We use essential cookies for authentication and security. We do not use advertising or tracking cookies without your consent.' },
            { title: '8. Contact', body: 'Data Protection queries: privacy@nursly.com · General: support@nursly.com · ICO registration number: [Pending registration]' },
          ].map(({ title, body }) => (
            <div key={title} style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#2d3748', marginBottom: '8px' }}>{title}</h2>
              <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.7 }}>{body}</p>
            </div>
          ))}

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '8px' }}>
            <Link href="/login" style={{ color: '#005eb8', fontWeight: 600, fontSize: '15px' }}>← Back to Nursly</Link>
          </div>
        </div>
      </div>
      <footer style={{ background: '#1a2b3d', color: 'rgba(255,255,255,0.6)', padding: '16px 24px', textAlign: 'center', fontSize: '13px' }}>
        Nursly Healthcare Staffing · <a href="mailto:support@nursly.com" style={{ color: 'rgba(255,255,255,0.6)' }}>support@nursly.com</a>
      </footer>
    </div>
  )
}
