import { CheckoutForm } from '@/components/checkout/checkout-form'
import { OrderSummary } from '@/components/checkout/order-summary'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout — Tathastu Keepsakes',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutPage() {
  return (
    <main className="container-page py-10">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-ink">Checkout</h1>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <p className="text-muted font-sans text-sm">
            Secure checkout powered by Razorpay
          </p>
          <div className="hidden sm:block w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2 text-xs text-muted font-sans">
            <span>COD</span>
            <span>·</span>
            <span>UPI</span>
            <span>·</span>
            <span>Cards</span>
            <span>·</span>
            <span>Wallets</span>
          </div>
        </div>
      </div>

      {/* Two-column layout: form (left) + summary (right).
          The applied-coupon state is shared via CheckoutProvider (now hoisted
          to the root layout) so a coupon entered on the cart page carries into
          checkout, and the discount shown in the summary is the same one the
          order is placed with (and charged via Razorpay). */}
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <CheckoutForm />
        </div>
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <OrderSummary />
          </div>
        </div>
      </div>
    </main>
  )
}
