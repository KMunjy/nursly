import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
export const metadata: Metadata = { title: 'Dashboard — Nursly' }
export default async function NurseDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <div>
      <nav className="nav-bar">
        <span className="nav-logo">Nursly</span>
        <Link href="/nurse/dashboard" className="nav-link active">Dashboard</Link>
      </nav>
      <div className="page-shell">
        <div className="page-header"><h1 className="page-title">Dashboard</h1></div>
        <div className="dashboard-grid">
          <div className="stat-card"><div className="stat-label">Available shifts</div><div className="stat-value">—</div></div>
          <div className="stat-card"><div className="stat-label">Applications</div><div className="stat-value">—</div></div>
          <div className="stat-card"><div className="stat-label">This month</div><div className="stat-value">£0</div></div>
        </div>
      </div>
    </div>
  )
}
