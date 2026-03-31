export const ERROR_MESSAGES = {
  auth: {
    loginFailed:      'Email or password is incorrect.',
    sessionExpired:   'Your session has expired. Sign in again to continue.',
    accountPending:   "Your account is being reviewed. We'll email you once it's active.",
    accountSuspended: 'This account has been suspended. Contact support@nursly.com',
    noProfile:        'Account setup incomplete. Contact support@nursly.com',
  },
  onboarding: {
    saveFailed:       "We couldn't save your details. Check your connection and try again.",
    availabilitySave: "We couldn't save your availability. Try again in a moment.",
    credentialSave:   "We couldn't save your credential details. Try again or contact support.",
  },
  shifts: {
    postFailed:    "Shift couldn't be posted. Check all fields and try again.",
    cancelFailed:  'Cancellation failed. If this keeps happening, contact support.',
    selectFailed:  "We couldn't confirm this applicant. Refresh and try again.",
    credentialBlock: (types: string[]) =>
      `${types.join(', ')} must be verified before this nurse can be selected.`,
  },
  credentials: {
    uploadFailed:    'Document upload failed. Check the file is a PDF or image under 10MB.',
    approveFailed:   'Approval failed. Refresh the queue and try again.',
    noDocument:      'No document has been uploaded yet. Approval requires a document.',
    alreadyVerified: 'This credential is already verified. Contact support to replace a verified document.',
  },
  generic: {
    networkError: 'Connection issue. Check your internet and try again.',
    unexpected:   'An unexpected error occurred. If it continues, contact support@nursly.com',
  },
} as const
