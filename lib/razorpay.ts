export interface RazorpayOptions {
  orderId: string
  amount: number
  customerName: string
  customerEmail?: string
  customerPhone: string
  onSuccess: (response: RazorpayResponse) => void
  onError: (error: any) => void
}

export interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

/**
 * Mock-payment mode — for local end-to-end testing without real Razorpay keys.
 *
 * Enabled ONLY when BOTH are true:
 *   1. NEXT_PUBLIC_MOCK_PAYMENT === 'true'  (opt-in flag)
 *   2. NODE_ENV !== 'production'             (hard safety gate)
 *
 * `next dev` runs with NODE_ENV='development', so mock mode works locally.
 * Every Vercel build (preview AND production) compiles with
 * NODE_ENV='production', so mock mode can NEVER activate in a deployed build —
 * even if the flag is set in the dashboard by mistake. Real payments stay real.
 *
 * NEXT_PUBLIC_ vars are inlined at build time, so this resolves to a constant
 * `false` in production bundles and the mock branch is dead-code-eliminated.
 */
export const isMockPaymentEnabled =
  process.env.NEXT_PUBLIC_MOCK_PAYMENT === 'true' &&
  process.env.NODE_ENV !== 'production'

/**
 * Fabricate a synthetic Razorpay success payload for mock mode.
 *
 * The values are clearly prefixed `mock_` so they're obvious in the DB
 * (orders.payment_id, payment_logs.razorpay_payment_id) and can be filtered
 * out later. This response flows through /api/orders exactly like a real one:
 * the route only needs `razorpay_payment_id` to be present to mark the order
 * paid and write a payment_logs row — it does NOT re-verify the HMAC signature
 * (that happens in /api/payment/verify, which mock mode skips).
 */
export function createMockRazorpayResponse(): RazorpayResponse {
  const stamp = Date.now()
  return {
    razorpay_order_id: `mock_order_${stamp}`,
    razorpay_payment_id: `mock_pay_${stamp}`,
    razorpay_signature: 'mock_signature_e2e_testing',
  }
}

export function openRazorpayCheckout(options: RazorpayOptions) {
  const rzp = new (window as any).Razorpay({
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: options.amount,
    currency: 'INR',
    name: 'Tathastu Keepsakes',
    description: '3D Printed Goods',
    order_id: options.orderId,
    prefill: {
      name: options.customerName,
      email: options.customerEmail || '',
      contact: options.customerPhone,
    },
    theme: {
      color: '#7C3AED',
    },
    handler: options.onSuccess,
  })

  rzp.on('payment.failed', options.onError)
  rzp.open()
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if ((window as any).Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}
