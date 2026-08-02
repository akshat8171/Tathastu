import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE } from '@/lib/site'
import { getFAQSchema } from '@/lib/schema'
import { FaqAccordion } from '@/components/faq/faq-accordion'
import type { FaqGroup } from '@/components/faq/faq-accordion'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/lib/pricing'

export const metadata: Metadata = {
  title: `FAQs - 3D Printing India | Custom 3D Printing Questions`,
  description: `Frequently asked questions about 3D printing service, custom 3D prints, ordering, shipping, returns & payments. Learn about our 3D printing process, bulk orders & pan-India delivery from ${SITE.name}.`,
  keywords: [
    '3D printing FAQs India',
    'custom 3D printing questions',
    '3D printing service FAQ',
    'how does 3D printing work',
    'bulk 3D printing orders India',
    'Tathastu Keepsakes help',
    '3D printing shipping India',
  ],
  openGraph: {
    title: `FAQs - 3D Printing India | ${SITE.name}`,
    description: 'All your questions about 3D printing service, custom prints, ordering & shipping answered.',
    type: 'website',
  },
}

const faqGroups: FaqGroup[] = [
  {
    title: 'Ordering & Payment',
    items: [
      {
        question: 'How do I place an order?',
        answer: (
          <p>
            Simply browse our catalogue, choose your product, select any options (colour, size, or
            custom text), and click &quot;Add to Cart&quot;. When you&apos;re ready, proceed to
            checkout, enter your delivery address, and choose a payment method. You&apos;ll receive
            an order confirmation via SMS or email once your order is placed.
          </p>
        ),
      },
      {
        question: 'What payment methods do you accept?',
        answer: (
          <p>
            We accept all major payment methods via <strong>Razorpay</strong>: credit cards,
            debit cards, UPI (GPay, PhonePe, Paytm), net banking, and popular digital wallets. We
            also offer <strong>Cash on Delivery (COD)</strong> for eligible orders. COD
            availability depends on your PIN code and order value.
          </p>
        ),
      },
      {
        question: 'Is it safe to pay online on your website?',
        answer: (
          <p>
            Yes. All online payments are processed by{' '}
            <strong>Razorpay</strong>, a PCI-DSS compliant payment gateway. We never store your
            card or banking details on our servers. Transactions are encrypted using SSL/TLS
            technology.
          </p>
        ),
      },
      {
        question: 'Can I use a coupon code?',
        answer: (
          <p>
            Yes! Enter your coupon code in the &quot;Apply Coupon&quot; field at checkout. Coupon
            codes cannot be combined unless explicitly stated. Follow us on{' '}
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
              Instagram
            </a>{' '}
            and join our WhatsApp community for the latest offers.
          </p>
        ),
      },
      {
        question: 'Can I modify or cancel my order after placing it?',
        answer: (
          <>
            <p className="mb-2">
              Because all our products are <strong>made to order</strong>, production begins
              shortly after your order is confirmed. You may cancel within{' '}
              <strong>2 hours</strong> of placing your order if printing has not yet commenced.
              Contact us immediately via WhatsApp at{' '}
              <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                {SITE.phone}
              </a>
              .
            </p>
            <p>
              Once production starts, cancellations and modifications are not possible for
              custom/personalised items. Please review your order carefully before confirming.
            </p>
          </>
        ),
      },
    ],
  },
  {
    title: 'Customisation',
    items: [
      {
        question: 'What custom products do you offer?',
        answer: (
          <p>
            We offer personalised keyrings, name plates, custom text prints, and fully bespoke
            designs. You can upload your own artwork or logo, or simply provide text and we&apos;ll
            lay it out for you. Visit our{' '}
            <Link href="/customize" className="text-brand hover:underline">
              Customise
            </Link>{' '}
            page to get started.
          </p>
        ),
      },
      {
        question: 'What file formats do you accept for custom designs?',
        answer: (
          <p>
            We accept <strong>.STL, .OBJ, .PNG, .JPG, .PDF, and .SVG</strong> files. For best
            results, provide high-resolution images (300 DPI or above) or vector files (.SVG /
            .PDF). If you&apos;re unsure about your file, upload it and our team will review and
            confirm printability before production.
          </p>
        ),
      },
      {
        question: 'What colours are available for 3D prints?',
        answer: (
          <p>
            We print in a wide range of colours including Black, White, Red, Blue, Green, Yellow,
            Orange, Purple, and more. Our multi-colour FDM technology allows up to 4 colours in
            a single print. Available colours are shown on each product page. For bulk or bespoke
            colour requirements, contact us directly.
          </p>
        ),
      },
      {
        question: 'How long does a custom order take?',
        answer: (
          <p>
            Custom and personalised orders typically take <strong>3–6 business days</strong> for
            printing and finishing before dispatch, plus delivery time. For complex or large custom
            designs, we will confirm a timeline after reviewing your files. See our{' '}
            <Link href="/shipping-policy" className="text-brand hover:underline">
              Shipping Policy
            </Link>{' '}
            for full details.
          </p>
        ),
      },
      {
        question: 'Can I request a bulk order for corporate gifting or events?',
        answer: (
          <>
            <p className="mb-2">
              Absolutely! We love bulk orders. Whether it&apos;s corporate gifts, event giveaways,
              wedding favours, or school/college merchandise, we can handle it.
            </p>
            <p>
              Visit our{' '}
              <Link href="/bulk-order" className="text-brand hover:underline">
                Bulk Order
              </Link>{' '}
              page or reach out via WhatsApp at{' '}
              <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                {SITE.phone}
              </a>{' '}
              for a custom quote. Bulk orders of 10+ units attract special pricing.
            </p>
          </>
        ),
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    items: [
      {
        question: 'Do you ship across India?',
        answer: (
          <p>
            Yes — we ship pan-India to all states and union territories. Delivery timelines vary
            by location; metro cities typically receive orders in 3–5 business days after dispatch.
            See our full{' '}
            <Link href="/shipping-policy" className="text-brand hover:underline">
              Shipping Policy
            </Link>
            .
          </p>
        ),
      },
      {
        question: 'What are the shipping charges?',
        answer: (
          <p>
            Shipping is <strong>FREE on all orders above ₹{FREE_SHIPPING_THRESHOLD}</strong>. A
            flat shipping fee of <strong>₹{SHIPPING_FEE}</strong> applies to orders below that
            threshold. COD orders may have an additional nominal COD handling fee shown at checkout.
          </p>
        ),
      },
      {
        question: 'How do I track my order?',
        answer: (
          <p>
            Once your order is dispatched, you will receive a tracking number via SMS/WhatsApp. You
            can also track your order under{' '}
            <Link href="/account/track-order" className="text-brand hover:underline">
              My Account → Track Order
            </Link>
            .
          </p>
        ),
      },
      {
        question: 'Is Cash on Delivery (COD) available?',
        answer: (
          <p>
            Yes! COD is available for most PIN codes across India. Availability and any COD
            handling fee are shown at checkout. COD is not available for orders above ₹5,000 or
            certain remote areas.
          </p>
        ),
      },
      {
        question: "My order hasn’t arrived within the expected time. What should I do?",
        answer: (
          <p>
            If your order is delayed beyond the estimated delivery window, please first check the
            tracking link we sent you. If the status is unclear or the package appears lost,
            contact us at{' '}
            <a href={`mailto:${SITE.email}`} className="text-brand hover:underline">
              {SITE.email}
            </a>{' '}
            or WhatsApp{' '}
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
              {SITE.phone}
            </a>{' '}
            and we will investigate immediately.
          </p>
        ),
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    items: [
      {
        question: 'Can I return my order?',
        answer: (
          <>
            <p className="mb-2">
              Since all products are <strong>made-to-order</strong>, returns for change of mind
              are not accepted. However, you can raise a return request within{' '}
              <strong>5 days of delivery</strong> if:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The product has a manufacturing defect.</li>
              <li>The product arrived damaged in transit.</li>
              <li>You received the wrong item.</li>
            </ul>
            <p className="mt-2">
              See our full{' '}
              <Link href="/refund-and-returns-policy" className="text-brand hover:underline">
                Refund &amp; Returns Policy
              </Link>
              .
            </p>
          </>
        ),
      },
      {
        question: 'My product arrived damaged. What do I do?',
        answer: (
          <p>
            Please record an <strong>unboxing video</strong> before fully opening the package.
            Contact us within <strong>48 hours of delivery</strong> with the video and photos of
            the damage at{' '}
            <a href={`mailto:${SITE.email}`} className="text-brand hover:underline">
              {SITE.email}
            </a>{' '}
            or WhatsApp{' '}
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
              {SITE.phone}
            </a>
            . We&apos;ll arrange a replacement or refund within 2 business days of review.
          </p>
        ),
      },
      {
        question: 'How long does a refund take?',
        answer: (
          <p>
            Approved refunds are processed back to your original payment method via Razorpay
            within <strong>5–10 business days</strong> for cards/UPI and 3–7 business days for
            other methods. COD refunds are processed via bank transfer. See the full timeline in
            our{' '}
            <Link href="/refund-and-returns-policy" className="text-brand hover:underline">
              Refund &amp; Returns Policy
            </Link>
            .
          </p>
        ),
      },
    ],
  },
  {
    title: 'Account & Tracking',
    items: [
      {
        question: 'Do I need an account to place an order?',
        answer: (
          <p>
            You need to verify your mobile number via OTP to place an order — this helps us
            secure your order history and provide a smooth checkout experience. No password
            required; just your phone number.
          </p>
        ),
      },
      {
        question: 'How do I log in?',
        answer: (
          <p>
            Visit the{' '}
            <Link href="/login" className="text-brand hover:underline">
              Login
            </Link>{' '}
            page, enter your mobile number, and verify with a one-time password (OTP) sent via
            SMS. It&apos;s quick and passwordless.
          </p>
        ),
      },
      {
        question: 'Where can I see my past orders?',
        answer: (
          <p>
            Log in and visit{' '}
            <Link href="/account" className="text-brand hover:underline">
              My Account
            </Link>{' '}
            to see your full order history, track shipments, manage your saved addresses, and
            view your wishlist.
          </p>
        ),
      },
    ],
  },
]

export default function FaqsPage() {
  // Flatten all FAQs for schema markup (convert React nodes to text)
  const allFaqs = faqGroups.flatMap(group =>
    group.items.map(item => ({
      question: item.question,
      answer: typeof item.answer === 'string' ? item.answer : 'Visit the page for full details.',
    }))
  )

  const faqSchema = getFAQSchema(allFaqs)

  return (
    <>
      {/* FAQ Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="bg-white py-16 px-4">
        <div className="container-page max-w-3xl">
          {/* Page header */}
        <div className="mb-12 text-center">
          <span className="inline-block bg-brand/10 text-brand text-xs font-display font-semibold uppercase tracking-widest px-4 py-1.5 rounded-pill mb-4">
            Help Centre
          </span>
          <h1 className="font-display font-bold text-ink text-4xl sm:text-5xl leading-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="font-sans text-muted text-lg max-w-xl mx-auto">
            Can&apos;t find your answer here? Reach us on{' '}
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline font-medium"
            >
              WhatsApp
            </a>{' '}
            or email{' '}
            <a href={`mailto:${SITE.email}`} className="text-brand hover:underline font-medium">
              {SITE.email}
            </a>
            .
          </p>
        </div>

        {/* Accordion — client component island */}
        <FaqAccordion groups={faqGroups} />

        {/* Still need help CTA */}
        <div className="mt-16 bg-brand/5 rounded-card2 p-8 text-center border border-brand/10">
          <h2 className="font-display font-bold text-ink text-xl sm:text-2xl mb-2">
            Still have questions?
          </h2>
          <p className="font-sans text-muted text-sm mb-6">
            Our team is available {SITE.supportHours}.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Chat on WhatsApp
            </a>
            <Link href="/contact" className="btn-outline">
              Send a Message
            </Link>
          </div>
        </div>
      </div>
    </main>
    </>
  )
}
