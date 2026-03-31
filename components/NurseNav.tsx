import Link from 'next/link'

interface NurseNavProps {
  active: string
  userName?: string
}

export function NurseNav({ active, userName }: NurseNavProps) {
  const links = [
    { href: '/nurse/dashboard', label: 'Dashboard' },
    { href: '/nurse/shifts', label: 'Find shifts' },
    { href: '/nurse/applications', label: 'Applications' },
    { href: '/nurse/profile', label: 'My profile' },
    { href: '/nurse/timesheets', label: 'Timesheets' },
  ]
  return (
    <nav style={{ background: '#005eb8', borderBottom: '4px solid #003d78', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      <Link href="/nurse/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff', marginRight: '32px' }}>
        <span style={{ background: '#fff', color: '#005eb8', fontWeight: 900, fontSize: '13px', padding: '2px 7px', borderRadius: '3px' }}>N</span>
        <span style={{ fontSize: '18px', fontWeight: 700 }}>Nursly</span>
      </Link>
      {links.map(({ href, label }) => (
        <Link key={href} href={href} style={{ fontSize: '14px', fontWeight: active === href ? 600 : 500, color: active === href ? '#fff' : 'rgba(255,255,255,0.8)', padding: '0 14px', height: '60px', display: 'flex', alignItems: 'center', textDecoration: 'none', borderBottom: active === href ? '4px solid #ffb81c' : '4px solid transparent' }}>
          {label}
        </Link>
      ))}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {userName && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{userName}</span>}
        <form action="/auth/signout" method="post">
          <button type="submit" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Sign out</button>
        </form>
      </div>
    </nav>
  )
}
