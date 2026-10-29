/**
 * /custom-3d-printing — custom-print quote flow with SEO content hub.
 *
 * Server page owns metadata + crawlable copy; client form handles the quote UI.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE } from '@/lib/site'
import { getFAQSchema } from '@/lib/schema'
import CustomizePageClient from './client'

export const metadata: Metadata = {
  title: `Custom 3D Printing India | 3D Print My Design Online`,
  description:
    `Custom 3D printing service in India. Upload design for 3D printing or send your photo/STL file. ` +
    `3D print my design India - keychains, portraits, nameplates, corporate gifts & more. Free quote 24hrs. Order custom 3D prints online with PAN India delivery from Agra.`,
  keywords: [
    'custom 3D printing India',
    '3D print my design India',
    'upload design for 3D printing',
    'custom 3D prints online',
    '3D printing service India',
    'custom 3D printed keychain India',
    'personalised 3D printing',
    '3D photo portrait India',
    'STL file printing India',
    'bulk 3D printing service',
    '3D printing Agra',
    'custom 3D gifts online India',
    'order 3D prints online',
  ],
  openGraph: {
    title: `Custom 3D Printing Service India | Upload Your Design | ${SITE.name}`,
    description: '3D print your design in India. Upload photo, STL or describe idea. Free quote within 24 hours. PAN India shipping.',
    type: 'website',
    locale: 'en_IN',
  },
  alternates: { canonical: '/custom-3d-printing' },
}

const CUSTOM_FAQS = [
  {
    question: 'What files can I upload for custom 3D printing?',
    answer:
      'We accept STL, OBJ, 3MF, STEP, and high-resolution photos (JPG/PNG) for lithophanes and photo keychains. If you only have an idea, describe it in the form and we will model it for you.',
  },
  {
    question: 'How long does a custom 3D print take in India?',
    answer:
      'Most custom quotes are answered within 24 hours. Production is typically 2–5 business days after design approval, then PAN-India shipping from our Agra workshop.',
  },
  {
    question: 'What materials do you use?',
    answer:
      'We primarily print in PLA and PLA+ for gifts and decor. For functional parts we can advise on tougher filaments. Multi-colour prints use AMS-style colour changes for crisp detail.',
  },
  {
    question: 'Do you offer bulk or corporate custom prints?',
    answer:
      'Yes. For 10+ identical or name-variable pieces, use our bulk order flow or mention quantity in the custom quote. Branding and packaging options are available.',
  },
]

export default function Custom3DPrintingPage() {
  const faqSchema = getFAQSchema(CUSTOM_FAQS)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="bg-surface border-b border-gray-100">
        <div className="container-page py-10 md:py-14 max-w-3xl">
          <p className="text-xs font-display font-semibold uppercase tracking-widest text-brand mb-3">
            Custom 3D printing · Agra workshop
          </p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-ink leading-tight mb-4">
            Custom 3D Printing in India — Print Your Design Online
          </h1>
          <p className="font-sans text-muted text-base md:text-lg leading-relaxed mb-4">
            Upload a photo, STL, or sketch and {SITE.name} will turn it into a physical
            keepsake. We print to order in Agra with PLA/PLA+, hand-finish each piece, and
            ship PAN India. Ideal for photo keychains, lithophane portraits, nameplates,
            corporate gifts, and one-off prototypes.
          </p>
          <ul className="font-sans text-sm text-ink space-y-2 mb-6 list-disc pl-5">
            <li>Free quote within 24 hours on business days</li>
            <li>Made-to-order FDM printing with multi-colour options</li>
            <li>Dispatch usually in 2–5 days after approval · free shipping over ₹199</li>
            <li>
              Prefer ready designs? Browse{' '}
              <Link href="/shop/pooja-decor" className="text-brand hover:underline font-medium">
                Pooja &amp; Decor
              </Link>{' '}
              or{' '}
              <Link href="/products" className="text-brand hover:underline font-medium">
                the full shop
              </Link>
              .
            </li>
          </ul>
          <div className="grid sm:grid-cols-3 gap-4 text-sm font-sans">
            <div className="rounded-card2 border border-gray-100 bg-white p-4">
              <p className="font-display font-semibold text-ink mb-1">1. Share your idea</p>
              <p className="text-muted">Upload a file or describe dimensions, colour, and quantity.</p>
            </div>
            <div className="rounded-card2 border border-gray-100 bg-white p-4">
              <p className="font-display font-semibold text-ink mb-1">2. Approve the quote</p>
              <p className="text-muted">We confirm feasibility, price, and lead time before printing.</p>
            </div>
            <div className="rounded-card2 border border-gray-100 bg-white p-4">
              <p className="font-display font-semibold text-ink mb-1">3. We print &amp; ship</p>
              <p className="text-muted">Layer-by-layer print, QC, and courier to your door across India.</p>
            </div>
          </div>
        </div>
      </section>

      <CustomizePageClient />

      <section className="bg-white border-t border-gray-100 py-12 px-4">
        <div className="container-page max-w-3xl">
          <h2 className="font-display font-bold text-2xl text-ink mb-6">
            Custom 3D printing FAQs
          </h2>
          <dl className="space-y-6">
            {CUSTOM_FAQS.map((faq) => (
              <div key={faq.question}>
                <dt className="font-display font-semibold text-ink mb-1">{faq.question}</dt>
                <dd className="font-sans text-muted text-sm leading-relaxed">{faq.answer}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm text-muted font-sans">
            Questions?{' '}
            <a href={SITE.whatsapp} className="text-brand hover:underline" target="_blank" rel="noopener noreferrer">
              WhatsApp {SITE.phone}
            </a>{' '}
            or email {SITE.email}.
          </p>
        </div>
      </section>
    </>
  )
}
