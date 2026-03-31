import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
export const metadata: Metadata = { title: 'Employer Dashboard — Nursly' }
export default async function EmployerDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <div>
      <nav className="nav-bar">
        <span className="nav-logo">Nursly</span>
        <Link href="/employer/dashboard" className="nav-link active">Dashboard</Link>
      </nav>
      <div className="page-shell">
        <div className="page-header"><h1 className="page-title">Employer Dashboard</h1></div>
        <div className="dashboard-grid">
          <div className="stat-card"><div className="stat-label">Open shifts</div><div className="stat-value">0</div></div>
          <div className="stat-card"><div className="stat-label">Pending timesheets</div><div className="stat-value">0</div></div>
          <div className="stat-card"><div className="stat-label">Month spend</div><div className="stat-value">£0</div></div>
        </div>
      </div>
    </div>
  )
}
