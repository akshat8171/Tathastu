import Link from 'next/link'
import Image from 'next/image'
import { SITE } from '@/lib/site'

const shopLinks = [
  { href: '/products?category=pooja-decor', label: 'Pooja & Decor' },
  { href: '/products?category=keyrings', label: 'Keyrings & Bag Tags' },
  { href: '/products?category=lamps', label: 'Lamps & Lighting' },
  { href: '/products?category=organizers', label: 'Desk & Workspace' },
  { href: '/products?category=gaming', label: 'Gaming' },
  { href: '/products', label: 'All Products' },
]

const serviceLinks = [
  { href: '/customize', label: 'Customise Now' },
  { href: '/customize', label: 'Upload Your Design' },
  { href: '/account', label: 'Track Order' },
  { href: '/account', label: 'My Account' },
  { href: '/cart', label: 'Cart' },
  { href: '/bulk-order', label: 'Bulk Orders' },
]

const policyLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/faqs', label: 'FAQs' },
  { href: '/shipping-policy', label: 'Shipping Policy' },
  { href: '/refund-and-returns-policy', label: 'Refund & Returns' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
]

export function Footer() {
  return (
    <footer className="section-dark relative overflow-hidden" data-testid="site-footer">
      {/* Large faint watermark wordmark */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="font-display font-extrabold uppercase tracking-widest text-white/[0.04] select-none"
          style={{ fontSize: 'clamp(3rem, 12vw, 10rem)', lineHeight: '0.85' }}
        >
          TATHASTU
        </span>
      </div>

      <div className="container-page relative py-14">
        {/* ── Top grid ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Column 1 — Brand (spans 2 on lg) */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-2xl text-white tracking-tight" aria-label="Tathastu Keepsakes home">
              <Image
                src="/images/logo/tk-mark-white.png"
                alt=""
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span>Tathastu<span className="text-brand"> Keepsakes</span></span>
            </Link>
            <p className="mt-4 text-sm font-sans text-white/60 leading-relaxed">
              {SITE.description}
            </p>

            {/* Social icons */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Tathastu Keepsakes on Instagram"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-brand hover:text-white transition-colors"
              >
                {/* Instagram */}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={SITE.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Tathastu Keepsakes on Facebook"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-brand hover:text-white transition-colors"
              >
                {/* Facebook */}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={SITE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Tathastu Keepsakes on WhatsApp"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-[#25D366] hover:text-white transition-colors"
              >
                {/* WhatsApp */}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>

            {/* Trust strip */}
            <div className="mt-6 flex flex-col gap-2 text-xs font-sans text-white/50">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 8a2 2 0 002 2h8a2 2 0 002-2l1-8" />
                </svg>
                Pan-India delivery · COD available
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                100% secure payments
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Dispatched in 2–4 business days
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {SITE.addressLines.join(', ')}
              </span>
            </div>
          </div>

          {/* Column 2 — Shop */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-white/40 mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-sans text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Services */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-white/40 mb-4">
              Services
            </h3>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-sans text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Help & Policies + Contact */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-white/40 mb-4">
              Help &amp; Policies
            </h3>
            <ul className="space-y-2.5">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-sans text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact details */}
            <div className="mt-6 space-y-2.5">
              <a
                href={SITE.phoneTel}
                className="flex items-center gap-2 text-sm font-sans text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {SITE.phone}
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-2 text-sm font-sans text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {SITE.email}
              </a>
              <p className="flex items-center gap-2 text-xs font-sans text-white/40">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {SITE.supportHours}
              </p>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-sans text-white/40 text-center sm:text-left">
            © 2026 {SITE.copyrightName}. All rights reserved. · Made in India 🇮🇳
          </p>

          {/* Payment methods / trust icons */}
          <div className="flex items-center gap-3 text-xs font-sans text-white/40">
            <span>Secure payments:</span>
            <span className="flex items-center gap-2">
              {/* UPI */}
              <span className="bg-white/10 rounded px-2 py-0.5 text-white/60 font-display font-bold text-[10px] tracking-wide">UPI</span>
              {/* Cards */}
              <span className="bg-white/10 rounded px-2 py-0.5 text-white/60 font-display font-bold text-[10px] tracking-wide">CARD</span>
              {/* COD */}
              <span className="bg-white/10 rounded px-2 py-0.5 text-white/60 font-display font-bold text-[10px] tracking-wide">COD</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
