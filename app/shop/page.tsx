/**
 * /shop — all-products landing (alias for /products with clean URL).
 * Redirects to /products so we don't duplicate the catalog logic.
 */
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse our complete collection of 3D printed gifts and keepsakes.',
  // Canonical the redirect target so crawlers consolidate equity on /products.
  alternates: { canonical: '/products' },
  robots: { index: true, follow: true },
}

export default function ShopPage() {
  redirect('/products')
}
