'use client'

import { usePathname } from 'next/navigation'
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
 */
export function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

export function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (isAdminPath(pathname)) {
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
