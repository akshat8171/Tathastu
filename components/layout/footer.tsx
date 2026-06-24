import Link from 'next/link'

const shopLinks = [
  { href: '/products?category=lamps', label: 'Lamps & Lighting' },
  { href: '/products?category=organizers', label: 'Desk & Workspace' },
  { href: '/products?category=planters', label: 'Planters & Garden' },
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

const contactInfo = {
  phone: '+91 91548 92790',
  phoneTel: 'tel:+919154892790',
  email: 'layerix.in@gmail.com',
  whatsapp: 'https://wa.me/919154892790',
}

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
          LAYERIX
        </span>
      </div>

      <div className="container-page relative py-14">
        {/* ── Top grid ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Column 1 — Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="font-display font-bold text-2xl text-white tracking-tight" aria-label="Layerix home">
              Layeri<span className="text-brand">x</span>
            </Link>
            <p className="mt-4 text-sm font-sans text-white/60 leading-relaxed">
              Premium 3D-printed home décor, workspace accessories, and custom prints — crafted layer by layer and shipped across India.
            </p>

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

          {/* Column 4 — Contact */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-white/40 mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={contactInfo.phoneTel}
                  className="flex items-center gap-2 text-sm font-sans text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {contactInfo.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-2 text-sm font-sans text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {contactInfo.email}
                </a>
              </li>
              <li>
                <a
                  href={contactInfo.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-sans text-white/70 hover:text-white transition-colors"
                  aria-label="Chat with us on WhatsApp"
                >
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp Us
                </a>
              </li>
              <li>
                <Link
                  href="/about"
                  className="flex items-center gap-2 text-sm font-sans text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About Layerix
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-sans text-white/40 text-center sm:text-left">
            © 2026 Layerix. All rights reserved.
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
