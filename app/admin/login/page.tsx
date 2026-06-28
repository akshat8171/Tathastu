'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const ADMIN_PHONE = '+919154892790'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Normalize phone number
      let normalizedPhone = phone.trim()

      // If it starts with just digits, add +91
      if (/^\d{10}$/.test(normalizedPhone)) {
        normalizedPhone = '+91' + normalizedPhone
      }

      // Check if this is the admin phone
      if (normalizedPhone === ADMIN_PHONE) {
        // Store admin phone in localStorage
        localStorage.setItem('admin_phone', normalizedPhone)
        // Redirect to admin dashboard
        router.push('/admin')
      } else {
        setError('Invalid admin credentials. Access denied.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand to-brand-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <Lock className="w-8 h-8 text-brand" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Tathastu Admin</h1>
          <p className="text-brand-100 mt-2">Sign in to access the admin dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-card2 shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-ink mb-2">
                Admin Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                required
              />
              <p className="text-xs text-muted mt-2">
                Enter 10-digit number (e.g., 9154892790) or with +91 prefix
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full bg-brand text-white py-3 rounded-lg font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-brand hover:text-brand-600 font-medium"
            >
              ← Back to Store
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-brand-100">
            This area is restricted to authorized administrators only.
          </p>
        </div>
      </div>
    </div>
  )
}
