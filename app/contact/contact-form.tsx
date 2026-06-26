'use client'

import { useState } from 'react'
import { Spinner } from '@/components/ui'

interface FormState {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

interface SubmitState {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
}

const SUBJECTS = [
  'General Enquiry',
  'Order Status / Tracking',
  'Custom Print Request',
  'Bulk / Corporate Order',
  'Return or Refund',
  'Product Information',
  'Other',
]

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle', message: '' })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submit.status === 'submitting') return

    setSubmit({ status: 'submitting', message: '' })

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          subject: form.subject,
          message: form.message.trim(),
        }),
      })

      const data = (await res.json()) as { ok: boolean; message: string }

      if (!res.ok || !data.ok) {
        setSubmit({ status: 'error', message: data.message || 'Something went wrong. Please try again.' })
        return
      }

      setSubmit({ status: 'success', message: data.message })
      setForm(EMPTY_FORM)
    } catch {
      setSubmit({
        status: 'error',
        message: 'Network error. Please check your connection and try again.',
      })
    }
  }

  if (submit.status === 'success') {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="py-12 text-center"
      >
        <div className="text-4xl mb-4">✅</div>
        <h3 className="font-display font-bold text-ink text-xl mb-2">Message Sent!</h3>
        <p className="font-sans text-muted text-sm mb-6">{submit.message}</p>
        <button
          type="button"
          onClick={() => setSubmit({ status: 'idle', message: '' })}
          className="btn-outline text-sm px-5 py-2"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Error banner */}
      {submit.status === 'error' && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm"
        >
          {submit.message}
        </div>
      )}

      {/* Name + Email */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className="block font-display font-medium text-ink text-sm mb-1.5">
            Name <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block font-display font-medium text-ink text-sm mb-1.5">
            Email <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Phone + Subject */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-phone" className="block font-display font-medium text-ink text-sm mb-1.5">
            Phone{' '}
            <span className="text-muted font-sans font-normal text-xs">(optional)</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
          />
        </div>
        <div>
          <label htmlFor="contact-subject" className="block font-display font-medium text-ink text-sm mb-1.5">
            Subject <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <select
            id="contact-subject"
            name="subject"
            required
            value={form.subject}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition appearance-none"
          >
            <option value="">Select a subject…</option>
            {SUBJECTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="block font-display font-medium text-ink text-sm mb-1.5">
          Message <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us how we can help you…"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition resize-y"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submit.status === 'submitting'}
        aria-disabled={submit.status === 'submitting'}
        className="btn-primary w-full sm:w-auto px-8 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submit.status === 'submitting' ? (
          <span className="flex items-center gap-2">
            <Spinner size="sm" />
            Sending…
          </span>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  )
}
