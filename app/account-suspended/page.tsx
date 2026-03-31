export default function AccountSuspendedPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Account suspended</h1>
        <p style={{fontSize:'14px',color:'var(--text-secondary)',marginTop:'8px'}}>
          This account has been suspended. Contact{' '}
          <a href="mailto:support@nursly.com">support@nursly.com</a> to resolve this.
        </p>
      </div>
    </div>
  )
}
