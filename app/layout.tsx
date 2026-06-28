import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AnnouncementBar } from '@/components/layout/announcement-bar'
import { WhatsAppFloat } from '@/components/layout/whatsapp-float'
import { CartProvider } from '@/components/cart/cart-context'
import { WishlistProvider } from '@/components/wishlist/wishlist-context'
import { CheckoutProvider } from '@/components/checkout/checkout-context'
import { getOrganizationSchema } from '@/lib/schema'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.tathastukeepsakes.in'),
  title: {
    default: '3D Printing India | Custom 3D Printed Gifts & Keepsakes | Tathastu Keepsakes',
    template: '%s | Tathastu Keepsakes',
  },
  description: 'Leading 3D printing service in India. Buy custom 3D printed gifts, personalised keepsakes, home decor & lamps. Custom 3D printing service from Agra. PAN India delivery. Order 3D printed gifts online.',
  keywords: [
    '3D printing India',
    'custom 3D printed gifts India',
    'personalized 3D printed gifts',
    '3D printing service',
    'personalised gifts India',
    '3D printed home decor',
    'custom keepsakes online India',
    '3D printing Agra',
    '3D printing Uttar Pradesh',
    '3D printed gifts online',
    'buy 3D printed items India',
    '3D printing service Agra',
    'custom 3D prints',
    '3D printed keychains',
    '3D printed lamps India',
    'custom gifts online India',
    '3D printing services near me',
    'personalized gifts Agra',
    '3D printed pooja items',
    '3D printed gaming accessories',
    'corporate gifts 3D printed',
    'bulk 3D printing orders',
  ],
  authors: [{ name: 'Tathastu Keepsakes' }],
  creator: 'Tathastu Keepsakes',
  publisher: 'Tathastu Keepsakes',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: '3D Printing India | Custom 3D Printed Gifts | Tathastu Keepsakes',
    description: 'Buy custom 3D printed gifts, keepsakes & home decor. Leading 3D printing service in India with PAN India delivery from Agra.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Tathastu Keepsakes',
    url: 'https://www.tathastukeepsakes.in',
    images: [
      {
        url: '/images/logo/logo-og.png',
        width: 1200,
        height: 630,
        alt: 'Tathastu Keepsakes - 3D Printing India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '3D Printing India | Custom 3D Printed Gifts | Tathastu Keepsakes',
    description: 'Leading 3D printing service in India. Custom 3D printed gifts, keepsakes & home decor with PAN India delivery.',
    images: ['/images/logo/logo-og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.tathastukeepsakes.in',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = getOrganizationSchema()

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Viewport for responsive design */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

        {/* Preconnect hints for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="preconnect" href="https://checkout.razorpay.com" />

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#0E7A66" />

        {/* Organization Schema JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <WishlistProvider>
            <CheckoutProvider>
              <AnnouncementBar />
              <Header />
              <main className="flex-1 animate-fade-in">
                {children}
              </main>
              <Footer />
              <WhatsAppFloat />
            </CheckoutProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  )
}
