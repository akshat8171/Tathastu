'use client'

import { FormEvent, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import {
  ITEM_DELIVERED_STATUSES,
  PRINT_STATUSES,
  SHEET_PAYMENT_STATUSES,
  defaultCollectedForPaymentStatus,
  lineTotal,
  paymentPendingAmount,
  type SheetPaymentStatus,
} from '@/lib/offline-orders'

const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand'

function todayIsoDate(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value
  return `${year}-${month}-${day}`
}

export default function NewOfflineOrderPage() {
  const router = useRouter()
  const [productName, setProductName] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [orderDate, setOrderDate] = useState(todayIsoDate)
  const [printStatus, setPrintStatus] = useState<(typeof PRINT_STATUSES)[number]>('Not Started')
  const [paymentStatus, setPaymentStatus] = useState<SheetPaymentStatus>('Payment Pending')
  const [itemDelivered, setItemDelivered] = useState<(typeof ITEM_DELIVERED_STATUSES)[number]>('Not started')
  const [quantity, setQuantity] = useState('1')
  const [cost, setCost] = useState('')
  const [price, setPrice] = useState('')
  const [collected, setCollected] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const qty = Math.max(0, Number(quantity) || 0)
  const unitPrice = Number(price) || 0
  const total = lineTotal(unitPrice, qty)
  const collectedNumber = collected === ''
    ? defaultCollectedForPaymentStatus({ sheetPayment: paymentStatus, total })
    : Number(collected) || 0
  const pending = paymentPendingAmount(total, collectedNumber)

  const canSubmit = useMemo(() => {
    return productName.trim() && customerName.trim() && qty > 0 && unitPrice > 0 && !submitting
  }, [productName, customerName, qty, unitPrice, submitting])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName.trim(),
          customer_name: customerName.trim(),
          order_date: orderDate,
          print_status: printStatus,
          payment_status: paymentStatus,
          item_delivered: itemDelivered,
          quantity: qty,
          price: unitPrice,
          total,
          cost: cost === '' ? undefined : Number(cost),
          amount_collected: collectedNumber,
          customer_phone: phone.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.status === 401) {
        window.location.href = '/login?next=/admin/orders/new'
        return
      }
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to create order')
      }
      router.push(`/admin/orders/${data.order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Back to orders">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-ink">Add offline order</h1>
          <p className="text-muted mt-1">Same fields as Organized Products on the workshop sheet</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-card2 shadow-card p-6 space-y-5">
        <Field label="Product Name">
          <input
            required
            className={inputClass}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Name rakhi"
          />
        </Field>
        <Field label="Customer Name">
          <input
            required
            className={inputClass}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </Field>
        <Field label="Order Date">
          <input
            required
            type="date"
            className={inputClass}
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Print Status">
            <select className={inputClass} value={printStatus} onChange={(e) => setPrintStatus(e.target.value as typeof printStatus)}>
              {PRINT_STATUSES.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field label="Payment Status">
            <select
              className={inputClass}
              value={paymentStatus}
              onChange={(e) => {
                const next = e.target.value as SheetPaymentStatus
                setPaymentStatus(next)
                setCollected('')
              }}
            >
              {SHEET_PAYMENT_STATUSES.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field label="Item Delivered">
            <select className={inputClass} value={itemDelivered} onChange={(e) => setItemDelivered(e.target.value as typeof itemDelivered)}>
              {ITEM_DELIVERED_STATUSES.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Quantity">
            <input
              required
              type="number"
              min={1}
              className={inputClass}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Field>
          <Field label="Cost">
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputClass}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="Optional"
            />
          </Field>
          <Field label="Price">
            <input
              required
              type="number"
              min={0.01}
              step="0.01"
              className={inputClass}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Total">
            <input className={inputClass} value={total ? String(total) : ''} readOnly />
          </Field>
          <Field label="Payment Recieved">
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputClass}
              value={collected}
              onChange={(e) => setCollected(e.target.value)}
              placeholder={String(collectedNumber)}
            />
          </Field>
          <Field label="Payment Pending">
            <input className={inputClass} value={String(pending)} readOnly />
          </Field>
        </div>
        <Field label="Phone (optional, for WhatsApp)">
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile"
          />
        </Field>
        <Field label="Notes (optional)">
          <textarea
            className={inputClass}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="bg-brand text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-600 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Create offline order'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-2">{label}</span>
      {children}
    </label>
  )
}
