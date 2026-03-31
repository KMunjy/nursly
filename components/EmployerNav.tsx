import Link from 'next/link'

interface EmployerNavProps {
  active: string
  userName?: string
}

export function EmployerNav({ active, userName }: EmployerNavProps) {
  const links = [
    { href: '/employer/dashboard', label: 'Dashboard' },
    { href: '/employer/shifts', label: 'Manage shifts' },
    { href: '/employer/timesheets', label: 'Timesheets' },
    { href: '/employer/team', label: 'Team' },
  ]
  return (
    <nav style={{ background: '#005eb8', borderBottom: '4px solid #003d78', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      <Link href="/employer/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff', marginRight: '32px' }}>
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
