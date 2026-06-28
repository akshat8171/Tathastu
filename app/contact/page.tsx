import type { Metadata } from 'next'
import { SITE } from '@/lib/site'
import { getLocalBusinessSchema } from '@/lib/schema'
import { ContactForm } from './contact-form'

export const metadata: Metadata = {
  title: `Contact Tathastu Keepsakes | 3D Printing Agra Phone Number | Custom 3D Prints Enquiry`,
  description: `Contact Tathastu Keepsakes for 3D printing services. Call ${SITE.phone} - 3D printing Agra contact number. WhatsApp enquiry for custom 3D prints, bulk orders, personalised gifts. Email: ${SITE.email}. Get quote for 3D printed items India.`,
  keywords: [
    '3D printing Agra contact',
    'Tathastu Keepsakes phone number',
    '3D printing service contact India',
    'custom 3D printing enquiry',
    '3D printing Agra phone',
    'bulk 3D printing order contact',
    'personalised gifts enquiry India',
    '3D prints quote India',
  ],
  openGraph: {
    title: `Contact ${SITE.name} | 3D Printing Service Agra India`,
    description: 'Get in touch for custom 3D printing services. WhatsApp, phone & email support available.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function ContactPage() {
  const localBusinessSchema = getLocalBusinessSchema()

  return (
    <>
      {/* LocalBusiness Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <main className="bg-white py-16 px-4">
        <div className="container-page max-w-5xl">
          {/* Page header */}
        <div className="mb-12 text-center">
          <span className="inline-block bg-brand/10 text-brand text-xs font-display font-semibold uppercase tracking-widest px-4 py-1.5 rounded-pill mb-4">
            Get in Touch
          </span>
          <h1 className="font-display font-bold text-ink text-4xl sm:text-5xl leading-tight mb-4">
            Contact Us
          </h1>
          <p className="font-sans text-muted text-lg max-w-xl mx-auto">
            Have a question, custom order enquiry, or just want to say hello? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
          {/* ── Left: Contact Info ─────────────────────────────────────── */}
          <aside className="lg:col-span-2 space-y-8">

            {/* Info cards */}
            <div className="space-y-4">

              <a
                href={SITE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 rounded-card2 border border-gray-100 bg-surface hover:border-brand/30 hover:bg-brand/5 transition-colors duration-150 group"
              >
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center text-lg">💬</span>
                <div>
                  <div className="font-display font-semibold text-ink text-sm group-hover:text-brand transition-colors">WhatsApp (Fastest)</div>
                  <div className="font-sans text-muted text-sm">{SITE.phone}</div>
                </div>
              </a>

              <a
                href={SITE.phoneTel}
                className="flex items-start gap-4 p-4 rounded-card2 border border-gray-100 bg-surface hover:border-brand/30 hover:bg-brand/5 transition-colors duration-150 group"
              >
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center text-lg">📞</span>
                <div>
                  <div className="font-display font-semibold text-ink text-sm group-hover:text-brand transition-colors">Phone</div>
                  <div className="font-sans text-muted text-sm">{SITE.phone}</div>
                </div>
              </a>

              <a
                href={`mailto:${SITE.email}`}
                className="flex items-start gap-4 p-4 rounded-card2 border border-gray-100 bg-surface hover:border-brand/30 hover:bg-brand/5 transition-colors duration-150 group"
              >
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center text-lg">✉️</span>
                <div>
                  <div className="font-display font-semibold text-ink text-sm group-hover:text-brand transition-colors">Email</div>
                  <div className="font-sans text-muted text-sm">{SITE.email}</div>
                </div>
              </a>

              <div className="flex items-start gap-4 p-4 rounded-card2 border border-gray-100 bg-surface">
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center text-lg">📍</span>
                <div>
                  <div className="font-display font-semibold text-ink text-sm">Location</div>
                  <div className="font-sans text-muted text-sm">{SITE.addressLines.join(', ')}</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-card2 border border-gray-100 bg-surface">
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center text-lg">🕐</span>
                <div>
                  <div className="font-display font-semibold text-ink text-sm">Support Hours</div>
                  <div className="font-sans text-muted text-sm">{SITE.supportHours}</div>
                </div>
              </div>

            </div>

            {/* Social links */}
            <div>
              <p className="font-display font-semibold text-ink text-sm mb-3">Follow Us</p>
              <div className="flex gap-3">
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Tathastu Keepsakes on Instagram"
                  className="w-10 h-10 rounded-xl bg-surface border border-gray-100 flex items-center justify-center text-muted hover:text-brand hover:border-brand/30 transition-colors duration-150"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href={SITE.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Tathastu Keepsakes on Facebook"
                  className="w-10 h-10 rounded-xl bg-surface border border-gray-100 flex items-center justify-center text-muted hover:text-brand hover:border-brand/30 transition-colors duration-150"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href={SITE.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with Tathastu Keepsakes on WhatsApp"
                  className="w-10 h-10 rounded-xl bg-surface border border-gray-100 flex items-center justify-center text-muted hover:text-green-600 hover:border-green-200 transition-colors duration-150"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </aside>

          {/* ── Right: Contact Form ────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-surface rounded-card2 border border-gray-100 p-6 sm:p-8">
              <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-1">
                Send Us a Message
              </h2>
              <p className="font-sans text-muted text-sm mb-6">
                We typically respond within 1–2 business days.
              </p>
              {/* Client component island for form interactivity */}
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  )
}
