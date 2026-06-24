import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AnnouncementBar } from '@/components/layout/announcement-bar'
import { WhatsAppFloat } from '@/components/layout/whatsapp-float'
import { CartProvider } from '@/components/cart/cart-context'

export const metadata: Metadata = {
  title: 'Tathastu | If it exists, we can print it.',
  description: 'Premium 3D printed home décor, lamps, planters, workspace organisers, and custom creations. Precision printing from India. If it exists, we can print it.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  )
}
