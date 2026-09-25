import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6">
        <span className="text-3xl font-bold text-brand-600">404</span>
      </div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Page not found</h2>
      <p className="text-sm text-neutral-500 mb-6 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="apple-press inline-flex items-center justify-center h-11 px-6 rounded-full text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-sm"
      >
        Go Home
      </Link>
    </div>
  )
}
