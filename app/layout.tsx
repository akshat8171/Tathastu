import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CartProvider } from '@/components/cart/cart-context'

export const metadata: Metadata = {
  title: 'Layerix | If it exists, we can print it.',
  description: 'Premium 3D printed miniatures for tabletop gaming, painting, and collecting. If it exists, we can print it. Lifestyle-first presentation of handcrafted art pieces.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
