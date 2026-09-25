'use client'

export default function GlobalError({
  _error,
  reset,
}: {
  _error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0, backgroundColor: '#FBFBFD' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>A critical error occurred. Please try again.</p>
          <button
            onClick={reset}
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#0071E3', color: 'white', border: 'none', borderRadius: '9999px', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
