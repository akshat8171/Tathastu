import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrderByOrderNumber } from '@/lib/supabase/orders'
import { getTrackingStatus } from '@/lib/tracking'

interface Props {
  params: { orderNumber: string }
}

const fmt = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

// ── Order status steps ────────────────────────────────────────────────────────
type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface TimelineStep {
  key: OrderStatus | 'placed'
  label: string
  description: string
}

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'placed', label: 'Order Placed', description: 'We received your order' },
  { key: 'paid', label: 'Payment Confirmed', description: 'Payment successfully processed' },
  { key: 'processing', label: 'Being Printed', description: 'Your item is in the 3D print queue' },
  { key: 'shipped', label: 'Shipped', description: 'Your order is on its way' },
  { key: 'delivered', label: 'Delivered', description: 'Order delivered successfully' },
]

function getStepIndex(status: string): number {
  const map: Record<string, number> = {
    pending: 0,     // placed but not paid
    paid: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
    cancelled: -1,  // cancelled steps handled separately
  }
  return map[status] ?? 0
}

function OrderTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <p className="font-display font-semibold text-red-700 text-sm">Order Cancelled</p>
          <p className="text-xs text-red-600 font-sans mt-0.5">This order has been cancelled.</p>
        </div>
      </div>
    )
  }

  const currentIndex = getStepIndex(status)
  // For COD / pending orders, show "placed" as the first completed step
  const effectiveIndex = status === 'pending' ? 0 : currentIndex

  return (
    <div className="relative" aria-label="Order status timeline">
      {TIMELINE_STEPS.map((step, idx) => {
        const completed = idx <= effectiveIndex
        const active = idx === effectiveIndex
        const last = idx === TIMELINE_STEPS.length - 1

        return (
          <div key={step.key} className="flex items-start gap-4">
            {/* Step indicator + connector */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  completed
                    ? 'bg-brand border-brand'
                    : active
                    ? 'bg-white border-brand'
                    : 'bg-white border-gray-200'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                {completed ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-gray-300" aria-hidden="true" />
                )}
              </div>
              {!last && (
                <div
                  className={`w-0.5 h-8 mt-0.5 ${completed ? 'bg-brand' : 'bg-gray-200'}`}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Step content */}
            <div className={`pb-6 ${last ? 'pb-0' : ''}`}>
              <p className={`font-display font-semibold text-sm ${completed ? 'text-ink' : 'text-muted'}`}>
                {step.label}
              </p>
              <p className={`font-sans text-xs mt-0.5 ${completed ? 'text-muted' : 'text-muted/60'}`}>
                {step.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
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

  // Fetch tracking status (mock when TRACKING_PROVIDER unset)
  const tracking = await getTrackingStatus(order)

  // COD detection: payment_method may be 'cod' from the DB even though the
  // TypeScript union doesn't list it yet — cast to string for the comparison.
  const isCod =
    (order.payment_method as string) === 'cod' || order.payment_status !== 'paid'

  return (
    <main className="container-page py-16">
      <div className="max-w-xl mx-auto">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center ${
              order.status === 'cancelled'
                ? 'bg-red-100'
                : isCod ? 'bg-amber-100' : 'bg-brand/10'
            }`}
          >
            {order.status === 'cancelled' ? (
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : isCod ? (
              /* Truck / delivery icon for COD */
              <svg
                className="w-10 h-10 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
            ) : (
              /* Checkmark for paid */
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
            )}
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          {isCod ? (
            <>
              <h1 className="text-3xl font-display font-bold text-ink mb-2">
                Order Placed!
              </h1>
              <p className="text-muted font-sans">
                Thank you for your order — please keep{' '}
                <span className="font-semibold text-amber-700">
                  {fmt.format(order.total)}
                </span>{' '}
                ready to pay on delivery.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-display font-bold text-ink mb-2">
                Order Confirmed!
              </h1>
              <p className="text-muted font-sans">
                Thank you for your order, it&apos;s in the print queue.
              </p>
            </>
          )}
          <p className="text-sm text-muted font-sans mt-1">
            Order{' '}
            <span className="font-display font-semibold text-ink">#{order.order_number}</span>
          </p>
        </div>

        {/* COD notice banner */}
        {isCod && order.status !== 'cancelled' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-4 font-sans text-sm text-amber-800">
            <p className="font-semibold mb-0.5">Pay on Delivery</p>
            <p>
              Your order will be delivered within 3–5 business days. Please have{' '}
              <span className="font-semibold">{fmt.format(order.total)}</span> ready
              (cash or UPI) when the delivery arrives.
            </p>
          </div>
        )}

        {/* ── Order Status Timeline ────────────────────────────────────────── */}
        <div className="card p-6 mb-4">
          <h2 className="font-display font-semibold text-ink mb-5">Order Status</h2>
          <OrderTimeline status={order.status} />

          {/* Tracking info when available */}
          {tracking.trackingNumber && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm font-sans">
                <span className="text-muted">Tracking number</span>
                {tracking.trackingUrl ? (
                  <a
                    href={tracking.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand hover:underline"
                  >
                    {tracking.trackingNumber}
                  </a>
                ) : (
                  <span className="font-semibold text-ink">{tracking.trackingNumber}</span>
                )}
              </div>
              {tracking.carrier && (
                <div className="flex items-center justify-between text-sm font-sans mt-1.5">
                  <span className="text-muted">Carrier</span>
                  <span className="font-semibold text-ink">{tracking.carrier}</span>
                </div>
              )}
              {tracking.estimatedDelivery && (
                <div className="flex items-center justify-between text-sm font-sans mt-1.5">
                  <span className="text-muted">Est. delivery</span>
                  <span className="font-semibold text-ink">{tracking.estimatedDelivery}</span>
                </div>
              )}
              {tracking.isMock && (
                <p className="text-xs text-muted/60 font-sans mt-2">
                  Live tracking available after shipment.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Order details card */}
        <div className="card p-6 mb-4">
          <h2 className="font-display font-semibold text-ink mb-4">Order details</h2>
          <div className="space-y-3 text-sm font-sans">
            {/* Subtotal */}
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="text-ink">{fmt.format(order.subtotal)}</span>
            </div>

            {/* Discount (only if > 0) */}
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted">Discount</span>
                <span className="font-semibold text-green-600">
                  − {fmt.format(order.discount)}
                </span>
              </div>
            )}

            {/* Shipping */}
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span className="text-ink">
                {order.shipping === 0 ? 'Free' : fmt.format(order.shipping)}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="text-muted">Order total</span>
              <span className="font-display font-bold text-ink">
                {fmt.format(order.total)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted">Payment status</span>
              <span
                className={`font-semibold capitalize ${
                  order.payment_status === 'paid' ? 'text-brand' : 'text-amber-600'
                }`}
              >
                {isCod ? 'Pay on delivery' : order.payment_status}
              </span>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="card p-6 mb-8">
          <h2 className="font-display font-semibold text-ink mb-4">What happens next?</h2>
          <ul className="space-y-3 font-sans text-sm">
            <li className="flex items-start gap-3">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isCod ? 'bg-amber-100' : 'bg-brand/10'
                }`}
              >
                {isCod ? (
                  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </span>
              <span className="text-ink">
                {isCod
                  ? "Order confirmed — we'll start printing right away."
                  : 'Payment confirmed — your order is secured.'}
              </span>
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
            {isCod && (
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                  </svg>
                </span>
                <span className="text-ink">
                  Keep <span className="font-semibold">{fmt.format(order.total)}</span> ready
                  (cash or UPI) when the delivery arrives.
                </span>
              </li>
            )}
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
          <Link href="/account" className="btn-outline text-center">
            View My Orders
          </Link>
        </div>
      </div>
    </main>
  )
}
