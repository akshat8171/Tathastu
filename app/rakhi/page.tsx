/**
 * /rakhi — Raksha Bandhan 2026 SEO landing page + category hub.
 *
 * This is the keyword-optimised entry point for the new "rakhi" product
 * category. It targets high-intent, lower-competition long-tail queries
 * (customised rakhi, gaming rakhi, personalised name/photo/secret-message
 * rakhi, rakhi that becomes a keychain, rakhi for brother, bhaiya bhabhi /
 * lumba rakhi, family rakhi set, Raksha Bandhan 2026) WITHOUT touching any
 * existing route or its SEO.
 *
 * Data: reads the same lib/products.json every other page uses and shows all
 * products in the `rakhi` category. Structured data: FAQPage + BreadcrumbList
 * (same helpers as the rest of the site) for rich results.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ProductCard } from '@/components/ui/product-card'
import type { ProductCardData } from '@/components/ui/product-card'
import { SITE, waLink } from '@/lib/site'
import { getFAQSchema, getBreadcrumbSchema } from '@/lib/schema'
import { getCategoryBySlug } from '@/lib/categories'
import { getCatalogProducts } from '@/lib/catalog/store'

// ── SEO metadata ──────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  // NOTE: the root layout applies the `%s | Tathastu Keepsakes` title template,
  // so we pass the bare title here (appending the brand would double it). Kept
  // lean so the primary keyword phrase survives Google's ~60-char SERP cut.
  title: 'Personalised Rakhi Online — 3D-Printed Rakhi to Keychain',
  description:
    'Personalised rakhi that becomes a keychain keepsake. Name, photo, gaming, cricket & superhero rakhi, 3D-printed to order. From ₹259, COD & PAN-India delivery.',
  keywords: [
    'customised rakhi online',
    'customized rakhi',
    'personalised rakhi',
    'personalised name rakhi',
    'photo rakhi online',
    'secret message rakhi',
    'gaming rakhi',
    'gaming console rakhi',
    'rakhi for gamer brother',
    'cartoon rakhi for kids',
    'kids rakhi',
    'superhero rakhi',
    'cricket rakhi',
    'rakhi that turns into a keychain',
    'rakhi that becomes keychain',
    'rakhi to keychain keepsake',
    'keepsake rakhi',
    'reusable rakhi',
    '3D printed rakhi',
    'rakhi for brother',
    'bhaiya bhabhi rakhi',
    'lumba rakhi online',
    'family rakhi set',
    'Raksha Bandhan 2026',
    'raksha bandhan 2026 date',
    'buy rakhi online India',
    'unique rakhi ideas 2026',
    'custom rakhi with name',
  ],
  alternates: { canonical: '/rakhi' },
  openGraph: {
    title: `Customised Rakhi That Becomes a Keychain | Raksha Bandhan 2026 | ${SITE.name}`,
    description:
      'Personalised name, photo, secret-message, gaming, cricket & superhero rakhi — 3D-printed keepsakes that turn into keychains. From ₹259. PAN India delivery.',
    type: 'website',
    url: '/rakhi',
    locale: 'en_IN',
    images: [{ url: '/images/rakhi/categories/rakhi.png', alt: 'Customised 3D printed rakhi keepsakes by Tathastu Keepsakes' }],
  },
}

// ── FAQ content (also emitted as FAQPage schema) ───────────────────────────────
const FAQS: Array<{ question: string; answer: string }> = [
  {
    question: 'When is Raksha Bandhan in 2026 and what is the shubh muhurat?',
    answer:
      'Raksha Bandhan 2026 falls on Friday, 28 August 2026 (Shravana Purnima). The good news: there is no Bhadra Kaal on the day, so you can tie the rakhi any time in the morning — the shubh muhurat runs roughly from 6:09 AM to 9:48 AM. Order your customised rakhi before 24 August 2026 so your made-to-order, personalised rakhi is delivered comfortably in time across India.',
  },
  {
    question: 'What should I do with my rakhi after Raksha Bandhan?',
    answer:
      'Instead of tucking it away in a drawer or throwing it out, keep it forever. Every Tathastu rakhi ships with a free keychain converter — once the festival is over, clip the rakhi onto your keys, bag or backpack and it becomes a keepsake keychain. It is the most meaningful (and most eco-friendly) thing you can do with a rakhi after Raksha Bandhan.',
  },
  {
    question: 'What is a rakhi that becomes a keychain?',
    answer:
      'Every Tathastu rakhi is 3D-printed as a durable keepsake and ships with a free keychain converter. Tie it on your brother’s wrist for Raksha Bandhan, then clip it onto his keys, bag or car keys afterwards — so a one-day festival becomes a keepsake he keeps forever.',
  },
  {
    question: 'Can I get a personalised rakhi with a name, photo or secret message?',
    answer:
      'Yes. You can add a name or gamertag (name rakhi), your favourite photo (photo rakhi), or a hidden engraved note (secret message rakhi). Just enter your text on the product page; for photos, upload your image at checkout or send it to us on WhatsApp.',
  },
  {
    question: 'Do you make gaming, cricket, superhero and cartoon rakhi for kids?',
    answer:
      'We do. Popular customised designs include a gaming console (controller) rakhi, cricket bat-and-ball rakhi, superhero shield rakhi, car rakhi, profession rakhi (doctor, engineer, pilot) and colourful cartoon rakhi for kids — each personalised with a name.',
  },
  {
    question: 'Can I suggest my own custom rakhi idea?',
    answer:
      'Absolutely — that is our favourite kind of order. Share your idea, sketch or reference on our Customise page or WhatsApp us, and our Agra design team will 3D-print a one-of-a-kind rakhi keepsake just for you.',
  },
  {
    question: 'How much does a customised rakhi cost and do you offer COD?',
    answer:
      'Customised single rakhi start at ₹259, with value sets like the Bhaiya Bhabhi (set of 2) and Family Rakhi (set of 4) offering a lower price per rakhi. We offer Cash on Delivery and tracked, insured PAN-India shipping, with free shipping on orders over ₹199.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Each rakhi is made to order and dispatched within 2–4 days, then shipped pan-India with tracking. Order before 24 August 2026 for guaranteed Raksha Bandhan delivery. Need it faster? WhatsApp us and we will do our best to expedite.',
  },
]

// ── Design cards (internal-link + keyword surface) ─────────────────────────────
const DESIGN_IDEAS: Array<{ title: string; desc: string; emoji: string }> = [
  { title: 'Gaming Console Rakhi', desc: 'A controller-shaped rakhi with his name or gamertag — for the gamer brother.', emoji: '🎮' },
  { title: 'Cricket Bat & Ball Rakhi', desc: 'Mini bat and ball with a jersey number — for the cricket-mad sibling.', emoji: '🏏' },
  { title: 'Personalised Name Rakhi', desc: 'Any name, 3D-printed in vivid colour — the timeless custom rakhi.', emoji: '🔤' },
  { title: 'Secret Message Rakhi', desc: 'A hidden engraved note only your sibling can read.', emoji: '💌' },
  { title: 'Photo Rakhi', desc: 'Your favourite memory printed onto the rakhi itself.', emoji: '📸' },
  { title: 'Superhero Shield Rakhi', desc: 'For the little brother who is everyone’s hero.', emoji: '🛡️' },
  { title: 'Cartoon Kids Rakhi', desc: 'Bright, playful characters with their name — loved by kids.', emoji: '🧸' },
  { title: 'Your Own Idea', desc: 'Car, profession, initial, pet — suggest anything and we’ll print it.', emoji: '✨' },
]

export const revalidate = 60

export default async function RakhiLandingPage() {
  const rakhiProducts = (await getCatalogProducts()).filter((p) => p.category === 'rakhi') as ProductCardData[]
  const category = getCategoryBySlug('rakhi')

  const fromPrice = rakhiProducts.reduce(
    (min, p) => (p.price < min ? p.price : min),
    Number.POSITIVE_INFINITY,
  )

  const faqSchema = getFAQSchema(FAQS)
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Rakhi (Raksha Bandhan)', url: '/rakhi' },
  ])

  return (
    <main className="bg-white min-h-screen">
      {/* ── Structured data ─────────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="bg-surface border-b border-gray-100">
        <div className="container-page py-3">
          <ol className="flex items-center gap-1.5 text-xs text-muted font-sans" role="list">
            <li>
              <Link href="/" className="hover:text-brand transition-colors">Home</Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li><span className="text-ink font-medium">Rakhi (Raksha Bandhan)</span></li>
          </ol>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#ffb74d] via-[#f57c00] to-[#9f1239]">
        <div className="container-page py-12 md:py-16 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <p className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-display font-semibold uppercase tracking-widest mb-4">
                Raksha Bandhan 2026 · 28 August
              </p>
              <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl leading-tight mb-4">
                Customised Rakhi That Becomes a Keychain Keepsake
              </h1>
              <p className="text-white/90 font-sans text-base md:text-lg leading-relaxed mb-6 max-w-xl">
                Personalised name, photo &amp; secret-message rakhi. Gaming, cricket,
                superhero &amp; cartoon rakhi for your brother and kids. Every 3D-printed
                rakhi ships with a free keychain converter — so a one-day festival lasts
                forever. Made in Agra, delivered across India.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#rakhi-collection" className="btn-primary bg-white text-[#9f1239] hover:bg-white/90">
                  Shop Rakhi from ₹{Number.isFinite(fromPrice) ? fromPrice : 259}
                </a>
                <Link href="/customize?type=custom" className="btn-outline border-white text-white hover:bg-white hover:text-[#9f1239]">
                  Suggest Your Own Idea
                </Link>
              </div>
              {/* Trust chips */}
              <div className="flex flex-wrap gap-4 mt-6 text-xs text-white/90 font-sans">
                <span>✓ Becomes a keychain</span>
                <span>✓ COD available</span>
                <span>✓ PAN-India delivery</span>
                <span>✓ Made to order in Agra</span>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="relative aspect-square rounded-card2 overflow-hidden shadow-card-hover ring-4 ring-white/30">
                <Image
                  src={category?.image ?? '/images/rakhi/categories/rakhi.png'}
                  alt="Customised 3D printed rakhi keepsakes for Raksha Bandhan 2026 by Tathastu Keepsakes"
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 400px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Intro / keyword-rich lede ───────────────────────────────────────── */}
      <section className="container-page py-10 md:py-12">
        <div className="max-w-3xl">
          <h2 className="font-display font-bold text-2xl text-ink mb-4">
            Buy Customised Rakhi Online for Raksha Bandhan 2026
          </h2>
          <p className="text-muted font-sans leading-relaxed mb-4">
            Looking for a <strong>customised rakhi</strong> that is not the same old thread everyone
            forgets by September? Tathastu Keepsakes 3D-prints <strong>personalised rakhi</strong> that
            double as keepsakes. Choose a <strong>name rakhi</strong>, a <strong>photo rakhi</strong>, a
            heartfelt <strong>secret message rakhi</strong>, or a themed design like a{' '}
            <strong>gaming console rakhi</strong>, <strong>cricket bat-and-ball rakhi</strong>,{' '}
            <strong>superhero rakhi</strong> or <strong>cartoon rakhi for kids</strong>. Every rakhi is
            made to order in Agra and ships with a free converter so it becomes a{' '}
            <strong>keychain keepsake</strong> your brother keeps for years.
          </p>
          <p className="text-muted font-sans leading-relaxed">
            Shopping for the whole family? Add a <strong>Bhaiya Bhabhi rakhi set</strong> with a{' '}
            <strong>lumba rakhi</strong> for your sister-in-law, or a <strong>family rakhi set of 4</strong>{' '}
            for the best price per rakhi. Have a one-of-a-kind idea — a car, a pet, a profession, an
            inside joke? <Link href="/customize?type=custom" className="text-brand font-semibold hover:underline">Suggest your own rakhi idea</Link>{' '}
            and we’ll bring it to life.
          </p>

          {/* Muhurat fact block — targets the "raksha bandhan 2026 date/muhurat"
              featured-snippet query with a concise, factually-accurate answer. */}
          <div className="mt-6 rounded-card2 border border-[#fed7aa] bg-[#fff7ed] p-4 md:p-5">
            <p className="font-display font-semibold text-ink text-sm md:text-base">
              📅 Raksha Bandhan 2026: Friday, 28 August
            </p>
            <p className="text-sm text-muted font-sans leading-relaxed mt-1">
              This year there is <strong>no Bhadra Kaal</strong> on the day, so you can tie the rakhi
              any time in the morning — the <strong>shubh muhurat runs about 6:09 AM to 9:48 AM</strong>.
              Order your customised rakhi <strong>before 24 August 2026</strong> for guaranteed delivery in time.
            </p>
          </div>
        </div>
      </section>

      {/* ── Festival offers band (codes mirror supabase/migration-010-rakhi-coupons.sql) ── */}
      <section aria-label="Raksha Bandhan offers" className="container-page pb-2">
        <div className="rounded-card2 bg-gradient-to-r from-[#fff7ed] to-[#fef2f2] border border-[#fed7aa] p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg" aria-hidden="true">🎁</span>
            <h2 className="font-display font-bold text-lg text-ink">Raksha Bandhan 2026 Offers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { code: 'RAKHI2026', line: '10% off your rakhi order', sub: 'Min ₹259 · everyone' },
              { code: 'RAKHISET', line: '₹100 off rakhi sets (2+)', sub: 'Min ₹549' },
              { code: 'RAKHIFAM', line: '₹200 off family orders', sub: 'Min ₹999' },
            ].map((offer) => (
              <div key={offer.code} className="rounded-card border border-dashed border-[#e5a26d] bg-white/70 p-4 text-center">
                <p className="font-display font-bold text-ink text-sm">{offer.line}</p>
                <p className="text-xs text-muted font-sans mt-0.5 mb-2">{offer.sub}</p>
                <span
                  className="inline-block font-display font-bold text-[#9f1239] bg-white border border-[#fca5a5] px-3 py-1 rounded-full text-sm tracking-widest select-all cursor-copy"
                  title="Click to select and copy this coupon code"
                  role="text"
                  aria-label={`Coupon code ${offer.code}`}
                >
                  {offer.code}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted font-sans mt-3 text-center">
            Apply your code at checkout. One coupon per order. Offers valid until 31 August 2026.
          </p>
        </div>
      </section>

      {/* ── Product collection ──────────────────────────────────────────────── */}
      <section id="rakhi-collection" className="container-page pb-4 scroll-mt-24">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
          <div>
            <h2 className="font-display font-bold text-2xl text-ink">Shop the Rakhi Collection</h2>
            <p className="text-sm text-muted font-sans mt-1">
              {rakhiProducts.length} customised designs · all become keychains · from ₹
              {Number.isFinite(fromPrice) ? fromPrice : 259}
            </p>
          </div>
          <Link href="/products?category=rakhi" className="text-sm text-brand font-display font-semibold hover:underline">
            View all in shop →
          </Link>
        </div>

        {rakhiProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {rakhiProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <p className="text-muted">Our rakhi collection is being crafted — check back shortly.</p>
        )}
      </section>

      {/* ── Design ideas grid (internal links + long-tail keywords) ─────────── */}
      <section className="container-page py-12">
        <h2 className="font-display font-bold text-2xl text-ink mb-2">Unique Rakhi Ideas for 2026</h2>
        <p className="text-sm text-muted font-sans mb-6 max-w-2xl">
          Not sure where to start? These are the customised rakhi our customers love most — and you
          can personalise every single one with a name, number or message.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DESIGN_IDEAS.map((idea) => (
            <div key={idea.title} className="rounded-card2 border border-gray-100 bg-surface p-5 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="text-3xl mb-2" aria-hidden="true">{idea.emoji}</div>
              <h3 className="font-display font-semibold text-ink text-base mb-1">{idea.title}</h3>
              <p className="text-sm text-muted font-sans leading-relaxed">{idea.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/customize?type=custom" className="btn-primary">Suggest Your Own Rakhi Idea</Link>
        </div>
      </section>

      {/* ── Why 3D-printed keepsake rakhi ───────────────────────────────────── */}
      <section className="bg-surface border-y border-gray-100">
        <div className="container-page py-12">
          <h2 className="font-display font-bold text-2xl text-ink mb-8 text-center">
            Why a 3D-Printed Rakhi Keepsake?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl mb-2" aria-hidden="true">♻️</div>
              <h3 className="font-display font-semibold text-ink mb-1">Kept Forever</h3>
              <p className="text-sm text-muted font-sans">Clip on the free converter and your rakhi becomes a keychain — a lasting reminder, not landfill.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2" aria-hidden="true">🎨</div>
              <h3 className="font-display font-semibold text-ink mb-1">Truly Personalised</h3>
              <p className="text-sm text-muted font-sans">Add a name, gamertag, jersey number, photo or secret message — no two rakhi are the same.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2" aria-hidden="true">🇮🇳</div>
              <h3 className="font-display font-semibold text-ink mb-1">Made in India</h3>
              <p className="text-sm text-muted font-sans">3D-printed to order in Agra with premium PLA, then shipped tracked and insured across India.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ (matches FAQPage schema) ────────────────────────────────────── */}
      <section className="container-page py-12">
        <h2 className="font-display font-bold text-2xl text-ink mb-6">Rakhi FAQs</h2>
        <div className="max-w-3xl space-y-4">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group rounded-card2 border border-gray-100 bg-white p-5 shadow-card">
              <summary className="flex cursor-pointer items-center justify-between font-display font-semibold text-ink list-none">
                {faq.question}
                <svg className="w-5 h-5 text-brand transition-transform group-open:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <p className="mt-3 text-sm text-muted font-sans leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#9f1239] to-[#4c2a86]">
        <div className="container-page py-12 text-center text-white">
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-3">
            Order Your Customised Rakhi Before 24 August 2026
          </h2>
          <p className="text-white/90 font-sans mb-6 max-w-xl mx-auto">
            Made to order in Agra, delivered across India in time for Raksha Bandhan. COD available.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="#rakhi-collection" className="btn-primary bg-white text-[#9f1239] hover:bg-white/90">Shop Rakhi Now</a>
            <a
              href={waLink('Hi! I want to order a customised rakhi for Raksha Bandhan 2026.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline border-white text-white hover:bg-white hover:text-[#9f1239]"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
