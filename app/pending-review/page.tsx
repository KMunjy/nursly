export default function PendingReviewPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Account under review</h1>
        <div className="pending-banner">
          <p style={{fontSize:'14px',lineHeight:'1.6'}}>
            Your account is being reviewed by the Nursly team. This usually takes less than 24 hours.
            You'll receive an email once your account is active.
          </p>
        </div>
        <p style={{fontSize:'13px',color:'var(--text-secondary)',marginTop:'16px'}}>
          Questions? Contact <a href="mailto:support@nursly.com">support@nursly.com</a>
        </p>
      </div>
    </div>
  )
}
