'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithPhoneNumber, RecaptchaVerifier, type ConfirmationResult } from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase/client'
import { isIndianMobile, toE164 } from '@/lib/auth/identifier'
import { Spinner } from '@/components/ui/spinner'

type Step = 'phone' | 'otp'

const RESEND_COOLDOWN_SECONDS = 60

function sanitizeNext(raw: string | null): string {
  if (!raw) return '/account'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/account'
  if (raw.includes('://') || raw.includes('\\')) return '/account'
  return raw
}

function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/invalid-verification-code':
      return 'Incorrect code. Please check and try again.'
    case 'auth/code-expired':
      return 'Code expired. Please resend and try again.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait before trying again.'
    case 'auth/invalid-phone-number':
      return 'Invalid phone number. Please enter a valid 10-digit Indian mobile.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

interface PhoneOtpFormProps {
  /** Optionally pre-seed the phone field (10-digit local or E.164). */
  initialPhone?: string
}

export function PhoneOtpForm({ initialPhone }: PhoneOtpFormProps = {}) {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState(initialPhone?.replace(/^\+91/, '') ?? '')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()
  const next = sanitizeNext(searchParams.get('next'))

  // Store the Firebase ConfirmationResult across re-renders.
  const confirmationRef = useRef<ConfirmationResult | null>(null)
  // Reuse a single RecaptchaVerifier instance; create lazily in the browser.
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)

  // Countdown timer for the resend cooldown.
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  /** Get-or-create the invisible RecaptchaVerifier. */
  function getOrCreateVerifier(): RecaptchaVerifier {
    if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current
    // RecaptchaVerifier v9+ modular API: first arg is Auth instance. Auth is
    // resolved lazily here (browser-only) — never at module/render scope.
    const verifier = new RecaptchaVerifier(getFirebaseAuth(), 'recaptcha-container', {
      size: 'invisible',
    })
    recaptchaVerifierRef.current = verifier
    return verifier
  }

  /** Clear the verifier on error so it can be recreated on retry. */
  function clearVerifier() {
    try { recaptchaVerifierRef.current?.clear() } catch { /* ignore */ }
    recaptchaVerifierRef.current = null
  }

  /**
   * Server-side rate-limit gate → Firebase signInWithPhoneNumber.
   * Returns true on success, false on failure (error already set).
   */
  const sendOtp = useCallback(async (cleaned: string): Promise<boolean> => {
    // Step 1: server rate-limit pre-check.
    let res: Response
    try {
      res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned }),
      })
    } catch {
      setError('Network error. Please try again.')
      return false
    }

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || 'Could not send OTP. Please try again.')
      return false
    }

    if (!isFirebaseConfigured) {
      setError('Firebase is not configured. Contact support.')
      return false
    }

    // Step 2–3: create invisible reCAPTCHA and trigger Firebase SMS.
    try {
      const verifier = getOrCreateVerifier()
      const e164 = toE164(cleaned)!
      const confirmation = await signInWithPhoneNumber(getFirebaseAuth(), e164, verifier)
      confirmationRef.current = confirmation
      setCooldown(RESEND_COOLDOWN_SECONDS)
      return true
    } catch (err: unknown) {
      clearVerifier()
      const code = (err as { code?: string }).code ?? ''
      setError(mapFirebaseError(code))
      return false
    }
  }, [])

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const cleaned = phone.replace(/\D/g, '')
    if (!isIndianMobile(cleaned)) {
      setError('Enter a valid 10-digit Indian mobile number')
      setLoading(false)
      return
    }

    const ok = await sendOtp(cleaned)
    if (ok) setStep('otp')
    setLoading(false)
  }

  async function handleResend() {
    if (cooldown > 0 || loading) return
    setError('')
    setLoading(true)
    await sendOtp(phone.replace(/\D/g, ''))
    setLoading(false)
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!confirmationRef.current) {
      setError('Session expired. Please go back and resend the OTP.')
      setLoading(false)
      return
    }

    try {
      const cred = await confirmationRef.current.confirm(otp)
      const idToken = await cred.user.getIdToken()

      // Exchange the Firebase ID token for an httpOnly session cookie.
      const res = await fetch('/api/auth/firebase-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Login failed. Please try again.')
        setLoading(false)
        return
      }

      router.push(next)
      router.refresh()
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setError(mapFirebaseError(code))
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Invisible reCAPTCHA anchor — must be in the DOM before verifier is created. */}
      <div id="recaptcha-container" />

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-ink mb-2">
              Mobile Number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-surface text-muted text-sm font-sans">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                className="flex-1 px-4 py-3 rounded-r-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm font-sans">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>Sending…</span>
              </>
            ) : (
              'Send OTP'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-sm text-muted mb-4 font-sans">
            OTP sent to +91 {phone.replace(/\D/g, '')}
          </p>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-ink mb-2">
              Enter OTP
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand text-center text-2xl tracking-widest font-sans"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm font-sans">{error}</p>}

          {/* Dev-only hint for local E2E testing via Firebase test phone numbers.
              Renders only in `next dev` (NODE_ENV==='development'); never in
              production builds, and never during Jest (NODE_ENV==='test'). */}
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs font-sans text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="font-semibold">Dev / E2E:</span> no SMS is sent for{' '}
              <strong>Firebase test phone numbers</strong>. Configure them under
              Firebase console → Authentication → Sign-in method → Phone →
              Phone numbers for testing.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>Verifying…</span>
              </>
            ) : (
              'Verify & Login'
            )}
          </button>

          {/* Resend OTP with cooldown */}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || loading}
            data-testid="resend-otp"
            className="text-sm text-muted hover:text-brand transition-colors w-full text-center font-sans disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted"
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
          </button>

          <button
            type="button"
            onClick={() => { setStep('phone'); setError('') }}
            className="text-sm text-muted hover:text-brand transition-colors w-full text-center font-sans"
          >
            Change number
          </button>
        </form>
      )}
    </div>
  )
}
