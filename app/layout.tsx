import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CartProvider } from '@/components/cart/cart-context'

export const metadata: Metadata = {
  title: 'Layerix | If it exists, we can print it.',
  description: 'Premium 3D printed miniatures, lamps, signs, and custom creations. Precision printing from India. If it exists, we can print it.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
