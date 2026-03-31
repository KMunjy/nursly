import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Accessibility Statement — Nursly' }

export default function AccessibilityPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#005eb8', borderBottom: '4px solid #003d78', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}>
          <span style={{ background: '#fff', color: '#005eb8', fontWeight: 900, fontSize: '14px', padding: '3px 8px', borderRadius: '3px' }}>N</span>
          <span style={{ fontSize: '18px', fontWeight: 700 }}>Nursly</span>
        </Link>
      </nav>
      <div style={{ maxWidth: '760px', margin: '40px auto', padding: '0 24px', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#2d3748', marginBottom: '8px' }}>Accessibility Statement</h1>
          <p style={{ fontSize: '14px', color: '#718096', marginBottom: '32px' }}>Last updated: March 2026</p>
          {[
            { title: 'Our commitment', body: 'Nursly is committed to making our platform accessible to all users, including those with disabilities. We aim to meet WCAG 2.1 Level AA standards.' },
            { title: 'Current status', body: 'We are actively working towards full WCAG 2.1 AA compliance. Known areas for improvement include: (a) improved keyboard navigation in role selection; (b) enhanced screen reader support for dynamic content; (c) improved colour contrast in secondary text.' },
            { title: 'Technical features', body: 'Our platform includes: semantic HTML structure; ARIA labels on interactive elements; focus indicators (yellow outline on keyboard focus); logical tab order; form labels associated with inputs; error messages linked to inputs via aria-describedby.' },
            { title: 'Feedback', body: 'If you experience any accessibility barriers, please contact accessibility@nursly.com. We aim to respond within 5 working days.' },
            { title: 'Alternative formats', body: 'If you need information in an alternative format, contact support@nursly.com and we will do our best to accommodate your needs.' },
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
        Nursly Healthcare Staffing · <a href="mailto:accessibility@nursly.com" style={{ color: 'rgba(255,255,255,0.6)' }}>accessibility@nursly.com</a>
      </footer>
    </div>
  )
}
