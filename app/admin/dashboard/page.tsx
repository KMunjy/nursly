import type { Metadata } from 'next'
import Link from 'next/link'
export const metadata: Metadata = { title: 'Admin — Nursly' }
export default function AdminDashboardPage() {
  return (
    <div>
      <nav className="nav-bar">
        <span className="nav-logo">Nursly Admin</span>
        <Link href="/admin/dashboard" className="nav-link active">Dashboard</Link>
      </nav>
      <div className="page-shell">
        <div className="page-header"><h1 className="page-title">Admin Dashboard</h1></div>
      </div>
    </div>
  )
}
