'use client'

import { usePathname, useSelectedLayoutSegment } from 'next/navigation'
import { AnnouncementBar } from '@/components/layout/announcement-bar'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WhatsAppFloat } from '@/components/layout/whatsapp-float'

/**
 * Storefront announcement, header, footer, and WhatsApp chip.
 *
 * Admin lives under the same root layout, so this must omit chrome there.
 * Hiding it with CSS after paint left the footer in document flow (and on
 * top of the fixed admin shell) — skip the markup instead.
 *
 * `useSelectedLayoutSegment()` is the source of truth: it reads the first
 * child of this root layout (`admin` vs `products` vs null). `usePathname()`
 * can be empty on the first paint of a client layout, which would flash the
 * shop footer under the admin shell.
 */
export function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false
  const normalized = pathname.replace(/\/+$/, '') || '/'
  return normalized === '/admin' || normalized.startsWith('/admin/')
}

export function isAdminSegment(segment: string | null): boolean {
  return segment === 'admin'
}

export function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment()
  const pathname = usePathname()

  if (isAdminSegment(segment) || isAdminPath(pathname)) {
    return <>{children}</>
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
