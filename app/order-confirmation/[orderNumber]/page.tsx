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
    <main className="container-page py-16">
      <div className="max-w-xl mx-auto">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-brand"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-ink mb-2">Order Confirmed!</h1>
          <p className="text-muted font-sans">Thank you for your order, it&apos;s in the print queue.</p>
          <p className="text-sm text-muted font-sans mt-1">
            Order{' '}
            <span className="font-display font-semibold text-ink">#{order.order_number}</span>
          </p>
        </div>

        {/* Order details card */}
        <div className="card p-6 mb-4">
          <h2 className="font-display font-semibold text-ink mb-4">Order details</h2>
          <div className="space-y-3 text-sm font-sans">
            <div className="flex justify-between">
              <span className="text-muted">Order total</span>
              <span className="font-display font-bold text-ink">
                ₹{order.total.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Payment status</span>
              <span
                className={`font-semibold capitalize ${
                  order.payment_status === 'paid' ? 'text-brand' : 'text-yellow-600'
                }`}
              >
                {order.payment_status}
              </span>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="card p-6 mb-8">
          <h2 className="font-display font-semibold text-ink mb-4">What happens next?</h2>
          <ul className="space-y-3 font-sans text-sm">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </span>
              <span className="text-ink">Payment confirmed — your order is secured.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5l10.5-6 10.5 6-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
                </svg>
              </span>
              <span className="text-ink">Your order enters the 3D print queue (printed to order).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
              </span>
              <span className="text-ink">Dispatched within 3–5 business days, pan-India.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </span>
              <span className="text-ink">Track your order via WhatsApp updates.</span>
            </li>
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products" className="btn-primary text-center">
            Continue Shopping
          </Link>
          <Link href="/account/orders" className="btn-outline text-center">
            View My Orders
          </Link>
        </div>
      </div>
    </main>
  )
}
