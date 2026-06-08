import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-brand-darker border-t border-surface-light/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎲</span>
              <span className="font-display font-bold text-xl gradient-text">LAYERIX</span>
            </div>
            <p className="text-sm text-gray-400">
              If it exists, we can print it. Premium 3D printing from India.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-display font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products?category=miniatures" className="hover:text-white transition-colors">Miniatures</Link></li>
              <li><Link href="/products?category=lamps" className="hover:text-white transition-colors">Lamps</Link></li>
              <li><Link href="/products?category=signs" className="hover:text-white transition-colors">Signs</Link></li>
              <li><Link href="/custom" className="hover:text-white transition-colors">Custom Orders</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/bulk-order" className="hover:text-white transition-colors">Bulk Orders</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-surface-light/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">&copy; 2026 Layerix. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://instagram.com/layerix" target="_blank" rel="noopener" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
            <a href="https://wa.me/918882065253" target="_blank" rel="noopener" className="text-gray-400 hover:text-white transition-colors">WhatsApp</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
