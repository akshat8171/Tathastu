'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  message: string
}

const contactMethods = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    title: 'Call Us',
    value: '+91-88820-65253',
    href: 'tel:+918882065253',
    label: 'Call now',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: 'WhatsApp',
    value: '+91 88820 65253',
    href: 'https://wa.me/918882065253',
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
    value: 'business@tathastu.in',
    href: 'mailto:business@tathastu.in',
    label: 'Send email',
  },
]

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans text-sm transition-colors'

export default function BulkOrderPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Thank you for your inquiry! We will contact you soon.')
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-surface border-b border-gray-100 py-3 px-4">
        <div className="container-page">
          <nav className="flex items-center gap-2 font-sans text-sm text-muted">
            <Link href="/" className="hover:text-brand transition-colors">Home</Link>
            <span className="text-gray-300">/</span>
            <span className="text-ink">Bulk Order</span>
          </nav>
        </div>
      </div>

      {/* Hero Band */}
      <section className="relative bg-ink py-20 px-4 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
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
              you&apos;re a café, restaurant, corporate event planner, or retailer, Tathastu offers
              bespoke bulk &amp; corporate ordering solutions tailored to your needs.
            </p>
            <p className="font-sans text-muted text-base leading-relaxed mb-3">
              We are here to assist you through every step of the process and provide you with a
              solution that meets your needs and exceeds your expectations.
            </p>
            <p className="font-sans text-muted text-sm leading-relaxed">
              For any inquiries or to discuss your bulk / corporate order needs, please reach out to
              us at{' '}
              <a href="mailto:business@tathastu.in" className="text-brand hover:underline font-medium">
                business@tathastu.in
              </a>{' '}
              or call / WhatsApp us at{' '}
              <a href="tel:+918882065253" className="text-brand hover:underline font-medium">
                +91 88820 65253
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
                >
                  {method.value}
                </a>
              </div>
            ))}
          </div>

          {/* Inquiry Form */}
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h3 className="font-display font-bold text-ink text-2xl mb-2">Got Any Questions?</h3>
              <p className="font-sans text-muted text-sm">
                Fill the form below — our team will contact you soon!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-medium text-ink mb-1.5">
                    First name <span className="text-sale">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-medium text-ink mb-1.5">
                    Last name <span className="text-sale">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs font-medium text-ink mb-1.5">
                  Email <span className="text-sale">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-medium text-ink mb-1.5">
                  Phone <span className="text-sale">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center gap-1.5 px-3 rounded-l-xl border border-r-0 border-gray-200 bg-surface text-muted text-sm font-sans">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 rounded-r-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-sans text-sm transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs font-medium text-ink mb-1.5">
                  City <span className="text-sale">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-medium text-ink mb-1.5">
                  Message <span className="text-sale">*</span>
                </label>
                <textarea
                  name="message"
                  placeholder="Tell us about your bulk order requirements — quantities, product type, timeline..."
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <Button type="submit" variant="primary" fullWidth size="lg">
                Submit Enquiry
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
          </div>

        </div>
      </section>
    </main>
  )
}
