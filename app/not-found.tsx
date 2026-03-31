import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #eef6ff 0%, #f0f9f5 50%, #fff9f0 100%)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Nav */}
      <nav style={{ background: '#005eb8', borderBottom: '4px solid #003d78', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}>
          <span style={{ background: '#fff', color: '#005eb8', fontWeight: 900, fontSize: '14px', padding: '3px 8px', borderRadius: '3px' }}>N</span>
          <span style={{ fontSize: '18px', fontWeight: 700 }}>Nursly</span>
        </Link>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '48px 40px', boxShadow: '0 4px 24px rgba(0,94,184,0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏥</div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#2d3748', marginBottom: '12px' }}>
              Page not found
            </h1>
            <p style={{ fontSize: '16px', color: '#718096', lineHeight: 1.6, marginBottom: '28px' }}>
              This page doesn't exist or may have moved. Let's get you back on track.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login" style={{ background: '#005eb8', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '15px', fontWeight: 700 }}>
                Sign in
              </Link>
              <Link href="/register" style={{ background: '#fff', color: '#005eb8', border: '2px solid #005eb8', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>
                Create account
              </Link>
            </div>
            <p style={{ fontSize: '13px', color: '#a0aec0', marginTop: '24px' }}>
              Need help? <a href="mailto:support@nursly.com" style={{ color: '#005eb8' }}>support@nursly.com</a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#1a2b3d', color: 'rgba(255,255,255,0.6)', padding: '16px 24px', textAlign: 'center', fontSize: '13px' }}>
        Nursly Healthcare Staffing · <a href="mailto:support@nursly.com" style={{ color: 'rgba(255,255,255,0.6)' }}>support@nursly.com</a>
      </footer>
    </div>
  )
}
