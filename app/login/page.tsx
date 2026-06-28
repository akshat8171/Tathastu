import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-card2 shadow-card p-8 sm:p-10">
          {/* Logo / brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand/10 text-brand mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h1 className="font-display font-bold text-ink text-2xl sm:text-3xl mb-2">
              Welcome to Tathastu Keepsakes
            </h1>
            <p className="font-sans text-muted text-sm">
              Sign in to access your account
            </p>
          </div>

          {/* Unified login form — wrapped in Suspense because it reads useSearchParams() */}
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          <p className="mt-6 text-center font-sans text-xs text-muted">
            By signing in, you agree to our{' '}
            <a href="/privacy" className="text-brand hover:underline">Privacy Policy</a>
            {' '}and{' '}
            <a href="/terms" className="text-brand hover:underline">Terms of Service</a>.
          </p>
        </div>

        {/* Trust signals */}
        <div className="mt-6 flex items-center justify-center gap-6 text-muted">
          <div className="flex items-center gap-1.5 font-sans text-xs">
            <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Secure login
          </div>
          <div className="flex items-center gap-1.5 font-sans text-xs">
            <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3h3M3 16.5v.75A2.25 2.25 0 005.25 19.5H6" />
            </svg>
            No password needed
          </div>
        </div>
      </div>
    </main>
  )
}
