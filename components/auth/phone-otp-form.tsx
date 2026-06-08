'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Step = 'phone' | 'otp'

export function PhoneOtpForm() {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

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

    const { error: authError } = await supabase.auth.signInWithOtp({
      phone: `+91${cleaned}`,
    })

    if (authError) {
      setError(authError.message)
    } else {
      setStep('otp')
    }
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
      router.push('/account')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
              Mobile Number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-surface-light bg-surface text-gray-400 text-sm">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                className="flex-1 px-4 py-3 rounded-r-xl bg-surface border border-surface-light text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-sm text-gray-400 mb-4">
            OTP sent to +91 {phone.replace(/\D/g, '')}
          </p>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
              Enter OTP
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-light text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple text-center text-2xl tracking-widest"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('phone'); setError('') }}
            className="text-sm text-gray-400 hover:text-white transition-colors w-full text-center"
          >
            Change number
          </button>
        </form>
      )}
    </div>
  )
}
