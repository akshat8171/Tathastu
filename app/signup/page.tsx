import { Suspense } from 'react'
import { SignupForm } from '@/components/auth/signup-form'

export default function SignupPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-card2 shadow-card p-8 sm:p-10">
          {/* Logo / brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand/10 text-brand mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <h1 className="font-display font-bold text-ink text-2xl sm:text-3xl mb-2">
              Create your account
            </h1>
            <p className="font-sans text-muted text-sm">
              Sign up to track your orders and check out faster
            </p>
          </div>

          {/* Sign-up form — wrapped in Suspense because it reads useSearchParams() */}
          <Suspense fallback={null}>
            <SignupForm />
          </Suspense>

          <p className="mt-6 text-center font-sans text-xs text-muted">
            By creating an account, you agree to our{' '}
            <a href="/privacy" className="text-brand hover:underline">Privacy Policy</a>
            {' '}and{' '}
            <a href="/terms" className="text-brand hover:underline">Terms of Service</a>.
          </p>
        </div>
      </div>
    </main>
  )
}
