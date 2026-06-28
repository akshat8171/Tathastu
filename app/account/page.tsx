import Link from 'next/link'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getOrdersForUser } from '@/lib/supabase/account'
import { getOrderItems } from '@/lib/supabase/orders'
import type { Order, OrderItem } from '@/lib/supabase/client'

// ── Badge helpers ─────────────────────────────────────────────────────────────

type BadgeConfig = { label: string; className: string }

function getStatusBadge(order: Order): BadgeConfig {
  // payment_status takes priority for the most actionable signal.
  if (order.payment_status === 'paid') {
    if (order.status === 'delivered') {
      return { label: 'Delivered', className: 'bg-green-100 text-green-700' }
    }
    if (order.status === 'shipped') {
      return { label: 'Shipped', className: 'bg-blue-100 text-blue-700' }
    }
    if (order.status === 'cancelled') {
      return { label: 'Cancelled', className: 'bg-red-100 text-red-700' }
    }
    return { label: 'Paid', className: 'bg-green-100 text-green-700' }
  }
  if (order.payment_status === 'pending') {
    return { label: 'Pending payment', className: 'bg-amber-100 text-amber-700' }
  }
  if (order.payment_status === 'failed') {
    return { label: 'Payment failed', className: 'bg-red-100 text-red-700' }
  }
  if (order.payment_status === 'refunded') {
    return { label: 'Refunded', className: 'bg-purple-100 text-purple-700' }
  }
  // Fallback: use order.status
  if (order.status === 'shipped')    return { label: 'Shipped',   className: 'bg-blue-100 text-blue-700' }
  if (order.status === 'delivered')  return { label: 'Delivered', className: 'bg-green-100 text-green-700' }
  if (order.status === 'cancelled')  return { label: 'Cancelled', className: 'bg-red-100 text-red-700' }
  return { label: 'Processing', className: 'bg-gray-100 text-gray-600' }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ── Order card ────────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: Order
  items: OrderItem[]
}

function OrderCard({ order, items }: OrderCardProps) {
  const badge = getStatusBadge(order)

  // Build the item names snippet: up to 3, then "+N more"
  const MAX_SHOWN = 3
  const shown = items.slice(0, MAX_SHOWN)
  const extra = items.length - shown.length

  const itemsSnippet = shown
    .map(it => (it.quantity > 1 ? `${it.product_name} ×${it.quantity}` : it.product_name))
    .join(', ')

  const itemsLine = extra > 0 ? `${itemsSnippet}, +${extra} more` : itemsSnippet

  return (
    <Link
      href={`/order-confirmation/${order.order_number}`}
      className="block bg-white rounded-card2 shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
      aria-label={`View order ${order.order_number}`}
    >
      {/* Top row: order number + badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="font-display font-semibold text-ink text-sm">
          #{order.order_number}
        </p>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Date */}
      <p className="font-sans text-muted text-xs mb-3">{formatDate(order.created_at)}</p>

      {/* Items snippet */}
      {itemsLine && (
        <p className="font-sans text-ink/80 text-sm mb-4 line-clamp-2">{itemsLine}</p>
      )}

      {/* Bottom row: total + chevron */}
      <div className="flex items-center justify-between">
        <span className="font-display font-bold text-ink text-base">
          ₹{order.total.toLocaleString('en-IN')}
        </span>
        <svg
          className="w-4 h-4 text-muted group-hover:text-brand transition-colors"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyOrders() {
  return (
    <div className="bg-white rounded-card2 shadow-card p-10 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      </div>
      <div>
        <h2 className="font-display font-semibold text-ink text-lg mb-1">No orders yet</h2>
        <p className="font-sans text-muted text-sm">
          Your orders will appear here once you shop with us.
        </p>
      </div>
      <Link href="/products" className="btn-primary mt-2">
        Browse products
      </Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function MyOrdersPage() {
  const user = await requireAuth()
  const orders = await getOrdersForUser({ phone: user.phone, email: user.email })

  // Fetch items for all orders in parallel.
  const itemsLists: OrderItem[][] = await Promise.all(
    orders.map(o => getOrderItems(o.id))
  )

  return (
    <div>
      {/* Section heading */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-ink text-2xl">My Orders</h2>
        <p className="font-sans text-muted text-sm mt-0.5">
          {orders.length > 0
            ? `${orders.length} order${orders.length === 1 ? '' : 's'} placed`
            : 'Your order history'}
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order, idx) => (
            <OrderCard key={order.id} order={order} items={itemsLists[idx]} />
          ))}
        </div>
      )}
    </div>
  )
}
