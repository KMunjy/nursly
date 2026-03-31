import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nursly — Healthcare Staffing',
  description: 'Connecting registered nurses with UK healthcare employers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
