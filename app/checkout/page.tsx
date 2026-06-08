import { CheckoutForm } from '@/components/checkout/checkout-form'
import { OrderSummary } from '@/components/checkout/order-summary'

export default function CheckoutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <CheckoutForm />
        </div>
        <div className="lg:col-span-2">
          <OrderSummary />
        </div>
      </div>
    </div>
  )
}
