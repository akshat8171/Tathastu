import { CheckoutForm } from '@/components/checkout/checkout-form'
import { OrderSummary } from '@/components/checkout/order-summary'

export const metadata = {
  title: 'Checkout — Layerix',
}

export default function CheckoutPage() {
  return (
    <main className="container-page py-10">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-ink">Checkout</h1>
        <p className="text-muted font-sans mt-1 text-sm">
          Secure checkout powered by Razorpay
        </p>
      </div>

      {/* Two-column layout: form (left) + summary (right) */}
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
