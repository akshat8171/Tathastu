'use client'

import { useState } from 'react'
import { useCart } from '@/components/cart/cart-context'
import { RazorpayCheckout } from '@/components/payment/razorpay-checkout'
import { useRouter } from 'next/navigation'
import { RazorpayResponse } from '@/lib/razorpay'

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
  const shipping = subtotal > 999 ? 0 : 99
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
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Your cart is empty</p>
        <a href="/products" className="btn-primary">Shop Now</a>
      </div>
    )
  }

  return (
    <div>
      {step === 'details' ? (
        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          <h2 className="font-display font-semibold text-lg mb-4">Shipping Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required
              className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-light text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple" />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (10 digits)" required maxLength={10} pattern="[6-9][0-9]{9}"
              className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-light text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple" />
          </div>
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email (optional)" type="email"
            className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-light text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple" />
          <textarea name="address" value={form.address} onChange={handleChange} placeholder="Full Address" required rows={3}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-light text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple resize-none" />
          <div className="grid grid-cols-3 gap-4">
            <input name="city" value={form.city} onChange={handleChange} placeholder="City" required
              className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-light text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple" />
            <input name="state" value={form.state} onChange={handleChange} placeholder="State" required
              className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-light text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple" />
            <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" required maxLength={6} pattern="[0-9]{6}"
              className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-light text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple" />
          </div>
          <button type="submit" className="btn-primary w-full text-lg">
            Continue to Payment
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-lg mb-4">Payment</h2>
          <div className="card p-4 mb-4">
            <p className="text-sm text-gray-400">Delivering to:</p>
            <p className="font-medium">{form.name}</p>
            <p className="text-sm text-gray-300">{form.address}, {form.city}, {form.state} - {form.pincode}</p>
            <button onClick={() => setStep('details')} className="text-brand-purple text-sm mt-2 hover:underline">Edit</button>
          </div>
          <RazorpayCheckout
            amount={total}
            customerName={form.name}
            customerPhone={form.phone}
            customerEmail={form.email}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={() => alert('Payment failed. Please try again.')}
          />
        </div>
      )}
    </div>
  )
}
