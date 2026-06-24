import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrderByOrderNumber } from '@/lib/supabase/orders'

interface Props {
  params: { orderNumber: string }
}

/**
 * Server component — fetches the real order from the DB.
 * If no order with the given number exists, renders 404 (no auth required;
 * guest checkout must keep working).
 */
export default async function OrderConfirmationPage({ params }: Props) {
  const order = await getOrderByOrderNumber(params.orderNumber)

  if (!order) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-display font-bold mb-4">Order Confirmed!</h1>
      <p className="text-gray-400 mb-2">Thank you for your order</p>
      <p className="text-sm text-gray-500 mb-8">Order #{order.order_number}</p>

      <div className="card p-6 mb-4 text-left">
        <div className="flex justify-between items-center mb-2">
          <span className="text-charcoal-light text-sm">Order Total</span>
          <span className="font-semibold text-charcoal">
            ₹{order.total.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-charcoal-light text-sm">Payment Status</span>
          <span
            className={`text-sm font-medium capitalize ${
              order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
            }`}
          >
            {order.payment_status}
          </span>
        </div>
      </div>

      <div className="card p-6 mb-8 text-left">
        <h2 className="font-semibold mb-2">What happens next?</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>✅ Payment confirmed</li>
          <li>🖨️ Your order enters the print queue</li>
          <li>📦 We&apos;ll ship within 3-5 business days</li>
          <li>📱 Track updates via WhatsApp</li>
        </ul>
      </div>
      <div className="flex gap-4 justify-center">
        <Link href="/products" className="btn-primary">Continue Shopping</Link>
        <Link href="/account/orders" className="btn-secondary">View Orders</Link>
      </div>
    </div>
  )
}
