'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/components/cart/cart-context'
import { useCheckout } from '@/components/checkout/checkout-context'
import { RazorpayCheckout } from '@/components/payment/razorpay-checkout'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useRouter } from 'next/navigation'
import { RazorpayResponse } from '@/lib/razorpay'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/lib/pricing'

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// ── Shared input styles ───────────────────────────────────────────────────────
const inputCls =
  'w-full px-4 py-3 rounded-xl bg-surface border border-gray-200 text-ink placeholder-muted/60 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-colors'

// ── Section card wrapper ──────────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h2 className="font-display font-semibold text-lg text-ink mb-5">{title}</h2>
      {children}
    </div>
  )
}

// ── Local interfaces for API contracts ────────────────────────────────────────
interface SavedAddress {
  id: string
  address_type: 'billing' | 'shipping'
  name: string
  phone: string
  address_line: string
  city: string
  state: string
  pincode: string
}

interface PrefillContact {
  name: string
  phone: string
  email: string
}

interface PrefillResponse {
  authenticated: boolean
  contact: PrefillContact | null
  addresses: SavedAddress[]
}

type PaymentMethod = 'razorpay' | 'cod'

// ── CheckoutForm ──────────────────────────────────────────────────────────────
export function CheckoutForm() {
  const { items, clearCart } = useCart()
  const { appliedCoupon } = useCheckout()
  const router = useRouter()

  // ── Prefill / address-picker state ───────────────────────────────────────
  const [prefillLoading, setPrefillLoading] = useState(true)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new')

  // ── Form state ───────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })

  // ── Payment method ───────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay')

  // ── Checkout step ────────────────────────────────────────────────────────
  const [step, setStep] = useState<'details' | 'payment'>('details')

  // ── COD submission state ─────────────────────────────────────────────────
  const [codSubmitting, setCodSubmitting] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  // ── Totals ────────────────────────────────────────────────────────────────
  // appliedCoupon is shared with OrderSummary via CheckoutProvider so the
  // discount charged here (and via Razorpay) matches what the summary shows.
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const discount = appliedCoupon?.discount ?? 0
  const total = Math.max(0, subtotal - discount + shipping)
  const couponCode = appliedCoupon?.code

  // ── On mount: fetch prefill ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function fetchPrefill() {
      try {
        const res = await fetch('/api/account/checkout-prefill')
        const data: PrefillResponse = await res.json()
        if (cancelled) return

        if (data.authenticated && data.contact) {
          setForm(prev => ({
            ...prev,
            name: data.contact!.name,
            phone: data.contact!.phone,
            email: data.contact!.email,
          }))
        }

        if (data.authenticated && data.addresses.length > 0) {
          setSavedAddresses(data.addresses)
          // Default to the first saved address
          const first = data.addresses[0]
          setSelectedAddressId(first.id)
          setForm(prev => ({
            ...prev,
            name: data.contact?.name ?? prev.name,
            phone: data.contact?.phone ?? prev.phone,
            email: data.contact?.email ?? prev.email,
            address: first.address_line,
            city: first.city,
            state: first.state,
            pincode: first.pincode,
          }))
        }
      } catch {
        // Prefill failure is non-fatal — blank form is fine
      } finally {
        if (!cancelled) setPrefillLoading(false)
      }
    }
    fetchPrefill()
    return () => { cancelled = true }
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────────
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSelectSavedAddress(addr: SavedAddress) {
    setSelectedAddressId(addr.id)
    setForm(prev => ({
      ...prev,
      address: addr.address_line,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    }))
  }

  function handleSelectNewAddress() {
    setSelectedAddressId('new')
    setForm(prev => ({
      ...prev,
      address: '',
      city: '',
      state: '',
      pincode: '',
    }))
  }

  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault()
    setOrderError(null)
    setStep('payment')
  }

  // ── Map CartItem → order item shape expected by /api/orders ──────────────
  function buildOrderItems() {
    return items.map(item => ({
      product_id: item.id,
      product_name: item.name,
      product_image: item.image || undefined,
      product_variant: item.variant || undefined,
      price: item.price,
      quantity: item.quantity,
    }))
  }

  // ── Razorpay online payment success handler ───────────────────────────────
  async function handlePaymentSuccess(response: RazorpayResponse) {
    setOrderError(null)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        items: buildOrderItems(),
        payment_method: 'razorpay' as const,
        couponCode,
        payment: response,
      }),
    })

    const data = await res.json()
    if (data.success) {
      clearCart()
      router.push(`/order-confirmation/${data.orderNumber}`)
    } else {
      setOrderError(data.error ?? 'Something went wrong. Please try again.')
    }
  }

  // ── COD place-order handler ────────────────────────────────────────────────
  async function handleCodSubmit() {
    setOrderError(null)
    setCodSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: form.name,
            phone: form.phone,
            email: form.email,
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
          items: buildOrderItems(),
          payment_method: 'cod' as const,
          couponCode,
        }),
      })
      const data = await res.json()
      if (data.success) {
        clearCart()
        router.push(`/order-confirmation/${data.orderNumber}`)
      } else {
        setOrderError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setOrderError('Network error. Please check your connection and try again.')
    } finally {
      setCodSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted font-sans mb-6">Your cart is empty</p>
        <Button variant="primary" href="/products">Shop now</Button>
      </div>
    )
  }

  // ── Prefill loading skeleton ──────────────────────────────────────────────
  if (prefillLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" className="text-brand" label="Loading checkout" />
      </div>
    )
  }

  // ── Details step ──────────────────────────────────────────────────────────
  if (step === 'details') {
    return (
      <form onSubmit={handleDetailsSubmit} className="space-y-6">
        {/* Contact */}
        <SectionCard title="Contact">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs font-sans font-medium text-muted mb-1.5 uppercase tracking-wide">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                required
                autoComplete="name"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-xs font-sans font-medium text-muted mb-1.5 uppercase tracking-wide">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                required
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                autoComplete="tel"
                inputMode="numeric"
                className={inputCls}
              />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="email" className="block text-xs font-sans font-medium text-muted mb-1.5 uppercase tracking-wide">
              Email <span className="text-muted/60">(optional)</span>
            </label>
            <input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="rahul@example.com"
              type="email"
              autoComplete="email"
              className={inputCls}
            />
          </div>
        </SectionCard>

        {/* Shipping address */}
        <SectionCard title="Shipping Address">
          {/* Saved-address picker (only shown for authenticated users with saved addresses) */}
          {savedAddresses.length > 0 && (
            <div className="mb-5 space-y-2">
              {savedAddresses.map(addr => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    selectedAddressId === addr.id
                      ? 'border-brand bg-brand/5'
                      : 'border-gray-200 hover:border-brand/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="saved-address"
                    value={addr.id}
                    checked={selectedAddressId === addr.id}
                    onChange={() => handleSelectSavedAddress(addr)}
                    className="mt-0.5 accent-brand flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-semibold text-ink">{addr.name}</p>
                    <p className="text-xs text-muted font-sans mt-0.5">{addr.phone}</p>
                    <p className="text-xs text-muted font-sans mt-0.5 leading-relaxed">
                      {addr.address_line}, {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                  </div>
                  {addr.address_type === 'shipping' && (
                    <span className="text-xs font-sans font-medium text-brand bg-brand/10 rounded-full px-2 py-0.5 flex-shrink-0">
                      Shipping
                    </span>
                  )}
                </label>
              ))}

              {/* "Use a new address" option */}
              <label
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  selectedAddressId === 'new'
                    ? 'border-brand bg-brand/5'
                    : 'border-gray-200 hover:border-brand/40'
                }`}
              >
                <input
                  type="radio"
                  name="saved-address"
                  value="new"
                  checked={selectedAddressId === 'new'}
                  onChange={handleSelectNewAddress}
                  className="accent-brand flex-shrink-0"
                />
                <span className="text-sm font-sans font-medium text-ink">Use a new address</span>
              </label>
            </div>
          )}

          {/* Address fields: always shown for guests; shown for "new" selection for logged-in */}
          {(savedAddresses.length === 0 || selectedAddressId === 'new') && (
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-xs font-sans font-medium text-muted mb-1.5 uppercase tracking-wide">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="House/Flat no., Street, Colony"
                  required
                  rows={3}
                  autoComplete="street-address"
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-xs font-sans font-medium text-muted mb-1.5 uppercase tracking-wide">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    required
                    autoComplete="address-level2"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-xs font-sans font-medium text-muted mb-1.5 uppercase tracking-wide">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="state"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                    required
                    autoComplete="address-level1"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="pincode" className="block text-xs font-sans font-medium text-muted mb-1.5 uppercase tracking-wide">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="400001"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        <Button type="submit" variant="primary" fullWidth size="lg">
          Continue to Payment
        </Button>
      </form>
    )
  }

  // ── Payment step ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Delivery summary */}
      <SectionCard title="Delivery Details">
        <div className="text-sm font-sans">
          <p className="font-display font-semibold text-ink">{form.name}</p>
          <p className="text-muted mt-0.5">{form.phone}</p>
          <p className="text-muted mt-1 leading-relaxed">
            {form.address}, {form.city}, {form.state} — {form.pincode}
          </p>
        </div>
        <button
          onClick={() => setStep('details')}
          className="text-brand text-sm font-sans hover:underline mt-3"
        >
          Edit details
        </button>
      </SectionCard>

      {/* Order total recap */}
      <div className="card p-5">
        <div className="flex justify-between text-sm font-sans text-muted">
          <span>Subtotal</span>
          <span className="text-ink font-semibold">{formatINR(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm font-sans text-muted mt-1.5">
            <span>
              Discount{couponCode ? ` (${couponCode})` : ''}
            </span>
            <span className="font-semibold text-green-600">−{formatINR(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-sans text-muted mt-1.5">
          <span>Shipping</span>
          {shipping === 0 ? (
            <span className="font-semibold text-brand">FREE</span>
          ) : (
            <span className="text-ink font-semibold">{formatINR(shipping)}</span>
          )}
        </div>
        <div className="flex justify-between font-display font-bold text-lg text-ink border-t border-gray-100 mt-3 pt-3">
          <span>Total</span>
          <span className="text-brand">{formatINR(total)}</span>
        </div>
      </div>

      {/* Payment method selector */}
      <SectionCard title="Payment Method">
        <div className="space-y-3">
          {/* Pay Online */}
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
              paymentMethod === 'razorpay'
                ? 'border-brand bg-brand/5'
                : 'border-gray-200 hover:border-brand/40'
            }`}
          >
            <input
              type="radio"
              name="payment-method"
              value="razorpay"
              checked={paymentMethod === 'razorpay'}
              onChange={() => setPaymentMethod('razorpay')}
              className="mt-0.5 accent-brand flex-shrink-0"
            />
            <div>
              <p className="text-sm font-display font-semibold text-ink">
                Pay Online
              </p>
              <p className="text-xs text-muted font-sans mt-0.5">
                UPI, Credit/Debit Cards, Netbanking, Wallets — via Razorpay
              </p>
            </div>
          </label>

          {/* Cash on Delivery */}
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
              paymentMethod === 'cod'
                ? 'border-brand bg-brand/5'
                : 'border-gray-200 hover:border-brand/40'
            }`}
          >
            <input
              type="radio"
              name="payment-method"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
              className="mt-0.5 accent-brand flex-shrink-0"
            />
            <div>
              <p className="text-sm font-display font-semibold text-ink">
                Cash on Delivery
              </p>
              <p className="text-xs text-muted font-sans mt-0.5">
                Pay in cash when your order arrives
              </p>
            </div>
          </label>
        </div>

        {/* Error message */}
        {orderError && (
          <p className="mt-4 text-sm text-red-600 font-sans bg-red-50 rounded-lg px-4 py-3">
            {orderError}
          </p>
        )}

        <div className="mt-5">
          {paymentMethod === 'razorpay' ? (
            <RazorpayCheckout
              amount={total}
              customerName={form.name}
              customerPhone={form.phone}
              customerEmail={form.email}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={() => setOrderError('Payment failed. Please try again.')}
            />
          ) : (
            <button
              onClick={handleCodSubmit}
              disabled={codSubmitting}
              className="btn-primary w-full text-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {codSubmitting ? (
                <>
                  <Spinner size="sm" className="text-white" label="Placing order" />
                  Placing Order…
                </>
              ) : (
                `Place Order — ${formatINR(total)}`
              )}
            </button>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
