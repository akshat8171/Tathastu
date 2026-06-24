'use client'

import { useState } from 'react'
import { useCart } from '@/components/cart/cart-context'
import { RazorpayCheckout } from '@/components/payment/razorpay-checkout'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { RazorpayResponse } from '@/lib/razorpay'

// ── Free-delivery threshold (mirrors lib/pricing.ts) ─────────────────────────
const FREE_SHIPPING_THRESHOLD = 999

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

export function CheckoutForm() {
  const { items, clearCart } = useCart()
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [step, setStep] = useState<'details' | 'payment'>('details')

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : 99
  const total = subtotal + shipping

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep('payment')
  }

  async function handlePaymentSuccess(response: RazorpayResponse) {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: form,
        items: items.map(i => ({
          product_id: i.id,
          product_name: i.name,
          product_image: i.image,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal,
        shipping,
        total,
        payment: response,
      }),
    })

    const data = await res.json()
    if (data.success) {
      clearCart()
      router.push(`/order-confirmation/${data.orderNumber}`)
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

  return (
    <div className="space-y-6">
      {step === 'details' ? (
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
          </SectionCard>

          <Button type="submit" variant="primary" fullWidth size="lg">
            Continue to Payment
          </Button>
        </form>
      ) : (
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

          {/* Payment button */}
          <SectionCard title="Payment">
            <p className="text-sm text-muted font-sans mb-5">
              Pay securely via Razorpay — UPI, credit/debit cards, and wallets accepted.
            </p>
            <RazorpayCheckout
              amount={total}
              customerName={form.name}
              customerPhone={form.phone}
              customerEmail={form.email}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={() => alert('Payment failed. Please try again.')}
            />
          </SectionCard>
        </div>
      )}
    </div>
  )
}
