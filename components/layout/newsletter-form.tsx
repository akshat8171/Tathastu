'use client'

/**
 * NewsletterForm — email signup widget for the homepage.
 *
 * Client component. POST → /api/newsletter.
 * Degrades gracefully: if the Supabase newsletter_subscribers table doesn't
 * exist yet, the API route logs + returns success (same pattern as lib/coupons.ts).
 *
 * Accessibility: labelled input, live-region status, focus-visible styles.
 */

import { useState, useId } from 'react'
import { Spinner } from '@/components/ui'

type Status = 'idle' | 'loading' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(email: string): string | null {
  if (!email.trim()) return 'Please enter your email address.'
  if (!EMAIL_RE.test(email.trim())) return 'Please enter a valid email address.'
  return null
}

export function NewsletterForm() {
  const inputId = useId()
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [serverMsg, setServerMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validate(email)
    if (err) {
      setFieldError(err)
      return
    }
    setFieldError(null)
    setStatus('loading')
    setServerMsg('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const json = (await res.json()) as { message?: string; error?: string }

      if (!res.ok) {
        setStatus('error')
        setServerMsg(json.error ?? 'Something went wrong. Please try again.')
      } else {
        setStatus('success')
        setServerMsg(json.message ?? "You're subscribed!")
        setEmail('')
      }
    } catch {
      setStatus('error')
      setServerMsg('Network error. Please check your connection and try again.')
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
    if (fieldError) setFieldError(null)
    if (status === 'error') setStatus('idle')
  }

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <h3 className="font-display font-bold text-ink text-xl sm:text-2xl mb-1">
        Stay in the loop
      </h3>
      <p className="font-sans text-muted text-sm mb-5">
        New drops, offers and behind-the-scenes print stories — no spam.
      </p>

      {status === 'success' ? (
        <p
          role="status"
          aria-live="polite"
          className="font-sans text-brand text-sm font-medium bg-brand/10 rounded-xl px-5 py-3"
        >
          {/* Checkmark */}
          <span aria-hidden="true">&#10003; </span>
          {serverMsg}
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Newsletter signup"
        >
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <label htmlFor={inputId} className="sr-only">
                Email address
              </label>
              <input
                id={inputId}
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={handleChange}
                aria-describedby={fieldError ? `${inputId}-error` : undefined}
                aria-invalid={!!fieldError}
                disabled={status === 'loading'}
                className={`w-full rounded-pill border px-5 py-3 text-sm font-sans text-ink placeholder:text-gray-400 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 transition-colors
                  ${fieldError ? 'border-red-400' : 'border-gray-200 focus:border-brand'}`}
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary text-sm px-6 py-3 flex-shrink-0 flex items-center justify-center gap-2"
              aria-label="Subscribe to newsletter"
            >
              {status === 'loading' ? (
                <>
                  <Spinner size="sm" />
                  <span>Subscribing…</span>
                </>
              ) : (
                'Subscribe'
              )}
            </button>
          </div>

          {/* Field validation error */}
          {fieldError && (
            <p
              id={`${inputId}-error`}
              role="alert"
              className="mt-2 text-xs text-red-500 font-sans text-left sm:pl-5"
            >
              {fieldError}
            </p>
          )}

          {/* Server error */}
          {status === 'error' && serverMsg && (
            <p
              role="alert"
              aria-live="assertive"
              className="mt-2 text-xs text-red-500 font-sans text-left sm:pl-5"
            >
              {serverMsg}
            </p>
          )}
        </form>
      )}

      <p className="font-sans text-muted text-xs mt-3">
        We respect your privacy. Unsubscribe any time.
      </p>
    </div>
  )
}
