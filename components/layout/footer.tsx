'use client'

import Link from 'next/link'
import { useState } from 'react'

function FooterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/20 md:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 md:cursor-default"
      >
        <h3 className="text-sm font-semibold uppercase tracking-widest">{title}</h3>
        <span className="md:hidden text-xl">{open ? '−' : '+'}</span>
      </button>
      <div className={`${open ? 'block' : 'hidden'} md:block pb-4 md:pb-0`}>
        {children}
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="section-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:grid md:grid-cols-4 md:gap-8">
          <FooterSection title="About Us">
            <p className="text-sm text-white/70 leading-relaxed">
              Premium 3D printing from India. If it exists, we can print it — layer by layer.
            </p>
          </FooterSection>

          <FooterSection title="Collection">
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/products?category=miniatures" className="hover:text-white transition-colors">Miniatures</Link></li>
              <li><Link href="/products?category=lamps" className="hover:text-white transition-colors">Lamps</Link></li>
              <li><Link href="/products?category=signs" className="hover:text-white transition-colors">Signs</Link></li>
              <li><Link href="/custom" className="hover:text-white transition-colors">Custom Orders</Link></li>
            </ul>
          </FooterSection>

          <FooterSection title="Company">
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/bulk-order" className="hover:text-white transition-colors">Bulk Orders</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </FooterSection>

          <FooterSection title="Need Help">
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><a href="https://wa.me/918882065253" target="_blank" rel="noopener" className="hover:text-white transition-colors">WhatsApp Us</a></li>
            </ul>
          </FooterSection>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20 text-center text-sm text-white/50">
          © 2026 Layerix. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
