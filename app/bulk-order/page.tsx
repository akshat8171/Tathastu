'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Spinner } from '@/components/ui'
import { SITE, waLink } from '@/lib/site'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  message: string
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

const contactMethods = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    title: 'Call Us',
    value: SITE.phone,
    href: SITE.phoneTel,
    label: 'Call now',
    external: false,
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: 'WhatsApp',
    value: SITE.phone,
    href: waLink('Hi! I am interested in a bulk order from Layerix.'),
    label: 'Chat on WhatsApp',
    external: true,
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    title: 'Email',
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    label: 'Send email',
    external: false,
  },
]

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans text-sm transition-colors'

const errorInputClass =
  'w-full px-4 py-3 rounded-xl bg-surface border border-red-400 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 font-sans text-sm transition-colors'

export default function BulkOrderPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    message: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => { const next = { ...prev }; delete next[name]; return next })
    }
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!formData.firstName.trim()) errors.firstName = 'First name is required'
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Enter a valid email address'
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^(\+91[\s-]?)?[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Enter a valid Indian mobile number'
    }
    if (!formData.city.trim()) errors.city = 'City is required'
    if (!formData.message.trim()) errors.message = 'Please describe your requirements'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitState('submitting')
    setErrorMessage(null)

    try {
      const description = [
        `Bulk order inquiry from ${formData.firstName} ${formData.lastName}`,
        `City: ${formData.city}`,
        formData.message,
      ].join('\n')

      const res = await fetch('/api/custom-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          type: 'bulk_order',
          description,
        }),
      })
      const json = await res.json()

      if (!res.ok) {
        if (json.fields) setFieldErrors(json.fields)
        setErrorMessage(json.error ?? 'Something went wrong — please try again.')
        setSubmitState('error')
        return
      }

      setSubmitState('success')
    } catch {
      setErrorMessage('Network error — check your connection and try again.')
      setSubmitState('error')
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-surface border-b border-gray-100 py-3 px-4">
        <div className="container-page">
          <nav className="flex items-center gap-2 font-sans text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand transition-colors">Home</Link>
            <span className="text-gray-300" aria-hidden="true">/</span>
            <span className="text-ink">Bulk Order</span>
          </nav>
        </div>
      </div>

      {/* Hero Band */}
      <section className="relative bg-ink py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} aria-hidden="true" />
        <div className="relative container-page text-center text-white">
          <span className="inline-block bg-brand/20 text-brand text-xs font-display font-semibold uppercase tracking-widest px-4 py-1.5 rounded-pill mb-6">
            Corporate &amp; Bulk
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl mb-4">
            Bulk &amp; Corporate Orders
          </h1>
          <p className="font-sans text-white/70 text-lg max-w-xl mx-auto">
            You&apos;ve come to the right place.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="container-page">

          {/* Intro text */}
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="font-display font-bold text-ink text-2xl sm:text-3xl mb-4">
              Taking Bulk Orders
            </h2>
            <p className="font-sans text-muted text-base leading-relaxed mb-3">
              Looking for high-quality homeware items in bulk? We&apos;ve got you covered! Whether
              you&apos;re a café, restaurant, corporate event planner, or retailer, {SITE.name} offers
              bespoke bulk &amp; corporate ordering solutions tailored to your needs.
            </p>
            <p className="font-sans text-muted text-base leading-relaxed mb-3">
              We are here to assist you through every step of the process and provide you with a
              solution that meets your needs and exceeds your expectations.
            </p>
            <p className="font-sans text-muted text-sm leading-relaxed">
              For any inquiries or to discuss your bulk / corporate order needs, please reach out to
              us at{' '}
              <a href={`mailto:${SITE.email}`} className="text-brand hover:underline font-medium">
                {SITE.email}
              </a>{' '}
              or call / WhatsApp us at{' '}
              <a href={SITE.phoneTel} className="text-brand hover:underline font-medium">
                {SITE.phone}
              </a>.
            </p>
          </div>

          {/* Contact cards */}
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            {contactMethods.map(method => (
              <div key={method.title} className="card p-6 text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10 text-brand mb-4 group-hover:bg-brand group-hover:text-white transition-colors duration-200">
                  {method.icon}
                </div>
                <h4 className="font-display font-semibold text-ink text-sm uppercase tracking-wide mb-2">
                  {method.title}
                </h4>
                <a
                  href={method.href}
                  target={method.external ? '_blank' : undefined}
                  rel={method.external ? 'noopener noreferrer' : undefined}
                  className="font-sans text-brand text-sm hover:underline"
                  aria-label={method.label}
                >
                  {method.value}
                </a>
              </div>
            ))}
          </div>

          {/* Inquiry Form */}
          <div className="max-w-lg mx-auto">
            {submitState === 'success' ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 text-brand mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="font-display font-bold text-ink text-2xl sm:text-3xl mb-3">
                  Inquiry received!
                </h2>
                <p className="font-sans text-muted text-base mb-8 max-w-md mx-auto">
                  Thank you! Our team will review your bulk order inquiry and get back to
                  you within 24 hours with pricing and availability.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="primary"
                    href={waLink('Hi! I submitted a bulk order inquiry.')}
                    size="lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chat on WhatsApp
                  </Button>
                  <Button variant="outline" href="/products" size="lg">
                    Browse catalogue
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h3 className="font-display font-bold text-ink text-2xl mb-2">Got Any Questions?</h3>
                  <p className="font-sans text-muted text-sm">
                    Fill the form below — our team will contact you soon!
                  </p>
                </div>

                {submitState === 'error' && errorMessage && (
                  <div role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-sans">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" aria-label="Bulk order inquiry form">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-sans text-xs font-medium text-ink mb-1.5" htmlFor="bo-firstName">
                        First name <span className="text-sale">*</span>
                      </label>
                      <input
                        id="bo-firstName"
                        type="text"
                        name="firstName"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={fieldErrors.firstName ? errorInputClass : inputClass}
                        aria-describedby={fieldErrors.firstName ? 'bo-firstName-error' : undefined}
                        autoComplete="given-name"
                      />
                      {fieldErrors.firstName && (
                        <p id="bo-firstName-error" role="alert" className="mt-1.5 font-sans text-xs text-red-500">{fieldErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block font-sans text-xs font-medium text-ink mb-1.5" htmlFor="bo-lastName">
                        Last name <span className="text-sale">*</span>
                      </label>
                      <input
                        id="bo-lastName"
                        type="text"
                        name="lastName"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={fieldErrors.lastName ? errorInputClass : inputClass}
                        aria-describedby={fieldErrors.lastName ? 'bo-lastName-error' : undefined}
                        autoComplete="family-name"
                      />
                      {fieldErrors.lastName && (
                        <p id="bo-lastName-error" role="alert" className="mt-1.5 font-sans text-xs text-red-500">{fieldErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-medium text-ink mb-1.5" htmlFor="bo-email">
                      Email <span className="text-sale">*</span>
                    </label>
                    <input
                      id="bo-email"
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      className={fieldErrors.email ? errorInputClass : inputClass}
                      aria-describedby={fieldErrors.email ? 'bo-email-error' : undefined}
                      autoComplete="email"
                    />
                    {fieldErrors.email && (
                      <p id="bo-email-error" role="alert" className="mt-1.5 font-sans text-xs text-red-500">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-medium text-ink mb-1.5" htmlFor="bo-phone">
                      Phone <span className="text-sale">*</span>
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center gap-1.5 px-3 rounded-l-xl border border-r-0 border-gray-200 bg-surface text-muted text-sm font-sans flex-shrink-0">
                        🇮🇳 +91
                      </span>
                      <input
                        id="bo-phone"
                        type="tel"
                        name="phone"
                        placeholder="Mobile number"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`flex-1 px-4 py-3 rounded-r-xl bg-surface border text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans text-sm transition-colors ${fieldErrors.phone ? 'border-red-400' : 'border-gray-200'}`}
                        aria-describedby={fieldErrors.phone ? 'bo-phone-error' : undefined}
                        autoComplete="tel"
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p id="bo-phone-error" role="alert" className="mt-1.5 font-sans text-xs text-red-500">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-medium text-ink mb-1.5" htmlFor="bo-city">
                      City <span className="text-sale">*</span>
                    </label>
                    <input
                      id="bo-city"
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      className={fieldErrors.city ? errorInputClass : inputClass}
                      aria-describedby={fieldErrors.city ? 'bo-city-error' : undefined}
                      autoComplete="address-level2"
                    />
                    {fieldErrors.city && (
                      <p id="bo-city-error" role="alert" className="mt-1.5 font-sans text-xs text-red-500">{fieldErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-medium text-ink mb-1.5" htmlFor="bo-message">
                      Message <span className="text-sale">*</span>
                    </label>
                    <textarea
                      id="bo-message"
                      name="message"
                      placeholder="Tell us about your bulk order requirements — quantities, product type, timeline..."
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className={fieldErrors.message ? errorInputClass : inputClass}
                      aria-describedby={fieldErrors.message ? 'bo-message-error' : undefined}
                    />
                    {fieldErrors.message && (
                      <p id="bo-message-error" role="alert" className="mt-1.5 font-sans text-xs text-red-500">{fieldErrors.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    disabled={submitState === 'submitting'}
                    aria-busy={submitState === 'submitting'}
                  >
                    {submitState === 'submitting' ? (
                      <span className="flex items-center justify-center gap-2">
                        <Spinner size="sm" label="Submitting…" />
                        Sending enquiry…
                      </span>
                    ) : (
                      'Submit Enquiry'
                    )}
                  </Button>

                  <p className="font-sans text-xs text-muted leading-relaxed text-center">
                    By submitting, you agree to receive marketing messages at the phone number or email
                    provided. View our{' '}
                    <a href="/privacy" className="text-brand hover:underline">privacy policy</a>{' '}
                    and{' '}
                    <a href="/terms" className="text-brand hover:underline">terms of service</a>{' '}
                    for more info.
                  </p>
                </form>
              </>
            )}
          </div>

        </div>
      </section>
    </main>
  )
}
