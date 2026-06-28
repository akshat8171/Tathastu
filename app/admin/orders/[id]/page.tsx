'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  id: string
  product_name: string
  product_variant?: string
  product_image?: string
  price: number
  original_price?: number
  quantity: number
  subtotal: number
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
  status: string
  payment_method: string
  payment_status: string
  tracking_number?: string
  notes?: string
  created_at: string
  paid_at?: string
  shipped_at?: string
  delivered_at?: string
  cancelled_at?: string
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/orders/${orderId}`)
      if (!response.ok) throw new Error('Failed to fetch order')

      const data = await response.json()
      setOrder(data.order)
      setItems(data.items)
      setNewStatus(data.order.status)
      setTrackingNumber(data.order.tracking_number || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!order || newStatus === order.status) return

    try {
      setUpdating(true)
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          status: newStatus,
          trackingNumber: trackingNumber || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to update order')

      await fetchOrderDetails()
      alert('Order status updated successfully!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order')
    } finally {
      setUpdating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'paid':
        return <Clock className="w-5 h-5" />
      case 'processing':
        return <Package className="w-5 h-5" />
      case 'shipped':
        return <Truck className="w-5 h-5" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />
      case 'cancelled':
        return <XCircle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Order not found'}</p>
        <Link href="/admin/orders" className="text-brand hover:text-brand-600 mt-4 inline-block">
          Back to Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-ink">{order.order_number}</h1>
          <p className="text-muted mt-1">Order placed on {formatDate(order.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-card2 shadow-card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-display font-bold text-ink">Order Items</h2>
            </div>
            <div className="p-6 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-20 h-20 bg-panel rounded-lg overflow-hidden flex-shrink-0">
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-ink">{item.product_name}</h3>
                    {item.product_variant && (
                      <p className="text-sm text-muted mt-1">{item.product_variant}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted">Qty: {item.quantity}</span>
                      <span className="text-sm font-medium text-ink">{formatCurrency(item.price)} each</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-ink">{formatCurrency(item.subtotal)}</p>
                    {item.original_price && item.original_price > item.price && (
                      <p className="text-sm text-muted line-through">
                        {formatCurrency(item.original_price * item.quantity)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="space-y-2 max-w-sm ml-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-ink">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Discount</span>
                    <span className="text-green-600">-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Tax</span>
                    <span className="text-ink">{formatCurrency(order.tax)}</span>
                  </div>
                )}
                {order.shipping > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Shipping</span>
                    <span className="text-ink">{formatCurrency(order.shipping)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300">
                  <span className="text-ink">Total</span>
                  <span className="text-ink">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-card2 shadow-card p-6">
            <h2 className="text-xl font-display font-bold text-ink mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted">Name</p>
                <p className="text-ink font-medium mt-1">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Email</p>
                <p className="text-ink font-medium mt-1">{order.customer_email}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Phone</p>
                <p className="text-ink font-medium mt-1">{order.customer_phone}</p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-muted">Order Notes</p>
                <p className="text-ink mt-1">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-white rounded-card2 shadow-card p-6">
            <h2 className="text-xl font-display font-bold text-ink mb-4">Update Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {newStatus === 'shipped' && (
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              )}

              <button
                onClick={handleUpdateStatus}
                disabled={updating || newStatus === order.status}
                className="w-full bg-brand text-white py-2 rounded-lg font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-card2 shadow-card p-6">
            <h2 className="text-xl font-display font-bold text-ink mb-4">Order Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <p className="font-medium text-ink capitalize">{order.status}</p>
                  <p className="text-sm text-muted">Current Status</p>
                </div>
              </div>

              {order.delivered_at && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-ink">Delivered</p>
                    <p className="text-sm text-muted">{formatDate(order.delivered_at)}</p>
                  </div>
                </div>
              )}

              {order.shipped_at && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-ink">Shipped</p>
                    <p className="text-sm text-muted">{formatDate(order.shipped_at)}</p>
                    {order.tracking_number && (
                      <p className="text-xs text-muted mt-1">Tracking: {order.tracking_number}</p>
                    )}
                  </div>
                </div>
              )}

              {order.paid_at && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-ink">Paid</p>
                    <p className="text-sm text-muted">{formatDate(order.paid_at)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-100 text-gray-800">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-ink">Order Placed</p>
                  <p className="text-sm text-muted">{formatDate(order.created_at)}</p>
                </div>
              </div>

              {order.cancelled_at && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-100 text-red-800">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-ink">Cancelled</p>
                    <p className="text-sm text-muted">{formatDate(order.cancelled_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-card2 shadow-card p-6">
            <h2 className="text-xl font-display font-bold text-ink mb-4">Payment Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted">Method</span>
                <span className="text-sm font-medium text-ink uppercase">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Status</span>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                  order.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.payment_status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
