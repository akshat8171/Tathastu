'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

type Step = 'phone' | 'otp'

const RESEND_COOLDOWN_SECONDS = 60

function sanitizeNext(raw: string | null): string {
  if (!raw) return '/account'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/account'
  if (raw.includes('://') || raw.includes('\\')) return '/account'
  return raw
}

export function PhoneOtpForm() {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = sanitizeNext(searchParams.get('next'))

  // Countdown timer for the resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const sendOtp = useCallback(async (cleaned: string) => {
    // POST to our server route (rate-limited) instead of calling Supabase
    // directly from the browser. This is the choke-point a scripted attacker
    // cannot bypass.
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
    setCooldown(RESEND_COOLDOWN_SECONDS)
    return true
  }, [])

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length !== 10 || !/^[6-9]/.test(cleaned)) {
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

    const cleaned = phone.replace(/\D/g, '')
    const { error: authError } = await supabase.auth.verifyOtp({
      phone: `+91${cleaned}`,
      token: otp,
      type: 'sms',
    })

    if (authError) {
      setError(authError.message)
    } else {
      router.push(next)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm mx-auto">
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
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send OTP'}
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
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
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
