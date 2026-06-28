'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <main className="container-page py-20">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-display font-bold text-ink mb-3">
          Something went wrong!
        </h1>

        <p className="text-muted font-sans mb-8 max-w-md mx-auto">
          We encountered an unexpected error. Don't worry, our team has been notified and we're working on a fix.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-primary-full px-6 py-3 rounded-pill text-sm"
          >
            Try again
          </button>
          <Link
            href="/"
            className="btn-outline-full px-6 py-3 rounded-pill text-sm"
          >
            Go to homepage
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs text-muted font-mono mt-8">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </main>
  )
}
